// One-off, idempotent data corrections for the disease catalog (Oct 2026 audit).
//   node scripts/fix-diseases-2026-10.js          → dry run: prints every change, writes nothing
//   node scripts/fix-diseases-2026-10.js --apply  → applies everything in one transaction
// Requires migration 018 (english_name column + diseases_archive table).
require('dotenv').config({ quiet: true });
const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');

// ── 1. Duplicates: the richer/better-ranked row survives; the other is archived, then removed ──
const MERGES = [
  { drop: '3a64fbdf-e5d1-40ee-8723-79ce6caa6068', keep: 'faf9467d-14e8-4eab-8ce9-52f48df1641a', reason: 'Parvovirus duplicado (la copia lo marcaba zoonótico)' },
  { drop: '59181211-f1e9-4a68-b044-7aa357be3b6d', keep: '3eebeb14-c57d-4b0c-9158-cad3904d8acb', reason: 'Moquillo duplicado (se conserva la ficha más completa)', keepPatch: { prevalence_rank: 16 } },
  { drop: '0b137ce5-a58c-4ecb-b001-2b6de7316173', keep: '66b52eef-efba-4035-ab80-817f39d1ac10', reason: 'PIF duplicada' },
  { drop: 'f5980b66-7526-42e2-8570-c6843d3e1546', keep: '2406b7f3-7300-4327-9747-fd9d263e2a5b', reason: 'FeLV duplicada' },
];

// ── 2. Clinical/field corrections (keyed by current name) ──
const NAME_FIXES = {
  'Displasia Patelar': 'Luxación patelar',
  'Ulcora Corneal': 'Úlcera corneal',
  'Criptorquidea': 'Criptorquidia',
  'Epulide': 'Épulis',
  'Anemia Inmunitaria Mediada': 'Anemia hemolítica inmunomediada',
  'Dilatacion-Torsion Gastrica': 'Dilatación-torsión gástrica',
  'Obstruccion Intestinal': 'Obstrucción intestinal',
  'Intoxicacion por Chocolate': 'Intoxicación por chocolate',
  'Intoxicacion por Xilitol': 'Intoxicación por xilitol',
  'Mielopatia Degenerativa': 'Mielopatía degenerativa',
  'Neumonia Aspirativa': 'Neumonía por aspiración',
  'Trauma Toracico': 'Trauma torácico',
  'Lupus Eritematoso Sistemico': 'Lupus eritematoso sistémico',
  'Parasitos Intestinales en Cachorros': 'Parásitos intestinales en cachorros',
  'Panleukopenia Felina': 'Panleucopenia felina',
  'Infecciones Respiratorias Felinas': 'Complejo respiratorio felino',
  'Enfermedad Renal Crónica (Perro)': 'Enfermedad renal crónica canina',
  'Ureterolithiasis Felina': 'Ureterolitiasis felina',
  'Linfoma': 'Linfoma canino',
  'Leishmaniasis': 'Leishmaniasis canina',
  'Dermatofitosis': 'Dermatofitosis canina',
  'Leptospirosis': 'Leptospirosis canina',
  'Hipotiroidismo': 'Hipotiroidismo canino',
  'Hiperadrenocorticismo': 'Hiperadrenocorticismo (síndrome de Cushing)',
  'Rinotraqueitis Felina': 'Rinotraqueítis felina',
};
const FIELD_FIXES = {
  'Panleucopenia felina': { is_zoonotic: false },            // FPV does not infect people
  'Parvovirus canino': { is_zoonotic: false },               // CPV-2 is not zoonotic
  'Golpe de calor (hipertermia)': { category: 'environmental' }, // was filed under "toxic"
};
const CATEGORY_ALIASES = { hematological: 'hematologic' };
const ENGLISH_FIXES = {
  'Hyperadrenocorticism (Cushings Disease)': "Hyperadrenocorticism (Cushing's disease)",
  'Leptospirosis canina': 'Canine Leptospirosis',
  'Leishmaniasis': 'Canine Leishmaniasis',
};

