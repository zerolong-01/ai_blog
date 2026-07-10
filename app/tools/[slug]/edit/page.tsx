import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ReviewForm } from "@/components/review-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getReviewBySlug, getReviewStorageStatus } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";

type EditPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EditPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Edit ${slug}`,
    description: "Edit an existing blog post.",
    alternates: {
      canonical: absoluteUrl(`/tools/${slug}/edit`)
    }
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const { slug } = await params;
  const post = await getReviewBySlug(slug);

  if (!post) {
    notFound();
  }

  const storageStatus = getReviewStorageStatus();

  return (
    <section className="container pageShell writePageShell">
      <div className="feedTabs" role="navigation" aria-label="Editor tabs">
        <Link href="/tools" className="feedTab">
          Blog
        </Link>
        <Link href="/admin" className="feedTab">
          Admin
        </Link>
        <Link href={`/tools/${post.slug}/edit` as Route} className="feedTab feedTabActive">
          Edit
        </Link>
      </div>

      <div className="writeMain writeMainSolo">
        <div className="pageIntro">
          <span className="eyebrow">Editorial</span>
          <h1>Edit post</h1>
          <p>Update the title or markdown body, then save the changes back to the blog.</p>
          <p className="editorHint">Storage: Posts are persisted in the blog database at {storageStatus.target}.</p>
          {storageStatus.error ? <p className="formError">{storageStatus.error}</p> : null}
        </div>

        <ReviewForm
          mode="edit"
          initialValues={{
            slug: post.slug,
            name: post.name,
            content: post.content
          }}
        />
      </div>
    </section>
  );
}
