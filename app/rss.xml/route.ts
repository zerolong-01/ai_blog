import { getAllReviewMeta } from "@/lib/reviews";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getAllReviewMeta();
  const latestUpdatedAt = posts[0]?.updatedAt;
  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/tools/${post.slug}`);

      return `
        <item>
          <title>${escapeXml(post.name)}</title>
          <link>${escapeXml(url)}</link>
          <guid isPermaLink="true">${escapeXml(url)}</guid>
          <description>${escapeXml(post.summary)}</description>
          <author>${escapeXml(`${siteConfig.contactEmail} (${post.author})`)}</author>
          <category>${escapeXml(post.category)}</category>
          <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>${escapeXml(siteConfig.name)}</title>
        <link>${escapeXml(siteConfig.url)}</link>
        <description>${escapeXml(siteConfig.description)}</description>
        <language>en</language>
        <lastBuildDate>${new Date(latestUpdatedAt || "2026-07-25").toUTCString()}</lastBuildDate>
        <atom:link href="${escapeXml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
