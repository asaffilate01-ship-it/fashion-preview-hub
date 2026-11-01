"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBag } from "@/components/bag-provider";
import GarmentColourPreview from "@/components/garment-colour-preview";
import { livePreviewAssets } from "@/lib/garment-preview";
import { formatGBP, unitAmountFor } from "@/lib/store";

export default function BagClient() {
  const { items, ready, removeItem, setQuantity, clear } = useBag();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [checkoutNotice, setCheckoutNotice] = useState("");
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [confirmedPayment, setConfirmedPayment] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState<boolean | null>(null);
  const subtotal = items.reduce((total, item) => total + (unitAmountFor(item) * item.quantity), 0);

  useEffect(() => {
    let active = true;
    void fetch("/api/store-status", { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<{ ordersOpen?: boolean }> : { ordersOpen: false })
      .then((data) => { if (active) setOrdersOpen(data.ordersOpen === true); })
      .catch(() => { if (active) setOrdersOpen(false); });
    return () => { active = false; };
  }, []);

  const verifyPayment = useCallback(async (sessionId: string) => {
    setCheckingPayment(true);
    try {
      const response = await fetch(`/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
      const data = await response.json() as { confirmed?: boolean; message?: string };
      if (!response.ok) throw new Error(data.message || "Payment verification is temporarily unavailable.");
      if (data.confirmed === true) {
        setConfirmedPayment(true);
        setPendingSessionId(null);
        setCheckoutNotice("Your paid KALËTHON order is confirmed. We will email the order details.");
        clear();
        window.history.replaceState({}, "", "/bag");
      } else {
        setCheckoutNotice("Your return from checkout is not yet confirmed as a paid order. If you have paid, please do not repeat checkout. You can recheck here or contact us.");
      }
    } catch {
      setCheckoutNotice("We could not verify the order yet. If you have paid, please do not start a second checkout. Check again or contact us.");
    } finally {
      setCheckingPayment(false);
    }
  }, [clear]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const status = params.get("checkout");
      if (status === "success") {
        const sessionId = params.get("session_id");
        if (!sessionId) {
          setCheckoutNotice("The checkout reference is missing. Please contact us if a payment was taken.");
          return;
        }
        setPendingSessionId(sessionId);
        setCheckoutNotice("Checking your payment and recorded order…");
        void verifyPayment(sessionId);
      } else if (status === "cancelled") {
        setCheckoutNotice("Checkout was cancelled. Your pieces are still in the bag.");
        window.history.replaceState({}, "", "/bag");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [verifyPayment]);

  const checkout = async () => {
    if (!termsAccepted || items.length === 0 || busy || pendingSessionId || ordersOpen !== true) return;
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
  if (items.length === 0) return <section className="bag-empty"><span>0</span>{checkoutNotice && <p className="bag-success" role="status">{checkoutNotice}</p>}<h2>{confirmedPayment ? "Order received." : "Your bag is ready."}</h2><p>{checkoutNotice || "Choose a finished colourway and size from the collection."}</p>{pendingSessionId && <button className="checkout-recheck" type="button" disabled={checkingPayment} onClick={() => void verifyPayment(pendingSessionId)}>{checkingPayment ? "Checking payment…" : "Check payment status"}</button>}<Link href="/#pieces">Shop KALËTHON clothing ↗</Link></section>;

  return <section className="bag-shell">
    <div className="bag-items">
      <div className="bag-list-heading"><span>{items.length} design{items.length === 1 ? "" : "s"}</span><button type="button" onClick={clear}>Clear bag</button></div>
      {items.map((item) => <article className="bag-item" key={item.id}>
        <div className="bag-item-media">{item.previewMode === "photograph" || !livePreviewAssets[item.productId] ? <Image src={item.image} alt={`${item.name} in ${item.bodyColour}`} width={300} height={352} unoptimized /> : <GarmentColourPreview productId={item.productId} name={item.name} bodyColour={item.bodyColour} collarColour={item.collarColour} cuffColour={item.cuffColour} />}</div>
        <div><p>Made to order</p><h2>{item.name}</h2><dl><div><dt>Colour</dt><dd>{item.bodyColour}</dd></div><div><dt>Style</dt><dd>{item.finish}</dd></div><div><dt>Fit / size</dt><dd>{item.fit} / {item.size}</dd></div><div><dt>Sleeve</dt><dd>{item.sleeve}</dd></div><div><dt>Signature</dt><dd>{item.branding}</dd></div></dl><button type="button" onClick={() => removeItem(item.id)}>Remove</button></div>
        <div className="bag-item-price"><strong>{formatGBP(unitAmountFor(item) * item.quantity)}</strong><label>Quantity<select value={item.quantity} onChange={(event) => setQuantity(item.id, Number(event.target.value))}>{[1,2,3,4,5].map((quantity) => <option value={quantity} key={quantity}>{quantity}</option>)}</select></label></div>
      </article>)}
    </div>
    <aside className="bag-summary">
      {checkoutNotice && <p className="bag-success" role="status">{checkoutNotice}</p>}
      {pendingSessionId && <button className="checkout-recheck" type="button" disabled={checkingPayment} onClick={() => void verifyPayment(pendingSessionId)}>{checkingPayment ? "Checking payment…" : "Check payment status"}</button>}
      {ordersOpen === false && <p className="bag-alert" role="status">Online ordering is paused. Your selection remains in this browser; you can <Link href="/contact">contact us about availability</Link>.</p>}
      <p className="eyebrow light">Order summary</p><div><span>Garments</span><b>{formatGBP(subtotal)}</b></div><div><span>UK delivery</span><b>{subtotal >= 15000 ? "Complimentary" : "Calculated at checkout"}</b></div><div className="bag-total"><span>Total</span><strong>{formatGBP(subtotal)}</strong></div>
      <p>Taxes, international delivery and duties are confirmed during checkout.</p>
      <label><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /><span>I have checked every specification and agree to the <Link href="/legal/terms-and-conditions" target="_blank">terms</Link> and <Link href="/legal/returns-and-refunds" target="_blank">personalised-item returns notice</Link>.</span></label>
      <label><input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} /><span>Send me occasional KALËTHON news. Optional.</span></label>
      <button type="button" disabled={!termsAccepted || busy || Boolean(pendingSessionId) || ordersOpen !== true} onClick={checkout}>{busy ? "Opening secure checkout…" : pendingSessionId ? "Payment verification pending" : ordersOpen === false ? "Online ordering paused" : ordersOpen === null ? "Checking checkout availability…" : "Continue to secure checkout"}</button>
      {message && <p className="bag-error" role="alert">{message}</p>}
      <small>Secure payment is completed with Stripe. Your selected colourway and size are attached to the order.</small>
    </aside>
  </section>;
}
