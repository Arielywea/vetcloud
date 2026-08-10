CREATE TABLE IF NOT EXISTS medications (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  category VARCHAR(30) NOT NULL CHECK (category IN ('intraoperatorio', 'receta')),
  nombre VARCHAR(150) NOT NULL,
  marca_comercial VARCHAR(150),
  presentacion VARCHAR(150),
  familia VARCHAR(150),
  funcion TEXT,
  dosis_perro VARCHAR(200),
  dosis_gato VARCHAR(200),
  via_administracion VARCHAR(150),
  efectos_adversos TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medications_category ON medications(category);
CREATE INDEX IF NOT EXISTS idx_medications_org ON medications(organization_id);
CREATE INDEX IF NOT EXISTS idx_medications_nombre ON medications(nombre);
