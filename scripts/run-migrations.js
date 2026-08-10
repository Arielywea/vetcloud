const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

try { require('dotenv').config(); } catch (e) {}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const MIGRATIONS = [
  '002_auth_overhaul.sql',
  '003_multi_tenancy.sql',
  '004_appointment_lifecycle.sql',
  '005_vital_measurements.sql',
  '006_inventory_expiration_payments.sql',
  '007_make_rut_nullable.sql',
  '008_pre_diagnostico_base_diseases.sql',
  '009_treatment_followup.sql',
  '010_medications.sql',
  '011_medication_notes.sql',
  '012_exam_attachments.sql',
  '013_medication_dose_fields.sql',
];

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');

  // Create migrations tracking table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT now()
    );
  `);

  // Check which migrations already ran
  const { rows: applied } = await pool.query('SELECT filename FROM _migrations');
  const appliedSet = new Set(applied.map(r => r.filename));

  let ran = 0;
  for (const filename of MIGRATIONS) {
    if (appliedSet.has(filename)) {
      console.log(`  SKIP  ${filename} (already applied)`);
      continue;
    }

    const filePath = path.join(migrationsDir, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`  FAIL  ${filename} not found`);
      process.exit(1);
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`  RUN   ${filename}...`);
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO _migrations (filename) VALUES ($1)', [filename]);
      console.log(`  DONE  ${filename}`);
      ran++;
    } catch (err) {
      console.error(`  FAIL  ${filename}: ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`\n${ran} migration(s) applied. Database is up to date.`);
  await pool.end();
}

runMigrations().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
