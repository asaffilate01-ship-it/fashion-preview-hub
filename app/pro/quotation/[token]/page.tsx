import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNavigation from "@/components/site-navigation";
import { getCustomerTradeReview } from "@/db/trade-review";
import TradeDecisionForm from "./trade-decision-form";
import styles from "./quotation.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Private Wholesale Quotation Review",
  description: "Private KALËTHON Team & Pro commercial price review.",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

const gbp = (pence: number) => new Intl.NumberFormat("en-GB", {
  style: "currency", currency: "GBP",
}).format(pence / 100);

export default async function CustomerQuotationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = await getCustomerTradeReview(token);
  if (!quote) notFound();

  return (
    <main className={styles.page}>
      <SiteNavigation />
      <div className={styles.layout}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">KALËTHON</Link><span aria-hidden="true">/</span><span>Private quotation</span>
        </nav>
        <div className={styles.intro}>
          <p className={styles.kicker}>KALËTHON / Team &amp; Pro</p>
          <h1>Review your <em>quotation.</em></h1>
          <p>The pricing below is the reviewed estimate prepared for your enquiry. Please check each line, quantity and total carefully before responding.</p>
        </div>
        <div className={styles.columns}>
          <article className={styles.quote} aria-labelledby="quotation-title">
            <div className={styles.meta}>
              <span>{quote.reference} · Revision {quote.revision}</span>
              <span>Valid until {new Date(quote.validUntil + "T12:00:00Z").toLocaleDateString("en-GB", {
                timeZone: "UTC", day: "numeric", month: "long", year: "numeric",
              })}</span>
            </div>
            <h2 id="quotation-title">Your KALËTHON estimate</h2>
            <p className={styles.customer}>Prepared for {quote.customerName}</p>
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th scope="col">Product / service</th><th scope="col">Qty</th>
                  <th scope="col">Unit</th><th scope="col">Amount</th></tr></thead>
                <tbody>
                  {quote.lines.map((line, index) => <tr key={index}>
                    <td>{line.description}</td><td>{line.quantity}</td><td>{gbp(line.unitPricePence)}</td>
                    <td>{gbp(line.lineTotalPence)}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <dl className={styles.totals}>
              <div><dt>Goods subtotal</dt><dd>{gbp(quote.subtotalPence)}</dd></div>
              <div><dt>Discount</dt><dd>−{gbp(quote.discountPence)}</dd></div>
              <div><dt>Estimated delivery</dt><dd>{gbp(quote.shippingPence)}</dd></div>
              <div><dt>Indicative VAT (subject to confirmation)</dt><dd>{gbp(quote.taxPence)}</dd></div>
              <div className={styles.grand}><dt>Estimated total</dt><dd>{gbp(quote.totalPence)}</dd></div>
            </dl>
            <p className={styles.terms}>This is a commercial quotation for discussion, not a VAT invoice,
              payment request or order confirmation. Prices, shipping, applicable tax and lead times are subject to
              formal written confirmation. No payment is taken on this page and manufacturing does not begin here.</p>
            <p className={styles.expiry}>Private response link expires {new Date(quote.expiresAt).toLocaleDateString("en-GB", {
              timeZone: "UTC", day: "numeric", month: "long", year: "numeric",
            })} or when this quotation is superseded.</p>
          </article>
          <TradeDecisionForm token={token} />
        </div>
      </div>
    </main>
  );
}
