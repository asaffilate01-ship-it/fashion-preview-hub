export type JournalArticle = {
  slug: string;
  category: "Sport" | "Clothing" | "Cities";
  title: string;
  dek: string;
  description: string;
  image: string;
  imageAlt: string;
  readTime: string;
  keywords: string[];
  sections: Array<{ heading: string; paragraphs: string[] }>;
};

export const journalArticles: JournalArticle[] = [
  {
    slug: "tennis-clothing-from-court-to-city",
    category: "Sport",
    title: "Tennis clothing that moves from court to city",
    dek: "A practical wardrobe for the first serve, the final set and everything after.",
    description: "How to choose premium tennis clothing that performs on court and still looks composed in the city.",
    image: "/collections/tennis.jpg",
    imageAlt: "Kalëthon tennis clothing in a refined court setting",
    readTime: "5 min read",
    keywords: ["tennis clothing UK", "premium tennis polo", "tennis outfit", "court to city sportswear"],
    sections: [
      { heading: "Start with cloth, not decoration", paragraphs: ["A tennis top should release heat, recover after repeated movement and remain opaque under stretch. Look for a stable knit, controlled elastane and seams that sit away from high-friction points.", "For a sport-to-city wardrobe, restraint matters. Quiet trims, a balanced collar and a clean hem travel further than oversized graphics."] },
      { heading: "Build a three-layer system", paragraphs: ["Use a breathable polo or performance top as the base, a light track jacket between matches and a structured hoodie for the journey home. Every layer should work independently.", "Short, long and sleeveless tops serve different conditions. A full-length tank offers airflow without exposing the midriff; a long sleeve adds coverage without needing a separate base layer."] },
      { heading: "Fit for movement", paragraphs: ["Choose enough ease across the upper back for serving, while keeping the shoulder seam close to the natural shoulder point. Trousers and joggers need recovery through the knee and seat so the silhouette does not collapse after play."] },
    ],
  },
  {
    slug: "what-gsm-means-for-premium-sportswear",
    category: "Clothing",
    title: "What GSM really means in premium sportswear",
    dek: "Fabric weight is useful—but it never tells the whole story.",
    description: "A clear guide to GSM, fabric construction, recovery, pilling and colourfastness for premium sportswear.",
    image: "/campaign-graphic-tees.png",
    imageAlt: "Premium Kalëthon jersey garments showing substantial fabric texture",
    readTime: "6 min read",
    keywords: ["sportswear GSM guide", "hoodie fabric weight", "polo shirt GSM", "premium clothing quality"],
    sections: [
      { heading: "GSM is weight per square metre", paragraphs: ["GSM describes fabric mass, not automatic quality. A compact 240 GSM jersey can feel cleaner and recover better than a loosely knitted 300 GSM cloth.", "Compare weight alongside fibre length, yarn twist, knit density and finishing. Those choices determine whether the garment remains composed after washing."] },
      { heading: "Useful starting ranges", paragraphs: ["Performance tops often sit around 180–250 GSM, premium polos around 200–240 GSM and substantial hoodies around 400–500 GSM. Climate, activity and silhouette should decide the final specification."] },
      { heading: "Ask for test results", paragraphs: ["A manufacturing pack should define shrinkage, pilling, wash colourfastness, seam strength, stretch recovery and shade tolerance. Approval should happen on the actual fabric, lab dip and pre-production garment—not a digital colour alone."] },
    ],
  },
  {
    slug: "padel-clothing-guide",
    category: "Sport",
    title: "The considered guide to padel clothing",
    dek: "Fast turns, short reactions and clothing that never gets in the way.",
    description: "What to wear for padel: performance tops, modest shorts, joggers and layers designed for fast movement.",
    image: "/collections/padel.jpg",
    imageAlt: "Kalëthon padel clothing beside a glass court",
    readTime: "4 min read",
    keywords: ["padel clothing", "padel outfit UK", "men's padel clothing", "women's modest padel wear"],
    sections: [
      { heading: "Design for rotation", paragraphs: ["Padel demands rapid changes of direction and repeated trunk rotation. Tops need clean armholes and enough upper-back ease; bottoms need stable waist construction and four-way stretch."] },
      { heading: "Choose coverage deliberately", paragraphs: ["Full-length joggers and trousers can perform well when the cloth is light and the knee is articulated. For shorts and skorts, opaque integrated liners improve comfort and confidence without relying on excessively short cuts."] },
      { heading: "One outfit beyond the court", paragraphs: ["A quiet performance top, matte track jacket and clean jogger can move directly into travel or casual settings. This is the logic behind Kalëthon's glass-court edit."] },
    ],
  },
  {
    slug: "london-sportswear-style-guide",
    category: "Cities",
    title: "London sportswear: prepared for four seasons in one day",
    dek: "A city wardrobe built around adaptable weight, quiet colour and useful layers.",
    description: "A London sportswear style guide covering premium polos, technical jackets, hoodies and trousers for changing weather.",
    image: "/look-men.png",
    imageAlt: "Kalëthon polo and jogger look in an urban court setting",
    readTime: "5 min read",
    keywords: ["London sportswear brand", "British sportswear", "London tennis clothing", "premium athleisure London"],
    sections: [
      { heading: "Layer without bulk", paragraphs: ["London rewards garments that can be added and removed easily. Start with a breathable top, add a compact track jacket and keep a substantial hoodie for cooler journeys."] },
      { heading: "Use a restrained palette", paragraphs: ["Ink, navy, stone, sage and oxblood combine easily while still feeling distinctive. Keeping colour controlled also makes technical clothing easier to wear in work, travel and hospitality settings."] },
      { heading: "Respect the transition", paragraphs: ["The best city sportswear does not look like a costume away from sport. Balanced proportions, matte surfaces and small signatures make the transition feel natural."] },
    ],
  },
  {
    slug: "dubai-hot-weather-sportswear",
    category: "Cities",
    title: "Dubai sportswear for heat, shade and air conditioning",
    dek: "Breathable outside, composed inside, and modest throughout the day.",
    description: "How to select modest, breathable premium sportswear for Dubai's heat and heavily air-conditioned interiors.",
    image: "/campaign-polo.png",
    imageAlt: "Premium Kalëthon polos and trousers in warm architectural light",
    readTime: "5 min read",
    keywords: ["Dubai sportswear", "UAE modest sportswear", "hot weather polo shirt", "breathable premium clothing UAE"],
    sections: [
      { heading: "Prioritise moisture transport", paragraphs: ["In high heat, fabric must spread moisture and dry quickly without becoming transparent. Dense but breathable interlock and fine performance piqué can offer both coverage and comfort."] },
      { heading: "Keep one light layer", paragraphs: ["Air-conditioned interiors can feel dramatically cooler. A compact long-sleeve top or light track jacket gives useful coverage without the bulk of winter fleece."] },
      { heading: "Measure rather than convert", paragraphs: ["UAE retail labels vary by brand. Use chest, waist, hip and inside-leg measurements as the source of truth, then treat UK, EU and US equivalents as references only."] },
    ],
  },
  {
    slug: "new-york-sport-to-street-layers",
    category: "Cities",
    title: "New York sport-to-street layers",
    dek: "Structured essentials for long days, changing neighbourhoods and constant movement.",
    description: "A New York sportswear layering guide with premium tees, hoodies, track jackets and trousers.",
    image: "/collections/casual.jpg",
    imageAlt: "Kalëthon casual sportswear with structured city-ready layers",
    readTime: "4 min read",
    keywords: ["New York sportswear", "premium street sportswear", "sport to street clothing", "city athleisure"],
    sections: [
      { heading: "Choose pieces that earn their space", paragraphs: ["A city wardrobe works harder when every piece can be worn alone. Start with a substantial tee, add a track jacket for wind and carry a hoodie when the temperature drops."] },
      { heading: "Balance volume", paragraphs: ["Pair a relaxed hoodie with a cleaner trouser, or an athletic top with a fuller jogger. Keeping one half controlled prevents the silhouette from feeling careless."] },
      { heading: "Signatures should stay quiet", paragraphs: ["A small embroidered mark can identify the garment without dominating it. Reserve larger wordmarks for deliberate graphic editions."] },
    ],
  },
];

export function getJournalArticle(slug: string) {
  return journalArticles.find((article) => article.slug === slug);
}
