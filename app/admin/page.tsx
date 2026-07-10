import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";

import { deletePostAction, logoutAdminAction } from "@/app/admin/actions";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminConfigError, isAdminAuthenticated } from "@/lib/admin-auth";
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

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configError = getAdminConfigError();
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <section className="container pageShell adminShell">
        <div className="pageIntro adminIntro">
          <span className="eyebrow">Admin</span>
          <h1>Sign in</h1>
          <p>Enter the admin password to manage published posts.</p>
        </div>

        <div className="adminLoginCard">
          {configError ? <p className="formError">{configError} Add them in your deployment environment settings.</p> : null}
          <AdminLoginForm />
        </div>
      </section>
    );
  }

  const posts = await getAllReviewMeta();

  return (
    <section className="container pageShell adminShell">
      <div className="pageIntro adminIntro">
        <span className="eyebrow">Admin</span>
        <h1>Manage posts</h1>
        <p>Delete published posts from the blog database.</p>
      </div>

      <div className="adminToolbar">
        <Link href="/tools" className="secondaryButton">
          View blog
        </Link>
        <Link href="/tools/write" className="primaryButton">
          Write post
        </Link>
        <form action={logoutAdminAction}>
          <button type="submit" className="secondaryButton">
            Sign out
          </button>
        </form>
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

            <div className="adminActions">
              <Link href={`/tools/${post.slug}/edit` as Route} className="secondaryButton">
                Edit
              </Link>
              <form action={deletePostAction} className="adminDeleteForm">
                <input type="hidden" name="slug" value={post.slug} />
                <button type="submit" className="adminDeleteButton">
                  Delete
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
