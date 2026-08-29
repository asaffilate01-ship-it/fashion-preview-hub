"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useBag } from "@/components/bag-provider";
import { formatGBP, type CustomProductId, type StoreColour, type StoreSleeve } from "@/lib/store";

type RetailCategory = "All" | "Tops" | "Layers" | "Bottoms" | "Sets";

type RetailProduct = {
  id: CustomProductId;
  name: string;
  category: Exclude<RetailCategory, "All">;
  type: string;
  material: string;
  image: string;
  amount: number;
  colour: StoreColour;
  sleeve: StoreSleeve;
  sizes: string[];
  note: string;
};

const categories: RetailCategory[] = ["All", "Tops", "Layers", "Bottoms", "Sets"];

const products: RetailProduct[] = [
  { id: "court-polo", name: "Court Polo", category: "Tops", type: "Mercerised polo", material: "220 GSM cotton piqué", image: "/customise/polo-short.webp", amount: 8500, colour: "Bone", sleeve: "Short sleeve", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Quiet K chest embroidery" },
  { id: "performance-tee", name: "Performance Tee", category: "Tops", type: "Technical T-shirt", material: "240 GSM performance jersey", image: "/try-on/form-tee.jpg", amount: 6800, colour: "Ink", sleeve: "Short sleeve", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Moisture-spreading stretch" },
  { id: "poise-hoodie", name: "Poise Hoodie", category: "Layers", type: "Pullover hoodie", material: "420 GSM loopback cotton", image: "/try-on/poise-hoodie.jpg", amount: 12500, colour: "Bone", sleeve: "Long sleeve", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Structured hood and cuffs" },
  { id: "track-jacket", name: "Track Jacket", category: "Layers", type: "Technical jacket", material: "Matte four-way stretch twill", image: "/try-on/track-jacket.jpg", amount: 14500, colour: "Navy", sleeve: "Long sleeve", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Two-way zip construction" },
  { id: "motion-jogger", name: "Motion Jogger", category: "Bottoms", type: "Full-length jogger", material: "Structured double-knit", image: "/try-on/motion-jogger.jpg", amount: 11000, colour: "Stone", sleeve: "Not applicable", sizes: ["28R", "30R", "32R", "34R", "36R", "38R", "40R", "42R"], note: "Articulated knee and zip pockets" },
  { id: "court-short", name: "Court Short", category: "Bottoms", type: "Lined sports short", material: "Four-way stretch woven shell", image: "/try-on/court-short.jpg", amount: 7800, colour: "Navy", sleeve: "Not applicable", sizes: ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18", "UK 20", "UK 22", "UK 24"], note: "Full-coverage integrated liner" },
  { id: "court-skirt", name: "Court Skort", category: "Bottoms", type: "Skirt and short", material: "Stretch woven construction", image: "/try-on/court-skirt.jpg", amount: 9200, colour: "Oxblood", sleeve: "Not applicable", sizes: ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18", "UK 20", "UK 22", "UK 24"], note: "Opaque built-in short" },
  { id: "club-tracksuit", name: "Club Tracksuit", category: "Sets", type: "Jacket and jogger set", material: "Coordinated brushed fleece", image: "/campaign-hoodie-track.png", amount: 22500, colour: "Ink", sleeve: "Long sleeve", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], note: "Matched cloth and dye lot" },
];

export default function RetailCollection() {
  const { addItem } = useBag();
  const [category, setCategory] = useState<RetailCategory>("All");
  const [activeProduct, setActiveProduct] = useState<CustomProductId | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const visibleProducts = useMemo(() => category === "All" ? products : products.filter((product) => product.category === category), [category]);

  const addStandardDesign = (product: RetailProduct) => {
    const size = selectedSizes[product.id] ?? product.sizes[Math.min(2, product.sizes.length - 1)];
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      bodyColour: product.colour,
      collarColour: product.colour,
      cuffColour: product.colour,
      sleeve: product.sleeve,
      branding: "K mark",
      fit: "Regular",
      finish: "Clean",
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
          <h2 id="pieces-title">The essential<br /><em>Kalëthon edit.</em></h2>
        </div>
        <div className="retail-heading-copy">
          <p>Filter the collection, choose your size and add the standard Kalëthon design—or open the studio to change every detail.</p>
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

      <div className="retail-product-grid" aria-live="polite">
        {visibleProducts.map((product) => {
          const isOpen = activeProduct === product.id;
          const selectedSize = selectedSizes[product.id] ?? product.sizes[Math.min(2, product.sizes.length - 1)];
          return (
            <article className="retail-product-card" key={product.id}>
              <div className="retail-product-image">
                <Image src={product.image} alt={`${product.name} — ${product.type}`} fill sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw" />
                <span>{product.category}</span>
                <b>Made to order</b>
              </div>
              <div className="retail-product-copy">
                <div><p>{product.type}</p><h3>{product.name}</h3></div>
                <strong>{formatGBP(product.amount)}</strong>
                <span>{product.material}</span>
                <small>{product.note}</small>
              </div>
              <div className="retail-product-actions">
                <button type="button" aria-expanded={isOpen} onClick={() => setActiveProduct(isOpen ? null : product.id)}>Quick add</button>
                <Link href="/customise">Customise <span aria-hidden="true">↗</span></Link>
              </div>
              {isOpen && <div className="retail-quick-add">
                <div><b>Choose size</b><Link href="/measurements">Size guide</Link></div>
                <div className="retail-size-scroll" role="group" aria-label={`Choose ${product.name} size`}>
                  {product.sizes.map((size) => <button className={selectedSize === size ? "is-selected" : ""} type="button" aria-pressed={selectedSize === size} onClick={() => setSelectedSizes((current) => ({ ...current, [product.id]: size }))} key={size}>{size}</button>)}
                </div>
                <button className="retail-add-button" type="button" onClick={() => addStandardDesign(product)}>Add {selectedSize} to bag · {formatGBP(product.amount)}</button>
                <small>Standard design: {product.colour}, regular fit, clean finish and small K mark.</small>
              </div>}
            </article>
          );
        })}
      </div>

      <p className="retail-message" role="status" aria-live="polite">{message}</p>
      <div className="retail-assurance" aria-label="Kalëthon shopping assurances">
        <span><b>01</b>International sizing</span>
        <span><b>02</b>Material specifications</span>
        <span><b>03</b>Private virtual try-on</span>
        <span><b>04</b>Secure checkout</span>
      </div>
    </section>
  );
}
