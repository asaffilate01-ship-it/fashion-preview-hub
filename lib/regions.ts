export type Region = {
  slug: string;
  name: string;
  market: "United States" | "United Kingdom" | "Europe" | "Middle East";
  currency: string;
  delivery: string;
  duties: string;
  intro: string;
  scene: string;
  clubs: string[];
  keywords: string[];
};

const usCity = (
  slug: string,
  name: string,
  scene: string,
  clubs: string[],
  extra: string[] = [],
): Region => ({
  slug,
  name,
  market: "United States",
  currency: "USD at checkout conversion, priced in GBP",
  delivery: "Tracked express from the UK, typically 3–5 working days",
  duties: "US import duties and sales tax are shown or settled at delivery",
  intro: `Premium British sport-to-city clothing delivered to ${name}. KALËTHON polos, hoodies, shorts and warm-up layers are made in considered standard colourways with international sizing and a private virtual try-on, so you can order from ${name} with confidence.`,
  scene,
  clubs,
  keywords: [
    `premium sportswear ${name}`,
    `tennis clothing ${name}`,
    `padel clothing ${name}`,
    `golf polo ${name}`,
    `British sportswear brand ${name}`,
    `luxury athleisure ${name}`,
    ...extra,
  ],
});

const euCountry = (slug: string, name: string, city: string, sport: string): Region => ({
  slug,
  name,
  market: "Europe",
  currency: "EUR at checkout conversion, priced in GBP",
  delivery: "Tracked European delivery from the UK, typically 3–6 working days",
  duties: "EU import VAT and duties may apply on arrival unless stated at checkout",
  intro: `Premium British sport-to-city clothing delivered across ${name}. From ${city} courts and clubs to everyday city wear, KALËTHON garments arrive in finished standard colourways with EU-friendly international sizing and a private virtual try-on.`,
  scene: `${sport} is the natural home for KALËTHON in ${name}, and every piece is cut to move from the club to the street without changing.`,
  clubs: [city],
  keywords: [
    `premium sportswear ${name}`,
    `British sportswear ${name}`,
    `tennis clothing ${name}`,
    `padel clothing ${name}`,
    `golf clothing ${name}`,
    `sportswear delivery ${name}`,
  ],
});

