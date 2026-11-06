-- 029: formulario de anamnesis remota que el tutor responde desde un enlace, sin cuenta.
-- El veterinario crea el enlace para un paciente; el tutor responde en /f/<token>; las respuestas quedan
-- aquí hasta que el veterinario las revisa e importa en la consulta (nada se escribe solo en la ficha).
-- answers: mismas claves que el formulario de anamnesis remota de la consulta (ya validadas por el servidor).
CREATE TABLE IF NOT EXISTS anamnesis_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'respondido', 'importado', 'cancelado')),
  answers JSONB,
  expires_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_anamnesis_forms_pet ON anamnesis_forms(pet_id, created_at DESC);
