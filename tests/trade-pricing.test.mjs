import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
async function purePricingModule() {
  const input = source("lib/commercial-quote.ts");
  const js = ts.transpileModule(input, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
}

const valid = () => ({
  quoteQuestionId: "a8b82910-5301-48f3-8d6c-bbf48e1ccb00",
  lines: [{ description: "Custom club shirt", quantity: 10, unitPricePence: 2000, unitCostPence: 900 }],
  shippingPence: 1500,
  discountBps: 1000,
  taxRateBps: 2000,
  validUntil: "2027-03-01",
  notes: "Indicative pricing only, proof and sample required.",
  costReviewed: true,
  taxReviewed: true,
});

test("trade calculator uses integer pence and produces consistent VAT and margin", async () => {
  const { parseTradePrice, calculateTradePrice } = await purePricingModule();
  const input = parseTradePrice(valid());
  const totals = calculateTradePrice(input);
  assert.deepEqual(totals, {
    subtotalPence: 20000,
    discountPence: 2000,
    shippingPence: 1500,
    taxPence: 3900,
    totalPence: 23400,
    costPence: 9000,
    estimatedMarginPence: 9000,
  });
});

test("quote validation rejects invalid items, tax rates, quantities and excess values", async () => {
  const { parseTradePrice } = await purePricingModule();
  assert.throws(() => parseTradePrice({ ...valid(), lines: [] }), /one and twelve/i);
  assert.throws(() => parseTradePrice({ ...valid(), taxRateBps: 1700 }), /VAT rate/i);
  assert.throws(() => parseTradePrice({ ...valid(), lines: [{
    description: "Bulk uniform", quantity: 10001, unitPricePence: 100, unitCostPence: 40,
  }] }), /Quantity/);
  assert.throws(() => parseTradePrice({ ...valid(), discountBps: 10001 }), /Discount rate/);
  assert.throws(() => parseTradePrice({ ...valid(), lines: [{
    description: "Bulk uniform", quantity: 10000, unitPricePence: 10000000, unitCostPence: 0,
  }] }), /exceeds the maximum/i);
});

test("review readiness requires both manual tax and cost confirmation", async () => {
  const { parseTradePrice, canMarkQuoteReady } = await purePricingModule();
  const input = parseTradePrice(valid());
  assert.equal(canMarkQuoteReady(input, "2027-02-01"), true);
  assert.throws(() => canMarkQuoteReady({ ...input, costReviewed: false }, "2027-02-01"), /costing and tax/i);
  assert.throws(() => canMarkQuoteReady({ ...input, taxReviewed: false }, "2027-02-01"), /costing and tax/i);
  assert.throws(() => canMarkQuoteReady(input, "2027-04-01"), /expired|passed/i);
  assert.throws(() => canMarkQuoteReady({
    ...input, lines: [{ ...input.lines[0], unitPricePence: 0 }], shippingPence: 0,
  }, "2027-02-01"), /zero-value/i);
});

async function worker() {
  const path = new URL("../dist/server/index.js", import.meta.url);
  path.searchParams.set("trade-test", process.pid + "-" + Date.now());
  return (await import(path.href)).default;
}
const ctx = () => ({ waitUntil() {}, passThroughOnException() {} });
const assets = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };

test("internal trade pricing API denies unauthenticated GET and POST", async () => {
  const app = await worker();
  const get = await app.fetch(new Request("http://localhost/api/admin/pricing"), assets, ctx());
  assert.equal(get.status, 401);
  assert.equal(get.headers.get("Cache-Control"), "no-store");
  const post = await app.fetch(new Request("http://localhost/api/admin/pricing", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "create", ...valid() }),
  }), assets, ctx());
  assert.equal(post.status, 401);
  assert.equal(post.headers.get("Cache-Control"), "no-store");
});

test("trade pricing snapshots and audit records are versioned and scoped to Pro enquiries", () => {
  const backend = source("db/commercial-quote.ts");
  const schema = source("db/bootstrap.ts");
  assert.match(schema, /CREATE TABLE IF NOT EXISTS commerce_trade_prices/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS commerce_trade_price_events/);
  assert.match(schema, /UNIQUE\(quote_question_id, revision\)/);
  assert.match(backend, /startsWith\("\[PRO QUOTE\]"\)/);
  assert.match(backend, /status = 'review_ready'/);
  assert.match(backend, /status = 'superseded'/);
  assert.match(backend, /commerce_trade_price_events/);
  assert.doesNotMatch(backend, /api\.stripe\.com|payment_intent_data/);
});

test("pricing is admin-only and catalogue seed no longer invents twelve in-stock units", () => {
  const component = source("app/admin/admin-dashboard.tsx");
  assert.match(component, /<PricingPanel questions=/);
  assert.match(component, /TabsTrigger value="pricing"/);
  const api = source("app/api/admin/pricing/route.ts");
  assert.match(api, /getAdminIdentity/);
  assert.match(api, /"Cache-Control": "no-store"/);
  const seed = source("db/commerce.ts");
  assert.match(seed, /'Core run', 'All sizes', 'Standard', 0, 0, 4, \?/);
  assert.doesNotMatch(seed, /'Core run', 'All sizes', 'Standard', 12, 0, 4, \?/);
  const css = source("app/admin/pricing-panel.module.css");
  assert.match(css, /@media\(max-width:600px\)/);
});
