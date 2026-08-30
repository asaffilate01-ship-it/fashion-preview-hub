import type { Metadata } from "next";
import Link from "next/link";
import { legalPages } from "@/lib/legal";
import SiteNavigation from "@/components/site-navigation";

export const metadata: Metadata = { title: "Legal & Customer Care", description: "KALËTHON legal, privacy, delivery, returns and accessibility information.", alternates: { canonical: "/legal" }, robots: { index: true, follow: true } };

export default function LegalHub() { return <main className="legal-page"><SiteNavigation /><section className="legal-index"><p className="eyebrow">Customer care / Legal</p><h1>Clear terms.<br/><em>Quiet confidence.</em></h1><p>Everything you should know before browsing, customising or ordering.</p><div className="legal-grid">{legalPages.map((page, index) => <Link href={`/legal/${page.slug}`} key={page.slug}><span>0{index + 1}</span><h2>{page.title}</h2><p>{page.summary}</p></Link>)}</div></section></main>; }
