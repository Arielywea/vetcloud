-- 021: lifecycle, other species, alerts, registry number and a single source for weight.

-- Lifecycle: pets.status already exists ('alive'); add the other states and when a pet died.
-- Reminders and campaigns only go to 'alive' pets.
ALTER TABLE pets ADD COLUMN IF NOT EXISTS deceased_at TIMESTAMPTZ;
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_status_check;
UPDATE pets SET status = 'alive' WHERE status IS NULL OR status NOT IN ('alive', 'deceased', 'transferred', 'inactive');
ALTER TABLE pets ADD CONSTRAINT pets_status_check CHECK (status IN ('alive', 'deceased', 'transferred', 'inactive'));

-- Rabbits, ferrets, birds…: species 'other' with a free-text name
ALTER TABLE pets ADD COLUMN IF NOT EXISTS species_other VARCHAR(80);
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_species_check;
ALTER TABLE pets ADD CONSTRAINT pets_species_check CHECK (species IN ('dog', 'cat', 'other'));

ALTER TABLE pets ADD COLUMN IF NOT EXISTS registry_number VARCHAR(60);        -- Registro Nacional de Mascotas (Ley 21.020)
ALTER TABLE pets ADD COLUMN IF NOT EXISTS birth_date_estimated BOOLEAN DEFAULT false;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS alerts JSONB DEFAULT '[]'::jsonb;   -- [{type, text, since}]

-- Weight: the visit is the only source; pets.current_weight_kg is a cache the server refreshes on save
ALTER TABLE clinical_records ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(6,2);
ALTER TABLE clinical_records ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;
ALTER TABLE clinical_records ADD COLUMN IF NOT EXISTS is_initial BOOLEAN DEFAULT false;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS current_weight_kg NUMERIC(6,2);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS current_weight_at TIMESTAMPTZ;

UPDATE clinical_records
SET weight_kg = (details->>'weight')::numeric
WHERE weight_kg IS NULL AND details->>'weight' ~ '^[0-9]+([.][0-9]+)?$'
  AND (details->>'weight')::numeric BETWEEN 0.05 AND 150;

-- Latest known weight per pet: last visit with weight, else the old vital measurement, else pets.weight
UPDATE pets p SET current_weight_kg = w.kg, current_weight_at = w.at
FROM (
  SELECT DISTINCT ON (pet_id) pet_id, kg, at FROM (
    SELECT pet_id, weight_kg AS kg, date AS at FROM clinical_records WHERE weight_kg IS NOT NULL
    UNION ALL
    SELECT pet_id, weight AS kg, recorded_at AS at FROM vital_measurements WHERE weight > 0
  ) s ORDER BY pet_id, at DESC
) w
WHERE w.pet_id = p.id AND p.current_weight_kg IS NULL;
UPDATE pets SET current_weight_kg = weight, current_weight_at = updated_at
WHERE current_weight_kg IS NULL AND weight > 0;

CREATE INDEX IF NOT EXISTS idx_pets_user_status ON pets(user_id, status);
