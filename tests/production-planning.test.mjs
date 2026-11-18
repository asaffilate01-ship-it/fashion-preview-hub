import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const ctx = () => ({ waitUntil() {}, passThroughOnException() {} });
const assets = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };

async function worker() {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("production-test", String(process.pid) + "-" + String(Date.now()));
  return (await import(url.href)).default;
}

test("production admin endpoints deny anonymous access", async () => {
  const app = await worker();
  const get = await app.fetch(new Request("http://localhost/api/admin/production"), assets, ctx());
  assert.equal(get.status, 401);
  assert.equal(get.headers.get("Cache-Control"), "no-store");
  const post = await app.fetch(new Request("http://localhost/api/admin/production", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "create", plannedQuantity: 25 }),
  }), assets, ctx());
  assert.equal(post.status, 401);
  assert.equal(post.headers.get("Cache-Control"), "no-store");
});

test("new work orders are internal plans derived from the latest customer approved proof", () => {
  const db = source("db/production-planning.ts");
  const schema = source("db/bootstrap.ts");
  assert.match(schema, /CREATE TABLE IF NOT EXISTS commerce_production_plans/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS commerce_production_events/);
  assert.match(db, /pf.status = 'customer_approved'/);
  assert.match(db, /SELECT MAX\(version\) FROM commerce_pro_proofs/);
  assert.match(db, /NOT EXISTS \(SELECT 1 FROM commerce_production_plans existing/);
  assert.match(db, /q.subject LIKE '\[PRO QUOTE\]%'/);
  assert.match(db, /commerce_production_events/);
  assert.doesNotMatch(db, /api\.stripe\.com/);
});

test("planning updates use optimistic concurrency and versioned audit entries", () => {
  const db = source("db/production-planning.ts");
  assert.match(db, /version = version \+ 1/);
  assert.match(db, /WHERE id = \? AND version = \? AND status = \?/);
  assert.match(db, /expectedVersion \+ 1/);
  assert.match(db, /stage_changed/);
  assert.match(db, /meta\?\.changes/);
});

test("release readiness requires the latest approved proof and all preproduction checks", () => {
  const model = source("lib/production-planning.ts");
  assert.match(model, /approvedLatestProof/);
  assert.match(model, /if \(!artworkPath\)/);
  assert.match(model, /!next\.technicalChecked \|\| !next\.commercialChecked \|\| !next\.qualityChecked/);
  assert.match(model, /!next\.supplierConfirmed/);
  assert.match(model, /ready_for_release/);
  assert.match(model, /does not.*payment|never initiates factory/i);
});

test("production admin integrates a mobile friendly plan registry", () => {
  const dashboard = source("app/admin/admin-dashboard.tsx");
  const editor = source("app/admin/production-panel.tsx");
  const css = source("app/admin/production-panel.module.css");
  assert.match(dashboard, /ProductionPanel/);
  assert.match(dashboard, /TabsTrigger value="production"/);
  assert.match(editor, /Create planning draft/);
  assert.match(editor, /Save plan and audit change/);
  assert.match(editor, /commercial terms reviewed \(does not confirm payment\)/i);
  assert.match(css, /@media\(max-width:640px\)/);
});
