import type { Metadata } from "next";
import Link from "next/link";

import { categories } from "@/data/categories";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Blog Categories",
  description: "Browse AI blog topics including workflows, tools, writing, design, and broader AI ideas.",
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
        <p>Explore broader AI topics instead of product-only reviews.</p>
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
