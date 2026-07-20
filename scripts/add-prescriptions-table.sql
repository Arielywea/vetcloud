-- Prescriptions table for veterinary prescription forms (exipiente de receta)
-- Run on both local PostgreSQL and Neon

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinical_record_id UUID REFERENCES clinical_records(id) ON DELETE SET NULL,
  veterinarian_name VARCHAR(255),
  clinic_branch VARCHAR(255) DEFAULT 'Casa Matriz',
  prescription_body TEXT NOT NULL,
  format VARCHAR(50) DEFAULT 'standard',
  status VARCHAR(20) DEFAULT 'active',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_pet ON prescriptions(pet_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user ON prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_clinical_record ON prescriptions(clinical_record_id);
