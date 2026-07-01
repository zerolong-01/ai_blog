import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ToolCard } from "@/components/tool-card";
import { categories } from "@/data/categories";
import { getReviewsByCategory } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return { title: "Category" };
  }

  return {
    title: `${category.name} Reviews`,
    description: category.description,
    alternates: {
      canonical: absoluteUrl(`/categories/${category.slug}`)
    }
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const relatedTools = await getReviewsByCategory(slug);

  return (
    <section className="container pageShell">
      <div className="pageIntro">
        <span className="eyebrow">Category</span>
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </div>

      <div className="cardGrid">
        {relatedTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}
