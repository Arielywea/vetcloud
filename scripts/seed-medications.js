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

async function seedCategory(csvPath, category) {
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split('\n').filter(l => l.trim());

  const header = parseCsvLine(lines[0]);
  console.log(`\n=== ${category.toUpperCase()} ===`);
  console.log('Header:', header.join(' | '));
  console.log(`Found ${lines.length - 1} medications\n`);

  // Clear existing medications for this category to avoid duplicates
  await pool.query('DELETE FROM medications WHERE category = $1 AND organization_id IS NULL', [category]);
  console.log(`  Cleared existing ${category} medications\n`);

  let inserted = 0;
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length < 10) { console.log(`Line ${i}: skipped (only ${fields.length} fields)`); continue; }

    const [nombre, marca_comercial, presentacion, familia, funcion, dosis_perro, dosis_gato, via_administracion, efectos_adversos, cat] = fields;
    const notas = fields[10] || null;

    try {
      await pool.query(
        `INSERT INTO medications (organization_id, category, nombre, marca_comercial, presentacion, familia, funcion, dosis_perro, dosis_gato, via_administracion, efectos_adversos, notas)
         VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [category, nombre, marca_comercial, presentacion, familia, funcion, dosis_perro, dosis_gato, via_administracion, efectos_adversos, notas]
      );
      inserted++;
      console.log(`  ✓ ${nombre}`);
    } catch (err) {
      console.error(`  ✗ ${nombre}: ${err.message}`);
    }
  }

  console.log(`\nDone: ${inserted}/${lines.length - 1} ${category} medications inserted`);
  return inserted;
}

async function seed() {
  const intraPath = path.join(__dirname, '../../Downloads/vetcloud-medicamentos-intraoperatorios.csv');
  const recetaPath = path.join(__dirname, '../../Downloads/vetcloud-medicamentos-receta.csv');

  let total = 0;
  if (fs.existsSync(intraPath)) {
    total += await seedCategory(intraPath, 'intraoperatorio');
  }
  if (fs.existsSync(recetaPath)) {
    total += await seedCategory(recetaPath, 'receta');
  }

  console.log(`\n=== TOTAL: ${total} medications seeded ===`);
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
