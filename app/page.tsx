import type { Metadata } from "next";
import Link from "next/link";

import { ToolCard } from "@/components/tool-card";
import { getAllReviewMeta } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Blog",
  description: "Thoughtful writing about AI tools, workflows, trends, and the broader ideas shaping how people use AI.",
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
            <span className="eyebrow">Independent AI blog</span>
            <h1>Thoughtful writing about AI.</h1>
            <p className="heroCopy">
              Notes on tools, workflows, trends, and the broader ideas shaping how people use AI.
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

          <div className="minimalArtwork" aria-hidden="true">
            <div className="artFlower" />
            <div className="artBox" />
            <div className="artLine artLineOne" />
            <div className="artLine artLineTwo" />
            <div className="artDot artDotOne" />
            <div className="artDot artDotTwo" />
            <div className="artDot artDotThree" />
          </div>
        </div>
      </section>

      <section id="latest-posts" className="container homeSection" aria-labelledby="latest-posts-heading">
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">Fresh from the blog</span>
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
