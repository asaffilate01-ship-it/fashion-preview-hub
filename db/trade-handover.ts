import { ensureCommerceSchema } from "./bootstrap";
import { publicTradeQuoteLines } from "@/lib/trade-review";
import type { TradePriceLine } from "@/lib/commercial-quote";
import {
  HandoverError, parseHandoverCreate, parseHandoverUpdate, validateHandoverTransition,
  type AcceptedQuote, type CommercialSnapshot, type HandoverRecord, type HandoverEvent,
  type HandoverStatus,
} from "@/lib/trade-handover";

async function database() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new HandoverError("Trade handover database is unavailable.", "unavailable");
  await ensureCommerceSchema(env.DB);
  return env.DB;
}

function validPriceSnapshot(row: SourcePrice): CommercialSnapshot {
  let lines: TradePriceLine[];
  try { lines = JSON.parse(row.linesJson) as TradePriceLine[]; }
  catch { throw new HandoverError("The source quotation cannot be read.", "unavailable"); }
  if (!Array.isArray(lines) || lines.length < 1 || !lines.every((line) =>
    typeof line.description === "string" && Number.isSafeInteger(line.quantity) &&
    Number.isSafeInteger(line.unitPricePence) && Number.isSafeInteger(line.unitCostPence))) {
    throw new HandoverError("The source quote lines are invalid.", "unavailable");
  }
  // Only prices, quantities and customer-facing amounts survive this projection.
  // Supplier unit costs, gross margin, internal notes and approval tokens are omitted.
  return {
    priceReference: row.reference,
    priceRevision: row.revision,
    currency: "GBP",
    lines: publicTradeQuoteLines(lines),
    subtotalPence: row.subtotalPence,
    discountPence: row.discountPence,
    shippingPence: row.shippingPence,
    taxPence: row.taxPence,
    totalPence: row.totalPence,
    validUntil: row.validUntil,
  };
}

type SourcePrice = {
  quoteId: string;
  reviewId: string;
  customerEmail: string;
  priceId: string;
  reference: string;
  revision: number;
  linesJson: string;
  subtotalPence: number;
  discountPence: number;
  shippingPence: number;
  taxPence: number;
  totalPence: number;
  validUntil: string;
};

const acceptedPriceQuery = [
  "SELECT p.quote_question_id AS quoteId, r.id AS reviewId,",
  "q.customer_email AS customerEmail, p.id AS priceId, p.reference, p.revision,",
  "p.lines_json AS linesJson, p.subtotal_pence AS subtotalPence,",
  "p.discount_pence AS discountPence, p.shipping_pence AS shippingPence,",
  "p.tax_pence AS taxPence, p.total_pence AS totalPence, p.valid_until AS validUntil",
  "FROM commerce_trade_price_reviews r JOIN commerce_trade_prices p ON p.id = r.price_id",
  "JOIN commerce_questions q ON q.id = p.quote_question_id",
  "WHERE r.id = ? AND r.status = 'accepted' AND p.status = 'review_ready'",
  "AND p.valid_until >= ?",
  "AND p.revision = (SELECT MAX(revision) FROM commerce_trade_prices WHERE quote_question_id = p.quote_question_id)",
].join(" ");

