import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import { ToolCategory, ToolReview, ToolReviewMeta } from "@/lib/types";

type ReviewFrontmatter = Omit<ToolReviewMeta, "rating"> & {
  title?: string;
  rating: number | string;
};

function getBundledReviewsDirectory() {
  return path.join(process.cwd(), "content", "reviews");
}

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
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

function toToolReviewMeta(review: ToolReview): ToolReviewMeta {
  const { content, ...meta } = review;
  void content;
  return meta;
}

async function listBundledReviewFiles() {
  try {
    const filenames = await readdir(getBundledReviewsDirectory());
    return filenames.filter((filename) => filename.endsWith(".mdx"));
  } catch {
    return [];
  }
}

async function readBundledReviewFile(filename: string) {
  const source = await readFile(path.join(getBundledReviewsDirectory(), filename), "utf8");
  const { data, content } = matter(source);
  const slug = filename.replace(/\.mdx$/, "");

  return toToolReview(slug, data as ReviewFrontmatter, content.trim());
}

export async function getBundledReviews() {
  const filenames = await listBundledReviewFiles();
  const reviews = await Promise.all(filenames.map(readBundledReviewFile));

  return reviews.sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

export async function getBundledReviewMeta() {
  const reviews = await getBundledReviews();
  return reviews.map(toToolReviewMeta);
}

export async function getBundledReviewBySlug(slug: string) {
  const normalizedSlug = slugify(slug);

  if (!normalizedSlug) {
    return undefined;
  }

  try {
    return await readBundledReviewFile(`${normalizedSlug}.mdx`);
  } catch {
    return undefined;
  }
}
