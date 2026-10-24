#!/usr/bin/env node
// Writes chile_frequency, chile_rank and chile_frequency_basis on the global disease catalog from
// scripts/data/disease-chile-frequency.js (proposal + the vet's review + the entries added after it). Idempotent;
// the added entries must already exist (scripts/add-diseases-200-2026-10.js inserts and ranks them in one go).
// Usage: node scripts/apply-chile-frequency.js [--dry-run]
const { Client } = require('pg');
const { fullOrder: finalOrder } = require('./data/disease-chile-frequency');
try { require('dotenv').config({ quiet: true }); } catch (e) {}

(async () => {
  const dry = process.argv.includes('--dry-run');
  const rows = finalOrder();
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query('BEGIN');
  try {
    let updated = 0;
    const missing = [];
    for (const r of rows) {
      const res = await c.query(
        `UPDATE diseases SET chile_frequency = $1, chile_rank = $2, chile_frequency_basis = $3
         WHERE organization_id IS NULL AND name = $4
           AND (chile_frequency IS DISTINCT FROM $1 OR chile_rank IS DISTINCT FROM $2 OR chile_frequency_basis IS DISTINCT FROM $3)`,
        [r.frequency, r.rank, r.basis, r.name]);
      updated += res.rowCount;
      const exists = await c.query('SELECT 1 FROM diseases WHERE organization_id IS NULL AND name = $1', [r.name]);
      if (!exists.rows.length) missing.push(r.name);
    }
    const tiers = await c.query("SELECT chile_frequency, count(*)::int n FROM diseases WHERE organization_id IS NULL GROUP BY 1 ORDER BY 1");
    console.log(`${updated} filas actualizadas; sin coincidencia: ${missing.length ? missing.join(', ') : 'ninguna'}`);
    console.log(tiers.rows.map((t) => `${t.chile_frequency || '(sin asignar)'}: ${t.n}`).join(' · '));
    await c.query(dry || missing.length ? 'ROLLBACK' : 'COMMIT');
    console.log(dry ? 'Prueba: revertido' : missing.length ? 'Revertido: hay nombres sin coincidencia' : 'Aplicado');
  } catch (err) {
    await c.query('ROLLBACK');
    throw err;
  } finally {
    await c.end();
  }
})().catch((err) => { console.error(err.message); process.exit(1); });
