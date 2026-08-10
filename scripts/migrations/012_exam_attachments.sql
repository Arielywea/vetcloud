CREATE TABLE IF NOT EXISTS exam_attachments (
  id SERIAL PRIMARY KEY,
  pet_id UUID REFERENCES pets(id),
  clinical_record_id UUID REFERENCES clinical_records(id),
  organization_id INTEGER REFERENCES organizations(id),
  exam_type VARCHAR(100),
  file_url TEXT NOT NULL,
  notes TEXT,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_attachments_pet ON exam_attachments(pet_id);
CREATE INDEX IF NOT EXISTS idx_exam_attachments_org ON exam_attachments(organization_id);
