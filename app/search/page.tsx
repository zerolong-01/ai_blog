import type { Metadata } from "next";

import { ToolCard } from "@/components/tool-card";
import { PostPagination } from "@/components/post-pagination";
import { normalizePostQuery } from "@/lib/post-pagination";
import { getReviewPage } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";
import Link from "next/link";
import { UiIcon } from "@/components/ui-icon";

export const metadata: Metadata = {
  title: "Search the Journal",
  description: "Find stories about AI, cybersecurity, and digital work.",
  alternates: {
    canonical: absoluteUrl("/search"),
  },
  robots: {
    index: false,
    follow: true,
  },
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const query = normalizePostQuery(params.q);
  const { posts, total, page, pageCount } = await getReviewPage(params.page, query);

  return (
    <section className="container pageShell searchPage">
      <div className="pageIntro">
        <span className="eyebrow">Follow your curiosity</span>
        <h1>
          Find your next read<span className="headingDot">.</span>
        </h1>
        <p>A question, a topic, a new perspective. Start here.</p>
      </div>

      <form action="/search" className="searchShell">
        <label className="searchLabel" htmlFor="post-search">
          Search by title, summary, or topic
        </label>
        <input
          id="post-search"
          className="searchInput"
          type="search"
          name="q"
          defaultValue={query}
          maxLength={200}
          placeholder="Try: AI, security, agents..."
        />
        <button type="submit" className="primaryButton">
          Search
        </button>
      </form>
      <div className="searchResultsBar">
        <p className="searchCount" role="status">
          {total} {total === 1 ? "story" : "stories"}
          {query ? (
            <>
              {" "}
              for <strong>“{query}”</strong>
            </>
          ) : (
            " to explore"
          )}
        </p>
        {query ? (
          <Link href="/search" className="textLink">
            Clear search
          </Link>
        ) : null}
      </div>
      {posts.length ? (
        <div className="cardGrid">
          {posts.map((post) => (
            <ToolCard key={post.slug} tool={post} />
          ))}
        </div>
      ) : (
        <div className="searchEmptyState">
          <UiIcon name="search" />
          <h2>No stories found yet.</h2>
          <p>Try a broader phrase, or explore one of these topics.</p>
          <div className="emptyTopics">
            {["AI", "security", "coding"].map((topic) => (
              <Link key={topic} href={{ pathname: "/search", query: { q: topic } }}>
                {topic} <UiIcon name="arrow" />
              </Link>
            ))}
          </div>
          <Link href="/tools" className="textLink">
            Back to the journal
          </Link>
        </div>
      )}
      <PostPagination page={page} pageCount={pageCount} path="/search" query={query} />
    </section>
  );
}
