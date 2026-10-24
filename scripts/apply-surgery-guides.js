#!/usr/bin/env node
// Loads the step-by-step guides in scripts/surgery-guides/ into the shared surgery catalog
// (surgeries.guide) and corrects the old text columns with them. Needs migration 024.
// Usage: node scripts/apply-surgery-guides.js [--apply] [ids…]   (dry run by default; no ids = every file)
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DIR = path.join(__dirname, 'surgery-guides');
const LEGACY = ['indicaciones', 'tecnica_quirurgica', 'material_quirurgico', 'tipo_sutura', 'complicaciones_frecuentes',
  'manejo_anestesico_sugerido', 'consideraciones_por_raza', 'consideraciones_comorbilidades', 'fuente'];

function check(entry, file) {
  const g = entry.guide;
  const need = ['lede', 'meta', 'before_you_start', 'indications', 'sections', 'closure', 'complications', 'quiz', 'sources'];
  const missing = need.filter((k) => g[k] == null);
  if (!Number.isInteger(entry.id)) missing.push('id');
  if (missing.length) throw new Error(`${file}: faltan ${missing.join(', ')}`);
  const ids = new Set();
  const walk = (secs) => secs.forEach((s) => {
    if (ids.has(s.id)) throw new Error(`${file}: sección repetida «${s.id}»`);
    ids.add(s.id);
    walk(s.subsections || []);
  });
  walk(g.sections);
}

(async () => {
  const apply = process.argv.includes('--apply');
  const only = process.argv.slice(2).filter((a) => /^\d+$/.test(a)).map(Number);
  const entries = fs.readdirSync(DIR).filter((f) => f.endsWith('.js')).sort().map((f) => {
    const e = require(path.join(DIR, f));
    check(e, f);
    return e;
  }).filter((e) => !only.length || only.includes(e.id));

  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query('BEGIN');
  try {
    for (const e of entries) {
      const cols = LEGACY.filter((k) => e.legacy && e.legacy[k] != null);
      const sets = ['guide = $2', ...cols.map((k, i) => `${k} = $${i + 3}`)];
      const res = await c.query(
        `UPDATE surgeries SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 AND organization_id IS NULL RETURNING nombre_cirugia`,
        [e.id, JSON.stringify(e.guide), ...cols.map((k) => e.legacy[k])]);
      const kb = (Buffer.byteLength(JSON.stringify(e.guide)) / 1024).toFixed(1);
      console.log(res.rowCount ? `  ${e.id} ${res.rows[0].nombre_cirugia}: guía de ${kb} KB${e.guide.draft ? ' (borrador)' : ''}` : `  ${e.id}: no existe en el catálogo compartido`);
    }
    await c.query(apply ? 'COMMIT' : 'ROLLBACK');
    console.log(apply ? 'Aplicado' : 'Prueba en seco: no se escribió nada. Usa --apply para aplicar.');
  } catch (err) {
    await c.query('ROLLBACK');
    console.error('ERROR (revertido):', err.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();
