CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  tutor_phone VARCHAR(50),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  appointment_type VARCHAR(50) NOT NULL DEFAULT 'consulta',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start ON appointments(start_time);
