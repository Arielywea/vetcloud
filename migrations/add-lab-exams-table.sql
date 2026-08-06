-- Lab exams table for VetCloud
CREATE TABLE IF NOT EXISTS lab_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_name VARCHAR(255) NOT NULL,
  exam_type VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'completado')),
  result TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  veterinarian VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lab_exams_user_id ON lab_exams(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_exams_pet_id ON lab_exams(pet_id);
CREATE INDEX IF NOT EXISTS idx_lab_exams_status ON lab_exams(status);
