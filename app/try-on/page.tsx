import type { Metadata } from "next";
import Link from "next/link";
import TryOnClient from "./try-on-client";
import BagLink from "@/components/bag-link";

export const metadata: Metadata = {
  title: "Virtual Sportswear Try-On",
  description: "Preview selected KALËTHON sportswear on your own portrait using the private FASHN-powered virtual fitting studio.",
  alternates: { canonical: "/try-on" },
};

export default function TryOnPage() {
  return (
    <main className="studio-route-page">
      <header className="journal-header journal-header-dark">
        <Link className="journal-brand" href="/">KALËTHON</Link>
        <nav><Link href="/">Shop</Link><Link href="/customise">Customise</Link><Link href="/measurements">Size guide</Link><BagLink /></nav>
      </header>
      <section className="tryon standalone-tryon" aria-labelledby="try-on-page-title">
        <div className="tryon-intro">
          <div><p className="eyebrow light">Private virtual fitting room / Powered by FASHN</p><h1 id="try-on-page-title">Your look.<br /><em>In motion.</em></h1></div>
          <div className="tryon-intro-copy"><p>Select a KALËTHON piece, add your portrait and create a private style preview.</p><span>Your portrait is used only for the preview. Virtual try-on illustrates styling and does not replace the size guide.</span></div>
        </div>
        <TryOnClient />
      </section>
      <footer className="journal-footer journal-footer-dark"><Link href="/">KALËTHON</Link><p>Poise in motion.</p><a href="mailto:hello@kalethon.com">hello@kalethon.com</a></footer>
    </main>
  );
}
