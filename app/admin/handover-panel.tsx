"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  depositOptionsBps, handoverLabels, illustrativeDepositPence, nextHandoverStatuses,
  type AcceptedQuote, type HandoverChecks, type HandoverEvent, type HandoverFields,
  type HandoverRecord, type HandoverStatus,
} from "@/lib/trade-handover";
import styles from "./handover-panel.module.css";

type Register = { acceptedQuotes: AcceptedQuote[]; handovers: HandoverRecord[]; events: HandoverEvent[] };
const money = (value: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value / 100);
const emptyFields: HandoverFields = {
  buyerLegalName: "", billingAddress: "", deliveryAddress: "", billingCountry: "",
  purchaseOrderReference: "", depositBps: 0, notes: "",
};
const none: HandoverChecks = {
  buyerDetailsReviewed: false, vatTreatmentReviewed: false,
  paymentTermsReviewed: false, specificationReviewed: false,
};

function BuyerFields({ fields, change, disabled }: {
  fields: HandoverFields; change: (fields: HandoverFields) => void; disabled: boolean;
}) {
  const field = <K extends keyof HandoverFields>(key: K, value: HandoverFields[K]) => change({ ...fields, [key]: value });
  return <>
    <div className={styles.two}>
      <label>Buyer or organisation legal name
        <input required minLength={2} maxLength={160} value={fields.buyerLegalName} disabled={disabled}
          onChange={(e) => field("buyerLegalName", e.target.value)} />
      </label>
      <label>Billing country
        <input required minLength={2} maxLength={80} value={fields.billingCountry} disabled={disabled}
          onChange={(e) => field("billingCountry", e.target.value)} />
      </label>
    </div>
    <label>Full billing address
      <textarea required minLength={10} maxLength={500} rows={3} value={fields.billingAddress} disabled={disabled}
        onChange={(e) => field("billingAddress", e.target.value)} placeholder="Street, town, postcode, country"/>
    </label>
    <label>Delivery address (if different)
      <textarea maxLength={500} rows={2} value={fields.deliveryAddress} disabled={disabled}
        onChange={(e) => field("deliveryAddress", e.target.value)} />
    </label>
    <div className={styles.two}>
      <label>Buyer purchase order reference (optional)
        <input maxLength={80} value={fields.purchaseOrderReference} disabled={disabled}
          onChange={(e) => field("purchaseOrderReference", e.target.value)} />
      </label>
      <label>Illustrative deposit for invoice review
        <select value={fields.depositBps} disabled={disabled}
          onChange={(e) => field("depositBps", Number(e.target.value) as HandoverFields["depositBps"])}>
          {depositOptionsBps.map((rate) =>
            <option key={rate} value={rate}>{rate / 100}% of accepted quotation</option>)}
        </select>
      </label>
    </div>
    <label>Internal notes and unresolved requirements
      <textarea maxLength={900} rows={3} value={fields.notes} disabled={disabled}
        onChange={(e) => field("notes", e.target.value)}/>
    </label>
  </>;
}

