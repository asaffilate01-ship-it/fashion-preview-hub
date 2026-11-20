import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
async function invoiceModule() {
  const output = ts.transpileModule(source("lib/invoice-preparation.ts"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(output).toString("base64"));
}
const settings = () => ({
  KALETHON_SELLER_DETAILS_VERIFIED: "true",
  KALETHON_SELLER_LEGAL_NAME: "Verified Test Trading Limited",
  KALETHON_SELLER_ADDRESS: "25 Test Road, London, NW1 1AA, United Kingdom",
  KALETHON_SELLER_COUNTRY: "United Kingdom",
  KALETHON_SELLER_COMPANY_NUMBER: "01234567",
  KALETHON_SELLER_VAT_NUMBER: "GB123456789",
});
const handover = () => ({
  id: "bba6fa7a-bf31-43c9-9e8e-0d8388004cf9",
  reference: "KHI-261120-BBA6FA7A",
  status: "ready_for_invoice_review",
  version: 3,
  quoteStillCurrent: true,
  proofRequired: true,
  latestProofApproved: true,
  buyerDetailsReviewed: true,
  vatTreatmentReviewed: true,
  paymentTermsReviewed: true,
  specificationReviewed: true,
  buyerLegalName: "Example Sports Club",
  billingAddress: "12 Example Street, London, United Kingdom",
  billingCountry: "United Kingdom",
  customerEmail: "admin@example.org",
  deliveryAddress: "Delivery depot, London",
  purchaseOrderReference: "CLUB-PO-22",
  depositBps: 2500,
  snapshot: {
    currency: "GBP",
    priceReference: "KQ-ABC-R1",
    priceRevision: 1,
    lines: [{ description: "Team kits", quantity: 10, unitPricePence: 2000, lineTotalPence: 20000 }],
    subtotalPence: 20000,
    discountPence: 2000,
    shippingPence: 1500,
    taxPence: 3900,
    totalPence: 23400,
    validUntil: "2027-04-01",
  },
});

test("invoice worksheet requires verified seller details and VAT identity", async () => {
  const { parseVerifiedSeller } = await invoiceModule();
  assert.throws(() => parseVerifiedSeller({ ...settings(), KALETHON_SELLER_DETAILS_VERIFIED: "false" }, 3900), /not been verified/i);
  assert.throws(() => parseVerifiedSeller({ ...settings(), KALETHON_SELLER_LEGAL_NAME: "TBC" }, 3900), /seller legal name/i);
  assert.throws(() => parseVerifiedSeller({ ...settings(), KALETHON_SELLER_ADDRESS: "" }, 3900), /registered\/trading address/i);
  assert.throws(() => parseVerifiedSeller({ ...settings(), KALETHON_SELLER_VAT_NUMBER: "" }, 3900), /VAT identifier/i);
  assert.equal(parseVerifiedSeller(settings(), 3900).legalName, "Verified Test Trading Limited");
});

test("invoice worksheet reconciles customer amounts without internal costs", async () => {
  const { parseVerifiedSeller, prepareInternalInvoiceWorksheet } = await invoiceModule();
  const report = prepareInternalInvoiceWorksheet(handover(), parseVerifiedSeller(settings(), 3900), "2027-02-01");
  assert.equal(report.reference, handover().reference + "-PREP");
  assert.equal(report.estimatedTotalPence, 23400);
  assert.equal(report.illustrativeDepositPence, 5850);
  assert.equal(report.illustrativeBalancePence, 17550);
  assert.equal(report.lines[0].description, "Team kits");
  assert.equal(report.preparedFromHandoverVersion, 3);
  assert.match(report.warning, /NOT A VAT INVOICE/);
  assert.match(report.warning, /NOT A PAYMENT REQUEST/);
  assert.equal("costPence" in report, false);
  assert.equal("unitCostPence" in report.lines[0], false);
});

test("invoice worksheet fails on stale quotes, unapproved proofs, missing checks and expiry", async () => {
  const { parseVerifiedSeller, prepareInternalInvoiceWorksheet } = await invoiceModule();
  const seller = parseVerifiedSeller(settings(), 3900);
  assert.throws(() => prepareInternalInvoiceWorksheet({ ...handover(), quoteStillCurrent: false }, seller, "2027-02-01"), /not ready/i);
  assert.throws(() => prepareInternalInvoiceWorksheet({ ...handover(), latestProofApproved: false }, seller, "2027-02-01"), /not ready/i);
  assert.throws(() => prepareInternalInvoiceWorksheet({ ...handover(), status: "draft" }, seller, "2027-02-01"), /not ready/i);
  assert.throws(() => prepareInternalInvoiceWorksheet({ ...handover(), vatTreatmentReviewed: false }, seller, "2027-02-01"), /checks must be reviewed/i);
  assert.throws(() => prepareInternalInvoiceWorksheet(handover(), seller, "2027-05-01"), /expired/i);
});

test("invoice worksheet refuses price tampering and unapproved deposit bands", async () => {
  const { parseVerifiedSeller, prepareInternalInvoiceWorksheet } = await invoiceModule();
  const seller = parseVerifiedSeller(settings(), 3900);
  assert.throws(() => prepareInternalInvoiceWorksheet({
    ...handover(), snapshot: { ...handover().snapshot, totalPence: 23000 },
  }, seller, "2027-02-01"), /totals do not reconcile/i);
  assert.throws(() => prepareInternalInvoiceWorksheet({
    ...handover(), snapshot: { ...handover().snapshot,
      lines: [{ description: "Team kits", quantity: 10, unitPricePence: 2000, lineTotalPence: 9999 }] },
  }, seller, "2027-02-01"), /line total does not balance/i);
  assert.throws(() => prepareInternalInvoiceWorksheet({ ...handover(), depositBps: 3300 }, seller, "2027-02-01"), /deposit percentage is invalid/i);
});

const assets = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const ctx = () => ({ waitUntil() {}, passThroughOnException() {} });
async function worker() {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("worksheet-test", process.pid + "-" + Date.now());
  return (await import(url.href)).default;
}

test("invoice worksheet endpoint denies anonymous access with no-store headers", async () => {
  const app = await worker();
  const response = await app.fetch(
    new Request("http://localhost/api/admin/handovers/bba6fa7a-bf31-43c9-9e8e-0d8388004cf9/worksheet"), assets, ctx());
  assert.equal(response.status, 401);
  assert.match(response.headers.get("Cache-Control") || "", /no-store/);
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
});

test("private print page gates identity and never accesses server seller secrets in client", () => {
  const page = source("app/admin/handovers/[id]/preview/page.tsx");
  const api = source("app/api/admin/handovers/[id]/worksheet/route.ts");
  const viewer = source("app/admin/handovers/[id]/preview/worksheet-viewer.tsx");
  const css = source("app/admin/handovers/[id]/preview/worksheet.module.css");
  const panel = source("app/admin/handover-panel.tsx");
  assert.match(page, /requireAdminPage/);
  assert.match(page, /robots: \{ index: false, follow: false, nocache: true \}/);
  assert.match(api, /getAdminIdentity/);
  assert.match(api, /parseVerifiedSeller\(process\.env/);
  assert.match(api, /prepareInternalInvoiceWorksheet/);
  assert.doesNotMatch(viewer, /process\.env/);
  assert.match(viewer, /NOT A VAT INVOICE|worksheet.warning/);
  assert.match(viewer, /Print internal worksheet/);
  assert.match(panel, /admin\/handovers\/.*preview/);
  assert.match(css, /@media print/);
});
