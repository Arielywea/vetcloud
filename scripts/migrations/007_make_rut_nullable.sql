-- Migration 007: Make rut nullable for email/username registration
-- Run: node scripts/run-migrations.js

ALTER TABLE users ALTER COLUMN rut DROP NOT NULL;
