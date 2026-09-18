import type { Metadata } from "next";

import { ToolCard } from "@/components/tool-card";
import { PostPagination } from "@/components/post-pagination";
import { normalizePostQuery } from "@/lib/post-pagination";
import { getReviewPage } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Search AI Posts",
  description: "Search blog posts about AI tools, workflows, and ideas.",
  alternates: {
    canonical: absoluteUrl("/search")
  },
  robots: {
    index: false,
    follow: true
  }
};

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams;
  const query = normalizePostQuery(params.q);
  const { posts, total, page, pageCount } = await getReviewPage(params.page, query);

  return (
    <section className="container pageShell">
      <div className="pageIntro">
        <span className="eyebrow">Search</span>
        <h1>Search the blog</h1>
        <p>Look through posts by title, summary, and topic.</p>
      </div>

      <form action="/search" className="searchShell">
        <label className="searchLabel" htmlFor="post-search">Search by title, summary, or category</label>
        <input id="post-search" className="searchInput" type="search" name="q" defaultValue={query} maxLength={200} placeholder="Try: AI, security, agents..." />
        <button type="submit" className="primaryButton">Search</button>
      </form>
      <p className="searchCount" role="status">{total} results</p>
      {posts.length ? <div className="cardGrid">{posts.map((post) => <ToolCard key={post.slug} tool={post} />)}</div> : <p>No posts found. Try another keyword.</p>}
      <PostPagination page={page} pageCount={pageCount} path="/search" query={query} />
    </section>
  );
}