function HandoverEditor({ handover, audit, busy, onSave }: {
  handover: HandoverRecord; audit: HandoverEvent[]; busy: boolean;
  onSave: (body: Record<string, unknown>, success: string) => Promise<void>;
}) {
  const [fields, setFields] = useState<HandoverFields>(() => ({
    buyerLegalName: handover.buyerLegalName,
    billingAddress: handover.billingAddress,
    deliveryAddress: handover.deliveryAddress,
    billingCountry: handover.billingCountry,
    purchaseOrderReference: handover.purchaseOrderReference,
    depositBps: handover.depositBps,
    notes: handover.notes,
  }));
  const [checks, setChecks] = useState<HandoverChecks>(() => ({
    buyerDetailsReviewed: handover.buyerDetailsReviewed,
    vatTreatmentReviewed: handover.vatTreatmentReviewed,
    paymentTermsReviewed: handover.paymentTermsReviewed,
    specificationReviewed: handover.specificationReviewed,
  }));
  const [nextStatus, setNextStatus] = useState<HandoverStatus>(handover.status);
  const disabled = busy || handover.status === "cancelled";
  const setCheck = (key: keyof HandoverChecks, checked: boolean) =>
    setChecks((current) => ({ ...current, [key]: checked }));

  return <article className={styles.record}>
    <header className={styles.recordHeader}>
      <div><small>{handover.reference} · revision {handover.version}</small>
        <h4>{handover.buyerLegalName}</h4><p>{handover.customerEmail} · {handover.snapshot.priceReference}</p></div>
      <span className={styles.status}>{handoverLabels[handover.status]}</span>
    </header>
    <div className={styles.metrics}>
      <span>Accepted quotation <strong>{money(handover.snapshot.totalPence)}</strong></span>
      <span>Illustrative deposit <strong>{money(illustrativeDepositPence(handover.snapshot, fields.depositBps))}</strong></span>
      <span>Quote revision <strong>{handover.snapshot.priceRevision}</strong></span>
    </div>
    {handover.status === "ready_for_invoice_review" && handover.quoteStillCurrent &&
      (!handover.proofRequired || handover.latestProofApproved) && (
        <Link className={styles.worksheetLink}
          href={`/admin/handovers/${handover.id}/preview`}
          target="_blank" rel="noopener noreferrer">
          Open internal invoice-preparation worksheet <span aria-hidden="true">↗</span>
        </Link>
      )}
    {(!handover.quoteStillCurrent || (handover.proofRequired && !handover.latestProofApproved)) &&
      <p className={styles.warning}>This handover cannot advance to invoice preparation: the accepted quotation is outdated or the latest required artwork proof is not approved.</p>}
    <details className={styles.details}><summary>Review immutable customer price snapshot</summary>
      <div className={styles.tableScroll}><table>
        <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Amount</th></tr></thead>
        <tbody>{handover.snapshot.lines.map((line, i) => <tr key={i}>
          <td>{line.description}</td><td>{line.quantity}</td><td>{money(line.unitPricePence)}</td><td>{money(line.lineTotalPence)}</td>
        </tr>)}</tbody></table></div>
      <p>Subtotal {money(handover.snapshot.subtotalPence)} · Discount {money(handover.snapshot.discountPence)} ·
        Shipping {money(handover.snapshot.shippingPence)} · VAT estimate {money(handover.snapshot.taxPence)}</p>
      <p>Pricing valid until {handover.snapshot.validUntil}. Internal manufacturing cost is not included in this snapshot.</p>
    </details>
    <form className={styles.form} onSubmit={(event) => {
      event.preventDefault();
      void onSave({
        action: "update", id: handover.id, expectedVersion: handover.version,
        nextStatus, ...fields, ...checks,
      }, "Internal handover updated with audit history.");
    }}>
      <BuyerFields fields={fields} change={setFields} disabled={disabled}/>
      <fieldset className={styles.checklist} disabled={disabled}>
        <legend>Manual readiness checks — no payment verification</legend>
        <label><input type="checkbox" checked={checks.buyerDetailsReviewed}
          onChange={(e) => setCheck("buyerDetailsReviewed", e.target.checked)}/> Buyer legal identity and billing details reviewed</label>
        <label><input type="checkbox" checked={checks.vatTreatmentReviewed}
          onChange={(e) => setCheck("vatTreatmentReviewed", e.target.checked)}/> VAT and tax documentation reviewed by the business</label>
        <label><input type="checkbox" checked={checks.paymentTermsReviewed}
          onChange={(e) => setCheck("paymentTermsReviewed", e.target.checked)}/> Deposit and payment terms discussed (not paid)</label>
        <label><input type="checkbox" checked={checks.specificationReviewed}
          onChange={(e) => setCheck("specificationReviewed", e.target.checked)}/> Specification, quantities and delivery requirements reviewed</label>
      </fieldset>
      <div className={styles.actionRow}>
        <label>Internal stage
          <select disabled={disabled} value={nextStatus} onChange={(e) => setNextStatus(e.target.value as HandoverStatus)}>
            {nextHandoverStatuses(handover.status).map((option) =>
              <option key={option} value={option}>{handoverLabels[option]}</option>)}
          </select>
        </label>
        <button disabled={disabled} type="submit">{busy ? "Saving…" : "Save and audit handover"}</button>
      </div>
    </form>
    <details className={styles.details}><summary>Audit log ({audit.length} events)</summary>
      <ol>{audit.map((event) => <li key={event.id}>
        <time>{new Date(event.createdAt).toLocaleString("en-GB")}</time> · {event.actor}: {event.action} — {event.detail}
      </li>)}</ol>
    </details>
  </article>;
}

