import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const ctx = () => ({ waitUntil() {}, passThroughOnException() {} });
const assets = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
async function worker() {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("roster-test", `${process.pid}-${Date.now()}`);
  return (await import(url.href)).default;
}

test("team kit designer renders roster editing and CSV controls", async () => {
  const app = await worker();
  const result = await app.fetch(new Request("http://localhost/pro/designer", {
    headers: { accept: "text/html" },
  }), assets, ctx());
  assert.equal(result.status, 200);
  const html = await result.text();
  assert.match(html, /Player names/);
  assert.match(html, /Import CSV/);
  assert.match(html, /Export CSV/);
  assert.match(html, /Add player/);
  assert.match(html, /Save in this browser/);
  assert.match(html, /Continue to quotation/);
});

test("team roster parser enforces row, number, size and formula safety limits", () => {
  const roster = source("lib/team-roster.ts");
  assert.match(roster, /MAX_TEAM_ROSTER_ROWS = 40/);
  assert.match(roster, /MAX_TEAM_ROSTER_FILE_BYTES = 64 \* 1024/);
  assert.match(roster, /Shirt number/);
  assert.match(roster, /seenNumbers/);
  assert.match(roster, /parseTeamRosterCsv/);
  assert.match(roster, /exportTeamRosterCsv/);
  assert.match(roster, /safe\.replace/);
  assert.match(roster, /new TextEncoder/);
});

test("quote API rejects invalid roster without recording a false quote", async () => {
  const app = await worker();
  const request = {
    department: "team-pro",
    category: "Team kits",
    product: "Football match kits",
    quantity: 12,
    branding: "Sublimation",
    timeline: "1–3 months",
    customerName: "Test Client",
    customerEmail: "test@example.com",
    organisation: "Club Example",
    phone: "",
    country: "United Kingdom",
    notes: "Proposed personalised team kits.",
    privacyAcknowledged: true,
    roster: [{ name: "Player Test", number: "9", size: "invalid", quantity: 1 }],
  };
  const response = await app.fetch(new Request("http://localhost/api/pro/quote", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "192.0.2.211" },
    body: JSON.stringify(request),
  }), assets, ctx());
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /valid size/i);
});

test("designer passes the roster only via browser session storage after explicit navigation", () => {
  const client = source("app/pro/designer/team-kit-designer.tsx");
  const quote = source("app/pro/quote/quote-form.tsx");
  const endpoint = source("lib/pro-quote.ts");
  assert.ok(client.includes("window.sessionStorage.setItem"));
  assert.ok(client.includes("validateTeamRoster(roster)"));
  assert.ok(client.includes('roster.length ? "&roster=1" : ""'));
  assert.ok(!source("lib/team-designer.ts").includes("rosterRows:"));
  assert.ok(quote.includes("window.sessionStorage.getItem"));
  assert.ok(quote.includes("privacyAcknowledged"));
  assert.ok(quote.includes("rosterRequired && roster.length === 0"));
  assert.ok(endpoint.includes("formatProQuoteForInbox(validated).message.length > 3900"));
  assert.ok(endpoint.includes("teamRosterSizeSummary"));
  assert.ok(endpoint.includes("PLAYER ROSTER"));
});

test("mobile roster editor remains scrollable and protected from oversized imports", () => {
  const client = source("app/pro/designer/team-roster-editor.tsx");
  const css = source("app/pro/designer/designer.module.css");
  assert.ok(client.includes("file.size > MAX_TEAM_ROSTER_FILE_BYTES"));
  assert.ok(client.includes("parseTeamRosterCsv"));
  assert.ok(css.includes(".rosterTableScroll"));
  assert.ok(css.includes("overflow-x: auto"));
  assert.ok(css.includes("@media (max-width: 600px)"));
});
