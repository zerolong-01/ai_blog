import { getDatabaseSql } from "@/lib/database";
import { siteConfig } from "@/lib/site";
import { ToolCategory, ToolReview, ToolReviewMeta } from "@/lib/types";

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
  author: string;
  content: string;
  series_name: string | null;
  series_order: string | number | null;
  created_at: string;
  updated_at: string;
};

let initialized = false;
let initializationPromise: Promise<void> | null = null;

function toDateOnly(value: string | Date | undefined) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const parsedDate = new Date(trimmedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return parsedDate.toISOString().slice(0, 10);
}

function getSql() {
  return getDatabaseSql();
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

function mapRecordToReview(record: PostRecord): ToolReview {
  const publishedAt = toDateOnly(record.created_at);
  const updatedAt = toDateOnly(record.updated_at);

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
    author: record.author || siteConfig.creator,
    publishedAt,
    updatedAt,
    seriesName: record.series_name || undefined,
    seriesOrder: record.series_order == null ? undefined : Number(record.series_order),
    content: record.content
  };
}

async function upsertPost(review: ToolReview) {
  const sql = getSql();
  const normalizedUpdatedAt = toDateOnly(review.updatedAt);

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
      author,
      content,
      series_name,
      series_order,
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
      ${review.author},
      ${review.content},
      ${review.seriesName || null},
      ${review.seriesOrder ?? null},
      ${toDateOnly(review.publishedAt)}::date,
      ${normalizedUpdatedAt}::date
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
      author = EXCLUDED.author,
      content = EXCLUDED.content,
      series_name = EXCLUDED.series_name,
      series_order = EXCLUDED.series_order,
      updated_at = EXCLUDED.updated_at
  `;
}

async function initializeDatabase() {
  if (initialized) {
    return;
  }

  const sql = getSql();

  await sql`SELECT 1 FROM posts LIMIT 1`;

  initialized = true;
}

export async function ensurePostsDatabase() {
  if (!initializationPromise) {
    initializationPromise = initializeDatabase();
  }

  try {
    await initializationPromise;
  } catch (error) {
    initializationPromise = null;
    throw error;
  }
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
      author,
      content,
      series_name,
      series_order,
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
      author,
      content,
      series_name,
      series_order,
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
