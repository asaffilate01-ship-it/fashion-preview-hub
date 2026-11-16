export type CollectionVisual = {
  src: string;
  alt: string;
  concept: boolean;
};

export type DepartmentEditorial = {
  lead: string;
  visual: CollectionVisual;
  categories: CollectionVisual[];
  caption: string;
};

const photo = (src: string, alt: string): CollectionVisual => ({ src, alt, concept: false });
const concept = (src: string, alt: string): CollectionVisual => ({ src, alt, concept: true });

export const departmentEditorial: Record<string, DepartmentEditorial> = {
  men: {
    lead: "Tailored ease. Everyday distinction.",
    visual: photo("/media/campaign-polo-1586.webp", "KALËTHON polo campaign photography"),
    caption: "Refined clothing for life beyond the court.",
    categories: [
      photo("/media/campaign-polo-960.webp", "KALËTHON premium polo and shirt styling"),
      photo("/media/campaign-hoodie-track-960.webp", "KALËTHON premium hoodies and matching sweats"),
      concept("/editorial/outerwear.svg", "Illustrated concept of KALËTHON insulated outerwear"),
      concept("/editorial/accessories.svg", "Illustrated concept of KALËTHON caps, beanies and socks"),
    ],
  },
  women: {
    lead: "Quiet confidence. Uncompromising movement.",
    visual: photo("/look-women.png", "KALËTHON women's collection campaign"),
    caption: "Sport-inspired elegance and easy layering.",
    categories: [
      photo("/look-women.png", "KALËTHON women's wardrobe styling"),
      photo("/campaign-hoodie-track.png", "KALËTHON premium sweatshirt and tracksuit collection"),
      concept("/editorial/outerwear.svg", "Illustrated concept of premium technical outerwear"),
    ],
  },
  sport: {
    lead: "Performance in its most considered form.",
    visual: photo("/campaign/hero-tennis-golf-v2.jpg", "KALËTHON tennis and golf campaign"),
    caption: "The court, the course and everything between.",
    categories: [
      photo("/collections/tennis.jpg", "KALËTHON tennis collection photograph"),
      photo("/collections/golf.jpg", "KALËTHON golf collection photograph"),
      photo("/campaign/hero-casual-motion-v2.jpg", "KALËTHON movement and training campaign"),
    ],
  },
  leather: {
    lead: "Designed to travel beautifully.",
    visual: concept("/editorial/leather-bags.svg", "Original illustration of a luxury leather weekender bag"),
    caption: "A leather goods collection in development.",
    categories: [
      concept("/editorial/leather-bags.svg", "Original concept illustration of a leather weekender"),
      concept("/editorial/leather-small.svg", "Original concept illustration of wallets and cardholders"),
    ],
  },
  fight: {
    lead: "Every detail earns its place.",
    visual: concept("/editorial/fight-gloves.svg", "Original concept illustration of boxing gloves"),
    caption: "Professional combat equipment in development.",
    categories: [
      concept("/editorial/fight-gloves.svg", "Original boxing and MMA gloves illustration"),
      concept("/editorial/fight-training.svg", "Original illustration of a training punching bag"),
      concept("/editorial/fight-apparel.svg", "Original concept illustration of MMA clothing"),
    ],
  },
  "team-pro": {
    lead: "A team identity, beautifully executed.",
    visual: concept("/editorial/team-kit.svg", "Original illustration of a personalised match kit"),
    caption: "Bespoke club and sublimation services in development.",
    categories: [
      concept("/editorial/team-kit.svg", "Original football and cricket team kit illustration"),
      concept("/editorial/team-design.svg", "Original illustration of a personalised sublimated jersey design"),
      concept("/editorial/team-workflow.svg", "Original illustration of club production approvals"),
    ],
  },
};

export function getDepartmentEditorial(slug: string): DepartmentEditorial | undefined {
  return departmentEditorial[slug];
}
