import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { renderMarkdown } from "@/lib/markdown";
import { getReviewBySlugForAdmin } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";
import { formatDate } from "@/lib/utils";

type PreviewPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PreviewPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Preview ${slug}`,
    description: "Private editorial preview.",
    alternates: {
      canonical: absoluteUrl(`/tools/${slug}/preview`)
    },
    robots: {
      index: false,
      follow: false
    }
  };
}

export default async function PreviewPostPage({ params }: PreviewPostPageProps) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const { slug } = await params;
  const post = await getReviewBySlugForAdmin(slug);

  if (!post) {
    notFound();
  }

  const content = await renderMarkdown(post.content);
  const editHref = `/tools/${post.slug}/edit` as Route;

  return (
    <article className="container reviewShell">
      <div className="previewToolbar">
        <span className={post.status === "published" ? "statusPublished" : "statusDraft"}>{post.status}</span>
        <span>Private editorial preview</span>
        <Link href={editHref} className="secondaryButton">
          Edit post
        </Link>
      </div>

      <header className="reviewHeader reviewHeaderSimple">
        <div>
          <span className="eyebrow">AI blog preview</span>
          <h1>{post.name}</h1>
          <p className="postDate">Updated {formatDate(post.updatedAt)}</p>
        </div>
      </header>

      <div className="postBody proseReview">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </article>
  );
}
