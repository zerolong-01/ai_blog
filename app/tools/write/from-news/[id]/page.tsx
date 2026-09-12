import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ReviewForm } from "@/components/review-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getNewsDraft } from "@/lib/news-drafts";

type PageProps = { params: Promise<{ id: string }> };
export const metadata: Metadata = { title: "Review AI Draft", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewsDraftPage({ params }: PageProps) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const { id } = await params;
  const draft = await getNewsDraft(id).catch((error) => {
    console.error("[news-draft-page]", { id, message: error instanceof Error ? error.message : String(error) });
    return undefined;
  });
  if (!draft) notFound();
  if (draft.status === "published" && draft.publishedPostSlug) redirect(`/tools/${draft.publishedPostSlug}`);

  return (
    <section className="container pageShell writePageShell">
      <div className="feedTabs"><Link href={"/tools/write/from-news" as Route} className="feedTab">New import</Link><span className="feedTab feedTabActive">Review draft</span></div>
      <div className="writeMain writeMainSolo">
        <div className="pageIntro"><span className="eyebrow">Private AI draft</span><h1>Review before publishing</h1><p>Check every claim, link, and conclusion. Publishing remains a deliberate editorial decision.</p></div>
        {draft.status === "failed" ? <div className="storageNotice storageNoticeError"><strong>Generation failed</strong><span>{draft.errorMessage}</span></div> : null}
        {draft.status === "generating" ? <div className="storageNotice storageNoticeHealthy"><strong>Generation in progress</strong><span>This draft is still being generated. Refresh this page shortly.</span></div> : null}
        {draft.warnings.length ? <aside className="draftWarnings"><strong>Review warnings</strong><ul>{draft.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></aside> : null}
        <div className="draftSourceCard"><span className="eyebrow">Primary source</span><a href={draft.sourceUrl} target="_blank" rel="noopener noreferrer">{draft.sourceTitle || draft.sourceUrl}</a><p>{draft.sourcePublisher}{draft.sourcePublishedAt ? ` · ${new Date(draft.sourcePublishedAt).toLocaleDateString("en-US")}` : ""}</p></div>
        {draft.status === "ready" ? <ReviewForm initialValues={{ name: draft.generatedTitle, summary: draft.generatedSummary, content: draft.generatedContent, seriesName: draft.suggestedSeriesName, seriesOrder: draft.suggestedSeriesOrder }} draftId={draft.id} intro={<div className="draftThemeNotice"><strong>{draft.suggestedSeriesOrder === 1 ? "New theme" : "Matched theme"}: {draft.suggestedSeriesName}</strong><span>Part {draft.suggestedSeriesOrder}. You can change this assignment before publishing.</span><span>Generated with {draft.model}. Sources are included at the end of the Markdown body.</span></div>} /> : null}
      </div>
    </section>
  );
}
