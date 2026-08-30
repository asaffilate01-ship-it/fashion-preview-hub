import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { journalArticles } from "@/lib/journal";
import SocialLinks from "@/components/social-links";
import BagLink from "@/components/bag-link";

export const metadata: Metadata = {
  title: "Sportswear Journal",
  description: "KALËTHON Journal: practical guides to tennis, padel and premium sportswear, clothing quality, international sizing and sport-to-city style in London, Dubai and New York.",
  keywords: ["sportswear journal", "tennis clothing guide", "padel clothing guide", "sportswear fabric guide", "London sportswear", "Dubai sportswear"],
  alternates: { canonical: "/journal" },
  openGraph: { title: "KALËTHON Sportswear Journal", description: "Sport, clothing and city guides from KALËTHON.", url: "/journal", images: ["/og.jpg"] },
};

export default function JournalPage() {
  return <main className="journal-page">
    <header className="journal-header"><Link href="/" className="journal-brand">KALËTHON</Link><nav><Link href="/customise">Customise</Link><Link href="/measurements">Measurements</Link><BagLink /></nav></header>
    <section className="journal-hero"><p className="eyebrow">The KALËTHON journal</p><h1>Sport, cloth<br/><em>and the city.</em></h1><p>Practical thinking on how performance clothing is made, measured and worn—from court conditions to city streets.</p></section>
    <section className="journal-grid" aria-label="Journal articles">
      {journalArticles.map((article, index) => <article className={index === 0 ? "journal-card is-featured" : "journal-card"} key={article.slug}>
        <Link href={`/journal/${article.slug}`} className="journal-card-image"><Image src={article.image} alt={article.imageAlt} width={1200} height={750}/></Link>
        <div><span>{article.category} / {article.readTime}</span><h2><Link href={`/journal/${article.slug}`}>{article.title}</Link></h2><p>{article.dek}</p><Link href={`/journal/${article.slug}`}>Read journal ↗</Link></div>
      </article>)}
    </section>
    <footer className="journal-footer"><Link href="/">KALËTHON</Link><p>Poise in motion.</p><SocialLinks /></footer>
  </main>;
}
