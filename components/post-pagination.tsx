import Link from "next/link";

export function PostPagination({ page, pageCount, path, query = "" }: { page: number; pageCount: number; path: "/tools" | "/search"; query?: string }) {
  if (pageCount <= 1) return null;
  const href = (target: number) => ({ pathname: path, query: { ...(query ? { q: query } : {}), page: target } });
  return <nav className="postPageNavigation" aria-label="글 목록 페이지">
    {page > 1 ? <Link href={href(page - 1)} className="secondaryButton">이전</Link> : <span />}
    <span>{page} / {pageCount}</span>
    {page < pageCount ? <Link href={href(page + 1)} className="secondaryButton">다음</Link> : <span />}
  </nav>;
}
