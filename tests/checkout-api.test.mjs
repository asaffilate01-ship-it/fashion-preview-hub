import assert from "node:assert/strict";
import test from "node:test";

test("secure checkout never contacts Stripe when order database is missing", async () => {
  const oldEnabled = process.env.CHECKOUT_ENABLED;
  const oldStripe = process.env.STRIPE_SECRET_KEY;
  process.env.CHECKOUT_ENABLED = "true";
  process.env.STRIPE_SECRET_KEY = "sk_test_fictional_for_no_network_unit_test";

  try {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("missing-db-test", `${process.pid}-${Date.now()}`);
    const { default: worker } = await import(workerUrl.href);
    const item = {
      id: "test", productId: "court-polo", sku: "court-polo-bone",
      name: "Court Polo", image: "/catalog/court-polo-k.webp",
      quantity: 1, bodyColour: "Bone", collarColour: "Navy", cuffColour: "Navy",
      sleeve: "Short sleeve", branding: "K mark", fit: "Regular",
      finish: "Contrast trim", size: "M",
    };
    const response = await worker.fetch(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: [item], termsAccepted: true, marketingConsent: false }),
      }),
      {},
      { waitUntil() {}, passThroughOnException() {} },
    );
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, "commerce_unavailable");
  } finally {
    if (oldEnabled === undefined) delete process.env.CHECKOUT_ENABLED;
    else process.env.CHECKOUT_ENABLED = oldEnabled;
    if (oldStripe === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = oldStripe;
  }
});
