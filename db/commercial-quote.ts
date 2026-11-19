import { ensureCommerceSchema } from "./bootstrap";
import {
  canMarkQuoteReady, calculateTradePrice, CommercialPricingError, parseTradePrice,
  type StoredTradePrice, type TradePriceEvent, type TradePriceInput, type TradePriceLine,
} from "@/lib/commercial-quote";

async function database() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new CommercialPricingError("Trade pricing database is unavailable.", "unavailable");
  await ensureCommerceSchema(env.DB);
  return env.DB;
}

function normalizePrice(row: Record<string, unknown>): StoredTradePrice {
  return {
    id: String(row.id),
    quoteQuestionId: String(row.quoteQuestionId),
    customerName: String(row.customerName ?? ""),
    customerEmail: String(row.customerEmail ?? ""),
    reference: String(row.reference),
    revision: Number(row.revision),
    status: String(row.status) as StoredTradePrice["status"],
    lines: JSON.parse(String(row.linesJson)) as TradePriceLine[],
    shippingPence: Number(row.shippingPence),
    discountBps: Number(row.discountBps),
    taxRateBps: Number(row.taxRateBps) as 0 | 2000,
    subtotalPence: Number(row.subtotalPence),
    discountPence: Number(row.discountPence),
    taxPence: Number(row.taxPence),
    totalPence: Number(row.totalPence),
    costPence: Number(row.costPence),
    estimatedMarginPence: Number(row.subtotalPence) - Number(row.discountPence) - Number(row.costPence),
    validUntil: String(row.validUntil),
    notes: String(row.notes ?? ""),
    costReviewed: Boolean(row.costReviewed),
    taxReviewed: Boolean(row.taxReviewed),
    createdBy: String(row.createdBy),
    updatedAt: String(row.updatedAt),
    createdAt: String(row.createdAt),
  };
}

const selectPrices = [
  "p.id, p.quote_question_id AS quoteQuestionId, q.customer_name AS customerName, q.customer_email AS customerEmail,",
  "p.reference, p.revision, p.status, p.lines_json AS linesJson,",
  "p.shipping_pence AS shippingPence, p.discount_bps AS discountBps, p.tax_rate_bps AS taxRateBps,",
  "p.subtotal_pence AS subtotalPence, p.discount_pence AS discountPence, p.tax_pence AS taxPence,",
  "p.total_pence AS totalPence, p.cost_pence AS costPence, p.valid_until AS validUntil, p.notes,",
  "p.cost_reviewed AS costReviewed, p.tax_reviewed AS taxReviewed,",
  "p.created_by AS createdBy, p.updated_at AS updatedAt, p.created_at AS createdAt",
].join(" ");

export async function listTradePrices() {
  const db = await database();
  const [items, audit] = await Promise.all([
    db.prepare("SELECT " + selectPrices +
      " FROM commerce_trade_prices p JOIN commerce_questions q ON q.id = p.quote_question_id" +
      " ORDER BY p.created_at DESC LIMIT 100").all<Record<string, unknown>>(),
    db.prepare("SELECT id, price_id AS priceId, action, actor, detail, created_at AS createdAt" +
      " FROM commerce_trade_price_events ORDER BY created_at DESC LIMIT 250").all<TradePriceEvent>(),
  ]);
  return {
    prices: (items.results ?? []).map(normalizePrice),
    events: audit.results ?? [],
  };
}