export default function HandoverPanel() {
  const [data, setData] = useState<Register>({ acceptedQuotes: [], handovers: [], events: [] });
  const [reviewId, setReviewId] = useState("");
  const [fields, setFields] = useState<HandoverFields>({ ...emptyFields });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/handovers", { cache: "no-store" });
      const body = await response.json() as Register & { message?: string };
      if (!response.ok) throw new Error(body.message || "Intake data could not be loaded.");
      setData(body);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Intake data could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submit = async (payload: Record<string, unknown>, success: string) => {
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/handovers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || result.ok !== true) throw new Error(result.message || "Handover could not be saved.");
      setMessage(success);
      if (payload.action === "create") { setReviewId(""); setFields({ ...emptyFields }); }
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Handover could not be saved."); }
    finally { setBusy(false); }
  };
  const currentQuote = data.acceptedQuotes.find((quote) => quote.reviewId === reviewId);

  return <section className={styles.workspace} aria-labelledby="intake-heading">
    <header className={styles.heading}><div><p>Team &amp; Pro / Commercial handover</p>
      <h2 id="intake-heading">Accepted quote intake</h2>
      <small>Gather buyer information and review an accepted quotation without changing its price. Nothing here issues an invoice, charges a card or dispatches work.</small>
    </div><button type="button" disabled={loading || busy} onClick={() => void load()}>Refresh intake</button></header>
    <div className={styles.metrics}>
      <span>Accepted quotes eligible for intake <strong>{data.acceptedQuotes.length}</strong></span>
      <span>Internal handovers <strong>{data.handovers.length}</strong></span>
      <span>Invoice preparation reviews <strong>{data.handovers.filter((h) => h.status === "ready_for_invoice_review").length}</strong></span>
    </div>
    <form className={styles.form} onSubmit={(event) => {
      event.preventDefault();
      void submit({ action: "create", reviewId, ...fields }, "Internal handover draft created. No invoice or payment has been requested.");
    }}>
      <h3>01 / Create an internal handover</h3>
      <label>Customer-accepted, current quotation
        <select value={reviewId} required disabled={loading || busy} onChange={(e) => {
          const id = e.target.value;
          setReviewId(id);
          const quote = data.acceptedQuotes.find((item) => item.reviewId === id);
          if (quote) setFields((old) => ({ ...old, buyerLegalName: quote.customerName }));
        }}>
          <option value="">Choose an accepted quotation</option>
          {data.acceptedQuotes.map((quote) => <option key={quote.reviewId} value={quote.reviewId}>
            {quote.customerName} · {quote.priceReference} · {money(quote.totalPence)}
          </option>)}
        </select>
      </label>
      {currentQuote && <p className={styles.context}>Original contact: {currentQuote.customerEmail}. Quote expires {currentQuote.validUntil}. Customer addresses must be verified before invoicing.</p>}
      <BuyerFields fields={fields} change={setFields} disabled={loading || busy}/>
      <button type="submit" disabled={!reviewId || loading || busy}>{busy ? "Creating…" : "Create internal intake draft"}</button>
      {!loading && data.acceptedQuotes.length === 0 &&
        <p>No eligible accepted quotations are awaiting intake.</p>}
    </form>
    {message && <p className={styles.feedback} role="status">{message}</p>}
    <div className={styles.register}>
      <h3>02 / Handover register</h3>
      {loading && <p>Loading handovers…</p>}
      {!loading && data.handovers.length === 0 && <p>Created handovers will appear here with version history and readiness checks.</p>}
      {data.handovers.map((handover) => <HandoverEditor key={handover.id + ":" + handover.version}
        handover={handover} busy={busy}
        audit={data.events.filter((event) => event.handoverId === handover.id)}
        onSave={submit}/>)}
    </div>
    <p className={styles.warning}>
      Invoice preparation review is an internal administrative status only.
      It does not issue an invoice, determine legal VAT treatment, verify payment or authorise a factory order.
      An actual invoice requires the verified KALËTHON trading entity, tax registration and approved terms.
    </p>
  </section>;
}
