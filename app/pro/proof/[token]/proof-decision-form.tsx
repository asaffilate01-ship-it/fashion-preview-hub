"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./proof-page.module.css";

export default function ProofDecisionForm({ token, hasArtwork }: { token: string; hasArtwork: boolean }) {
  const [decision, setDecision] = useState<"approve" | "revision">("revision");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      const values = Object.fromEntries(new FormData(form).entries());
      const response = await fetch("/api/pro/proof/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          token,
          decision,
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          message: values.message ?? "",
          confirmAccuracy: decision === "approve" && agreed,
        }),
      });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || result.ok !== true) throw new Error(result.message || "The response could not be recorded.");
      setReceipt(decision === "approve"
        ? "Your approval has been recorded against this proof version. KALËTHON will still confirm production, price and payment details separately."
        : "Your change request has been recorded. KALËTHON will review it and send a new proof if needed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The response could not be recorded.");
    } finally {
      setBusy(false);
    }
  };

  if (receipt) {
    return <section className={styles.decision} role="status">
      <span className={styles.statusIcon} aria-hidden="true">✓</span>
      <h2>Review recorded</h2>
      <p>{receipt}</p>
      <p>This link can no longer be used for another decision. Keep a copy of your correspondence for your records.</p>
      <Link href="/contact">Contact KALËTHON</Link>
    </section>;
  }

  return (
    <section className={styles.decision} aria-labelledby="decision-title">
      <p className={styles.kicker}>Your response</p>
      <h2 id="decision-title">Approve or request changes</h2>
      <p>For security, use the same email address you provided in your original enquiry. Submitting this form records a decision for this proof version.</p>
      <form onSubmit={submit}>
        <fieldset className={styles.options}>
          <legend>What would you like to do?</legend>
          <label><input type="radio" name="decision" value="revision" checked={decision === "revision"} onChange={() => { setDecision("revision"); setAgreed(false); }} /><span>Request a revision</span></label>
          <label><input type="radio" name="decision" value="approve" checked={decision === "approve"} onChange={() => setDecision("approve")} /><span>Approve this proof</span></label>
        </fieldset>
        <label className={styles.field}>Your full name
          <input name="customerName" autoComplete="name" minLength={2} maxLength={100} required />
        </label>
        <label className={styles.field}>Original quotation email
          <input name="customerEmail" type="email" autoComplete="email" maxLength={160} required />
        </label>
        <label className={styles.field}>{decision === "revision" ? "Changes requested" : "Optional approval comments"}
          <textarea name="message" minLength={decision === "revision" ? 10 : undefined} maxLength={600} rows={5}
            placeholder={decision === "revision" ? "Describe the changes needed to sizes, branding, colours, player details or artwork…" : "Optional details for the production team"} required={decision === "revision"} />
        </label>
        {decision === "approve" && <label className={styles.consent}>
          <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} required />
          <span>I confirm that I have reviewed this version of the written specification{hasArtwork ? " and attached artwork" : " (no artwork attached)"} and approve it for the next internal production-planning stage.</span>
        </label>}
        <button className={styles.submit} type="submit" disabled={busy || (decision === "approve" && !agreed)}>
          {busy ? "Recording your review…" : decision === "approve" ? "Record my approval" : "Submit change request"}
        </button>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <p className={styles.helper}>Submitting does not charge you or start manufacturing. Approval is not a legally binding contract or proof of payment. Private review links expire after seven days and can only be used once.</p>
      </form>
    </section>
  );
}
