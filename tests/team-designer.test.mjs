import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const ctx = () => ({ waitUntil() {}, passThroughOnException() {} });
const assets = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };

async function worker() {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("kit-test", `${process.pid}-${Date.now()}`);
  return (await import(url.href)).default;
}

test("team designer renders branded, interactive front and back kit preview", async () => {
  const app = await worker();
  const response = await app.fetch(new Request("http://localhost/pro/designer", {
    headers: { accept: "text/html" },
  }), assets, ctx());
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Create your/);
  assert.match(html, /Live design preview/);
  assert.match(html, /kit-sport/);
  assert.match(html, /Main colour/);
  assert.match(html, /Trim colour/);
  assert.match(html, /Continue to quotation/);
  assert.match(html, /No payment is taken/);
  assert.match(html, /VISUAL CONCEPT/);
});

test("quote page safely prepopulates kit details from designer handoff", async () => {
  const app = await worker();
  const query = new URLSearchParams({
    source: "kit-designer",
    department: "team-pro",
    category: "Team kits",
    product: "Football match kits",
    sport: "football",
    primary: "navy",
    secondary: "gold",
    pattern: "hoops",
    teamName: "Junior United",
    playerName: "Smith",
    playerNumber: "17",
    quantity: "38",
  });
  const response = await app.fetch(new Request("http://localhost/pro/quote?" + query.toString(), {
    headers: { accept: "text/html" },
  }), assets, ctx());
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Team &amp; Pro visual design brief|Team &amp; Pro visual design brief/i);
  assert.match(html, /Junior United/);
  assert.match(html, /Sample player number: 17/);
  assert.match(html, /Estimated kits: 38/);
  assert.match(html, /Base colour: Navy/);
  assert.match(html, /Trim colour: Gold/);
});

test("designer handoff validates all values before quote prefill", () => {
  const model = source("lib/team-designer.ts");
  assert.match(model, /normaliseTeamDesign/);
  assert.match(model, /Number\.isSafeInteger/);
  assert.match(model, /return null/);
  assert.match(model, /kit-designer/);
  assert.match(model, /getDesignQuotePrefill|teamDesignQuotePrefill/);
  assert.match(model, /not an approved production specification/);
  const form = source("app/pro/quote/quote-form.tsx");
  assert.match(form, /defaultValue=\{initial\.notes/);
  assert.match(form, /defaultValue=\{initial\.quantity/);
});

test("team studio is accessible from collection, mobile navigation and sitemap", () => {
  assert.match(source("app/collections/[slug]/page.tsx"), /href="\/pro\/designer"/);
  assert.match(source("components/site-navigation.tsx"), /\/pro\/designer/);
  assert.match(source("app/sitemap.ts"), /\/pro\/designer/);
  assert.match(source("app/pro/designer/designer.module.css"), /@media \(max-width: 600px\)/);
});
