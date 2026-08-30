import type { Metadata } from "next";
import Link from "next/link";
import { regions, regionGroups } from "@/lib/regions";
import SocialLinks from "@/components/social-links";
import BagLink from "@/components/bag-link";

export const metadata: Metadata = {
  title: "Where We Deliver | UK, Europe, USA & UAE",
  description: "KALËTHON premium British sport-to-city clothing ships across the UK, all of Europe, key US cities and the UAE. Find delivery times, duties and local sizing guidance.",
  keywords: ["British sportswear delivery", "sportswear UK Europe USA UAE", "premium sportswear shipping", "tennis clothing international delivery"],
  alternates: { canonical: "/delivery-to" },
  openGraph: {
    title: "Where KALËTHON Delivers | UK, Europe, USA & UAE",
    description: "Delivery times, duties and local guidance for KALËTHON across the UK, Europe, the United States and the UAE.",
    url: "/delivery-to",
    images: ["/og.jpg"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Where KALËTHON delivers",
  url: "https://kalethon.com/delivery-to",
  description: "KALËTHON delivery markets across the United Kingdom, Europe, the United States and the United Arab Emirates.",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: regions.map((region, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: region.name,
      url: `https://kalethon.com/delivery-to/${region.slug}`,
    })),
  },
};

export default function DeliveryHub() {
  return <main className="legal-page">
    <header className="journal-header"><Link className="journal-brand" href="/">KALËTHON</Link><nav><Link href="/#pieces">Shop</Link><Link href="/try-on">Virtual try-on</Link><Link href="/measurements">Measurements</Link><BagLink /></nav></header>
    <section className="legal-index">
      <p className="eyebrow">Delivery / Markets</p>
      <h1>Made in Britain.<br /><em>Worn everywhere.</em></h1>
      <p>KALËTHON ships from the United Kingdom to all of Europe, the United States and the United Arab Emirates. Choose your market for delivery times, duties and local wear notes.</p>
      {regionGroups.map((group) => {
        const list = regions.filter((region) => region.market === group.market);
        if (!list.length) return null;
        return <div key={group.market}>
          <h2 className="eyebrow" style={{ marginTop: "2.5rem" }}>{group.label}</h2>
          <div className="legal-grid">
            {list.map((region, index) => <Link href={`/delivery-to/${region.slug}`} key={region.slug}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{region.name}</h2>
              <p>{region.delivery}.</p>
            </Link>)}
          </div>
        </div>;
      })}
    </section>
    <footer className="journal-footer"><Link href="/">KALËTHON</Link><p>Poise in motion.</p><SocialLinks /></footer>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
  </main>;
}
