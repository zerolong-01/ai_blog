import type { Metadata } from "next";
import Link from "next/link";

import { getAllReviewMeta } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Blog Series",
  description: "Browse connected AI articles by series and read every part in order.",
  alternates: {
    canonical: absoluteUrl("/series")
  }
};

export default async function SeriesPage() {
  const posts = await getAllReviewMeta();
  const series = new Map<string, { count: number; description: string }>();

  for (const post of posts) {
    if (!post.seriesName) {
      continue;
    }

    const current = series.get(post.seriesName);
    series.set(post.seriesName, {
      count: (current?.count ?? 0) + 1,
      description: current?.description || post.summary
    });
  }

  const seriesList = [...series.entries()].sort(([left], [right]) => left.localeCompare(right));

  return (
    <section className="container pageShell">
      <div className="pageIntro">
        <span className="eyebrow">Connected reading</span>
        <h1>Browse series</h1>
        <p>Follow related articles from the first part to the latest.</p>
      </div>

      {seriesList.length > 0 ? (
        <div className="categoryGrid">
          {seriesList.map(([seriesName, details]) => (
            <Link
              key={seriesName}
              href={`/series/${encodeURIComponent(seriesName)}`}
              className="categoryCard"
            >
              <span className="categoryCount">
                {details.count} {details.count === 1 ? "part" : "parts"}
              </span>
              <h2>{seriesName}</h2>
              {details.description ? <p>{details.description}</p> : null}
            </Link>
          ))}
        </div>
      ) : (
        <div className="emptyState">
          <h2>No series yet</h2>
          <p>Series will appear here after posts are grouped in the editor.</p>
          <Link href="/tools" className="textLink">
            Browse all posts
          </Link>
        </div>
      )}
    </section>
  );
}
