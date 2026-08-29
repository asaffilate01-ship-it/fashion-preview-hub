import type { Metadata } from "next";
import Link from "next/link";
import { journalArticles } from "@/lib/journal";
import SocialLinks from "@/components/social-links";

export const metadata: Metadata = {
  title: "Sportswear Journal",
  description: "Kalëthon Journal: practical guides to tennis, padel and premium sportswear, clothing quality, international sizing and sport-to-city style in London, Dubai and New York.",
  keywords: ["sportswear journal", "tennis clothing guide", "padel clothing guide", "sportswear fabric guide", "London sportswear", "Dubai sportswear"],
  alternates: { canonical: "/journal" },
  openGraph: { title: "Kalëthon Sportswear Journal", description: "Sport, clothing and city guides from Kalëthon.", url: "/journal", images: ["/og.png"] },
};

export default function JournalPage() {
  return <main className="journal-page">
    <header className="journal-header"><Link href="/" className="journal-brand">KALËTHON</Link><nav><Link href="/#design-yours">Customise</Link><Link href="/measurements">Measurements</Link></nav></header>
    <section className="journal-hero"><p className="eyebrow">The Kalëthon journal</p><h1>Sport, cloth<br/><em>and the city.</em></h1><p>Practical thinking on how performance clothing is made, measured and worn—from court conditions to city streets.</p></section>
    <section className="journal-grid" aria-label="Journal articles">
      {journalArticles.map((article, index) => <article className={index === 0 ? "journal-card is-featured" : "journal-card"} key={article.slug}>
        <Link href={`/journal/${article.slug}`} className="journal-card-image"><img src={article.image} alt={article.imageAlt}/></Link>
        <div><span>{article.category} / {article.readTime}</span><h2><Link href={`/journal/${article.slug}`}>{article.title}</Link></h2><p>{article.dek}</p><Link href={`/journal/${article.slug}`}>Read journal ↗</Link></div>
      </article>)}
    </section>
    <footer className="journal-footer"><Link href="/">KALËTHON</Link><p>Poise in motion.</p><SocialLinks /></footer>
  </main>;
}
