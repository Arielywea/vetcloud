ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(20) DEFAULT 'light';
UPDATE users SET theme_preference = 'dark' WHERE rut = 'RUT_REDACTED_A';
UPDATE users SET theme_preference = 'light' WHERE rut = 'RUT_REDACTED_B';
