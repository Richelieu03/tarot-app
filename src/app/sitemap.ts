// src/app/sitemap.ts — served as /sitemap.xml so search engines find every card page
import type { MetadataRoute } from "next";
import { TAROT_CARDS } from "../lib/tarot-meanings";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/single`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/spread`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/cards`, changeFrequency: "monthly", priority: 0.9 },
  ];
  const cards: MetadataRoute.Sitemap = TAROT_CARDS.map((c) => ({
    url: `${SITE_URL}/cards/${c.id}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  return [...pages, ...cards];
}
