import type { Metadata } from "next";
import Link from "next/link";

import { categories } from "@/data/tools";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Tool Categories",
  description: "Browse AI tools by category, including writing, design, video, developer, and productivity software.",
  alternates: {
    canonical: absoluteUrl("/categories")
  }
};

export default function CategoriesPage() {
  return (
    <section className="container pageShell">
      <div className="pageIntro">
        <span className="eyebrow">Topic clusters</span>
        <h1>Browse categories</h1>
        <p>Category pages help users navigate faster and help search engines understand your topical authority.</p>
      </div>

      <div className="categoryGrid">
        {categories.map((category) => (
          <Link key={category.slug} href={`/categories/${category.slug}`} className="categoryCard">
            <h2>{category.name}</h2>
            <p>{category.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
