-- VetCloud Database Schema for Directus + PostgreSQL
-- Run this after Directus is initialized to create the collections

-- ─────────────────────────────────────────────────────────
-- Table: diseases
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  scientific_name VARCHAR(255),
  species VARCHAR(10) NOT NULL CHECK (species IN ('dog', 'cat', 'both')),
  category VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
  description TEXT NOT NULL,
  key_signs JSONB DEFAULT '[]'::jsonb,
  diagnosis JSONB DEFAULT '{}'::jsonb,
  treatment JSONB DEFAULT '{}'::jsonb,
  prevention JSONB DEFAULT '[]'::jsonb,
  prognosis VARCHAR(20) DEFAULT 'good',
  is_zoonotic BOOLEAN DEFAULT false,
  references_list JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- Table: pets
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  species VARCHAR(10) NOT NULL CHECK (species IN ('dog', 'cat')),
  breed VARCHAR(255),
  birth_date DATE,
  weight DECIMAL(5,2),
  color VARCHAR(255),
  photo VARCHAR(255),
  allergies JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- Table: medical_records
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  disease_id UUID REFERENCES diseases(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  veterinarian VARCHAR(255),
  symptoms JSONB DEFAULT '[]'::jsonb,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- Table: personal_notes
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS personal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  disease_id UUID REFERENCES diseases(id) ON DELETE SET NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- Table: favorites
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id UUID REFERENCES diseases(id) ON DELETE CASCADE,
  category VARCHAR(50) DEFAULT 'frequently_used',
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_diseases_species ON diseases(species);
CREATE INDEX IF NOT EXISTS idx_diseases_category ON diseases(category);
CREATE INDEX IF NOT EXISTS idx_diseases_severity ON diseases(severity);
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
CREATE INDEX IF NOT EXISTS idx_medical_records_pet ON medical_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_disease ON medical_records(disease_id);
CREATE INDEX IF NOT EXISTS idx_favorites_disease ON favorites(disease_id);

-- ─────────────────────────────────────────────────────────
-- GIN indexes for JSONB
-- ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_diseases_key_signs ON diseases USING GIN (key_signs);
CREATE INDEX IF NOT EXISTS idx_diseases_prevention ON diseases USING GIN (prevention);
