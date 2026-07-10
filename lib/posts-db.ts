import { mkdirSync, existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import matter from "gray-matter";

import { ToolCategory, ToolReview, ToolReviewMeta } from "@/lib/types";

type ReviewFrontmatter = Omit<ToolReviewMeta, "rating"> & {
  title?: string;
  rating: number | string;
};

type PostRecord = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  website: string;
  price: string;
  rating: number;
  summary: string;
  best_for: string;
  pros: string;
  cons: string;
  features: string;
  verdict: string;
  content: string;
  created_at: string;
  updated_at: string;
};

let database: DatabaseSync | null = null;
let initialized = false;

function getDatabasePath() {
  const configuredPath = process.env.BLOG_DB_PATH?.trim();

  if (!configuredPath) {
    return path.join(process.cwd(), "data", "blog.sqlite");
  }

  return path.isAbsolute(configuredPath) ? configuredPath : path.join(process.cwd(), configuredPath);
}

function ensureDatabaseDirectory() {
  mkdirSync(path.dirname(getDatabasePath()), { recursive: true });
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

function parseJsonList(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String).map((item) => item.trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
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
    bestFor: parseJsonList(record.best_for),
    pros: parseJsonList(record.pros),
    cons: parseJsonList(record.cons),
    features: parseJsonList(record.features),
    verdict: record.verdict,
    updatedAt: record.updated_at,
    content: record.content
  };
}

async function importBundledMdxPosts(db: DatabaseSync) {
  const directory = getBundledReviewsDirectory();

  if (!existsSync(directory)) {
    return;
  }

  const filenames = (await readdir(directory)).filter((filename) => filename.endsWith(".mdx"));

  if (filenames.length === 0) {
    return;
  }

  const insertPost = db.prepare(`
    INSERT OR IGNORE INTO posts (
      slug, name, tagline, category, website, price, rating, summary,
      best_for, pros, cons, features, verdict, content, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  for (const filename of filenames) {
    const source = await readFile(path.join(directory, filename), "utf8");
    const { data, content } = matter(source);
    const review = toToolReview(filename.replace(/\.mdx$/, ""), data as ReviewFrontmatter, content.trim());
    const timestamp = review.updatedAt || new Date().toISOString().slice(0, 10);

    insertPost.run(
      review.slug,
      review.name,
      review.tagline,
      review.category,
      review.website,
      review.price,
      review.rating,
      review.summary,
      JSON.stringify(review.bestFor),
      JSON.stringify(review.pros),
      JSON.stringify(review.cons),
      JSON.stringify(review.features),
      review.verdict,
      review.content,
      timestamp,
      timestamp
    );
  }
}

async function initializeDatabase() {
  if (initialized) {
    return;
  }

  const db = getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'general',
      website TEXT NOT NULL DEFAULT '',
      price TEXT NOT NULL DEFAULT '',
      rating REAL NOT NULL DEFAULT 0,
      summary TEXT NOT NULL DEFAULT '',
      best_for TEXT NOT NULL DEFAULT '[]',
      pros TEXT NOT NULL DEFAULT '[]',
      cons TEXT NOT NULL DEFAULT '[]',
      features TEXT NOT NULL DEFAULT '[]',
      verdict TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS posts_updated_at_idx ON posts(updated_at DESC);
    CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);
  `);

  const countRow = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };

  if (countRow.count === 0) {
    await importBundledMdxPosts(db);
  }

  initialized = true;
}

export function getDatabase() {
  if (!database) {
    ensureDatabaseDirectory();
    database = new DatabaseSync(getDatabasePath());
    database.exec("PRAGMA journal_mode = WAL;");
  }

  return database;
}

export async function ensurePostsDatabase() {
  await initializeDatabase();
}

export async function getPostRecords() {
  await ensurePostsDatabase();
  const db = getDatabase();

  return db
    .prepare("SELECT * FROM posts ORDER BY datetime(updated_at) DESC, rowid DESC")
    .all() as PostRecord[];
}

export async function getPostRecordBySlug(slug: string) {
  await ensurePostsDatabase();
  const db = getDatabase();

  return (db.prepare("SELECT * FROM posts WHERE slug = ?").get(slug) as PostRecord | undefined) ?? null;
}

export async function getPostCountBySlug(slug: string) {
  await ensurePostsDatabase();
  const db = getDatabase();
  const row = db.prepare("SELECT COUNT(*) as count FROM posts WHERE slug = ?").get(slug) as { count: number };
  return row.count;
}

export async function insertPost(review: ToolReview) {
  await ensurePostsDatabase();
  const db = getDatabase();

  db.prepare(`
    INSERT INTO posts (
      slug, name, tagline, category, website, price, rating, summary,
      best_for, pros, cons, features, verdict, content, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?
    )
  `).run(
    review.slug,
    review.name,
    review.tagline,
    review.category,
    review.website,
    review.price,
    review.rating,
    review.summary,
    JSON.stringify(review.bestFor),
    JSON.stringify(review.pros),
    JSON.stringify(review.cons),
    JSON.stringify(review.features),
    review.verdict,
    review.content,
    review.updatedAt,
    review.updatedAt
  );
}

export async function deletePost(slug: string) {
  await ensurePostsDatabase();
  const db = getDatabase();
  const result = db.prepare("DELETE FROM posts WHERE slug = ?").run(slug);
  return result.changes;
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
  return {
    mode: "database" as const,
    target: getDatabasePath()
  };
}
