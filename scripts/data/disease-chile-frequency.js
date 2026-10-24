// Proposed frequency of each global catalog entry in Chilean small-animal practice (E1).
// Order = chile_rank. Pending the user's clinical review before scripts/apply-chile-frequency.js writes it.
//
// Bases (the key says what the estimate rests on; the user reviews every row):
const BASES = {
  CL_ROBLE: 'Contreras 2010, Centro de Atención Primaria El Roble (Santiago), 5.405 fichas: en perros predominan las causas infecciosas digestivas, luego parasitarias y traumáticas; en gatos las infecciosas respiratorias y luego las traumáticas',
  CL_FELV: 'Choi et al. 2024 (Viruses 16:46), Santiago: FeLV progresiva 5 %, regresiva 7,5 %; FIV 3,3 %',
  CL_TICKS: 'Di Cataldo et al. 2021 y Abarca et al. 2020: exposición a Anaplasma frecuente (44 % de perros), Ehrlichia canis casi no detectada en Chile',
  CL_LEISH: 'Leishmaniasis canina considerada no endémica en Chile; solo casos importados (revisión regional; Rev Chil Infectol 2024)',
  CL_RABIA: 'Sin rabia canina urbana; casos esporádicos de variante murciélago en perros y gatos (vigilancia ISP)',
  CL_ECHINO: 'Hidatidosis endémica en zonas rurales del sur y la Patagonia; poco frecuente en clínica urbana',
  CL_LOXO: 'Loxosceles laeta es común en viviendas chilenas; el loxoscelismo en mascotas se diagnostica poco',
  CL_INTACT: 'Baja tasa de esterilización en Chile: tumores mamarios, piometra y pseudogestación siguen siendo habituales',
  CL_STREET: 'Población canina con acceso a la calle y vacunación incompleta: más infecciosas, parasitarias y traumas',
  VC: 'VetCompass (O\'Neill et al., atención primaria en Reino Unido): de los trastornos más diagnosticados',
  VC_LOW: 'VetCompass: prevalencia baja en atención primaria (< 1 %)',
  BREED: 'Razas populares en Chile (poodle, bulldog francés, salchicha, yorkshire, mestizos pequeños) con predisposición',
  EST: 'Estimación clínica sin dato chileno publicado: confirmar',
};

