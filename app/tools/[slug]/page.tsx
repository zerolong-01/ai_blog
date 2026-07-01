import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { renderMarkdown } from "@/lib/markdown";
import { getReviewBySlug } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";
import { formatDate, slugToTitle } from "@/lib/utils";

type ToolPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getReviewBySlug(slug);

  if (!tool) {
    return {
      title: slugToTitle(slug)
    };
  }

  return {
    title: tool.name,
    description: tool.summary,
    alternates: {
      canonical: absoluteUrl(`/tools/${tool.slug}`)
    },
    openGraph: {
      title: tool.name,
      description: tool.summary,
      url: absoluteUrl(`/tools/${tool.slug}`),
      type: "article"
    }
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = await getReviewBySlug(slug);

  if (!tool) {
    notFound();
  }

  const reviewContent = await renderMarkdown(tool.content);

  return (
    <article className="container reviewShell">
      <header className="reviewHeader reviewHeaderSimple">
        <div>
          <span className="eyebrow">AI blog</span>
          <h1>{tool.name}</h1>
          <p className="postDate">Updated {formatDate(tool.updatedAt)}</p>
        </div>
      </header>

      <div className="postBody proseReview">
        <div dangerouslySetInnerHTML={{ __html: reviewContent }} />
      </div>

      <div className="postBackLink">
        <Link href="/tools" className="textLink">
          Back to blog
        </Link>
      </div>
    </article>
  );
}
