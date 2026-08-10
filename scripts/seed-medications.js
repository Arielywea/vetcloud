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

async function seed() {
  const csvPath = path.join(__dirname, '../../Downloads/vetcloud-medicamentos-intraoperatorios.csv');
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split('\n').filter(l => l.trim());

  const header = parseCsvLine(lines[0]);
  console.log('Header:', header.join(' | '));
  console.log(`Found ${lines.length - 1} medications\n`);

  let inserted = 0;
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length < 10) { console.log(`Line ${i}: skipped (only ${fields.length} fields)`); continue; }

    const [nombre, marca_comercial, presentacion, familia, funcion, dosis_perro, dosis_gato, via_administracion, efectos_adversos, categoria] = fields;

    try {
      await pool.query(
        `INSERT INTO medications (organization_id, category, nombre, marca_comercial, presentacion, familia, funcion, dosis_perro, dosis_gato, via_administracion, efectos_adversos)
         VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [categoria, nombre, marca_comercial, presentacion, familia, funcion, dosis_perro, dosis_gato, via_administracion, efectos_adversos]
      );
      inserted++;
      console.log(`  ✓ ${nombre}`);
    } catch (err) {
      console.error(`  ✗ ${nombre}: ${err.message}`);
    }
  }

  console.log(`\nDone: ${inserted}/${lines.length - 1} medications inserted`);
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
