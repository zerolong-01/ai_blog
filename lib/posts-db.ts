import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { neon } from "@neondatabase/serverless";

import { ToolCategory, ToolReview, ToolReviewMeta } from "@/lib/types";

type ReviewFrontmatter = Omit<ToolReviewMeta, "rating"> & {
  title?: string;
  rating: number | string;
};

type CountRow = {
  count: string | number;
};

type PostRecord = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  website: string;
  price: string;
  rating: string | number;
  summary: string;
  best_for: unknown;
  pros: unknown;
  cons: unknown;
  features: unknown;
  verdict: string;
  content: string;
  created_at: string;
  updated_at: string;
};

let initialized = false;
let initializationPromise: Promise<void> | null = null;

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return connectionString;
}

function getSql() {
  return neon(getConnectionString());
}

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

function parseList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map(String).map((item) => item.trim()).filter(Boolean) : [];
    } catch {
      return [];
    }
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

function mapRecordToReview(record: PostRecord): ToolReview {
  return {
    slug: record.slug,
    name: record.name,
    tagline: record.tagline,
    category: (record.category as ToolCategory) || "general",
    website: record.website,
    price: record.price,
    rating: Number(record.rating || 0),
    summary: record.summary,
    bestFor: parseList(record.best_for),
    pros: parseList(record.pros),
    cons: parseList(record.cons),
    features: parseList(record.features),
    verdict: record.verdict,
    updatedAt: record.updated_at,
    content: record.content
  };
}

async function importBundledMdxPosts() {
  const directory = getBundledReviewsDirectory();

  if (!existsSync(directory)) {
    return;
  }

  const filenames = (await readdir(directory)).filter((filename) => filename.endsWith(".mdx"));

  if (filenames.length === 0) {
    return;
  }

  for (const filename of filenames) {
    const source = await readFile(path.join(directory, filename), "utf8");
    const { data, content } = matter(source);
    const review = toToolReview(filename.replace(/\.mdx$/, ""), data as ReviewFrontmatter, content.trim());
    await upsertPost(review);
  }
}

async function upsertPost(review: ToolReview) {
  const sql = getSql();

  await sql`
    INSERT INTO posts (
      slug,
      name,
      tagline,
      category,
      website,
      price,
      rating,
      summary,
      best_for,
      pros,
      cons,
      features,
      verdict,
      content,
      created_at,
      updated_at
    ) VALUES (
      ${review.slug},
      ${review.name},
      ${review.tagline},
      ${review.category},
      ${review.website},
      ${review.price},
      ${review.rating},
      ${review.summary},
      ${JSON.stringify(review.bestFor)}::jsonb,
      ${JSON.stringify(review.pros)}::jsonb,
      ${JSON.stringify(review.cons)}::jsonb,
      ${JSON.stringify(review.features)}::jsonb,
      ${review.verdict},
      ${review.content},
      ${review.updatedAt}::date,
      ${review.updatedAt}::date
    )
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      tagline = EXCLUDED.tagline,
      category = EXCLUDED.category,
      website = EXCLUDED.website,
      price = EXCLUDED.price,
      rating = EXCLUDED.rating,
      summary = EXCLUDED.summary,
      best_for = EXCLUDED.best_for,
      pros = EXCLUDED.pros,
      cons = EXCLUDED.cons,
      features = EXCLUDED.features,
      verdict = EXCLUDED.verdict,
      content = EXCLUDED.content,
      updated_at = EXCLUDED.updated_at
  `;
}

async function initializeDatabase() {
  if (initialized) {
    return;
  }

  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'general',
      website TEXT NOT NULL DEFAULT '',
      price TEXT NOT NULL DEFAULT '',
      rating DOUBLE PRECISION NOT NULL DEFAULT 0,
      summary TEXT NOT NULL DEFAULT '',
      best_for JSONB NOT NULL DEFAULT '[]'::jsonb,
      pros JSONB NOT NULL DEFAULT '[]'::jsonb,
      cons JSONB NOT NULL DEFAULT '[]'::jsonb,
      features JSONB NOT NULL DEFAULT '[]'::jsonb,
      verdict TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      created_at DATE NOT NULL,
      updated_at DATE NOT NULL
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS posts_updated_at_idx ON posts (updated_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS posts_category_idx ON posts (category)`;

  const countRows = (await sql`SELECT COUNT(*)::int AS count FROM posts`) as CountRow[];

  if (Number(countRows[0]?.count || 0) === 0) {
    await importBundledMdxPosts();
  }

  initialized = true;
}

export async function ensurePostsDatabase() {
  if (!initializationPromise) {
    initializationPromise = initializeDatabase();
  }

  await initializationPromise;
}

export async function getPostRecords() {
  await ensurePostsDatabase();
  const sql = getSql();

  return (await sql`
    SELECT
      slug,
      name,
      tagline,
      category,
      website,
      price,
      rating,
      summary,
      best_for,
      pros,
      cons,
      features,
      verdict,
      content,
      created_at::text,
      updated_at::text
    FROM posts
    ORDER BY updated_at DESC, slug DESC
  `) as PostRecord[];
}

export async function getPostRecordBySlug(slug: string) {
  await ensurePostsDatabase();
  const sql = getSql();

  const rows = (await sql`
    SELECT
      slug,
      name,
      tagline,
      category,
      website,
      price,
      rating,
      summary,
      best_for,
      pros,
      cons,
      features,
      verdict,
      content,
      created_at::text,
      updated_at::text
    FROM posts
    WHERE slug = ${slug}
    LIMIT 1
  `) as PostRecord[];

  return rows[0] ?? null;
}

export async function getPostCountBySlug(slug: string) {
  await ensurePostsDatabase();
  const sql = getSql();
  const rows = (await sql`SELECT COUNT(*)::int AS count FROM posts WHERE slug = ${slug}`) as CountRow[];
  return Number(rows[0]?.count || 0);
}

export async function insertPost(review: ToolReview) {
  await ensurePostsDatabase();
  await upsertPost(review);
}

export async function deletePost(slug: string) {
  await ensurePostsDatabase();
  const sql = getSql();
  const rows = (await sql`DELETE FROM posts WHERE slug = ${slug} RETURNING slug`) as Array<{ slug: string }>;
  return rows.length;
}

export function toReviewMeta(record: PostRecord): ToolReviewMeta {
  const { content, ...review } = mapRecordToReview(record);
  void content;
  return review;
}

export function toReview(record: PostRecord) {
  return mapRecordToReview(record);
}

export function getDatabaseStorageStatus() {
  const configured = process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();

  return {
    mode: "database" as const,
    target: configured ? "Neon Postgres" : "DATABASE_URL not configured"
  };
}
