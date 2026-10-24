-- 024: structured step-by-step guides for the surgery catalog (docs/plans/2026-10-24-cirugias.md).
-- The old text columns stay as the fallback while a surgery has no guide, and for search.
ALTER TABLE surgeries ADD COLUMN IF NOT EXISTS category   VARCHAR(30);
ALTER TABLE surgeries ADD COLUMN IF NOT EXISTS sort_order INTEGER;
ALTER TABLE surgeries ADD COLUMN IF NOT EXISTS guide      JSONB;

-- Category and order of the 20 shared surgeries (most frequent first within each category)
UPDATE surgeries s SET category = v.category, sort_order = v.sort_order
FROM (VALUES
  (1, 'reproductiva', 1), (2, 'reproductiva', 2), (4, 'reproductiva', 3), (3, 'reproductiva', 4),
  (5, 'digestiva', 1), (7, 'digestiva', 2), (6, 'digestiva', 3), (8, 'digestiva', 4),
  (10, 'hepatoesplenica', 1), (9, 'hepatoesplenica', 2),
  (12, 'urinaria', 1), (13, 'urinaria', 2), (11, 'urinaria', 3),
  (20, 'piel', 1), (18, 'piel', 2),
  (14, 'perineal', 1),
  (15, 'oftalmica', 1), (16, 'oftalmica', 2),
  (19, 'toracica', 1),
  (17, 'ortopedica', 1)
) AS v(id, category, sort_order)
WHERE s.id = v.id AND s.organization_id IS NULL AND s.category IS NULL;

-- Names corrected after review (ids unchanged)
UPDATE surgeries SET nombre_cirugia = 'Mastectomía unilateral (en cadena)' WHERE id = 4 AND organization_id IS NULL;
UPDATE surgeries SET nombre_cirugia = 'Gastrotomía y enterotomía' WHERE id = 5 AND organization_id IS NULL;
UPDATE surgeries SET nombre_cirugia = 'Enterectomía y anastomosis' WHERE id = 7 AND organization_id IS NULL;
UPDATE surgeries SET nombre_cirugia = 'Prolapso de glándula del tercer párpado' WHERE id = 16 AND organization_id IS NULL;
UPDATE surgeries SET nombre_cirugia = 'Osteotomía correctiva de deformidad angular' WHERE id = 17 AND organization_id IS NULL;
UPDATE surgeries SET nombre_cirugia = 'Toracostomía con tubo y lavado pleural' WHERE id = 19 AND organization_id IS NULL;
