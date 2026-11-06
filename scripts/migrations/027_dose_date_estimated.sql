-- 027: a dose declared by the tutor may have an estimated date (month/year or "about 6 months ago").
ALTER TABLE vaccinations ADD COLUMN IF NOT EXISTS date_estimated BOOLEAN NOT NULL DEFAULT false;
