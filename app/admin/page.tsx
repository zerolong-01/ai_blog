import type { Metadata } from "next";
import Link from "next/link";

import { deletePostAction } from "@/app/admin/actions";
import { getAllReviewMeta } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage published blog posts.",
  alternates: {
    canonical: absoluteUrl("/admin")
  }
};

export default async function AdminPage() {
  const posts = await getAllReviewMeta();

  return (
    <section className="container pageShell adminShell">
      <div className="pageIntro adminIntro">
        <span className="eyebrow">Admin</span>
        <h1>Manage posts</h1>
        <p>Delete published posts from the MDX library.</p>
      </div>

      <div className="adminToolbar">
        <Link href="/tools" className="secondaryButton">
          View blog
        </Link>
        <Link href="/tools/write" className="primaryButton">
          Write post
        </Link>
      </div>

      <div className="adminList">
        {posts.map((post) => (
          <article key={post.slug} className="adminCard">
            <div className="adminCardBody">
              <div className="adminMeta">
                <span>{formatDate(post.updatedAt)}</span>
                <span>/{post.slug}</span>
              </div>
              <h2>
                <Link href={`/tools/${post.slug}`} className="feedTitleLink">
                  {post.name}
                </Link>
              </h2>
              {post.summary ? <p className="feedSummary">{post.summary}</p> : null}
            </div>

            <form action={deletePostAction} className="adminDeleteForm">
              <input type="hidden" name="slug" value={post.slug} />
              <button type="submit" className="adminDeleteButton">
                Delete
              </button>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}
