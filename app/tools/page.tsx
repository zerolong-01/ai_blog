import type { Metadata } from "next";
import Link from "next/link";

import { getAllReviewMeta } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI Tools Reviews",
  description: "Browse independent reviews of AI tools across writing, design, developer, productivity, and video categories.",
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
          Review feed
        </Link>
        <Link href="/tools/write" className="feedTab">
          Write a review
        </Link>
      </div>

      <div className="feedShell">
        <div className="feedMain">
          <div className="pageIntro">
            <span className="eyebrow">Review archive</span>
            <h1>AI tools review feed</h1>
            <p>Browse past reviews, open a full write-up, or start drafting a new one from the write tab.</p>
          </div>

          <div className="feedList">
            {tools.map((tool) => (
              <article key={tool.slug} className="feedCard">
                <div className="feedMeta">
                  <span>{formatDate(tool.updatedAt)}</span>
                  <span>{tool.category}</span>
                  <span>{tool.rating.toFixed(1)} / 5</span>
                </div>
                <h2>
                  <Link href={`/tools/${tool.slug}`} className="feedTitleLink">
                    {tool.name}
                  </Link>
                </h2>
                <p className="tagline">{tool.tagline}</p>
                <p className="feedSummary">{tool.summary}</p>
                <div className="feedFooter">
                  <span>{tool.price}</span>
                  <Link href={`/tools/${tool.slug}`} className="textLink">
                    Read more
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="feedSidebar">
          <div className="contentCard">
            <span className="eyebrow">Start writing</span>
            <h2>Publish your next AI review</h2>
            <p>Create a new draft with headline, verdict, pros and cons, and pricing notes.</p>
            <Link href="/tools/write" className="primaryButton">
              Write a review
            </Link>
          </div>

          <div className="contentCard">
            <span className="eyebrow">Past entries</span>
            <div className="archiveList">
              {tools.map((tool) => (
                <Link key={tool.slug} href={`/tools/${tool.slug}`} className="archiveLink">
                  <strong>{tool.name}</strong>
                  <span>{formatDate(tool.updatedAt)}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
