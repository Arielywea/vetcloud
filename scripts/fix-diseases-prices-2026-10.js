// Removes the unsourced CLP prices from the "Chile:" notes of the disease catalog (Oct 2026).
// Prices without a source go stale fast and read as authoritative; the notes keep availability and
// where to get each drug or procedure.
//   node scripts/fix-diseases-prices-2026-10.js          → dry run: prints every change, writes nothing
//   node scripts/fix-diseases-prices-2026-10.js --apply  → applies everything in one transaction
// Only rows that still contain a price are touched, so a second run finds nothing to do.
require('dotenv').config({ quiet: true });
const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');
const HAS_PRICE = /\$\s?\d|\bCLP\b/;
const AMOUNT = String.raw`\$\s?[\d.]+(?:\s*-\s*\$?\s?[\d.]+)?(?:\s*CLP)?`;

// Notes that would be unreadable once the amounts are gone: rewritten by hand
const REWRITES = {
  'Luxación patelar': 'Chile: la corrección quirúrgica (trocleoplastia, transposición de la tuberosidad tibial) se realiza en clínicas con servicio de traumatología veterinaria.',
  'Neumonía por aspiración': 'Chile: requiere hospitalización con oxigenoterapia; deriva a una clínica con atención 24 horas si no cuentas con oxígeno.',
  'Obstrucción intestinal': 'Chile: la ecografía abdominal y la cirugía (enterotomía o enterectomía) están disponibles en la mayoría de las clínicas con pabellón.',
  'Trauma torácico': 'Chile: el drenaje pleural y la hospitalización con oxígeno se realizan en clínicas con atención de urgencia 24 horas.',
  'Envenenamiento por rodenticidas': 'Chile: la vitamina K1 (fitomenadiona) está disponible en presentaciones humanas y veterinarias; las transfusiones se realizan en clínicas con banco de sangre veterinario.',
  'Úlcera corneal': 'Chile: tobramicina 0,3% y ciprofloxacino 0,3% oftálmicos disponibles en farmacias.',
  'Enfermedad renal crónica canina': "Chile: dietas renales (Royal Canin Renal, Hill's k/d), benazepril y maropitant (Cerenia®) disponibles; la fluidoterapia subcutánea domiciliaria se puede enseñar al tutor.",
  'Pancreatitis canina': "Chile: maropitant (Cerenia®), metamizol y dietas bajas en grasa (Hill's i/d, Royal Canin Gastrointestinal) disponibles; Spec cPL se procesa en laboratorios de referencia (IDEXX Chile).",
  'Leptospirosis canina': 'Chile: doxiciclina, ampicilina y maropitant disponibles; vacuna con leptospiras (Nobivac L4, MSD) disponible. El MAT se realiza en el Instituto de Salud Pública (ISP) y en laboratorios universitarios.',
  'Dermatitis atópica canina': 'Chile: Apoquel® y Cytopoint® (Zoetis), Atopica® y champús medicados (Dermoscent®, Malaseb®) disponibles en veterinarias.',
  'Enfermedad periodontal': 'Chile: limpieza dental con ultrasonido, extracciones y radiografía dental se realizan en clínicas con servicio dental; pastas enzimáticas (Virbac C.E.T.) disponibles en veterinarias.',
  'Conjuntivitis': 'Chile: eritromicina oftálmica y cloranfenicol 1% disponibles en farmacias.',
  'Ruptura de ligamento cruzado': 'Chile: TPLO y TTA disponibles en el Hospital Clínico de la U. de Chile y en clínicas especializadas (Santiago, Viña del Mar, Concepción), con programas de rehabilitación posoperatoria.',
  // The old note listed "Cisaprida (Motilium)": Motilium is domperidone, not cisapride
  'Obstrucción intestinal felina': 'Chile: buprenorfina (Buprenodale) y metronidazol disponibles; la cisaprida se obtiene por recetario magistral. Dieta Royal Canin Gastrointestinal disponible en veterinarias.',
};

function stripPrices(s) {
  return s
    // "Costo …: $X-$Y CLP …." — the whole sentence
    .replace(new RegExp(String.raw`\s*Costos?\b[^$]*?${AMOUNT}[^.$]*?\.(?=\s|$)`, 'g'), '')
    // "(… $X CLP …)"
    .replace(/\s*\([^()]*\$\s?\d[^()]*\)/g, '')
    // " — $X CLP por mes" / ", costo $X CLP"
    .replace(new RegExp(String.raw`\s*(?:—|,\s*costo)\s*${AMOUNT}[^.]*?(?=\.(?:\s|$))`, 'gi'), '')
    // trailing "$X CLP por ojo" right before a full stop
    .replace(new RegExp(String.raw`\s*${AMOUNT}(?:\s*(?:\/\s*\w+|por\s+[\wáéíóú ]+?))?(?=\.(?:\s|$))`, 'g'), '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function applyPriceFixes(c) {
  const changes = [];
  const rows = (await c.query(`SELECT id, name, treatment FROM diseases WHERE treatment->>'notes' ~ '\\$\\s?[0-9]|CLP' ORDER BY name`)).rows;
  for (const r of rows) {
    const before = r.treatment.notes;
    const after = REWRITES[r.name] || stripPrices(before);
    if (after === before) continue;
    await c.query(`UPDATE diseases SET treatment = $2, updated_at = NOW() WHERE id = $1`, [r.id, JSON.stringify({ ...r.treatment, notes: after })]);
    changes.push({ name: r.name, before, after, leftover: HAS_PRICE.test(after) });
  }
  return { changes };
}

module.exports = { applyPriceFixes, stripPrices };

if (require.main === module) {
  (async () => {
    const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await c.connect();
    await c.query('BEGIN');
    try {
      const { changes } = await applyPriceFixes(c);
      for (const ch of changes) console.log(`"${ch.name}"${ch.leftover ? '  ⚠ QUEDA PRECIO' : ''}\n   - ${ch.before}\n   + ${ch.after}`);
      console.log(`\n${changes.length} notas sin precios · con restos: ${changes.filter((x) => x.leftover).length}`);
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
