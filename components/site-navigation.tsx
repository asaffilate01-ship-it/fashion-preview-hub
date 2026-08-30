"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import BagLink from "@/components/bag-link";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const primaryLinks = [
  { href: "/#pieces", label: "Shop" },
  { href: "/#collections", label: "Sports" },
  { href: "/try-on", label: "Virtual room" },
  { href: "/measurements", label: "Size guide" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
] as const;

const sportLinks = ["Tennis", "Golf", "Padel", "Pickleball", "Running", "Training"] as const;

function Mark() {
  return <svg className="unified-brand-mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M8 8h11v48H8z" fill="currentColor"/><path d="m22 30 24-22h13L33 32z" fill="currentColor"/><path d="m22 34 12-4 25 26H45z" fill="currentColor"/></svg>;
}

export default function SiteNavigation({ home = false }: { home?: boolean }) {
  const pathname = usePathname();
  const active = (href: string) => href.startsWith("/#") ? false : href !== "/" && pathname.startsWith(href);

  return <header className={`${home ? "site-header" : "journal-header"} unified-site-header`}>
    <Link className={home ? "brand" : "journal-brand unified-brand"} href="/" aria-label="KALËTHON home"><Mark/><span>KALËTHON</span></Link>
    <nav className={home ? "primary-nav unified-desktop-nav" : "unified-desktop-nav"} aria-label="Primary navigation">
      {primaryLinks.map((link) => <Link className={active(link.href) ? "is-active" : ""} href={link.href} key={link.href}>{link.label}</Link>)}
    </nav>
    <div className="unified-header-actions">
      <Link className="unified-search" href="/search" aria-label="Search KALËTHON"><Search aria-hidden="true"/><span>Search</span></Link>
      <BagLink className="unified-bag" />
      <Sheet>
        <SheetTrigger asChild><button className="mobile-menu-trigger" type="button" aria-label="Open navigation"><Menu aria-hidden="true"/><span>Menu</span></button></SheetTrigger>
        <SheetContent className="mobile-navigation-sheet" side="right">
          <SheetHeader className="mobile-navigation-heading"><SheetTitle><Mark/><span>KALËTHON</span></SheetTitle><SheetDescription>Sport-to-city clothing, finished with quiet confidence.</SheetDescription></SheetHeader>
          <nav className="mobile-navigation-links" aria-label="Mobile navigation">
            {primaryLinks.map((link, index) => <SheetClose asChild key={link.href}><Link className={active(link.href) ? "is-active" : ""} href={link.href}><small>0{index + 1}</small><span>{link.label}</span><b>↗</b></Link></SheetClose>)}
          </nav>
          <div className="mobile-sport-links"><p>Shop by sport</p><div>{sportLinks.map((sport) => <SheetClose asChild key={sport}><Link href={`/sport/${sport.toLowerCase()}`}>{sport}</Link></SheetClose>)}</div></div>
          <div className="mobile-navigation-footer"><SheetClose asChild><Link href="/search"><Search/>Search the collection</Link></SheetClose><BagLink /></div>
        </SheetContent>
      </Sheet>
    </div>
  </header>;
}
