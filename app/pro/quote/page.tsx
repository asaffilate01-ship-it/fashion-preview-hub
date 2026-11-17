import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteNavigation from "@/components/site-navigation";
import { getProQuoteSelection } from "@/lib/pro-quote";
import { teamDesignQuotePrefill } from "@/lib/team-designer";
import ProQuoteForm from "./quote-form";
import styles from "./quote.module.css";

export const metadata: Metadata = {
  title: "Custom & Wholesale Enquiries",
  description: "Discuss KALËTHON professional team kits, sublimation, combat equipment, luxury leather goods and wholesale apparel.",
  alternates: { canonical: "/pro/quote" },
};

type Params = Record<string, string | string[] | undefined>;
const single = (value: string | string[] | undefined) => typeof value === "string" ? value.slice(0, 150) : undefined;

export default async function QuotePage({ searchParams }: { searchParams: Promise<Params> }) {
  const query = await searchParams;
  const kitDesign = teamDesignQuotePrefill(query);
  const initial = {
    ...getProQuoteSelection({
      department: single(query.department),
      category: single(query.category),
      product: single(query.product),
    }),
    quantity: kitDesign?.quantity ?? 25,
    notes: kitDesign?.notes ?? "",
    rosterExpected: kitDesign?.rosterExpected ?? false,
  };

  return (
    <main className={styles.page}>
      <SiteNavigation />
      <div className={styles.breadcrumb}>
        <Link href="/">KALËTHON</Link><span aria-hidden="true">/</span><Link href="/collections/team-pro">Team & Pro</Link><span aria-hidden="true">/</span><span>Enquiries</span>
      </div>
      <div className={styles.shell}>
        <aside className={styles.story}>
          <p className={styles.kicker}>KALËTHON / Private clients & professional orders</p>
          <h1>Made for <em>your brief.</em></h1>
          <p className={styles.lead}>Specialist kit, combat equipment, fine leather goods and club apparel — made personal through a considered design and quotation process.</p>
          <div className={styles.photo}>
            <Image src="/editorial/team-design.svg" alt="Original illustration of a customised teamwear design" fill sizes="(max-width: 950px) 100vw, 40vw" unoptimized />
          </div>
          <p className={styles.caption}>Illustrated design concept, not a photograph of manufactured goods.</p>
          <div className={styles.guidance}>
            <h2>How enquiries work</h2>
            <ol>
              <li><strong>Share your requirements.</strong> Select the range, estimated quantity and branding preferences.</li>
              <li><strong>We review feasibility.</strong> Materials, customisation, pricing and lead times are confirmed individually.</li>
              <li><strong>Approve before ordering.</strong> No order, charge or manufacturing commitment is created by this form.</li>
            </ol>
          </div>
        </aside>
        <div className={styles.formPanel}>
          <p className={styles.kicker}>Your enquiry</p>
          <h2>Request a quotation</h2>
          <p>For clubs, academies, retailers, teams, corporate customers and personal commissions. Product availability and minimum quantities are assessed individually.</p>
          <ProQuoteForm initial={initial} />
        </div>
      </div>
    </main>
  );
}
