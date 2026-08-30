export const storeColours = ["Bone", "Ink", "Navy", "Oxblood", "Sage", "Stone"] as const;
export const storeBranding = ["K mark", "KALËTHON wordmark"] as const;
export const storeFits = ["Athletic", "Regular", "Relaxed"] as const;
export const storeFinishes = ["Clean", "Contrast trim", "Sport piping"] as const;
export const storeSleeves = ["Not applicable", "Sleeveless", "Short sleeve", "Long sleeve"] as const;

export const customProductCatalog = {
  "court-polo": { name: "Custom Court Polo", amount: 8500, image: "/customise/polo-short.webp" },
  "performance-tee": { name: "Custom Performance Tee", amount: 6800, image: "/customise/performance-tee-short.png" },
  "performance-tank": { name: "Custom Performance Tank", amount: 6400, image: "/customise/performance-tank.png" },
  "poise-hoodie": { name: "Custom Poise Hoodie", amount: 12500, image: "/try-on/poise-hoodie.jpg" },
  "track-jacket": { name: "Custom Track Jacket", amount: 14500, image: "/try-on/track-jacket.jpg" },
  "motion-jogger": { name: "Custom Motion Jogger", amount: 11000, image: "/try-on/motion-jogger.jpg" },
  "club-tracksuit": { name: "Custom Club Tracksuit", amount: 22500, image: "/campaign-hoodie-track.png" },
  "court-short": { name: "Custom Court Short", amount: 7800, image: "/try-on/court-short.jpg" },
  "court-skirt": { name: "Custom Court Skort", amount: 9200, image: "/try-on/court-skirt.jpg" },
} as const;

export type CustomProductId = keyof typeof customProductCatalog;
export type StoreColour = (typeof storeColours)[number];
export type StoreBranding = (typeof storeBranding)[number];
export type StoreFit = (typeof storeFits)[number];
export type StoreFinish = (typeof storeFinishes)[number];
export type StoreSleeve = (typeof storeSleeves)[number];

export type BagItem = {
  id: string;
  productId: CustomProductId;
  name: string;
  image: string;
  quantity: number;
  bodyColour: StoreColour;
  collarColour: StoreColour;
  cuffColour: StoreColour;
  sleeve: StoreSleeve;
  branding: StoreBranding;
  fit: StoreFit;
  finish: StoreFinish;
  size: string;
};

export function unitAmountFor(item: Pick<BagItem, "productId" | "sleeve" | "branding">) {
  const product = customProductCatalog[item.productId];
  const sleeveUpgrade = item.sleeve === "Long sleeve" && ["court-polo", "performance-tee"].includes(item.productId) ? 1000 : 0;
  const brandingUpgrade = item.branding === "KALËTHON wordmark" ? 800 : 0;
  return product.amount + sleeveUpgrade + brandingUpgrade;
}

export function formatGBP(amount: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(amount / 100);
}
