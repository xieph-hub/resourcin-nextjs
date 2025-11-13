// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllPostsCMS } from "@/lib/cms";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/services", "/jobs", "/insights", "/about", "/contact"].map((p) => ({
    url: `${SITE_URL}${p || "/"}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const posts = await getAllPostsCMS();
  const insightPages = posts.map((p) => ({
    url: `${SITE_URL}/insights/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...insightPages];
}
