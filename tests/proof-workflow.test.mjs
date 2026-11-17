import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const ctx = () => ({ waitUntil() {}, passThroughOnException() {} });
const assets = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };

async function worker() {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("proofs-test", process.pid + "-" + Date.now());
  return (await import(url.href)).default;
}

test("admin proof API rejects unauthenticated read and write requests", async () => {
  const app = await worker();
  const get = await app.fetch(new Request("http://localhost/api/admin/proofs"), assets, ctx());
  assert.equal(get.status, 401);
  const post = await app.fetch(new Request("http://localhost/api/admin/proofs", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "create" }),
  }), assets, ctx());
  assert.equal(post.status, 401);
});

test("customer review decision API rejects bad tokens and missing confirmation", async () => {
  const app = await worker();
  const response = await app.fetch(new Request("http://localhost/api/pro/proof/decision", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      token: "invalid", decision: "approve", customerName: "Customer Example",
      customerEmail: "client@example.com", message: "", confirmAccuracy: false,
    }),
  }), assets, ctx());
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /Invalid or expired review link/i);
});

test("private proof pages have noindex metadata and reject invalid links", async () => {
  const page = source("app/pro/proof/[token]/page.tsx");
  assert.match(page, /robots: \{ index: false, follow: false/);
  assert.match(page, /referrer: "no-referrer"/);
  const app = await worker();
  const response = await app.fetch(new Request("http://localhost/pro/proof/not-a-real-token", {
    headers: { accept: "text/html" },
  }), assets, ctx());
  assert.equal(response.status, 404);
});

test("proof storage is versioned, token hashes expire and customer decisions are atomic", () => {
  const db = source("db/proof-workflow.ts");
  const ddl = source("db/bootstrap.ts");
  assert.match(ddl, /CREATE TABLE IF NOT EXISTS commerce_pro_proofs/);
  assert.match(ddl, /CREATE TABLE IF NOT EXISTS commerce_pro_proof_events/);
  assert.match(db, /SHA-256/);
  assert.match(db, /token_hash/);
  assert.match(db, /7 \* 24 \* 60 \* 60/);
  assert.match(db, /status = 'awaiting_customer' AND token_hash = \?/);
  assert.match(db, /customer_approved/);
  assert.match(db, /revision_requested/);
  assert.match(db, /commerce_pro_proof_events/);
  assert.doesNotMatch(db, /token_hash\s*=\s*\?/g.test("empty") ? /^impossible$/ : /token_hash\s*=\s*'[^']+'/);
});

test("admin proof drafts and customer confirmations remain distinct", () => {
  const admin = source("app/admin/proof-panel.tsx");
  const dashboard = source("app/admin/admin-dashboard.tsx");
  const api = source("app/api/admin/proofs/route.ts");
  const form = source("app/pro/proof/[token]/proof-decision-form.tsx");
  assert.match(admin, /issue private customer review/i);
  assert.match(admin, /Private review link/);
  assert.match(dashboard, /<ProofPanel quotes=/);
  assert.match(api, /getAdminIdentity/);
  assert.match(form, /I confirm that I have reviewed this version/);
  assert.match(form, /confirmAccuracy:/);
  assert.match(form, /No payment is taken|does not charge you/);
});

test("draft artwork references are restricted to a same-site proof folder", () => {
  const validators = source("lib/proof-workflow.ts");
  assert.match(validators, /artworkPath/);
  assert.match(validators, /\/proofs\//);
  assert.match(validators, /customerEmail/);
  assert.match(validators, /"revision" && message.length < 10/);
});
