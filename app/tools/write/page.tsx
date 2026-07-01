import type { Metadata } from "next";
import Link from "next/link";

import { ReviewForm } from "@/components/review-form";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Write a Post",
  description: "Create a new Stacked AI post in markdown and publish it to the blog.",
  alternates: {
    canonical: absoluteUrl("/tools/write")
  }
};

export default function WriteReviewPage() {
  return (
    <section className="container pageShell writePageShell">
      <div className="feedTabs" role="navigation" aria-label="Review tabs">
        <Link href="/tools" className="feedTab">
          Blog
        </Link>
        <Link href="/tools/write" className="feedTab feedTabActive">
          Write
        </Link>
      </div>

      <div className="writeMain writeMainSolo">
        <div className="pageIntro">
          <span className="eyebrow">Editorial</span>
          <h1>Create a new post</h1>
          <p>
            Draft a publishable article for Stacked AI using a headline and markdown body. Posts are saved into the
            site library and immediately become part of the blog.
          </p>
        </div>

        <ReviewForm />
      </div>
    </section>
  );
}
