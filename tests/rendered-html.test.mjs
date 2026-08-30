import assert from "node:assert/strict";
import test from "node:test";

test("renders KALËTHON search and social metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>KALËTHON \| Premium British Sport-to-City Clothing/);
  assert.doesNotMatch(html, /Kalëthon/);
  assert.match(html, /Premium British sport-to-city clothing/);
  assert.doesNotMatch(html, /href="\/customise"/);
  assert.match(html, /Poise Pullover Hoodie/);
  assert.match(html, /Club Zip Hoodie/);
  assert.match(html, /Casual Contrast Polo/);
  assert.match(html, /Links Golf Polo/);
  assert.match(html, /Baseline Tennis Polo/);
  assert.match(html, /src="\/media\/campaign-polo-960\.webp"/);
  assert.match(html, /srcSet="\/media\/campaign-polo-480\.avif 480w/);
  assert.match(html, /src="\/collections\/golf\.jpg"/);
  assert.match(html, /src="\/collections\/tennis\.jpg"/);
  assert.match(html, /src="\/media\/club-zip-hoodie-960\.webp"/);
  assert.match(html, /product-image-skeleton/);
  assert.match(html, /full KALËTHON wordmark/i);
  assert.match(html, /property="og:image" content="https:\/\/kalethon\.com\/og\.jpg"/);
  assert.match(html, /rel="icon" href="https:\/\/kalethon\.com\/favicon\.svg"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /https:\/\/schema\.org\/PreOrder/);
});

test("serves Virtual Viewing Room products without the broken image optimiser", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("try-on-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/try-on", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /src="\/catalog\/court-polo-k\.webp"/);
  assert.match(html, /src="\/media\/club-zip-hoodie-960\.webp"/);
  assert.match(html, /srcSet="\/media\/club-zip-hoodie-480\.avif 480w/);
  assert.match(html, /product-image-skeleton/);
  assert.match(html, /Choose a garment and colour/);
  assert.match(html, /Selected colour/);
  assert.match(html, /5(?:<!-- -->)? finished options/);
  assert.doesNotMatch(html, /\/_vinext\/image\?/);
});

test("keeps checkout closed until a secure Stripe key is configured", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("checkout-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: [], termsAccepted: true, marketingConsent: false }),
    }),
    {},
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "not_configured");
});
