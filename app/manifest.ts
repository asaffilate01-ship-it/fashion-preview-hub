import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KALËTHON — Poise in motion",
    short_name: "KALËTHON",
    description: "Premium British sport-to-city clothing, finished colourways and private virtual try-on.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4efe8",
    theme_color: "#10110f",
    categories: ["shopping", "sports", "lifestyle"],
    icons: [
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
