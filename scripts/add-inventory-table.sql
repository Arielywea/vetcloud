-- Inventory table for tracking supplies and low-stock alerts
-- Run on both local PostgreSQL and Neon

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'insumo',
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  unit VARCHAR(50) DEFAULT 'unidades',
  last_restocked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_user ON inventory(user_id);
