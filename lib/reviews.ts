import { unstable_cache } from "next/cache";
import { normalizePostQuery, normalizePostPage, postPageCount, POSTS_PER_PAGE } from "@/lib/post-pagination";
import { ToolReview, ToolReviewMeta } from "@/lib/types";
import { getBundledReviewBySlug, getBundledReviewMeta } from "@/lib/reviews-fallback";
import {
  deletePost,
  getDatabaseStorageStatus,
  getPostRecordBySlug,
  getPostRecords,
  getPostPage,
  insertPost,
  updatePost,
  toReview,
  toReviewMeta
} from "@/lib/posts-db";
import { siteConfig } from "@/lib/site";
import { INPUT_LIMITS } from "@/lib/input-validation";

type CreateReviewInput = Omit<ToolReviewMeta, "slug" | "author" | "publishedAt" | "updatedAt"> & {
  content: string;
  slug?: string;
  updatedAt?: string;
};

type UpdateReviewInput = Omit<ToolReviewMeta, "author" | "publishedAt" | "updatedAt"> & {
  content: string;
};

export type ReviewStorageStatus = {
  error: string | null;
  mode: "database" | "fallback";
  postCount?: number;
  target: string;
};

function reportStorageFailure(operation: string, error: unknown) {
  console.error("[review-storage]", {
    operation,
    message: error instanceof Error ? error.message : String(error),
    timestamp: new Date().toISOString()
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function getReviewStorageStatus(): ReviewStorageStatus {
  const storage = getDatabaseStorageStatus();

  return {
    error: storage.target === "DATABASE_URL not configured" ? "DATABASE_URL is missing." : null,
    mode: storage.mode,
    target: storage.target
  };
}

const getCachedMeta = unstable_cache(async () => (await getPostRecords()).map(toReviewMeta), ["post-meta-v2"], { revalidate: 300, tags: ["posts"] });
const getCachedPage = unstable_cache(getPostPage, ["post-page-v1"], { revalidate: 300, tags: ["posts"] });

export async function getReviewPage(rawPage?: string, rawQuery?: string) {
  const page = normalizePostPage(rawPage);
  const query = normalizePostQuery(rawQuery);
  try { return await getCachedPage(page, query); }
  catch (error) {
    reportStorageFailure("getReviewPage", error);
    const posts = (await getBundledReviewMeta()).filter((post) =>
      [post.name, post.tagline, post.summary, post.category, post.bestFor.join(" "), post.features.join(" ")].join(" ").toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.slug.localeCompare(a.slug));
    const pageCount = postPageCount(posts.length);
    const currentPage = Math.min(page, pageCount);
    return { posts: posts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE), total: posts.length, page: currentPage, pageCount };
  }
}

export async function getAllReviewMeta(): Promise<ToolReviewMeta[]> {
  try {
    return await getCachedMeta();
  } catch (error) {
    reportStorageFailure("getAllReviewMeta", error);
    const fallbackReviews = await getBundledReviewMeta();
    return fallbackReviews.map((review) => ({ ...review }));
  }
}

export async function getAllReviewMetaWithStatus(): Promise<{
  posts: ToolReviewMeta[];
  storage: ReviewStorageStatus;
}> {
  try {
    const records = await getPostRecords();

    return {
      posts: records.map(toReviewMeta).map((review) => ({ ...review })),
      storage: {
        error: null,
        mode: "database",
        postCount: records.length,
        target: "Neon Postgres"
      }
    };
  } catch (error) {
    reportStorageFailure("getAllReviewMetaWithStatus", error);
    const posts = (await getBundledReviewMeta()).map((review) => ({ ...review }));

    return {
      posts,
      storage: {
        error: error instanceof Error ? error.message : "Unknown database error.",
        mode: "fallback",
        postCount: posts.length,
        target: "Bundled emergency content"
      }
    };
  }
}

export async function getReviewBySlug(slug: string) {
  const normalizedSlug = slugify(slug);

  if (!normalizedSlug) {
    return undefined;
  }

  try {
    const record = await getPostRecordBySlug(normalizedSlug);
    return record ? { ...toReview(record) } : undefined;
  } catch (error) {
    reportStorageFailure("getReviewBySlug", error);
    const fallbackReview = await getBundledReviewBySlug(normalizedSlug);
    return fallbackReview ? { ...fallbackReview } : undefined;
  }
}

export async function getReviewsByCategory(category: string) {
  const reviews = await getAllReviewMeta();
  return reviews.filter((review) => review.category === category);
}

export async function getReviewsBySeries(seriesName: string) {
  const reviews = await getAllReviewMeta();

  return reviews
    .filter((review) => review.seriesName === seriesName)
    .sort(
      (left, right) =>
        (left.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (right.seriesOrder ?? Number.MAX_SAFE_INTEGER) ||
        left.publishedAt.localeCompare(right.publishedAt)
    );
}

export async function createReviewFile(input: CreateReviewInput) {
  const baseSlug = slugify(input.slug?.trim() || input.name).slice(0, INPUT_LIMITS.postSlug).replace(/-+$/, "");

  if (!baseSlug) {
    throw new Error("A valid post title is required.");
  }

  const slug = baseSlug;
  const review: ToolReview = {
    ...input,
    slug,
    author: siteConfig.creator,
    publishedAt: input.updatedAt || new Date().toISOString().slice(0, 10),
    updatedAt: input.updatedAt || new Date().toISOString().slice(0, 10),
    rating: Number(input.rating),
    content: input.content.trim()
  };

  // The primary key arbitrates concurrent writers; never update an existing post here.
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = {
      ...review,
      slug: attempt === 0 ? baseSlug : `${baseSlug.slice(0, INPUT_LIMITS.postSlug - 37).replace(/-+$/, "")}-${crypto.randomUUID()}`
    };
    if (await insertPost(candidate)) return candidate;
  }
  throw new Error("Could not allocate a unique post address. Please retry.");
}

export async function updateReviewFile(input: UpdateReviewInput) {
  const slug = slugify(input.slug);

  if (!slug) {
    throw new Error("A valid slug is required.");
  }

  const existingReview = await getReviewBySlug(slug);

  if (!existingReview) {
    throw new Error(`Post not found: ${slug}`);
  }

  const review: ToolReview = {
    ...input,
    slug,
    author: existingReview.author,
    publishedAt: existingReview.publishedAt,
    updatedAt: new Date().toISOString().slice(0, 10),
    rating: Number(input.rating),
    content: input.content.trim()
  };

  await updatePost(review);

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

  return normalizedSlug;
}
