import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPostRevision, getPostRevisions } from "@/lib/posts-db";
import { normalizePostPage } from "@/lib/post-pagination";
import { renderMarkdown } from "@/lib/markdown";
import { RestoreRevisionForm } from "@/components/restore-revision-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "글 수정 이력·삭제 복구", robots: { index: false, follow: false } };

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ slug?: string; id?: string; page?: string }> }) {
  if (!await isAdminAuthenticated()) redirect("/admin");
  const params = await searchParams;
  const page = normalizePostPage(params.page);
  const slug = params.slug?.slice(0, 200) || null;
  let revisions: Awaited<ReturnType<typeof getPostRevisions>> = [];
  let selected: Awaited<ReturnType<typeof getPostRevision>>;
  let unavailable = false;
  try {
    revisions = await getPostRevisions(slug, page);
    if (params.id && /^[1-9]\d{0,17}$/.test(params.id)) selected = await getPostRevision(params.id);
  } catch { unavailable = true; }
  const href = (target: number) => ({ pathname: "/admin/history", query: { ...(slug ? { slug } : {}), page: target } });
  return <section className="container pageShell">
    <div className="pageIntro"><h1>글 수정 이력·삭제 복구</h1><p>수정·삭제하기 직전의 내용을 보관합니다. 목록에서 복원할 버전을 선택하세요.</p><Link href="/admin" className="textLink">관리자로 돌아가기</Link></div>
    {unavailable ? <p role="alert">이력을 불러오지 못했습니다. 데이터베이스 연결과 이력 마이그레이션 적용 여부를 확인해 주세요.</p> : null}
    <div className="adminList">{revisions.slice(0, 20).map((revision) => <article className="adminCard" key={revision.id}>
      <div><h2>{revision.name}</h2><p>{revision.action === "delete" ? "삭제 전" : "수정 전"} · {new Date(revision.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</p><p>/{revision.post_slug}</p></div>
      <Link href={{ pathname: "/admin/history", query: { ...(slug ? { slug } : {}), page, id: revision.id } }} className="secondaryButton">내용 확인·복원</Link>
    </article>)}</div>
    {!unavailable && !revisions.length ? <p>보관된 이력이 없습니다.</p> : null}
    <nav className="postPageNavigation" aria-label="이력 페이지">{page > 1 ? <Link href={href(page - 1)}>이전</Link> : <span />}{revisions.length > 20 ? <Link href={href(page + 1)}>다음</Link> : null}</nav>
    {selected ? <section className="revisionPreview"><h2>{selected.review.name}</h2><p>원래 게시일: {selected.review.publishedAt}</p><div className="postBody proseReview previewBody" dangerouslySetInnerHTML={{ __html: await renderMarkdown(selected.review.content) }} /><RestoreRevisionForm key={selected.id} id={selected.id} /></section> : null}
  </section>;
}
