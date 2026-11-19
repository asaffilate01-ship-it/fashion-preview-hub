import type { TradePriceLine } from "@/lib/commercial-quote";

// These decisions are expressions of commercial intent, not payments, invoices,
// order confirmations or authorisations to send specifications to a factory.
export type TradeReviewStatus = "issued" | "accepted" | "changes_requested" | "superseded";

export type TradeReview = {
  id: string;
  priceId: string;
  status: TradeReviewStatus;
  expiresAt: string | null;
  customerName: string;
  customerNote: string;
  respondedAt: string | null;
  issuedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type TradeReviewEvent = {
  id: string;
  reviewId: string;
  action: string;
  actor: string;
  message: string;
  createdAt: string;
};

export type CustomerTradeQuote = {
  reference: string;
  revision: number;
  customerName: string;
  lines: Array<Pick<TradePriceLine, "description" | "quantity" | "unitPricePence"> & { lineTotalPence: number }>;
  subtotalPence: number;
  discountPence: number;
  shippingPence: number;
  taxPence: number;
  totalPence: number;
  validUntil: string;
  expiresAt: string;
};

// Deliberately no costPence, unitCostPence, margin, supplier or internal notes
// appear in CustomerTradeQuote or the customer-facing JSON response.
export class TradeReviewError extends Error {
  constructor(message: string, readonly code: "invalid" | "conflict" | "unavailable" = "invalid") {
    super(message);
    this.name = "TradeReviewError";
  }
}

export type TradeReviewDecision = {
  token: string;
  decision: "accept" | "changes";
  customerName: string;
  customerEmail: string;
  message: string;
  confirmPrice: boolean;
};

export function parseTradeReviewDecision(input: unknown): TradeReviewDecision {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TradeReviewError("Invalid quotation response.");
  }
  const body = input as Record<string, unknown>;
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const decision = body.decision;
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim().toLowerCase() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!/^[A-Za-z0-9_-]{40,70}$/.test(token)) throw new TradeReviewError("Invalid or expired quotation link.");
  if (decision !== "accept" && decision !== "changes") throw new TradeReviewError("Select a valid response.");
  if (customerName.length < 2 || customerName.length > 100 || /[\u0000-\u001f\u007f]/.test(customerName)) {
    throw new TradeReviewError("Enter your full name.");
  }
  if (customerEmail.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    throw new TradeReviewError("Enter the email address used in your original enquiry.");
  }
  if (message.length > 600 || /[\u0000-\u0008\u000b-\u001f\u007f]/.test(message)) {
    throw new TradeReviewError("Comments must be 600 characters or fewer.");
  }
  if (decision === "accept" && body.confirmPrice !== true) {
    throw new TradeReviewError("Confirm that you have reviewed the listed quotation prices and expiry.");
  }
  if (decision === "changes" && message.length < 10) {
    throw new TradeReviewError("Describe the changes you need in at least ten characters.");
  }
  return { token, decision, customerName, customerEmail, message, confirmPrice: body.confirmPrice === true };
}

export function tradeReviewOrigin(): string {
  let url: URL;
  try { url = new URL(process.env.SITE_URL || "https://kalethon.com"); }
  catch { throw new TradeReviewError("A valid site URL must be configured.", "unavailable"); }
  if (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost")) {
    throw new TradeReviewError("Private quotation links require HTTPS.", "unavailable");
  }
  return url.origin;
}

export function publicTradeQuoteLines(lines: TradePriceLine[]): CustomerTradeQuote["lines"] {
  return lines.map((line) => ({
    description: line.description,
    quantity: line.quantity,
    unitPricePence: line.unitPricePence,
    lineTotalPence: line.quantity * line.unitPricePence,
  }));
}

export function validateTradeReviewExpiry(validUntil: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) throw new TradeReviewError("Quotation expiry is invalid.", "conflict");
  const quoteEnd = new Date(validUntil + "T23:59:59.999Z").getTime();
  if (!Number.isFinite(quoteEnd) || quoteEnd <= Date.now()) {
    throw new TradeReviewError("Quotation validity has expired.", "conflict");
  }
  return new Date(Math.min(quoteEnd, Date.now() + 7 * 86400_000)).toISOString();
}
