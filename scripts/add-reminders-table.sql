-- Add receive_reminders column to pets
ALTER TABLE pets ADD COLUMN IF NOT EXISTS receive_reminders BOOLEAN DEFAULT true;

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  tutor_email VARCHAR(255) NOT NULL,
  reminder_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending',
  related_record_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(scheduled_for);
