import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";

import { deletePostAction, logoutAdminAction } from "@/app/admin/actions";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminConfigError, isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllReviewMetaWithStatus } from "@/lib/reviews";
import { getRecentNewsDrafts } from "@/lib/news-drafts";
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

  const [{ posts, storage }, drafts] = await Promise.all([getAllReviewMetaWithStatus(), getRecentNewsDrafts().catch(() => [])]);

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
        <Link href={"/tools/write/from-news" as Route} className="secondaryButton">
          Generate from news
        </Link>
        <form action={logoutAdminAction}>
          <button type="submit" className="secondaryButton">
            Sign out
          </button>
        </form>
      </div>

      <div className={`storageNotice ${storage.error ? "storageNoticeError" : "storageNoticeHealthy"}`} role="status">
        <strong>{storage.error ? "Database unavailable" : "Database connected"}</strong>
        <span>
          {storage.error
            ? ` Showing ${storage.postCount ?? 0} bundled fallback posts. Publishing is unavailable until the database recovers.`
            : ` ${storage.postCount ?? 0} published posts in ${storage.target}.`}
        </span>
        {storage.error ? <code>{storage.error}</code> : null}
      </div>

      {drafts.length > 0 ? (
        <section className="adminDraftSection" aria-labelledby="drafts-heading">
          <div className="sectionHeading"><div><span className="eyebrow">AI-assisted editorial</span><h2 id="drafts-heading">Recent drafts</h2></div></div>
          <div className="adminList">
            {drafts.map((draft) => (
              <article key={draft.id} className="adminCard">
                <div className="adminCardBody"><div className="adminMeta"><span>{draft.status}</span><span>{draft.sourcePublisher}</span></div><h3>{draft.generatedTitle || draft.sourceTitle || draft.sourceUrl}</h3></div>
                <div className="adminActions">
                  {draft.status === "published" && draft.publishedPostSlug ? <Link href={`/tools/${draft.publishedPostSlug}`} className="secondaryButton">View post</Link> : <Link href={`/tools/write/from-news/${draft.id}` as Route} className="secondaryButton">Review</Link>}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

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
                <label className="deleteConfirmation">
                  <input type="checkbox" name="confirmation" value={post.slug} required />
                  <span>Confirm delete</span>
                </label>
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
