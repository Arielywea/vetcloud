-- Migration 002: Auth overhaul — add username + email columns
-- Run: psql $DATABASE_URL -f scripts/migrations/002_auth_overhaul.sql

-- Add username column (unique, nullable for existing users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Add email column (unique, nullable for existing users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- Migrate existing users: assign username from name (lowercase, no spaces)
-- and email from a placeholder that they'll need to update
UPDATE users SET username = LOWER(REPLACE(name, ' ', '.')) WHERE username IS NULL;

-- Make username NOT NULL after migration
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- Index for fast lookups during login
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
