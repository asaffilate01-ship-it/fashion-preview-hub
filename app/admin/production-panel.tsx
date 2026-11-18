"use client";

import { useCallback, useEffect, useState } from "react";
import {
  nextProductionStages, productionStageLabels,
  type ProductionApprovedProof, type ProductionEvent, type ProductionPlan,
  type ProductionUpdate, type ProductionStage,
} from "@/lib/production-planning";
import styles from "./production-panel.module.css";

type ResponseData = {
  approvedProofs: ProductionApprovedProof[];
  plans: ProductionPlan[];
  events: ProductionEvent[];
};
type ResponseMessage = { ok?: boolean; message?: string };

function PlanEditor({ plan, events, submit, busy }: {
  plan: ProductionPlan;
  events: ProductionEvent[];
  submit: (payload: Record<string, unknown>) => Promise<void>;
  busy: boolean;
}) {
  const [supplier, setSupplier] = useState(plan.supplier);
  const [targetDate, setTargetDate] = useState(plan.targetDate);
  const [notes, setNotes] = useState(plan.notes);
  const [stage, setStage] = useState<ProductionStage>(plan.status);
  const [supplierConfirmed, setSupplierConfirmed] = useState(plan.supplierConfirmed);
  const [technicalChecked, setTechnicalChecked] = useState(plan.technicalChecked);
  const [commercialChecked, setCommercialChecked] = useState(plan.commercialChecked);
  const [qualityChecked, setQualityChecked] = useState(plan.qualityChecked);
  const update: ProductionUpdate = {
    planId: plan.id, expectedVersion: plan.version,
    status: stage, supplier, targetDate, notes,
    supplierConfirmed, technicalChecked, commercialChecked, qualityChecked,
  };
  const immutable = plan.status === "cancelled";
  return (
    <article className={styles.plan}>
      <header className={styles.planHeading}>
        <div>
          <small>{plan.reference} · Version {plan.proofVersion} approved artwork</small>
          <h3>{plan.proofTitle}</h3>
          <p>{plan.customerName} · {plan.plannedQuantity} planned kits · Revision {plan.version}</p>
        </div>
        <span className={styles.status}>{productionStageLabels[plan.status]}</span>
      </header>
      <form className={styles.editor} onSubmit={(event) => { event.preventDefault(); void submit({ action: "update", ...update }); }}>
        <div className={styles.twoColumns}>
          <label>Supplier / workshop
            <input required={stage !== "draft" && stage !== "on_hold" && stage !== "cancelled"}
              value={supplier} maxLength={120} disabled={busy || immutable}
              onChange={(event) => setSupplier(event.target.value)} placeholder="Supplier to review (not a confirmed factory order)" />
          </label>
          <label>Target planning date
            <input type="date" value={targetDate} required disabled={busy || immutable}
              onChange={(event) => setTargetDate(event.target.value)} />
          </label>
        </div>
        <fieldset className={styles.checks} disabled={busy || immutable}>
          <legend>Internal checks — recorded manually, not payment or dispatch confirmation</legend>
          <label><input type="checkbox" checked={supplierConfirmed} onChange={(event) => setSupplierConfirmed(event.target.checked)}/> Supplier has reviewed and accepted the proposed brief</label>
          <label><input type="checkbox" checked={technicalChecked} onChange={(event) => setTechnicalChecked(event.target.checked)}/> Production specifications and sizes checked</label>
          <label><input type="checkbox" checked={commercialChecked} onChange={(event) => setCommercialChecked(event.target.checked)}/> Commercial terms reviewed (does not confirm payment)</label>
          <label><input type="checkbox" checked={qualityChecked} onChange={(event) => setQualityChecked(event.target.checked)}/> Artwork and pre-production quality checks completed</label>
        </fieldset>
        <label>Internal notes
          <textarea rows={3} value={notes} maxLength={1000} disabled={busy || immutable}
            onChange={(event) => setNotes(event.target.value)} placeholder="Next actions, risks, factory constraints, samples or approvals" />
        </label>
        <div className={styles.saveLine}>
          <label>Planning stage
            <select value={stage} disabled={busy || immutable} onChange={(event) => setStage(event.target.value as ProductionStage)}>
              {nextProductionStages(plan.status).map((entry) =>
                <option key={entry} value={entry}>{productionStageLabels[entry]}</option>)}
            </select>
          </label>
          <button type="submit" disabled={busy || immutable}>{busy ? "Saving…" : "Save plan and audit change"}</button>
        </div>
      </form>
      <details className={styles.history}>
        <summary>Review audit history ({events.length} entries)</summary>
        <ol>
          {events.map((event) =>
            <li key={event.id}><time>{new Date(event.createdAt).toLocaleString("en-GB")}</time> · {event.actor}: {event.detail}</li>)}
        </ol>
      </details>
    </article>
  );
}

