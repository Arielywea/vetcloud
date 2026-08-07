-- Migration 008: Add pre_diagnostico and base_diseases columns to pets
-- Run: node scripts/run-migrations.js

ALTER TABLE pets ADD COLUMN IF NOT EXISTS pre_diagnostico TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS base_diseases JSONB DEFAULT '[]'::jsonb;
