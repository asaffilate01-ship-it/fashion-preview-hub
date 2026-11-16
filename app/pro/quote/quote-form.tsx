"use client";

import { useState } from "react";
import Link from "next/link";
import { proQuoteDepartments, proQuoteBranding, proQuoteTimelines } from "@/lib/pro-quote";
import styles from "./quote.module.css";

type QuoteInitial = { department: string; category: string; product: string };

export default function ProQuoteForm({ initial }: { initial: QuoteInitial }) {
  const [department, setDepartment] = useState(initial.department);
  const [category, setCategory] = useState(initial.category);
  const [product, setProduct] = useState(initial.product);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const currentDepartment = proQuoteDepartments.find((entry) => entry.slug === department) ?? proQuoteDepartments[0];
  const currentCategory = currentDepartment.categories.find((entry) => entry.title === category) ?? currentDepartment.categories[0];

  const changeDepartment = (value: string) => {
    const next = proQuoteDepartments.find((entry) => entry.slug === value);
    if (!next) return;
    setDepartment(next.slug);
    setCategory(next.categories[0].title);
    setProduct("");
    setError("");
  };
  const changeCategory = (value: string) => {
    if (!currentDepartment.categories.some((entry) => entry.title === value)) return;
    setCategory(value);
    setProduct("");
    setError("");
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
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
        }),
      });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || result.ok !== true) {
        throw new Error(result.message || "We couldn't send your request. Please try again.");
      }
      setSent(true);
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
            <input id="quote-quantity" name="quantity" type="number" inputMode="numeric" min="1" max="10000" step="1" defaultValue="25" required />
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
          <textarea id="quote-notes" name="notes" rows={5} maxLength={1500} placeholder="Tell us about your preferred fabrics, logo placement, sizes, artwork or special requirements. Artwork files can be discussed after your enquiry." />
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
