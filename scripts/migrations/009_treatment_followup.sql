-- Migration 009: Add treatment column + follow_up_of for controles
-- Run: node scripts/run-migrations.js

-- Treatment column on clinical_records
ALTER TABLE clinical_records ADD COLUMN IF NOT EXISTS treatment TEXT;

-- Follow-up link on appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS follow_up_of UUID REFERENCES appointments(id);