export async function createTradePrice(raw: unknown, actor: string) {
  const input = parseTradePrice(raw);
  const total = calculateTradePrice(input);
  const db = await database();
  const question = await db.prepare("SELECT id, subject FROM commerce_questions WHERE id = ?")
    .bind(input.quoteQuestionId).first<{ id: string; subject: string }>();
  if (!question || !question.subject.startsWith("[PRO QUOTE]")) {
    throw new CommercialPricingError("Choose a valid professional enquiry.", "not_found");
  }
  const revisionRow = await db.prepare("SELECT COALESCE(MAX(revision), 0) AS revision" +
    " FROM commerce_trade_prices WHERE quote_question_id = ?").bind(input.quoteQuestionId)
    .first<{ revision: number }>();
  const revision = Number(revisionRow?.revision ?? 0) + 1;
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const reference = "KQ-" + now.slice(2, 10).replace(/-/g, "") + "-" + id.slice(0, 8).toUpperCase() + "-R" + revision;

  try {
    const results = await db.batch([
      db.prepare("UPDATE commerce_trade_prices SET status = 'superseded', updated_at = ?" +
        " WHERE quote_question_id = ? AND status = 'review_ready'")
        .bind(now, input.quoteQuestionId),
      db.prepare(
        "INSERT INTO commerce_trade_prices (id, quote_question_id, reference, revision, status, lines_json, shipping_pence," +
        " discount_bps, tax_rate_bps, subtotal_pence, discount_pence, tax_pence, total_pence, cost_pence," +
        " valid_until, notes, cost_reviewed, tax_reviewed, created_by, created_at, updated_at)" +
        " VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(id, input.quoteQuestionId, reference, revision, JSON.stringify(input.lines),
        input.shippingPence, input.discountBps, input.taxRateBps, total.subtotalPence,
        total.discountPence, total.taxPence, total.totalPence, total.costPence,
        input.validUntil, input.notes, input.costReviewed ? 1 : 0, input.taxReviewed ? 1 : 0,
        actor, now, now),
      db.prepare("INSERT INTO commerce_trade_price_events (id, price_id, action, actor, detail, created_at)" +
        " VALUES (?, ?, 'created', ?, ?, ?)")
        .bind(crypto.randomUUID(), id, actor, "Internal cost estimate created; no customer acceptance or invoice", now),
      db.prepare("UPDATE commerce_trade_price_reviews SET status = 'superseded'," +
        " token_hash = NULL, token_expires_at = NULL, updated_at = ?" +
        " WHERE price_id IN (SELECT p.id FROM commerce_trade_prices p" +
        " WHERE p.quote_question_id = ? AND p.id <> ? AND p.status = 'superseded')" +
        " AND status = 'issued'").bind(now, input.quoteQuestionId, id),
    ]);
    if (Number(results[1]?.meta?.changes ?? 0) !== 1 || Number(results[2]?.meta?.changes ?? 0) !== 1) {
      throw new CommercialPricingError("Could not create the internal pricing revision.", "conflict");
    }
    return { id, reference, revision };
  } catch (error) {
    if (error instanceof CommercialPricingError) throw error;
    throw new CommercialPricingError("Pricing changed while saving. Refresh and try again.", "conflict");
  }
}

export async function markTradePriceReady(id: string, actor: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) {
    throw new CommercialPricingError("Invalid quotation selection.");
  }
  const db = await database();
  const record = await db.prepare("SELECT id, quote_question_id AS quoteQuestionId, revision, status," +
    " lines_json AS linesJson, shipping_pence AS shippingPence, discount_bps AS discountBps," +
    " tax_rate_bps AS taxRateBps, valid_until AS validUntil, notes, cost_reviewed AS costReviewed," +
    " tax_reviewed AS taxReviewed FROM commerce_trade_prices WHERE id = ?")
    .bind(id).first<Record<string, unknown>>();
  if (!record || record.status !== "draft") {
    throw new CommercialPricingError("Only internal pricing drafts can be marked ready.", "conflict");
  }
  const latest = await db.prepare("SELECT MAX(revision) AS revision FROM commerce_trade_prices" +
    " WHERE quote_question_id = ?").bind(record.quoteQuestionId).first<{ revision: number }>();
  if (Number(latest?.revision) !== Number(record.revision)) {
    throw new CommercialPricingError("A newer quotation revision exists.", "conflict");
  }
  const input: TradePriceInput = parseTradePrice({
    quoteQuestionId: record.quoteQuestionId,
    lines: JSON.parse(String(record.linesJson)),
    shippingPence: Number(record.shippingPence),
    discountBps: Number(record.discountBps),
    taxRateBps: Number(record.taxRateBps),
    validUntil: String(record.validUntil),
    notes: String(record.notes),
    costReviewed: Boolean(record.costReviewed),
    taxReviewed: Boolean(record.taxReviewed),
  });
  canMarkQuoteReady(input, new Date().toISOString().slice(0, 10));

  const now = new Date().toISOString();
  const results = await db.batch([
    db.prepare("UPDATE commerce_trade_prices SET status = 'review_ready', updated_at = ?" +
      " WHERE id = ? AND status = 'draft' AND revision = ?" +
      " AND NOT EXISTS (SELECT 1 FROM commerce_trade_prices newer" +
      " WHERE newer.quote_question_id = commerce_trade_prices.quote_question_id AND newer.revision > ?)")
      .bind(now, id, record.revision, record.revision),
    db.prepare("INSERT INTO commerce_trade_price_events (id, price_id, action, actor, detail, created_at)" +
      " SELECT ?, id, 'review_ready', ?, ?, ? FROM commerce_trade_prices" +
      " WHERE id = ? AND status = 'review_ready' AND updated_at = ?")
      .bind(crypto.randomUUID(), actor,
        "Internal costing and tax checks reviewed; not issued or accepted by customer", now, id, now),
  ]);
  if (Number(results[0]?.meta?.changes ?? 0) !== 1 || Number(results[1]?.meta?.changes ?? 0) !== 1) {
    throw new CommercialPricingError("Quote changed during review. Refresh the register.", "conflict");
  }
  return { id, status: "review_ready" as const };
}
