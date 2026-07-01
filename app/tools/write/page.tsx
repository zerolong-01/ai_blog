import type { Metadata } from "next";
import Link from "next/link";

import { ReviewForm } from "@/components/review-form";
import { getAllReviewMeta } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Write an AI Tool Review",
  description: "Start a new AI tool review draft with a clean editorial template.",
  alternates: {
    canonical: absoluteUrl("/tools/write")
  }
};

export default async function WriteReviewPage() {
  const tools = await getAllReviewMeta();

  return (
    <section className="container pageShell">
      <div className="feedTabs" role="navigation" aria-label="Review tabs">
        <Link href="/tools" className="feedTab">
          Review feed
        </Link>
        <Link href="/tools/write" className="feedTab feedTabActive">
          Write a review
        </Link>
      </div>

      <div className="writeShell">
        <div className="writeMain">
          <div className="pageIntro">
            <span className="eyebrow">New draft</span>
            <h1>Write a new review</h1>
            <p>Fill out the form below and the site will save a new MDX review file automatically.</p>
          </div>

          <ReviewForm />
        </div>

        <aside className="writeSidebar">
          <div className="contentCard">
            <span className="eyebrow">Writing checklist</span>
            <ul className="simpleList">
              <li>Use a clear headline and one-sentence verdict</li>
              <li>Cover pricing, strengths, and limitations</li>
              <li>Link to the official tool page</li>
              <li>Keep summaries skimmable for readers</li>
            </ul>
          </div>

          <div className="contentCard">
            <span className="eyebrow">Previous reviews</span>
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
