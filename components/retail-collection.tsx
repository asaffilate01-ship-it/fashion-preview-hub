"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useBag } from "@/components/bag-provider";
import GarmentColourPreview from "@/components/garment-colour-preview";
import { formatGBP, type StoreBranding, type StoreColour, type StoreFinish, type StoreSleeve } from "@/lib/store";
import { livePreviewAssets } from "@/lib/garment-preview";
import type { StorefrontProduct } from "@/lib/commerce-types";

type RetailCategory = "All" | "Polos" | "Tops" | "Layers" | "Bottoms" | "Sets";

type RetailProductBase = {
  sku: string;
  id: string;
  name: string;
  category: Exclude<RetailCategory, "All">;
  type: string;
  material: string;
  image: string;
  crop?: "top-left" | "top-centre" | "top-right" | "bottom-left" | "bottom-right";
  amount: number;
  colour: StoreColour;
  collarColour: StoreColour;
  cuffColour: StoreColour;
  finish: StoreFinish;
  sleeve: StoreSleeve;
  branding: StoreBranding;
  signatureOnImage?: boolean;
  signatureTone?: "ink" | "bone" | "oxblood";
  sizes: string[];
  note: string;
  available?: number;
  tracked?: boolean;
};

type RetailColourway = {
  key: string;
  label: string;
  colour: StoreColour;
  collarColour: StoreColour;
  cuffColour: StoreColour;
  managedId?: string;
  image?: string;
  signatureTone?: "ink" | "bone" | "oxblood";
  amount?: number;
  available?: number;
  tracked?: boolean;
};

type RetailProduct = RetailProductBase & { colourways: RetailColourway[] };

const categories: RetailCategory[] = ["All", "Polos", "Tops", "Layers", "Bottoms", "Sets"];

