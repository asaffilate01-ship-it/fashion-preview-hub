import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SiteNavigation from "@/components/site-navigation";
import { customProductCatalog } from "@/lib/store";
import { journalArticles } from "@/lib/journal";
import { sportCollections } from "@/lib/sports";
import { kalethonDepartments } from "@/lib/kalethon-departments";

export const metadata: Metadata = { title: "Search", description: "Search KALËTHON luxury collections, garments, sports and journal guides.", alternates: { canonical: "/search" }, robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const safeQuery = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const query = safeQuery.toLowerCase();
  const hiddenGarmentIds = new Set(["performance-tank", "track-jacket"]);
  const garments = Object.entries(customProductCatalog).filter(([id, product]) => !hiddenGarmentIds.has(id) && (!query || product.name.toLowerCase().includes(query)));
  const sports = sportCollections.filter((sport) => !query || `${sport.name} ${sport.description} ${sport.products.map((product) => product.name).join(" ")}`.toLowerCase().includes(query));
  const stories = journalArticles.filter((article) => !query || `${article.title} ${article.dek} ${article.category} ${article.keywords.join(" ")}`.toLowerCase().includes(query));
  const departments = kalethonDepartments.filter((department) =>
    !query || [department.title, department.kicker, department.description, ...department.categories.flatMap((category) => [category.title, ...category.products])].join(" ").toLowerCase().includes(query)
  );
  const productAnchors: Record<string, string> = {
    "court-polo": "court-polo-bone", "casual-polo": "casual-contrast-polo",
    "golf-polo": "links-golf-polo", "tennis-polo": "baseline-tennis-polo",
    "performance-tee": "performance-tee-ink", "poise-hoodie": "poise-hoodie-bone",
    "club-zip-hoodie": "club-zip-hoodie", "motion-jogger": "motion-jogger-stone",
    "club-tracksuit": "club-tracksuit-ink", "court-short": "court-short-navy",
    "court-skirt": "court-skirt-oxblood",
  };
  const resultCount = garments.length + sports.length + stories.length + departments.length;
  return <main className="search-page">
    <SiteNavigation />
    <section className="search-heading"><p className="eyebrow">Find your KALËTHON</p><h1>Search fashion,<br/><em>sport and leather.</em></h1><form action="/search"><label htmlFor="site-search">What are you looking for?</label><div><input id="site-search" name="q" defaultValue={safeQuery} placeholder="Try hoodies, leather bags, boxing, cricket…" autoFocus/><button type="submit">Search</button></div></form></section>
    <section className="search-results" aria-live="polite"><p>{query ? `${resultCount} results for “${safeQuery}”` : "Browse everything"}</p>
      {resultCount === 0 && <div className="search-empty"><h2>No exact match yet.</h2><p>Try a garment, sport, city or fabric term—or browse the finished collection.</p><Link href="/#pieces">Shop all garments ↗</Link></div>}
      {departments.length > 0 && <div className="search-group"><h2>Collections</h2><div>{departments.map((department) => (
        <Link href={`/collections/${department.slug}`} key={department.slug}>
          <span><b>{department.title}</b><small>{department.kicker} · {department.categories.map((category) => category.title).join(" / ")}</small></span>
          <strong>Explore ↗</strong>
        </Link>
      ))}</div></div>}
      {garments.length > 0 && <div className="search-group"><h2>Garments</h2><div>{garments.map(([id, product]) => <Link href={productAnchors[id] ? `/#product-${productAnchors[id]}` : "/#pieces"} key={id}><Image src={product.image} alt="" width={164} height={160} unoptimized/><span><b>{product.name}</b><small>Finished colourways in international sizes</small></span><strong>From £{product.amount / 100}</strong></Link>)}</div></div>}
      {sports.length > 0 && <div className="search-group"><h2>Sports</h2><div>{sports.map((sport) => <Link href={`/sport/${sport.slug}`} key={sport.slug}><Image src={sport.image} alt="" width={164} height={160} unoptimized/><span><b>{sport.name} clothing</b><small>{sport.eyebrow}</small></span><strong>Explore ↗</strong></Link>)}</div></div>}
      {stories.length > 0 && <div className="search-group"><h2>Journal</h2><div>{stories.map((article) => <Link href={`/journal/${article.slug}`} key={article.slug}><Image src={article.image} alt="" width={164} height={160} unoptimized/><span><b>{article.title}</b><small>{article.category} · {article.readTime}</small></span><strong>Read ↗</strong></Link>)}</div></div>}
    </section>
  </main>;
}
