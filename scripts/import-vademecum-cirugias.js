const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_THFGcfaW5M7h@ep-aged-river-ac7edlxd-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
});

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

async function importSurgeries(csvPath) {
  if (!fs.existsSync(csvPath)) {
    console.log(`  ⚠ File not found: ${csvPath}`);
    return 0;
  }

  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split('\n').filter(l => l.trim());

  const header = parseCsvLine(lines[0]);
  console.log(`\n=== SURGERIES IMPORT (${path.basename(csvPath)}) ===`);
  console.log(`Header: ${header.join(' | ')}`);
  console.log(`Found ${lines.length - 1} surgeries\n`);

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

    const indicaciones = cleanValue(fields[1]);
    const tecnica_quirurgica = cleanValue(fields[2]);
    const material_quirurgico = cleanValue(fields[3]);
    const tipo_sutura = cleanValue(fields[4]);
    const complicaciones_frecuentes = cleanValue(fields[5]);
    const manejo_anestesico_sugerido = cleanValue(fields[6]);
    const consideraciones_por_raza = cleanValue(fields[7]);
    const consideraciones_comorbilidades = cleanValue(fields[8]);
    const fuente = cleanValue(fields[9]);

    try {
      const existing = await pool.query(
        'SELECT id FROM surgeries WHERE nombre_cirugia = $1 LIMIT 1',
        [nombre]
      );

      if (existing.rows.length > 0) {
        await pool.query(
          `UPDATE surgeries 
           SET indicaciones = $2, tecnica_quirurgica = $3, material_quirurgico = $4, 
               tipo_sutura = $5, complicaciones_frecuentes = $6, 
               manejo_anestesico_sugerido = $7, consideraciones_por_raza = $8, 
               consideraciones_comorbilidades = $9, fuente = $10
           WHERE id = $1`,
          [existing.rows[0].id, indicaciones, tecnica_quirurgica, material_quirurgico, tipo_sutura, complicaciones_frecuentes, manejo_anestesico_sugerido, consideraciones_por_raza, consideraciones_comorbilidades, fuente]
        );
        console.log(`  ↳ ${nombre} (updated)`);
        skipped++;
        continue;
      }

      await pool.query(
        `INSERT INTO surgeries (organization_id, nombre_cirugia, indicaciones, tecnica_quirurgica, 
         material_quirurgico, tipo_sutura, complicaciones_frecuentes, manejo_anestesico_sugerido, 
         consideraciones_por_raza, consideraciones_comorbilidades, fuente)
         VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [nombre, indicaciones, tecnica_quirurgica, material_quirurgico, tipo_sutura, complicaciones_frecuentes, manejo_anestesico_sugerido, consideraciones_por_raza, consideraciones_comorbilidades, fuente]
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

  console.log('=== VETCLOUD SURGERIES IMPORT ===');
  console.log(`CSV directory: ${csvDir}\n`);

  // Run migration
  console.log('Running migration 015...');
  try {
    const migrationPath = path.join(__dirname, 'migrations', '015_create_surgeries_table.sql');
    const migration = fs.readFileSync(migrationPath, 'utf-8');
    await pool.query(migration);
    console.log('Migration 015 applied successfully\n');
  } catch (err) {
    console.log(`Migration note: ${err.message}\n`);
  }

  // Import surgeries CSV
  const csvPath = path.join(csvDir, 'vetcloud-cirugias.csv');
  const count = await importSurgeries(csvPath);

  console.log(`\n=== TOTAL: ${count} surgeries imported ===`);

  // Show summary
  const result = await pool.query('SELECT COUNT(*) as count FROM surgeries');
  console.log(`Total surgeries in DB: ${result.rows[0].count}`);

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
