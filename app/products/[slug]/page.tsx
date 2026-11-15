import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteNavigation from "@/components/site-navigation";
import { featuredProducts, getFeaturedProduct } from "@/lib/featured-products";
import ProductDetailClient from "./product-detail-client";

export function generateStaticParams() {
  return featuredProducts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getFeaturedProduct(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: `KALËTHON | ${product.title}`, description: product.description, images: [product.image] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getFeaturedProduct(slug);
  if (!product) notFound();
  return <main style={{ minHeight: "100vh", background: "#f7f5f0" }}><SiteNavigation/><ProductDetailClient product={product}/></main>;
}