export default function ProductionPanel() {
  const [data, setData] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [proofId, setProofId] = useState("");
  const [quantity, setQuantity] = useState(25);
  const [supplier, setSupplier] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/production", { cache: "no-store" });
      const result = await response.json() as ResponseData & { message?: string };
      if (!response.ok) throw new Error(result.message || "Production planning unavailable.");
      setData(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Production planning unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const invoke = async (payload: Record<string, unknown>, success: string) => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/production", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as ResponseMessage;
      if (!response.ok || result.ok !== true) throw new Error(result.message || "The planning update failed.");
      setMessage(success);
      if (payload.action === "create") {
        setProofId(""); setQuantity(25); setSupplier(""); setTargetDate(""); setNotes("");
      }
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The planning update could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.workspace} aria-label="Team & Pro production planning">
      <header className={styles.heading}>
        <div>
          <p>Team & Pro / Manufacturing operations</p>
          <h2>Production planning control</h2>
          <small>Track approved artwork through supplier review and pre-production checks. Only an internal plan is created; this does not charge a customer or dispatch factory work.</small>
        </div>
        <button type="button" disabled={busy || loading} onClick={() => void load()}>Refresh plans</button>
      </header>
      <div className={styles.summary}>
        <div><strong>{data?.plans.length ?? 0}</strong><span>Internal plans</span></div>
        <div><strong>{data?.plans.filter((plan) => plan.status === "supplier_review").length ?? 0}</strong><span>Supplier review</span></div>
        <div><strong>{data?.plans.filter((plan) => plan.status === "preproduction").length ?? 0}</strong><span>Pre-production</span></div>
        <div><strong>{data?.plans.filter((plan) => plan.status === "ready_for_release").length ?? 0}</strong><span>Ready for release review</span></div>
      </div>
      <form className={styles.create} onSubmit={(event) => {
        event.preventDefault();
        void invoke({ action: "create", proofId, plannedQuantity: quantity, supplier, targetDate, notes },
          "Internal production draft created. No factory work has been released.");
      }}>
        <h3>01 / Create plan from an approved proof</h3>
        <p>Only the most recent customer-approved version of a trade proof can create a new plan.</p>
        <label>Customer-approved proof
          <select value={proofId} onChange={(event) => setProofId(event.target.value)} required disabled={busy || loading}>
            <option value="">Choose the latest approved proof</option>
            {data?.approvedProofs.map((proof) => <option key={proof.id} value={proof.id}>
              {proof.customerName} / {proof.title} / version {proof.version}
            </option>)}
          </select>
        </label>
        <div className={styles.twoColumns}>
          <label>Proposed quantity
            <input type="number" min={1} max={10000} step={1} required value={quantity} disabled={busy}
              onChange={(event) => setQuantity(Number(event.target.value))} />
          </label>
          <label>Target planning date
            <input type="date" required value={targetDate} disabled={busy} onChange={(event) => setTargetDate(event.target.value)}/>
          </label>
        </div>
        <label>Potential supplier / workshop (optional)
          <input value={supplier} maxLength={120} disabled={busy}
            onChange={(event) => setSupplier(event.target.value)} placeholder="Do not enter an unconfirmed factory as assigned" />
        </label>
        <label>Internal notes (optional)
          <textarea rows={3} value={notes} maxLength={1000} disabled={busy}
            onChange={(event) => setNotes(event.target.value)} placeholder="Materials, minimum quantities, samples and lead-time risks" />
        </label>
        <button type="submit" disabled={busy || loading || !proofId}>{busy ? "Creating…" : "Create planning draft"}</button>
        {!loading && data?.approvedProofs.length === 0 && <p>No latest approved proofs are awaiting a planning draft.</p>}
      </form>
      {message && <p role="status" className={styles.feedback}>{message}</p>}
      <section className={styles.plans} aria-labelledby="plans-heading">
        <div className={styles.plansHeading}><h3 id="plans-heading">02 / Production plan register</h3><span>{data?.plans.length ?? 0} plans</span></div>
        {loading && <p>Loading production plans…</p>}
        {!loading && data?.plans.length === 0 && <p>No production plans have been created. Approved customer proofs will appear above.</p>}
        {data?.plans.map((plan) => <PlanEditor key={plan.id + ":" + plan.version} plan={plan} busy={busy}
          events={data.events.filter((event) => event.planId === plan.id)}
          submit={(payload) => invoke(payload, "Production plan saved with an audit record.")} />)}
      </section>
      <p className={styles.disclaimer}>
        <strong>Release protection:</strong> “Ready for release review” is an internal milestone only.
        No supplier API, payment verification, production dispatch, or delivery booking is connected.
        Customer proof approval and manual checks do not establish that payment has been received.
      </p>
    </section>
  );
}
