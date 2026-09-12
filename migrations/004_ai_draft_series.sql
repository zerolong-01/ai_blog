ALTER TABLE ai_article_drafts
  ADD COLUMN IF NOT EXISTS suggested_series_name TEXT,
  ADD COLUMN IF NOT EXISTS suggested_series_order INTEGER;

ALTER TABLE ai_article_drafts
  DROP CONSTRAINT IF EXISTS ai_article_drafts_series_fields_check;

ALTER TABLE ai_article_drafts
  ADD CONSTRAINT ai_article_drafts_series_fields_check CHECK (
    (suggested_series_name IS NULL AND suggested_series_order IS NULL)
    OR (
      length(btrim(suggested_series_name)) BETWEEN 1 AND 120
      AND suggested_series_order BETWEEN 1 AND 9999
    )
  );
