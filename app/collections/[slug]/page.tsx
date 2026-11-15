import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SiteNavigation from "@/components/site-navigation";
import { getKalethonDepartment, kalethonDepartments } from "@/lib/kalethon-departments";

const featuredPieces = [
  { name: "Court Polo", note: "Mercerised cotton piqué", image: "/catalog/court-polo-k.webp", sku: "court-polo-bone", departments: ["men", "women", "sport"] },
  { name: "Poise Pullover Hoodie", note: "Substantial cotton loopback", image: "/catalog/poise-pullover-hoodie.webp", sku: "poise-hoodie-bone", departments: ["men", "women"] },
  { name: "Club Zip Hoodie", note: "Full-zip everyday layer", image: "/media/club-zip-hoodie-960.webp", sku: "club-zip-hoodie", departments: ["men", "women"] },
  { name: "Links Golf Polo", note: "Performance golf piqué", image: "/collections/golf.jpg", sku: "links-golf-polo", departments: ["sport", "men"] },
  { name: "Court Skort", note: "Tennis skirt with integrated short", image: "/try-on/court-skort-photo.webp", sku: "court-skirt-oxblood", departments: ["sport", "women"] },
  { name: "Club Tracksuit", note: "Coordinated layers", image: "/media/campaign-hoodie-track-960.webp", sku: "club-tracksuit-ink", departments: ["men", "women", "sport"] },
] as const;

export function generateStaticParams() {
  return kalethonDepartments.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const department = getKalethonDepartment(slug);
  return department ? { title: department.title, description: department.description } : {};
}

export default async function DepartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const department = getKalethonDepartment(slug);
  if (!department) notFound();
  const existingPieces = featuredPieces.filter((piece) => piece.departments.some((name) => name === slug));
  return (
    <main style={{ minHeight: "100vh", background: "#f7f5f0", color: "#1d211e" }}>
      <SiteNavigation />
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(56px,8vw,120px) 24px 48px" }}>
        <p style={{ textTransform: "uppercase", letterSpacing: ".22em", fontSize: 12, marginBottom: 22 }}>{department.kicker}</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "clamp(54px,9vw,120px)", letterSpacing: "-.065em", lineHeight: 1.05 }}>{department.title}</h1>
        <p style={{ maxWidth: 680, lineHeight: 1.8, fontSize: 18, marginTop: 28 }}>{department.description}</p>
        <p style={{ fontSize: 13, marginTop: 24, opacity: .75 }}>Collection preview · Product availability and pricing will be confirmed before launch.</p>
      </section>
      <nav aria-label={department.title + " category shortcuts"} style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 35px", display: "flex", flexWrap: "wrap", gap: 10 }}>
        {department.categories.map((category, index) => (
          <a key={category.title} href={`#category-${index + 1}`} style={{ border: "1px solid #a8a69e", borderRadius: 2, textDecoration: "none", color: "inherit", padding: "10px 15px", fontSize: 14 }}>{category.title} ↓</a>
        ))}
      </nav>
      <section aria-label={department.title + " categories"} style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 20 }}>
        {department.categories.map((category, index) => (
          <article id={`category-${index + 1}`} key={category.title} style={{ padding: "32px", scrollMarginTop: 110, background: index % 2 ? "#e8e6e0" : "#eeede8", minHeight: 310 }}>
            <span style={{ fontSize: 12, letterSpacing: ".15em" }}>0{index + 1} / {department.title.toUpperCase()}</span>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 33, margin: "28px 0 18px" }}>{category.title}</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 2 }}>{category.products.map((product) => <li key={product}>{product}</li>)}</ul>
          </article>
        ))}
      </section>
      {existingPieces.length > 0 && (
        <section aria-labelledby="existing-pieces-title" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 90px" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: ".2em", fontSize: 12 }}>From the current KALËTHON edit</p>
          <h2 id="existing-pieces-title" style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "clamp(32px,4vw,48px)", margin: "14px 0 30px" }}>Discover existing designs</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 20 }}>
            {existingPieces.map((piece) => (
              <Link key={piece.sku} href={`/#product-${piece.sku}`} style={{ color: "inherit", textDecoration: "none" }}>
                <div style={{ position: "relative", aspectRatio: "4 / 5", background: "#e8e6e0", overflow: "hidden" }}>
                  <Image src={piece.image} alt={piece.name} fill sizes="(max-width: 650px) 100vw, 25vw" style={{ objectFit: "cover" }} unoptimized />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 500, margin: "16px 0 5px" }}>{piece.name}</h3>
                <p style={{ fontSize: 13, opacity: .7 }}>{piece.note}</p>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 24, fontSize: 13, opacity: .7 }}>See the shop for up-to-date stock, sizes and availability.</p>
        </section>
      )}
      <section style={{ background: "#171b19", color: "#fff", padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 36 }}>Discover the current collection</h2>
        <p style={{ margin: "16px auto 26px", maxWidth: 580, lineHeight: 1.7 }}>Explore pieces already available from KALËTHON. New categories will launch only when product details, imagery and fulfilment are ready.</p>
        <Link href="/#pieces" style={{ display: "inline-block", border: "1px solid #fff", color: "#fff", padding: "13px 26px" }}>Shop available pieces</Link>
      </section>
    </main>
  );
}
