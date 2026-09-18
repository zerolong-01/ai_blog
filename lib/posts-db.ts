import { POSTS_PER_PAGE, postPageCount } from "@/lib/post-pagination";
import { getDatabaseSql } from "@/lib/database";
import { siteConfig } from "@/lib/site";
import { ToolCategory, ToolReview, ToolReviewMeta } from "@/lib/types";

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
  content?: string;
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
    content: record.content || ""
  };
}

async function createPost(review: ToolReview) {
  const sql = getSql();
  const normalizedUpdatedAt = toDateOnly(review.updatedAt);

  const rows = await sql`
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
    ON CONFLICT (slug) DO NOTHING
    RETURNING slug
  `;
  return rows.length === 1;
}

async function initializeDatabase() {
  if (initialized) {
    return;
  }

  const sql = getSql();

  await sql`SELECT 1 FROM posts LIMIT 1`;

  initialized = true;
}

async function ensurePostsDatabase() {
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

export async function insertPost(review: ToolReview) {
  await ensurePostsDatabase();
  return createPost(review);
}

export async function updatePost(review: ToolReview) {
  await ensurePostsDatabase();
  const sql = getSql();
  const rows = await sql`
    WITH original AS MATERIALIZED (
      SELECT p.* FROM posts p WHERE slug = ${review.slug} FOR UPDATE
    ), archived AS (
      INSERT INTO post_revisions (post_slug, action, snapshot)
      SELECT slug, 'update', to_jsonb(original) FROM original RETURNING post_slug
    )
    UPDATE posts SET
      name = ${review.name},
      tagline = ${review.tagline},
      category = ${review.category},
      website = ${review.website},
      price = ${review.price},
      rating = ${review.rating},
      summary = ${review.summary},
      best_for = ${JSON.stringify(review.bestFor)}::jsonb,
      pros = ${JSON.stringify(review.pros)}::jsonb,
      cons = ${JSON.stringify(review.cons)}::jsonb,
      features = ${JSON.stringify(review.features)}::jsonb,
      verdict = ${review.verdict},
      content = ${review.content},
      series_name = ${review.seriesName || null},
      series_order = ${review.seriesOrder ?? null},
      updated_at = ${toDateOnly(review.updatedAt)}::date
    FROM archived
    WHERE posts.slug = archived.post_slug
    RETURNING posts.slug
  `;
  if (rows.length !== 1) {
    throw new Error(`Post not found: ${review.slug}`);
  }
}

export async function deletePost(slug: string) {
  await ensurePostsDatabase();
  const sql = getSql();
  const rows = (await sql`
    WITH original AS MATERIALIZED (
      SELECT p.* FROM posts p WHERE slug = ${slug} FOR UPDATE
    ), archived AS (
      INSERT INTO post_revisions (post_slug, action, snapshot)
      SELECT slug, 'delete', to_jsonb(original) FROM original RETURNING post_slug
    )
    DELETE FROM posts USING archived WHERE posts.slug = archived.post_slug RETURNING posts.slug
  `) as Array<{ slug: string }>;
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

export async function getPostRevisions(slug: string | null, page: number) {
  const sql = getSql();
  return await sql`
    SELECT id::text, post_slug, action, snapshot->>'name' AS name, created_at::text
    FROM post_revisions WHERE (${slug}::text IS NULL OR post_slug = ${slug})
    ORDER BY created_at DESC, id DESC LIMIT 21 OFFSET ${(page - 1) * 20}
  ` as Array<{ id: string; post_slug: string; action: string; name: string; created_at: string }>;
}

export async function getPostRevision(id: string) {
  const rows = await getSql()`SELECT id::text, action, snapshot FROM post_revisions WHERE id = ${id}::bigint`;
  if (!rows[0]) return undefined;
  return { id: String(rows[0].id), action: String(rows[0].action), review: toReview(rows[0].snapshot as PostRecord) };
}

export async function restorePostRevision(id: string) {
  const revision = await getPostRevision(id);
  if (!revision) throw new Error("복원할 이력을 찾을 수 없습니다.");
  if (revision.action === "delete") {
    if (!await insertPost(revision.review)) throw new Error("같은 주소의 글이 이미 존재합니다. 현재 글을 덮어쓰지 않았습니다.");
  } else {
    await updatePost({ ...revision.review, updatedAt: new Date().toISOString().slice(0, 10) });
  }
  return revision.review.slug;
}

export async function getPostPage(page: number, query: string) {
  const sql = getSql();
  const counts = await sql`
    SELECT COUNT(*)::int AS total FROM posts
    WHERE ${query} = '' OR strpos(lower(concat_ws(' ', name, tagline, summary, category, best_for::text, features::text)), lower(${query})) > 0
  `;
  const total = Number(counts[0]?.total || 0);
  const pageCount = postPageCount(total);
  const currentPage = Math.min(page, pageCount);
  const posts = await sql`
    SELECT slug, name, tagline, category, website, price, rating, summary,
      best_for, pros, cons, features, verdict, author, series_name, series_order,
      created_at::text, updated_at::text
    FROM posts
    WHERE ${query} = '' OR strpos(lower(concat_ws(' ', name, tagline, summary, category, best_for::text, features::text)), lower(${query})) > 0
    ORDER BY updated_at DESC, slug DESC LIMIT ${POSTS_PER_PAGE} OFFSET ${(currentPage - 1) * POSTS_PER_PAGE}
  `;
  return { posts: (posts as PostRecord[]).map(toReviewMeta), total, page: currentPage, pageCount };
}

export async function checkPostDatabase() {
  const rows = await getSql()`SELECT COUNT(*)::int AS total FROM posts`;
  return Number(rows[0]?.total || 0);
}
