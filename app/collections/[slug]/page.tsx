import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNavigation from "@/components/site-navigation";
import { getKalethonDepartment, kalethonDepartments } from "@/lib/kalethon-departments";

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
  return (
    <main style={{ minHeight: "100vh", background: "#f7f5f0", color: "#1d211e" }}>
      <SiteNavigation />
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(56px,8vw,120px) 24px 48px" }}>
        <p style={{ textTransform: "uppercase", letterSpacing: ".22em", fontSize: 12, marginBottom: 22 }}>{department.kicker}</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "clamp(54px,9vw,120px)", letterSpacing: "-.065em", lineHeight: 1.05 }}>{department.title}</h1>
        <p style={{ maxWidth: 680, lineHeight: 1.8, fontSize: 18, marginTop: 28 }}>{department.description}</p>
        <p style={{ fontSize: 13, marginTop: 24, opacity: .75 }}>Collection preview · Product availability and pricing will be confirmed before launch.</p>
      </section>
      <section aria-label={department.title + " categories"} style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 20 }}>
        {department.categories.map((category, index) => (
          <article key={category.title} style={{ padding: "32px", background: index % 2 ? "#e8e6e0" : "#eeede8", minHeight: 310 }}>
            <span style={{ fontSize: 12, letterSpacing: ".15em" }}>0{index + 1} / {department.title.toUpperCase()}</span>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 33, margin: "28px 0 18px" }}>{category.title}</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 2 }}>{category.products.map((product) => <li key={product}>{product}</li>)}</ul>
          </article>
        ))}
      </section>
      <section style={{ background: "#171b19", color: "#fff", padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 36 }}>Discover the current collection</h2>
        <p style={{ margin: "16px auto 26px", maxWidth: 580, lineHeight: 1.7 }}>Explore pieces already available from KALËTHON. New categories will launch only when product details, imagery and fulfilment are ready.</p>
        <Link href="/#pieces" style={{ display: "inline-block", border: "1px solid #fff", color: "#fff", padding: "13px 26px" }}>Shop available pieces</Link>
      </section>
    </main>
  );
}
