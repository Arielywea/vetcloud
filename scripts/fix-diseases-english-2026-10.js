// Second pass on the disease catalog (Oct 2026): English left in the Spanish prose, plus two wording errors.
//   node scripts/fix-diseases-english-2026-10.js          → dry run: prints every change, writes nothing
//   node scripts/fix-diseases-english-2026-10.js --apply  → applies everything in one transaction
// Exact-substring replacements, so a second run finds nothing to change.
require('dotenv').config({ quiet: true });
const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');

// [from, to] applied to every string inside the text/jsonb columns below, in order
const REPLACEMENTS = [
  ['o signs de hipoxia', 'o signos de hipoxia'],
  ['Femoral Head Ostectomy (FHO): Excisión', 'Ostectomía de la cabeza femoral (FHO): Excisión'],
  ['formación de falso articulación', 'formación de una falsa articulación'],
  ['prurito auricular, head shaking, secreción', 'prurito auricular, sacudidas de cabeza, secreción'],
  ['Head shaking: Sacudida de cabeza frecuente e insistente, a veces violenta.', 'Sacudidas de cabeza: Frecuentes e insistentes, a veces violentas.'],
  ['celulitis, absceso, fever.', 'celulitis, absceso, fiebre.'],
  ['(skin tent >2 segundos)', '(pliegue cutáneo persistente >2 segundos)'],
  ['ojos hundidos (exoftalmos por deshidratación retrobulbar)', 'ojos hundidos (enoftalmos por pérdida de volumen retrobulbar)'],
  ['Vómitos con worms: El cachorro puede vomitar worms adultos', 'Vómitos con parásitos: El cachorro puede vomitar áscaris adultos'],
  ['con contenido pastoso o worms palpables', 'con contenido pastoso o masas de parásitos palpables'],
  ['con contenido pastoso o worms.', 'con contenido pastoso o parásitos.'],
  ['Puede mostrar worms en el intestino delgado', 'Puede mostrar áscaris en el intestino delgado'],
  ['pueden contener worms adultos (Toxocara cati)', 'pueden contener áscaris adultos (Toxocara cati)'],
  ['Abdomen abultado (pot-belly): Abdomen distendido', 'Abdomen abultado: Abdomen distendido'],
  ['especialmente en kittens con infección', 'especialmente en gatitos con infección'],
  ['Gagging y arcadas: El perro puede mostrar arcadas o gags después', 'Náuseas y arcadas: El perro puede mostrar arcadas o náuseas después'],
];
const NAME_FIXES = { 'Diabetes mellitus felino': 'Diabetes mellitus felina' };
const COLUMNS = ['description', 'pathophysiology', 'key_signs', 'diagnosis', 'treatment', 'prevention'];
// What must be gone afterwards (word-bounded, so "catéter" or "test" don't count)
const LEFTOVER = /\b(signs|head shaking|Femoral Head|fever|skin tent|exoftalmos por|worms|pot-belly|kittens?|Gagging|gags|gold standard|screening|turnaround)\b|�/i;

// Whole-word swaps after the phrase fixes ("kittens" ×23, "gold standard" ×33, "screening" ×12)
const WORDS = [
  [/\bkittens\b/g, 'gatitos'], [/\bKittens\b/g, 'Gatitos'],
  [/\bkitten\b/g, 'gatito'], [/\bKitten\b/g, 'Gatito'],
  [/\bGold standard\b/g, 'Estándar de oro'], [/\bgold standard\b/g, 'estándar de oro'],
  [/\bScreening\b/g, 'Tamizaje'], [/\bscreening\b/g, 'tamizaje'],
  [/pero turnaround largo/g, 'pero con resultados lentos'],
  // Mojibake left by a Latin-1 import
  [/U�as/g, 'Uñas'], [/di�lisis/g, 'diálisis'],
];

function replaceAll(s) {
  let out = s;
  for (const [from, to] of REPLACEMENTS) out = out.split(from).join(to);
  for (const [re, to] of WORDS) out = out.replace(re, to);
  return out;
}

function mapStrings(v, fn) {
  if (typeof v === 'string') return fn(v);
  if (Array.isArray(v)) return v.map((x) => mapStrings(x, fn));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, mapStrings(x, fn)]));
  return v;
}

async function applyEnglishFixes(c) {
  const changes = [];
  const rows = (await c.query(`SELECT id, name, ${COLUMNS.join(', ')} FROM diseases ORDER BY name`)).rows;
  const leftovers = [];
  for (const r of rows) {
    const patch = {};
    if (NAME_FIXES[r.name]) {
      patch.name = NAME_FIXES[r.name];
      changes.push(`"${r.name}" · name → "${patch.name}"`);
    }
    for (const f of COLUMNS) {
      if (r[f] == null) continue;
      const before = [];
      const after = [];
      const v = mapStrings(r[f], (s) => {
        const t = replaceAll(s);
        if (t !== s) { before.push(s); after.push(t); }
        return t;
      });
      if (before.length) {
        patch[f] = v;
        before.forEach((s, i) => changes.push(`"${r.name}" · ${f}\n   - ${s.slice(0, 160)}\n   + ${after[i].slice(0, 160)}`));
      }
    }
    const cols = Object.keys(patch);
    if (cols.length) {
      const vals = cols.map((k) => (typeof patch[k] === 'object' ? JSON.stringify(patch[k]) : patch[k]));
      await c.query(`UPDATE diseases SET ${cols.map((k, i) => `${k} = $${i + 2}`).join(', ')}, updated_at = NOW() WHERE id = $1`, [r.id, ...vals]);
    }
    const final = COLUMNS.map((f) => JSON.stringify(patch[f] ?? r[f] ?? '')).join(' ');
    if (LEFTOVER.test(final)) leftovers.push(`${r.name} («${final.match(LEFTOVER)[0]}»)`);
  }
  return { changes, leftovers };
}

module.exports = { applyEnglishFixes };

if (require.main === module) {
  (async () => {
    const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await c.connect();
    await c.query('BEGIN');
    try {
      const { changes, leftovers } = await applyEnglishFixes(c);
      console.log(changes.join('\n'));
      console.log(`\n${changes.length} textos corregidos · fichas con restos en inglés: ${leftovers.length ? leftovers.join(", ") : "ninguna"}`);
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
