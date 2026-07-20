INSERT INTO clinical_records (pet_id, user_id, record_type, date, veterinarian, details)
SELECT
  p.id,
  p.user_id,
  'consulta',
  (entry->>'date')::timestamptz,
  COALESCE(entry->>'veterinarian', ''),
  jsonb_build_object(
    'notes', COALESCE(entry->>'notes', ''),
    'weight', entry->>'weight'
  )
FROM pets p, jsonb_array_elements(p.clinical_history) AS entry
WHERE p.clinical_history IS NOT NULL
  AND p.clinical_history != '[]'::jsonb
  AND jsonb_array_length(p.clinical_history) > 0;

ALTER TABLE pets DROP COLUMN IF EXISTS clinical_history;
