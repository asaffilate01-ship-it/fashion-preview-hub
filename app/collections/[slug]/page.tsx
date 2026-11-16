import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNavigation from "@/components/site-navigation";
import { getKalethonDepartment, kalethonDepartments } from "@/lib/kalethon-departments";
import { getDepartmentEditorial } from "@/lib/kalethon-editorial";
import { featuredProducts } from "@/lib/featured-products";
import styles from "./collection-page.module.css";

export function generateStaticParams() {
  return kalethonDepartments.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const department = getKalethonDepartment(slug);
  const editorial = getDepartmentEditorial(slug);
  if (!department) return {};
  return {
    title: department.title,
    description: department.description,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: {
      title: `KALËTHON | ${department.title}`,
      description: department.description,
      ...(editorial ? { images: [{ url: editorial.visual.src, alt: editorial.visual.alt }] } : {}),
    },
  };
}

export default async function DepartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const department = getKalethonDepartment(slug);
  const editorial = getDepartmentEditorial(slug);
  if (!department || !editorial) notFound();
  const existingPieces = featuredProducts.filter((piece) => piece.departments.some((name) => name === slug));
  const upcoming = existingPieces.length === 0;

  return (
    <main className={styles.page}>
      <SiteNavigation />
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">KALËTHON</Link><span aria-hidden="true">/</span><span>{department.title}</span>
      </nav>
      <section className={styles.hero} aria-labelledby="department-title">
        <div className={styles.heroMedia}>
          <Image src={editorial.visual.src} alt={editorial.visual.alt} fill priority unoptimized
            sizes="100vw" className={styles.heroImage} />
        </div>
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>KALËTHON / {department.kicker}</p>
          <h1 id="department-title">{department.title}</h1>
          <p className={styles.heroLead}>{editorial.lead}</p>
          <p className={styles.heroDescription}>{department.description}</p>
          <a className={styles.heroAction} href="#discover">{upcoming ? "Explore the concept collections" : "Discover the collection"} <span aria-hidden="true">↓</span></a>
        </div>
        <p className={styles.heroCaption}>{editorial.caption}{editorial.visual.concept ? " · Original concept illustration, not a product photograph" : ""}</p>
      </section>

      <section className={styles.intro} id="discover" aria-labelledby="discover-title">
        <div>
          <p className={styles.sectionKicker}>Explore / {department.title}</p>
          <h2 id="discover-title">The collection, <em>considered.</em></h2>
        </div>
        <p>{upcoming
          ? "These ranges are being developed. Visuals are original concept illustrations, not product photography. Products are not yet available to purchase."
          : "Explore the collection by category, then discover designs with their own product photography, materials and sizing information."}</p>
      </section>

      <nav className={styles.categoryNav} aria-label={`${department.title} category shortcuts`}>
        {department.categories.map((category, index) => (
          <a href={`#category-${index + 1}`} key={category.title}>
            {category.title}<span aria-hidden="true">↘</span>
          </a>
        ))}
      </nav>

      <section className={styles.categories} aria-label={`${department.title} categories`}>
        {department.categories.map((category, index) => {
          const visual = editorial.categories[index];
          return (
            <article className={styles.categoryCard} id={`category-${index + 1}`} key={category.title}>
              <div className={styles.categoryMedia}>
                {visual && <Image src={visual.src} alt={visual.alt} fill unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" className={styles.categoryImage} />}
                <span className={styles.categoryNumber}>0{index + 1} / {department.title}</span>
              </div>
              <div className={styles.categoryContent}>
                <p className={styles.visualDisclaimer}>{visual?.concept ? "Design illustration · Collection in development" : "Editorial collection photography"}</p>
                <h3>{category.title}</h3>
                <ul>{category.products.map((product) => <li key={product}>{upcoming ? (
                  <Link className={styles.catalogueEnquiry} href={{ pathname: "/pro/quote", query: { department: slug, category: category.title, product } }}>
                    {product}<span aria-hidden="true">↗</span>
                  </Link>
                ) : product}</li>)}</ul>
                {upcoming && <Link className={styles.categoryLink} href={{ pathname: "/pro/quote", query: { department: slug, category: category.title } }}>Request a quotation <span aria-hidden="true">↗</span></Link>}
              </div>
            </article>
          );
        })}
      </section>

      {existingPieces.length > 0 && (
        <section className={styles.featured} aria-labelledby="featured-heading">
          <div className={styles.featuredHeader}>
            <div>
              <p className={styles.sectionKicker}>KALËTHON / Existing designs</p>
              <h2 id="featured-heading">Discover the <em>pieces.</em></h2>
            </div>
            <p>Every design below links to its own details page. Current prices and purchase availability are checked against the live catalogue.</p>
          </div>
          <div className={styles.featuredGrid}>
            {existingPieces.map((piece) => (
              <Link className={styles.featuredCard} key={piece.slug} href={`/products/${piece.slug}`}>
                <div className={styles.featuredMedia}>
                  <Image src={piece.image} alt={`KALËTHON ${piece.title}`} fill unoptimized
                    sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw" className={styles.featuredImage} />
                </div>
                <span className={styles.productCategory}>{piece.category}</span>
                <h3>{piece.title}</h3>
                <p>{piece.material}</p>
                <span className={styles.detailsLink}>View details and sizes <span aria-hidden="true">↗</span></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <aside className={styles.closing}>
        <p className={styles.sectionKicker}>The KALËTHON standard</p>
        <h2>{upcoming ? "Interested in the collection?" : "Explore the entire world of KALËTHON."}</h2>
        <p>{upcoming
          ? "For bespoke products, clubs and professional enquiries, send a structured quotation request. Unapproved equipment and proposed leather products are not offered for checkout."
          : "Explore refined essentials, performance collections and selected new developments, all under one brand."}</p>
        <Link href={upcoming ? { pathname: "/pro/quote", query: { department: slug } } : "/#pieces"}>
          {upcoming ? "Discuss your requirements" : "View the current shop"} <span aria-hidden="true">↗</span>
        </Link>
        {!upcoming && <Link className={styles.tradeLink} href={{ pathname: "/pro/quote", query: { department: slug } }}>
          Professional & wholesale enquiries <span aria-hidden="true">↗</span>
        </Link>}
      </aside>
    </main>
  );
}
