import { Pool } from 'pg';
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_THFGcfaW5M7h@ep-aged-river-ac7edlxd-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require' });

  // 1. Add prevalence_rank column
  console.log('Adding prevalence_rank column...');
  await pool.query('ALTER TABLE diseases ADD COLUMN IF NOT EXISTS prevalence_rank INTEGER');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_diseases_prevalence_rank ON diseases(prevalence_rank ASC NULLS LAST)');
  console.log('✓ Column added');

  // 2. Delete all existing diseases (start fresh)
  console.log('Clearing existing diseases...');
  await pool.query('DELETE FROM diseases');
  console.log('✓ Cleared');

  const count = await pool.query('SELECT COUNT(*) as c FROM diseases');
  console.log(`Diseases after clear: ${count.rows[0].c}`);

  await pool.end();
}
main().catch(err => { console.error(err); process.exit(1); });
