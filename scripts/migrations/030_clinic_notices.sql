-- 030: bandeja de avisos internos de la clínica y reglas que la llenan (automatizaciones).
-- clinic_notices: un aviso por situación. Los derivados (stock bajo, vacunas vencidas) se crean y se
--   quitan solos según los datos; el checklist de alta nace al dar de alta una hospitalización.
-- dedupe_key evita duplicados: 'stock:<id>', 'vaccine:<pet_id>', 'discharge:<hospitalization_id>'.
-- automation_rules: solo guarda lo que el usuario apagó o encendió; el catálogo vive en server.js
--   y una regla sin fila está activa.
CREATE TABLE IF NOT EXISTS clinic_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
  kind VARCHAR(40) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  link VARCHAR(200),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  dedupe_key VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'dismissed')),
  checklist JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  UNIQUE (user_id, dedupe_key)
);
CREATE INDEX IF NOT EXISTS idx_clinic_notices_user_status ON clinic_notices(user_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rule_key VARCHAR(40) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, rule_key)
);
