const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_THFGcfaW5M7h@ep-aged-river-ac7edlxd-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
});

// Map CSV filenames to especialidad keys
const CSV_ESPECIALIDAD_MAP = {
  'vetcloud-analgesia.csv': 'analgesia',
  'vetcloud-antibioticos.csv': 'antibioticos',
  'vetcloud-antiinflamatorios.csv': 'antiinflamatorios',
  'vetcloud-antiparasitarios.csv': 'antiparasitarios',
  'vetcloud-cardiologia.csv': 'cardiologia',
  'vetcloud-dermatologia.csv': 'dermatologia',
  'vetcloud-endocrinologia.csv': 'endocrinologia',
  'vetcloud-gastroenterologia.csv': 'gastroenterologia',
  'vetcloud-medicamentos-intraoperatorios-completo.csv': 'intraoperatorios',
  'vetcloud-neurologia.csv': 'neurologia',
  'vetcloud-oftalmologia.csv': 'oftalmologia',
  'vetcloud-oncologia.csv': 'oncologia',
  'vetcloud-respiratorio.csv': 'respiratorio',
  'vetcloud-urologia.csv': 'urologia',
};

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { fields.push(current.trim()); current = ''; }
      else { current += ch; }
    }
  }
  fields.push(current.trim());
  return fields;
}

function cleanValue(val) {
  if (!val || val === 'undefined' || val === 'null') return null;
  return val.trim() || null;
}

async function importCsv(csvPath, especialidad) {
  if (!fs.existsSync(csvPath)) {
    console.log(`  ⚠ File not found: ${csvPath}`);
    return 0;
  }

  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split('\n').filter(l => l.trim());

  const header = parseCsvLine(lines[0]);
  console.log(`\n=== ${especialidad.toUpperCase()} (${path.basename(csvPath)}) ===`);
  console.log(`Header: ${header.join(' | ')}`);
  console.log(`Found ${lines.length - 1} medications\n`);

  // For intraoperatorios, keep existing category. For others, use 'receta'
  const category = especialidad === 'intraoperatorios' ? 'intraoperatorio' : 'receta';

  let inserted = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length < 10) {
      console.log(`  ⚠ Line ${i}: skipped (only ${fields.length} fields)`);
      skipped++;
      continue;
    }

    const nombre = cleanValue(fields[0]);
    if (!nombre) { skipped++; continue; }

    const marca_comercial = cleanValue(fields[1]);
    const presentacion = cleanValue(fields[2]);
    const familia = cleanValue(fields[3]);
    const funcion = cleanValue(fields[4]);
    const dosis_perro = cleanValue(fields[5]);
    const dosis_gato = cleanValue(fields[6]);
    const via_administracion = cleanValue(fields[7]);
    const efectos_adversos = cleanValue(fields[8]);
    const notas = cleanValue(fields[10]);

    try {
      // Check if medication already exists (by nombre + especialidad)
      const existing = await pool.query(
        'SELECT id FROM medications WHERE nombre = $1 AND especialidad = $2 LIMIT 1',
        [nombre, especialidad]
      );

      if (existing.rows.length > 0) {
        console.log(`  ↳ ${nombre} (already exists, skipping)`);
        skipped++;
        continue;
      }

      await pool.query(
        `INSERT INTO medications (organization_id, category, nombre, marca_comercial, presentacion, familia, funcion, dosis_perro, dosis_gato, via_administracion, efectos_adversos, notas, especialidad)
         VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [category, nombre, marca_comercial, presentacion, familia, funcion, dosis_perro, dosis_gato, via_administracion, efectos_adversos, notas, especialidad]
      );
      inserted++;
      console.log(`  ✓ ${nombre}`);
    } catch (err) {
      console.error(`  ✗ ${nombre}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped`);
  return inserted;
}

async function main() {
  const csvDir = path.join(process.env.USERPROFILE || process.env.HOME, 'Desktop', 'Nueva carpeta');

  console.log('=== VETCLOUD VADECÉCUM IMPORT ===');
  console.log(`CSV directory: ${csvDir}\n`);

  // First, run the migration to add the especialidad column
  console.log('Running migration 014...');
  try {
    await pool.query(`
      ALTER TABLE medications ADD COLUMN IF NOT EXISTS especialidad VARCHAR(50);
      CREATE INDEX IF NOT EXISTS idx_medications_especialidad ON medications(especialidad);
    `);
    console.log('Migration 014 applied successfully\n');
  } catch (err) {
    console.log(`Migration note: ${err.message}\n`);
  }

  let totalInserted = 0;

  // Process each CSV file
  for (const [filename, especialidad] of Object.entries(CSV_ESPECIALIDAD_MAP)) {
    const csvPath = path.join(csvDir, filename);
    const count = await importCsv(csvPath, especialidad);
    totalInserted += count;
  }

  console.log(`\n=== TOTAL: ${totalInserted} medications imported ===`);

  // Show summary by especialidad
  console.log('\n=== SUMMARY BY ESPECIALIDAD ===');
  const result = await pool.query(
    'SELECT especialidad, COUNT(*) as count FROM medications WHERE especialidad IS NOT NULL GROUP BY especialidad ORDER BY especialidad'
  );
  for (const row of result.rows) {
    console.log(`  ${row.especialidad}: ${row.count}`);
  }

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