export const regions: Region[] = [
  usCity("new-york", "New York", "Indoor courts in Manhattan, padel in Brooklyn and long city walks between them.", ["Manhattan", "Brooklyn", "Hudson Yards"], ["sportswear NYC", "tennis clothing NYC"]),
  usCity("boston", "Boston", "Club tennis, river running and cold-weather layering across Back Bay and Cambridge.", ["Back Bay", "Cambridge", "Brookline"]),
  usCity("miami", "Miami", "Heat-forward padel and tennis, breathable piqué and quick-drying woven shorts.", ["Coral Gables", "Brickell", "Miami Beach"]),
  usCity("washington-dc", "Washington DC", "Club courts, golf outside the Beltway and a wardrobe that reads well in the city.", ["Georgetown", "Bethesda", "Arlington"]),
  usCity("chicago", "Chicago", "Indoor season racket sport, lakefront running and serious mid-layer weather.", ["Lincoln Park", "The Loop", "Evanston"]),
  usCity("los-angeles", "Los Angeles", "Year-round outdoor tennis and pickleball with light, structured layers for evenings.", ["Santa Monica", "Beverly Hills", "Pasadena"]),
  usCity("seattle", "Seattle", "Covered courts, damp mornings and technical layering that still looks composed.", ["Capitol Hill", "Bellevue", "Ballard"]),
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    market: "United Kingdom",
    currency: "GBP, inclusive of UK VAT",
    delivery: "Tracked UK delivery, typically 2–3 working days",
    duties: "No import duties — prices include UK VAT",
    intro: "KALËTHON is a British sport-to-city clothing label shipping across the whole of the United Kingdom — England, Scotland, Wales and Northern Ireland. Polos, hoodies, shorts and warm-up layers in finished standard colourways, with international sizing and a private virtual try-on.",
    scene: "Grass, clay and indoor seasons, links golf, padel courts and long city weeks: the range is built to hold up across all of it.",
    clubs: ["London", "Manchester", "Birmingham", "Edinburgh", "Glasgow", "Leeds", "Bristol", "Cardiff", "Belfast", "Brighton"],
    keywords: [
      "premium British sportswear",
      "British sportswear brand UK",
      "tennis clothing UK",
      "padel clothing UK",
      "golf polo UK",
      "London sportswear brand",
      "luxury athleisure UK",
    ],
  },
  euCountry("ireland", "Ireland", "Dublin", "Tennis and golf"),
  euCountry("france", "France", "Paris", "Tennis and padel"),
  euCountry("germany", "Germany", "Berlin", "Tennis and running"),
  euCountry("spain", "Spain", "Madrid", "Padel"),
  euCountry("italy", "Italy", "Milan", "Tennis and padel"),
  euCountry("netherlands", "Netherlands", "Amsterdam", "Padel and hockey-adjacent training"),
  euCountry("belgium", "Belgium", "Brussels", "Tennis and padel"),
  euCountry("portugal", "Portugal", "Lisbon", "Padel and golf"),
  euCountry("austria", "Austria", "Vienna", "Tennis and alpine training"),
  euCountry("sweden", "Sweden", "Stockholm", "Padel"),
  euCountry("denmark", "Denmark", "Copenhagen", "Padel and running"),
  euCountry("finland", "Finland", "Helsinki", "Indoor tennis"),
  euCountry("poland", "Poland", "Warsaw", "Tennis and training"),
  euCountry("czechia", "Czechia", "Prague", "Tennis"),
  euCountry("greece", "Greece", "Athens", "Tennis and padel"),
  euCountry("luxembourg", "Luxembourg", "Luxembourg City", "Tennis and golf"),
  euCountry("croatia", "Croatia", "Zagreb", "Tennis"),
  euCountry("slovenia", "Slovenia", "Ljubljana", "Tennis"),
  euCountry("slovakia", "Slovakia", "Bratislava", "Tennis"),
  euCountry("hungary", "Hungary", "Budapest", "Tennis and padel"),
  euCountry("romania", "Romania", "Bucharest", "Tennis"),
  euCountry("bulgaria", "Bulgaria", "Sofia", "Tennis"),
  euCountry("estonia", "Estonia", "Tallinn", "Indoor tennis"),
  euCountry("latvia", "Latvia", "Riga", "Indoor tennis"),
  euCountry("lithuania", "Lithuania", "Vilnius", "Indoor tennis"),
  euCountry("cyprus", "Cyprus", "Nicosia", "Tennis and padel"),
  euCountry("malta", "Malta", "Valletta", "Tennis and padel"),
  {
    slug: "united-arab-emirates",
    name: "United Arab Emirates",
    market: "Middle East",
    currency: "AED at checkout conversion, priced in GBP",
    delivery: "Tracked express to Dubai, Abu Dhabi and Sharjah, typically 3–5 working days",
    duties: "UAE customs duty and VAT may apply on arrival unless stated at checkout",
    intro: "Premium British sport-to-city clothing delivered across the United Arab Emirates. KALËTHON offers breathable piqué polos, longer-length and covered options, and quick-drying woven shorts suited to Gulf heat and air-conditioned clubs.",
    scene: "Padel across Dubai, tennis and golf in Abu Dhabi, and a wardrobe that stays composed between the club, the office and dinner.",
    clubs: ["Dubai", "Abu Dhabi", "Sharjah", "Dubai Marina", "Downtown Dubai"],
    keywords: [
      "premium sportswear Dubai",
      "padel clothing Dubai",
      "tennis clothing Abu Dhabi",
      "golf clothing UAE",
      "modest sportswear UAE",
      "British sportswear brand UAE",
    ],
  },
];

export const getRegion = (slug: string) => regions.find((region) => region.slug === slug);

export const regionGroups = [
  { label: "United States", market: "United States" as const },
  { label: "United Kingdom", market: "United Kingdom" as const },
  { label: "Europe", market: "Europe" as const },
  { label: "Middle East", market: "Middle East" as const },
];
