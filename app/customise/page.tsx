import type { Metadata } from "next";
import Link from "next/link";
import CustomisePoloClient from "./customise-polo-client";

export const metadata: Metadata = {
  title: "Custom Sportswear Studio",
  description: "Design a made-to-order Kalëthon garment with live colour, sleeve, logo, fit and international size choices.",
  alternates: { canonical: "/customise" },
};

export default function CustomisePage() {
  return (
    <main className="studio-route-page">
      <header className="journal-header">
        <Link className="journal-brand" href="/">KALËTHON</Link>
        <nav><Link href="/">Shop</Link><Link href="/measurements">Size guide</Link><Link href="/try-on">Virtual try-on</Link></nav>
      </header>
      <section className="customiser standalone-customiser" aria-labelledby="customise-page-title">
        <div className="customiser-heading">
          <div><p className="eyebrow">Made-to-order studio</p><h1 id="customise-page-title">Choose your garment.<br /><em>Make it yours.</em></h1></div>
          <p>Choose a garment, then set its colour, finish, sleeve, fit and size. Your complete specification stays visible before secure checkout.</p>
        </div>
        <CustomisePoloClient />
      </section>
      <footer className="journal-footer"><Link href="/">KALËTHON</Link><p>Poise in motion.</p><a href="mailto:hello@kalethon.com">hello@kalethon.com</a></footer>
    </main>
  );
}
