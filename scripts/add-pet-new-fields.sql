-- Add new columns to pets for full clinical form
-- Run on both local PostgreSQL and Neon

-- Identificación
ALTER TABLE pets ADD COLUMN IF NOT EXISTS id_number VARCHAR(50);

-- Sexo
ALTER TABLE pets ADD COLUMN IF NOT EXISTS sex VARCHAR(20);

-- Temperamento (checkboxes: Dócil, Inquieto, Agresivo, Nervioso)
ALTER TABLE pets ADD COLUMN IF NOT EXISTS temperament JSONB DEFAULT '[]'::jsonb;

-- Hábitat
ALTER TABLE pets ADD COLUMN IF NOT EXISTS habitat VARCHAR(50);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS habitat_other TEXT;

-- Alimentación
ALTER TABLE pets ADD COLUMN IF NOT EXISTS food TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS food_frequency VARCHAR(100);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS water_consumption VARCHAR(100);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS urination VARCHAR(100);

-- Convivencia
ALTER TABLE pets ADD COLUMN IF NOT EXISTS lives_with_other_animals TEXT;

-- Antecedentes médicos
ALTER TABLE pets ADD COLUMN IF NOT EXISTS vaccines TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS deworming TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS flea_treatment TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS last_heat TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS surgeries TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS other_diseases TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS medications TEXT;
