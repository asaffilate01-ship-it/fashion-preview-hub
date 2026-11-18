import { ensureCommerceSchema } from "./bootstrap";
import {
  parseProductionDraft, parseProductionUpdate, validateProductionTransition,
  ProductionPlanError, type ProductionPlan, type ProductionApprovedProof, type ProductionEvent,
  type ProductionStage,
} from "@/lib/production-planning";

async function database() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new ProductionPlanError("Production planning database is unavailable.", "unavailable");
  await ensureCommerceSchema(env.DB);
  return env.DB;
}

function rows<T>(result: D1Result<T>): T[] {
  return result.results ?? [];
}

const planSelect = [
  "p.id, p.quote_question_id AS quoteQuestionId, p.proof_id AS proofId,",
  "pf.version AS proofVersion, pf.title AS proofTitle,",
  "q.customer_name AS customerName, p.reference, p.planned_quantity AS plannedQuantity,",
  "p.supplier, p.target_date AS targetDate, p.notes, p.status, p.version,",
  "p.supplier_confirmed AS supplierConfirmed, p.technical_checked AS technicalChecked,",
  "p.commercial_checked AS commercialChecked, p.quality_checked AS qualityChecked,",
  "p.created_by AS createdBy, p.updated_by AS updatedBy,",
  "p.created_at AS createdAt, p.updated_at AS updatedAt",
].join(" ");

function normalizePlan(row: Record<string, unknown>): ProductionPlan {
  return {
    ...row,
    plannedQuantity: Number(row.plannedQuantity),
    version: Number(row.version),
    proofVersion: Number(row.proofVersion),
    supplierConfirmed: Boolean(row.supplierConfirmed),
    technicalChecked: Boolean(row.technicalChecked),
    commercialChecked: Boolean(row.commercialChecked),
    qualityChecked: Boolean(row.qualityChecked),
  } as ProductionPlan;
}

export async function listProductionPlans() {
  const db = await database();
  const [plansResult, eventsResult, proofsResult] = await Promise.all([
    db.prepare("SELECT " + planSelect +
      " FROM commerce_production_plans p JOIN commerce_pro_proofs pf ON pf.id = p.proof_id JOIN commerce_questions q ON q.id = p.quote_question_id" +
      " ORDER BY p.updated_at DESC LIMIT 100").all<Record<string, unknown>>(),
    db.prepare("SELECT id, plan_id AS planId, action, actor, detail, created_at AS createdAt FROM commerce_production_events ORDER BY created_at DESC LIMIT 300")
      .all<ProductionEvent>(),
    db.prepare("SELECT p.id, p.quote_question_id AS quoteQuestionId, p.version, p.title, p.artwork_path AS artworkPath, q.customer_name AS customerName, q.subject FROM commerce_pro_proofs p JOIN commerce_questions q ON q.id = p.quote_question_id" +
      " WHERE p.status = 'customer_approved' AND p.version = (SELECT MAX(version) FROM commerce_pro_proofs WHERE quote_question_id = p.quote_question_id)" +
      " AND NOT EXISTS (SELECT 1 FROM commerce_production_plans work WHERE work.quote_question_id = p.quote_question_id)" +
      " ORDER BY p.customer_decided_at DESC LIMIT 80").all<ProductionApprovedProof>(),
  ]);
  return {
    plans: rows(plansResult).map(normalizePlan),
    events: rows(eventsResult),
    approvedProofs: rows(proofsResult),
  };
}

export async function createProductionPlan(raw: unknown, actor: string) {
  const input = parseProductionDraft(raw);
  const db = await database();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const reference = "KPR-" + now.slice(2, 10).replace(/-/g, "") + "-" + id.slice(0, 8).toUpperCase();
  // This is a PLANNING RECORD, never an order or factory dispatch.
  const statements = [
    db.prepare(
      "INSERT INTO commerce_production_plans (id, quote_question_id, proof_id, reference, planned_quantity, supplier, target_date, notes, status, created_by, updated_by, created_at, updated_at)" +
      " SELECT ?, pf.quote_question_id, pf.id, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?" +
      " FROM commerce_pro_proofs pf JOIN commerce_questions q ON q.id = pf.quote_question_id" +
      " WHERE pf.id = ? AND pf.status = 'customer_approved'" +
      " AND pf.version = (SELECT MAX(version) FROM commerce_pro_proofs WHERE quote_question_id = pf.quote_question_id)" +
      " AND q.subject LIKE '[PRO QUOTE]%'" +
      " AND NOT EXISTS (SELECT 1 FROM commerce_production_plans existing WHERE existing.quote_question_id = pf.quote_question_id)"
    ).bind(id, reference, input.plannedQuantity, input.supplier, input.targetDate, input.notes, actor, actor, now, now, input.proofId),
    db.prepare(
      "INSERT INTO commerce_production_events (id, plan_id, action, actor, detail, created_at)" +
      " SELECT ?, id, 'created', ?, 'Internal planning draft created; no factory release or payment', ?" +
      " FROM commerce_production_plans WHERE id = ?"
    ).bind(crypto.randomUUID(), actor, now, id),
  ];
  try {
    const result = await db.batch(statements);
    if (Number(result[0]?.meta?.changes ?? 0) !== 1 || Number(result[1]?.meta?.changes ?? 0) !== 1) {
      throw new ProductionPlanError("This proof is not the latest approved version, or a plan already exists.", "conflict");
    }
    return { id, reference };
  } catch (error) {
    if (error instanceof ProductionPlanError) throw error;
    throw new ProductionPlanError("Could not create a plan for this approved proof.", "conflict");
  }
}

