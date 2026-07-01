import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import { ToolCategory, ToolReview, ToolReviewMeta } from "@/lib/types";

const reviewsDirectory = path.join(process.cwd(), "content", "reviews");

type ReviewFrontmatter = Omit<ToolReviewMeta, "rating"> & {
  title?: string;
  rating: number | string;
};

export type CreateReviewInput = Omit<ToolReviewMeta, "slug" | "updatedAt"> & {
  content: string;
  slug?: string;
  updatedAt?: string;
};

function normalizeList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toToolReview(fileSlug: string, frontmatter: ReviewFrontmatter, content: string): ToolReview {
  const name = String(frontmatter.name || frontmatter.title || fileSlug);
  const summary =
    String(frontmatter.summary || "").trim() ||
    content
      .replace(/^#+\s+/gm, "")
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .find(Boolean)
      ?.slice(0, 180) ||
    "";

  return {
    slug: String(frontmatter.slug || fileSlug),
    name,
    tagline: String(frontmatter.tagline || ""),
    category: (frontmatter.category as ToolCategory) || "general",
    website: String(frontmatter.website || ""),
    price: String(frontmatter.price || ""),
    rating: Number(frontmatter.rating || 0),
    summary,
    bestFor: normalizeList(frontmatter.bestFor),
    pros: normalizeList(frontmatter.pros),
    cons: normalizeList(frontmatter.cons),
    features: normalizeList(frontmatter.features),
    verdict: String(frontmatter.verdict || ""),
    updatedAt: String(frontmatter.updatedAt || new Date().toISOString().slice(0, 10)),
    content
  };
}

async function ensureReviewsDirectory() {
  await mkdir(reviewsDirectory, { recursive: true });
}

async function readReviewFromFile(filename: string) {
  const filePath = path.join(reviewsDirectory, filename);
  const source = await readFile(filePath, "utf8");
  const { data, content } = matter(source);
  const slug = filename.replace(/\.mdx$/, "");

  return toToolReview(slug, data as ReviewFrontmatter, content.trim());
}

export async function getAllReviews() {
  await ensureReviewsDirectory();
  const filenames = await readdir(reviewsDirectory);
  const mdxFiles = filenames.filter((filename) => filename.endsWith(".mdx"));
  const reviews = await Promise.all(mdxFiles.map(readReviewFromFile));

  return reviews.sort((left, right) => {
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

export async function getAllReviewMeta(): Promise<ToolReviewMeta[]> {
  const reviews = await getAllReviews();
  return reviews.map((review) => {
    const { content, ...meta } = review;
    void content;
    return meta;
  });
}

export async function getReviewBySlug(slug: string) {
  const reviews = await getAllReviews();
  return reviews.find((review) => review.slug === slug);
}

export async function getReviewsByCategory(category: string) {
  const reviews = await getAllReviewMeta();
  return reviews.filter((review) => review.category === category);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function serializeReviewToMdx(review: ToolReview) {
  const data: Record<string, unknown> = {
    title: review.name,
    slug: review.slug,
    updatedAt: review.updatedAt
  };

  if (review.category && review.category !== "general") data.category = review.category;
  if (review.summary) data.summary = review.summary;
  if (review.tagline) data.tagline = review.tagline;
  if (review.website) data.website = review.website;
  if (review.price) data.price = review.price;
  if (review.rating) data.rating = review.rating;
  if (review.bestFor.length) data.bestFor = review.bestFor;
  if (review.pros.length) data.pros = review.pros;
  if (review.cons.length) data.cons = review.cons;
  if (review.features.length) data.features = review.features;
  if (review.verdict) data.verdict = review.verdict;

  return matter.stringify(review.content, data);
}

async function resolveUniqueSlug(baseSlug: string) {
  const reviews = await getAllReviewMeta();
  const taken = new Set(reviews.map((review) => review.slug));

  if (!taken.has(baseSlug)) {
    return baseSlug;
  }

  let index = 2;

  while (taken.has(`${baseSlug}-${index}`)) {
    index += 1;
  }

  return `${baseSlug}-${index}`;
}

export async function createReviewFile(input: CreateReviewInput) {
  const baseSlug = slugify(input.slug?.trim() || input.name);

  if (!baseSlug) {
    throw new Error("A valid review title is required.");
  }

  const slug = await resolveUniqueSlug(baseSlug);
  const review: ToolReview = {
    ...input,
    slug,
    updatedAt: input.updatedAt || new Date().toISOString().slice(0, 10),
    rating: Number(input.rating),
    content: input.content.trim()
  };

  await ensureReviewsDirectory();
  const filePath = path.join(reviewsDirectory, `${slug}.mdx`);
  await writeFile(filePath, serializeReviewToMdx(review), "utf8");

  return review;
}

export async function deleteReviewFile(slug: string) {
  const normalizedSlug = slugify(slug);

  if (!normalizedSlug) {
    throw new Error("A valid slug is required.");
  }

  const filePath = path.join(reviewsDirectory, `${normalizedSlug}.mdx`);
  await unlink(filePath);

  return normalizedSlug;
}
