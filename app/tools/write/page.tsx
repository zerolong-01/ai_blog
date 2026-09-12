import type { Metadata, Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ReviewForm } from "@/components/review-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllReviewMeta, getReviewStorageStatus } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Write a Post",
  description: "Create a new Stacked AI post in markdown and publish it to the blog.",
  alternates: {
    canonical: absoluteUrl("/tools/write")
  }
};

export default async function WriteReviewPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const storageStatus = getReviewStorageStatus();
  const posts = await getAllReviewMeta();
  const seriesOptions = [...new Set(posts.map((post) => post.seriesName).filter((name): name is string => Boolean(name)))];

  return (
    <section className="container pageShell writePageShell">
      <div className="feedTabs" role="navigation" aria-label="Review tabs">
        <Link href="/tools" className="feedTab">
          Blog
        </Link>
        <Link href="/tools/write" className="feedTab feedTabActive">
          Write
        </Link>
        <Link href={"/tools/write/from-news" as Route} className="feedTab">
          Generate from news
        </Link>
      </div>

      <div className="writeMain writeMainSolo">
        <div className="pageIntro">
          <span className="eyebrow">Editorial</span>
          <h1>Create a new post</h1>
          <p>
            Draft a fact-checked article using a headline and markdown body. Save private work as a draft, then publish
            it only when it is ready for readers.
          </p>
          <p className="editorHint">
            Storage: Posts are persisted in the blog database at {storageStatus.target}.
          </p>
          {storageStatus.error ? <p className="formError">{storageStatus.error}</p> : null}
        </div>

        <ReviewForm seriesOptions={seriesOptions} />
      </div>
    </section>
  );
}