// [name, frequency, basis keys]
const PROPOSAL = [
  // Muy frecuente: se ve todas las semanas en atención primaria
  ['Enfermedad periodontal', 'muy_frecuente', ['VC']],
  ['Otitis externa', 'muy_frecuente', ['VC']],
  ['Parásitos intestinales en cachorros', 'muy_frecuente', ['CL_ROBLE', 'CL_STREET']],
  ['Dermatitis alérgica a la picadura de pulgas', 'muy_frecuente', ['VC', 'CL_ROBLE']],
  ['Parvovirus canino', 'muy_frecuente', ['CL_ROBLE', 'CL_STREET']],
  ['Enfermedad periodontal felina', 'muy_frecuente', ['VC']],
  ['Complejo respiratorio felino', 'muy_frecuente', ['CL_ROBLE']],
  ['Trauma por atropello', 'muy_frecuente', ['CL_ROBLE', 'CL_STREET']],
  ['Obesidad canina', 'muy_frecuente', ['VC']],
  ['Dermatitis atópica canina', 'muy_frecuente', ['VC']],
  ['Enfermedad de los sacos anales', 'muy_frecuente', ['VC']],
  ['Pioderma superficial canina', 'muy_frecuente', ['VC']],
  ['Parásitos intestinales en gatitos', 'muy_frecuente', ['CL_ROBLE']],
  ['Osteoartritis canina', 'muy_frecuente', ['VC']],
  ['Enfermedad renal crónica felina', 'muy_frecuente', ['VC']],

  // Frecuente: casi todas las semanas o varias veces al mes
  ['FLUTD (síndrome urológico felino)', 'frecuente', ['VC']],
  ['Obesidad felina', 'frecuente', ['VC']],
  ['Absceso felino', 'frecuente', ['CL_ROBLE']],
  ['Tumores mamarios caninos', 'frecuente', ['CL_INTACT']],
  ['Enfermedad valvular mitral degenerativa', 'frecuente', ['VC', 'BREED']],
  ['Dermatitis por Malassezia canina', 'frecuente', ['VC']],
  ['Rinotraqueítis felina', 'frecuente', ['CL_ROBLE']],
  ['Calicivirus felino', 'frecuente', ['CL_ROBLE']],
  ['Moquillo canino', 'frecuente', ['CL_STREET']],
  ['Giardiasis', 'frecuente', ['CL_ROBLE']],
  ['Infección urinaria bacteriana canina', 'frecuente', ['VC']],
  ['Piometra', 'frecuente', ['CL_INTACT']],
  ['Otoacariasis (sarna otodécica)', 'frecuente', ['CL_ROBLE']],
  ['Tos de las perreras', 'frecuente', ['CL_STREET']],
  ['Leucemia felina (FeLV)', 'frecuente', ['CL_FELV']],
  ['Obstrucción intestinal', 'frecuente', ['VC']],
  ['Envenenamiento por rodenticidas', 'frecuente', ['EST']],
  ['Intoxicación por organofosforados y carbamatos', 'frecuente', ['EST']],
  ['Síndrome braquicefálico obstructivo', 'frecuente', ['BREED']],
  ['Enfermedad del disco intervertebral', 'frecuente', ['BREED']],
  ['Luxación patelar', 'frecuente', ['BREED']],
  ['Ruptura de ligamento cruzado', 'frecuente', ['VC']],
  ['Displasia coxofemoral', 'frecuente', ['VC']],
  ['Sarna sarcóptica canina', 'frecuente', ['CL_STREET']],
  ['Demodicosis canina', 'frecuente', ['VC']],
  ['Hipersensibilidad alimentaria', 'frecuente', ['VC']],
  ['Gingivoestomatitis crónica felina', 'frecuente', ['EST']],
  ['Conjuntivitis', 'frecuente', ['VC']],
  ['Úlcera corneal', 'frecuente', ['VC']],
  ['Pancreatitis canina', 'frecuente', ['VC']],
  ['Enfermedad renal crónica canina', 'frecuente', ['VC']],
  ['Cistitis intersticial felina', 'frecuente', ['VC']],
  ['Dermatofitosis felina', 'frecuente', ['EST']],
  ['Colapso traqueal', 'frecuente', ['BREED']],
  ['Cataratas', 'frecuente', ['VC']],
  ['Pseudogestación canina', 'frecuente', ['CL_INTACT']],
  ['Otohematoma', 'frecuente', ['VC']],
  ['Histiocitoma cutáneo canino', 'frecuente', ['VC']],
  ['Reabsorción dental felina (FORL)', 'frecuente', ['VC']],
  ['Gastroenteritis hemorrágica', 'frecuente', ['EST']],
  ['Hipertiroidismo felino', 'frecuente', ['VC']],

  // Ocasional: algunas veces al mes o menos
  ['Virus de inmunodeficiencia felina (FIV)', 'ocasional', ['CL_FELV']],
  ['Mastocitoma canino', 'ocasional', ['VC']],
  ['Anaplasmosis canina', 'ocasional', ['CL_TICKS']],
  ['Enteropatía crónica canina (enfermedad inflamatoria intestinal)', 'ocasional', ['VC_LOW']],
  ['Diabetes mellitus felina', 'ocasional', ['VC_LOW']],
  ['Diabetes mellitus canina', 'ocasional', ['VC_LOW']],
  ['Epilepsia idiopática canina', 'ocasional', ['VC_LOW']],
  ['Hiperadrenocorticismo (síndrome de Cushing)', 'ocasional', ['VC_LOW']],
  ['Hipotiroidismo canino', 'ocasional', ['VC_LOW']],
  ['Panleucopenia felina', 'ocasional', ['EST']],
  ['Peritonitis infecciosa felina (FIP)', 'ocasional', ['VC_LOW']],
  ['Dermatofitosis canina', 'ocasional', ['EST']],
  ['Criptorquidia', 'ocasional', ['VC_LOW']],
  ['Lipidosis hepática felina', 'ocasional', ['EST']],
  ['Enteropatía crónica felina (enfermedad inflamatoria intestinal)', 'ocasional', ['EST']],
  ['Cardiomiopatía hipertrófica felina (HCM)', 'ocasional', ['VC_LOW']],
  ['Urolitiasis canina', 'ocasional', ['VC_LOW']],
  ['Lesión renal aguda', 'ocasional', ['EST']],
  ['Asma felino', 'ocasional', ['VC_LOW']],
  ['Dermatitis atópica felina', 'ocasional', ['EST']],
  ['Linfoma canino', 'ocasional', ['VC_LOW']],
  ['Prolapso de la glándula del tercer párpado (ojo de cereza)', 'ocasional', ['BREED']],
  ['Queratoconjuntivitis seca (ojo seco)', 'ocasional', ['VC_LOW']],
  ['Leptospirosis canina', 'ocasional', ['EST']],
  ['Hernia perineal canina', 'ocasional', ['CL_INTACT']],
  ['Prostatitis', 'ocasional', ['CL_INTACT']],
  ['Distocia', 'ocasional', ['CL_INTACT']],
  ['Eclampsia canina (tetania puerperal)', 'ocasional', ['CL_INTACT']],
  ['Tumor venéreo transmisible canino', 'ocasional', ['CL_STREET']],
  ['Tumores mamarios felinos', 'ocasional', ['CL_INTACT']],
  ['Obstrucción intestinal felina', 'ocasional', ['EST']],
  ['Dilatación-torsión gástrica', 'ocasional', ['VC_LOW']],
  ['Trauma torácico', 'ocasional', ['CL_STREET']],
  ['Trauma torácico felino', 'ocasional', ['CL_ROBLE']],
  ['Intoxicación por antiinflamatorios no esteroidales (AINE)', 'ocasional', ['EST']],
  ['Intoxicación por permetrina en gatos', 'ocasional', ['EST']],
  ['Intoxicación por chocolate', 'ocasional', ['EST']],
  ['Intoxicación por paracetamol en gatos', 'ocasional', ['EST']],
  ['Intoxicación por metaldehído (cebos para caracoles)', 'ocasional', ['EST']],
  ['Loxoscelismo (mordedura de araña de rincón)', 'ocasional', ['CL_LOXO']],
  ['Golpe de calor (hipertermia)', 'ocasional', ['EST']],
  ['Neumonía por aspiración', 'ocasional', ['EST']],
  ['Acné felino', 'ocasional', ['VC_LOW']],
  ['Colangitis felina', 'ocasional', ['EST']],
  ['Pancreatitis felina', 'ocasional', ['EST']],
  ['Megacolon felino', 'ocasional', ['EST']],
  ['Hemoplasmosis felina (anemia infecciosa felina)', 'ocasional', ['EST']],
  ['Hipertensión sistémica felina', 'ocasional', ['EST']],
  ['Nefrolitiasis felina', 'ocasional', ['EST']],
  ['Ureterolitiasis felina', 'ocasional', ['EST']],
  ['Pólipos nasofaríngeos y óticos felinos', 'ocasional', ['EST']],
  ['Clamidiosis felina', 'ocasional', ['EST']],
  ['Glaucoma', 'ocasional', ['VC_LOW']],
  ['Fractura dentaria', 'ocasional', ['VC_LOW']],
  ['Épulis', 'ocasional', ['VC_LOW']],
  ['Hemangiosarcoma canino', 'ocasional', ['VC_LOW']],
  ['Osteosarcoma canino', 'ocasional', ['VC_LOW']],
  ['Melanoma oral canino', 'ocasional', ['VC_LOW']],
  ['Carcinoma de células escamosas felino', 'ocasional', ['EST']],
  ['Linfoma gastrointestinal felino', 'ocasional', ['EST']],
  ['Mastocitoma felino', 'ocasional', ['EST']],
  ['Anemia hemolítica inmunomediada', 'ocasional', ['VC_LOW']],
  ['Tromboembolismo aórtico felino', 'ocasional', ['EST']],
  ['Síndrome vestibular idiopático canino', 'ocasional', ['VC_LOW']],
  ['Anemia regenerativa felina', 'ocasional', ['EST']],
  ['Hipoglucemia neonatal canina', 'ocasional', ['EST']],
  ['Brucelosis canina', 'ocasional', ['EST']],
  ['Equinococosis canina (hidatidosis)', 'ocasional', ['CL_ECHINO']],

  // Rara: pocas veces al año o solo en zonas o grupos concretos
  ['Enfermedad renal poliquística felina', 'rara', ['BREED']],
  ['Bartonelosis felina (enfermedad por arañazo de gato)', 'rara', ['EST']],
  ['Toxoplasmosis felina', 'rara', ['EST']],
  ['Piotórax felino', 'rara', ['EST']],
  ['Peritonitis bacteriana felina', 'rara', ['EST']],
  ['Pododermatitis felina', 'rara', ['EST']],
  ['Glomerulonefritis felina', 'rara', ['EST']],
  ['Trombocitopenia inmunomediada canina', 'rara', ['VC_LOW']],
  ['Hipoadrenocorticismo (enfermedad de Addison)', 'rara', ['VC_LOW']],
  ['Insuficiencia pancreática exocrina canina', 'rara', ['VC_LOW']],
  ['Shunt portosistémico congénito', 'rara', ['VC_LOW']],
  ['Cardiomiopatía dilatada canina', 'rara', ['VC_LOW']],
  ['Mielopatía degenerativa', 'rara', ['VC_LOW']],
  ['Lupus eritematoso sistémico', 'rara', ['VC_LOW']],
  ['Leucemia linfocítica felina', 'rara', ['EST']],
  ['Sarcoma asociado al sitio de inyección felino', 'rara', ['EST']],
  ['Anemia neonatal felina', 'rara', ['EST']],
  ['Intoxicación por lirios en gatos', 'rara', ['EST']],
  ['Intoxicación por uvas y pasas', 'rara', ['EST']],
  ['Intoxicación por xilitol', 'rara', ['EST']],
  ['Calicivirosis sistémica virulenta felina', 'rara', ['EST']],
  ['Ehrlichiosis canina', 'rara', ['CL_TICKS']],
  ['Babesiosis canina', 'rara', ['EST']],
  ['Influenza canina', 'rara', ['EST']],
  ['Leishmaniasis canina', 'rara', ['CL_LEISH']],
  ['Rabia', 'rara', ['CL_RABIA']],
];

