// src/app/robots.ts — served as /robots.txt
import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // API routes and the auth callback have nothing worth indexing
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/auth/", "/sb/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
