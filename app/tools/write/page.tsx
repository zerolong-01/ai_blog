import type { Metadata } from "next";
import Link from "next/link";

import { ReviewForm } from "@/components/review-form";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Write a Post",
  description: "Write a new AI blog post in markdown.",
  alternates: {
    canonical: absoluteUrl("/tools/write")
  }
};

export default function WriteReviewPage() {
  return (
    <section className="container pageShell">
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
          <span className="eyebrow">New post</span>
          <h1>Write a new post</h1>
          <p>Just a title and markdown content. Nothing extra.</p>
        </div>

        <ReviewForm />
      </div>
    </section>
  );
}
