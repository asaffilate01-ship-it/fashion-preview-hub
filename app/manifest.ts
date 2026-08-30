import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KALËTHON — Poise in motion",
    short_name: "KALËTHON",
    description: "Premium British sport-to-city clothing, finished colourways and private virtual try-on.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f4efe8",
    theme_color: "#10110f",
    categories: ["shopping", "sports", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Shop KALËTHON", short_name: "Shop", url: "/#pieces", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Virtual viewing room", short_name: "Try on", url: "/try-on", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
