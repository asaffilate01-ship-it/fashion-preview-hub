import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

test("bag lines remain distinct for different managed SKUs", () => {
  const bag = source("components/bag-provider.tsx");
  assert.ok(bag.includes("next.sku ? item.sku === next.sku"));
  assert.ok(bag.includes("!item.sku && item.productId === next.productId"));
});

test("colour options require published inventory before purchase", () => {
  const retail = source("components/retail-collection.tsx");
  assert.ok(retail.includes("const optionPublished = catalogueReady"));
  assert.ok(retail.includes('typeof selectedColourway.tracked === "boolean"'));
  assert.ok(retail.includes("disabled={!canPurchase}"));
  assert.ok(retail.includes("Colourway coming soon"));
});

test("checkout fails closed on unknown stock and validates fixed featured variants", () => {
  const checkout = source("app/api/checkout/route.ts");
  assert.ok(checkout.includes("if (!item.sku) return null"));
  assert.ok(checkout.includes("featuredProducts.find"));
  assert.ok(checkout.includes("item.bodyColour !== featured.colour"));
  assert.ok(checkout.includes("item.productId !== featured.productId"));
  assert.ok(checkout.includes("!featured.sizes.includes(item.size)"));
  assert.ok(checkout.includes("const requested = new Map"));
  assert.ok(checkout.includes("item.quantity > item.available"));
  assert.ok(!checkout.includes("const fallback = customProductCatalog[item.productId"));
});

test("catalogue pages share one merchandising source and colourways are selectable", () => {
  const page = source("app/collections/[slug]/page.tsx");
  const featured = source("lib/featured-products.ts");
  const details = source("app/products/[slug]/product-detail-client.tsx");
  assert.ok(page.includes("featuredProducts.filter"));
  assert.ok(featured.includes("getFeaturedColourways"));
  assert.ok(details.includes("getFeaturedColourways(product)"));
  assert.ok(details.includes("styles.activeColour"));
  assert.ok(details.includes("disabled={!available || !size || !bagReady}"));
});
