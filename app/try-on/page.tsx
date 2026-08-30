import type { Metadata } from "next";
import Link from "next/link";
import TryOnClient from "./try-on-client";
import BagLink from "@/components/bag-link";

export const metadata: Metadata = {
  title: "Virtual Viewing Room",
  description: "Preview selected KALËTHON sportswear on your own portrait using the private FASHN-powered Virtual Viewing Room.",
  alternates: { canonical: "/try-on" },
};

export default function TryOnPage() {
  return (
    <main className="studio-route-page">
      <header className="journal-header">
        <Link className="journal-brand" href="/">KALËTHON</Link>
        <nav><Link href="/#pieces">Shop</Link><Link href="/measurements">Size guide</Link><BagLink /></nav>
      </header>
      <section className="tryon standalone-tryon" aria-labelledby="try-on-page-title">
        <div className="tryon-intro">
          <div><p className="eyebrow light">Private Virtual Viewing Room / Powered by FASHN</p><h1 id="try-on-page-title">See the piece.<br /><em>On you.</em></h1></div>
          <div className="tryon-intro-copy"><p>Choose a photographed KALËTHON piece, add a clear portrait and create a private style preview.</p><span>Your portrait is used only for this temporary preview. The result illustrates styling and does not replace the size guide.</span></div>
        </div>
        <TryOnClient />
      </section>
      <footer className="journal-footer journal-footer-dark"><Link href="/">KALËTHON</Link><p>Poise in motion.</p><a href="mailto:hello@kalethon.com">hello@kalethon.com</a></footer>
    </main>
  );
}