const rawProducts: RetailProductBase[] = [
  { sku: "court-polo-bone", id: "court-polo", name: "Court Polo", category: "Polos", type: "Sport-to-city polo", material: "220 GSM mercerised cotton piqué", image: "/catalog/court-polo-k.webp", amount: 8500, colour: "Bone", collarColour: "Navy", cuffColour: "Navy", finish: "Contrast trim", sleeve: "Short sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Structured cotton, navy tipping and the exact Kinetic K" },
  { sku: "court-polo-oxblood", id: "court-polo", name: "Court Polo — Oxblood", category: "Polos", type: "Sport-to-city polo", material: "220 GSM mercerised cotton piqué", image: "/catalog/court-polo-oxblood.webp", amount: 8500, colour: "Oxblood", collarColour: "Bone", cuffColour: "Bone", finish: "Contrast trim", sleeve: "Short sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Oxblood piqué, bone collar and cuff tipping, and the exact Kinetic K" },
  { sku: "casual-contrast-polo", id: "casual-polo", name: "Casual Contrast Polo", category: "Polos", type: "Relaxed lifestyle polo", material: "240 GSM soft cotton piqué", image: "/campaign-polo.png", amount: 8500, colour: "Oxblood", collarColour: "Oxblood", cuffColour: "Oxblood", finish: "Clean", sleeve: "Short sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "A softer drape, open movement and understated K chest mark" },
  { sku: "links-golf-polo", id: "golf-polo", name: "Links Golf Polo", category: "Polos", type: "Technical golf shirt", material: "175 GSM stretch performance piqué", image: "/collections/golf.jpg", amount: 8500, colour: "Sage", collarColour: "Sage", cuffColour: "Sage", finish: "Sport piping", sleeve: "Short sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Longer back hem, shoulder rotation and a contrast inner placket" },
  { sku: "baseline-tennis-polo", id: "tennis-polo", name: "Baseline Tennis Polo", category: "Polos", type: "Lightweight tennis shirt", material: "175 GSM recycled stretch jersey", image: "/collections/tennis.jpg", amount: 8500, colour: "Bone", collarColour: "Oxblood", cuffColour: "Oxblood", finish: "Contrast trim", sleeve: "Short sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Breathable court cloth, movement gusset and oxblood tipping" },
  { sku: "performance-tee-ink", id: "performance-tee", name: "Performance Tee", category: "Tops", type: "Technical T-shirt", material: "240 GSM performance jersey", image: "/try-on/form-tee.jpg", amount: 7600, colour: "Ink", collarColour: "Ink", cuffColour: "Ink", finish: "Clean", sleeve: "Short sleeve", branding: "KALËTHON wordmark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Full KALËTHON wordmark and moisture-spreading stretch" },
  { sku: "poise-hoodie-bone", id: "poise-hoodie", name: "Poise Pullover Hoodie", category: "Layers", type: "Pullover hoodie", material: "420 GSM loopback cotton", image: "/catalog/poise-pullover-hoodie.webp", amount: 12500, colour: "Bone", collarColour: "Bone", cuffColour: "Bone", finish: "Clean", sleeve: "Long sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Structured hood and discreet Kinetic K" },
  { sku: "poise-hoodie-sage", id: "poise-hoodie", name: "Poise Pullover Hoodie — Sage", category: "Layers", type: "Pullover hoodie", material: "420 GSM loopback cotton", image: "/catalog/poise-pullover-hoodie-sage.webp", amount: 12500, colour: "Sage", collarColour: "Sage", cuffColour: "Sage", finish: "Clean", sleeve: "Long sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Heritage sage loopback with a bone Kinetic K chest mark" },
  { sku: "club-hoodie-bone", id: "poise-hoodie", name: "Club Pullover Hoodie", category: "Layers", type: "Relaxed heavyweight pullover", material: "480 GSM brushed fleece", image: "/campaign-hoodie-track.png", amount: 12500, colour: "Bone", collarColour: "Bone", cuffColour: "Bone", finish: "Clean", sleeve: "Long sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Substantial fleece and exact tonal K icon" },
  { sku: "club-zip-hoodie", id: "club-zip-hoodie", name: "Club Zip Hoodie", category: "Layers", type: "Heavyweight full-zip hoodie", material: "450 GSM brushed loopback", image: "/catalog/club-zip-hoodie-clean.png", amount: 13300, colour: "Navy", collarColour: "Navy", cuffColour: "Navy", finish: "Clean", sleeve: "Long sleeve", branding: "KALËTHON wordmark", signatureOnImage: true, signatureTone: "bone", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Two-way zip and precisely aligned KALËTHON chest signature" },
  { sku: "club-zip-hoodie-stone", id: "club-zip-hoodie", name: "Club Zip Hoodie — Stone", category: "Layers", type: "Heavyweight full-zip hoodie", material: "450 GSM brushed loopback", image: "/catalog/club-zip-hoodie-stone.webp", amount: 13300, colour: "Stone", collarColour: "Stone", cuffColour: "Stone", finish: "Clean", sleeve: "Long sleeve", branding: "KALËTHON wordmark", signatureOnImage: true, signatureTone: "ink", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Warm stone loopback with an aligned ink KALËTHON chest signature" },
  { sku: "motion-jogger-stone", id: "motion-jogger", name: "Motion Jogger", category: "Bottoms", type: "Full-length jogger", material: "Structured double-knit", image: "/try-on/motion-jogger.jpg", amount: 11000, colour: "Stone", collarColour: "Stone", cuffColour: "Stone", finish: "Clean", sleeve: "Not applicable", branding: "K mark", sizes: ["28R", "30R", "32R", "34R", "36R", "38R", "40R", "42R"], note: "Articulated knee, zip pockets and K icon" },
  { sku: "court-short-navy", id: "court-short", name: "Court Short", category: "Bottoms", type: "Lined technical short", material: "Four-way stretch woven shell", image: "/try-on/court-short-photo.webp", amount: 7800, colour: "Navy", collarColour: "Navy", cuffColour: "Navy", finish: "Clean", sleeve: "Not applicable", branding: "K mark", sizes: ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18", "UK 20", "UK 22", "UK 24"], note: "Full-coverage liner and exact K icon" },
  { sku: "court-skirt-oxblood", id: "court-skirt", name: "Court Skort", category: "Bottoms", type: "Tennis skirt and short", material: "Stretch woven construction", image: "/try-on/court-skort-photo.webp", amount: 9200, colour: "Oxblood", collarColour: "Oxblood", cuffColour: "Oxblood", finish: "Clean", sleeve: "Not applicable", branding: "K mark", sizes: ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18", "UK 20", "UK 22", "UK 24"], note: "Opaque built-in short and K icon" },
  { sku: "club-tracksuit-ink", id: "club-tracksuit", name: "Club Tracksuit", category: "Sets", type: "Jacket and jogger set", material: "Coordinated brushed fleece", image: "/campaign-hoodie-track.png", amount: 22500, colour: "Ink", collarColour: "Ink", cuffColour: "Ink", finish: "Clean", sleeve: "Long sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Matched cloth, dye lot and K icon" },
];

function colourway(key: string, label: string, colour: StoreColour, collarColour: StoreColour = colour, cuffColour: StoreColour = collarColour, managedId?: string, image?: string, signatureTone?: RetailColourway["signatureTone"]): RetailColourway {
  return { key, label, colour, collarColour, cuffColour, managedId, image, signatureTone };
}

const colourwaySets: Record<string, RetailColourway[]> = {
  "court-polo-bone": [
    colourway("bone-navy", "Bone / Navy", "Bone", "Navy", "Navy", "court-polo-bone", "/catalog/court-polo-k.webp"),
    colourway("oxblood-bone", "Oxblood / Bone", "Oxblood", "Bone", "Bone", "court-polo-oxblood", "/catalog/court-polo-oxblood.webp"),
    colourway("navy-bone", "Navy / Bone", "Navy", "Bone", "Bone"),
    colourway("sage-navy", "Sage / Navy", "Sage", "Navy", "Navy"),
    colourway("stone-oxblood", "Stone / Oxblood", "Stone", "Oxblood", "Oxblood"),
  ],
  "casual-contrast-polo": [
    colourway("oxblood", "Oxblood", "Oxblood", "Oxblood", "Oxblood", "casual-contrast-polo", "/campaign-polo.png"),
    colourway("bone", "Bone", "Bone"), colourway("navy", "Navy", "Navy"), colourway("sage", "Sage", "Sage"), colourway("stone", "Stone", "Stone"),
  ],
  "links-golf-polo": [
    colourway("sage", "Sage", "Sage", "Sage", "Sage", "links-golf-polo", "/collections/golf.jpg"),
    colourway("navy-bone", "Navy / Bone", "Navy", "Navy", "Bone"), colourway("bone-sage", "Bone / Sage", "Bone", "Sage", "Sage"), colourway("oxblood-bone", "Oxblood / Bone", "Oxblood", "Oxblood", "Bone"), colourway("stone-navy", "Stone / Navy", "Stone", "Stone", "Navy"),
  ],
  "baseline-tennis-polo": [
    colourway("bone-oxblood", "Bone / Oxblood", "Bone", "Oxblood", "Oxblood", "baseline-tennis-polo", "/collections/tennis.jpg"),
    colourway("navy-bone", "Navy / Bone", "Navy", "Bone", "Bone"), colourway("oxblood-bone", "Oxblood / Bone", "Oxblood", "Bone", "Bone"), colourway("sage-bone", "Sage / Bone", "Sage", "Bone", "Bone"), colourway("stone-navy", "Stone / Navy", "Stone", "Navy", "Navy"),
  ],
  "performance-tee-ink": [
    colourway("ink", "Ink", "Ink", "Ink", "Ink", "performance-tee-ink", "/try-on/form-tee.jpg", "bone"),
    colourway("bone", "Bone", "Bone", "Bone", "Bone", undefined, undefined, "ink"), colourway("navy", "Navy", "Navy", "Navy", "Navy", undefined, undefined, "bone"), colourway("oxblood", "Oxblood", "Oxblood", "Oxblood", "Oxblood", undefined, undefined, "bone"), colourway("sage", "Sage", "Sage", "Sage", "Sage", undefined, undefined, "bone"),
  ],
  "poise-hoodie-bone": [
    colourway("bone", "Bone", "Bone", "Bone", "Bone", "poise-hoodie-bone", "/catalog/poise-pullover-hoodie.webp", "ink"),
    colourway("sage", "Sage", "Sage", "Sage", "Sage", "poise-hoodie-sage", "/catalog/poise-pullover-hoodie-sage.webp", "bone"),
    colourway("navy", "Navy", "Navy", "Navy", "Navy", undefined, undefined, "bone"), colourway("oxblood", "Oxblood", "Oxblood", "Oxblood", "Oxblood", undefined, undefined, "bone"), colourway("stone", "Stone", "Stone", "Stone", "Stone", undefined, undefined, "ink"),
  ],
  "club-hoodie-bone": [
    colourway("bone", "Bone", "Bone", "Bone", "Bone", "club-hoodie-bone", "/campaign-hoodie-track.png", "ink"),
    colourway("ink", "Ink", "Ink", "Ink", "Ink", undefined, undefined, "bone"), colourway("navy", "Navy", "Navy", "Navy", "Navy", undefined, undefined, "bone"), colourway("oxblood", "Oxblood", "Oxblood", "Oxblood", "Oxblood", undefined, undefined, "bone"), colourway("stone", "Stone", "Stone", "Stone", "Stone", undefined, undefined, "ink"),
  ],
  "club-zip-hoodie": [
    colourway("navy", "Navy", "Navy", "Navy", "Navy", "club-zip-hoodie", "/catalog/club-zip-hoodie-clean.png", "bone"),
    colourway("stone", "Stone", "Stone", "Stone", "Stone", "club-zip-hoodie-stone", "/catalog/club-zip-hoodie-stone.webp", "ink"),
    colourway("ink", "Ink", "Ink", "Ink", "Ink", undefined, undefined, "bone"), colourway("oxblood", "Oxblood", "Oxblood", "Oxblood", "Oxblood", undefined, undefined, "bone"), colourway("sage", "Sage", "Sage", "Sage", "Sage", undefined, undefined, "bone"),
  ],
  "motion-jogger-stone": [
    colourway("stone", "Stone", "Stone", "Stone", "Stone", "motion-jogger-stone", "/try-on/motion-jogger.jpg"),
    colourway("ink", "Ink", "Ink"), colourway("navy", "Navy", "Navy"), colourway("sage", "Sage", "Sage"), colourway("oxblood", "Oxblood", "Oxblood"),
  ],
  "court-short-navy": [
    colourway("navy", "Navy", "Navy", "Navy", "Navy", "court-short-navy", "/try-on/court-short-photo.webp"),
    colourway("ink", "Ink", "Ink"), colourway("bone", "Bone", "Bone"), colourway("sage", "Sage", "Sage"), colourway("oxblood", "Oxblood", "Oxblood"),
  ],
  "court-skirt-oxblood": [
    colourway("oxblood", "Oxblood", "Oxblood", "Oxblood", "Oxblood", "court-skirt-oxblood", "/try-on/court-skort-photo.webp"),
    colourway("navy", "Navy", "Navy"), colourway("bone", "Bone", "Bone"), colourway("sage", "Sage", "Sage"), colourway("ink", "Ink", "Ink"),
  ],
  "club-tracksuit-ink": [
    colourway("ink", "Ink", "Ink", "Ink", "Ink", "club-tracksuit-ink", "/campaign-hoodie-track.png"),
    colourway("navy", "Navy", "Navy"), colourway("stone", "Stone", "Stone"), colourway("sage", "Sage", "Sage"), colourway("oxblood", "Oxblood", "Oxblood"),
  ],
};

const groupedIds = new Set(["court-polo-oxblood", "poise-hoodie-sage", "club-zip-hoodie-stone"]);
const baseProducts: RetailProduct[] = rawProducts.filter((product) => !groupedIds.has(product.sku)).map((product) => ({
  ...product,
  colourways: colourwaySets[product.sku] ?? [colourway(product.colour.toLowerCase(), product.colour, product.colour, product.collarColour, product.cuffColour, product.sku, product.image, product.signatureTone)],
}));

function ProductColourImage({ product, selected, exactPhotography }: { product: RetailProduct; selected: RetailColourway; exactPhotography: boolean }) {
  if (exactPhotography || !livePreviewAssets[product.id]) return <Image key={selected.image ?? product.image} className={product.crop ? `capsule-crop crop-${product.crop}` : undefined} src={selected.image ?? product.image} alt={`${product.name} — ${selected.label}`} fill sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw" unoptimized />;
  return <GarmentColourPreview productId={product.id} name={product.name} bodyColour={selected.colour} collarColour={selected.collarColour} cuffColour={selected.cuffColour} className="retail-live-colour-preview" />;
}

function ProductSignature({ branding, signatureTone: tone = "ink" }: Pick<RetailProduct, "branding" | "signatureTone">) {
  return (
    <div className={`product-signature ${branding === "K mark" ? "product-signature-mark" : "product-signature-word"} signature-${tone}`} aria-label={branding}>
      {branding === "K mark" ? (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M8 8h11v48H8z" fill="currentColor" />
          <path d="m22 30 24-22h13L33 32z" fill="currentColor" />
          <path d="m22 34 12-4 25 26H45z" fill="currentColor" />
        </svg>
      ) : <span>KALËTHON</span>}
    </div>
  );
}

export default function RetailCollection() {
  const { addItem } = useBag();
  const [products, setProducts] = useState<RetailProduct[]>(baseProducts);
  const [category, setCategory] = useState<RetailCategory>("All");
  const [activeProduct, setActiveProduct] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColours, setSelectedColours] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const visibleProducts = useMemo(() => category === "All" ? products : products.filter((product) => product.category === category), [category, products]);

  useEffect(() => {
    let active = true;
    void fetch("/api/catalog", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const body = await response.json() as { products?: StorefrontProduct[] };
      if (!active || !Array.isArray(body.products)) return;
      const published = body.products;
      const publishedById = new Map(published.map((product) => [product.id, product]));
      const known = new Set(baseProducts.flatMap((product) => [product.sku, ...product.colourways.flatMap((option) => option.managedId ? [option.managedId] : [])]));
      const merged = baseProducts.filter((product) => product.colourways.some((option) => publishedById.has(option.managedId ?? product.sku))).map((product) => {
        const current = publishedById.get(product.sku) ?? product.colourways.map((option) => option.managedId ? publishedById.get(option.managedId) : undefined).find(Boolean)!;
        const colourways = product.colourways.map((option) => {
          const managed = option.managedId ? publishedById.get(option.managedId) : undefined;
          return managed ? { ...option, image: option.image ?? managed.image, amount: managed.price, available: managed.available, tracked: managed.tracked } : option;
        });
        return { ...product, name: current.name.replace(/ — (Oxblood|Sage|Stone)$/u, ""), type: current.productType, note: current.description || product.note, image: current.image, amount: current.price, available: current.available, tracked: current.tracked, colourways };
      });
      const additions = published.filter((product) => !known.has(product.id)).map<RetailProduct>((product) => ({
        sku: product.id,
        id: product.id,
        name: product.name,
        category: categories.includes(product.category as RetailCategory) && product.category !== "All" ? product.category as RetailProduct["category"] : "Tops",
        type: product.productType,
        material: product.description || "KALËTHON performance construction",
        image: product.image,
        amount: product.price,
        colour: "Bone",
        collarColour: "Bone",
        cuffColour: "Bone",
        finish: "Clean",
        sleeve: product.category === "Bottoms" ? "Not applicable" : "Short sleeve",
        branding: "K mark",
        sizes: product.category === "Bottoms" ? ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18"] : ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
        note: product.description || "Finished KALËTHON design",
        available: product.available,
        tracked: product.tracked,
        colourways: [colourway("bone", "Bone", "Bone", "Bone", "Bone", product.id, product.image)],
      }));
      setProducts([...merged, ...additions]);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const addStandardDesign = (product: RetailProduct, selected: RetailColourway) => {
    const size = selectedSizes[product.sku] ?? product.sizes[Math.min(2, product.sizes.length - 1)];
    addItem({
      productId: product.id,
      sku: selected.managedId ?? product.sku,
      unitAmount: selected.amount ?? product.amount,
      name: product.name,
      image: selected.image ?? product.image,
      previewMode: selected.image ? "photograph" : "live",
      bodyColour: selected.colour,
      collarColour: selected.collarColour,
      cuffColour: selected.cuffColour,
      sleeve: product.sleeve,
      branding: product.branding,
      fit: "Regular",
      finish: product.finish,
      size,
    });
    setMessage(`${product.name}, ${selected.label}, ${size}, added to your bag.`);
    setActiveProduct(null);
  };

  return (
    <section className="pieces retail-collection" id="pieces" aria-labelledby="pieces-title">
      <div className="retail-heading">
        <div>
          <p className="eyebrow">New arrivals / Made to order</p>
          <h2 id="pieces-title">The essential<br /><em>KALËTHON edit.</em></h2>
        </div>
        <div className="retail-heading-copy">
          <p>Choose a finished KALËTHON colourway, select your size and add it directly. Contrast collars, cuffs and piping are already resolved as part of each design.</p>
          <Link href="/measurements">International size and fit guide <span aria-hidden="true">↗</span></Link>
        </div>
      </div>

      <div className="retail-toolbar">
        <div className="retail-filters" role="group" aria-label="Filter the collection">
          {categories.map((option) => (
            <button className={category === option ? "is-selected" : ""} type="button" aria-pressed={category === option} onClick={() => { setCategory(option); setActiveProduct(null); }} key={option}>
              {option}<span>{option === "All" ? products.length : products.filter((product) => product.category === option).length}</span>
            </button>
          ))}
        </div>
        <span>{visibleProducts.length} pieces</span>
      </div>

      <div className="retail-product-grid" data-count={visibleProducts.length} aria-live="polite">
        {visibleProducts.map((product) => {
          const isOpen = activeProduct === product.sku;
          const selectedSize = selectedSizes[product.sku] ?? product.sizes[Math.min(2, product.sizes.length - 1)];
          const selectedColourway = product.colourways.find((option) => option.key === selectedColours[product.sku]) ?? product.colourways[0];
          const selectedAmount = selectedColourway.amount ?? product.amount;
          const selectedAvailable = selectedColourway.available ?? product.available;
          const selectedTracked = selectedColourway.tracked ?? product.tracked;
          const exactPhotography = Boolean(selectedColourway.image);
          return (
            <article className="retail-product-card" id={`product-${product.sku}`} key={product.sku}>
              <div className="retail-product-image">
                <ProductColourImage product={product} selected={selectedColourway} exactPhotography={exactPhotography} />
                {product.signatureOnImage && <ProductSignature branding={product.branding} signatureTone={selectedColourway.signatureTone ?? product.signatureTone} />}
                <span>{product.category}</span>
                <b>Made to order</b>
                <small className={exactPhotography ? "retail-image-caption" : "retail-image-caption is-live"}>{exactPhotography ? `${selectedColourway.label} photographed` : `${selectedColourway.label} · live colour preview`}</small>
              </div>
              <div className="retail-product-copy">
                <div><p>{product.type}</p><h3>{product.name}</h3></div>
                <strong>{formatGBP(selectedAmount)}</strong>
                <span>{product.material}</span>
                <small>{product.note}</small>
                <div className="retail-branding"><span>Signature</span><ProductSignature branding={product.branding} signatureTone="ink" /><b>{product.branding === "K mark" ? "Kinetic K icon" : "Full KALËTHON wordmark"}</b></div>
                <div className="retail-colourways" role="group" aria-label={`Choose a ${product.name} colour`}>
                  <div><span>Colour</span><b>{selectedColourway.label}</b><small>{product.colourways.length} options</small></div>
                  <div>{product.colourways.map((option) => <button type="button" className={option.key === selectedColourway.key ? "is-selected" : ""} aria-pressed={option.key === selectedColourway.key} aria-label={option.label} title={option.label} onClick={() => setSelectedColours((current) => ({ ...current, [product.sku]: option.key }))} key={option.key}><i className={`swatch-${option.colour.toLowerCase()}`} /><i className={`swatch-${option.collarColour.toLowerCase()}`} /></button>)}</div>
                </div>
              </div>
              <div className="retail-product-actions">
                <button type="button" aria-expanded={isOpen} disabled={selectedTracked && Number(selectedAvailable) <= 0} onClick={() => setActiveProduct(isOpen ? null : product.sku)}>{selectedTracked && Number(selectedAvailable) <= 0 ? "Out of stock" : "Choose size"}</button>
                <Link href={`/try-on?product=${encodeURIComponent(product.id)}&colour=${encodeURIComponent(selectedColourway.colour)}`}>Virtual try-on <span aria-hidden="true">↗</span></Link>
              </div>
              {isOpen && <div className="retail-quick-add">
                <div><b>Choose size</b><Link href="/measurements">Size guide</Link></div>
                <div className="retail-size-scroll" role="group" aria-label={`Choose ${product.name} size`}>
                  {product.sizes.map((size) => <button className={selectedSize === size ? "is-selected" : ""} type="button" aria-pressed={selectedSize === size} onClick={() => setSelectedSizes((current) => ({ ...current, [product.sku]: size }))} key={size}>{size}</button>)}
                </div>
                <button className="retail-add-button" type="button" onClick={() => addStandardDesign(product, selectedColourway)}>Add {selectedSize} to bag · {formatGBP(selectedAmount)}</button>
                <small>Finished design: {selectedColourway.colour} body, {selectedColourway.collarColour} collar, {selectedColourway.cuffColour} trim, {product.finish.toLowerCase()}, regular fit and {product.branding === "K mark" ? "discreet Kinetic K chest mark" : "aligned full KALËTHON wordmark"}.</small>
              </div>}
            </article>
          );
        })}
      </div>

      <p className="retail-message" role="status" aria-live="polite">{message}</p>
      <div className="retail-assurance" aria-label="KALËTHON shopping assurances">
        <span><b>01</b>International sizing</span>
        <span><b>02</b>Material specifications</span>
        <span><b>03</b>Private virtual try-on</span>
        <span><b>04</b>Secure checkout</span>
      </div>
    </section>
  );
}
