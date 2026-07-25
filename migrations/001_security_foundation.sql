CREATE TABLE IF NOT EXISTS posts (
  slug TEXT PRIMARY KEY, name TEXT NOT NULL, tagline TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general', website TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '', rating DOUBLE PRECISION NOT NULL DEFAULT 0,
  summary TEXT NOT NULL DEFAULT '', best_for JSONB NOT NULL DEFAULT '[]'::jsonb,
  pros JSONB NOT NULL DEFAULT '[]'::jsonb, cons JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb, verdict TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'Stacked AI', content TEXT NOT NULL,
  created_at DATE NOT NULL, updated_at DATE NOT NULL
);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT 'Stacked AI';
CREATE INDEX IF NOT EXISTS posts_updated_at_idx ON posts (updated_at DESC);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts (category);
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  client_key TEXT PRIMARY KEY, failures INTEGER NOT NULL, window_started_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_login_attempts_started_idx ON admin_login_attempts (window_started_at);
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL, expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON admin_sessions (expires_at);
CREATE TABLE IF NOT EXISTS admin_audit_events (
  id BIGSERIAL PRIMARY KEY, event TEXT NOT NULL, client_key TEXT,
  target TEXT, outcome TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS admin_audit_created_idx ON admin_audit_events (created_at DESC);
