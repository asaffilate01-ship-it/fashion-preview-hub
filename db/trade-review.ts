import { ensureCommerceSchema } from "./bootstrap";
import {
  parseTradeReviewDecision, publicTradeQuoteLines, tradeReviewOrigin, validateTradeReviewExpiry,
  TradeReviewError, type CustomerTradeQuote, type TradeReview, type TradeReviewEvent,
} from "@/lib/trade-review";
import type { TradePriceLine } from "@/lib/commercial-quote";

async function database() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new TradeReviewError("Quotation review storage is unavailable.", "unavailable");
  await ensureCommerceSchema(env.DB);
  return env.DB;
}
function isToken(token: string) {
  return /^[A-Za-z0-9_-]{40,70}$/.test(token);
}
async function hashToken(token: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(hash), (value) => value.toString(16).padStart(2, "0")).join("");
}
function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function noTokens<T extends Record<string, unknown>>(value: T): T {
  // All secret fields deliberately omitted by list query; this is a guard
  // against accidentally returning an unfiltered raw database row.
  if ("tokenHash" in value || "tokenExpiresAt" in value || "token_hash" in value) {
    throw new TradeReviewError("Private review fields cannot be returned.", "unavailable");
  }
  return value;
}

export async function listTradeReviews(): Promise<{ reviews: TradeReview[]; reviewEvents: TradeReviewEvent[] }> {
  const db = await database();
  const [reviews, events] = await Promise.all([
    db.prepare("SELECT id, price_id AS priceId, status, token_expires_at AS expiresAt," +
      " customer_name AS customerName, customer_note AS customerNote," +
      " responded_at AS respondedAt, issued_by AS issuedBy, created_at AS createdAt, updated_at AS updatedAt" +
      " FROM commerce_trade_price_reviews ORDER BY created_at DESC LIMIT 150").all<TradeReview>(),
    db.prepare("SELECT id, review_id AS reviewId, action, actor, message, created_at AS createdAt" +
      " FROM commerce_trade_review_events ORDER BY created_at DESC LIMIT 300").all<TradeReviewEvent>(),
  ]);
  return {
    reviews: (reviews.results ?? []).map((record) => noTokens(record as unknown as Record<string, unknown>) as TradeReview),
    reviewEvents: events.results ?? [],
  };
}

export async function issueTradeReview(priceId: string, actor: string) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(priceId)) {
    throw new TradeReviewError("Select a valid price revision.");
  }
  // Validate the origin before mutating the database. Never issue a link that
  // points to a different or insecure host.
  const origin = tradeReviewOrigin();
  const db = await database();
  const price = await db.prepare(
    "SELECT p.id, p.quote_question_id AS quoteId, p.revision, p.status, p.valid_until AS validUntil" +
    " FROM commerce_trade_prices p WHERE p.id = ?"
  ).bind(priceId).first<{ id: string; quoteId: string; revision: number; status: string; validUntil: string }>();
  if (!price || price.status !== "review_ready") {
    throw new TradeReviewError("Only internally reviewed price revisions may be shared.", "conflict");
  }
  const expiresAt = validateTradeReviewExpiry(price.validUntil);
  const token = newToken();
  const hash = await hashToken(token);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  let results: D1Result<unknown>[];
  try {
    results = await db.batch([
      db.prepare(
        "INSERT INTO commerce_trade_price_reviews (id, price_id, token_hash, token_expires_at, status, issued_by, created_at, updated_at)" +
        " SELECT ?, p.id, ?, ?, 'issued', ?, ?, ? FROM commerce_trade_prices p" +
        " WHERE p.id = ? AND p.status = 'review_ready' AND p.valid_until >= ?" +
        " AND p.revision = (SELECT MAX(revision) FROM commerce_trade_prices WHERE quote_question_id = p.quote_question_id)" +
        " AND NOT EXISTS (SELECT 1 FROM commerce_trade_price_reviews r WHERE r.price_id = p.id)"
      ).bind(id, hash, expiresAt, actor, now, now, priceId, now.slice(0, 10)),
      db.prepare(
        "INSERT INTO commerce_trade_review_events (id, review_id, action, actor, message, created_at)" +
        " SELECT ?, id, 'issued', ?, ?, ? FROM commerce_trade_price_reviews WHERE id = ? AND status = 'issued'"
      ).bind(crypto.randomUUID(), actor, "Private price review issued; expires " + expiresAt, now, id),
    ]);
  } catch {
    throw new TradeReviewError("This quotation was already issued, changed or superseded.", "conflict");
  }
  if (Number(results[0]?.meta?.changes ?? 0) !== 1 || Number(results[1]?.meta?.changes ?? 0) !== 1) {
    throw new TradeReviewError("This quotation can no longer be issued.", "conflict");
  }
  // The one-time URL is returned only to the issuing administrator. Never
  // log or persist the plaintext token.
  return { reviewUrl: origin + "/pro/quotation/" + token, expiresAt };
}

type CustomerRow = {
  id: string;
  reference: string;
  revision: number;
  customerName: string;
  linesJson: string;
  subtotalPence: number;
  discountPence: number;
  shippingPence: number;
  taxPence: number;
  totalPence: number;
  validUntil: string;
  expiresAt: string;
};

