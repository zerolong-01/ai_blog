import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Write an AI Tool Review",
  description: "Start a new AI tool review draft with a clean editorial template.",
  alternates: {
    canonical: absoluteUrl("/tools/write")
  }
};

const sections = [
  "What the tool does",
  "Who it is best for",
  "Pricing and plan notes",
  "Strengths",
  "Weaknesses",
  "Final verdict"
];

export default function WriteReviewPage() {
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
            <p>Use this structure to keep every AI tool review readable, consistent, and easy to expand later.</p>
          </div>

          <article className="editorCard">
            <div className="editorTopline">Title</div>
            <h2>Example: Cursor review for developers shipping fast</h2>
            <p className="editorLead">
              Start with a short thesis that explains who the tool is for and whether it is worth paying for.
            </p>

            {sections.map((section) => (
              <section key={section} className="editorSection">
                <h3>{section}</h3>
                <p>
                  Add concise, concrete notes here. Focus on fit, tradeoffs, and the kind of user who benefits most.
                </p>
              </section>
            ))}
          </article>
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
            <span className="eyebrow">Back to archive</span>
            <p>Want to compare tone or structure first?</p>
            <Link href="/tools" className="secondaryButton">
              View previous reviews
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
