"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CommerceQuestion } from "@/lib/commerce-types";
import {
  calculateTradePrice, MAX_QUOTE_LINES, parseTradePrice,
  type TradePriceLine, type StoredTradePrice, type TradePriceEvent,
} from "@/lib/commercial-quote";
import styles from "./pricing-panel.module.css";

type Register = { prices: StoredTradePrice[]; events: TradePriceEvent[] };
const emptyLine = (): TradePriceLine => ({ description: "Custom teamwear", quantity: 25, unitPricePence: 0, unitCostPence: 0 });
const money = (pence: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);

export default function PricingPanel({ questions }: { questions: CommerceQuestion[] }) {
  const [data, setData] = useState<Register>({ prices: [], events: [] });
  const [quoteQuestionId, setQuoteQuestionId] = useState("");
  const [lines, setLines] = useState<TradePriceLine[]>([emptyLine()]);
  const [shippingPence, setShippingPence] = useState(0);
  const [discountBps, setDiscountBps] = useState(0);
  const [taxRateBps, setTaxRateBps] = useState<0 | 2000>(0);
  const [validUntil, setValidUntil] = useState(() => new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [costReviewed, setCostReviewed] = useState(false);
  const [taxReviewed, setTaxReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/pricing", { cache: "no-store" });
      const body = await response.json() as Register & { message?: string };
      if (!response.ok) throw new Error(body.message || "Trade pricing unavailable.");
      setData(body);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Trade pricing unavailable.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const input = useMemo(() => ({
    quoteQuestionId, lines, shippingPence, discountBps, taxRateBps,
    validUntil, notes, costReviewed, taxReviewed,
  }), [quoteQuestionId, lines, shippingPence, discountBps, taxRateBps, validUntil, notes, costReviewed]);

  const totals = useMemo(() => {
    try { return calculateTradePrice(input); } catch { return null; }
  }, [input]);

  const updateLine = (index: number, patch: Partial<TradePriceLine>) => {
    setLines((old) => old.map((line, i) => i === index ? { ...line, ...patch } : line));
    setCostReviewed(false);
  };
  const post = async (payload: Record<string, unknown>, success: string) => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/pricing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || "Unable to save pricing.");
      setMessage(success);
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save pricing."); }
    finally { setBusy(false); }
  };
  const create = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try { parseTradePrice(input); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Review pricing fields."); return; }
    void post({ action: "create", ...input }, "Draft pricing revision saved. It has not been issued to the customer.");
  };
  const proQuestions = questions.filter((item) => item.subject.startsWith("[PRO QUOTE]"));
  const latest = new Map<string, number>();
  for (const price of data.prices) latest.set(price.quoteQuestionId, Math.max(price.revision, latest.get(price.quoteQuestionId) ?? 0));

  return (
    <section className={styles.workspace} aria-labelledby="pricing-title">
      <header className={styles.heading}>
        <div><p>Team &amp; Pro / Wholesale pricing</p><h2 id="pricing-title">Commercial pricing studio</h2>
          <small>Prepare internal estimates from trade enquiries. No customer invoice, payment or factory release is created.</small></div>
        <button type="button" disabled={busy || loading} onClick={() => void load()}>Refresh pricing</button>
      </header>
      <div className={styles.metrics}>
        <div><strong>{data.prices.length}</strong><span>Saved revisions</span></div>
        <div><strong>{data.prices.filter((p) => p.status === "draft").length}</strong><span>Internal drafts</span></div>
        <div><strong>{data.prices.filter((p) => p.status === "review_ready").length}</strong><span>Ready for internal review</span></div>
      </div>
      <form className={styles.form} onSubmit={create}>
        <h3>01 / Itemised cost estimate</h3>
        <label>Pro quotation enquiry
          <select value={quoteQuestionId} required disabled={busy} onChange={(event) => setQuoteQuestionId(event.target.value)}>
            <option value="">Choose a quotation request</option>
            {proQuestions.map((quote) => <option key={quote.id} value={quote.id}>{quote.customerName} — {quote.subject}</option>)}
          </select>
        </label>
        {quoteQuestionId && <details className={styles.details}>
          <summary>Customer brief</summary><pre>{proQuestions.find((q) => q.id === quoteQuestionId)?.message}</pre>
        </details>}
        {lines.map((line, index) => <fieldset className={styles.line} key={index}>
          <legend>Line {index + 1}</legend>
          <label>Product and service
            <input required minLength={3} maxLength={160} value={line.description} disabled={busy}
              onChange={(event) => updateLine(index, { description: event.target.value })} />
          </label>
          <div className={styles.columns}>
            <label>Quantity
              <input type="number" min={1} max={10000} step={1} value={line.quantity} disabled={busy}
                onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })}/>
            </label>
            <label>Unit price (£)
              <input type="number" min={0} max={100000} step=".01" value={line.unitPricePence / 100} disabled={busy}
                onChange={(event) => updateLine(index, { unitPricePence: Math.round(Number(event.target.value) * 100) })}/>
            </label>
            <label>Unit cost (£) · internal
              <input type="number" min={0} max={100000} step=".01" value={line.unitCostPence / 100} disabled={busy}
                onChange={(event) => updateLine(index, { unitCostPence: Math.round(Number(event.target.value) * 100) })}/>
            </label>
          </div>
          <div className={styles.lineBottom}>
            <strong>Line total: {money(line.unitPricePence * line.quantity)}</strong>
            <button type="button" disabled={busy || lines.length === 1}
              onClick={() => { setLines((current) => current.filter((_, i) => i !== index)); setCostReviewed(false); }}>Remove</button>
          </div>
        </fieldset>)}
        <button type="button" className={styles.secondary} disabled={busy || lines.length >= MAX_QUOTE_LINES}
          onClick={() => { setLines((old) => [...old, { ...emptyLine(), description: "" }]); setCostReviewed(false); }}>
          Add price line (maximum {MAX_QUOTE_LINES})
        </button>
        <div className={styles.columns}>
          <label>Discount (%)
            <input type="number" min={0} max={100} step=".01" value={discountBps / 100} disabled={busy}
              onChange={(event) => { setDiscountBps(Math.round(Number(event.target.value) * 100)); setCostReviewed(false); }}/>
          </label>
          <label>Shipping estimate (£)
            <input type="number" min={0} max={50000} step=".01" value={shippingPence / 100} disabled={busy}
              onChange={(event) => setShippingPence(Math.round(Number(event.target.value) * 100))}/>
          </label>
          <label>Indicative VAT rate
            <select value={taxRateBps} disabled={busy} onChange={(event) => { setTaxRateBps(Number(event.target.value) as 0 | 2000); setTaxReviewed(false); }}>
              <option value={0}>0% — not added</option><option value={2000}>20% — provisional</option>
            </select>
          </label>
        </div>
        <div className={styles.twoColumns}>
          <label>Valid until
            <input type="date" value={validUntil} required disabled={busy} onChange={(event) => setValidUntil(event.target.value)}/>
          </label>
          <label>Internal assumptions
            <textarea value={notes} rows={3} maxLength={1200} disabled={busy}
              onChange={(event) => setNotes(event.target.value)} placeholder="MOQ, material, delivery and exclusions…" />
          </label>
        </div>
        <div className={styles.totals}>
          <h4>Price calculation</h4>
          {totals ? <dl>
            <div><dt>Goods net subtotal</dt><dd>{money(totals.subtotalPence)}</dd></div>
            <div><dt>Discount</dt><dd>−{money(totals.discountPence)}</dd></div>
            <div><dt>Shipping estimate</dt><dd>{money(totals.shippingPence)}</dd></div>
            <div><dt>VAT estimate</dt><dd>{money(totals.taxPence)}</dd></div>
            <div className={styles.total}><dt>Estimated total</dt><dd>{money(totals.totalPence)}</dd></div>
            <div><dt>Merchandise margin, excluding VAT and shipping (internal)</dt><dd>{money(totals.estimatedMarginPence)}</dd></div>
          </dl> : <p>Review quantities, prices and limits to calculate the estimate.</p>}
          {totals && totals.estimatedMarginPence < 0 &&
            <p className={styles.warning}>Estimated merchandise margin is negative.</p>}
        </div>
        <div className={styles.checks}>
          <label><input type="checkbox" checked={costReviewed} disabled={busy}
            onChange={(event) => setCostReviewed(event.target.checked)}/> I have checked costing and quantities.</label>
          <label><input type="checkbox" checked={taxReviewed} disabled={busy}
            onChange={(event) => setTaxReviewed(event.target.checked)}/> I have reviewed the applicable VAT treatment. This is not an invoice.</label>
        </div>
        <button className={styles.primary} type="submit" disabled={busy || loading || !quoteQuestionId || !totals}>
          {busy ? "Saving…" : "Save internal pricing revision"}
        </button>
      </form>
      {message && <p className={styles.feedback} role="status">{message}</p>}
      <section className={styles.register}>
        <h3>02 / Trade pricing register</h3>
        {loading && <p>Loading pricing records…</p>}
        {!loading && data.prices.length === 0 && <p>No internal quotations have been created yet.</p>}
        {data.prices.map((price) => <article className={styles.card} key={price.id}>
          <header><div><small>{price.reference} · Revision {price.revision}</small>
            <h4>{price.customerName}</h4><p>{price.customerEmail}</p></div>
            <span>{price.status.replace(/_/g, " ")}</span></header>
          <div className={styles.cardTotals}>
            <p>Estimated total <b>{money(price.totalPence)}</b></p>
            <p>Internal estimated cost <b>{money(price.costPence)}</b></p>
            <p>Valid until <b>{price.validUntil}</b></p>
          </div>
          <details className={styles.details}><summary>Review lines, notes and audit history</summary>
            <ul>{price.lines.map((line, i) => <li key={i}>{line.quantity} × {line.description}: {money(line.unitPricePence)} each</li>)}</ul>
            <p>{price.notes || "No internal notes supplied."}</p>
            <ol>{data.events.filter((event) => event.priceId === price.id).map((event) =>
              <li key={event.id}>{new Date(event.createdAt).toLocaleString("en-GB")}: {event.actor} — {event.action}. {event.detail}</li>)}</ol>
          </details>
          {price.status === "draft" && price.revision === latest.get(price.quoteQuestionId) &&
            <button className={styles.primary} type="button" disabled={busy}
              onClick={() => void post({ action: "mark_ready", id: price.id },
                "Internal commercial review recorded; not issued to the customer.")}>
              Mark internally reviewed
            </button>}
        </article>)}
      </section>
      <p className={styles.warning}>
        Internal estimates do not create VAT invoices, binding customer offers, customer acceptance, payment requests, or factory dispatch.
      </p>
    </section>
  );
}