export async function getCustomerTradeReview(token: string): Promise<CustomerTradeQuote | null> {
  if (!isToken(token)) return null;
  const hash = await hashToken(token);
  const db = await database();
  const now = new Date().toISOString();
  const record = await db.prepare(
    "SELECT p.id, p.reference, p.revision, q.customer_name AS customerName," +
    " p.lines_json AS linesJson, p.subtotal_pence AS subtotalPence, p.discount_pence AS discountPence," +
    " p.shipping_pence AS shippingPence, p.tax_pence AS taxPence, p.total_pence AS totalPence," +
    " p.valid_until AS validUntil, r.token_expires_at AS expiresAt" +
    " FROM commerce_trade_price_reviews r JOIN commerce_trade_prices p ON p.id = r.price_id" +
    " JOIN commerce_questions q ON q.id = p.quote_question_id" +
    " WHERE r.token_hash = ? AND r.status = 'issued' AND r.token_expires_at > ?" +
    " AND p.status = 'review_ready' AND p.valid_until >= ?" +
    " AND p.revision = (SELECT MAX(revision) FROM commerce_trade_prices WHERE quote_question_id = p.quote_question_id)"
  ).bind(hash, now, now.slice(0, 10)).first<CustomerRow>();
  if (!record) return null;
  // The JSON snapshot includes private unit costs, so explicitly project only
  // the public subset. Never return the raw line data or internal notes.
  let lines: TradePriceLine[];
  try { lines = JSON.parse(record.linesJson) as TradePriceLine[]; }
  catch { return null; }
  return {
    reference: record.reference,
    revision: record.revision,
    customerName: record.customerName,
    lines: publicTradeQuoteLines(lines),
    subtotalPence: record.subtotalPence,
    discountPence: record.discountPence,
    shippingPence: record.shippingPence,
    taxPence: record.taxPence,
    totalPence: record.totalPence,
    validUntil: record.validUntil,
    expiresAt: record.expiresAt,
  };
}

export async function recordCustomerTradeReview(raw: unknown) {
  const input = parseTradeReviewDecision(raw);
  const hash = await hashToken(input.token);
  const db = await database();
  const now = new Date().toISOString();
  const review = await db.prepare(
    "SELECT r.id, r.status, r.token_expires_at AS expiresAt," +
    " p.status AS priceStatus, p.valid_until AS validUntil, p.revision," +
    " p.quote_question_id AS quoteId, q.customer_email AS customerEmail" +
    " FROM commerce_trade_price_reviews r JOIN commerce_trade_prices p ON p.id = r.price_id" +
    " JOIN commerce_questions q ON q.id = p.quote_question_id WHERE r.token_hash = ?"
  ).bind(hash).first<{
    id: string; status: string; expiresAt: string | null; priceStatus: string;
    validUntil: string; revision: number; quoteId: string; customerEmail: string;
  }>();
  if (!review || review.status !== "issued" || review.priceStatus !== "review_ready" ||
      !review.expiresAt || review.expiresAt <= now || review.validUntil < now.slice(0, 10)) {
    throw new TradeReviewError("This quotation link has expired or is no longer available.", "conflict");
  }
  const latest = await db.prepare(
    "SELECT MAX(revision) AS latest FROM commerce_trade_prices WHERE quote_question_id = ?"
  ).bind(review.quoteId).first<{ latest: number }>();
  if (Number(latest?.latest) !== review.revision) {
    throw new TradeReviewError("A newer quotation revision is available. Request a fresh link.", "conflict");
  }
  if (input.customerEmail !== review.customerEmail.toLowerCase()) {
    throw new TradeReviewError("The enquiry details do not match this private quotation.");
  }

  const status = input.decision === "accept" ? "accepted" : "changes_requested";
  const now2 = new Date().toISOString();
  const results = await db.batch([
    db.prepare(
      "UPDATE commerce_trade_price_reviews SET status = ?, customer_name = ?, customer_note = ?," +
      " responded_at = ?, token_hash = NULL, token_expires_at = NULL, updated_at = ?" +
      " WHERE id = ? AND token_hash = ? AND status = 'issued' AND token_expires_at > ?" +
      " AND EXISTS (SELECT 1 FROM commerce_trade_prices p WHERE p.id = commerce_trade_price_reviews.price_id" +
      " AND p.status = 'review_ready' AND p.valid_until >= ?" +
      " AND p.revision = (SELECT MAX(revision) FROM commerce_trade_prices WHERE quote_question_id = p.quote_question_id))"
    ).bind(status, input.customerName, input.message, now2, now2, review.id, hash, now2, now2.slice(0, 10)),
    db.prepare(
      "INSERT INTO commerce_trade_review_events (id, review_id, action, actor, message, created_at)" +
      " SELECT ?, id, ?, ?, ?, ? FROM commerce_trade_price_reviews" +
      " WHERE id = ? AND status = ? AND responded_at = ?"
    ).bind(crypto.randomUUID(), status, input.customerEmail, input.message, now2, review.id, status, now2),
  ]);
  if (Number(results[0]?.meta?.changes ?? 0) !== 1 || Number(results[1]?.meta?.changes ?? 0) !== 1) {
    throw new TradeReviewError("This quotation has already been reviewed or changed.", "conflict");
  }
  return { status, recordedAt: now2 };
}
