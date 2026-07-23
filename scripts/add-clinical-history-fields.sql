-- Add clinical history reorganization fields to pets
ALTER TABLE pets ADD COLUMN IF NOT EXISTS motivo_consulta TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS entorno TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS areneros TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS vital_signs JSONB;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS hallazgos_examen_fisico TEXT;
