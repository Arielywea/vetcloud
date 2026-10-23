-- 020: vaccines and deworming as records with a date and a next due date, instead of free text in
-- pets.vaccines or a clinical record of type "vacuna". The reminder generator reads next_due_at.
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
  kind VARCHAR(30) NOT NULL DEFAULT 'vacuna'
    CHECK (kind IN ('vacuna', 'desparasitacion_interna', 'desparasitacion_externa')),
  -- Base plan item ('octuple_sextuple', 'kc', 'antirrabica', 'triple_felina', 'leucemia_felina') or 'otra'
  plan_item VARCHAR(40),
  product VARCHAR(200),
  lot VARCHAR(100),
  applied_at DATE NOT NULL,
  next_due_at DATE,
  veterinarian VARCHAR(200),
  clinical_record_id UUID REFERENCES clinical_records(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet ON vaccinations(pet_id, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_vaccinations_due ON vaccinations(user_id, next_due_at);

-- Earlier vaccine visits become vaccination records (the visit stays in the history too)
INSERT INTO vaccinations (pet_id, user_id, organization_id, kind, plan_item, product, applied_at, veterinarian, clinical_record_id, notes)
SELECT cr.pet_id, cr.user_id, cr.organization_id, 'vacuna', 'otra',
       nullif(coalesce(cr.details->>'vaccine', cr.details->>'vacuna', cr.details->>'product'), ''),
       cr.date::date, cr.veterinarian, cr.id,
       nullif(coalesce(cr.details->>'notes', cr.treatment), '')
FROM clinical_records cr
WHERE cr.record_type = 'vacuna'
  AND NOT EXISTS (SELECT 1 FROM vaccinations v WHERE v.clinical_record_id = cr.id);

-- A reminder created from a vaccination goes away with it
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS vaccination_id UUID REFERENCES vaccinations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_reminders_vaccination ON reminders(vaccination_id);