// The vet's review on the review page (2026-10-24): rows whose tier they changed
BASES.REV = 'Corregida en la revisión del veterinario usuario (criterio clínico en Chile)';
const CORRECTIONS = {
  'Absceso felino': 'ocasional',
  'Dermatitis por Malassezia canina': 'muy_frecuente',
  'Dermatofitosis canina': 'frecuente',
  'Enfermedad de los sacos anales': 'frecuente',
  'Envenenamiento por rodenticidas': 'ocasional',
  'Intoxicación por organofosforados y carbamatos': 'ocasional',
  'Osteoartritis canina': 'frecuente',
  'Toxoplasmosis felina': 'ocasional',
  'Virus de inmunodeficiencia felina (FIV)': 'frecuente',
};

const TIERS = ['muy_frecuente', 'frecuente', 'ocasional', 'rara'];

/** The final list in chile_rank order: a row moved down opens its new tier, a row moved up closes it */
function finalOrder() {
  const rows = PROPOSAL.map(([name, freq, bases], i) => {
    const to = CORRECTIONS[name];
    if (!to || to === freq) return { name, freq, bases, key: [TIERS.indexOf(freq), 1, i] };
    const down = TIERS.indexOf(to) > TIERS.indexOf(freq);
    return { name, freq: to, bases: [...bases, 'REV'], key: [TIERS.indexOf(to), down ? 0 : 2, i] };
  });
  rows.sort((a, b) => a.key[0] - b.key[0] || a.key[1] - b.key[1] || a.key[2] - b.key[2]);
  return rows.map((r, i) => ({ rank: i + 1, name: r.name, frequency: r.freq, basis: r.bases.map((k) => BASES[k]).join(' | ') }));
}

