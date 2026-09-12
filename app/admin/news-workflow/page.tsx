import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "News workflow",
  description: "Create reviewed AI news posts without an API.",
  alternates: {
    canonical: absoluteUrl("/admin/news-workflow")
  },
  robots: {
    index: false,
    follow: false
  }
};

const scheduledTaskPrompt = `Every weekday at 08:00 Asia/Seoul, research notable AI, productivity, and developer-tool news published in the last 24 hours. Use official announcements and reputable reporting only.

Return:
1. Five candidate stories with publisher, publication date, source URL, and a one-sentence statement of the verified fact.
2. One recommended story, with a short explanation of why it matters to practical AI-tool users.
3. A Korean Markdown article draft of 1,200–1,800 Korean characters. Include an H2 introduction, two or three H2 sections, and a short takeaway.
4. Three SEO headline options, one meta description (under 155 characters), and five tags.
5. A Sources section containing every URL used.

Rules:
- Do not copy wording from source articles beyond a short necessary quotation.
- Clearly distinguish verified facts from analysis.
- Never invent dates, pricing, product availability, quotes, or capabilities.
- If a claim cannot be verified, omit it.
- Write in clear Korean for readers who use AI tools at work.`;

export default async function NewsWorkflowPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  return (
    <section className="container pageShell writePageShell">
      <div className="feedTabs" role="navigation" aria-label="Admin navigation">
        <Link href="/admin" className="feedTab">
          Admin
        </Link>
        <Link href={"/admin/news-workflow" as Route} className="feedTab feedTabActive">
          News workflow
        </Link>
        <Link href="/tools/write" className="feedTab">
          New draft
        </Link>
      </div>

      <div className="writeMain writeMainSolo newsWorkflow">
        <div className="pageIntro">
          <span className="eyebrow">API-free publishing</span>
          <h1>News to reviewed post</h1>
          <p>Use ChatGPT Plus for scheduled research and drafting. This site keeps the final publishing decision with you.</p>
        </div>

        <ol className="workflowSteps">
          <li>Create a weekday Scheduled task in ChatGPT Plus with the prompt below.</li>
          <li>Check every date, number, quote, and source against the original article.</li>
          <li>Paste the edited Markdown into a new post and choose <strong>Save draft</strong>.</li>
          <li>Open the draft from Admin, complete the review, and choose <strong>Publish changes</strong>.</li>
        </ol>

        <label className="fieldGroup">
          <span>Scheduled task prompt</span>
          <textarea className="workflowPrompt" value={scheduledTaskPrompt} readOnly rows={22} aria-label="Scheduled task prompt" />
        </label>

        <div className="workflowNotice">
          <h2>Publishing rule</h2>
          <p>
            Drafts are private: they are excluded from the blog, search, category pages, and sitemap. Publish only articles with
            checked source links and original analysis.
          </p>
        </div>
      </div>
    </section>
  );
}
