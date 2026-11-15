import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("checkout confirmation verifies status with Stripe server-side", () => {
  const endpoint = read("app/api/checkout/confirmation/route.ts");
  assert.ok(endpoint.includes("api.stripe.com/v1/checkout/sessions/"));
  assert.ok(endpoint.includes('session.payment_status === "paid"'));
  assert.ok(endpoint.includes('session.status === "complete"'));
  assert.ok(endpoint.includes('"Cache-Control": "no-store"'));
  assert.ok(!endpoint.includes("STRIPE_SECRET_KEY="));
});

test("checkout success is never accepted solely from the URL", () => {
  const bag = read("app/bag/bag-client.tsx");
  assert.ok(bag.includes("/api/checkout/confirmation"));
  assert.ok(bag.includes("result.verified === true"));
  const confirmation = bag.split('if (result.verified === true)')[1]?.split("} else")[0] ?? "";
  assert.ok(confirmation.includes("clear()"));
  assert.ok(!bag.includes('if (status === "success") {\n        setCheckoutNotice("Payment received'));
});
