import { randomUUID } from "node:crypto";

import { getDatabaseSql } from "@/lib/database";

type DraftStatus = "generating" | "ready" | "failed" | "published";

export type DraftSource = {
  title: string;
  url: string;
  publisher: string;
};

export type NewsDraft = {
  id: string;
  status: DraftStatus;
  sourceUrl: string;
  sourceTitle: string;
  sourcePublisher: string;
  sourcePublishedAt?: string;
  supportingSources: DraftSource[];
  generatedTitle: string;
  generatedSummary: string;
  generatedContent: string;
  warnings: string[];
  model: string;
  suggestedSeriesName?: string;
  suggestedSeriesOrder?: number;
  isNewSeries?: boolean;
  errorMessage?: string;
  publishedPostSlug?: string;
};

type DraftRecord = {
  id: string;
  status: DraftStatus;
  source_url: string;
  source_title: string;
  source_publisher: string;
  source_published_at: string | null;
  supporting_sources: unknown;
  generated_title: string;
  generated_summary: string;
  generated_content: string;
  warnings: unknown;
  model: string;
  suggested_series_name: string | null;
  suggested_series_order: string | number | null;
  error_message: string | null;
  published_post_slug: string | null;
};

let schemaPromise: Promise<void> | null = null;

async function initializeNewsDraftSchema() {
  const sql = getDatabaseSql();
  try {
    await sql`SELECT suggested_series_name, suggested_series_order FROM ai_article_drafts LIMIT 0`;
    return;
  } catch {
    // The migration may not have run yet. Attempt the idempotent bootstrap below.
  }
  await sql`
    CREATE TABLE IF NOT EXISTS ai_article_drafts (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK (status IN ('generating', 'ready', 'failed', 'published')),
      source_url TEXT NOT NULL,
      source_title TEXT NOT NULL DEFAULT '',
      source_publisher TEXT NOT NULL DEFAULT '',
      source_published_at TIMESTAMPTZ,
      source_text TEXT NOT NULL DEFAULT '',
      supporting_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
      generated_title TEXT NOT NULL DEFAULT '',
      generated_summary TEXT NOT NULL DEFAULT '',
      generated_content TEXT NOT NULL DEFAULT '',
      warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
      model TEXT NOT NULL DEFAULT '',
      response_id TEXT,
      input_tokens INTEGER,
      output_tokens INTEGER,
      error_message TEXT,
      published_post_slug TEXT REFERENCES posts(slug) ON DELETE SET NULL,
      suggested_series_name TEXT,
      suggested_series_order INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE ai_article_drafts ADD COLUMN IF NOT EXISTS suggested_series_name TEXT`;
  await sql`ALTER TABLE ai_article_drafts ADD COLUMN IF NOT EXISTS suggested_series_order INTEGER`;
  await sql`CREATE INDEX IF NOT EXISTS ai_article_drafts_status_created_idx ON ai_article_drafts (status, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS ai_article_drafts_source_url_idx ON ai_article_drafts (source_url, created_at DESC)`;
  await sql`SELECT suggested_series_name, suggested_series_order FROM ai_article_drafts LIMIT 0`;
}

async function ensureNewsDraftsDatabase() {
  if (!schemaPromise) schemaPromise = initializeNewsDraftSchema();
  try {
    await schemaPromise;
  } catch (error) {
    schemaPromise = null;
    throw error;
  }
}

function list<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function mapDraft(row: DraftRecord): NewsDraft {
  return {
    id: row.id,
    status: row.status,
    sourceUrl: row.source_url,
    sourceTitle: row.source_title,
    sourcePublisher: row.source_publisher,
    sourcePublishedAt: row.source_published_at || undefined,
    supportingSources: list<DraftSource>(row.supporting_sources),
    generatedTitle: row.generated_title,
    generatedSummary: row.generated_summary,
    generatedContent: row.generated_content,
    warnings: list<string>(row.warnings),
    model: row.model,
    suggestedSeriesName: row.suggested_series_name || undefined,
    suggestedSeriesOrder: row.suggested_series_order == null ? undefined : Number(row.suggested_series_order),
    errorMessage: row.error_message || undefined,
    publishedPostSlug: row.published_post_slug || undefined
  };
}

export async function findReusableDraft(sourceUrl: string) {
  await ensureNewsDraftsDatabase();
  const sql = getDatabaseSql();
  const rows = (await sql`
    SELECT id, status, source_url, source_title, source_publisher,
      source_published_at::text, supporting_sources, generated_title,
      generated_summary, generated_content, warnings, model, suggested_series_name, suggested_series_order,
      error_message, published_post_slug
    FROM ai_article_drafts
    WHERE source_url = ${sourceUrl} AND status IN ('generating', 'ready')
    ORDER BY created_at DESC LIMIT 1
  `) as DraftRecord[];
  return rows[0] ? mapDraft(rows[0]) : undefined;
}

export async function createGeneratingDraft(sourceUrl: string) {
  await ensureNewsDraftsDatabase();
  const id = randomUUID();
  const sql = getDatabaseSql();
  await sql`INSERT INTO ai_article_drafts (id, status, source_url) VALUES (${id}, 'generating', ${sourceUrl})`;
  return id;
}

export async function saveReadyDraft(
  id: string,
  source: { title: string; publisher: string; publishedAt?: string; text: string },
  generated: {
    title: string;
    summary: string;
    markdown: string;
    sources: DraftSource[];
    warnings: string[];
    model: string;
    responseId: string;
    inputTokens?: number;
    outputTokens?: number;
    seriesName: string;
    seriesOrder: number;
    isNewSeries: boolean;
  }
) {
  await ensureNewsDraftsDatabase();
  const sql = getDatabaseSql();
  await sql`
    UPDATE ai_article_drafts SET
      status = 'ready', source_title = ${source.title}, source_publisher = ${source.publisher},
      source_published_at = ${source.publishedAt || null}::timestamptz, source_text = ${source.text},
      supporting_sources = ${JSON.stringify(generated.sources)}::jsonb,
      generated_title = ${generated.title}, generated_summary = ${generated.summary},
      generated_content = ${generated.markdown}, warnings = ${JSON.stringify(generated.warnings)}::jsonb,
      model = ${generated.model}, response_id = ${generated.responseId},
      suggested_series_name = ${generated.seriesName}, suggested_series_order = ${generated.seriesOrder},
      input_tokens = ${generated.inputTokens ?? null}, output_tokens = ${generated.outputTokens ?? null},
      error_message = NULL, updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function saveFailedDraft(id: string, message: string) {
  await ensureNewsDraftsDatabase();
  const sql = getDatabaseSql();
  await sql`
    UPDATE ai_article_drafts SET status = 'failed', error_message = ${message.slice(0, 500)}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function getNewsDraft(id: string) {
  await ensureNewsDraftsDatabase();
  const sql = getDatabaseSql();
  const rows = (await sql`
    SELECT id, status, source_url, source_title, source_publisher,
      source_published_at::text, supporting_sources, generated_title,
      generated_summary, generated_content, warnings, model, suggested_series_name, suggested_series_order,
      error_message, published_post_slug
    FROM ai_article_drafts WHERE id = ${id} LIMIT 1
  `) as DraftRecord[];
  return rows[0] ? mapDraft(rows[0]) : undefined;
}

export async function markDraftPublished(id: string, slug: string) {
  await ensureNewsDraftsDatabase();
  const sql = getDatabaseSql();
  await sql`
    UPDATE ai_article_drafts SET status = 'published', published_post_slug = ${slug}, updated_at = NOW()
    WHERE id = ${id} AND status = 'ready'
  `;
}
