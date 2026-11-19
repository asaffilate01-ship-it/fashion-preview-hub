import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
async function domain() {
  const code = ts.transpileModule(read("lib/trade-handover.ts"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}
const base = () => ({
  buyerLegalName: "Example Sports Club Ltd",
  billingAddress: "100 Team Road, London, NW1 1AA, United Kingdom",
  deliveryAddress: "Factory reception, 9 Test Avenue, London",
  billingCountry: "United Kingdom",
  purchaseOrderReference: "CLUB-2026-031",
  depositBps: 2500,
  notes: "Awaiting verified VAT identity and lead time",
});
const checks = {
  buyerDetailsReviewed: true,
  vatTreatmentReviewed: true,
  paymentTermsReviewed: true,
  specificationReviewed: true,
};
const update = () => ({
  id: "ec65407d-0f73-45f0-98b0-63b2849e91ba",
  expectedVersion: 1,
  nextStatus: "ready_for_invoice_review",
  ...base(),
  ...checks,
});
const context = {
  quoteStillCurrent: true,
  latestProofApproved: true,
  proofRequired: true,
  sourceValidUntil: "2027-04-01",
};

test("handover rejects unsupported deposits, incomplete buyer details and invalid status", async () => {
  const { parseHandoverCreate, parseHandoverUpdate } = await domain();
  const accepted = parseHandoverCreate({
    reviewId: "ec65407d-0f73-45f0-98b0-63b2849e91ba",
    ...base(),
  });
  assert.equal(accepted.fields.depositBps, 2500);
  assert.throws(() => parseHandoverCreate({ ...base(), reviewId: accepted.reviewId, depositBps: 3500 }), /deposit percentage/i);
  assert.throws(() => parseHandoverCreate({ ...base(), reviewId: accepted.reviewId, buyerLegalName: "" }), /Buyer legal name/i);
  assert.throws(() => parseHandoverUpdate({ ...update(), nextStatus: "dispatched" }), /Invalid handover status/i);
  assert.throws(() => parseHandoverUpdate({ ...update(), expectedVersion: 0 }), /Refresh the handover/i);
});

test("invoice-preparation transition requires current accepted quote, proof and manual checks", async () => {
  const { parseHandoverUpdate, validateHandoverTransition } = await domain();
  const valid = parseHandoverUpdate(update());
  assert.equal(validateHandoverTransition("draft", valid, context, "2027-01-01"), undefined);
  assert.throws(() => validateHandoverTransition("draft", valid, { ...context, quoteStillCurrent: false }, "2027-01-01"), /replaced or has expired/i);
  assert.throws(() => validateHandoverTransition("draft", valid, { ...context, latestProofApproved: false }, "2027-01-01"), /artwork proof/i);
  assert.throws(() => validateHandoverTransition("draft", valid, context, "2027-05-01"), /expired/i);
  assert.throws(() => validateHandoverTransition("draft", { ...valid, checks: { ...checks, vatTreatmentReviewed: false } }, context, "2027-01-01"), /checks are all required/i);
  assert.throws(() => validateHandoverTransition("ready_for_invoice_review", { ...valid, nextStatus: "draft" }, context, "2027-01-01"), /Invalid change/i);
});

test("deposit is illustrative and based on immutable accepted total", async () => {
  const { illustrativeDepositPence, nextHandoverStatuses } = await domain();
  assert.equal(illustrativeDepositPence({ totalPence: 23400 }, 2500), 5850);
  assert.deepEqual(nextHandoverStatuses("draft"), ["draft", "ready_for_invoice_review", "on_hold", "cancelled"]);
  assert.deepEqual(nextHandoverStatuses("cancelled"), ["cancelled"]);
});

const ctx = () => ({ waitUntil() {}, passThroughOnException() {} });
const assets = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
async function worker() {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("handover-test", process.pid + "-" + Date.now());
  return (await import(url.href)).default;
}

test("handover administration denies anonymous read and write", async () => {
  const app = await worker();
  const get = await app.fetch(new Request("http://localhost/api/admin/handovers"), assets, ctx());
  assert.equal(get.status, 401);
  assert.equal(get.headers.get("Cache-Control"), "no-store");
  const post = await app.fetch(new Request("http://localhost/api/admin/handovers", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "create", ...base() }),
  }), assets, ctx());
  assert.equal(post.status, 401);
});

test("database joins latest accepted quote and removes private costs from snapshots", () => {
  const db = read("db/trade-handover.ts");
  const ddl = read("db/bootstrap.ts");
  assert.match(ddl, /CREATE TABLE IF NOT EXISTS commerce_trade_handovers/);
  assert.match(ddl, /CREATE TABLE IF NOT EXISTS commerce_trade_handover_events/);
  assert.match(db, /r.status = 'accepted'/);
  assert.match(db, /p.revision = \(SELECT MAX\(revision\)/);
  assert.match(db, /publicTradeQuoteLines\(lines\)/);
  assert.match(db, /NOT EXISTS \(SELECT 1 FROM commerce_trade_handovers existing/);
  assert.match(db, /version = version \+ 1/);
  assert.match(db, /commerce_trade_handover_events/);
  assert.doesNotMatch(db, /payment_intent_data|api\.stripe\.com/);
});

test("mobile and desktop interface includes snapshots without factory dispatch", () => {
  const admin = read("app/admin/admin-dashboard.tsx");
  const panel = read("app/admin/handover-panel.tsx");
  const css = read("app/admin/handover-panel.module.css");
  assert.match(admin, /TabsTrigger value="handovers"/);
  assert.match(admin, /<HandoverPanel/);
  assert.match(panel, /Create internal intake draft/);
  assert.match(panel, /No invoice or payment has been requested/);
  assert.match(panel, /Buyer legal identity and billing details reviewed/);
  assert.match(css, /@media\(max-width:600px\)/);
});
