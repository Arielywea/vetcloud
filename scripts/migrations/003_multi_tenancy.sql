-- Migration 003: Multi-tenancy — organizations table + organization_id
-- Run: psql $DATABASE_URL -f scripts/migrations/003_multi_tenancy.sql

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  org_type VARCHAR(20) NOT NULL CHECK (org_type IN ('solo', 'clinic')),
  created_at TIMESTAMP DEFAULT now()
);

-- Add organization_id to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);

-- Add organization_id to data tables
ALTER TABLE pets ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE clinical_records ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE hospitalizations ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE lab_exams ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE personal_notes ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);

-- Diseases: nullable organization_id (null = global, has value = org-specific)
ALTER TABLE diseases ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);

-- Role column for future use (all existing users are 'owner')
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'owner'
  CHECK (role IN ('owner', 'vet', 'assistant'));

-- Migrate existing data: create 1 org per user, backfill organization_id
DO $$
DECLARE
  r RECORD;
  new_org_id INTEGER;
BEGIN
  FOR r IN SELECT DISTINCT user_id FROM pets
  LOOP
    -- Create organization for this user
    INSERT INTO organizations (name, org_type)
    VALUES ('Organizacion de ' || (SELECT name FROM users WHERE id = r.user_id), 'solo')
    RETURNING id INTO new_org_id;

    -- Link user to org
    UPDATE users SET organization_id = new_org_id WHERE id = r.user_id;

    -- Link all their data
    UPDATE pets SET organization_id = new_org_id WHERE user_id = r.user_id;
    UPDATE appointments SET organization_id = new_org_id WHERE user_id = r.user_id;
    UPDATE clinical_records SET organization_id = new_org_id WHERE user_id = r.user_id;
    UPDATE prescriptions SET organization_id = new_org_id WHERE user_id = r.user_id;
    UPDATE inventory SET organization_id = new_org_id WHERE user_id = r.user_id;
    UPDATE reminders SET organization_id = new_org_id WHERE user_id = r.user_id;
    UPDATE hospitalizations SET organization_id = new_org_id WHERE user_id = r.user_id;
    UPDATE lab_exams SET organization_id = new_org_id WHERE user_id = r.user_id;
    UPDATE personal_notes SET organization_id = new_org_id WHERE user_id = r.user_id;
    UPDATE favorites SET organization_id = new_org_id WHERE user_id = r.user_id;
  END LOOP;
END $$;

-- Indexes for org filtering
CREATE INDEX IF NOT EXISTS idx_pets_org ON pets(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_org ON appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_clinical_records_org ON clinical_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_org ON prescriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_org ON inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_reminders_org ON reminders(organization_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_org ON hospitalizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_lab_exams_org ON lab_exams(organization_id);
CREATE INDEX IF NOT EXISTS idx_diseases_org ON diseases(organization_id);
