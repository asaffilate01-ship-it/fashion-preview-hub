import type { Metadata } from "next";
import Link from "next/link";
import BagClient from "./bag-client";

export const metadata: Metadata = {
  title: "Your Bag",
  description: "Review your KALËTHON garments and continue to secure checkout.",
  alternates: { canonical: "/bag" },
  robots: { index: false, follow: true },
};

export default function BagPage() {
  return <main className="bag-page">
    <header className="journal-header"><Link className="journal-brand" href="/">KALËTHON</Link><nav><Link href="/#pieces">Shop</Link><Link href="/try-on">Virtual try-on</Link><Link href="/journal">Journal</Link></nav></header>
    <section className="bag-heading"><p className="eyebrow">Your selection</p><h1>Chosen by you.<br/><em>Checked by you.</em></h1><p>Review every colourway, fit and size before secure checkout.</p></section>
    <BagClient />
  </main>;
}
