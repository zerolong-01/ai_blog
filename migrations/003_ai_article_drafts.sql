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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_article_drafts_status_created_idx
  ON ai_article_drafts (status, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_article_drafts_source_url_idx
  ON ai_article_drafts (source_url, created_at DESC);
