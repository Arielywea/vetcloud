-- Add missing columns to diseases and appointments
-- Diseases: add life_stage column (already in TS type, missing from SQL)
ALTER TABLE diseases ADD COLUMN IF NOT EXISTS life_stage VARCHAR(20) DEFAULT 'all';

-- Appointments: add columns that exist in TS type but missing from SQL
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS veterinarian VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'programada';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pet_id UUID REFERENCES pets(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS room VARCHAR(100);
