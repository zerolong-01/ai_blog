import type { Metadata } from "next";
import Link from "next/link";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getReviewPage } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";
import { PostPagination } from "@/components/post-pagination";
import { formatDate } from "@/lib/utils";
import { UiIcon } from "@/components/ui-icon";
import { POSTS_PER_PAGE } from "@/lib/post-pagination";

export const metadata: Metadata = {
  title: "The Journal — AI & Cybersecurity",
  description: "Explore perspectives on AI, cybersecurity, and digital work.",
  alternates: {
    canonical: absoluteUrl("/tools"),
  },
};

export const dynamic = "force-dynamic";

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const { posts: tools, total, page, pageCount } = await getReviewPage(rawPage);
  const authenticated = await isAdminAuthenticated();

  return (
    <section className="container pageShell blogShell journalPage">
      <div className="pageIntro journalIntro">
        <span className="eyebrow">Ideas. Context. Perspective.</span>
        <h1>
          The journal<span className="headingDot">.</span>
        </h1>
        <p>Get a clearer view of AI, cybersecurity, and the shifts shaping our digital lives.</p>
      </div>
      <div className="blogTopBar">
        <p>
          <span className="editorialDot" /> All stories <span className="resultPill">{total}</span>
        </p>
        {authenticated ? (
          <Link href="/tools/write" className="secondaryButton">
            Write a story <UiIcon name="arrow" />
          </Link>
        ) : (
          <span className="journalOrder">Latest updates first</span>
        )}
      </div>
      <div className="journalLayout">
        <div>
          <div className="feedList">
            {tools.map((tool, index) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="feedCard feedTitleLink"
                aria-label={tool.name}
              >
                <span className="entryIndex" aria-hidden="true">
                  {String((page - 1) * POSTS_PER_PAGE + index + 1).padStart(2, "0")}
                </span>
                <div className="entryContent">
                  <div className="feedMeta">
                    <time dateTime={tool.updatedAt}>{formatDate(tool.updatedAt)}</time>
                    {tool.seriesName ? <span>{tool.seriesName}</span> : null}
                  </div>
                  <h2>{tool.name}</h2>
                  {tool.summary ? <p className="feedSummary">{tool.summary}</p> : null}
                </div>
                <UiIcon name="arrow" className="entryArrow" />
              </Link>
            ))}
            {!tools.length ? (
              <div className="emptyState">
                <h2>A fresh page.</h2>
                <p>New stories will appear here soon.</p>
                <Link href="/search" className="textLink">
                  Explore topics <UiIcon name="arrow" />
                </Link>
              </div>
            ) : null}
          </div>
          <PostPagination page={page} pageCount={pageCount} path="/tools" />
        </div>
        <aside className="journalRail" aria-label="Explore the journal">
          <span className="eyebrow">Follow your curiosity</span>
          <h2>Find a fresh perspective.</h2>
          <p>Have something in mind? Search the journal.</p>
          <form action="/search" className="railSearch">
            <label className="srOnly" htmlFor="journal-search">
              Search the journal
            </label>
            <input
              id="journal-search"
              type="search"
              name="q"
              maxLength={200}
              placeholder="Search stories…"
              required
            />
            <button type="submit" className="iconButton" aria-label="Submit journal search">
              <UiIcon name="search" />
            </button>
          </form>
          <div className="topicLinks">
            {["AI", "security", "coding"].map((topic) => (
              <Link href={{ pathname: "/search", query: { q: topic } }} key={topic}>
                {topic}
                <UiIcon name="arrow" />
              </Link>
            ))}
          </div>
          <Link href="/series" className="railSeriesLink">
            <UiIcon name="book" />
            <span>
              Better together<strong>Explore reading series</strong>
            </span>
            <UiIcon name="arrow" />
          </Link>
        </aside>
      </div>
    </section>
  );
}
