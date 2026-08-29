import type { MetadataRoute } from "next";
import { journalArticles } from "@/lib/journal";
import { sportCollections } from "@/lib/sports";
import { legalPages } from "@/lib/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date("2026-08-29T00:00:00Z");
  return [
    { url: "https://kalethon.com", lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: "https://kalethon.com/measurements", lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://kalethon.com/journal", lastModified: updated, changeFrequency: "weekly", priority: 0.85 },
    ...journalArticles.map((article) => ({
      url: `https://kalethon.com/journal/${article.slug}`,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...sportCollections.map((collection) => ({
      url: `${baseUrl}/sport/${collection.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    { url: `${baseUrl}/legal`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 },
    ...legalPages.map((page) => ({ url: `${baseUrl}/legal/${page.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.45 })),
  ];
}
