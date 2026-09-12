import type { ToolReviewMeta } from "@/lib/types";

export type SeriesContext = {
  name: string;
  description: string;
  postCount: number;
  nextOrder: number;
};

export function buildSeriesContext(posts: ToolReviewMeta[]): SeriesContext[] {
  const byName = new Map<string, SeriesContext>();
  for (const post of posts) {
    if (!post.seriesName) continue;
    const current = byName.get(post.seriesName);
    byName.set(post.seriesName, {
      name: post.seriesName,
      description: current?.description || post.summary,
      postCount: (current?.postCount || 0) + 1,
      nextOrder: Math.max(current?.nextOrder || 1, (post.seriesOrder || 0) + 1)
    });
  }
  return [...byName.values()].sort((left, right) => right.postCount - left.postCount || left.name.localeCompare(right.name));
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, " ").trim();
}

export function resolveSeriesAssignment(suggestedName: string, existing: SeriesContext[]) {
  const cleanName = suggestedName.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, 120);
  if (!cleanName) throw new Error("The AI response did not include a valid theme.");
  const match = existing.find((series) => normalized(series.name) === normalized(cleanName));
  return match ? { name: match.name, order: match.nextOrder, isNew: false } : { name: cleanName, order: 1, isNew: true };
}
