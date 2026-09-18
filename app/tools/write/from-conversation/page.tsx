import type { Metadata, Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ConversationPublishForm } from "@/components/conversation-publish-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "대화 내용 바로 게시", robots: { index: false, follow: false } };
export const runtime = "nodejs";
export const maxDuration = 75;

export default async function FromConversationPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  return (
    <section className="container pageShell writePageShell">
      <div className="feedTabs" role="navigation" aria-label="Editor tabs">
        <Link href="/tools/write" className="feedTab">Write manually</Link>
        <Link href={"/tools/write/from-news" as Route} className="feedTab">Generate from news</Link>
        <Link href={"/tools/write/from-conversation" as Route} className="feedTab feedTabActive">대화 내용 바로 게시</Link>
      </div>
      <div className="writeMain writeMainSolo">
        <div className="pageIntro"><span className="eyebrow">Publishing</span><h1>대화 내용을 블로그로</h1><p>제목을 입력하고 매일 업데이트된 내용을 붙여넣으면 버튼 한 번으로 블로그에 게시할 수 있습니다.</p></div>
        <ConversationPublishForm />
      </div>
    </section>
  );
}
