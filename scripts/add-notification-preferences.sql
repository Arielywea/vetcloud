ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_email_reminders BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_upcoming_appointments BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_push BOOLEAN DEFAULT false;
