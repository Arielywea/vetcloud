-- Columns the app already reads/writes on pets but that were never applied in production
-- (originally in scripts/add-clinical-history-fields.sql and scripts/add-pet-last-visit.sql)
ALTER TABLE pets ADD COLUMN IF NOT EXISTS motivo_consulta TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS entorno TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS areneros TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS vital_signs JSONB;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS hallazgos_examen_fisico TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS last_visit TIMESTAMPTZ NULL;

UPDATE pets SET last_visit = (
  SELECT MAX(date) FROM clinical_records WHERE pet_id = pets.id
) WHERE last_visit IS NULL;

CREATE INDEX IF NOT EXISTS idx_pets_last_visit ON pets(last_visit);

-- Shared rate-limit counters (in-memory Map does not work across Vercel serverless instances)
CREATE TABLE IF NOT EXISTS rate_limits (
  key VARCHAR(255) PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL
);
