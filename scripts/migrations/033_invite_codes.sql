-- 033: códigos de invitación para la alpha cerrada.
-- trial_days y plan se guardan en el código y se aplicarán a la cuenta cuando exista la suscripción
--   (prueba de 30 días y plan Fundador en vez de los 15 días estándar).
-- uses se descuenta de forma atómica al registrarse (server.js, /auth/register); users.invite_code
--   guarda con qué código llegó cada cuenta para medir de dónde vienen los usuarios.
CREATE TABLE IF NOT EXISTS invite_codes (
  code VARCHAR(40) PRIMARY KEY,
  label VARCHAR(120),
  plan VARCHAR(20) NOT NULL DEFAULT 'fundador',
  trial_days INTEGER NOT NULL DEFAULT 30 CHECK (trial_days BETWEEN 1 AND 365),
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_code VARCHAR(40);
