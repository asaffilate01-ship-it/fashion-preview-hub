import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("all flagship departments have navigable routes", () => {
  const departments = source("lib/kalethon-departments.ts");
  const nav = source("components/site-navigation.tsx");
  for (const slug of ["men", "women", "sport", "leather", "fight", "team-pro"]) {
    assert.match(departments, new RegExp(`slug: "${slug}"`));
    assert.ok(nav.includes(`/collections/${slug}`), `navigation is missing ${slug}`);
  }
});

test("search includes professional categories and links to real shop products", () => {
  const search = source("app/search/page.tsx");
  assert.ok(search.includes("kalethonDepartments"));
  assert.ok(search.includes("productAnchors"));
  assert.ok(search.includes("/products/"));
});

test("mobile menu retains essential service pages", () => {
  const nav = source("components/site-navigation.tsx");
  for (const route of ["/measurements", "/journal", "/contact", "/search"]) {
    assert.ok(nav.includes(route), `missing mobile service link: ${route}`);
  }
});

test("leather assortment excludes shoes and clothing", () => {
  const catalogue = source("lib/kalethon-departments.ts");
  const leather = catalogue.split('slug: "leather"')[1]?.split('slug: "fight"')[0] ?? "";
  assert.ok(leather.includes("Leather weekender"));
  assert.ok(!/leather (?:jacket|shoes|sneakers|boots)/i.test(leather));
});
