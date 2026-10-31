import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const heroSource = await readFile(new URL("../app/hero-carousel.tsx", import.meta.url), "utf8");
const cssSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("campaign slideshow exposes a persistent manual playback control", () => {
  assert.match(heroSource, /aria-pressed=\{userPaused\}/);
  assert.match(heroSource, /Resume automatic campaign slides/);
  assert.match(heroSource, /Pause automatic campaign slides/);
  assert.match(heroSource, /setUserPaused\(\(value\) => !value\)/);
});

test("inactive campaigns cannot capture keyboard focus", () => {
  assert.match(heroSource, /aria-hidden=\{current !== index\} inert=\{current !== index\}/);
  assert.match(heroSource, /onFocusCapture=\{\(\) => setInteractionPaused\(true\)\}/);
});

test("carousel hit targets and keyboard focus remain legible", () => {
  assert.match(cssSource, /\.hero-dots button \{[^}]*min-height: 44px/);
  assert.match(cssSource, /\.hero-autoplay-toggle \{[^}]*min-height: 44px/);
  assert.match(cssSource, /\.hero-autoplay-toggle:focus-visible, \.hero-dots button:focus-visible/);
  assert.match(cssSource, /@media \(prefers-reduced-motion: reduce\) \{ \.hero-dots button\.is-active::after \{ animation: none;/);
});
