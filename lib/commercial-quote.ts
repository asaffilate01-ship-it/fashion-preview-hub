// Internal trade pricing only: estimates are not invoices, accepted orders, or payment requests.
export const MAX_QUOTE_LINES = 12;
export const MAX_QUOTE_SUBTOTAL_PENCE = 100_000_000;
export const QUOTE_TAX_RATES_BPS = [0, 2000] as const;
export type CommercialQuoteStatus = "draft" | "review_ready" | "superseded";

export type TradePriceLine = {
  description: string;
  quantity: number;
  unitPricePence: number;
  unitCostPence: number;
};

export type TradePriceInput = {
  quoteQuestionId: string;
  lines: TradePriceLine[];
  shippingPence: number;
  discountBps: number;
  taxRateBps: 0 | 2000;
  validUntil: string;
  notes: string;
  costReviewed: boolean;
  taxReviewed: boolean;
};

export type TradePriceTotals = {
  subtotalPence: number;
  discountPence: number;
  shippingPence: number;
  taxPence: number;
  totalPence: number;
  costPence: number;
  estimatedMarginPence: number;
};

export type StoredTradePrice = TradePriceInput & TradePriceTotals & {
  id: string;
  reference: string;
  revision: number;
  status: CommercialQuoteStatus;
  customerName: string;
  customerEmail: string;
  createdBy: string;
  updatedAt: string;
  createdAt: string;
};

export type TradePriceEvent = {
  id: string;
  priceId: string;
  action: string;
  actor: string;
  detail: string;
  createdAt: string;
};

export class CommercialPricingError extends Error {
  constructor(message: string, readonly code: "invalid" | "not_found" | "conflict" | "unavailable" = "invalid") {
    super(message);
    this.name = "CommercialPricingError";
  }
}

function integerInRange(input: unknown, minimum: number, maximum: number, name: string) {
  if (typeof input !== "number" || !Number.isSafeInteger(input) || input < minimum || input > maximum) {
    throw new CommercialPricingError(name + " must be a valid whole number.");
  }
  return input;
}

function trimmed(input: unknown, maximum: number, name: string, minimum = 0) {
  if (typeof input !== "string" || input.length > maximum * 2) {
    throw new CommercialPricingError(name + " is invalid.");
  }
  const value = input.trim();
  if (value.length < minimum || value.length > maximum || /[\u0000-\u0008\u000b-\u001f\u007f]/.test(value)) {
    throw new CommercialPricingError(name + " is invalid.");
  }
  return value;
}

function dateOnly(input: unknown): string {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    throw new CommercialPricingError("Select a valid quotation expiry date.");
  }
  const date = new Date(input + "T00:00:00Z");
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== input) {
    throw new CommercialPricingError("Quotation expiry date is invalid.");
  }
  return input;
}

export function parseTradePrice(input: unknown): TradePriceInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new CommercialPricingError("Invalid quotation details.");
  }
  const body = input as Record<string, unknown>;
  const quoteQuestionId = trimmed(body.quoteQuestionId, 100, "Enquiry ID", 4);
  if (!Array.isArray(body.lines) || body.lines.length < 1 || body.lines.length > MAX_QUOTE_LINES) {
    throw new CommercialPricingError("Enter between one and twelve price lines.");
  }
  let totalUnits = 0;
  const lines = body.lines.map((value, index): TradePriceLine => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new CommercialPricingError("Invalid price line " + (index + 1) + ".");
    }
    const item = value as Record<string, unknown>;
    const description = trimmed(item.description, 160, "Line description " + (index + 1), 3);
    const quantity = integerInRange(item.quantity, 1, 10_000, "Quantity");
    totalUnits += quantity;
    if (totalUnits > 10_000) throw new CommercialPricingError("Quotation cannot exceed 10,000 total units.");
    const unitPricePence = integerInRange(item.unitPricePence, 0, 10_000_000, "Unit selling price");
    const unitCostPence = integerInRange(item.unitCostPence, 0, 10_000_000, "Unit cost");
    return { description, quantity, unitPricePence, unitCostPence };
  });

  const shippingPence = integerInRange(body.shippingPence, 0, 5_000_000, "Shipping");
  const discountBps = integerInRange(body.discountBps, 0, 10_000, "Discount rate");
  const taxRateBps = body.taxRateBps;
  if (taxRateBps !== 0 && taxRateBps !== 2000) {
    throw new CommercialPricingError("Choose a supported indicative VAT rate.");
  }
  const validUntil = dateOnly(body.validUntil);
  const notes = trimmed(body.notes, 1200, "Pricing notes");
  if (typeof body.costReviewed !== "boolean" || typeof body.taxReviewed !== "boolean") {
    throw new CommercialPricingError("Record explicit cost and tax review choices.");
  }
  const parsed: TradePriceInput = {
    quoteQuestionId,
    lines,
    shippingPence,
    discountBps,
    taxRateBps,
    validUntil,
    notes,
    costReviewed: body.costReviewed,
    taxReviewed: body.taxReviewed,
  };
  calculateTradePrice(parsed);
  return parsed;
}

export function calculateTradePrice(input: TradePriceInput): TradePriceTotals {
  const subtotalPence = input.lines.reduce((sum, item) => sum + item.quantity * item.unitPricePence, 0);
  if (subtotalPence > MAX_QUOTE_SUBTOTAL_PENCE) {
    throw new CommercialPricingError("Quote value exceeds the maximum internal quotation amount.");
  }
  const costPence = input.lines.reduce((sum, item) => sum + item.quantity * item.unitCostPence, 0);
  const discountPence = Math.round(subtotalPence * input.discountBps / 10_000);
  // Shipping and any selected tax treatment are provisional until reviewed by the business.
  const taxablePence = subtotalPence - discountPence + input.shippingPence;
  const taxPence = Math.round(taxablePence * input.taxRateBps / 10_000);
  const totalPence = taxablePence + taxPence;
  if (!Number.isSafeInteger(totalPence)) throw new CommercialPricingError("Quotation amount is too large.");
  const estimatedMarginPence = subtotalPence - discountPence - costPence;
  return {
    subtotalPence, discountPence,
    shippingPence: input.shippingPence,
    taxPence, totalPence, costPence, estimatedMarginPence,
  };
}

export function canMarkQuoteReady(input: TradePriceInput, today: string) {
  const totals = calculateTradePrice(input);
  if (!input.costReviewed || !input.taxReviewed) {
    throw new CommercialPricingError("Review both costing and tax treatment before marking ready.");
  }
  if (input.validUntil < today) throw new CommercialPricingError("Quotation expiry date has passed.");
  if (totals.totalPence <= 0) throw new CommercialPricingError("A zero-value quote cannot be marked ready.");
  return true;
}

// A 'review_ready' price is still an INTERNAL, unissued estimate.
// No customer acceptance, VAT invoice, payment, or factory approval occurs here.
