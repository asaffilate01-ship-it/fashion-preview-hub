import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("all department hero and category image files are present", () => {
  const editorial = read("lib/kalethon-editorial.ts");
  const paths = [...editorial.matchAll(/(?:photo|concept)\("(\/[^"]+)"/g)].map((match) => match[1]);
  assert.ok(paths.length >= 20, "Expected image coverage for six departments");
  for (const path of paths) {
    assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), `Missing editorial image: ${path}`);
  }
});

test("luxury departments have category previews and linked product photos", () => {
  const page = read("app/collections/[slug]/page.tsx");
  assert.ok(page.includes("editorial.categories[index]"));
  assert.ok(page.includes("src={visual.src}"));
  assert.ok(page.includes("src={piece.image}"));
  assert.ok(page.includes("/products/"));
  assert.ok(page.includes("featuredProducts.filter"));
});

test("unreleased leather, combat and professional ranges do not offer fake checkout", () => {
  const page = read("app/collections/[slug]/page.tsx");
  const catalogue = read("lib/kalethon-editorial.ts");
  for (const slug of ["leather", "fight", "team-pro"]) {
    const block = catalogue.split(`${JSON.stringify(slug)}: {`)[1] ?? catalogue.split(`  ${slug}: {`)[1];
    assert.ok(block, `missing visual range ${slug}`);
    assert.ok(block.includes("concept("), `range ${slug} needs clearly labelled concept imagery`);
  }
  assert.ok(page.includes("Original concept illustration, not a product photograph"));
  assert.ok(page.includes("Products are not yet available to purchase."));
  assert.ok(page.includes('href="/contact"'));
});

test("responsive layouts and accessible image labels are supplied", () => {
  const page = read("app/collections/[slug]/page.tsx");
  const css = read("app/collections/[slug]/collection-page.module.css");
  assert.ok(page.includes("alt={visual.alt}"));
  assert.ok(page.includes("alt={editorial.visual.alt}"));
  assert.ok(css.includes("@media (max-width: 680px)"));
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
});
