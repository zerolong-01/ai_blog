import type { Metadata } from "next";

import { SearchPanel } from "@/components/search-panel";
import { getAllReviewMeta } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Search AI Tools",
  description: "Search AI tool reviews by name, category, use case, and standout features.",
  alternates: {
    canonical: absoluteUrl("/search")
  }
};

export default async function SearchPage() {
  const tools = await getAllReviewMeta();

  return (
    <section className="container pageShell">
      <div className="pageIntro">
        <span className="eyebrow">Search</span>
        <h1>Find the right AI tool faster</h1>
        <p>Readers can search by use case, which improves utility and supports deeper internal discovery.</p>
      </div>

      <SearchPanel tools={tools} />
    </section>
  );
}
