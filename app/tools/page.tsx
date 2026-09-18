import type { Metadata } from "next";
import Link from "next/link";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getReviewPage } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";
import { PostPagination } from "@/components/post-pagination";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI Blog",
  description: "Browse posts about AI tools, workflows, ideas, and industry shifts.",
  alternates: {
    canonical: absoluteUrl("/tools")
  }
};

export const dynamic = "force-dynamic";

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: rawPage } = await searchParams;
  const { posts: tools, page, pageCount } = await getReviewPage(rawPage);
  const authenticated = await isAdminAuthenticated();

  return (
    <section className="container pageShell blogShell">
      <div className="blogTopBar">
        <div className="feedTabs" role="navigation" aria-label="Blog tabs">
          <Link href="/tools" className="feedTab feedTabActive">
            Posts
          </Link>
          {authenticated ? (
            <Link href="/tools/write" className="feedTab">
              Write
            </Link>
          ) : null}
        </div>
      </div>

      <div className="feedList">
        {tools.map((tool) => (
          <article key={tool.slug} className="feedCard">
            <div className="feedMeta">
              <span>{formatDate(tool.updatedAt)}</span>
            </div>
            <h2>
              <Link href={`/tools/${tool.slug}`} className="feedTitleLink">
                {tool.name}
              </Link>
            </h2>
            {tool.summary ? <p className="feedSummary">{tool.summary}</p> : null}
          </article>
        ))}
      </div>
      <PostPagination page={page} pageCount={pageCount} path="/tools" />
    </section>
  );
}
