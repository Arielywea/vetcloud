-- 019: the tutor becomes its own record. Until now every pet carried a copy of its tutor's name, RUT,
-- phone, email and address, so one tutor with three dogs was written three times.
-- pets.tutor_* stay as a read-only copy (kept in sync by the server) until 022 drops them.

-- Canonical forms, used by the server before saving and searching so duplicates can't hide behind formatting.
-- RUT: digits + check digit, no dots, with a dash, K uppercase ("12345678-K").
CREATE OR REPLACE FUNCTION vc_canon_rut(raw TEXT) RETURNS TEXT AS $$
DECLARE clean TEXT;
BEGIN
  clean := upper(regexp_replace(coalesce(raw, ''), '[^0-9kK]', '', 'g'));
  IF length(clean) < 2 THEN RETURN NULL; END IF;
  RETURN substr(clean, 1, length(clean) - 1) || '-' || right(clean, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Phone: E.164 ("+56912345678"); a bare 9-digit Chilean number gets +56
CREATE OR REPLACE FUNCTION vc_canon_phone(raw TEXT) RETURNS TEXT AS $$
DECLARE digits TEXT;
BEGIN
  digits := regexp_replace(coalesce(raw, ''), '[^0-9]', '', 'g');
  IF length(digits) = 0 THEN RETURN NULL; END IF;
  IF length(digits) = 9 THEN RETURN '+56' || digits; END IF;
  IF length(digits) = 8 THEN RETURN '+569' || digits; END IF;
  RETURN '+' || digits;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  rut VARCHAR(12),                       -- required by the API; NULL only for tutors migrated without one
  phone VARCHAR(20),
  email VARCHAR(200),
  address TEXT,
  comuna VARCHAR(100),
  region VARCHAR(100),
  alt_contact_name VARCHAR(200),         -- "otro contacto" instead of co-owners
  alt_contact_phone VARCHAR(20),
  preferred_contact VARCHAR(20) CHECK (preferred_contact IN ('whatsapp', 'telefono', 'correo')),
  consent_communications_at TIMESTAMPTZ,
  contact_revoked_at TIMESTAMPTZ,
  anonymized_at TIMESTAMPTZ,             -- data protection: anonymize, never hard-delete clinical history
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS owners_user_rut_unique ON owners(user_id, rut) WHERE rut IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_owners_user_phone ON owners(user_id, phone);
CREATE INDEX IF NOT EXISTS idx_owners_user_name ON owners(user_id, lower(name));

ALTER TABLE pets ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES owners(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_pets_owner ON pets(owner_id);

-- Backfill: one tutor per user and identity key (RUT, then email, then phone, then name), in that order
DO $$
DECLARE g RECORD; new_id UUID;
BEGIN
  FOR g IN
    SELECT p.user_id,
           coalesce(vc_canon_rut(nullif(p.tutor_rut, '')), nullif(lower(trim(p.email)), ''), vc_canon_phone(p.phone),
                    nullif(lower(trim(p.tutor_name)), ''), 'pet:' || p.id::text) AS gkey,
           min(p.organization_id) AS organization_id,
           coalesce(max(nullif(trim(p.tutor_name), '')), 'Tutor sin nombre') AS name,
           max(vc_canon_rut(nullif(p.tutor_rut, ''))) AS rut,
           max(vc_canon_phone(p.phone)) AS phone,
           max(nullif(lower(trim(p.email)), '')) AS email,
           max(nullif(trim(p.address), '')) AS address
    FROM pets p
    WHERE p.owner_id IS NULL
    GROUP BY 1, 2
  LOOP
    INSERT INTO owners (user_id, organization_id, name, rut, phone, email, address)
    VALUES (g.user_id, g.organization_id, g.name, g.rut, g.phone, g.email, g.address)
    RETURNING id INTO new_id;
    UPDATE pets p SET owner_id = new_id
    WHERE p.owner_id IS NULL AND p.user_id = g.user_id
      AND coalesce(vc_canon_rut(nullif(p.tutor_rut, '')), nullif(lower(trim(p.email)), ''), vc_canon_phone(p.phone),
                   nullif(lower(trim(p.tutor_name)), ''), 'pet:' || p.id::text) = g.gkey;
  END LOOP;
END $$;
