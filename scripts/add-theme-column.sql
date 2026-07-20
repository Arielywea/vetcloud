ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(20) DEFAULT 'light';
UPDATE users SET theme_preference = 'dark' WHERE rut = '21293992-7';
UPDATE users SET theme_preference = 'light' WHERE rut = '21392885-6';