/** Entries added after the first review (E2), as written in scripts/diseases-200/ ({ name, chile }) */
function additions() {
  const dir = require('path').join(__dirname, '..', 'diseases-200');
  return ['general', 'toxic-neuro-ortho', 'internal-onco', 'eye-skin']
    .flatMap((f) => require(require('path').join(dir, f)))
    .map((d) => ({ name: d.name, ...d.chile }));
}

/** The whole catalog in chile_rank order: the reviewed 150 plus the additions, each at the end of its
 *  tier unless it names an existing entry to go `before` */
function fullOrder() {
  const rows = finalOrder().map(({ name, frequency, basis }) => ({ name, frequency, basis }));
  for (const a of additions()) {
    const row = { name: a.name, frequency: a.frequency, basis: a.bases.map((k) => BASES[k]).join(' | ') };
    let at = a.before ? rows.findIndex((r) => r.name === a.before) : -1;
    if (a.before && at < 0) throw new Error(`"${a.name}": no existe "${a.before}" para ubicarla`);
    if (at < 0) {
      const tier = TIERS.indexOf(a.frequency);
      at = rows.findIndex((r) => TIERS.indexOf(r.frequency) > tier);
      if (at < 0) at = rows.length;
    }
    rows.splice(at, 0, row);
  }
  return rows.map((r, i) => ({ rank: i + 1, ...r }));
}

module.exports = { BASES, PROPOSAL, CORRECTIONS, finalOrder, additions, fullOrder };
