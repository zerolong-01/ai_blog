import type { Metadata } from "next";
import Link from "next/link";

import { getAllReviewMeta } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reading Series — AI & Cybersecurity",
  description:
    "Explore connected perspectives on AI, cybersecurity, and digital work, one part at a time.",
  alternates: {
    canonical: absoluteUrl("/series"),
  },
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
      description: current?.description || post.summary,
    });
  }

  const seriesList = [...series.entries()].sort(([left], [right]) => left.localeCompare(right));

  return (
    <section className="container pageShell">
      <div className="pageIntro">
        <span className="eyebrow">Go a little deeper</span>
        <h1>
          Connected ideas<span className="headingDot">.</span>
        </h1>
        <p>Follow a thread. Build a perspective. Explore one story at a time.</p>
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
          <h2>A new reading path is on its way.</h2>
          <p>Until then, find a fresh perspective in the journal.</p>
          <Link href="/tools" className="textLink">
            Browse all posts
          </Link>
        </div>
      )}
    </section>
  );
}
