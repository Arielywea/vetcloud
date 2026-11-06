-- 031: recuperación de contraseña por correo y limpieza de users.smtp_password.
-- password_resets guarda solo el hash (sha256) del token que viaja en el enlace; el token vale 1 hora
--   y un solo uso (used_at). Al pedir uno nuevo se invalidan los anteriores del mismo usuario.
-- users.smtp_password nunca se usó (el servidor envía con SMTP_EMAIL/SMTP_PASSWORD del entorno) y estaba
--   vacía en todas las cuentas: se elimina para no guardar nunca una clave de correo en la base.
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets (user_id);

ALTER TABLE users DROP COLUMN IF EXISTS smtp_password;
