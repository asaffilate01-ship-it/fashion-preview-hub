import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact KALËTHON",
  description: "Ask KALËTHON about products, sizing, delivery, orders or virtual try-on support.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact KALËTHON", description: "Product, sizing, delivery and order support from KALËTHON.", url: "/contact", images: ["/og.jpg"] },
};

export default function ContactPage() {
  return <main className="contact-page">
    <header className="journal-header"><Link className="journal-brand" href="/">KALËTHON</Link><nav><Link href="/#pieces">Shop</Link><Link href="/try-on">Virtual try-on</Link><Link href="/journal">Journal</Link></nav></header>
    <section className="contact-shell">
      <div className="contact-intro"><p className="eyebrow">Client service</p><h1>How can we<br/><em>help?</em></h1><p>Questions about a garment, fit, delivery, an existing order or the private virtual viewing room are handled by the KALËTHON team.</p><div><small>Email</small><a href="mailto:hello@kalethon.com">hello@kalethon.com</a></div><div><small>Response time</small><b>Within two working days</b></div></div>
      <ContactForm />
    </section>
    <footer className="journal-footer"><Link href="/">KALËTHON</Link><p>Poise in motion.</p><Link href="/legal">Customer care</Link></footer>
  </main>;
}
