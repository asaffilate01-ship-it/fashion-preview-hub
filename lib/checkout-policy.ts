/**
 * Checkout policy stays independent of Stripe and the database so we can test it
 * without connecting a payment account or exposing customer records.
 *
 * These are the product families used by the finished, publicly displayed
 * catalogue. The database is still authoritative for actual product identity,
 * publication state, price and availability.
 */
const publishedVariantIds: Record<string, readonly string[]> = {
  "court-polo": ["court-polo-bone", "court-polo-oxblood"],
  "casual-polo": ["casual-contrast-polo"],
  "golf-polo": ["links-golf-polo"],
  "tennis-polo": ["baseline-tennis-polo"],
  "performance-tee": ["performance-tee-ink"],
  "poise-hoodie": ["poise-hoodie-bone", "poise-hoodie-sage", "club-hoodie-bone"],
  "club-zip-hoodie": ["club-zip-hoodie", "club-zip-hoodie-stone"],
  "motion-jogger": ["motion-jogger-stone"],
  "court-short": ["court-short-navy"],
  "court-skirt": ["court-skirt-oxblood"],
  "club-tracksuit": ["club-tracksuit-ink"],
};

/** Resolve older direct-buy payloads that contain only a product family. */
export function requestedCatalogueReference(productId: string, sku?: string) {
  const reference = sku?.trim();
  return reference || publishedVariantIds[productId]?.[0] || productId;
}

/** Prevent one product's client-supplied identifier from purchasing another product. */
export function matchesPublishedProduct(productId: string, managedProductId: string) {
  return productId === managedProductId || Boolean(publishedVariantIds[productId]?.includes(managedProductId));
}

export type StockLine = {
  productKey: string;
  quantity: number;
  tracked: boolean;
  available: number;
};

/**
 * Stock checks must aggregate quantities for repeated variants in the same bag.
 * This is a checkout-time check, not an inventory reservation across simultaneous
 * checkout sessions. Reservations require a separate transactional stock workflow.
 */
export function exceedsAvailableStock(lines: readonly StockLine[]) {
  const quantities = new Map<string, { requested: number; available: number }>();
  for (const line of lines) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1) return true;
    if (!line.tracked) continue;
    if (!Number.isFinite(line.available) || line.available < 0) return true;
    const current = quantities.get(line.productKey);
    quantities.set(line.productKey, {
      requested: (current?.requested ?? 0) + line.quantity,
      available: Math.min(current?.available ?? line.available, line.available),
    });
  }
  return [...quantities.values()].some(({ requested, available }) => requested > available);
}
