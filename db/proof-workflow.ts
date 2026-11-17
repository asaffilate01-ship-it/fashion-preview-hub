import { ensureCommerceSchema } from "./bootstrap";
import {
  parseProofDraft, parseProofDecision, proofReviewOrigin, ProofWorkflowError,
  type ProProof, type ProProofEvent,
} from "@/lib/proof-workflow";

async function database() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new ProofWorkflowError("Trade proof database is unavailable.", "unavailable");
  await ensureCommerceSchema(env.DB);
  return env.DB;
}

async function hashToken(token: string) {
  const encoded = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function freshToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function normalizeProof(value: Record<string, unknown>): ProProof {
  return {
    id: String(value.id),
    quoteQuestionId: String(value.quoteQuestionId),
    version: Number(value.version),
    title: String(value.title),
    specification: String(value.specification),
    artworkPath: String(value.artworkPath ?? ""),
    status: String(value.status) as ProProof["status"],
    createdBy: String(value.createdBy),
    customerName: String(value.customerName ?? ""),
    customerDecisionNote: String(value.customerDecisionNote ?? ""),
    customerDecidedAt: value.customerDecidedAt ? String(value.customerDecidedAt) : null,
    createdAt: String(value.createdAt),
    updatedAt: String(value.updatedAt),
  };
}

const proofSelect = "id, quote_question_id AS quoteQuestionId, version, title, specification, artwork_path AS artworkPath, status, created_by AS createdBy, customer_name AS customerName, customer_decision_note AS customerDecisionNote, customer_decided_at AS customerDecidedAt, created_at AS createdAt, updated_at AS updatedAt";

export async function listProProofs() {
  const db = await database();
  const [proofs, events] = await Promise.all([
    db.prepare("SELECT " + proofSelect + " FROM commerce_pro_proofs ORDER BY created_at DESC, version DESC LIMIT 100")
      .all<Record<string, unknown>>(),
    db.prepare("SELECT id, proof_id AS proofId, kind, actor, message, created_at AS createdAt FROM commerce_pro_proof_events ORDER BY created_at DESC LIMIT 250")
      .all<ProProofEvent>(),
  ]);
  return { proofs: (proofs.results ?? []).map(normalizeProof), events: events.results ?? [] };
}

export async function createProProof(input: unknown, actor: string) {
  const { quoteQuestionId, title, specification, artworkPath } = parseProofDraft(input);
  const db = await database();
  const quote = await db.prepare("SELECT id, subject FROM commerce_questions WHERE id = ?")
    .bind(quoteQuestionId).first<{ id: string; subject: string }>();
  if (!quote || !quote.subject.startsWith("[PRO QUOTE]")) {
    throw new ProofWorkflowError("Choose a trade quotation from the admin inbox.", "not_found");
  }
  const current = await db.prepare(
    "SELECT COALESCE(MAX(version), 0) AS lastVersion FROM commerce_pro_proofs WHERE quote_question_id = ?"
  ).bind(quoteQuestionId).first<{ lastVersion: number }>();
  const version = Number(current?.lastVersion ?? 0) + 1;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.batch([
    db.prepare("INSERT INTO commerce_pro_proofs (id, quote_question_id, version, title, specification, artwork_path, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)")
      .bind(id, quoteQuestionId, version, title, specification, artworkPath, actor, now, now),
    db.prepare("INSERT INTO commerce_pro_proof_events (id, proof_id, kind, actor, message, created_at) VALUES (?, ?, 'created', ?, ?, ?)")
      .bind(crypto.randomUUID(), id, actor, "Internal draft created; no customer approval requested", now),
  ]);
  return { id, version };
}

export async function issueProProof(proofId: string, actor: string) {
  if (!/^[0-9a-f-]{36}$/i.test(proofId)) throw new ProofWorkflowError("Invalid proof selection.");
  const db = await database();
  const proof = await db.prepare("SELECT id, quote_question_id AS quoteId, version, status FROM commerce_pro_proofs WHERE id = ?")
    .bind(proofId).first<{ id: string; quoteId: string; version: number; status: string }>();
  if (!proof || proof.status !== "draft") {
    throw new ProofWorkflowError("Only unpublished drafts can be sent for review.", "conflict");
  }
  const latest = await db.prepare("SELECT MAX(version) AS version FROM commerce_pro_proofs WHERE quote_question_id = ?")
    .bind(proof.quoteId).first<{ version: number }>();
  if (proof.version !== Number(latest?.version)) {
    throw new ProofWorkflowError("Create a new proof from the latest version before sharing.", "conflict");
  }
  // Validate the public origin before mutating any proof status.
  const origin = proofReviewOrigin();
  const token = freshToken();
  const tokenHash = await hashToken(token);
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const results = await db.batch([
    db.prepare("INSERT INTO commerce_pro_proof_events (id, proof_id, kind, actor, message, created_at) SELECT lower(hex(randomblob(16))), id, 'superseded', ?, 'Review link revoked by a newer proof', ? FROM commerce_pro_proofs WHERE quote_question_id = ? AND status = 'awaiting_customer'")
      .bind(actor, now, proof.quoteId),
    db.prepare("UPDATE commerce_pro_proofs SET status = 'superseded', token_hash = NULL, token_expires_at = NULL, updated_at = ? WHERE quote_question_id = ? AND status = 'awaiting_customer'")
      .bind(now, proof.quoteId),
    db.prepare("UPDATE commerce_pro_proofs SET status = 'awaiting_customer', token_hash = ?, token_expires_at = ?, updated_at = ? WHERE id = ? AND status = 'draft'")
      .bind(tokenHash, expiresAt, now, proofId),
    db.prepare("INSERT INTO commerce_pro_proof_events (id, proof_id, kind, actor, message, created_at) VALUES (?, ?, 'issued', ?, ?, ?)")
      .bind(crypto.randomUUID(), proofId, actor, "Private review link issued; expiry " + expiresAt, now),
  ]);
  if (Number(results[2]?.meta?.changes ?? 0) !== 1) {
    throw new ProofWorkflowError("Proof status changed. Reload and retry.", "conflict");
  }
  return { reviewUrl: origin + "/pro/proof/" + token, expiresAt, proofId };
}

export type CustomerProof = {
  id: string;
  version: number;
  title: string;
  specification: string;
  artworkPath: string;
  expiresAt: string;
  quoteTitle: string;
};

export async function getCustomerProof(token: string): Promise<CustomerProof | null> {
  if (!/^[A-Za-z0-9_-]{40,70}$/.test(token)) return null;
  const hash = await hashToken(token);
  const db = await database();
  const proof = await db.prepare(
    "SELECT p.id, p.version, p.title, p.specification, p.artwork_path AS artworkPath, p.token_expires_at AS expiresAt, q.subject AS quoteTitle FROM commerce_pro_proofs p JOIN commerce_questions q ON q.id = p.quote_question_id WHERE p.token_hash = ? AND p.status = 'awaiting_customer' AND p.token_expires_at > ?"
  ).bind(hash, new Date().toISOString()).first<CustomerProof>();
  return proof ?? null;
}

export async function recordCustomerProofDecision(value: unknown) {
  const decision = parseProofDecision(value);
  const hash = await hashToken(decision.token);
  const db = await database();
  const current = await db.prepare(
    "SELECT p.id, p.status, p.token_expires_at AS expiresAt, q.customer_email AS customerEmail FROM commerce_pro_proofs p JOIN commerce_questions q ON q.id = p.quote_question_id WHERE p.token_hash = ?"
  ).bind(hash).first<{ id: string; status: string; expiresAt: string | null; customerEmail: string }>();
  if (!current || current.status !== "awaiting_customer" || !current.expiresAt ||
      current.expiresAt <= new Date().toISOString()) {
    throw new ProofWorkflowError("This review link has expired or has already been used.", "conflict");
  }
  if (current.customerEmail.toLowerCase() !== decision.customerEmail) {
    throw new ProofWorkflowError("Use the email address associated with the original quotation.", "invalid");
  }
  const status = decision.decision === "approve" ? "customer_approved" : "revision_requested";
  const now = new Date().toISOString();
  const result = await db.batch([
    db.prepare("UPDATE commerce_pro_proofs SET status = ?, customer_name = ?, customer_decision_note = ?, customer_decided_at = ?, token_hash = NULL, token_expires_at = NULL, updated_at = ? WHERE id = ? AND status = 'awaiting_customer' AND token_hash = ? AND token_expires_at > ?")
      .bind(status, decision.customerName, decision.message, now, now, current.id, hash, now),
    db.prepare("INSERT INTO commerce_pro_proof_events (id, proof_id, kind, actor, message, created_at) SELECT ?, id, ?, ?, ?, ? FROM commerce_pro_proofs WHERE id = ? AND status = ? AND customer_decided_at = ?")
      .bind(crypto.randomUUID(), status, decision.customerEmail, decision.message.slice(0, 600), now, current.id, status, now),
  ]);
  if (Number(result[0]?.meta?.changes ?? 0) !== 1 || Number(result[1]?.meta?.changes ?? 0) !== 1) {
    throw new ProofWorkflowError("The proof was already reviewed. Please contact KALËTHON.", "conflict");
  }
  return { decision: status, recordedAt: now };
}
