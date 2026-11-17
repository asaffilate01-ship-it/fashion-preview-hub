export const proofStatuses = [
  "draft",
  "awaiting_customer",
  "customer_approved",
  "revision_requested",
  "superseded",
] as const;

export type ProofStatus = (typeof proofStatuses)[number];

export type ProProof = {
  id: string;
  quoteQuestionId: string;
  version: number;
  title: string;
  specification: string;
  artworkPath: string;
  status: ProofStatus;
  createdBy: string;
  customerName: string;
  customerDecisionNote: string;
  customerDecidedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProProofEvent = {
  id: string;
  proofId: string;
  kind: "created" | "issued" | "superseded" | "customer_approved" | "revision_requested";
  actor: string;
  message: string;
  createdAt: string;
};

export class ProofWorkflowError extends Error {
  constructor(message: string, readonly code: "invalid" | "not_found" | "conflict" | "unavailable" = "invalid") {
    super(message);
    this.name = "ProofWorkflowError";
  }
}

export function parseProofDraft(value: unknown): { quoteQuestionId: string; title: string; specification: string; artworkPath: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ProofWorkflowError("Invalid proof details.");
  const body = value as Record<string, unknown>;
  const quoteQuestionId = typeof body.quoteQuestionId === "string" ? body.quoteQuestionId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const specification = typeof body.specification === "string" ? body.specification.trim() : "";
  const artworkPath = typeof body.artworkPath === "string" ? body.artworkPath.trim() : "";
  if (quoteQuestionId.length < 4 || quoteQuestionId.length > 100) throw new ProofWorkflowError("Choose a valid trade quotation.");
  if (title.length < 5 || title.length > 120) throw new ProofWorkflowError("Proof title must be 5–120 characters.");
  if (specification.length < 20 || specification.length > 3500) {
    throw new ProofWorkflowError("Proof specifications must contain 20–3,500 characters.");
  }
  // Only a deliberately uploaded, same-origin proof asset may be shown; no arbitrary external image tracking.
  if (artworkPath && !/^\/proofs\/[a-zA-Z0-9/_-]+\.(?:png|jpg|jpeg|webp)$/i.test(artworkPath)) {
    throw new ProofWorkflowError("Artwork must be a published image path under /proofs/.");
  }
  if (artworkPath.includes("..") || artworkPath.includes("//")) throw new ProofWorkflowError("Invalid artwork path.");
  return { quoteQuestionId, title, specification, artworkPath };
}

export type ProofDecision = {
  token: string;
  decision: "approve" | "revision";
  customerName: string;
  customerEmail: string;
  message: string;
  confirmAccuracy: boolean;
};

export function parseProofDecision(value: unknown): ProofDecision {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ProofWorkflowError("Invalid proof response.");
  const body = value as Record<string, unknown>;
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const decision = body.decision;
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim().toLowerCase() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const confirmAccuracy = body.confirmAccuracy === true;
  if (!/^[A-Za-z0-9_-]{40,70}$/.test(token)) throw new ProofWorkflowError("Invalid or expired review link.");
  if (decision !== "approve" && decision !== "revision") throw new ProofWorkflowError("Choose approve or request revision.");
  if (customerName.length < 2 || customerName.length > 100 || /[\u0000-\u001f]/.test(customerName)) {
    throw new ProofWorkflowError("Enter your full name.");
  }
  if (customerEmail.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    throw new ProofWorkflowError("Enter a valid email address.");
  }
  if (message.length > 600 || /[\u0000-\u0008\u000b-\u001f]/.test(message)) {
    throw new ProofWorkflowError("Comments cannot exceed 600 characters.");
  }
  if (decision === "approve" && !confirmAccuracy) {
    throw new ProofWorkflowError("Please confirm you have reviewed the proof.");
  }
  if (decision === "revision" && message.length < 10) {
    throw new ProofWorkflowError("Describe the requested changes in at least 10 characters.");
  }
  return { token, decision, customerName, customerEmail, message, confirmAccuracy };
}

export function proofReviewOrigin() {
  const raw = process.env.SITE_URL ?? "https://kalethon.com";
  const url = new URL(raw);
  if (!(url.protocol === "https:" || (url.protocol === "http:" && url.hostname === "localhost"))) {
    throw new ProofWorkflowError("Review URL must use HTTPS.", "unavailable");
  }
  return url.origin;
}
