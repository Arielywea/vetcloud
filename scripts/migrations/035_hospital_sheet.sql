-- 035: hoja de tratamientos de hospitalización.
-- hospital_treatments: una fila de la hoja (medicación, fluidos, constante, alimentación o cuidado) con su
--   frecuencia. Los horarios no se guardan: se calculan desde start_at cada frequency_hours
--   (NULL = una sola vez) hasta discontinued_at o el alta. Un tratamiento suspendido se conserva.
-- hospital_tasks: lo que efectivamente pasó en un horario (hecho u omitido), con quién, cuándo y el
--   valor medido si es una constante. Un horario sin fila está pendiente.
CREATE TABLE IF NOT EXISTS hospital_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
  kind VARCHAR(20) NOT NULL DEFAULT 'medicacion' CHECK (kind IN ('medicacion', 'fluidos', 'constante', 'alimentacion', 'cuidado')),
  name VARCHAR(200) NOT NULL,
  instructions TEXT,
  unit VARCHAR(20),
  frequency_hours INTEGER CHECK (frequency_hours IS NULL OR frequency_hours BETWEEN 1 AND 24),
  start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  discontinued_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hospital_treatments_hospitalization ON hospital_treatments(hospitalization_id, sort_order);

CREATE TABLE IF NOT EXISTS hospital_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id UUID NOT NULL REFERENCES hospital_treatments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'done' CHECK (status IN ('done', 'skipped')),
  done_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  done_by VARCHAR(200),
  value VARCHAR(60),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (treatment_id, scheduled_for)
);
CREATE INDEX IF NOT EXISTS idx_hospital_tasks_treatment ON hospital_tasks(treatment_id);
