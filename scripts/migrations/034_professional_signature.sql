-- 034: datos del profesional y firma/timbre para recetas, certificados y resúmenes de visita.
-- signature_png / stamp_png guardan la imagen como data URL (PNG o JPEG, ya reducida por la app, máx. ~300 KB).
-- Son privadas: no salen en /auth/me ni en ninguna URL pública; solo GET/PUT/DELETE /auth/signature del dueño
-- y el servidor al armar el PDF de esa cuenta. Una firma escaneada no es firma electrónica avanzada.
ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_rut VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_title VARCHAR(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_university VARCHAR(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS signature_png TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stamp_png TEXT;
