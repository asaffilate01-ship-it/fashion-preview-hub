import assert from "node:assert/strict";
import test from "node:test";

test("secure checkout never contacts Stripe when order database is missing", async () => {
  const keys = ["CHECKOUT_ENABLED", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY", "ORDER_EMAIL_FROM", "ORDER_EMAIL_TO"];
  const before = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  Object.assign(process.env, {
    CHECKOUT_ENABLED: "true",
    STRIPE_SECRET_KEY: "sk_test_fictional_for_no_network_unit_test",
    STRIPE_WEBHOOK_SECRET: "whsec_fictional",
    RESEND_API_KEY: "re_fictional",
    ORDER_EMAIL_FROM: "orders@example.invalid",
    ORDER_EMAIL_TO: "team@example.invalid",
  });

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
    for (const key of keys) {
      if (before[key] === undefined) delete process.env[key];
      else process.env[key] = before[key];
    }
  }
});
