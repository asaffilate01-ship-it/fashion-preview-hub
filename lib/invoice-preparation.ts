import type { HandoverRecord, CommercialSnapshot } from "./trade-handover";

// Internal draft preview only. Never emit a numbered tax invoice, demand for
// payment, or confirmation that Stripe/bank funds have been received.
export type SellerIdentity = {
  legalName: string;
  registeredAddress: string;
  country: string;
  companyNumber: string;
  vatNumber: string;
};

export type InternalInvoiceWorksheet = {
  label: "INTERNAL INVOICE-PREPARATION WORKSHEET";
  warning: string;
  reference: string;
  sourceQuoteReference: string;
  sourceQuoteRevision: number;
  seller: SellerIdentity;
  buyer: {
    legalName: string;
    email: string;
    billingAddress: string;
    billingCountry: string;
    deliveryAddress: string;
    purchaseOrderReference: string;
  };
  currency: "GBP";
  lines: CommercialSnapshot["lines"];
  subtotalPence: number;
  discountPence: number;
  shippingPence: number;
  estimatedVatPence: number;
  estimatedTotalPence: number;
  illustrativeDepositPence: number;
  illustrativeBalancePence: number;
  validUntil: string;
  preparedFromHandoverVersion: number;
};

export class InvoicePreparationError extends Error {
  constructor(message: string, readonly code: "invalid" | "blocked" | "not_found" | "unavailable" = "blocked") {
    super(message);
    this.name = "InvoicePreparationError";
  }
}

function validBusinessValue(value: unknown, label: string, max: number, min: number): string {
  if (typeof value !== "string" || value.trim().length < min || value.length > max ||
      /[\u0000-\u0008\u000b-\u001f\u007f]/.test(value) ||
      /(?:^|\b)(?:to be confirmed|tbc|placeholder|your company name|example business)(?:\b|$)/i.test(value)) {
    throw new InvoicePreparationError("Configure the verified " + label + " before document preparation.", "unavailable");
  }
  return value.trim();
}

export function parseVerifiedSeller(settings: Record<string, string | undefined>, vatEstimatePence: number): SellerIdentity {
  if (settings.KALETHON_SELLER_DETAILS_VERIFIED !== "true") {
    throw new InvoicePreparationError("Seller identity has not been verified in the secure hosting configuration.", "unavailable");
  }
  const legalName = validBusinessValue(settings.KALETHON_SELLER_LEGAL_NAME, "seller legal name", 160, 2);
  const registeredAddress = validBusinessValue(settings.KALETHON_SELLER_ADDRESS, "registered/trading address", 500, 15);
  const country = validBusinessValue(settings.KALETHON_SELLER_COUNTRY, "seller country", 80, 2);
  const companyNumber = settings.KALETHON_SELLER_COMPANY_NUMBER?.trim() ?? "";
  const vatNumber = settings.KALETHON_SELLER_VAT_NUMBER?.trim().toUpperCase() ?? "";
  if (companyNumber.length > 50 || /[\u0000-\u001f\u007f]/.test(companyNumber)) {
    throw new InvoicePreparationError("Seller company number needs verification.", "unavailable");
  }
  if (vatNumber.length > 40 || /[^A-Z0-9 ]/.test(vatNumber)) {
    throw new InvoicePreparationError("Seller VAT identifier is invalid.", "unavailable");
  }
  if (vatEstimatePence > 0 && vatNumber.length < 5) {
    throw new InvoicePreparationError("A seller VAT identifier is required to prepare a worksheet showing VAT.", "unavailable");
  }
  return { legalName, registeredAddress, country, companyNumber, vatNumber };
}

function checkedNonnegativeMoney(value: number, name: string) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 150_000_000) {
    throw new InvoicePreparationError("Accepted quotation contains an invalid " + name + ".", "invalid");
  }
}

