"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { InternalInvoiceWorksheet } from "@/lib/invoice-preparation";
import styles from "./worksheet.module.css";

const money = (pence: number) => new Intl.NumberFormat("en-GB", {
  style: "currency", currency: "GBP",
}).format(pence / 100);

export default function InvoiceWorksheetViewer({ handoverId }: { handoverId: string }) {
  const [worksheet, setWorksheet] = useState<InternalInvoiceWorksheet | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        "/api/admin/handovers/" + encodeURIComponent(handoverId) + "/worksheet",
        { cache: "no-store" },
      );
      const result = await response.json() as { worksheet?: InternalInvoiceWorksheet; message?: string };
      if (!response.ok || !result.worksheet) {
        throw new Error(result.message || "The worksheet is not available.");
      }
      setWorksheet(result.worksheet);
    } catch (error) {
      setWorksheet(null);
      setMessage(error instanceof Error ? error.message : "The worksheet cannot be displayed.");
    } finally {
      setLoading(false);
    }
  }, [handoverId]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <div className={styles.layout}>
      <nav className={styles.toolbar} aria-label="Internal worksheet actions">
        <Link href="/admin">Return to KALËTHON admin</Link>
        <span className={styles.toolbarLabel}>Private / finance preparation</span>
        <div className={styles.actions}>
          <button type="button" onClick={() => void load()} disabled={loading}>Refresh checks</button>
          <button type="button" onClick={() => window.print()} disabled={!worksheet || loading}>
            Print internal worksheet
          </button>
        </div>
      </nav>

      {loading && <p className={styles.loading} role="status">Checking business identity, current quotation and approval readiness…</p>}
      {!loading && message && <section className={styles.blocked} role="alert">
        <h1>Worksheet preparation blocked</h1>
        <p>{message}</p>
        <p>Review the customer handover, tax details and verified seller configuration before retrying.
          No invoice or payment request has been issued.</p>
      </section>}

      {worksheet && !loading && (
        <article className={styles.paper} aria-label="Internal invoice preparation worksheet">
          <div className={styles.watermark} aria-hidden="true">INTERNAL ONLY</div>
          <header className={styles.heading}>
            <div><p className={styles.eyebrow}>KALËTHON / Team &amp; Pro</p>
              <h1>{worksheet.label}</h1>
              <p className={styles.warning}>{worksheet.warning}</p>
            </div>
            <div className={styles.reference}>
              <p><strong>Preparation reference:</strong> {worksheet.reference}</p>
              <p>Source quotation: {worksheet.sourceQuoteReference} · revision {worksheet.sourceQuoteRevision}</p>
              <p>Handover version: {worksheet.preparedFromHandoverVersion}</p>
              <p>Quotation valid until: {worksheet.validUntil}</p>
            </div>
          </header>

          <div className={styles.parties}>
            <section>
              <h2>Seller — verified business details</h2>
              <strong>{worksheet.seller.legalName}</strong>
              <p>{worksheet.seller.registeredAddress}</p>
              <p>{worksheet.seller.country}</p>
              {worksheet.seller.companyNumber && <p>Company reference: {worksheet.seller.companyNumber}</p>}
              {worksheet.seller.vatNumber && <p>VAT identifier (for verification): {worksheet.seller.vatNumber}</p>}
            </section>
            <section>
              <h2>Buyer — billing details</h2>
              <strong>{worksheet.buyer.legalName}</strong>
              <p>{worksheet.buyer.billingAddress}</p>
              <p>{worksheet.buyer.billingCountry}</p>
              <p>{worksheet.buyer.email}</p>
              {worksheet.buyer.purchaseOrderReference && <p>Buyer PO: {worksheet.buyer.purchaseOrderReference}</p>}
            </section>
          </div>

          {worksheet.buyer.deliveryAddress && (
            <section className={styles.delivery}>
              <h2>Proposed delivery destination</h2>
              <p>{worksheet.buyer.deliveryAddress}</p>
            </section>
          )}

          <section className={styles.items} aria-labelledby="line-items-heading">
            <h2 id="line-items-heading">Customer-accepted quotation summary</h2>
            <div className={styles.scroll}>
              <table>
                <thead><tr><th scope="col">Product / service</th><th scope="col">Qty</th>
                  <th scope="col">Unit price</th><th scope="col">Line amount</th></tr></thead>
                <tbody>
                  {worksheet.lines.map((line, i) => <tr key={i}>
                    <td>{line.description}</td><td>{line.quantity}</td><td>{money(line.unitPricePence)}</td>
                    <td>{money(line.lineTotalPence)}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <dl className={styles.totals}>
              <div><dt>Net goods subtotal</dt><dd>{money(worksheet.subtotalPence)}</dd></div>
              <div><dt>Accepted quotation discount</dt><dd>−{money(worksheet.discountPence)}</dd></div>
              <div><dt>Estimated shipping</dt><dd>{money(worksheet.shippingPence)}</dd></div>
              <div><dt>Indicative VAT — requires final tax validation</dt><dd>{money(worksheet.estimatedVatPence)}</dd></div>
              <div className={styles.grand}><dt>Estimated quotation total</dt><dd>{money(worksheet.estimatedTotalPence)}</dd></div>
              <div><dt>Illustrative agreed-deposit percentage amount</dt><dd>{money(worksheet.illustrativeDepositPence)}</dd></div>
              <div><dt>Illustrative remaining balance</dt><dd>{money(worksheet.illustrativeBalancePence)}</dd></div>
            </dl>
          </section>
          <footer className={styles.footer}>
            <strong>Internal preparation document — not an invoice.</strong>
            <p>This worksheet is generated from an accepted but still valid quotation and manually reviewed billing information.
              It does not represent a VAT invoice, proof of payment, permission to charge a card or authorisation to dispatch a factory job.
              An actual invoice requires business approval, correct tax treatment, a distinct sequential invoice number and the approved payment workflow.</p>
          </footer>
        </article>
      )}
    </div>
  );
}
