import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  await vite.close();
});

async function readCssTree(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return readCssTree(entryPath);
      }
      return entry.name.endsWith(".css") ? readFile(entryPath, "utf8") : "";
    }),
  );
  return contents.join("\n");
}

test("emits the storefront's responsive and accessibility utilities", async () => {
  const css = await readCssTree(path.join(root, "dist"));

  assert.match(css, /scrollbar-width:\s*none/);
  assert.match(css, /customiser-shell/);
  assert.match(css, /sport-product-grid/);
  assert.match(css, /journal-grid/);
  assert.match(css, /hoodie-constructions-grid/);
  assert.match(css, /retail-toolbar\{[^}]*position:sticky/);
  assert.match(css, /retail-colourways button\{[^}]*width:44px/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("keeps live colour layers off photographed people", async () => {
  const { garmentColourValues, garmentToneStrength, livePreviewAssets } = await vite.ssrLoadModule("/lib/garment-preview.ts");

  assert.equal(livePreviewAssets["golf-polo"], undefined);
  assert.equal(livePreviewAssets["tennis-polo"], undefined);
  assert.notEqual(garmentColourValues.Bone, garmentColourValues.Navy);
  assert.ok(garmentToneStrength.Navy.depth > garmentToneStrength.Bone.depth);
});

test("ships fixed model photography for every people-based colourway", async () => {
  const retailSource = await readFile(path.join(root, "components/retail-collection.tsx"), "utf8");
  const tryOnSource = await readFile(path.join(root, "app/try-on/try-on-client.tsx"), "utf8");
  const assets = [
    "golf-navy-bone.webp", "golf-bone-sage.webp", "golf-oxblood-bone.webp", "golf-stone-navy.webp",
    "tennis-navy-bone.webp", "tennis-oxblood-bone.webp", "tennis-sage-bone.webp", "tennis-stone-navy.webp",
    "casual-polo-bone.webp", "casual-polo-navy.webp", "casual-polo-sage.webp", "casual-polo-stone.webp",
    "club-hoodie-ink.webp", "club-hoodie-navy.webp", "club-hoodie-oxblood.webp", "club-hoodie-stone.webp",
    "club-tracksuit-ink.webp", "club-tracksuit-navy.webp", "club-tracksuit-stone.webp", "club-tracksuit-sage.webp", "club-tracksuit-oxblood.webp",
  ];

  await Promise.all(assets.map((asset) => access(path.join(root, "public/catalog/colourways", asset))));
  for (const asset of assets) assert.match(retailSource, new RegExp(asset.replace(".", "\\.")));
  assert.match(tryOnSource, /modelPhotography/);
  assert.match(tryOnSource, /golf-navy-bone\.webp/);
  assert.match(tryOnSource, /tennis-navy-bone\.webp/);
  assert.match(tryOnSource, /club-tracksuit-ink\.webp/);
});

test("forwards progress semantics to the primitive", async () => {
  const { Progress } = await vite.ssrLoadModule("/components/ui/progress.tsx");
  const html = renderToStaticMarkup(React.createElement(Progress, { value: 37 }));

  assert.match(html, /aria-valuenow="37"/);
  assert.match(html, /aria-valuetext="37%"/);
  assert.match(html, /data-state="loading"/);
});

test("emits chart themes for the starter's media dark mode", async () => {
  const { ChartStyle } = await vite.ssrLoadModule("/components/ui/chart.tsx");
  const html = renderToStaticMarkup(
    React.createElement(ChartStyle, {
      id: "contract",
      config: {
        latency: { theme: { light: "#ffffff", dark: "#000000" } },
      },
    }),
  );

  assert.match(html, /\[data-chart=contract\]/);
  assert.match(html, /@media \(prefers-color-scheme: dark\)/);
  assert.doesNotMatch(html, /\.dark/);
});

test("renders sidebar skeletons deterministically", async () => {
  const { SidebarMenuSkeleton } = await vite.ssrLoadModule(
    "/components/ui/sidebar.tsx",
  );
  const first = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));
  const second = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));

  assert.equal(first, second);
  assert.match(first, /--skeleton-width:70%/);
});
