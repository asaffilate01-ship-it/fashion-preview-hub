import assert from "node:assert/strict";
import { after, test } from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true, hmr: false },
});
after(async () => vite.close());
const { searchGarments, normalizeSearchText } = await vite.ssrLoadModule("/lib/catalog-search.ts");

test("finds zip-up and pullover hoodies independently", () => {
  assert.ok(searchGarments("zip-up hoodies").some((x) => x.sku === "club-zip-hoodie"));
  assert.ok(searchGarments("pullover hoodies").some((x) => x.sku === "poise-hoodie-bone"));
  assert.ok(searchGarments("joggers").some((x) => x.sku === "motion-jogger-stone"));
});

test("links every discoverable garment to a real finished catalogue card", async () => {
  const retailSource = await readFile(new URL("../components/retail-collection.tsx", import.meta.url), "utf8");
  const results = searchGarments("");
  assert.ok(results.length >= 10);
  for (const item of results) {
    assert.equal(item.href, `/#product-${item.sku}`);
    assert.ok(retailSource.includes(`sku: "${item.sku}"`), `Missing product card for ${item.sku}`);
  }
  assert.ok(!results.some((x) => ["performance-tank", "track-jacket"].includes(x.productId)));
});

test("normalises accented brand search and avoids stale search-page prices", async () => {
  assert.equal(normalizeSearchText("KALËTHON"), "kalethon");
  assert.ok(searchGarments("KALËTHON").length >= 10);
  const page = await readFile(new URL("../app/search/page.tsx", import.meta.url), "utf8");
  assert.match(page, /product\.href/);
  assert.match(page, /search-suggestions/);
  assert.doesNotMatch(page, /From £/);
});

test("sport collections only link real listings directly, without unverified offer metadata", async () => {
  const sportSource = await readFile(new URL("../app/sport/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(sportSource, /findShopGarment/);
  assert.match(sportSource, /Collection preview/);
  assert.doesNotMatch(sportSource, /schema\.org\/PreOrder/);
});
