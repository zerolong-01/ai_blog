import type { Metadata } from "next";

import { SearchPanel } from "@/components/search-panel";
import { getAllReviewMeta } from "@/lib/reviews";
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

export default async function SearchPage() {
  const tools = await getAllReviewMeta();

  return (
    <section className="container pageShell">
      <div className="pageIntro">
        <span className="eyebrow">Search</span>
        <h1>Search the blog</h1>
        <p>Look through posts by title, summary, and topic.</p>
      </div>

      <SearchPanel tools={tools} />
    </section>
  );
}