// Latin names only where an agent has one; everything else gets NULL (the old values were English names)
const LATIN = {
  'parvovirus canino': 'Carnivore protoparvovirus 1 (CPV-2)',
  'moquillo canino': 'Canine morbillivirus (CDV)',
  'leptospirosis canina': 'Leptospira interrogans sensu lato',
  'ehrlichiosis canina': 'Ehrlichia canis',
  'babesiosis canina': 'Babesia vogeli, Babesia gibsoni',
  'leishmaniasis canina': 'Leishmania infantum',
  'dermatofitosis canina': 'Microsporum canis, Trichophyton spp.',
  'dermatofitosis felina': 'Microsporum canis',
  'tos de las perreras': 'Bordetella bronchiseptica, CPiV, CAdV-2',
  'influenza canina': 'Influenza A virus (H3N8, H3N2)',
  'parásitos intestinales en cachorros': 'Toxocara canis, Ancylostoma caninum, Giardia duodenalis',
  'parásitos intestinales en gatitos': 'Toxocara cati, Ancylostoma tubaeforme, Giardia duodenalis',
  'toxoplasmosis felina': 'Toxoplasma gondii',
  'peritonitis infecciosa felina (fip)': 'Feline coronavirus (FCoV), biotipo FIPV',
  'leucemia felina (felv)': 'Feline leukemia virus (Gammaretrovirus)',
  'virus de inmunodeficiencia felina (fiv)': 'Feline immunodeficiency virus (Lentivirus)',
  'rinotraqueítis felina': 'Felid alphaherpesvirus 1 (FHV-1)',
  'calicivirus felino': 'Feline calicivirus (Vesivirus)',
  'panleucopenia felina': 'Carnivore protoparvovirus 1 (FPV)',
  'complejo respiratorio felino': 'FHV-1, FCV, Chlamydia felis, Mycoplasma felis',
};

// Notes whose CLP prices were lost when seeding ("$" got eaten by the shell: ".000-.000 CLP")
const NOTE_REWRITES = {
  'Enfermedad del Disco Intervertebral': 'Chile: TAC y cirugía descompresiva disponibles en centros de referencia.',
  'Dilatacion-Torsion Gastrica': 'Chile: gastropexia preventiva y cirugía de urgencia disponibles en centros con pabellón 24 h.',
  'Linfoma': 'Chile: protocolo CHOP y lomustina disponibles en centros oncológicos veterinarios.',
  'Hiperadrenocorticismo': 'Chile: trilostano disponible en farmacias veterinarias; mitotano con receta.',
  'Hipotiroidismo': 'Chile: levotiroxina disponible (presentaciones humanas y veterinarias); TSH y T4 libre en laboratorios veterinarios.',
  'Ehrlichiosis Canina': 'Chile: doxiciclina disponible; PCR para Ehrlichia en laboratorios veterinarios.',
  'Babesiosis Canina': 'Chile: imidocarb disponible con receta; transfusión en centros con banco de sangre veterinario.',
  'Leishmaniasis': 'Chile: antimoniato de meglumina (Glucantime) y alopurinol disponibles con receta.',
  'Dermatofitosis': 'Chile: itraconazol disponible; cultivo fúngico en laboratorios veterinarios.',
};
const BROKEN_PRICE = /(^|[\s(])\.\d{3}/;
function stripBrokenPrices(text) {
  return text
    .split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚ])/)
    .filter((s) => !/\b(costo|cuesta)\b/i.test(s))                // sentences that were only about price
    .map((s) => s.replace(/\s*\([^()]*\.\d{3}[^()]*\)/g, ''))    // "(.000-.000 CLP)"
    .join(' ')
    .replace(/\s+\./g, '.')
    .trim();
}

// ── 3. Sentence case (Spanish titles) keeping acronyms and proper nouns ──
const KEEP_CASE = new Set(['Cushing', 'FeLV', 'FIV', 'FIP', 'HCM', 'FORL', 'FLUTD', 'ATE', 'IVDD']);
function sentenceCase(name) {
  let first = true;
  return name.replace(/[\p{L}][\p{L}']*/gu, (w) => {
    if (first) { first = false; return w; }
    if (KEEP_CASE.has(w) || /[A-ZÁÉÍÓÚÑ].*[A-ZÁÉÍÓÚÑ]/.test(w)) return w; // acronyms like FeLV, HCM
    return w[0].toLowerCase() + w.slice(1);
  });
}

// ── helpers ──
const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const hasAccent = (s) => /[áéíóúÁÉÍÓÚ]/.test(s);
function mapStrings(value, fn) {
  if (typeof value === 'string') return fn(value);
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, fn));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapStrings(v, fn)]));
  return value;
}
function eachString(value, fn) {
  if (typeof value === 'string') fn(value);
  else if (Array.isArray(value)) value.forEach((v) => eachString(v, fn));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => eachString(v, fn));
}
const TEXT_FIELDS = ['description', 'pathophysiology', 'key_signs', 'diagnosis', 'treatment', 'prevention'];
const WORD = /[\p{L}]+/gu;