function normalize(row: Record<string, unknown>): HandoverRecord {
  let snapshot: CommercialSnapshot;
  try { snapshot = JSON.parse(String(row.snapshotJson)) as CommercialSnapshot; }
  catch { throw new HandoverError("A handover snapshot could not be loaded.", "unavailable"); }
  return {
    id: String(row.id),
    reference: String(row.reference),
    quoteQuestionId: String(row.quoteQuestionId),
    sourcePriceId: String(row.sourcePriceId),
    sourceReviewId: String(row.sourceReviewId),
    customerEmail: String(row.customerEmail),
    buyerLegalName: String(row.buyerLegalName),
    billingAddress: String(row.billingAddress),
    deliveryAddress: String(row.deliveryAddress),
    billingCountry: String(row.billingCountry),
    purchaseOrderReference: String(row.purchaseOrderReference),
    depositBps: Number(row.depositBps) as HandoverRecord["depositBps"],
    notes: String(row.notes),
    snapshot,
    status: String(row.status) as HandoverStatus,
    version: Number(row.version),
    buyerDetailsReviewed: Boolean(row.buyerDetailsReviewed),
    vatTreatmentReviewed: Boolean(row.vatTreatmentReviewed),
    paymentTermsReviewed: Boolean(row.paymentTermsReviewed),
    specificationReviewed: Boolean(row.specificationReviewed),
    quoteStillCurrent: Boolean(row.quoteStillCurrent),
    latestProofApproved: Boolean(row.latestProofApproved),
    proofRequired: Boolean(row.proofRequired),
    createdBy: String(row.createdBy),
    updatedBy: String(row.updatedBy),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

const selects = [
  "h.id, h.reference, h.quote_question_id AS quoteQuestionId,",
  "h.source_price_id AS sourcePriceId, h.source_review_id AS sourceReviewId,",
  "h.buyer_email AS customerEmail, h.buyer_legal_name AS buyerLegalName,",
  "h.billing_address AS billingAddress, h.delivery_address AS deliveryAddress,",
  "h.billing_country AS billingCountry, h.purchase_order_reference AS purchaseOrderReference,",
  "h.deposit_bps AS depositBps, h.notes, h.snapshot_json AS snapshotJson,",
  "h.status, h.version, h.buyer_details_reviewed AS buyerDetailsReviewed,",
  "h.vat_treatment_reviewed AS vatTreatmentReviewed, h.payment_terms_reviewed AS paymentTermsReviewed,",
  "h.specification_reviewed AS specificationReviewed, h.created_by AS createdBy,",
  "h.updated_by AS updatedBy, h.created_at AS createdAt, h.updated_at AS updatedAt,",
  "CASE WHEN r.status = 'accepted' AND p.status = 'review_ready'",
  "AND p.valid_until >= ? AND p.revision = (SELECT MAX(revision) FROM commerce_trade_prices",
  "WHERE quote_question_id = h.quote_question_id) THEN 1 ELSE 0 END AS quoteStillCurrent,",
  "CASE WHEN EXISTS (SELECT 1 FROM commerce_pro_proofs proof WHERE",
  "proof.quote_question_id = h.quote_question_id AND proof.status = 'customer_approved'",
  "AND proof.version = (SELECT MAX(version) FROM commerce_pro_proofs",
  "WHERE quote_question_id = h.quote_question_id)) THEN 1 ELSE 0 END AS latestProofApproved,",
  "CASE WHEN q.subject LIKE '[PRO QUOTE] Team & Pro%' THEN 1 ELSE 0 END AS proofRequired",
].join(" ");

async function getOne(db: D1Database, id: string): Promise<HandoverRecord | null> {
  const row = await db.prepare(
    "SELECT " + selects + " FROM commerce_trade_handovers h" +
    " JOIN commerce_trade_prices p ON p.id = h.source_price_id" +
    " JOIN commerce_trade_price_reviews r ON r.id = h.source_review_id" +
    " JOIN commerce_questions q ON q.id = h.quote_question_id WHERE h.id = ?"
  ).bind(new Date().toISOString().slice(0, 10), id).first<Record<string, unknown>>();
  return row ? normalize(row) : null;
}

export async function listTradeHandovers() {
  const db = await database();
  const now = new Date().toISOString().slice(0, 10);
  const [handovers, events, accepted] = await Promise.all([
    db.prepare("SELECT " + selects +
      " FROM commerce_trade_handovers h" +
      " JOIN commerce_trade_prices p ON p.id = h.source_price_id" +
      " JOIN commerce_trade_price_reviews r ON r.id = h.source_review_id" +
      " JOIN commerce_questions q ON q.id = h.quote_question_id" +
      " ORDER BY h.updated_at DESC LIMIT 100").bind(now).all<Record<string, unknown>>(),
    db.prepare("SELECT id, handover_id AS handoverId, action, actor, detail, created_at AS createdAt" +
      " FROM commerce_trade_handover_events ORDER BY created_at DESC LIMIT 350").all<HandoverEvent>(),
    db.prepare("SELECT r.id AS reviewId, p.quote_question_id AS quoteQuestionId," +
      " q.customer_name AS customerName, q.customer_email AS customerEmail," +
      " p.reference AS priceReference, p.revision, p.total_pence AS totalPence, p.valid_until AS validUntil" +
      " FROM commerce_trade_price_reviews r JOIN commerce_trade_prices p ON p.id = r.price_id" +
      " JOIN commerce_questions q ON q.id = p.quote_question_id" +
      " WHERE r.status = 'accepted' AND p.status = 'review_ready' AND p.valid_until >= ?" +
      " AND p.revision = (SELECT MAX(revision) FROM commerce_trade_prices WHERE quote_question_id = p.quote_question_id)" +
      " AND NOT EXISTS (SELECT 1 FROM commerce_trade_handovers h WHERE h.quote_question_id = p.quote_question_id)" +
      " ORDER BY r.responded_at DESC LIMIT 80").bind(now).all<AcceptedQuote>(),
  ]);
  return {
    handovers: (handovers.results ?? []).map(normalize),
    events: events.results ?? [],
    acceptedQuotes: accepted.results ?? [],
  };
}

export async function createTradeHandover(raw: unknown, actor: string) {
  const { reviewId, fields } = parseHandoverCreate(raw);
  const db = await database();
  const now = new Date().toISOString();
  const source = await db.prepare(acceptedPriceQuery)
    .bind(reviewId, now.slice(0, 10)).first<SourcePrice>();
  if (!source) throw new HandoverError("Select a current, customer-accepted wholesale quote.", "conflict");
  const snapshot = validPriceSnapshot(source);
  if (snapshot.totalPence <= 0) throw new HandoverError("The accepted quote has no payable amount.", "conflict");
  const id = crypto.randomUUID();
  const reference = "KHI-" + now.slice(2, 10).replace(/-/g, "") + "-" + id.slice(0, 8).toUpperCase();
  try {
    const result = await db.batch([
      db.prepare(
        "INSERT INTO commerce_trade_handovers (id, quote_question_id, source_price_id, source_review_id," +
        " reference, buyer_legal_name, buyer_email, billing_address, delivery_address, billing_country," +
        " purchase_order_reference, deposit_bps, notes, snapshot_json, status, created_by, updated_by, created_at, updated_at)" +
        " SELECT ?, p.quote_question_id, p.id, r.id, ?, ?, q.customer_email, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?" +
        " FROM commerce_trade_price_reviews r JOIN commerce_trade_prices p ON p.id = r.price_id" +
        " JOIN commerce_questions q ON q.id = p.quote_question_id" +
        " WHERE r.id = ? AND r.status = 'accepted' AND p.status = 'review_ready' AND p.valid_until >= ?" +
        " AND p.revision = (SELECT MAX(revision) FROM commerce_trade_prices WHERE quote_question_id = p.quote_question_id)" +
        " AND NOT EXISTS (SELECT 1 FROM commerce_trade_handovers existing WHERE existing.quote_question_id = p.quote_question_id)"
      ).bind(id, reference, fields.buyerLegalName, fields.billingAddress, fields.deliveryAddress,
        fields.billingCountry, fields.purchaseOrderReference, fields.depositBps, fields.notes,
        JSON.stringify(snapshot), actor, actor, now, now, reviewId, now.slice(0, 10)),
      db.prepare(
        "INSERT INTO commerce_trade_handover_events (id, handover_id, action, actor, detail, created_at)" +
        " SELECT ?, id, 'created', ?, 'Internal intake only; no invoice or payment request', ?" +
        " FROM commerce_trade_handovers WHERE id = ?"
      ).bind(crypto.randomUUID(), actor, now, id),
    ]);
    if (Number(result[0]?.meta?.changes ?? 0) !== 1 || Number(result[1]?.meta?.changes ?? 0) !== 1) {
      throw new HandoverError("Handover changed or already exists for this enquiry.", "conflict");
    }
    return { id, reference };
  } catch (error) {
    if (error instanceof HandoverError) throw error;
    throw new HandoverError("A handover already exists or the accepted quotation changed.", "conflict");
  }
}

export async function updateTradeHandover(raw: unknown, actor: string) {
  const input = parseHandoverUpdate(raw);
  const db = await database();
  const current = await getOne(db, input.id);
  if (!current) throw new HandoverError("This handover could not be found.", "not_found");
  if (current.version !== input.expectedVersion) {
    throw new HandoverError("This handover was edited elsewhere; refresh before saving.", "conflict");
  }
  validateHandoverTransition(current.status, input, {
    quoteStillCurrent: current.quoteStillCurrent,
    latestProofApproved: current.latestProofApproved,
    proofRequired: current.proofRequired,
    sourceValidUntil: current.snapshot.validUntil,
  }, new Date().toISOString().slice(0, 10));

  const now = new Date().toISOString();
  // Conditional SQL protects against a new quote/proof version landing between
  // the server-side precheck and the actual update.
  const results = await db.batch([
    db.prepare(
      "UPDATE commerce_trade_handovers SET buyer_legal_name = ?, billing_address = ?," +
      " delivery_address = ?, billing_country = ?, purchase_order_reference = ?, deposit_bps = ?," +
      " notes = ?, status = ?, buyer_details_reviewed = ?, vat_treatment_reviewed = ?," +
      " payment_terms_reviewed = ?, specification_reviewed = ?, version = version + 1," +
      " updated_by = ?, updated_at = ? WHERE id = ? AND status = ? AND version = ?" +
      " AND (? <> 'ready_for_invoice_review' OR (" +
      " EXISTS (SELECT 1 FROM commerce_trade_price_reviews r JOIN commerce_trade_prices p ON p.id = r.price_id" +
      " WHERE r.id = commerce_trade_handovers.source_review_id AND r.status = 'accepted'" +
      " AND p.status = 'review_ready' AND p.valid_until >= ?" +
      " AND p.revision = (SELECT MAX(revision) FROM commerce_trade_prices WHERE quote_question_id = p.quote_question_id))" +
      " AND (NOT EXISTS (SELECT 1 FROM commerce_questions q WHERE q.id = commerce_trade_handovers.quote_question_id" +
      " AND q.subject LIKE '[PRO QUOTE] Team & Pro%')" +
      " OR EXISTS (SELECT 1 FROM commerce_pro_proofs pf WHERE pf.quote_question_id = commerce_trade_handovers.quote_question_id" +
      " AND pf.status = 'customer_approved' AND pf.version = (SELECT MAX(version) FROM commerce_pro_proofs" +
      " WHERE quote_question_id = commerce_trade_handovers.quote_question_id)))))"
    ).bind(input.fields.buyerLegalName, input.fields.billingAddress, input.fields.deliveryAddress,
      input.fields.billingCountry, input.fields.purchaseOrderReference, input.fields.depositBps,
      input.fields.notes, input.nextStatus,
      input.checks.buyerDetailsReviewed ? 1 : 0, input.checks.vatTreatmentReviewed ? 1 : 0,
      input.checks.paymentTermsReviewed ? 1 : 0, input.checks.specificationReviewed ? 1 : 0,
      actor, now, input.id, current.status, current.version, input.nextStatus, now.slice(0, 10)),
    db.prepare(
      "INSERT INTO commerce_trade_handover_events (id, handover_id, action, actor, detail, created_at)" +
      " SELECT ?, id, ?, ?, ?, ? FROM commerce_trade_handovers WHERE id = ? AND version = ?"
    ).bind(crypto.randomUUID(), input.nextStatus === current.status ? "updated" : "stage_changed",
      actor, current.status + " -> " + input.nextStatus + "; tax, buyer and terms review status recorded",
      now, input.id, input.expectedVersion + 1),
  ]);
  if (Number(results[0]?.meta?.changes ?? 0) !== 1 || Number(results[1]?.meta?.changes ?? 0) !== 1) {
    throw new HandoverError("The accepted quote or artwork changed. Refresh the handover.", "conflict");
  }
  return { id: input.id, version: input.expectedVersion + 1, status: input.nextStatus };
}

/**
 * Fetch a single accepted-quotation handover for a server-only, admin-gated
 * worksheet. This read path contains no internal cost or margin fields.
 */
export async function getTradeHandoverForWorksheet(id: string): Promise<HandoverRecord | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const db = await database();
  return getOne(db, id);
}
