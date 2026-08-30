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
  assert.match(html, /property="og:image" content="https:\/\/kalethon\.com\/og\.jpg"/);
  assert.match(html, /rel="icon" href="https:\/\/kalethon\.com\/favicon\.svg"/);
  assert.match(html, /application\/ld\+json/);
});
