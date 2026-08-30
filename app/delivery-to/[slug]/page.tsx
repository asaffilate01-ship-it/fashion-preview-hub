import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SocialLinks from "@/components/social-links";
import BagLink from "@/components/bag-link";
import { getRegion, regions } from "@/lib/regions";
import { sportCollections } from "@/lib/sports";

export function generateStaticParams() {
  return regions.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const region = getRegion(slug);
  if (!region) return {};
  const title = `Premium Sportswear in ${region.name}`;
  const description = `KALËTHON premium British sport-to-city clothing delivered to ${region.name}. ${region.delivery}. International sizing and private virtual try-on.`;
  return {
    title,
    description: description.slice(0, 158),
    keywords: region.keywords,
    alternates: { canonical: `/delivery-to/${region.slug}` },
    openGraph: {
      title: `${title} | KALËTHON`,
      description: description.slice(0, 158),
      url: `/delivery-to/${region.slug}`,
      images: ["/og.jpg"],
    },
    twitter: { card: "summary_large_image", title: `${title} | KALËTHON`, description: description.slice(0, 158), images: ["/og.jpg"] },
  };
}

export default async function RegionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const region = getRegion(slug);
  if (!region) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `https://kalethon.com/delivery-to/${region.slug}`,
        name: `Premium sportswear in ${region.name} | KALËTHON`,
        description: region.intro,
        isPartOf: { "@id": "https://kalethon.com/#website" },
      },
      {
        "@type": "Organization",
        "@id": "https://kalethon.com/#organization",
        name: "KALËTHON",
        url: "https://kalethon.com",
        areaServed: { "@type": "Place", name: region.name },
        email: "hello@kalethon.com",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://kalethon.com" },
          { "@type": "ListItem", position: 2, name: "Delivery", item: "https://kalethon.com/delivery-to" },
          { "@type": "ListItem", position: 3, name: region.name, item: `https://kalethon.com/delivery-to/${region.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: `Does KALËTHON deliver to ${region.name}?`, acceptedAnswer: { "@type": "Answer", text: `Yes. ${region.delivery}.` } },
          { "@type": "Question", name: `Are duties or taxes charged in ${region.name}?`, acceptedAnswer: { "@type": "Answer", text: region.duties } },
          { "@type": "Question", name: `What currency are prices shown in for ${region.name}?`, acceptedAnswer: { "@type": "Answer", text: region.currency } },
        ],
      },
    ],
  };

  return <main className="sport-page">
    <header className="journal-header"><Link className="journal-brand" href="/">KALËTHON</Link><nav><Link href="/#pieces">Shop</Link><Link href="/try-on">Virtual try-on</Link><Link href="/measurements">Measurements</Link><Link href="/journal">Journal</Link><BagLink /></nav></header>
    <section className="sport-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(14,15,13,.86), rgba(14,15,13,.22)), url('/collections/tennis.jpg')` }}>
      <div>
        <p className="eyebrow light">KALËTHON delivers to {region.market}</p>
        <h1>Premium sportswear<br /><em>in {region.name}.</em></h1>
        <p>{region.intro}</p>
        <a className="button button-light" href="#region-detail">Delivery &amp; sizing <span>↓</span></a>
      </div>
    </section>
    <nav className="sport-switcher" aria-label="Other delivery markets">
      <Link href="/delivery-to">All markets</Link>
      {regions.filter((item) => item.market === region.market).map((item) => <Link className={item.slug === region.slug ? "is-active" : ""} href={`/delivery-to/${item.slug}`} key={item.slug}>{item.name}</Link>)}
    </nav>
    <section className="sport-products" id="region-detail">
      <div className="sport-products-heading">
        <p className="eyebrow">KALËTHON / {region.name}</p>
        <h2>Delivered to {region.name}.<br /><em>Sized for you.</em></h2>
      </div>
      <div className="sport-product-grid">
        <article><span>01 / Delivery</span><div><h3>Shipping</h3><p>{region.delivery}.</p></div><Link href="/legal/delivery">Delivery policy <b>↗</b></Link></article>
        <article><span>02 / Duties</span><div><h3>Taxes &amp; duties</h3><p>{region.duties}.</p></div><Link href="/legal/terms-and-conditions">Terms <b>↗</b></Link></article>
        <article><span>03 / Pricing</span><div><h3>Currency</h3><p>{region.currency}.</p></div><Link href="/#pieces">Shop colourways <b>↗</b></Link></article>
        <article><span>04 / Fit</span><div><h3>International sizing</h3><p>UK, US and EU size conversions with body measurements in centimetres and inches.</p></div><Link href="/measurements">Size guide <b>↗</b></Link></article>
        <article><span>05 / Preview</span><div><h3>Virtual viewing room</h3><p>See a piece on your own portrait before ordering from {region.name}.</p></div><Link href="/try-on">Virtual try-on <b>↗</b></Link></article>
        <article><span>06 / Support</span><div><h3>Client service</h3><p>Questions about fit, delivery or an order are answered within two working days.</p></div><Link href="/contact">Contact <b>↗</b></Link></article>
      </div>
    </section>
    <section className="sport-next">
      <p>How KALËTHON is worn in {region.name}</p>
      <h2>{region.scene}</h2>
    </section>
    <section className="sport-products">
      <div className="sport-products-heading"><p className="eyebrow">Shop by sport</p><h2>Collections shipping to<br /><em>{region.name}.</em></h2></div>
      <nav className="sport-switcher" aria-label="Sport collections">{sportCollections.map((sport) => <Link href={`/sport/${sport.slug}`} key={sport.slug}>{sport.name}</Link>)}</nav>
      {region.clubs.length > 0 && <p style={{ maxWidth: "48rem", marginTop: "1.5rem" }}>Popular with clients in {region.clubs.join(", ")}.</p>}
    </section>
    <footer className="journal-footer"><Link href="/">KALËTHON</Link><p>Poise in motion.</p><SocialLinks /></footer>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
  </main>;
}
