ALTER TABLE medications ADD COLUMN IF NOT EXISTS dosis_min_mg_kg NUMERIC;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS dosis_max_mg_kg NUMERIC;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS concentracion_mg_ml NUMERIC;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS frecuencia_horas INTEGER;