export async function updateProductionPlan(raw: unknown, actor: string) {
  const input = parseProductionUpdate(raw);
  const db = await database();
  const existing = await db.prepare(
    "SELECT p.id, p.version, p.status, pf.version AS proofVersion, pf.status AS proofStatus," +
    " pf.artwork_path AS artworkPath, p.quote_question_id AS quoteId" +
    " FROM commerce_production_plans p JOIN commerce_pro_proofs pf ON pf.id = p.proof_id WHERE p.id = ?"
  ).bind(input.planId).first<{
    id: string; version: number; status: ProductionStage;
    proofVersion: number; proofStatus: string; artworkPath: string; quoteId: string;
  }>();
  if (!existing) throw new ProductionPlanError("This plan could not be found.", "not_found");
  if (existing.version !== input.expectedVersion) {
    throw new ProductionPlanError("This plan changed elsewhere. Refresh before editing.", "conflict");
  }
  const latest = await db.prepare(
    "SELECT MAX(version) AS version FROM commerce_pro_proofs WHERE quote_question_id = ?"
  ).bind(existing.quoteId).first<{ version: number }>();
  const approvedLatest = existing.proofStatus === "customer_approved" &&
    existing.proofVersion === Number(latest?.version);
  validateProductionTransition(existing.status, input, approvedLatest, existing.artworkPath ?? "");
  if (input.status === "ready_for_release" && input.targetDate < new Date().toISOString().slice(0, 10)) {
    throw new ProductionPlanError("Choose a current or future target date before release readiness.");
  }
  const now = new Date().toISOString();
  const detail = [
    "Stage " + existing.status + " -> " + input.status,
    "Supplier " + (input.supplier || "unassigned"),
    "Checks: supplier=" + input.supplierConfirmed +
      ", technical=" + input.technicalChecked +
      ", commercial=" + input.commercialChecked +
      ", quality=" + input.qualityChecked,
    "Target " + input.targetDate,
  ].join("; ");
  const result = await db.batch([
    db.prepare(
      "UPDATE commerce_production_plans SET supplier = ?, target_date = ?, notes = ?, status = ?," +
      " supplier_confirmed = ?, technical_checked = ?, commercial_checked = ?, quality_checked = ?," +
      " version = version + 1, updated_by = ?, updated_at = ?" +
      " WHERE id = ? AND version = ? AND status = ?"
    ).bind(
      input.supplier, input.targetDate, input.notes, input.status,
      input.supplierConfirmed ? 1 : 0, input.technicalChecked ? 1 : 0,
      input.commercialChecked ? 1 : 0, input.qualityChecked ? 1 : 0,
      actor, now, input.planId, input.expectedVersion, existing.status,
    ),
    db.prepare(
      "INSERT INTO commerce_production_events (id, plan_id, action, actor, detail, created_at)" +
      " SELECT ?, id, ?, ?, ?, ? FROM commerce_production_plans WHERE id = ? AND version = ?"
    ).bind(crypto.randomUUID(), existing.status === input.status ? "updated" : "stage_changed",
      actor, detail, now, input.planId, input.expectedVersion + 1),
  ]);
  if (Number(result[0]?.meta?.changes ?? 0) !== 1 || Number(result[1]?.meta?.changes ?? 0) !== 1) {
    throw new ProductionPlanError("This plan changed during editing. Refresh and try again.", "conflict");
  }
  return { id: input.planId, version: input.expectedVersion + 1, status: input.status };
}
