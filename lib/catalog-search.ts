import { customProductCatalog, type CustomProductId } from "./store";

/**
 * Stable storefront anchors. All references below correspond to actual
 * product-card IDs in RetailCollection. This index deliberately excludes
 * items hidden from the finished collection.
 */
const discoverableGarments: ReadonlyArray<{
  productId: CustomProductId;
  targetSku: string;
  keywords: string;
  collection: string;
}> = [
  { productId: "court-polo", targetSku: "court-polo-bone", collection: "Polos", keywords: "tennis golf court sports polo shirt short sleeve oxblood bone navy mercerised cotton" },
  { productId: "casual-polo", targetSku: "casual-contrast-polo", collection: "Polos", keywords: "casual smart collar contrast fashion city lifestyle polo" },
  { productId: "golf-polo", targetSku: "links-golf-polo", collection: "Polos", keywords: "links golf polo performance piqué fairway clubhouse sports shirt" },
  { productId: "tennis-polo", targetSku: "baseline-tennis-polo", collection: "Polos", keywords: "tennis baseline polo court racquet racket sport shirt recycled stretch" },
  { productId: "performance-tee", targetSku: "performance-tee-ink", collection: "Tops", keywords: "training exercise running gym technical t shirt tee tees short sleeve performance" },
  { productId: "poise-hoodie", targetSku: "poise-hoodie-bone", collection: "Layers", keywords: "pullover hoodie hooded jumper sweatshirt hoodies fleece loopback club zipless warm" },
  { productId: "club-zip-hoodie", targetSku: "club-zip-hoodie", collection: "Layers", keywords: "zip up zipper zipped zipup full zip hoodie hoodies jacket loopback navy stone club" },
  { productId: "motion-jogger", targetSku: "motion-jogger-stone", collection: "Bottoms", keywords: "jogging bottoms joggers trousers track pants running fleece legwear" },
  { productId: "club-tracksuit", targetSku: "club-tracksuit-ink", collection: "Sets", keywords: "club tracksuit two piece set jacket jogger track suit sporty matching travel" },
  { productId: "court-short", targetSku: "court-short-navy", collection: "Bottoms", keywords: "court short shorts training gym tennis padel modest lined stretch" },
  { productId: "court-skirt", targetSku: "court-skirt-oxblood", collection: "Bottoms", keywords: "court skort skirt tennis pickleball women ladies sports integrated shorts" },
];

export type GarmentSearchResult = {
  productId: CustomProductId;
  sku: string;
  name: string;
  image: string;
  collection: string;
  href: string;
};

const aliases: Record<string, string> = {
  hoodies: "hoodie",
  jumpers: "jumper",
  polos: "polo",
  trousers: "trouser",
  tees: "tee",
  tshirts: "tshirt",
  zipup: "zip",
  shorts: "short",
  skirts: "skirt",
  tops: "top",
};

export function normalizeSearchText(input: string) {
  return input.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function searchGarments(input: string): GarmentSearchResult[] {
  const normalized = normalizeSearchText(input.slice(0, 120));
  const terms = normalized.split(/\s+/).filter(Boolean).map((word) => aliases[word] ?? word);
  const results = discoverableGarments.flatMap((entry) => {
    const product = customProductCatalog[entry.productId];
    const name = normalizeSearchText(product.name);
    const haystack = normalizeSearchText(`KALËTHON ${product.name} ${entry.collection} ${entry.keywords}`);
    if (terms.length && !terms.every((term) => haystack.includes(term))) return [];
    const score = terms.length === 0 ? 0
      : (name.includes(normalized) ? 100 : 0)
        + terms.filter((term) => name.includes(term)).length * 20
        + terms.filter((term) => haystack.includes(term)).length;
    return [{
      result: {
        productId: entry.productId,
        sku: entry.targetSku,
        name: product.name,
        image: product.image,
        collection: entry.collection,
        href: `/#product-${entry.targetSku}`,
      } satisfies GarmentSearchResult,
      score,
    }];
  });
  return results.sort((a, b) => b.score - a.score).map(({ result }) => result);
}
