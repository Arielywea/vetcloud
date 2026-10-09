-- Diseases: separate English name from the (Latin) scientific name, and an archive for merged duplicates.
-- Data corrections run after this via scripts/fix-diseases-2026-10.js (idempotent, dry-run by default).

ALTER TABLE diseases ADD COLUMN IF NOT EXISTS english_name VARCHAR(255);

-- Copies of rows removed when merging duplicates, so every merge can be undone by hand.
CREATE TABLE IF NOT EXISTS diseases_archive (
  archive_id SERIAL PRIMARY KEY,
  disease_id UUID NOT NULL,
  merged_into UUID,
  reason TEXT,
  row_data JSONB NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_diseases_archive_disease ON diseases_archive(disease_id);
