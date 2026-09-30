-- 017: separate owner RUT from the pet microchip, make deletes safe, add indexes for hot queries.

-- Owner RUT had no column: the new-patient form wrote it into pets.id_number (the microchip),
-- so whichever was typed last overwrote the other.
ALTER TABLE pets ADD COLUMN IF NOT EXISTS tutor_rut VARCHAR(20);

-- Deleting a pet or appointment that has payments/attachments/follow-ups failed with a FK
-- violation (500). Keep the financial/attachment rows, just unlink them.
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_pet_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_appointment_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;
ALTER TABLE exam_attachments DROP CONSTRAINT IF EXISTS exam_attachments_pet_id_fkey;
ALTER TABLE exam_attachments ADD CONSTRAINT exam_attachments_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL;
ALTER TABLE exam_attachments DROP CONSTRAINT IF EXISTS exam_attachments_clinical_record_id_fkey;
ALTER TABLE exam_attachments ADD CONSTRAINT exam_attachments_clinical_record_id_fkey FOREIGN KEY (clinical_record_id) REFERENCES clinical_records(id) ON DELETE SET NULL;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_follow_up_of_fkey;
ALTER TABLE appointments ADD CONSTRAINT appointments_follow_up_of_fkey FOREIGN KEY (follow_up_of) REFERENCES appointments(id) ON DELETE SET NULL;

-- Indexes matching the queries the app actually runs
CREATE INDEX IF NOT EXISTS idx_appointments_user_start ON appointments(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_clinical_records_pet_date ON clinical_records(pet_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_vital_measurements_user ON vital_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_pet ON reminders(pet_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

-- Housekeeping for the Postgres-backed rate limiter
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset ON rate_limits(reset_at);
