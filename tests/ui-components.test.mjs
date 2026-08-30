import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
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

test("maps photographed garments to distinct realistic colour layers", async () => {
  const { garmentColourValues, garmentToneStrength, livePreviewAssets } = await vite.ssrLoadModule("/lib/garment-preview.ts");

  assert.equal(livePreviewAssets["golf-polo"].base, "/collections/golf.jpg");
  assert.equal(livePreviewAssets["tennis-polo"].base, "/collections/tennis.jpg");
  assert.match(livePreviewAssets["golf-polo"].bodyMask, /golf-player-body-mask\.svg/);
  assert.match(livePreviewAssets["tennis-polo"].cuffMask, /tennis-player-cuff-mask\.svg/);
  assert.notEqual(garmentColourValues.Bone, garmentColourValues.Navy);
  assert.ok(garmentToneStrength.Navy.depth > garmentToneStrength.Bone.depth);
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
