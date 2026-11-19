// Team & Pro: internal handover paperwork, not an order, invoice, payment or factory dispatch.
export const handoverStatuses = ["draft", "ready_for_invoice_review", "on_hold", "cancelled"] as const;
export type HandoverStatus = (typeof handoverStatuses)[number];
export const depositOptionsBps = [0, 2500, 5000, 10000] as const;
export type DepositBps = (typeof depositOptionsBps)[number];

export type PublicTradeLine = {
  description: string;
  quantity: number;
  unitPricePence: number;
  lineTotalPence: number;
};

export type CommercialSnapshot = {
  priceReference: string;
  priceRevision: number;
  currency: "GBP";
  lines: PublicTradeLine[];
  subtotalPence: number;
  discountPence: number;
  shippingPence: number;
  taxPence: number;
  totalPence: number;
  validUntil: string;
};

export type HandoverFields = {
  buyerLegalName: string;
  billingAddress: string;
  deliveryAddress: string;
  billingCountry: string;
  purchaseOrderReference: string;
  depositBps: DepositBps;
  notes: string;
};

export type HandoverChecks = {
  buyerDetailsReviewed: boolean;
  vatTreatmentReviewed: boolean;
  paymentTermsReviewed: boolean;
  specificationReviewed: boolean;
};

export type HandoverRecord = HandoverFields & HandoverChecks & {
  id: string;
  reference: string;
  quoteQuestionId: string;
  sourcePriceId: string;
  sourceReviewId: string;
  customerEmail: string;
  snapshot: CommercialSnapshot;
  status: HandoverStatus;
  version: number;
  quoteStillCurrent: boolean;
  latestProofApproved: boolean;
  proofRequired: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type HandoverEvent = {
  id: string;
  handoverId: string;
  action: string;
  actor: string;
  detail: string;
  createdAt: string;
};

export type AcceptedQuote = {
  reviewId: string;
  quoteQuestionId: string;
  customerName: string;
  customerEmail: string;
  priceReference: string;
  revision: number;
  totalPence: number;
  validUntil: string;
};

export class HandoverError extends Error {
  constructor(message: string, readonly code: "invalid" | "conflict" | "not_found" | "unavailable" = "invalid") {
    super(message);
    this.name = "HandoverError";
  }
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function uuid(value: unknown, what: string): string {
  if (typeof value !== "string" || !uuidPattern.test(value)) throw new HandoverError("Choose a valid " + what + ".");
  return value;
}
function field(value: unknown, label: string, max: number, min = 0): string {
  if (typeof value !== "string" || value.length > max * 2 ||
      /[\u0000-\u0008\u000b-\u001f\u007f]/.test(value)) throw new HandoverError("Review " + label + ".");
  const text = value.trim();
  if (text.length < min || text.length > max) throw new HandoverError(label + " must be " + min + "–" + max + " characters.");
  return text;
}
function choice(value: unknown): DepositBps {
  if (!depositOptionsBps.includes(value as DepositBps)) {
    throw new HandoverError("Select a permitted illustrative deposit percentage.");
  }
  return value as DepositBps;
}

export function parseHandoverFields(value: unknown): HandoverFields {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new HandoverError("Invalid buyer information.");
  const input = value as Record<string, unknown>;
  return {
    buyerLegalName: field(input.buyerLegalName, "Buyer legal name", 160, 2),
    billingAddress: field(input.billingAddress, "Billing address", 500, 10),
    deliveryAddress: field(input.deliveryAddress, "Delivery address", 500),
    billingCountry: field(input.billingCountry, "Billing country", 80, 2),
    purchaseOrderReference: field(input.purchaseOrderReference, "Purchase order reference", 80),
    depositBps: choice(input.depositBps),
    notes: field(input.notes, "Internal handover notes", 900),
  };
}

export function parseHandoverCreate(value: unknown): { reviewId: string; fields: HandoverFields } {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new HandoverError("Invalid handover request.");
  const input = value as Record<string, unknown>;
  return { reviewId: uuid(input.reviewId, "accepted quotation"), fields: parseHandoverFields(value) };
}

export type HandoverUpdate = {
  id: string;
  expectedVersion: number;
  nextStatus: HandoverStatus;
  fields: HandoverFields;
  checks: HandoverChecks;
};

export function parseHandoverUpdate(value: unknown): HandoverUpdate {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new HandoverError("Invalid handover update.");
  const input = value as Record<string, unknown>;
  const expectedVersion = input.expectedVersion;
  if (typeof expectedVersion !== "number" || !Number.isSafeInteger(expectedVersion) || expectedVersion < 1) {
    throw new HandoverError("Refresh the handover before editing.");
  }
  if (!handoverStatuses.includes(input.nextStatus as HandoverStatus)) throw new HandoverError("Invalid handover status.");
  const keys = ["buyerDetailsReviewed", "vatTreatmentReviewed", "paymentTermsReviewed", "specificationReviewed"] as const;
  for (const key of keys) if (typeof input[key] !== "boolean") throw new HandoverError("All readiness checks must be explicit.");
  return {
    id: uuid(input.id, "handover"),
    expectedVersion,
    nextStatus: input.nextStatus as HandoverStatus,
    fields: parseHandoverFields(value),
    checks: {
      buyerDetailsReviewed: input.buyerDetailsReviewed as boolean,
      vatTreatmentReviewed: input.vatTreatmentReviewed as boolean,
      paymentTermsReviewed: input.paymentTermsReviewed as boolean,
      specificationReviewed: input.specificationReviewed as boolean,
    },
  };
}

const allowed: Record<HandoverStatus, readonly HandoverStatus[]> = {
  draft: ["ready_for_invoice_review", "on_hold", "cancelled"],
  ready_for_invoice_review: ["on_hold", "cancelled"],
  on_hold: ["draft", "cancelled"],
  cancelled: [],
};

export const handoverLabels: Record<HandoverStatus, string> = {
  draft: "Internal draft",
  ready_for_invoice_review: "Invoice preparation review",
  on_hold: "On hold",
  cancelled: "Cancelled",
};

export function nextHandoverStatuses(current: HandoverStatus) {
  return [current, ...allowed[current]];
}

export function validateHandoverTransition(
  current: HandoverStatus, next: HandoverUpdate,
  context: { quoteStillCurrent: boolean; latestProofApproved: boolean; proofRequired: boolean; sourceValidUntil: string },
  today: string,
) {
  if (current === "cancelled") throw new HandoverError("Cancelled handovers cannot be reopened.", "conflict");
  if (current !== next.nextStatus && !allowed[current].includes(next.nextStatus)) {
    throw new HandoverError("Invalid change of handover stage.", "conflict");
  }
  if (next.nextStatus !== "ready_for_invoice_review") return;
  if (!context.quoteStillCurrent || context.sourceValidUntil < today) {
    throw new HandoverError("The customer's quotation was replaced or has expired. Obtain a fresh acceptance.", "conflict");
  }
  if (context.proofRequired && !context.latestProofApproved) {
    throw new HandoverError("The latest Team & Pro artwork proof needs customer approval.", "conflict");
  }
  if (!next.checks.buyerDetailsReviewed || !next.checks.vatTreatmentReviewed ||
      !next.checks.paymentTermsReviewed || !next.checks.specificationReviewed) {
    throw new HandoverError("Buyer, VAT, payment terms and specification checks are all required.");
  }
}

export function illustrativeDepositPence(snapshot: CommercialSnapshot, basisPoints: DepositBps): number {
  return Math.round(snapshot.totalPence * basisPoints / 10_000);
}

// No Stripe payment calls, tax invoices, bank instructions, or factory-dispatch actions here.
