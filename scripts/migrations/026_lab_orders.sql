-- 026: exam orders. Each ordered exam is a lab_exams row; the rows of one order share order_id,
-- and clinical_record_id links them to the consultation that requested them (if any).
ALTER TABLE lab_exams ADD COLUMN IF NOT EXISTS clinical_record_id UUID REFERENCES clinical_records(id) ON DELETE SET NULL;
ALTER TABLE lab_exams ADD COLUMN IF NOT EXISTS order_id UUID;
CREATE INDEX IF NOT EXISTS idx_lab_exams_order ON lab_exams(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_exams_pet ON lab_exams(pet_id);
