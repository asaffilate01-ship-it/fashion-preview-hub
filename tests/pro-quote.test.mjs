import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

async function worker() {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("pro-quote", `${process.pid}-${Date.now()}`);
  return (await import(url.href)).default;
}
const ctx = () => ({ waitUntil() {}, passThroughOnException() {} });
const assets = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };

test("quote page serves a usable responsive form for professional and wholesale clients", async () => {
  const app = await worker();
  const response = await app.fetch(
    new Request("http://localhost/pro/quote?department=fight&category=Gloves%20%26%20protection&product=Boxing%20training%20gloves",
      { headers: { accept: "text/html" } }), assets, ctx());
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Request a quotation/);
  assert.match(html, /Submit quotation enquiry/);
  assert.match(html, /Boxing training gloves/);
  assert.match(html, /privacy-policy/);
  assert.match(html, /No payment is taken/);
});

test("quote API rejects category spoofing without touching storage", async () => {
  const app = await worker();
  const bad = {
    department: "fight", category: "Gloves & protection", product: "Leather weekender",
    quantity: 25, branding: "Not decided", timeline: "Exploring options",
    customerName: "Test Client", customerEmail: "test@example.com",
    organisation: "Example Club", phone: "", country: "United Kingdom", notes: "For training",
    privacyAcknowledged: true,
  };
  const response = await app.fetch(new Request("http://localhost/api/pro/quote", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bad),
  }), assets, ctx());
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /valid product range/i);
});

test("valid requests do not claim success when the commerce database is unavailable", async () => {
  const app = await worker();
  const request = {
    department: "team-pro", category: "Team kits", product: "Football match kits",
    quantity: 25, branding: "Sublimation", timeline: "1–3 months",
    customerName: "Test Client", customerEmail: "test@example.com",
    organisation: "Example Club", phone: "", country: "United Kingdom", notes: "Team kit enquiry",
    privacyAcknowledged: true,
  };
  const response = await app.fetch(new Request("http://localhost/api/pro/quote", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request),
  }), assets, ctx());
  assert.equal(response.status, 503);
  assert.equal((await response.json()).message.includes("temporarily unavailable"), true);
});

test("admin inbox filters structured quote requests and collection links prefill details", () => {
  const admin = source("app/admin/admin-dashboard.tsx");
  const collection = source("app/collections/[slug]/page.tsx");
  const handler = source("app/api/pro/quote/route.ts");
  assert.ok(admin.includes('question.subject.startsWith("[PRO QUOTE]")'));
  assert.ok(collection.includes('query: { department: slug, category: category.title, product }'));
  assert.ok(handler.includes("formatProQuoteForInbox"));
  assert.ok(handler.includes("createCommerceQuestion"));
});
