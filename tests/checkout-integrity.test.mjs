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

const { requestedCatalogueReference, matchesPublishedProduct, exceedsAvailableStock } =
  await vite.ssrLoadModule("/lib/checkout-policy.ts");

test("maps direct-buy family IDs to managed products", () => {
  assert.equal(requestedCatalogueReference("club-zip-hoodie"), "club-zip-hoodie");
  assert.equal(requestedCatalogueReference("court-polo"), "court-polo-bone");
  assert.equal(requestedCatalogueReference("court-polo", "court-polo-oxblood"), "court-polo-oxblood");
  assert.equal(requestedCatalogueReference("custom-id", "KAL-CUSTOM"), "KAL-CUSTOM");
});

test("never lets one garment's client ID purchase a different DB product", () => {
  assert.equal(matchesPublishedProduct("court-polo", "court-polo-bone"), true);
  assert.equal(matchesPublishedProduct("court-polo", "court-polo-oxblood"), true);
  assert.equal(matchesPublishedProduct("court-polo", "club-zip-hoodie"), false);
  assert.equal(matchesPublishedProduct("custom-db-id", "custom-db-id"), true);
  assert.equal(matchesPublishedProduct("custom-db-id", "court-polo-bone"), false);
});

test("aggregates repeated tracked stock pools across distinct cart lines", () => {
  assert.equal(exceedsAvailableStock([
    { productKey: "inv-1", quantity: 4, available: 6, tracked: true },
    { productKey: "inv-1", quantity: 3, available: 6, tracked: true },
  ]), true);
  assert.equal(exceedsAvailableStock([
    { productKey: "inv-1", quantity: 4, available: 6, tracked: true },
    { productKey: "inv-2", quantity: 3, available: 4, tracked: true },
  ]), false);
  assert.equal(exceedsAvailableStock([
    { productKey: "made-to-order", quantity: 5, available: 0, tracked: false },
  ]), false);
  assert.equal(exceedsAvailableStock([
    { productKey: "broken", quantity: 1, available: NaN, tracked: true },
  ]), true);
});

test("checkout uses DB pricing without static fallback and requires explicit launch switch", async () => {
  const source = await readFile(new URL("../app/api/checkout/route.ts", import.meta.url), "utf8");
  assert.match(source, /CHECKOUT_ENABLED/);
  assert.match(source, /commerce_unavailable/);
  assert.match(source, /requestedCatalogueReference/);
  assert.match(source, /exceedsAvailableStock/);
  assert.doesNotMatch(source, /The static catalogue remains available/);
});

test("bag only clears after a recorded paid-session response", async () => {
  const bag = await readFile(new URL("../app/bag/bag-client.tsx", import.meta.url), "utf8");
  const status = await readFile(new URL("../app/api/checkout/status/route.ts", import.meta.url), "utf8");
  assert.match(bag, /data\.confirmed === true/);
  assert.match(status, /hasRecordedPaidOrder/);
  assert.match(status, /Cache-Control": "no-store"/);
});

test("paid webhook queries complete line items and keys email retries by session", async () => {
  const webhook = await readFile(new URL("../app/api/stripe/webhook/route.ts", import.meta.url), "utf8");
  const database = await readFile(new URL("../db/commerce.ts", import.meta.url), "utf8");
  assert.match(webhook, /\/line_items\?/);
  assert.match(webhook, /lines\.has_more/);
  assert.match(webhook, /kalethon\/\$\{session\.id\}\/owner/);
  assert.match(database, /stripe_session_id = \?/);
  assert.match(database, /metadata\.inventory_id/);
  assert.doesNotMatch(database, /WHERE product_id = \?"\)\.bind\(quantity, now, product\.id\)/);
});
