import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const read = (file) => readFileSync(new URL("../" + file, import.meta.url), "utf8");
async function validators() {
  const compiled = ts.transpileModule(read("lib/trade-review.ts"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(compiled).toString("base64"));
}

test("customer-facing quote lines never expose internal cost or margins", async () => {
  const { publicTradeQuoteLines } = await validators();
  const data = publicTradeQuoteLines([
    { description: "Academy kits", quantity: 12, unitPricePence: 4500, unitCostPence: 1750 },
  ]);
  assert.deepEqual(data, [
    { description: "Academy kits", quantity: 12, unitPricePence: 4500, lineTotalPence: 54000 },
  ]);
  const json = JSON.stringify(data);
  assert.doesNotMatch(json, /unitCostPence|costPence|margin|supplier/i);
  const publicPage = read("app/pro/quotation/[token]/page.tsx");
  assert.doesNotMatch(publicPage, /unitCostPence|costPence|estimatedMarginPence|createdBy/);
});

test("customer decisions require valid tokens, identity, confirmation or revision detail", async () => {
  const { parseTradeReviewDecision } = await validators();
  const good = { token: "A".repeat(43), decision: "accept", customerName: "Club Secretary",
    customerEmail: "hello@example.com", message: "", confirmPrice: true };
  assert.equal(parseTradeReviewDecision(good).decision, "accept");
  assert.throws(() => parseTradeReviewDecision({ ...good, token: "short" }), /invalid or expired/i);
  assert.throws(() => parseTradeReviewDecision({ ...good, confirmPrice: false }), /confirm/i);
  assert.throws(() => parseTradeReviewDecision({ ...good, customerEmail: "bad" }), /email/i);
  assert.throws(() => parseTradeReviewDecision({ ...good, decision: "changes", message: "no" }), /changes/i);
  assert.equal(parseTradeReviewDecision({
    ...good, decision: "changes", message: "Please revise the delivery charges.",
    confirmPrice: false,
  }).decision, "changes");
});

test("private quotation links have hard expiry bounded by the price validity date", async () => {
  const { validateTradeReviewExpiry } = await validators();
  assert.throws(() => validateTradeReviewExpiry("2020-01-01"), /expired/i);
  assert.throws(() => validateTradeReviewExpiry("2026-02-30"), /expired|invalid/i);
  const future = new Date(Date.now() + 25 * 86400_000).toISOString().slice(0, 10);
  const expiry = validateTradeReviewExpiry(future);
  assert.ok(new Date(expiry).getTime() <= Date.now() + 7 * 86400_000);
});

async function worker() {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("quotation-review-test", process.pid + "-" + Date.now());
  return (await import(url.href)).default;
}
const ctx = () => ({ waitUntil() {}, passThroughOnException() {} });
const assets = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };

test("admin price-review issuing remains unavailable to unauthenticated users", async () => {
  const app = await worker();
  const request = new Request("http://localhost/api/admin/pricing", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "issue_customer_review", id: "c".repeat(36) }),
  });
  const res = await app.fetch(request, assets, ctx());
  assert.equal(res.status, 401);
  assert.equal(res.headers.get("Cache-Control"), "no-store");
});

test("customer decision endpoint rejects invalid token without database access", async () => {
  const app = await worker();
  const response = await app.fetch(new Request("http://localhost/api/pro/quotation/decision", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: "bad", decision: "accept", customerName: "Someone",
      customerEmail: "test@example.com", confirmPrice: true, message: "" }),
  }), assets, ctx());
  assert.equal(response.status, 400);
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("private quote review page cannot render an invalid or guessed token", async () => {
  const app = await worker();
  const response = await app.fetch(new Request("http://localhost/pro/quotation/not-valid-token", {
    headers: { accept: "text/html" },
  }), assets, ctx());
  assert.equal(response.status, 404);
  const page = read("app/pro/quotation/[token]/page.tsx");
  assert.match(page, /robots: \{ index: false, follow: false, nocache: true \}/);
  assert.match(page, /referrer: "no-referrer"/);
});

test("review token hashes, version locks and atomic decisions are recorded", () => {
  const db = read("db/trade-review.ts");
  const creation = read("db/commercial-quote.ts");
  const schema = read("db/bootstrap.ts");
  assert.match(schema, /CREATE TABLE IF NOT EXISTS commerce_trade_price_reviews/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS commerce_trade_review_events/);
  assert.match(db, /SHA-256/);
  assert.match(db, /token_hash = \?/);
  assert.match(db, /r\.status = 'issued' AND r\.token_expires_at > \?/);
  assert.match(db, /p\.status = 'review_ready'/);
  assert.match(db, /SELECT MAX\(revision\) FROM commerce_trade_prices/);
  assert.match(db, /token_hash = NULL/);
  assert.match(db, /commerce_trade_review_events/);
  assert.match(creation, /commerce_trade_price_reviews SET status = 'superseded'/);
  assert.doesNotMatch(db, /api\.stripe\.com|payment_intent_data/);
});

test("admin UI displays reviews without exposing private token hashes", () => {
  const admin = read("app/admin/pricing-panel.tsx");
  const api = read("app/api/admin/pricing/route.ts");
  assert.match(admin, /Issue private customer quotation link/);
  assert.match(admin, /privateLink/);
  assert.match(admin, /review\.status/);
  assert.match(api, /issueTradeReview/);
  assert.match(api, /getAdminIdentity/);
  assert.doesNotMatch(admin, /token_hash|tokenHash/);
});
