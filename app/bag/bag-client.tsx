"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBag } from "@/components/bag-provider";
import { formatGBP, unitAmountFor } from "@/lib/store";

export default function BagClient() {
  const { items, ready, removeItem, setQuantity, clear } = useBag();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const subtotal = items.reduce((total, item) => total + (unitAmountFor(item) * item.quantity), 0);

  const checkout = async () => {
    if (!termsAccepted || items.length === 0 || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, termsAccepted, marketingConsent }),
      });
      const data = await response.json();
      if (!response.ok || typeof data.url !== "string") throw new Error(data.message || "Secure checkout could not start.");
      window.location.assign(data.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Secure checkout could not start.");
      setBusy(false);
    }
  };

  if (!ready) return <section className="bag-shell"><p>Preparing your bag…</p></section>;
  if (items.length === 0) return <section className="bag-empty"><span>0</span><h2>Your bag is ready.</h2><p>Choose a finished colourway and size from the collection.</p><Link href="/#pieces">Shop KALËTHON clothing ↗</Link></section>;

  return <section className="bag-shell">
    <div className="bag-items">
      <div className="bag-list-heading"><span>{items.length} design{items.length === 1 ? "" : "s"}</span><button type="button" onClick={clear}>Clear bag</button></div>
      {items.map((item) => <article className="bag-item" key={item.id}>
        <Image src={item.image} alt="" aria-hidden="true" width={300} height={352} unoptimized />
        <div><p>Made to order</p><h2>{item.name}</h2><dl><div><dt>Colour</dt><dd>{item.bodyColour}</dd></div><div><dt>Style</dt><dd>{item.finish}</dd></div><div><dt>Fit / size</dt><dd>{item.fit} / {item.size}</dd></div><div><dt>Sleeve</dt><dd>{item.sleeve}</dd></div><div><dt>Signature</dt><dd>{item.branding}</dd></div></dl><button type="button" onClick={() => removeItem(item.id)}>Remove</button></div>
        <div className="bag-item-price"><strong>{formatGBP(unitAmountFor(item) * item.quantity)}</strong><label>Quantity<select value={item.quantity} onChange={(event) => setQuantity(item.id, Number(event.target.value))}>{[1,2,3,4,5].map((quantity) => <option value={quantity} key={quantity}>{quantity}</option>)}</select></label></div>
      </article>)}
    </div>
    <aside className="bag-summary">
      <p className="eyebrow light">Order summary</p><div><span>Garments</span><b>{formatGBP(subtotal)}</b></div><div><span>UK delivery</span><b>{subtotal >= 15000 ? "Complimentary" : "Calculated at checkout"}</b></div><div className="bag-total"><span>Total</span><strong>{formatGBP(subtotal)}</strong></div>
      <p>Taxes, international delivery and duties are confirmed during checkout.</p>
      <label><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /><span>I have checked every specification and agree to the <Link href="/legal/terms-and-conditions" target="_blank">terms</Link> and <Link href="/legal/returns-and-refunds" target="_blank">personalised-item returns notice</Link>.</span></label>
      <label><input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} /><span>Send me occasional KALËTHON news. Optional.</span></label>
      <button type="button" disabled={!termsAccepted || busy} onClick={checkout}>{busy ? "Opening secure checkout…" : "Continue to secure checkout"}</button>
      {message && <p className="bag-error" role="alert">{message}</p>}
      <small>Secure payment is completed with Stripe. Your selected colourway and size are attached to the order.</small>
    </aside>
  </section>;
}
