#!/usr/bin/env node
// The vet reviewed doses and protocols of the shared catalog (Oct 2026): removes the opening
// "Borrador pendiente de revisión veterinaria (...)" sentence from treatment.notes; the rest of each note stays.
// Usage: node scripts/clear-disease-draft-notes.js [--apply]   (dry run by default)
require('dotenv').config({ quiet: true });
const { Client } = require('pg');

const DRAFT = '^Borrador pendiente de revisión veterinaria \\([^)]*\\): verifica dosis y protocolos antes de usarlos\\.\\s*';

(async () => {
  const apply = process.argv.includes('--apply');
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query('BEGIN');
  try {
    const res = await c.query(
      `UPDATE diseases SET treatment = jsonb_set(treatment, '{notes}', to_jsonb(regexp_replace(treatment->>'notes', $1, '')))
       WHERE organization_id IS NULL AND treatment->>'notes' ~ $1
       RETURNING name, treatment->>'notes' AS notes`, [DRAFT]);
    const left = await c.query(`SELECT count(*)::int AS n FROM diseases WHERE treatment->>'notes' ~* '^Borrador pendiente'`);
    console.log(`${res.rowCount} fichas sin la nota de borrador; quedan con borrador: ${left.rows[0].n}`);
    res.rows.slice(0, 3).forEach((r) => console.log(`  ${r.name}: «${(r.notes || '(sin notas)').slice(0, 90)}»`));
    await c.query(apply ? 'COMMIT' : 'ROLLBACK');
    console.log(apply ? 'Aplicado' : 'Prueba en seco: no se escribió nada. Usa --apply para aplicar.');
  } catch (e) {
    await c.query('ROLLBACK');
    console.error('ERROR (revertido):', e.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();
