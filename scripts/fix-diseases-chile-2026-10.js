// Third pass on the disease catalog (Oct 2026): ground the entries in Chile.
//   node scripts/fix-diseases-chile-2026-10.js          → dry run: prints every change, writes nothing
//   node scripts/fix-diseases-chile-2026-10.js --apply  → applies everything in one transaction
// - FIP rewritten for Chile: antivirals are not registered with the SAG and are rarely used, so the
//   standard of care is supportive and the prognosis stays grave.
// - A short "En Chile:" paragraph (local epidemiology / regulation) appended to entries where it changes
//   the clinical reasoning.
// - Three clear clinical errors removed (favipiravir in parvovirus, iodide for hypothyroidism, a duplicated
//   differential).
// Every change checks its own marker first, so a second run finds nothing to do.
require('dotenv').config({ quiet: true });
const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');

const CHILE = {
  'Leishmaniasis canina':
    'En Chile: no es endémica; no se ha demostrado transmisión local ni la presencia de flebótomos vectores. Los casos son importados (perros que viajaron o llegaron desde Brasil, Argentina, Paraguay, Bolivia o la cuenca del Mediterráneo): pregunta siempre por historial de viaje y, ante sospecha, confirma en un laboratorio de referencia e informa a la autoridad sanitaria.',
  'Ehrlichiosis canina':
    'En Chile: es frecuente en el norte y la zona central, donde abunda la garrapata café del perro (Rhipicephalus sanguineus), sobre todo en primavera y verano; suele coexistir con Anaplasma platys. En el sur es menos habitual sin antecedente de viaje.',
  'Babesiosis canina':
    'En Chile: se han detectado casos por Babesia vogeli, transmitida por Rhipicephalus sanguineus, principalmente en el norte del país. Es mucho menos frecuente que la ehrlichiosis; descártala en perros con anemia hemolítica y garrapatas, en especial si vienen del norte.',
  'Leptospirosis canina':
    'En Chile: hay casos en todo el país, con más riesgo en el sur lluvioso y en zonas rurales o periurbanas con roedores y agua estancada. La leptospirosis humana es de notificación obligatoria.',
  'Moquillo canino':
    'En Chile: es endémico y frecuente en perros no vacunados, favorecido por la gran población de perros con acceso libre a la calle; también se ha descrito en fauna silvestre, como los zorros culpeo y chilla. El esquema completo de vacunación del cachorro es la principal herramienta de control.',
  'Parvovirus canino':
    'En Chile: es endémico y una de las principales causas de consulta de urgencia en cachorros no vacunados o con el esquema incompleto.',
  'Golpe de calor (hipertermia)':
    'En Chile: la mayoría de los casos ocurre en las olas de calor de diciembre a febrero en la zona central y el norte: perros dejados en autos, paseados a mediodía o de razas braquicéfalas (bulldog francés, pug), muy populares en el país.',
  'Envenenamiento por rodenticidas':
    'En Chile: los cebos anticoagulantes (brodifacoum, bromadiolona) son de venta libre y de uso doméstico masivo, por lo que esta intoxicación es frecuente. Pide al tutor el envase para identificar el principio activo.',
  'Toxoplasmosis felina':
    'En Chile: es una zoonosis relevante para embarazadas y personas inmunodeprimidas. El gato elimina ooquistes solo unas semanas tras la primoinfección, por lo que el riesgo principal para las personas es la carne poco cocida y la tierra o verduras contaminadas, más que el contacto con el gato.',
  'Influenza canina':
    'En Chile: su circulación no está bien documentada. Ante un brote respiratorio en criaderos, hoteles o guarderías, confírmala por PCR en un laboratorio de referencia antes de asumirla.',
};

const FIP_NAME = 'Peritonitis infecciosa felina (FIP)';
const FIP_MARKER = 'registrados en el SAG';
const FIP_DESC_OLD = 'La enfermedad es fatal sin tratamiento, con supervivencia media de 8-12 semanas.';
const FIP_DESC_NEW = 'La enfermedad es fatal sin tratamiento antiviral, con supervivencia media de 8-12 semanas. En Chile los antivirales eficaces no están registrados y su uso es poco frecuente, por lo que el pronóstico en la práctica sigue siendo grave: la mayoría de los gatos con FIP confirmada muere o se eutanasia en semanas.';
const FIP_TREATMENT = {
  firstLine: [
    'Tratamiento de soporte: Drenaje de derrames (toracocentesis o abdominocentesis) cuando causan disnea o malestar, fluidoterapia, antieméticos (maropitant 1 mg/kg SC/IV cada 24 h), analgesia y soporte nutricional (sonda si hay anorexia prolongada).',
    'Evaluación de calidad de vida: Controles frecuentes de peso, apetito, temperatura y esfuerzo respiratorio. Conversa con el tutor desde el inicio el pronóstico y los criterios de eutanasia.',
    'Corticosteroides (paliativo): Prednisolona 1-2 mg/kg VO cada 24 h puede mejorar el apetito y el bienestar por un tiempo corto; no cambia el curso de la enfermedad.',
  ],
  secondLine: [
    'Antivirales (GS-441524, remdesivir, molnupiravir): Han mostrado altas tasas de remisión en estudios internacionales, pero en Chile no tienen registro en el SAG para uso veterinario. Si el tutor los consigue, explica que su calidad y continuidad no están garantizadas y sigue un protocolo internacional vigente con un especialista (las dosis cambian según la forma: húmeda, seca, ocular o neurológica). Monitorea hemograma, proteínas, A:G y enzimas hepáticas.',
    'Interferón omega felino: 1 MU/kg SC semanal como inmunomodulador; evidencia limitada y sin efecto demostrado sobre la sobrevida.',
  ],
  emergency: 'PRESENTACIÓN: Derrame pleural masivo con disnea severa, cianosis o colapso.\nPROTOCOLO:\n  - Oxígeno y mínima manipulación\n  - Toracocentesis de emergencia (drenar hasta mejorar la respiración)\n  - Analizar el líquido: proteínas totales, relación A:G, citología\n  - Conversar pronóstico y calidad de vida con el tutor',
  duration: 'Soporte mientras haya calidad de vida. Si se usa un antiviral, el curso habitual es de 84 días con controles cada 2-4 semanas.',
  notes: 'Chile: a la fecha de esta revisión no hay antivirales contra la FIP registrados en el SAG para uso veterinario (GS-441524, remdesivir oral o molnupiravir). El acceso es por importación informal, sin control de calidad ni continuidad asegurada y con un costo alto, así que la mayoría de los gatos recibe solo tratamiento de soporte. Confirma el estado de registro antes de recomendarlos.',
};
const FIP_PREVENTION_OLD = 'Evitar cruzar gatos seropositivos: No reproducir gatos con anticuerpos FCoV positivos para minimizar la transmisión vertical.';
const FIP_PREVENTION_NEW = 'Criaderos y colonias: Destetar y aislar temprano a los gatitos de madres que eliminan coronavirus (la transmisión es fecal-oral, no vertical) y evitar reproducir líneas con casos repetidos de FIP.';

