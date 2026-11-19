"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./quotation.module.css";

export default function TradeDecisionForm({ token }: { token: string }) {
  const [decision, setDecision] = useState<"accept" | "changes">("changes");
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/pro/quotation/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          token, decision, customerName: values.customerName,
          customerEmail: values.customerEmail, message: values.message ?? "",
          confirmPrice: decision === "accept" && checked,
        }),
      });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || result.ok !== true) {
        throw new Error(result.message || "We could not record your response.");
      }
      setReceipt(decision === "accept"
        ? "Your quotation acceptance has been recorded for review. KALËTHON must still separately confirm the order, payment method, delivery and manufacturing details."
        : "Your requested changes have been recorded. Our team will review them and prepare an updated quotation where appropriate.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not record your response.");
    } finally {
      setBusy(false);
    }
  };

  if (receipt) return (
    <section className={styles.response} role="status">
      <span className={styles.tick} aria-hidden="true">✓</span>
      <h2>Response recorded</h2>
      <p>{receipt}</p>
      <p>This quotation link is now closed for further responses. For questions, contact KALËTHON.</p>
      <Link href="/contact">Contact customer service</Link>
    </section>
  );

  return (
    <section className={styles.response} aria-labelledby="response-heading">
      <p className={styles.kicker}>Your response</p>
      <h2 id="response-heading">Accept or request changes</h2>
      <p>Use the email address from your original enquiry. We record your response against this exact pricing revision.</p>
      <form onSubmit={submit}>
        <fieldset className={styles.options}>
          <legend>How would you like to proceed?</legend>
          <label><input type="radio" name="decision" value="changes" checked={decision === "changes"}
            onChange={() => { setDecision("changes"); setChecked(false); }} />
            <span>Request pricing or specification changes</span></label>
          <label><input type="radio" name="decision" value="accept" checked={decision === "accept"}
            onChange={() => setDecision("accept")} />
            <span>Accept this quotation for the next step</span></label>
        </fieldset>
        <label className={styles.field}>Full name
          <input name="customerName" minLength={2} maxLength={100} autoComplete="name" required />
        </label>
        <label className={styles.field}>Email used for the quotation
          <input type="email" name="customerEmail" maxLength={160} autoComplete="email" required />
        </label>
        <label className={styles.field}>{decision === "changes" ? "Changes requested" : "Optional comments"}
          <textarea name="message" rows={5} maxLength={600}
            minLength={decision === "changes" ? 10 : undefined}
            required={decision === "changes"}
            placeholder={decision === "changes" ? "Describe the items, quantities, pricing or delivery changes needed." : "Any final comments for our commercial team"} />
        </label>
        {decision === "accept" && <label className={styles.confirm}>
          <input type="checkbox" checked={checked} required onChange={(event) => setChecked(event.target.checked)} />
          <span>I have reviewed the line prices, quantities, VAT estimate, total and expiry. I understand this records
            quotation acceptance in principle only; it does not authorise payment or start an order or manufacture.</span>
        </label>}
        <button className={styles.submit} type="submit" disabled={busy || (decision === "accept" && !checked)}>
          {busy ? "Saving your decision…" : decision === "accept" ? "Record my quotation acceptance" : "Send change request"}
        </button>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <p className={styles.helper}>No payment is taken. A confirmed order requires separate written arrangements.
          The private link is single-use and expires automatically.</p>
      </form>
    </section>
  );
}
