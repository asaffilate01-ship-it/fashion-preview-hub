export const storeColours = ["Bone", "Ink", "Navy", "Oxblood", "Sage", "Stone"] as const;
export const storeBranding = ["K mark", "KALËTHON wordmark"] as const;
export const storeFits = ["Athletic", "Regular", "Relaxed"] as const;
export const storeFinishes = ["Clean", "Contrast trim", "Sport piping"] as const;
export const storeSleeves = ["Not applicable", "Sleeveless", "Short sleeve", "Long sleeve"] as const;

export const customProductCatalog = {
  "court-polo": { name: "Court Polo", amount: 8500, image: "/catalog/court-polo-k.webp" },
  "casual-polo": { name: "Casual Contrast Polo", amount: 8500, image: "/campaign-polo.png" },
  "golf-polo": { name: "Links Golf Polo", amount: 8500, image: "/collections/golf.jpg" },
  "tennis-polo": { name: "Baseline Tennis Polo", amount: 8500, image: "/collections/tennis.jpg" },
  "performance-tee": { name: "Performance Tee", amount: 6800, image: "/try-on/form-tee.jpg" },
  "performance-tank": { name: "Performance Tank", amount: 6400, image: "/customise/performance-tank.png" },
  "poise-hoodie": { name: "Poise Pullover Hoodie", amount: 12500, image: "/catalog/poise-pullover-hoodie.webp" },
  "club-zip-hoodie": { name: "Club Zip Hoodie", amount: 13300, image: "/catalog/club-zip-hoodie-clean.png" },
  "track-jacket": { name: "Track Jacket", amount: 14500, image: "/try-on/track-jacket.jpg" },
  "motion-jogger": { name: "Motion Jogger", amount: 11000, image: "/try-on/motion-jogger.jpg" },
  "club-tracksuit": { name: "Club Tracksuit", amount: 22500, image: "/campaign-hoodie-track.png" },
  "court-short": { name: "Court Short", amount: 7800, image: "/try-on/court-short-photo.webp" },
  "court-skirt": { name: "Court Skort", amount: 9200, image: "/try-on/court-skort-photo.webp" },
} as const;

export type CustomProductId = keyof typeof customProductCatalog;
export type StoreColour = (typeof storeColours)[number];
export type StoreBranding = (typeof storeBranding)[number];
export type StoreFit = (typeof storeFits)[number];
export type StoreFinish = (typeof storeFinishes)[number];
export type StoreSleeve = (typeof storeSleeves)[number];

export type BagItem = {
  id: string;
  productId: string;
  sku?: string;
  unitAmount?: number;
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

export function unitAmountFor(item: Pick<BagItem, "productId" | "sleeve" | "branding" | "unitAmount">) {
  if (Number.isInteger(item.unitAmount) && Number(item.unitAmount) >= 0) return Number(item.unitAmount);
  const product = customProductCatalog[item.productId as CustomProductId];
  if (!product) return 0;
  const sleeveUpgrade = item.sleeve === "Long sleeve" && ["court-polo", "casual-polo", "golf-polo", "tennis-polo", "performance-tee"].includes(item.productId) ? 1000 : 0;
  const brandingUpgrade = item.branding === "KALËTHON wordmark" ? 800 : 0;
  return product.amount + sleeveUpgrade + brandingUpgrade;
}

export function formatGBP(amount: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(amount / 100);
}
