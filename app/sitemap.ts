import type { MetadataRoute } from "next";
import { journalArticles } from "@/lib/journal";
import { sportCollections } from "@/lib/sports";
import { legalPages } from "@/lib/legal";

const baseUrl = "https://kalethon.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-08-29T00:00:00Z");
  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/measurements`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/customise`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/try-on`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    ...journalArticles.map((article) => ({
      url: `${baseUrl}/journal/${article.slug}`,
      lastModified: now,
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
