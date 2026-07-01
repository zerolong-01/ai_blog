import type { MetadataRoute } from "next";

import { categories } from "@/data/categories";
import { getAllReviewMeta } from "@/lib/reviews";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tools = await getAllReviewMeta();
  const staticRoutes = ["", "/tools", "/categories", "/search", "/privacy-policy", "/terms", "/disclaimer", "/contact"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date()
  }));

  const toolRoutes = tools.map((tool) => ({
    url: `${siteConfig.url}/tools/${tool.slug}`,
    lastModified: new Date(tool.updatedAt)
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${siteConfig.url}/categories/${category.slug}`,
    lastModified: new Date()
  }));

  return [...staticRoutes, ...toolRoutes, ...categoryRoutes];
}
