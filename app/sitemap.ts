import type { MetadataRoute } from "next";

import { categories } from "@/data/categories";
import { staticPages } from "@/data/static-pages";
import { getAllReviewMeta, getReviewsByCategory } from "@/lib/reviews";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tools = await getAllReviewMeta();
  const staticRoutes = staticPages.map((page) => ({
    url: `${siteConfig.url}${page.path}`,
    lastModified: new Date(page.lastModified)
  }));

  const toolRoutes = tools.map((tool) => ({
    url: `${siteConfig.url}/tools/${tool.slug}`,
    lastModified: new Date(tool.updatedAt)
  }));

  const categoryReviewLists = await Promise.all(
    categories.map(async (category) => ({
      category,
      reviews: await getReviewsByCategory(category.slug)
    }))
  );

  const categoryRoutes = categoryReviewLists
    .filter(({ reviews }) => reviews.length > 0)
    .map(({ category, reviews }) => ({
      url: `${siteConfig.url}/categories/${category.slug}`,
      lastModified: new Date(
        reviews.reduce((latest, review) => {
          return new Date(review.updatedAt).getTime() > latest.getTime() ? new Date(review.updatedAt) : latest;
        }, new Date(0))
      )
    }));

  return [...staticRoutes, ...toolRoutes, ...categoryRoutes];
}
