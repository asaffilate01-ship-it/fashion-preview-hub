import type { Metadata } from "next";
import Link from "next/link";
import { legalPages } from "@/lib/legal";

export const metadata: Metadata = { title: "Legal & Customer Care", description: "Kalëthon legal, privacy, delivery, returns and accessibility information.", alternates: { canonical: "/legal" }, robots: { index: true, follow: true } };

export default function LegalHub() { return <main className="legal-page"><header className="journal-header"><Link className="journal-brand" href="/">KALËTHON</Link><nav><Link href="/journal">Journal</Link><Link href="/measurements">Measurements</Link></nav></header><section className="legal-index"><p className="eyebrow">Customer care / Legal</p><h1>Clear terms.<br/><em>Quiet confidence.</em></h1><p>Everything you should know before browsing, customising or ordering.</p><div className="legal-grid">{legalPages.map((page, index) => <Link href={`/legal/${page.slug}`} key={page.slug}><span>0{index + 1}</span><h2>{page.title}</h2><p>{page.summary}</p></Link>)}</div></section></main>; }
