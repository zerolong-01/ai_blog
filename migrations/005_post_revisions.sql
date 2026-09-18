CREATE TABLE IF NOT EXISTS post_revisions (
  id BIGSERIAL PRIMARY KEY,
  post_slug TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('update', 'delete')),
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS post_revisions_slug_created_idx ON post_revisions (post_slug, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS post_revisions_created_idx ON post_revisions (created_at DESC, id DESC);
