import type { Metadata } from "next";
import Link from "next/link";

import { ToolCard } from "@/components/tool-card";
import { SecurityArtwork } from "@/components/security-artwork";
import { getAllReviewMeta } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI & Cybersecurity Blog",
  description: "Clear analysis of AI tools, cybersecurity threats, data protection, and the ideas shaping a safer digital world.",
  alternates: {
    canonical: absoluteUrl("/")
  }
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await getAllReviewMeta();
  const latestPosts = posts.slice(0, 6);
  const seriesMap = new Map<string, { postCount: number; description: string }>();

  for (const post of posts) {
    if (!post.seriesName) {
      continue;
    }

    const current = seriesMap.get(post.seriesName);
    seriesMap.set(post.seriesName, {
      postCount: (current?.postCount ?? 0) + 1,
      description: current?.description || post.summary
    });
  }

  const activeSeries = [...seriesMap.entries()].map(([name, details]) => ({ name, ...details })).slice(0, 6);

  return (
    <>
      <section className="minimalHero">
        <div className="container minimalHeroGrid">
          <div className="minimalHeroCopy">
            <span className="eyebrow"><span className="statusDot" /> Independent AI &amp; security insights</span>
            <h1>Explore <span className="gradientText">AI &amp; cybersecurity.</span></h1>
            <p className="heroCopy">
              Clear analysis of AI models and tools, emerging cyber threats, and practical ways to protect data and digital systems.
            </p>
            <div className="ctaRow">
              <Link href="#latest-posts" className="primaryButton">
                Read the latest
              </Link>
              <Link href="/series" className="secondaryButton">
                Browse series
              </Link>
            </div>
          </div>

          <SecurityArtwork />
        </div>
      </section>

      <section id="latest-posts" className="container homeSection" aria-labelledby="latest-posts-heading">
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">The latest in AI &amp; security</span>
            <h2 id="latest-posts-heading">Latest posts</h2>
          </div>
          <Link href="/tools" className="textLink">
            View all posts
          </Link>
        </div>

        {latestPosts.length > 0 ? (
          <div className="cardGrid">
            {latestPosts.map((post) => (
              <ToolCard key={post.slug} tool={post} />
            ))}
          </div>
        ) : (
          <p className="emptyState">New writing is on the way. Check back soon.</p>
        )}
      </section>

      {activeSeries.length > 0 ? (
        <section className="container homeSection" aria-labelledby="home-series-heading">
          <div className="sectionHeading">
            <div>
              <span className="eyebrow">Continue reading</span>
              <h2 id="home-series-heading">Browse series</h2>
            </div>
            <Link href="/series" className="textLink">
              View all series
            </Link>
          </div>

          <div className="categoryGrid">
            {activeSeries.map((series) => (
              <Link
                key={series.name}
                href={`/series/${encodeURIComponent(series.name)}`}
                className="categoryCard"
              >
                <span className="categoryCount">
                  {series.postCount} {series.postCount === 1 ? "part" : "parts"}
                </span>
                <h3>{series.name}</h3>
                {series.description ? <p>{series.description}</p> : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
