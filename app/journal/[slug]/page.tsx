import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJournalArticle, journalArticles } from "@/lib/journal";
import ShareButtons from "../share-buttons";

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
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, image: `https://kalethon.com${article.image}`, author: { "@type": "Organization", name: "Kalëthon" }, publisher: { "@type": "Organization", name: "Kalëthon", logo: { "@type": "ImageObject", url: "https://kalethon.com/kalethon-mark.svg" } }, mainEntityOfPage: canonical, datePublished: "2026-08-29", dateModified: "2026-08-29" };
  return <main className="article-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}/>
    <header className="journal-header"><Link href="/" className="journal-brand">KALËTHON</Link><nav><Link href="/journal">Journal</Link><Link href="/#design-yours">Customise</Link></nav></header>
    <article>
      <div className="article-heading"><p className="eyebrow">{article.category} / {article.readTime}</p><h1>{article.title}</h1><p>{article.dek}</p></div>
      <figure><img src={article.image} alt={article.imageAlt}/><figcaption>Kalëthon Journal / {article.category}</figcaption></figure>
      <div className="article-body">{article.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</div>
      <ShareButtons title={article.title} url={canonical}/>
      <aside><p className="eyebrow">Continue with Kalëthon</p><h2>Build your own specification.</h2><Link href="/#design-yours">Enter the customisation studio ↗</Link></aside>
    </article>
    <footer className="journal-footer"><Link href="/journal">← All journal stories</Link><Link href="/">KALËTHON</Link></footer>
  </main>;
}
