-- Migration 006: Inventory expiration + payments table
-- Run: node scripts/run-migrations.js

-- Inventory expiration
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS expiration_date DATE;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id INTEGER REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  appointment_id UUID REFERENCES appointments(id),
  pet_id UUID REFERENCES pets(id),
  amount NUMERIC(10,2) NOT NULL,
  method VARCHAR(30) CHECK (method IN ('efectivo', 'debito', 'credito', 'transferencia', 'otro')),
  description TEXT,
  paid_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_org ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_expiration ON inventory(expiration_date);
