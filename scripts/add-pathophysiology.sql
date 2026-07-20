-- Add pathophysiology field to diseases table
-- VetCloud - Pathophysiology migration

ALTER TABLE diseases ADD COLUMN IF NOT EXISTS pathophysiology TEXT;
