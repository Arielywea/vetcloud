-- Migration 015: Create surgeries table for veterinary surgical library
-- Run: psql $DATABASE_URL -f scripts/migrations/015_create_surgeries_table.sql

CREATE TABLE IF NOT EXISTS surgeries (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  nombre_cirugia VARCHAR(255) NOT NULL,
  indicaciones TEXT,
  tecnica_quirurgica TEXT,
  material_quirurgico TEXT,
  tipo_sutura TEXT,
  complicaciones_frecuentes TEXT,
  manejo_anestesico_sugerido TEXT,
  consideraciones_por_raza TEXT,
  consideraciones_comorbilidades TEXT,
  fuente TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_surgeries_nombre ON surgeries(nombre_cirugia);
CREATE INDEX IF NOT EXISTS idx_surgeries_organization ON surgeries(organization_id);

COMMENT ON TABLE surgeries IS 'Biblioteca de cirugías comunes de animales de compañía - VetCloud';
