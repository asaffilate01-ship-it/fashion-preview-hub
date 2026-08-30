import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import BagLink from "@/components/bag-link";
import { customProductCatalog } from "@/lib/store";
import { journalArticles } from "@/lib/journal";
import { sportCollections } from "@/lib/sports";

export const metadata: Metadata = { title: "Search", description: "Search KALËTHON garments, sports collections and journal guides.", alternates: { canonical: "/search" }, robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const garments = Object.entries(customProductCatalog).filter(([, product]) => !query || product.name.toLowerCase().includes(query));
  const sports = sportCollections.filter((sport) => !query || `${sport.name} ${sport.description} ${sport.products.map((product) => product.name).join(" ")}`.toLowerCase().includes(query));
  const stories = journalArticles.filter((article) => !query || `${article.title} ${article.dek} ${article.category} ${article.keywords.join(" ")}`.toLowerCase().includes(query));
  const resultCount = garments.length + sports.length + stories.length;
  return <main className="search-page">
    <header className="journal-header"><Link className="journal-brand" href="/">KALËTHON</Link><nav><Link href="/#pieces">Shop</Link><Link href="/try-on">Virtual try-on</Link><Link href="/journal">Journal</Link><BagLink /></nav></header>
    <section className="search-heading"><p className="eyebrow">Find your KALËTHON</p><h1>Search garments,<br/><em>sports and stories.</em></h1><form action="/search"><label htmlFor="site-search">What are you looking for?</label><div><input id="site-search" name="q" defaultValue={q} placeholder="Try polo, tennis, sizing…" autoFocus/><button type="submit">Search</button></div></form></section>
    <section className="search-results" aria-live="polite"><p>{query ? `${resultCount} results for “${q}”` : "Browse everything"}</p>
      {resultCount === 0 && <div className="search-empty"><h2>No exact match yet.</h2><p>Try a garment, sport, city or fabric term—or browse the finished collection.</p><Link href="/#pieces">Shop all garments ↗</Link></div>}
      {garments.length > 0 && <div className="search-group"><h2>Garments</h2><div>{garments.map(([id, product]) => <Link href="/#pieces" key={id}><Image src={product.image} alt="" width={164} height={160}/><span><b>{product.name}</b><small>Finished colourways in international sizes</small></span><strong>From £{product.amount / 100}</strong></Link>)}</div></div>}
      {sports.length > 0 && <div className="search-group"><h2>Sports</h2><div>{sports.map((sport) => <Link href={`/sport/${sport.slug}`} key={sport.slug}><Image src={sport.image} alt="" width={164} height={160}/><span><b>{sport.name} clothing</b><small>{sport.eyebrow}</small></span><strong>Explore ↗</strong></Link>)}</div></div>}
      {stories.length > 0 && <div className="search-group"><h2>Journal</h2><div>{stories.map((article) => <Link href={`/journal/${article.slug}`} key={article.slug}><Image src={article.image} alt="" width={164} height={160}/><span><b>{article.title}</b><small>{article.category} · {article.readTime}</small></span><strong>Read ↗</strong></Link>)}</div></div>}
    </section>
  </main>;
}
