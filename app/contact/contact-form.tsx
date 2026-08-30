"use client";

import { useState } from "react";

export default function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Your question could not be sent.");
      setSent(true);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your question could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) return <section className="contact-success" role="status"><span>✓</span><h2>Question received.</h2><p>We will reply from hello@kalethon.com. Keep your order number nearby if your question concerns an order.</p><button type="button" onClick={() => setSent(false)}>Ask another question</button></section>;

  return <form className="contact-form" onSubmit={submit}>
    <div><label>Your name<input name="customerName" autoComplete="name" minLength={2} maxLength={100} required /></label><label>Email address<input name="customerEmail" type="email" autoComplete="email" maxLength={160} required /></label></div>
    <div><label>What can we help with?<select name="subject" defaultValue="Product or sizing question"><option>Product or sizing question</option><option>Order support</option><option>Delivery or returns</option><option>Virtual try-on support</option><option>Press, wholesale or partnership</option></select></label><label>Order number <small>Optional</small><input name="orderNumber" autoComplete="off" maxLength={80} placeholder="KAL-…" /></label></div>
    <label className="contact-message">Your question<textarea name="message" minLength={10} maxLength={4000} rows={7} required /></label>
    <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <button type="submit" disabled={busy}>{busy ? "Sending…" : "Send question"}</button>
    {message && <p className="contact-error" role="alert">{message}</p>}
    <small>By sending this form you agree that KALËTHON may use these details to answer your question. See our privacy policy.</small>
  </form>;
}