// [disease, field, exact text to remove from that array]
const REMOVE_ITEMS = [
  ['Parvovirus canino', 'secondLine', 'Favipiravir: 15-20 mg/kg PO q12h. Antiviral de amplio espectro.'],
  ['Hipotiroidismo canino', 'secondLine', 'Yoduros: Yoduro de potasio 200 mg/día VO.'],
  ['Hipotiroidismo canino', 'secondLine', 'Tiroxina natural (T4): 10-20 ug/kg VO cada 12h.'],
];
const HYPO_SECOND_ADD = 'Levotiroxina cada 24 h (mantención): Una vez controlado, muchos perros se manejan con la dosis diaria total en una sola toma; confirma con T4 total 4-6 h post-dosis.';
const HYPO_DIFF_OLD = 'Hiperadrenocorticismo: Polifagia, polidipsia, cortisol elevado.';
const HYPO_DIFF_NEW = 'Síndrome del eutiroideo enfermo: T4 baja por enfermedad sistémica o fármacos (glucocorticoides, fenobarbital, sulfas) con TSH normal; repetir tras resolver la causa.';

async function applyChileFixes(c) {
  const changes = [];
  const get = async (name) => (await c.query('SELECT id, name, description, diagnosis, treatment, prevention FROM diseases WHERE name = $1 AND organization_id IS NULL', [name])).rows[0];
  const save = async (id, patch) => {
    const cols = Object.keys(patch);
    const vals = cols.map((k) => (typeof patch[k] === 'object' ? JSON.stringify(patch[k]) : patch[k]));
    await c.query(`UPDATE diseases SET ${cols.map((k, i) => `${k} = $${i + 2}`).join(', ')}, updated_at = NOW() WHERE id = $1`, [id, ...vals]);
  };

  for (const [name, text] of Object.entries(CHILE)) {
    const r = await get(name);
    if (!r) { changes.push(`! no existe: ${name}`); continue; }
    if (r.description.includes('En Chile:')) continue;
    await save(r.id, { description: `${r.description.trim()}\n\n${text}` });
    changes.push(`"${name}" · description += ${text.slice(0, 110)}…`);
  }

  const fip = await get(FIP_NAME);
  if (fip && !(fip.treatment?.notes || '').includes(FIP_MARKER)) {
    const patch = { treatment: FIP_TREATMENT };
    if (fip.description.includes(FIP_DESC_OLD)) patch.description = fip.description.replace(FIP_DESC_OLD, FIP_DESC_NEW);
    if ((fip.prevention || []).includes(FIP_PREVENTION_OLD)) {
      patch.prevention = fip.prevention.map((p) => (p === FIP_PREVENTION_OLD ? FIP_PREVENTION_NEW : p));
    }
    await save(fip.id, patch);
    changes.push(`"${FIP_NAME}" · treatment reescrito (soporte primero; antivirales sin registro SAG), ${Object.keys(patch).join(', ')}`);
  }

  for (const [name, field, text] of REMOVE_ITEMS) {
    const r = await get(name);
    const list = r?.treatment?.[field];
    if (!Array.isArray(list) || !list.includes(text)) continue;
    const treatment = { ...r.treatment, [field]: list.filter((x) => x !== text) };
    if (name === 'Hipotiroidismo canino' && !treatment.secondLine.includes(HYPO_SECOND_ADD)) treatment.secondLine.push(HYPO_SECOND_ADD);
    await save(r.id, { treatment });
    changes.push(`"${name}" · treatment.${field} −= ${text}`);
  }

  const hypo = await get('Hipotiroidismo canino');
  const diff = hypo?.diagnosis?.differentialDiagnosis;
  if (Array.isArray(diff) && diff.includes(HYPO_DIFF_OLD)) {
    await save(hypo.id, { diagnosis: { ...hypo.diagnosis, differentialDiagnosis: diff.map((d) => (d === HYPO_DIFF_OLD ? HYPO_DIFF_NEW : d)) } });
    changes.push('"Hipotiroidismo canino" · diferencial duplicado (Cushing) → síndrome del eutiroideo enfermo');
  }
  return { changes };
}

module.exports = { applyChileFixes };

if (require.main === module) {
  (async () => {
    const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await c.connect();
    await c.query('BEGIN');
    try {
      const { changes } = await applyChileFixes(c);
      console.log(changes.join('\n') || '(sin cambios)');
      console.log(`\n${changes.length} cambios`);
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
