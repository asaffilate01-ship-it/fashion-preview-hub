import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SocialLinks from "@/components/social-links";
import { getSportCollection, sportCollections } from "@/lib/sports";
import SiteNavigation from "@/components/site-navigation";

export function generateStaticParams() {
  return sportCollections.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = getSportCollection(slug);
  if (!collection) return {};
  return {
    title: `${collection.name} Clothing`,
    description: collection.description,
    keywords: collection.keywords,
    alternates: { canonical: `/sport/${collection.slug}` },
    openGraph: { title: `${collection.name} Clothing | KALËTHON`, description: collection.description, url: `/sport/${collection.slug}`, images: [{ url: collection.image }] },
  };
}

export default async function SportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getSportCollection(slug);
  if (!collection) notFound();
  const structuredData = {
    "@context": "https://schema.org", "@type": "CollectionPage", name: `${collection.name} Clothing`,
    description: collection.description, url: `https://kalethon.com/sport/${collection.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: collection.products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          description: product.detail,
          category: product.category,
          image: `https://kalethon.com${collection.image}`,
          brand: { "@type": "Brand", name: "KALËTHON" },
          offers: {
            "@type": "Offer",
            priceCurrency: "GBP",
            price: product.price.replace("£", ""),
            availability: "https://schema.org/PreOrder",
            url: `https://kalethon.com/#pieces`,
          },
        },
      })),
    },
  };
  return <main className="sport-page">
    <SiteNavigation />
    <section className="sport-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(14,15,13,.82), rgba(14,15,13,.16)), url('${collection.image}')` }}>
      <div><p className="eyebrow light">{collection.eyebrow}</p><h1>{collection.name}<br/><em>clothing.</em></h1><p>{collection.description}</p><a className="button button-light" href="#sport-products">Shop the collection <span>↓</span></a></div>
    </section>
    <nav className="sport-switcher" aria-label="Other sports">{sportCollections.map((sport) => <Link className={sport.slug === collection.slug ? "is-active" : ""} href={`/sport/${sport.slug}`} key={sport.slug}>{sport.name}</Link>)}</nav>
    <section className="sport-products" id="sport-products">
      <div className="sport-products-heading"><p className="eyebrow">KALËTHON / {collection.name}</p><h2>Built for the sport.<br/><em>Composed for life.</em></h2></div>
      <div className="sport-product-grid">{collection.products.map((product, index) => <article key={product.name}><span>0{index + 1} / {product.category}</span><div><h3>{product.name}</h3><p>{product.detail}</p></div><strong>{product.price}</strong><Link href="/#pieces">Shop colourways <b>↗</b></Link></article>)}</div>
    </section>
    <section className="sport-next"><p>Other sports that fit KALËTHON</p><h2>Racket sport, golf, running and training are the core. Future edits can add <em>cycling, rowing, yoga and travel athletics</em> once their specialist fits and materials are properly developed.</h2></section>
    <footer className="journal-footer"><Link href="/">KALËTHON</Link><p>Poise in motion.</p><SocialLinks /></footer>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
  </main>;
}
