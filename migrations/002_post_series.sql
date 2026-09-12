ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS series_name TEXT,
  ADD COLUMN IF NOT EXISTS series_order INTEGER;

ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS posts_series_fields_check;

ALTER TABLE posts
  ADD CONSTRAINT posts_series_fields_check CHECK (
    (series_name IS NULL AND series_order IS NULL)
    OR (
      length(btrim(series_name)) BETWEEN 1 AND 120
      AND series_order BETWEEN 1 AND 9999
    )
  );

CREATE INDEX IF NOT EXISTS posts_series_idx
  ON posts (series_name, series_order)
  WHERE series_name IS NOT NULL;
