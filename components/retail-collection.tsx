"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useBag } from "@/components/bag-provider";
import { formatGBP, type CustomProductId, type StoreBranding, type StoreColour, type StoreFinish, type StoreSleeve } from "@/lib/store";

type RetailCategory = "All" | "Polos" | "Tops" | "Layers" | "Bottoms" | "Sets";

type RetailProduct = {
  sku: string;
  id: CustomProductId;
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
};

const categories: RetailCategory[] = ["All", "Polos", "Tops", "Layers", "Bottoms", "Sets"];

const products: RetailProduct[] = [
  { sku: "court-polo-bone", id: "court-polo", name: "Court Polo", category: "Polos", type: "Sport-to-city polo", material: "220 GSM mercerised cotton piqué", image: "/catalog/court-polo-k.webp", amount: 8500, colour: "Bone", collarColour: "Navy", cuffColour: "Navy", finish: "Contrast trim", sleeve: "Short sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Structured cotton, navy tipping and the exact Kinetic K" },
  { sku: "casual-contrast-polo", id: "casual-polo", name: "Casual Contrast Polo", category: "Polos", type: "Relaxed lifestyle polo", material: "240 GSM soft cotton piqué", image: "/campaign-polo.png", amount: 8500, colour: "Oxblood", collarColour: "Oxblood", cuffColour: "Oxblood", finish: "Clean", sleeve: "Short sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "A softer drape, open movement and understated K chest mark" },
  { sku: "links-golf-polo", id: "golf-polo", name: "Links Golf Polo", category: "Polos", type: "Technical golf shirt", material: "175 GSM stretch performance piqué", image: "/collections/golf.jpg", amount: 8500, colour: "Sage", collarColour: "Sage", cuffColour: "Sage", finish: "Sport piping", sleeve: "Short sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Longer back hem, shoulder rotation and a contrast inner placket" },
  { sku: "baseline-tennis-polo", id: "tennis-polo", name: "Baseline Tennis Polo", category: "Polos", type: "Lightweight tennis shirt", material: "175 GSM recycled stretch jersey", image: "/collections/tennis.jpg", amount: 8500, colour: "Bone", collarColour: "Oxblood", cuffColour: "Oxblood", finish: "Contrast trim", sleeve: "Short sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Breathable court cloth, movement gusset and oxblood tipping" },
  { sku: "performance-tee-ink", id: "performance-tee", name: "Performance Tee", category: "Tops", type: "Technical T-shirt", material: "240 GSM performance jersey", image: "/try-on/form-tee.jpg", amount: 7600, colour: "Ink", collarColour: "Ink", cuffColour: "Ink", finish: "Clean", sleeve: "Short sleeve", branding: "KALËTHON wordmark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Full KALËTHON wordmark and moisture-spreading stretch" },
  { sku: "poise-hoodie-bone", id: "poise-hoodie", name: "Poise Pullover Hoodie", category: "Layers", type: "Pullover hoodie", material: "420 GSM loopback cotton", image: "/catalog/poise-pullover-hoodie.webp", amount: 12500, colour: "Bone", collarColour: "Bone", cuffColour: "Bone", finish: "Clean", sleeve: "Long sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Structured hood and discreet Kinetic K" },
  { sku: "club-hoodie-bone", id: "poise-hoodie", name: "Club Pullover Hoodie", category: "Layers", type: "Relaxed heavyweight pullover", material: "480 GSM brushed fleece", image: "/campaign-hoodie-track.png", amount: 12500, colour: "Bone", collarColour: "Bone", cuffColour: "Bone", finish: "Clean", sleeve: "Long sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Substantial fleece and exact tonal K icon" },
  { sku: "club-zip-hoodie", id: "club-zip-hoodie", name: "Club Zip Hoodie", category: "Layers", type: "Heavyweight full-zip hoodie", material: "450 GSM brushed loopback", image: "/catalog/club-zip-hoodie-clean.png", amount: 13300, colour: "Navy", collarColour: "Navy", cuffColour: "Navy", finish: "Clean", sleeve: "Long sleeve", branding: "KALËTHON wordmark", signatureOnImage: true, signatureTone: "bone", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Two-way zip and precisely aligned KALËTHON chest signature" },
  { sku: "motion-jogger-stone", id: "motion-jogger", name: "Motion Jogger", category: "Bottoms", type: "Full-length jogger", material: "Structured double-knit", image: "/try-on/motion-jogger.jpg", amount: 11000, colour: "Stone", collarColour: "Stone", cuffColour: "Stone", finish: "Clean", sleeve: "Not applicable", branding: "K mark", sizes: ["28R", "30R", "32R", "34R", "36R", "38R", "40R", "42R"], note: "Articulated knee, zip pockets and K icon" },
  { sku: "court-short-navy", id: "court-short", name: "Court Short", category: "Bottoms", type: "Lined technical short", material: "Four-way stretch woven shell", image: "/try-on/court-short-photo.webp", amount: 7800, colour: "Navy", collarColour: "Navy", cuffColour: "Navy", finish: "Clean", sleeve: "Not applicable", branding: "K mark", sizes: ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18", "UK 20", "UK 22", "UK 24"], note: "Full-coverage liner and exact K icon" },
  { sku: "court-skirt-oxblood", id: "court-skirt", name: "Court Skort", category: "Bottoms", type: "Tennis skirt and short", material: "Stretch woven construction", image: "/try-on/court-skort-photo.webp", amount: 9200, colour: "Oxblood", collarColour: "Oxblood", cuffColour: "Oxblood", finish: "Clean", sleeve: "Not applicable", branding: "K mark", sizes: ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18", "UK 20", "UK 22", "UK 24"], note: "Opaque built-in short and K icon" },
  { sku: "club-tracksuit-ink", id: "club-tracksuit", name: "Club Tracksuit", category: "Sets", type: "Jacket and jogger set", material: "Coordinated brushed fleece", image: "/campaign-hoodie-track.png", amount: 22500, colour: "Ink", collarColour: "Ink", cuffColour: "Ink", finish: "Clean", sleeve: "Long sleeve", branding: "K mark", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Matched cloth, dye lot and K icon" },
];

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
  const [category, setCategory] = useState<RetailCategory>("All");
  const [activeProduct, setActiveProduct] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const visibleProducts = useMemo(() => category === "All" ? products : products.filter((product) => product.category === category), [category]);

  const addStandardDesign = (product: RetailProduct) => {
    const size = selectedSizes[product.sku] ?? product.sizes[Math.min(2, product.sizes.length - 1)];
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      bodyColour: product.colour,
      collarColour: product.collarColour,
      cuffColour: product.cuffColour,
      sleeve: product.sleeve,
      branding: product.branding,
      fit: "Regular",
      finish: product.finish,
      size,
    });
    setMessage(`${product.name}, ${size}, added to your bag.`);
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
          return (
            <article className="retail-product-card" id={`product-${product.sku}`} key={product.sku}>
              <div className="retail-product-image">
                <Image className={product.crop ? `capsule-crop crop-${product.crop}` : undefined} src={product.image} alt={`${product.name} — ${product.type}`} fill sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw" unoptimized />
                {product.signatureOnImage && <ProductSignature branding={product.branding} signatureTone={product.signatureTone} />}
                <span>{product.category}</span>
                <b>Made to order</b>
              </div>
              <div className="retail-product-copy">
                <div><p>{product.type}</p><h3>{product.name}</h3></div>
                <strong>{formatGBP(product.amount)}</strong>
                <span>{product.material}</span>
                <small>{product.note}</small>
                <div className="retail-branding"><span>Signature</span><ProductSignature branding={product.branding} signatureTone="ink" /><b>{product.branding === "K mark" ? "Kinetic K icon" : "Full KALËTHON wordmark"}</b></div>
                <div className="retail-colourway" aria-label={`${product.name} colourway: ${product.colour} body, ${product.collarColour} collar, ${product.cuffColour} trim`}>
                  <i className={`swatch-${product.colour.toLowerCase()}`} /><i className={`swatch-${product.collarColour.toLowerCase()}`} /><b>{product.colour} / {product.collarColour}{product.cuffColour !== product.collarColour ? ` / ${product.cuffColour}` : ""}</b>
                </div>
              </div>
              <div className="retail-product-actions">
                <button type="button" aria-expanded={isOpen} onClick={() => setActiveProduct(isOpen ? null : product.sku)}>Choose size</button>
                <Link href="/try-on">Virtual try-on <span aria-hidden="true">↗</span></Link>
              </div>
              {isOpen && <div className="retail-quick-add">
                <div><b>Choose size</b><Link href="/measurements">Size guide</Link></div>
                <div className="retail-size-scroll" role="group" aria-label={`Choose ${product.name} size`}>
                  {product.sizes.map((size) => <button className={selectedSize === size ? "is-selected" : ""} type="button" aria-pressed={selectedSize === size} onClick={() => setSelectedSizes((current) => ({ ...current, [product.sku]: size }))} key={size}>{size}</button>)}
                </div>
                <button className="retail-add-button" type="button" onClick={() => addStandardDesign(product)}>Add {selectedSize} to bag · {formatGBP(product.amount)}</button>
                <small>Finished design: {product.colour} body, {product.collarColour} collar, {product.cuffColour} trim, {product.finish.toLowerCase()}, regular fit and {product.branding === "K mark" ? "discreet Kinetic K chest mark" : "aligned full KALËTHON wordmark"}.</small>
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
