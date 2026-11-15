import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("featured products have unique route slugs and managed SKUs", () => {
  const source = read("lib/featured-products.ts");
  const slugs = [...source.matchAll(/slug:"([^"]+)"/g)].map((match) => match[1]);
  const skus = [...source.matchAll(/sku:"([^"]+)"/g)].map((match) => match[1]);
  assert.ok(slugs.length >= 15);
  assert.equal(slugs.length, new Set(slugs).size);
  assert.equal(skus.length, new Set(skus).size);
});

test("product detail blocks buying until live catalogue and inventory are checked", () => {
  const page = read("app/products/[slug]/product-detail-client.tsx");
  assert.ok(page.includes('fetch("/api/catalog"'));
  assert.ok(page.includes("entry.sku === product.sku"));
  assert.ok(page.includes("current.tracked && current.available <= 0"));
  assert.ok(page.includes('availability.state === "ready"'));
  assert.ok(page.includes("disabled={!available || !size || !bagReady}"));
});

test("existing storefront, search and department discovery link to product pages", () => {
  for (const file of ["components/retail-collection.tsx", "app/search/page.tsx", "app/collections/[slug]/page.tsx"]) {
    assert.ok(read(file).includes("/products/"), `missing product details link in ${file}`);
  }
  assert.ok(read("app/sitemap.ts").includes("featuredProducts"));
});