function verifySnapshot(snapshot: CommercialSnapshot) {
  if (snapshot.currency !== "GBP" || !Array.isArray(snapshot.lines) ||
      snapshot.lines.length < 1 || snapshot.lines.length > 12) {
    throw new InvoicePreparationError("Accepted quotation data is incomplete.", "invalid");
  }
  let subtotal = 0;
  for (const line of snapshot.lines) {
    if (typeof line.description !== "string" || line.description.length < 3 ||
        !Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 10_000) {
      throw new InvoicePreparationError("Accepted quotation has an invalid item.", "invalid");
    }
    checkedNonnegativeMoney(line.unitPricePence, "unit price");
    checkedNonnegativeMoney(line.lineTotalPence, "line total");
    if (line.quantity * line.unitPricePence !== line.lineTotalPence) {
      throw new InvoicePreparationError("Accepted quotation line total does not balance.", "invalid");
    }
    subtotal += line.lineTotalPence;
  }
  for (const [name, amount] of [
    ["subtotal", snapshot.subtotalPence],
    ["discount", snapshot.discountPence],
    ["shipping", snapshot.shippingPence],
    ["VAT estimate", snapshot.taxPence],
    ["grand total", snapshot.totalPence],
  ] as const) checkedNonnegativeMoney(amount, name);
  if (subtotal !== snapshot.subtotalPence ||
      snapshot.discountPence > snapshot.subtotalPence ||
      snapshot.totalPence !== snapshot.subtotalPence - snapshot.discountPence +
        snapshot.shippingPence + snapshot.taxPence) {
    throw new InvoicePreparationError("Accepted quotation totals do not reconcile.", "invalid");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.validUntil)) {
    throw new InvoicePreparationError("Accepted quotation expiry is invalid.", "invalid");
  }
}

export function prepareInternalInvoiceWorksheet(
  handover: HandoverRecord,
  seller: SellerIdentity,
  today: string,
): InternalInvoiceWorksheet {
  if (handover.status !== "ready_for_invoice_review" ||
      !handover.quoteStillCurrent ||
      (handover.proofRequired && !handover.latestProofApproved)) {
    throw new InvoicePreparationError("The handover, current quotation or required artwork is not ready.", "blocked");
  }
  if (!handover.buyerDetailsReviewed || !handover.vatTreatmentReviewed ||
      !handover.paymentTermsReviewed || !handover.specificationReviewed) {
    throw new InvoicePreparationError("All buyer, tax, payment terms and specification checks must be reviewed.", "blocked");
  }
  if (!handover.buyerLegalName?.trim() || !handover.billingAddress?.trim() ||
      !handover.billingCountry?.trim() || !handover.customerEmail?.trim()) {
    throw new InvoicePreparationError("Verified buyer and billing details are required.", "blocked");
  }
  verifySnapshot(handover.snapshot);
  if (handover.snapshot.validUntil < today) {
    throw new InvoicePreparationError("The accepted quotation has expired.", "blocked");
  }
  if (![0, 2500, 5000, 10000].includes(handover.depositBps)) {
    throw new InvoicePreparationError("The deposit percentage is invalid.", "invalid");
  }
  if (handover.snapshot.taxPence > 0 && seller.vatNumber.length < 5) {
    throw new InvoicePreparationError("Seller VAT details are missing for the indicated VAT.", "blocked");
  }
  const illustrativeDeposit = Math.round(handover.snapshot.totalPence * handover.depositBps / 10_000);
  return {
    label: "INTERNAL INVOICE-PREPARATION WORKSHEET",
    warning: "NOT A VAT INVOICE · NOT A PAYMENT REQUEST · NOT PROOF OF PAYMENT · NOT A FACTORY ORDER",
    reference: handover.reference + "-PREP",
    sourceQuoteReference: handover.snapshot.priceReference,
    sourceQuoteRevision: handover.snapshot.priceRevision,
    seller,
    buyer: {
      legalName: handover.buyerLegalName,
      email: handover.customerEmail,
      billingAddress: handover.billingAddress,
      billingCountry: handover.billingCountry,
      deliveryAddress: handover.deliveryAddress,
      purchaseOrderReference: handover.purchaseOrderReference,
    },
    currency: "GBP",
    lines: handover.snapshot.lines,
    subtotalPence: handover.snapshot.subtotalPence,
    discountPence: handover.snapshot.discountPence,
    shippingPence: handover.snapshot.shippingPence,
    estimatedVatPence: handover.snapshot.taxPence,
    estimatedTotalPence: handover.snapshot.totalPence,
    illustrativeDepositPence: illustrativeDeposit,
    illustrativeBalancePence: handover.snapshot.totalPence - illustrativeDeposit,
    validUntil: handover.snapshot.validUntil,
    preparedFromHandoverVersion: handover.version,
  };
}
