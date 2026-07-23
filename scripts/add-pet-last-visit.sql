-- scripts/add-pet-last-visit.sql
-- Adds last_visit timestamp to pets table for tracking patient activity

ALTER TABLE pets ADD COLUMN IF NOT EXISTS last_visit TIMESTAMP NULL;

-- Backfill from existing clinical_records
UPDATE pets SET last_visit = (
  SELECT MAX(date) FROM clinical_records WHERE pet_id = pets.id
);

CREATE INDEX IF NOT EXISTS idx_pets_last_visit ON pets(last_visit);
