-- Migration 005: Vital measurements table
-- Run: node scripts/run-migrations.js

CREATE TABLE IF NOT EXISTS vital_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id INTEGER REFERENCES organizations(id),
  weight NUMERIC(5,2),
  temperature NUMERIC(4,1),
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  blood_pressure VARCHAR(20),
  spo2 INTEGER,
  mucous_membranes VARCHAR(100),
  hydration VARCHAR(100),
  body_condition VARCHAR(100),
  notes TEXT,
  recorded_at TIMESTAMP DEFAULT now(),
  recorded_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_vital_measurements_pet ON vital_measurements(pet_id);
CREATE INDEX IF NOT EXISTS idx_vital_measurements_org ON vital_measurements(organization_id);
CREATE INDEX IF NOT EXISTS idx_vital_measurements_date ON vital_measurements(recorded_at DESC);
