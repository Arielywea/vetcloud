-- 023: order the disease catalog by how often each condition is seen in Chilean practice.
-- prevalence_rank was assigned batch by batch (repeated values, not comparable); the list also put
-- species before frequency. chile_rank is unique and is what "Frecuencia en Chile" sorts by.
-- (022 is reserved for dropping pets.tutor_* once nothing reads them.)
ALTER TABLE diseases ADD COLUMN IF NOT EXISTS chile_frequency VARCHAR(20)
  CHECK (chile_frequency IN ('muy_frecuente', 'frecuente', 'ocasional', 'rara'));
ALTER TABLE diseases ADD COLUMN IF NOT EXISTS chile_rank INTEGER;
ALTER TABLE diseases ADD COLUMN IF NOT EXISTS chile_frequency_basis TEXT;
CREATE INDEX IF NOT EXISTS idx_diseases_chile_rank ON diseases(chile_rank);
