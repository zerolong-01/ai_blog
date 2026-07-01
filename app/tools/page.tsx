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
    <section className="container pageShell">
      <div className="feedTabs" role="navigation" aria-label="Review tabs">
        <Link href="/tools" className="feedTab feedTabActive">
          Blog
        </Link>
        <Link href="/tools/write" className="feedTab">
          Write
        </Link>
      </div>

      <div className="pageIntro">
        <span className="eyebrow">AI writing</span>
        <h1>Posts on tools, workflows, and ideas.</h1>
        <p>Short essays and notes about AI, without the product-review framing.</p>
      </div>

      <div className="feedList">
        {tools.map((tool) => (
          <article key={tool.slug} className="feedCard">
            <div className="feedMeta">
              <span>{formatDate(tool.updatedAt)}</span>
              {tool.category !== "general" ? <span>{tool.category}</span> : null}
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
