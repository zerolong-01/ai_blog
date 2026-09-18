export const POSTS_PER_PAGE = 12;
export function normalizePostQuery(value: string | undefined) { return (value || "").trim().slice(0, 200); }
export function normalizePostPage(value: string | undefined) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? Math.min(page, 10000) : 1;
}
export function postPageCount(total: number) { return Math.max(1, Math.ceil(total / POSTS_PER_PAGE)); }
