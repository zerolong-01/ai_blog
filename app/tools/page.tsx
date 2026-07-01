import type { Metadata } from "next";
import Link from "next/link";

import { getAllReviewMeta } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI Blog",
  description: "Browse posts about AI tools, workflows, ideas, and industry shifts.",
  alternates: {
    canonical: absoluteUrl("/tools")
  }
};

export default async function ToolsPage() {
  const tools = await getAllReviewMeta();

  return (
    <section className="container pageShell blogShell">
      <div className="blogTopBar">
        <div className="feedTabs" role="navigation" aria-label="Blog tabs">
          <Link href="/tools" className="feedTab feedTabActive">
            Posts
          </Link>
          <Link href="/tools/write" className="feedTab">
            Write
          </Link>
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
    </section>
  );
}
