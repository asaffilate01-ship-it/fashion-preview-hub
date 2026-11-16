"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBag } from "@/components/bag-provider";
import { getFeaturedColourways, type FeaturedProduct } from "@/lib/featured-products";
import styles from "./product-detail.module.css";
import type { StorefrontProduct } from "@/lib/commerce-types";
import { formatGBP } from "@/lib/store";

type Availability = { state: "loading" | "ready" | "unavailable"; product?: StorefrontProduct };

export default function ProductDetailClient({ product }: { product: FeaturedProduct }) {
  const { addItem, ready: bagReady } = useBag();
  const colourways = getFeaturedColourways(product);
  const [availability, setAvailability] = useState<Availability>({ state: "loading" });
  const [size, setSize] = useState("");
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalog", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Catalogue unavailable");
        const data = await response.json() as { products?: StorefrontProduct[] };
        const current = data.products?.find((entry) => entry.sku === product.sku);
        if (!current || (current.tracked && current.available <= 0)) {
          setAvailability({ state: "unavailable" });
        } else {
          setAvailability({ state: "ready", product: current });
        }
      }).catch(() => { if (!controller.signal.aborted) setAvailability({ state: "unavailable" }); });
    return () => controller.abort();
  }, [product.sku]);

  const available = availability.state === "ready" && Boolean(availability.product);
  const managed = availability.product;
  const add = () => {
    if (!available || !bagReady || !managed || !product.sizes.includes(size)) return;
    addItem({
      sku: managed.sku,
      productId: product.productId,
      unitAmount: managed.price,
      name: managed.name,
      image: product.image,
      previewMode: "photograph",
      bodyColour: product.colour,
      collarColour: product.collar,
      cuffColour: product.cuff,
      sleeve: product.sleeve,
      branding: product.branding,
      fit: "Regular",
      finish: product.finish,
      size,
    });
    setFeedback(`${product.title} in ${size} added to your bag.`);
  };

  return (
    <div className={styles.page}>
      <nav aria-label="Breadcrumb" style={{ marginBottom: 28, fontSize: 13 }}>
        <Link href="/" style={{ color: "inherit" }}>Home</Link> / <Link href="/#pieces" style={{ color: "inherit" }}>Collection</Link> / {product.title}
      </nav>
      <div className={styles.layout}>
        <div className={styles.productPhoto}>
          <Image src={product.image} alt={`KALËTHON ${product.title}`} fill sizes="(max-width: 780px) 100vw, 50vw" style={{ objectFit: "cover" }} unoptimized priority />
        </div>
        <section aria-label="Product details" className={styles.details}>
          <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".18em" }}>{product.category} / KALËTHON</p>
          <h1 style={{ fontSize: "clamp(38px,5vw,64px)", fontFamily: "Georgia, serif", fontWeight: 400, letterSpacing: "-.04em", margin: "18px 0" }}>{product.title}</h1>
          <p style={{ fontSize: 17, lineHeight: 1.8, maxWidth: 530 }}>{product.description}</p>
          <p style={{ marginTop: 20, fontSize: 15 }}>{product.material}</p>
          <div style={{ borderTop: "1px solid #cac7bf", marginTop: 30, paddingTop: 25 }}>
            <p style={{ fontSize: 13, marginBottom: 10 }}>Colour: <strong>{product.colour}</strong></p>
            <p style={{ fontSize: 13, marginBottom: 18 }}>Finish: {product.finish} · {product.branding}</p>
            {colourways.length > 1 && (
              <div className={styles.colourways}>
                <p>Explore colourways</p>
                <div className={styles.colourOptions} role="group" aria-label="Explore colourways">
                  {colourways.map((option) => (
                    <Link href={`/products/${option.slug}`} key={option.slug}
                      className={option.slug === product.slug ? styles.activeColour : styles.colourOption}
                      aria-current={option.slug === product.slug ? "page" : undefined}>
                      <span className={styles.colourPhoto}><Image src={option.image} alt="" fill sizes="72px" style={{ objectFit: "cover" }} unoptimized /></span>
                      <span>{option.colour}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {available && managed ? <p style={{ fontSize: 24, fontWeight: 500, marginBottom: 20 }}>{formatGBP(managed.price)}</p> : null}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <label htmlFor="kalethon-size">Select size</label>
              <Link href="/measurements" style={{ color: "inherit", fontSize: 13 }}>Size guide ↗</Link>
            </div>
            <select id="kalethon-size" value={size} onChange={(event) => { setSize(event.target.value); setFeedback(""); }} className={styles.sizeSelect}>
              <option value="">Choose your size</option>
              {product.sizes.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <button className={styles.buyButton} type="button" onClick={add} disabled={!available || !size || !bagReady}>
              {availability.state === "loading" ? "Checking availability…" : !available ? "Currently unavailable" : !size ? "Select a size" : "Add to bag"}
            </button>
            <p role="status" aria-live="polite" style={{ minHeight: 25, marginTop: 12, fontSize: 13 }}>{feedback || (availability.state === "unavailable" ? "Ordering is unavailable until current catalogue and stock details are confirmed." : "")}</p>
            {available && <p className={styles.stockNote}>Available stock is checked by product; individual size availability is not yet guaranteed.</p>}
            {feedback && <Link href="/bag" style={{ display: "inline-block", marginTop: 6, color: "inherit", textDecoration: "underline" }}>View bag ↗</Link>}
          </div>
          <div style={{ marginTop: 30, lineHeight: 1.9, fontSize: 14 }}>
            <p>Specific colour and finish are shown above. Made-to-order lead time, delivery costs and applicable taxes are confirmed at checkout.</p>
            <Link href={`/try-on?product=${encodeURIComponent(product.productId)}&colour=${encodeURIComponent(product.colour)}`} style={{ display: "inline-block", marginTop: 15, color: "inherit" }}>Explore virtual try-on ↗</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
