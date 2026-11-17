import type { Metadata } from "next";
import Link from "next/link";
import SiteNavigation from "@/components/site-navigation";
import TeamKitDesigner from "./team-kit-designer";
import styles from "./designer.module.css";

export const metadata: Metadata = {
  title: "Custom Team Kit Designer",
  description: "Explore original KALËTHON football, cricket, rugby, basketball and volleyball kit concepts with colours, patterns, player names and numbers before requesting a quotation.",
  alternates: { canonical: "/pro/designer" },
  openGraph: {
    title: "KALËTHON | Team & Pro Kit Designer",
    description: "Create an original sports kit visual brief and submit it for review. No payment or confirmed production order.",
    images: ["/editorial/team-design.svg"],
  },
};

export default function TeamDesignerPage() {
  return (
    <main className={styles.page}>
      <SiteNavigation />
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">KALËTHON</Link><span aria-hidden="true">/</span>
        <Link href="/collections/team-pro">Team & Pro</Link><span aria-hidden="true">/</span>
        <span>Kit designer</span>
      </nav>
      <TeamKitDesigner />
    </main>
  );
}
