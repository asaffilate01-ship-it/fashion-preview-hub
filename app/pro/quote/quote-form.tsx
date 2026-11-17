"use client";

import { useEffect, useState } from "react";
import { TEAM_ROSTER_SESSION_KEY, validateTeamRoster, teamRosterSizeSummary, teamRosterTotal, type TeamRosterEntry } from "@/lib/team-roster";
import Link from "next/link";
import { proQuoteDepartments, proQuoteBranding, proQuoteTimelines } from "@/lib/pro-quote";
import styles from "./quote.module.css";

type QuoteInitial = { department: string; category: string; product: string; quantity?: number; notes?: string; rosterExpected?: boolean };

export default function ProQuoteForm({ initial }: { initial: QuoteInitial }) {
  const [department, setDepartment] = useState(initial.department);
  const [category, setCategory] = useState(initial.category);
  const [product, setProduct] = useState(initial.product);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [roster, setRoster] = useState<TeamRosterEntry[]>([]);
  const [rosterRequired, setRosterRequired] = useState(Boolean(initial.rosterExpected));
  const [rosterMessage, setRosterMessage] = useState(initial.rosterExpected ? "Loading the roster from this browser…" : "");

  useEffect(() => {
    if (!initial.rosterExpected) return;
    const timer = window.setTimeout(() => {
      try {
        const raw = window.sessionStorage.getItem(TEAM_ROSTER_SESSION_KEY);
        if (!raw) throw new Error("Player roster not found in this tab. Return to the kit designer to attach it.");
        const entry = JSON.parse(raw) as { savedAt?: number; roster?: unknown };
        if (!Number.isFinite(entry.savedAt) || Date.now() - Number(entry.savedAt) > 2 * 60 * 60 * 1000) {
          throw new Error("The temporary player roster has expired. Return to the designer to attach it again.");
        }
        const imported = validateTeamRoster(entry.roster);
        if (!imported.length) throw new Error("The attached roster is empty. Return to the designer or continue without it.");
        setRoster(imported);
        setRosterMessage(`${imported.length} player entries are attached from this browser. Check the quantity before sending.`);
      } catch (reason) {
        setRoster([]);
        setRosterMessage(reason instanceof Error ? reason.message : "Unable to load the player roster.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initial.rosterExpected]);

  const currentDepartment = proQuoteDepartments.find((entry) => entry.slug === department) ?? proQuoteDepartments[0];
  const currentCategory = currentDepartment.categories.find((entry) => entry.title === category) ?? currentDepartment.categories[0];

  const changeDepartment = (value: string) => {
    const next = proQuoteDepartments.find((entry) => entry.slug === value);
    if (!next) return;
    setDepartment(next.slug);
    setCategory(next.categories[0].title);
    setProduct("");
    setError("");
    if (next.slug !== "team-pro") {
      setRoster([]);
      setRosterRequired(false);
      setRosterMessage("Player roster removed because this is not a Team & Pro kit enquiry.");
    }
  };
  const changeCategory = (value: string) => {
    if (!currentDepartment.categories.some((entry) => entry.title === value)) return;
    setCategory(value);
    setProduct("");
    setError("");
    if (currentDepartment.slug !== "team-pro" || value !== "Team kits") {
      setRoster([]);
      setRosterRequired(false);
      setRosterMessage("Player roster removed because the category changed.");
    }
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (rosterRequired && roster.length === 0) {
      setError("The kit roster must be reattached from the designer or explicitly removed before submitting.");
      return;
    }
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      const values = Object.fromEntries(new FormData(form).entries());
      const response = await fetch("/api/pro/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          department,
          category: currentCategory.title,
          product,
          quantity: Number(values.quantity),
          privacyAcknowledged: values.privacyAcknowledged === "on",
          roster: roster.length && department === "team-pro" && currentCategory.title === "Team kits" ? roster : undefined,
        }),
      });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || result.ok !== true) {
        throw new Error(result.message || "We couldn't send your request. Please try again.");
      }
      setSent(true);
      try { window.sessionStorage.removeItem(TEAM_ROSTER_SESSION_KEY); } catch { /* private mode may block storage */ }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We couldn't send your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) return (
    <section className={styles.success} role="status">
      <span className={styles.successIcon} aria-hidden="true">✓</span>
      <h3>Enquiry received.</h3>
      <p>Your request has been submitted for review. This is not a quotation, confirmed order or payment. Our team can contact you with the next steps.</p>
      <button type="button" onClick={() => setSent(false)}>Start another enquiry</button>
      <Link href={`/collections/${department}`}>Return to {currentDepartment.title}</Link>
    </section>
  );

  return (
    <form className={styles.form} onSubmit={submit}>
      <fieldset>
        <legend>01 / The product</legend>
        <div className={styles.twoCols}>
          <label htmlFor="quote-department">Collection
            <select id="quote-department" name="department" value={department} onChange={(e) => changeDepartment(e.target.value)} required>
              {proQuoteDepartments.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.title}</option>)}
            </select>
          </label>
          <label htmlFor="quote-category">Category
            <select id="quote-category" name="category" value={currentCategory.title} onChange={(e) => changeCategory(e.target.value)} required>
              {currentDepartment.categories.map((entry) => <option key={entry.title} value={entry.title}>{entry.title}</option>)}
            </select>
          </label>
        </div>
        <label htmlFor="quote-product">Product or service
          <select id="quote-product" name="product" value={product} onChange={(e) => setProduct(e.target.value)}>
            <option value="">Please advise / not decided</option>
            {currentCategory.products.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <div className={styles.twoCols}>
          <label htmlFor="quote-quantity">Estimated quantity
            <input id="quote-quantity" name="quantity" type="number" inputMode="numeric" min="1" max="10000" step="1" defaultValue={initial.quantity ?? 25} required />
          </label>
          <label htmlFor="quote-branding">Branding or customisation
            <select id="quote-branding" name="branding" defaultValue="Not decided">
              {proQuoteBranding.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
        </div>
        <label htmlFor="quote-timeline">When do you need it?
          <select id="quote-timeline" name="timeline" defaultValue="Exploring options">
            {proQuoteTimelines.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
      </fieldset>

      {(rosterRequired || roster.length > 0 || Boolean(rosterMessage)) && (
        <section className={styles.attachedRoster} aria-label="Team roster handoff">
          <h3>Player roster</h3>
          <p role="status" aria-live="polite">{rosterMessage}</p>
          {roster.length > 0 && (
            <>
              <p><strong>{roster.length} player entries · {teamRosterTotal(roster)} assigned kits</strong></p>
              <p>Sizes: {teamRosterSizeSummary(roster)}</p>
              <ul>{roster.slice(0, 8).map((row, index) => (
                <li key={index}>{row.name} · #{row.number} · {row.size} × {row.quantity}</li>
              ))}</ul>
              {roster.length > 8 && <p>Plus {roster.length - 8} more player entries included in the quotation.</p>}
            </>
          )}
          <p>Player details are sent only when you submit this quotation request. They are not included in its URL.</p>
          <div className={styles.rosterHandoffActions}>
            <Link href="/pro/designer">Edit roster in the designer</Link>
            <button type="button" onClick={() => {
              setRoster([]);
              setRosterRequired(false);
              setRosterMessage("Player roster removed from this quotation.");
              try { window.sessionStorage.removeItem(TEAM_ROSTER_SESSION_KEY); } catch { /* blocked storage */ }
            }}>Continue without player roster</button>
          </div>
        </section>
      )}

      <fieldset>
        <legend>02 / Your details</legend>
        <div className={styles.twoCols}>
          <label htmlFor="quote-name">Your name
            <input id="quote-name" name="customerName" type="text" autoComplete="name" minLength={2} maxLength={100} required />
          </label>
          <label htmlFor="quote-email">Email address
            <input id="quote-email" name="customerEmail" type="email" autoComplete="email" maxLength={160} required />
          </label>
        </div>
        <div className={styles.twoCols}>
          <label htmlFor="quote-organisation">Club, business or organisation <small>Optional</small>
            <input id="quote-organisation" name="organisation" type="text" maxLength={120} autoComplete="organization" />
          </label>
          <label htmlFor="quote-phone">Telephone / WhatsApp <small>Optional</small>
            <input id="quote-phone" name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="+44 …" />
          </label>
        </div>
        <label htmlFor="quote-country">Destination country <small>Optional</small>
          <input id="quote-country" name="country" type="text" autoComplete="country-name" maxLength={80} placeholder="Where would the goods be delivered?" />
        </label>
      </fieldset>

      <fieldset>
        <legend>03 / Requirements</legend>
        <label htmlFor="quote-notes">Colours, materials, club crest, personalisation and other details <small>Optional</small>
          <textarea id="quote-notes" name="notes" rows={8} maxLength={1500} defaultValue={initial.notes ?? ""} placeholder="Tell us about your preferred fabrics, logo placement, sizes, artwork or special requirements. Artwork files can be discussed after your enquiry." />
        </label>
        <label className={styles.check} htmlFor="quote-privacy">
          <input id="quote-privacy" type="checkbox" name="privacyAcknowledged" required />
          <span>I have read the <Link href="/legal/privacy-policy" target="_blank">privacy notice</Link> and understand that my details will be used to respond to this enquiry.</span>
        </label>
        <div className={styles.honeypot} aria-hidden="true">
          <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>
      </fieldset>

      <button className={styles.submit} type="submit" disabled={busy}>{busy ? "Submitting your enquiry…" : "Submit quotation enquiry"}</button>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <p className={styles.disclaimer}>No payment is taken. Submitting an enquiry does not guarantee stock, manufacturing acceptance, availability or a delivery date.</p>
    </form>
  );
}
