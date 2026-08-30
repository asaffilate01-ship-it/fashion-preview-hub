import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getJournalArticle, journalArticles } from "@/lib/journal";
import ShareButtons from "../share-buttons";
import BagLink from "@/components/bag-link";

export function generateStaticParams() {
  return journalArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getJournalArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/journal/${article.slug}` },
    openGraph: { type: "article", title: article.title, description: article.description, url: `/journal/${article.slug}`, images: [{ url: article.image, alt: article.imageAlt }] },
    twitter: { card: "summary_large_image", title: article.title, description: article.description, images: [article.image] },
  };
}

export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getJournalArticle(slug);
  if (!article) notFound();
  const canonical = `https://kalethon.com/journal/${article.slug}`;
  const articleIndex = journalArticles.findIndex((item) => item.slug === article.slug);
  const previousArticle = journalArticles[(articleIndex - 1 + journalArticles.length) % journalArticles.length];
  const nextArticle = journalArticles[(articleIndex + 1) % journalArticles.length];
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, image: `https://kalethon.com${article.image}`, author: { "@type": "Organization", name: "KALËTHON" }, publisher: { "@type": "Organization", name: "KALËTHON", logo: { "@type": "ImageObject", url: "https://kalethon.com/kalethon-mark.svg" } }, mainEntityOfPage: canonical, datePublished: "2026-08-29", dateModified: "2026-08-29" };
  return <main className="article-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}/>
    <header className="journal-header"><Link href="/" className="journal-brand">KALËTHON</Link><nav><Link href="/#pieces">Shop</Link><Link href="/try-on">Virtual try-on</Link><Link href="/journal">Journal</Link><BagLink /></nav></header>
    <article>
      <div className="article-heading"><p className="eyebrow">{article.category} / {article.readTime}</p><h1>{article.title}</h1><p>{article.dek}</p></div>
      <figure><Image src={article.image} alt={article.imageAlt} width={1380} height={860}/><figcaption>KALËTHON Journal / {article.category}</figcaption></figure>
      <div className="article-body">{article.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</div>
      <ShareButtons title={article.title} url={canonical}/>
      <nav className="journal-related" aria-label="Continue reading"><Link href={`/journal/${previousArticle.slug}`}><span>Previous story</span><b>{previousArticle.title}</b></Link><Link href={`/journal/${nextArticle.slug}`}><span>Next story</span><b>{nextArticle.title}</b></Link></nav>
      <aside><p className="eyebrow">Continue with KALËTHON</p><h2>Find your finished colourway.</h2><Link href="/#pieces">Shop the collection ↗</Link></aside>
    </article>
    <footer className="journal-footer"><Link href="/journal">← All journal stories</Link><Link href="/">KALËTHON</Link></footer>
  </main>;
}
