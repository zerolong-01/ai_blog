import { ToolReview, ToolReviewMeta } from "@/lib/types";
import {
  deletePost,
  getDatabaseStorageStatus,
  getPostCountBySlug,
  getPostRecordBySlug,
  getPostRecords,
  insertPost,
  toReview,
  toReviewMeta
} from "@/lib/posts-db";

let reviewMetaCache: Promise<ToolReviewMeta[]> | null = null;
const reviewContentCache = new Map<string, Promise<ToolReview | undefined>>();

type CreateReviewInput = Omit<ToolReviewMeta, "slug" | "updatedAt"> & {
  content: string;
  slug?: string;
  updatedAt?: string;
};

export type ReviewStorageStatus = {
  error: string | null;
  mode: "database";
  target: string;
};

function invalidateReviewCache(slug?: string) {
  reviewMetaCache = null;

  if (slug) {
    reviewContentCache.delete(slug);
    return;
  }

  reviewContentCache.clear();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function resolveUniqueSlug(baseSlug: string) {
  if ((await getPostCountBySlug(baseSlug)) === 0) {
    return baseSlug;
  }

  let index = 2;

  while ((await getPostCountBySlug(`${baseSlug}-${index}`)) > 0) {
    index += 1;
  }

  return `${baseSlug}-${index}`;
}

export function getReviewStorageStatus(): ReviewStorageStatus {
  const storage = getDatabaseStorageStatus();

  return {
    error: null,
    mode: storage.mode,
    target: storage.target
  };
}

export async function getAllReviews() {
  const records = await getPostRecords();
  return records.map(toReview);
}

export async function getAllReviewMeta(): Promise<ToolReviewMeta[]> {
  if (!reviewMetaCache) {
    reviewMetaCache = (async () => {
      const records = await getPostRecords();
      return records.map(toReviewMeta);
    })();
  }

  return reviewMetaCache;
}

export async function getReviewBySlug(slug: string) {
  const normalizedSlug = slugify(slug);

  if (!normalizedSlug) {
    return undefined;
  }

  const cachedReview = reviewContentCache.get(normalizedSlug);

  if (cachedReview) {
    return cachedReview;
  }

  const reviewPromise = (async () => {
    const record = await getPostRecordBySlug(normalizedSlug);
    return record ? toReview(record) : undefined;
  })();

  reviewContentCache.set(normalizedSlug, reviewPromise);

  return reviewPromise;
}

export async function getReviewsByCategory(category: string) {
  const reviews = await getAllReviewMeta();
  return reviews.filter((review) => review.category === category);
}

export async function createReviewFile(input: CreateReviewInput) {
  const baseSlug = slugify(input.slug?.trim() || input.name);

  if (!baseSlug) {
    throw new Error("A valid post title is required.");
  }

  const slug = await resolveUniqueSlug(baseSlug);
  const review: ToolReview = {
    ...input,
    slug,
    updatedAt: input.updatedAt || new Date().toISOString().slice(0, 10),
    rating: Number(input.rating),
    content: input.content.trim()
  };

  await insertPost(review);
  invalidateReviewCache(slug);

  return review;
}

export async function deleteReviewFile(slug: string) {
  const normalizedSlug = slugify(slug);

  if (!normalizedSlug) {
    throw new Error("A valid slug is required.");
  }

  const changes = await deletePost(normalizedSlug);

  if (changes === 0) {
    throw new Error(`Post not found: ${normalizedSlug}`);
  }

  invalidateReviewCache(normalizedSlug);

  return normalizedSlug;
}
