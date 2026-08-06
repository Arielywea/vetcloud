-- Hospitalizations table for VetCloud
CREATE TABLE IF NOT EXISTS hospitalizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  discharge_date TIMESTAMPTZ,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'internado' CHECK (status IN ('internado', 'cirugia', 'recuperacion', 'discharged')),
  veterinarian VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hospitalizations_user_id ON hospitalizations(user_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_pet_id ON hospitalizations(pet_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_status ON hospitalizations(status);
