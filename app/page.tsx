import type { Metadata } from "next";
import Link from "next/link";

import { ToolCard } from "@/components/tool-card";
import { SecurityArtwork } from "@/components/security-artwork";
import { getAllReviewMeta } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { UiIcon } from "@/components/ui-icon";

export const metadata: Metadata = {
  title: "AI & Cybersecurity Blog",
  description:
    "Clear analysis of AI tools, cybersecurity threats, data protection, and the ideas shaping a safer digital world.",
  alternates: {
    canonical: absoluteUrl("/"),
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await getAllReviewMeta();
  const featured = posts[0];
  const latestPosts = posts.slice(1, 7);
  const seriesMap = new Map<string, { postCount: number; description: string }>();

  for (const post of posts) {
    if (!post.seriesName) {
      continue;
    }

    const current = seriesMap.get(post.seriesName);
    seriesMap.set(post.seriesName, {
      postCount: (current?.postCount ?? 0) + 1,
      description: current?.description || post.summary,
    });
  }

  const activeSeries = [...seriesMap.entries()]
    .map(([name, details]) => ({ name, ...details }))
    .slice(0, 6);

  return (
    <>
      <section className="editorialHero">
        <div className="container editorialHeroGrid">
          <div className="editorialHeroCopy">
            <span className="eyebrow">
              <span className="editorialDot" /> A journal for a changing world
            </span>
            <h1>
              Make sense of <span>what’s next.</span>
            </h1>
            <p className="heroCopy">
              Fresh perspectives on AI and cybersecurity. Thoughtful analysis to help you work
              smarter and stay one step ahead.
            </p>
            <div className="ctaRow">
              <Link href="/tools" className="primaryButton">
                Explore the journal <UiIcon name="arrow" />
              </Link>
              <Link href="/series" className="heroSecondaryLink">
                Read a series <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="heroTopics" aria-label="Journal topics">
              <span>AI &amp; machine learning</span>
              <span>Cybersecurity</span>
              <span>Digital work</span>
            </div>
          </div>
          {featured ? (
            <Link
              href={`/tools/${featured.slug}`}
              className="heroFeatured"
              aria-label={`Read latest story: ${featured.name}`}
            >
              <div className="featuredVisual">
                <SecurityArtwork />
                <span className="featuredVisualLabel">Ideas worth understanding.</span>
                <span className="featuredEdition">AI / SECURITY</span>
              </div>
              <div className="featuredContent">
                <div className="featuredKicker">
                  <span>
                    <span className="editorialDot" /> Latest story
                  </span>
                  <time dateTime={featured.updatedAt}>{formatDate(featured.updatedAt)}</time>
                </div>
                <h2>{featured.name}</h2>
                <p>{featured.summary}</p>
                <span className="featuredRead">
                  Read the story <UiIcon name="arrow" />
                </span>
              </div>
            </Link>
          ) : (
            <div className="heroVisualOnly">
              <SecurityArtwork />
            </div>
          )}
        </div>
      </section>

      <section
        id="latest-posts"
        className="container homeSection"
        aria-labelledby="latest-posts-heading"
      >
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">The reading room</span>
            <h2 id="latest-posts-heading">
              More to explore<span className="headingDot">.</span>
            </h2>
          </div>
          <Link href="/tools" className="textLink">
            All stories <UiIcon name="arrow" />
          </Link>
        </div>

        {latestPosts.length > 0 ? (
          <div className="cardGrid">
            {latestPosts.map((post) => (
              <ToolCard key={post.slug} tool={post} />
            ))}
          </div>
        ) : (
          <div className="emptyState">
            <p>
              {featured
                ? "You’re up to date. There’s more to discover in the journal."
                : "New writing is on the way. Check back soon."}
            </p>
            <Link href="/tools" className="textLink">
              Explore the journal <UiIcon name="arrow" />
            </Link>
          </div>
        )}
      </section>

      {activeSeries.length > 0 ? (
        <section
          className="container homeSection seriesSection"
          aria-labelledby="home-series-heading"
        >
          <div className="sectionHeading">
            <div>
              <span className="eyebrow">Go a little deeper</span>
              <h2 id="home-series-heading">
                Follow the thread<span className="headingDot">.</span>
              </h2>
            </div>
            <Link href="/series" className="textLink">
              All series <UiIcon name="arrow" />
            </Link>
          </div>

          <div className="categoryGrid">
            {activeSeries.map((series) => (
              <Link
                key={series.name}
                href={`/series/${encodeURIComponent(series.name)}`}
                className="categoryCard"
              >
                <div className="seriesCardTop">
                  <UiIcon name="book" />
                  <span className="categoryCount">
                    {series.postCount} {series.postCount === 1 ? "part" : "parts"}
                  </span>
                </div>
                <h3>{series.name}</h3>
                {series.description ? <p>{series.description}</p> : null}
                <span className="textLink">
                  Explore series <UiIcon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
