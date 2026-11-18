// KALËTHON Team & Pro planning only. This module never creates a factory order,
// requests payment, issues a shipment or declares a product manufactured.
export const productionStages = [
  "draft", "supplier_review", "preproduction", "ready_for_release", "on_hold", "cancelled",
] as const;

export type ProductionStage = (typeof productionStages)[number];

export type ProductionChecks = {
  supplierConfirmed: boolean;
  technicalChecked: boolean;
  commercialChecked: boolean;
  qualityChecked: boolean;
};

export type ProductionPlan = ProductionChecks & {
  id: string;
  quoteQuestionId: string;
  proofId: string;
  proofVersion: number;
  proofTitle: string;
  customerName: string;
  reference: string;
  plannedQuantity: number;
  supplier: string;
  targetDate: string;
  notes: string;
  status: ProductionStage;
  version: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductionEvent = {
  id: string;
  planId: string;
  action: string;
  actor: string;
  detail: string;
  createdAt: string;
};

export type ProductionApprovedProof = {
  id: string;
  quoteQuestionId: string;
  version: number;
  title: string;
  artworkPath: string;
  customerName: string;
  subject: string;
};

export class ProductionPlanError extends Error {
  constructor(message: string, readonly code: "invalid" | "conflict" | "not_found" | "unavailable" = "invalid") {
    super(message);
    this.name = "ProductionPlanError";
  }
}

function plain(value: unknown, maximum: number, name: string) {
  if (typeof value !== "string" || value.length > maximum * 2 || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new ProductionPlanError("Please check " + name + ".");
  }
  const text = value.trim().replace(/\s+/g, " ");
  if (text.length > maximum) throw new ProductionPlanError(name + " is too long.");
  return text;
}
function note(value: unknown) {
  if (typeof value !== "string" || value.length > 1000 || /[\u0000-\u0008\u000b-\u001f\u007f]/.test(value)) {
    throw new ProductionPlanError("Notes must be at most 1,000 characters.");
  }
  return value.trim();
}
function targetDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ProductionPlanError("Enter a valid target date (YYYY-MM-DD).");
  }
  const date = new Date(value + "T00:00:00Z");
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new ProductionPlanError("Enter a real calendar date.");
  }
  return value;
}
function uuid(value: unknown, name: string) {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new ProductionPlanError("Choose a valid " + name + ".");
  }
  return value;
}
const stages = new Set<string>(productionStages);
function stage(value: unknown) {
  if (typeof value !== "string" || !stages.has(value)) throw new ProductionPlanError("Invalid production stage.");
  return value as ProductionStage;
}
function positiveCount(value: unknown) {
  const quantity = Number(value);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10000) {
    throw new ProductionPlanError("Quantity must be between 1 and 10,000 kits.");
  }
  return quantity;
}
export function parseProductionDraft(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ProductionPlanError("Invalid plan details.");
  const body = value as Record<string, unknown>;
  const supplier = plain(body.supplier, 120, "supplier");
  const notes = note(body.notes);
  return {
    proofId: uuid(body.proofId, "approved proof"),
    plannedQuantity: positiveCount(body.plannedQuantity),
    supplier,
    targetDate: targetDate(body.targetDate),
    notes,
  };
}

export type ProductionUpdate = ProductionChecks & {
  planId: string;
  expectedVersion: number;
  status: ProductionStage;
  supplier: string;
  targetDate: string;
  notes: string;
};

export function parseProductionUpdate(value: unknown): ProductionUpdate {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ProductionPlanError("Invalid update.");
  const body = value as Record<string, unknown>;
  const expectedVersion = Number(body.expectedVersion);
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 1) throw new ProductionPlanError("Reload this plan before editing.");
  for (const key of ["supplierConfirmed", "technicalChecked", "commercialChecked", "qualityChecked"]) {
    if (typeof body[key] !== "boolean") throw new ProductionPlanError("Planning checklist must use explicit confirmations.");
  }
  return {
    planId: uuid(body.planId, "production plan"),
    expectedVersion,
    status: stage(body.status),
    supplier: plain(body.supplier, 120, "supplier"),
    targetDate: targetDate(body.targetDate),
    notes: note(body.notes),
    supplierConfirmed: body.supplierConfirmed as boolean,
    technicalChecked: body.technicalChecked as boolean,
    commercialChecked: body.commercialChecked as boolean,
    qualityChecked: body.qualityChecked as boolean,
  };
}

const transitions: Record<ProductionStage, readonly ProductionStage[]> = {
  draft: ["supplier_review", "on_hold", "cancelled"],
  supplier_review: ["preproduction", "on_hold", "cancelled"],
  preproduction: ["ready_for_release", "on_hold", "cancelled"],
  ready_for_release: ["on_hold", "cancelled"],
  on_hold: ["draft", "cancelled"],
  cancelled: [],
};

export function validateProductionTransition(
  current: ProductionStage,
  next: ProductionUpdate,
  approvedLatestProof: boolean,
  artworkPath: string,
) {
  if (current === "cancelled") throw new ProductionPlanError("Cancelled plans cannot be reopened.", "conflict");
  if (next.status !== current && !transitions[current].includes(next.status)) {
    throw new ProductionPlanError("Move through the planning stages in order.", "conflict");
  }
  if (next.status === "supplier_review" || next.status === "preproduction" || next.status === "ready_for_release") {
    if (!next.supplier) throw new ProductionPlanError("Assign a supplier before supplier review.");
  }
  if (next.status === "preproduction" || next.status === "ready_for_release") {
    if (!next.supplierConfirmed) throw new ProductionPlanError("Supplier acceptance must be confirmed manually.");
  }
  if (next.status === "ready_for_release") {
    if (!approvedLatestProof) throw new ProductionPlanError("The latest artwork proof must have customer approval.");
    if (!artworkPath) throw new ProductionPlanError("A reviewed artwork file is required before release readiness.");
    if (!next.technicalChecked || !next.commercialChecked || !next.qualityChecked) {
      throw new ProductionPlanError("Technical, commercial and QC checks must be confirmed before release readiness.");
    }
  }
}

// 'ready_for_release' is an INTERNAL planning status. It never initiates factory
// dispatch, authorises a payment, or proves that an invoice has been paid.
