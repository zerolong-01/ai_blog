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
  const seriesNames = [...new Set(tools.map((tool) => tool.seriesName).filter((name): name is string => Boolean(name)))];
  const seriesRoutes = seriesNames.map((seriesName) => {
    const reviews = tools.filter((tool) => tool.seriesName === seriesName);

    return {
      url: `${siteConfig.url}/series/${encodeURIComponent(seriesName)}`,
      lastModified: new Date(
        reviews.reduce((latest, review) => {
          return new Date(review.updatedAt).getTime() > latest.getTime() ? new Date(review.updatedAt) : latest;
        }, new Date(0))
      )
    };
  });

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

  return [
    ...staticRoutes,
    {
      url: `${siteConfig.url}/series`,
      lastModified: seriesRoutes.reduce(
        (latest, route) => (route.lastModified.getTime() > latest.getTime() ? route.lastModified : latest),
        new Date("2026-07-25")
      )
    },
    ...toolRoutes,
    ...seriesRoutes,
    ...categoryRoutes
  ];
}
