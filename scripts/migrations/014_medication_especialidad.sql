ALTER TABLE medications ADD COLUMN IF NOT EXISTS especialidad VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_medications_especialidad ON medications(especialidad);
