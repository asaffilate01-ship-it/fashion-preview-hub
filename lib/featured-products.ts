import type { StoreColour, StoreBranding, StoreFinish, StoreSleeve } from "@/lib/store";

export type FeaturedProduct = {
  slug: string;
  sku: string;
  productId: string;
  title: string;
  category: string;
  material: string;
  image: string;
  description: string;
  colour: StoreColour;
  collar: StoreColour;
  cuff: StoreColour;
  sleeve: StoreSleeve;
  branding: StoreBranding;
  finish: StoreFinish;
  sizes: readonly string[];
};

const regular = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;
const waist = ["28R", "30R", "32R", "34R", "36R", "38R", "40R", "42R"] as const;
const women = ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18", "UK 20", "UK 22", "UK 24"] as const;

export const featuredProducts: FeaturedProduct[] = [
  { slug:"court-polo-bone",sku:"KAL-POLO-BONE",productId:"court-polo",title:"Court Polo",category:"Polos",material:"220 GSM mercerised cotton piqué",image:"/catalog/court-polo-k.webp",description:"A refined everyday polo with structured cotton, contrast collar and signature K mark.",colour:"Bone",collar:"Navy",cuff:"Navy",sleeve:"Short sleeve",branding:"K mark",finish:"Contrast trim",sizes:regular },
  { slug:"court-polo-oxblood",sku:"KAL-POLO-OXB",productId:"court-polo",title:"Court Polo — Oxblood",category:"Polos",material:"220 GSM mercerised cotton piqué",image:"/catalog/court-polo-oxblood.webp",description:"Rich oxblood piqué with bone collar and cuff details.",colour:"Oxblood",collar:"Bone",cuff:"Bone",sleeve:"Short sleeve",branding:"K mark",finish:"Contrast trim",sizes:regular },
  { slug:"casual-contrast-polo",sku:"KAL-CASUAL-OXB",productId:"casual-polo",title:"Casual Contrast Polo",category:"Polos",material:"240 GSM cotton piqué",image:"/media/campaign-polo-960.webp",description:"Relaxed luxury piqué with a subtle chest signature.",colour:"Oxblood",collar:"Oxblood",cuff:"Oxblood",sleeve:"Short sleeve",branding:"K mark",finish:"Clean",sizes:regular },
  { slug:"links-golf-polo",sku:"KAL-GOLF-SAGE",productId:"golf-polo",title:"Links Golf Polo",category:"Golf",material:"175 GSM stretch performance piqué",image:"/collections/golf.jpg",description:"A performance golf polo designed for movement and a clean clubhouse silhouette.",colour:"Sage",collar:"Sage",cuff:"Sage",sleeve:"Short sleeve",branding:"K mark",finish:"Sport piping",sizes:regular },
  { slug:"baseline-tennis-polo",sku:"KAL-TENNIS-BONE",productId:"tennis-polo",title:"Baseline Tennis Polo",category:"Tennis",material:"175 GSM stretch jersey",image:"/collections/tennis.jpg",description:"Lightweight tennis polo with considered contrast detailing.",colour:"Bone",collar:"Oxblood",cuff:"Oxblood",sleeve:"Short sleeve",branding:"K mark",finish:"Contrast trim",sizes:regular },
  { slug:"performance-tee-ink",sku:"KAL-TEE-INK",productId:"performance-tee",title:"Performance Tee",category:"Tops",material:"Technical stretch jersey",image:"/try-on/form-tee.jpg",description:"Everyday technical tee featuring the KALËTHON wordmark.",colour:"Ink",collar:"Ink",cuff:"Ink",sleeve:"Short sleeve",branding:"KALËTHON wordmark",finish:"Clean",sizes:regular },
  { slug:"poise-hoodie-bone",sku:"KAL-HOOD-BONE",productId:"poise-hoodie",title:"Poise Pullover Hoodie",category:"Layers",material:"420 GSM loopback cotton",image:"/catalog/poise-pullover-hoodie.webp",description:"Structured pullover hoodie with a discreet chest mark.",colour:"Bone",collar:"Bone",cuff:"Bone",sleeve:"Long sleeve",branding:"K mark",finish:"Clean",sizes:regular },
  { slug:"poise-hoodie-sage",sku:"KAL-HOOD-SAGE",productId:"poise-hoodie",title:"Poise Pullover Hoodie — Sage",category:"Layers",material:"420 GSM loopback cotton",image:"/catalog/poise-pullover-hoodie-sage.webp",description:"Heavyweight loopback cotton in heritage sage.",colour:"Sage",collar:"Sage",cuff:"Sage",sleeve:"Long sleeve",branding:"K mark",finish:"Clean",sizes:regular },
  { slug:"club-zip-hoodie",sku:"KAL-ZIP-NAVY",productId:"club-zip-hoodie",title:"Club Zip Hoodie",category:"Layers",material:"450 GSM brushed loopback",image:"/media/club-zip-hoodie-960.webp",description:"A premium full-zip hoodie with a restrained KALËTHON wordmark.",colour:"Navy",collar:"Navy",cuff:"Navy",sleeve:"Long sleeve",branding:"KALËTHON wordmark",finish:"Clean",sizes:regular },
  { slug:"club-zip-hoodie-stone",sku:"KAL-ZIP-STONE",productId:"club-zip-hoodie",title:"Club Zip Hoodie — Stone",category:"Layers",material:"450 GSM brushed loopback",image:"/catalog/club-zip-hoodie-stone.webp",description:"Structured zip hoodie finished in warm stone.",colour:"Stone",collar:"Stone",cuff:"Stone",sleeve:"Long sleeve",branding:"KALËTHON wordmark",finish:"Clean",sizes:regular },
  { slug:"motion-jogger-stone",sku:"KAL-JOG-STONE",productId:"motion-jogger",title:"Motion Jogger",category:"Bottoms",material:"Structured double-knit",image:"/try-on/motion-jogger.jpg",description:"A versatile full-length jogger with articulated shape.",colour:"Stone",collar:"Stone",cuff:"Stone",sleeve:"Not applicable",branding:"K mark",finish:"Clean",sizes:waist },
  { slug:"court-short-navy",sku:"KAL-SHORT-NAVY",productId:"court-short",title:"Court Short",category:"Tennis",material:"Four-way stretch woven shell",image:"/try-on/court-short-photo.webp",description:"Technical court shorts with an integrated liner.",colour:"Navy",collar:"Navy",cuff:"Navy",sleeve:"Not applicable",branding:"K mark",finish:"Clean",sizes:women },
  { slug:"court-skirt-oxblood",sku:"KAL-SKORT-OXB",productId:"court-skirt",title:"Court Skort",category:"Tennis",material:"Stretch woven construction",image:"/try-on/court-skort-photo.webp",description:"Tennis skirt with integrated coverage shorts.",colour:"Oxblood",collar:"Oxblood",cuff:"Oxblood",sleeve:"Not applicable",branding:"K mark",finish:"Clean",sizes:women },
  { slug:"club-tracksuit-ink",sku:"KAL-SET-INK",productId:"club-tracksuit",title:"Club Tracksuit",category:"Sets",material:"Coordinated brushed fleece",image:"/media/campaign-hoodie-track-960.webp",description:"A coordinated track set for sport and city.",colour:"Ink",collar:"Ink",cuff:"Ink",sleeve:"Long sleeve",branding:"K mark",finish:"Clean",sizes:regular },
];

export function getFeaturedProduct(slug: string) {
  return featuredProducts.find((item) => item.slug === slug);
}
