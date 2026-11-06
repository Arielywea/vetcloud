-- 025: origin of the patient and retroviral test, asked once in the remote anamnesis of the first visit.
ALTER TABLE pets ADD COLUMN IF NOT EXISTS procedencia      VARCHAR(30);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS procedencia_edad VARCHAR(40);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS retroviral_test  TEXT;
