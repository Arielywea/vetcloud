// Fourth pass on the disease catalog (Oct 2026): grow it to 150 entries with the conditions most
// seen in Chilean practice and the important ones missing (feline chronic gingivostomatitis, virulent
// systemic calicivirus, squamous cell carcinoma, loxoscelism, metaldehyde...). The entries live in
// scripts/diseases-150/. DRAFTS: every dose and protocol must be reviewed by a veterinarian.
// --global inserts them in the shared catalog (organization_id NULL) and moves the previous batch's 11
// entries of --org there too, so every clinic sees the same 150 entries.
//   node scripts/add-diseases-150-2026-10.js --org=2          → dry run: validates and lists what would be inserted
//   node scripts/add-diseases-150-2026-10.js --org=2 --apply  → inserts them in one transaction
//   node scripts/add-diseases-150-2026-10.js --org=2 --global --apply → shared catalog for every clinic
// Names that already exist (global or in that organization) are skipped, so re-running is safe.
require('dotenv').config({ quiet: true });
const { Client } = require('pg');
const { addDiseases, DISEASES: PREVIOUS } = require('./add-diseases-2026-10');

const APPLY = process.argv.includes('--apply');
const GLOBAL = process.argv.includes('--global');
const ORG = Number((process.argv.find((a) => a.startsWith('--org=')) || '').slice(6));

const DISEASES = [
  ...require('./diseases-150/cats'),
  ...require('./diseases-150/dogs-1'),
  ...require('./diseases-150/dogs-2'),
  ...require('./diseases-150/both'),
];

// Same keys the app understands (constants/diseaseMeta.ts, app/(drawer)/diseases.tsx)
const ALLOWED = {
  species: ['dog', 'cat', 'both'],
  category: ['infectious', 'parasitic', 'degenerative', 'oncological', 'nutritional', 'autoimmune', 'traumatic',
    'congenital', 'respiratory', 'gastrointestinal', 'dermatological', 'ocular', 'dental', 'endocrine',
    'cardiovascular', 'neurological', 'musculoskeletal', 'renal', 'reproductive', 'toxic', 'urological',
    'hematologic', 'metabolic', 'environmental'],
  severity: ['critical', 'severe', 'moderate', 'mild'],
  prognosis: ['excellent', 'good', 'guarded', 'poor', 'grave', 'chronic'],
  life_stage: ['puppy', 'kitten', 'adult', 'senior', 'all'],
};

function validate(list) {
  const errors = [];
  const names = new Set();
  for (const d of list) {
    const where = d.name || '(sin nombre)';
    if (names.has(d.name.toLowerCase())) errors.push(`${where}: nombre duplicado en el lote`);
    names.add(d.name.toLowerCase());
    for (const [field, values] of Object.entries(ALLOWED)) {
      if (!values.includes(d[field])) errors.push(`${where}: ${field} "${d[field]}" no es válido`);
    }
    if (!Number.isInteger(d.prevalence_rank)) errors.push(`${where}: prevalence_rank debe ser entero`);
    if (!d.description || !d.pathophysiology) errors.push(`${where}: falta descripción o fisiopatología`);
    if (!Array.isArray(d.key_signs) || d.key_signs.length < 3) errors.push(`${where}: menos de 3 signos clave`);
    const dx = d.diagnosis || {};
    if (!dx.clinicalExam || !Array.isArray(dx.labTests) || !Array.isArray(dx.imaging) || !Array.isArray(dx.differentialDiagnosis)) {
      errors.push(`${where}: diagnóstico incompleto`);
    }
    const tx = d.treatment || {};
    if (!Array.isArray(tx.firstLine) || !tx.firstLine.length || !Array.isArray(tx.secondLine) || !tx.emergency || !tx.duration || !tx.notes) {
      errors.push(`${where}: tratamiento incompleto`);
    }
    if (!Array.isArray(d.prevention) || !d.prevention.length) errors.push(`${where}: falta prevención`);
    if (!Array.isArray(d.references_list) || d.references_list.length < 2) errors.push(`${where}: menos de 2 referencias`);
    if (/\$\s?\d|CLP|pesos/i.test(JSON.stringify(d))) errors.push(`${where}: contiene precios`);
  }
  return errors;
}

module.exports = { DISEASES, validate };

if (require.main === module) {
  const errors = validate(DISEASES);
  if (errors.length) {
    console.error(`Errores de validación:\n${errors.join('\n')}`);
    process.exit(1);
  }
  if (!Number.isInteger(ORG) || ORG <= 0) {
    console.error('Indica la organización dueña de las fichas: --org=<id>');
    process.exit(1);
  }
  (async () => {
    const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await c.connect();
    await c.query('BEGIN');
    try {
      const org = await c.query('SELECT name FROM organizations WHERE id = $1', [ORG]);
      if (!org.rowCount) throw new Error(`No existe la organización ${ORG}`);
      const { lines, inserted } = await addDiseases(c, GLOBAL ? null : ORG, DISEASES);
      if (GLOBAL) {
        const moved = await c.query('UPDATE diseases SET organization_id = NULL WHERE organization_id = $1 AND name = ANY($2) RETURNING name', [ORG, PREVIOUS.map((d) => d.name)]);
        lines.push(`
Pasadas al catálogo global desde la organización: ${moved.rowCount}`);
      }
      const total = await c.query('SELECT count(*)::int AS n FROM diseases WHERE organization_id IS NULL' + (GLOBAL ? '' : ' OR organization_id = $1'), GLOBAL ? [] : [ORG]);
      console.log(`Organización: ${org.rows[0].name}\n${lines.join('\n')}\n\n${DISEASES.length} fichas en el lote, ${inserted} nuevas. Total visible: ${total.rows[0].n}`);
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
