-- 032: registro de aceptación de Términos y Política de privacidad (Ley 21.719).
-- Una fila por documento aceptado: quién, cuál, qué versión del texto, cuándo y desde qué IP.
-- Si el texto cambia (LEGAL_VERSION en server.js) las cuentas existentes quedan con la versión vieja
-- y se les puede pedir aceptar de nuevo; el historial no se borra.
CREATE TABLE IF NOT EXISTS legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document VARCHAR(20) NOT NULL CHECK (document IN ('terminos', 'privacidad')),
  version VARCHAR(20) NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_legal_acceptances_user ON legal_acceptances (user_id, document);
