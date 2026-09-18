import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { NewsDraftForm } from "@/components/news-draft-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = { title: "Generate from News", description: "Generate a reviewable AI analysis draft from a news article.", alternates: { canonical: absoluteUrl("/tools/write/from-news") } };
export const maxDuration = 75;

export default async function FromNewsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  return (
    <section className="container pageShell writePageShell">
      <div className="feedTabs" role="navigation" aria-label="Editor tabs">
        <Link href="/tools/write" className="feedTab">Write manually</Link>
        <Link href={"/tools/write/from-news" as Route} className="feedTab feedTabActive">Generate from news</Link>
        <Link href={"/tools/write/from-conversation" as Route} className="feedTab">대화 내용 바로 게시</Link>
      </div>
      <div className="writeMain writeMainSolo">
        <div className="pageIntro"><span className="eyebrow">AI-assisted editorial</span><h1>Turn news into analysis</h1><p>Provide one source article. Stacked AI will verify context, write an English analysis, and save it as a private draft.</p></div>
        <NewsDraftForm />
      </div>
    </section>
  );
}
