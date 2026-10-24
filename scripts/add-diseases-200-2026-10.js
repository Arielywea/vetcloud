#!/usr/bin/env node
// Fifth pass on the disease catalog (Oct 2026): 50 entries to reach 200 (scripts/diseases-200/), inserted
// in the shared catalog, and chile_rank recomputed for all 200 (scripts/data/disease-chile-frequency.js).
// DRAFTS: every dose and protocol must be reviewed by a veterinarian.
//   node scripts/add-diseases-200-2026-10.js          → dry run: validates, inserts and ranks, then rolls back
//   node scripts/add-diseases-200-2026-10.js --apply  → commits
// Names that already exist are skipped, so re-running is safe.
require('dotenv').config({ quiet: true });
const { Client } = require('pg');
const { addDiseases } = require('./add-diseases-2026-10');
const { validate } = require('./add-diseases-150-2026-10');
const { fullOrder } = require('./data/disease-chile-frequency');

const APPLY = process.argv.includes('--apply');
const DISEASES = ['general', 'toxic-neuro-ortho', 'internal-onco', 'eye-skin'].flatMap((f) => require(`./diseases-200/${f}`));
const FREQUENCIES = ['muy_frecuente', 'frecuente', 'ocasional', 'rara'];

function validateBatch() {
  const errors = validate(DISEASES);
  for (const d of DISEASES) {
    if (!d.chile || !FREQUENCIES.includes(d.chile.frequency) || !Array.isArray(d.chile.bases) || !d.chile.bases.length) {
      errors.push(`${d.name}: falta la frecuencia en Chile o su base`);
    }
  }
  if (DISEASES.length !== 50) errors.push(`El lote tiene ${DISEASES.length} fichas, se esperaban 50`);
  return errors;
}

module.exports = { DISEASES, validateBatch };

if (require.main === module) {
  const errors = validateBatch();
  if (errors.length) { console.error(`Errores de validación:\n${errors.join('\n')}`); process.exit(1); }
  (async () => {
    const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await c.connect();
    await c.query('BEGIN');
    try {
      const existing = await c.query('SELECT lower(name) AS n FROM diseases WHERE organization_id IS NOT NULL');
      const clash = DISEASES.filter((d) => existing.rows.some((r) => r.n === d.name.toLowerCase()));
      if (clash.length) console.log(`Aviso: existen fichas propias de alguna clínica con el mismo nombre: ${clash.map((d) => d.name).join(', ')}`);
      const { lines, inserted } = await addDiseases(c, null, DISEASES);
      let ranked = 0;
      const missing = [];
      for (const r of fullOrder()) {
        const res = await c.query(
          'UPDATE diseases SET chile_frequency = $1, chile_rank = $2, chile_frequency_basis = $3 WHERE organization_id IS NULL AND name = $4',
          [r.frequency, r.rank, r.basis, r.name]);
        if (!res.rowCount) missing.push(r.name);
        ranked += res.rowCount;
      }
      if (missing.length) throw new Error(`Sin coincidencia en la base: ${missing.join(', ')}`);
      const tiers = await c.query('SELECT chile_frequency AS f, count(*)::int AS n FROM diseases WHERE organization_id IS NULL GROUP BY 1 ORDER BY min(chile_rank)');
      console.log(`${lines.join('\n')}\n\n${inserted} fichas nuevas; ${ranked} con orden de frecuencia.`);
      console.log(tiers.rows.map((t) => `${t.f}: ${t.n}`).join(' · '));
      if (APPLY) { await c.query('COMMIT'); console.log('\nAPLICADO.'); }
      else { await c.query('ROLLBACK'); console.log('\nPrueba en seco: no se escribió nada. Usa --apply para aplicar.'); }
    } catch (e) {
      await c.query('ROLLBACK');
      console.error('ERROR (revertido):', e.message);
      process.exitCode = 1;
    } finally {
      await c.end();
    }
  })();
}