/** Runs every correction on `c` (caller owns the transaction). Exported so tests can run it rolled back. */
async function applyDiseaseFixes(c) {
  const changes = [];
  const log = (m) => changes.push(m);
  {
    const hasCol = (await c.query(`SELECT 1 FROM information_schema.columns WHERE table_name='diseases' AND column_name='english_name'`)).rowCount;
    if (!hasCol) {
      if (APPLY) throw new Error('Falta la migración 018 (english_name). Corre node scripts/run-migrations.js primero.');
      // Dry run before the migration: apply it inside this transaction, which is rolled back
      await c.query(require('fs').readFileSync(require('path').join(__dirname, 'migrations/018_disease_english_name_archive.sql'), 'utf8'));
      log('(migración 018 aplicada solo dentro de esta prueba en seco)');
    }

    // 1. merges
    for (const m of MERGES) {
      const drop = (await c.query('SELECT * FROM diseases WHERE id = $1', [m.drop])).rows[0];
      if (!drop) continue; // already merged
      const keep = (await c.query('SELECT id, name FROM diseases WHERE id = $1', [m.keep])).rows[0];
      if (!keep) throw new Error(`No existe la ficha a conservar ${m.keep}`);
      log(`MERGE  "${drop.name}" (${m.drop.slice(0, 8)}) → ${m.keep.slice(0, 8)}: ${m.reason}`);
      await c.query('INSERT INTO diseases_archive (disease_id, merged_into, reason, row_data) VALUES ($1, $2, $3, $4)', [m.drop, m.keep, m.reason, JSON.stringify(drop)]);
      // favorites: avoid a second favorite for the same user, then move the rest
      await c.query(`DELETE FROM favorites f WHERE f.disease_id = $1 AND EXISTS (SELECT 1 FROM favorites g WHERE g.user_id = f.user_id AND g.disease_id = $2)`, [m.drop, m.keep]).catch(() => {});
      for (const t of ['favorites', 'personal_notes', 'medical_records']) {
        await c.query(`UPDATE ${t} SET disease_id = $2 WHERE disease_id = $1`, [m.drop, m.keep]);
      }
      await c.query('DELETE FROM diseases WHERE id = $1', [m.drop]);
      if (m.keepPatch) {
        for (const [k, v] of Object.entries(m.keepPatch)) await c.query(`UPDATE diseases SET ${k} = $2 WHERE id = $1`, [m.keep, v]);
      }
    }

    const rows = (await c.query('SELECT * FROM diseases ORDER BY name')).rows;

    // Accent dictionary from well-written rows
    const accentRatio = (r) => { let a = 0, t = 0; for (const f of TEXT_FIELDS) eachString(r[f], (s) => { t += s.length; a += (s.match(/[áéíóúñ]/gi) || []).length; }); return t ? a / t : 1; };
    const good = rows.filter((r) => accentRatio(r) >= 0.004);
    const bad = new Set(rows.filter((r) => accentRatio(r) < 0.004).map((r) => r.id));
    const variants = new Map(); // stripped lowercase → Set(accented lowercase)
    const plainSeen = new Set(); // unaccented words that legitimately appear in good text ("esta", "solo"…)
    for (const r of good) for (const f of TEXT_FIELDS) eachString(r[f], (s) => {
      for (const w of s.match(WORD) || []) {
        const lw = w.toLowerCase();
        if (hasAccent(lw)) { const k = strip(lw); if (!variants.has(k)) variants.set(k, new Set()); variants.get(k).add(lw); }
        else plainSeen.add(lw);
      }
    });
    const accentPairs = new Map(); // ACCENT_REPORT=1 lists every word the dictionary changes
    const accentFix = (s) => s.replace(WORD, (w) => {
      const lw = w.toLowerCase();
      if (hasAccent(lw) || plainSeen.has(lw)) return w;
      const v = variants.get(lw);
      if (!v || v.size !== 1) return w;
      const acc = [...v][0];
      if (process.env.ACCENT_REPORT) accentPairs.set(`${lw} → ${acc}`, (accentPairs.get(`${lw} → ${acc}`) || 0) + 1);
      return w === w.toUpperCase() && w.length > 1 ? acc.toUpperCase() : w[0] === w[0].toUpperCase() ? acc[0].toUpperCase() + acc.slice(1) : acc;
    });

    let accentWords = 0;
    for (const r of rows) {
      const patch = {};
      // names
      let name = NAME_FIXES[r.name] || r.name;
      name = sentenceCase(name);
      if (name !== r.name) patch.name = name;
      const fields = FIELD_FIXES[name] || {};
      for (const [k, v] of Object.entries(fields)) if (r[k] !== v) patch[k] = v;
      if (CATEGORY_ALIASES[r.category]) patch.category = CATEGORY_ALIASES[r.category];
      // english / latin
      if (!r.english_name && r.scientific_name) patch.english_name = ENGLISH_FIXES[r.scientific_name] || r.scientific_name;
      const latin = LATIN[name.toLowerCase()] || null;
      const wasEnglish = !r.english_name; // first run: scientific_name holds the English name
      if (wasEnglish ? r.scientific_name !== latin : (latin && r.scientific_name !== latin)) patch.scientific_name = latin;
      // emoji in signs
      const signs = (r.key_signs || []).map((s) => (typeof s === 'string' ? s.replace(/^\s*\u{1F534}\s*/u, '') : s));
      // text: accents (only rows written without them) + notes
      const fix = bad.has(r.id) ? (s) => { const o = accentFix(s); if (o !== s) accentWords += (s.match(WORD) || []).filter((w, i) => w !== (o.match(WORD) || [])[i]).length; return o; } : (s) => s;
      const newSigns = signs.map((s) => (typeof s === 'string' ? fix(s) : s));
      if (JSON.stringify(newSigns) !== JSON.stringify(r.key_signs)) patch.key_signs = newSigns;
      for (const f of ['description', 'pathophysiology']) {
        if (typeof r[f] === 'string') { const v = fix(r[f]); if (v !== r[f]) patch[f] = v; }
      }
      for (const f of ['diagnosis', 'prevention']) {
        const v = mapStrings(r[f], fix);
        if (JSON.stringify(v) !== JSON.stringify(r[f])) patch[f] = v;
      }
      let tx = mapStrings(r.treatment || {}, fix);
      if (typeof tx.notes === 'string' && BROKEN_PRICE.test(tx.notes)) {
        tx = { ...tx, notes: NOTE_REWRITES[r.name] || stripBrokenPrices(tx.notes) };
      }
      if (JSON.stringify(tx) !== JSON.stringify(r.treatment)) patch.treatment = tx;

      if (Object.keys(patch).length) {
        const summary = Object.entries(patch).map(([k, v]) => {
          if (['name', 'category', 'is_zoonotic', 'scientific_name', 'english_name', 'prevalence_rank'].includes(k)) return `${k}=${JSON.stringify(v)}`;
          if (k === 'treatment' && v.notes !== (r.treatment || {}).notes) return `notes="${String(v.notes).slice(0, 90)}…"`;
          return k;
        }).join(', ');
        log(`UPDATE "${r.name}": ${summary}`);
        const cols = Object.keys(patch);
        const vals = cols.map((k) => (patch[k] !== null && typeof patch[k] === 'object' ? JSON.stringify(patch[k]) : patch[k]));
        await c.query(`UPDATE diseases SET ${cols.map((k, i) => `${k} = $${i + 2}`).join(', ')}, updated_at = NOW() WHERE id = $1`, [r.id, ...vals]);
      }
    }

    const after = (await c.query(`SELECT count(*) total,
        count(*) FILTER (WHERE key_signs::text ~ '\u{1F534}') emoji,
        count(*) FILTER (WHERE treatment->>'notes' ~ '(^|[\\s(])\\.[0-9]{3}') broken_prices,
        count(*) FILTER (WHERE is_zoonotic AND name ~* '(parvovirus|panleucopenia)') wrong_zoonosis,
        count(*) FILTER (WHERE category = 'hematological') hematological,
        (SELECT count(*) FROM (SELECT lower(name) FROM diseases GROUP BY 1 HAVING count(*) > 1) d) duplicate_names
      FROM diseases`)).rows[0];

    return { changes, accentWords, badCount: bad.size, after, accentPairs };
  }
}

module.exports = { applyDiseaseFixes };

if (require.main === module) {
  (async () => {
    const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await c.connect();
    await c.query('BEGIN');
    try {
      const { changes, accentWords, badCount, after, accentPairs } = await applyDiseaseFixes(c);
      if (process.env.ACCENT_REPORT) console.log([...accentPairs].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ×${n}`).join(' | '));
      else console.log(changes.join('\n'));
      console.log(`\n${changes.length} cambios · ${accentWords} palabras con tilde restaurada en ${badCount} fichas escritas sin tildes`);
      console.log('Estado resultante:', after);
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
