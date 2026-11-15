export type KalethonDepartment = {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  categories: { title: string; products: string[] }[];
};

export const kalethonDepartments: KalethonDepartment[] = [
  { slug: "men", title: "Men", kicker: "Luxury essentials", description: "Refined staples, tailoring-inspired sportswear and considered outerwear for everyday life.", categories: [
    { title: "Polos & tops", products: ["Signature piqué polo", "Contrast-collar polo", "Long-sleeve polo", "Mercerised T-shirt", "Essential T-shirt", "Crewneck sweatshirt", "Fine fleece"] },
    { title: "Sweats & trousers", products: ["Pullover hoodie", "Full-zip hoodie", "Retro track jacket", "Tracksuit", "Jogging pants", "Cargo trousers"] },
    { title: "Outerwear", products: ["Insulated city jacket", "Technical down jacket", "Puffer jacket", "Quilted gilet", "Performance shell"] },
    { title: "Accessories", products: ["Socks", "Baseball cap", "Beanie"] }
  ] },
  { slug: "women", title: "Women", kicker: "Contemporary luxury", description: "Premium wardrobe essentials, confident layering and movement-ready pieces.", categories: [
    { title: "Polos & tops", products: ["Tailored piqué polo", "Classic polo", "Relaxed T-shirt", "Performance T-shirt", "Sweatshirt", "Fleece"] },
    { title: "Casual layers", products: ["Pullover hoodie", "Full-zip hoodie", "Tracksuit", "Jogging pants", "Cargo trousers"] },
    { title: "Outerwear & accessories", products: ["Insulated jacket", "Puffer jacket", "Quilted gilet", "Technical shell", "Socks", "Caps", "Beanies"] }
  ] },
  { slug: "sport", title: "Sport", kicker: "The performance collection", description: "Technical performance, refined fit and considered details for court, course and training.", categories: [
    { title: "Tennis", products: ["Tennis polos", "Technical shirts", "Tennis shorts", "Tennis skirts", "Tennis skorts", "Warm-up jacket"] },
    { title: "Golf", products: ["Golf polos", "Quarter-zip midlayers", "Golf trousers", "Golf shorts", "Performance gilet", "Golf outerwear"] },
    { title: "Training & running", products: ["Training shirts", "Technical shorts", "Training joggers", "Performance fleece", "Tracksuits"] }
  ] },
  { slug: "leather", title: "Leather", kicker: "Leather goods", description: "A focused collection of finely crafted leather accessories and travel essentials. No leather clothing or footwear.", categories: [
    { title: "Bags", products: ["Leather weekender", "Leather duffel bag", "Travel holdall", "Leather backpack", "Briefcase", "Messenger bag", "Crossbody bag", "Wash bag"] },
    { title: "Small leather goods", products: ["Bifold wallet", "Cardholder", "Passport holder", "Document holder", "Key case", "Leather belt"] }
  ] },
  { slug: "fight", title: "Fight", kicker: "Combat performance", description: "A specialist range for boxing, MMA, gyms and athletes. Technical specifications and protective testing must be approved before sale.", categories: [
    { title: "Gloves & protection", products: ["Boxing training gloves", "Sparring gloves", "MMA training gloves", "MMA competition gloves", "Boxing headgear", "Shin guards", "Groin protectors"] },
    { title: "Training & gym", products: ["Focus mitts", "Thai pads", "Kick shields", "Punching bags", "Speed balls", "Double-end balls", "Training bags"] },
    { title: "Fight apparel", products: ["Boxing shorts", "MMA shorts", "Rash guards", "Training shirts", "Walkout hoodies"] }
  ] },
  { slug: "team-pro", title: "Team & Pro", kicker: "For teams and institutions", description: "Professional sublimation, club collections and custom kits, with approvals and bulk ordering to follow.", categories: [
    { title: "Team kits", products: ["Football match kits", "Football training wear", "Cricket match whites", "Cricket coloured kits", "Rugby kits", "Basketball kits", "Volleyball kits"] },
    { title: "Custom manufacturing", products: ["Sublimated jerseys", "Team shorts", "Custom tracksuits", "Embroidered polos", "Club hoodies", "Staff uniforms", "Team bags"] },
    { title: "Team services", products: ["Club storefronts", "Player names and numbers", "Logo placement", "Bulk quotation", "Artwork approval"] }
  ] }
];

export function getKalethonDepartment(slug: string) {
  return kalethonDepartments.find((department) => department.slug === slug);
}
