export type SportCollection = {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  image: string;
  keywords: string[];
  products: { name: string; category: string; detail: string; price: string }[];
};

export const sportCollections: SportCollection[] = [
  {
    slug: "tennis", name: "Tennis", eyebrow: "Baseline to clubhouse", image: "/collections/tennis.jpg",
    description: "Premium tennis clothing for considered movement: polos, training tops, shorts, skorts and warm-up layers built for the court and composed beyond it.",
    keywords: ["tennis clothing", "tennis shirts", "tennis shorts", "tennis training tops", "tennis skorts"],
    products: [
      { name: "Court Polo", category: "Shirts", detail: "Mercerised piqué · short or long sleeve", price: "£85" },
      { name: "Performance Tee", category: "Training tops", detail: "Compact technical jersey", price: "£68" },
      { name: "Court Short", category: "Shorts", detail: "Four-way stretch · modest liner", price: "£78" },
      { name: "Court Skort", category: "Skirts & skorts", detail: "Woven skirt · integrated short", price: "£92" },
      { name: "Track Jacket", category: "Warm-up layers", detail: "Matte technical twill", price: "£145" },
      { name: "Motion Jogger", category: "Warm-up trousers", detail: "Structured double-knit", price: "£110" },
    ],
  },
  {
    slug: "golf", name: "Golf", eyebrow: "First tee to final round", image: "/collections/golf.jpg",
    description: "Refined golf clothing with breathable polos, long-sleeve layers, stretch trousers and quiet club-ready construction.",
    keywords: ["golf clothing", "golf polos", "golf shirts", "golf trousers", "golf quarter zip"],
    products: [
      { name: "Links Polo", category: "Golf shirts", detail: "Performance interlock · short sleeve", price: "£88" },
      { name: "Links Long-Sleeve Polo", category: "Golf shirts", detail: "Performance interlock · long sleeve", price: "£98" },
      { name: "Links Quarter-Zip", category: "Midlayers", detail: "Fine-gauge technical knit", price: "£125" },
      { name: "Links Trouser", category: "Golf trousers", detail: "Four-way stretch woven cloth", price: "£135" },
      { name: "Travel Gilet", category: "Outer layers", detail: "Lightweight weather-resistant shell", price: "£150" },
    ],
  },
  {
    slug: "padel", name: "Padel", eyebrow: "Cut for the glass court", image: "/collections/padel.jpg",
    description: "Technical padel clothing for fast exchanges: breathable shirts, sleeveless training tops, shorts and recovery layers.",
    keywords: ["padel clothing", "padel shirts", "padel shorts", "padel training tops", "padel apparel"],
    products: [
      { name: "Glass Court Tee", category: "Shirts", detail: "Fast-dry technical jersey", price: "£68" },
      { name: "Performance Tank", category: "Sleeveless tops", detail: "Full-length modest cut", price: "£64" },
      { name: "Court Short", category: "Shorts", detail: "Four-way stretch · secure pockets", price: "£78" },
      { name: "Track Jacket", category: "Warm-up layers", detail: "Matte technical twill", price: "£145" },
      { name: "Motion Jogger", category: "Recovery trousers", detail: "Structured double-knit", price: "£110" },
    ],
  },
  {
    slug: "pickleball", name: "Pickleball", eyebrow: "A lighter court edit", image: "/collections/pickleball.jpg",
    description: "Premium pickleball clothing balancing court-ready polos, tees, shorts, skorts and easy post-match layers.",
    keywords: ["pickleball clothing", "pickleball shirts", "pickleball shorts", "pickleball outfits"],
    products: [
      { name: "Rally Polo", category: "Shirts", detail: "Breathable mercerised piqué", price: "£85" },
      { name: "Form Tee", category: "Training tops", detail: "Compact performance jersey", price: "£68" },
      { name: "Court Short", category: "Shorts", detail: "Four-way stretch · modest liner", price: "£78" },
      { name: "Court Skort", category: "Skirts & skorts", detail: "Integrated performance short", price: "£92" },
      { name: "Poise Hoodie", category: "Post-match layers", detail: "420 GSM loopback cotton", price: "£125" },
    ],
  },
  {
    slug: "running", name: "Running", eyebrow: "Miles with restraint", image: "/collections/casual.jpg",
    description: "Considered running clothing for steady miles and recovery: breathable tees, tanks, shorts, joggers and lightweight layers.",
    keywords: ["running clothing", "running shirts", "running tank tops", "running shorts", "running layers"],
    products: [
      { name: "Motion Tee", category: "Running tops", detail: "Fast-dry compact jersey", price: "£68" },
      { name: "Performance Tank", category: "Running vests", detail: "Full-length bound-armhole cut", price: "£64" },
      { name: "Motion Short", category: "Running shorts", detail: "Light stretch shell · secure liner", price: "£78" },
      { name: "Track Jacket", category: "Running layers", detail: "Weather-resistant technical twill", price: "£145" },
      { name: "Motion Jogger", category: "Recovery", detail: "Structured double-knit", price: "£110" },
    ],
  },
  {
    slug: "training", name: "Training", eyebrow: "Strength, mobility, recovery", image: "/campaign/hero-six-models-v2.jpg",
    description: "Premium training clothing with full-coverage tees, tanks, shorts, joggers and tracksuits designed for the gym and studio.",
    keywords: ["training clothing", "gym clothing", "training tops", "gym tank tops", "training shorts"],
    products: [
      { name: "Performance Tee", category: "Training tops", detail: "Short or long sleeve", price: "£68" },
      { name: "Performance Tank", category: "Sleeveless tops", detail: "Full-length modest silhouette", price: "£64" },
      { name: "Court Short", category: "Training shorts", detail: "Four-way stretch · modest liner", price: "£78" },
      { name: "Motion Jogger", category: "Training trousers", detail: "Articulated knee · secure pockets", price: "£110" },
      { name: "Club Tracksuit", category: "Warm-up sets", detail: "480 GSM coordinated two-piece", price: "£225" },
    ],
  },
];

export function getSportCollection(slug: string) {
  return sportCollections.find((collection) => collection.slug === slug);
}

