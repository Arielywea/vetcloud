-- Migration 004: Appointment lifecycle timestamps
-- Run: node scripts/run-migrations.js

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP;

-- Valid status transition map (stored as reference, enforced in backend)
-- pendiente    -> en_espera, cancelado, no_asistio
-- en_espera    -> en_atencion, cancelado
-- en_atencion  -> atendido
-- atendido     -> (final)
-- no_asistio   -> (final)
-- cancelado    -> (final)
