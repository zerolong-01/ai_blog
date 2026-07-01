import type { MetadataRoute } from "next";

import { categories, tools } from "@/data/tools";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/tools", "/categories", "/search"].map((path) => ({
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
