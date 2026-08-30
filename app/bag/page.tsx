import type { Metadata } from "next";
import BagClient from "./bag-client";
import SiteNavigation from "@/components/site-navigation";

export const metadata: Metadata = {
  title: "Your Bag",
  description: "Review your KALËTHON garments and continue to secure checkout.",
  alternates: { canonical: "/bag" },
  robots: { index: false, follow: true },
};

export default function BagPage() {
  return <main className="bag-page">
    <SiteNavigation />
    <section className="bag-heading"><p className="eyebrow">Your selection</p><h1>Chosen by you.<br/><em>Checked by you.</em></h1><p>Review every colourway, fit and size before secure checkout.</p></section>
    <BagClient />
  </main>;
}
