// Pieces shared by several guides: the balanced anesthesia protocol, layered abdominal closure, sources.
// Each guide adds or removes drugs for its own case. Doses checked against Plumb's.

const drug = (phase, name, dose, route, note) => ({ phase, drug: name, dose, route, ...(note ? { note } : {}) });

const DRUGS = {
  metadona: drug('Premedicación', 'Metadona', '0,2–0,3 mg/kg', 'IM o IV', 'Opioide agonista puro de elección para cirugía dolorosa.'),
  dexmed: drug('Premedicación', 'Dexmedetomidina', '0,002–0,005 mg/kg', 'IM o IV', 'Equivale a 2–5 µg/kg. Solo en pacientes estables (ASA I–II).'),
  acepromacina: drug('Premedicación', 'Acepromacina', '0,01–0,03 mg/kg', 'IM', 'Evitar en hipovolemia o hipotensión.'),
  midazolam: drug('Premedicación', 'Midazolam', '0,2–0,3 mg/kg', 'IV o IM', 'Para pacientes inestables o geriátricos, en lugar del agonista α2.'),
  fentanilo: drug('Premedicación', 'Fentanilo', '0,002–0,005 mg/kg', 'IV', 'Bolo; luego infusión 0,002–0,01 mg/kg/h (2–10 µg/kg/h) en cirugías largas o dolorosas.'),
  propofol: drug('Inducción', 'Propofol', '2–4 mg/kg', 'IV lento, a efecto', 'Sin premedicación hace falta hasta 6 mg/kg.'),
  alfaxalona: drug('Inducción', 'Alfaxalona', '1–2 mg/kg', 'IV lento, a efecto'),
  isoflurano: drug('Mantenimiento', 'Isoflurano', '1,5–2 % en O2', 'Inhalatoria', 'Ajustar a la profundidad; la analgesia multimodal permite bajarlo.'),
  lidocainaLocal: drug('Local', 'Lidocaína', '2 mg/kg (máximo)', 'Infiltración incisional', 'En gatos, máximo 1 mg/kg.'),
  bupivacainaLocal: drug('Local', 'Bupivacaína', '1–2 mg/kg (máximo)', 'Infiltración o bloqueo', 'En gatos, máximo 1 mg/kg. Nunca IV.'),
  ketamina: drug('Intraoperatorio', 'Ketamina', '0,5 mg/kg', 'IV, bolo', 'Luego infusión 0,01 mg/kg/min (0,6 mg/kg/h) como coadyuvante analgésico.'),
  cefazolina: drug('Profilaxis', 'Cefazolina', '22 mg/kg', 'IV, 30–60 min antes de incidir', 'Repetir cada 90 min de cirugía. Solo cuando está indicada.'),
  maropitant: drug('Premedicación', 'Maropitant', '1 mg/kg', 'SC o IV lento', 'Antiemético; útil en cirugía digestiva.'),
  meloxicam: drug('Postoperatorio', 'Meloxicam', '0,2 mg/kg', 'SC, una vez', 'Luego 0,1 mg/kg VO cada 24 h. En gatos, 0,05–0,1 mg/kg dosis única. Solo normotenso, hidratado y con función renal normal.'),
  carprofeno: drug('Postoperatorio', 'Carprofeno', '4 mg/kg', 'SC o VO, cada 24 h', 'Solo perros.'),
  robenacoxib: drug('Postoperatorio', 'Robenacoxib', '2 mg/kg', 'SC, cada 24 h', 'Perros y gatos, hasta 3 días por vía SC.'),
  buprenorfina: drug('Postoperatorio', 'Buprenorfina', '0,01–0,02 mg/kg', 'IV, IM o transmucosa (gatos)', 'Cada 6–8 h para dolor leve a moderado.'),
  metadonaPost: drug('Postoperatorio', 'Metadona', '0,2–0,3 mg/kg', 'IV o IM, cada 4–6 h', 'Dolor moderado a intenso; según la escala de dolor.'),
};

const pick = (...keys) => keys.map((k) => DRUGS[k]);

// Fossum cap. 19, p. 517–518: the fascia is the holding layer; the peritoneum is not sutured
const ABDOMINAL_CLOSURE = [
  { layer: 'Línea alba (vaina externa del recto)', suture: 'PDS, Maxon, Monocryl o Biosyn', gauge: 'Gato y <10 kg: 3-0 a 2-0 · 10–25 kg: 2-0 a 0 · >25 kg: 0 a 1', pattern: 'Continuo simple (6–8 nudos en cada extremo) o simples a 5–10 mm, tomando 4–10 mm de fascia', why: 'La fascia es la capa que sostiene; sin peritoneo ni ligamento falciforme entre los bordes. Evitar no absorbibles (senos de sutura), catgut y alambre en continuos.' },
  { layer: 'Subcutáneo', suture: 'Monocryl', gauge: '3-0 o 4-0', pattern: 'Continuo simple', why: 'Cierra el espacio muerto y reduce el seroma.' },
  { layer: 'Piel', suture: 'Monocryl (intradérmico), nylon o grapas', gauge: '4-0 o 3-0', pattern: 'Intradérmico, o simples sin tensión', why: 'El intradérmico no requiere retirar puntos.' },
];

const CELIOTOMY_STEPS = [
  { title: 'Cuenta las gasas.', body: 'Antes de incidir y antes de cerrar, con gasas y compresas con marcador radiopaco.', cite: 'Fossum p. 516' },
  { title: 'Incisión.', body: 'Decúbito dorsal; línea media desde cerca del xifoides hasta el pubis, de largo suficiente para explorar todo el abdomen. En machos, fija el prepucio a un lado con una pinza de campo, curva la incisión de piel hacia el lado opuesto del pene y liga las ramas de la epigástrica superficial caudal en el extremo craneal del prepucio.', cite: 'Fossum p. 516' },
  { title: 'Entrada.', body: 'Expón la fascia externa del recto, levanta la pared en tienda e incide la línea alba con el bisturí. Palpa la cara interna por si hay adherencias y amplía con tijera.', cite: 'Fossum p. 516–517' },
  { title: 'Falciforme.', body: 'Despega o extirpa el ligamento falciforme si estorba la exposición craneal; pinza su extremo craneal y controla el sangrado antes de retirarlo.', cite: 'Fossum p. 516' },
  { title: 'Exposición.', body: 'Separador de Balfour y compresas húmedas para que los tejidos no se sequen.' },
  { title: 'Explora todo (Box 19.1).', body: 'Cuadrante craneal (diafragma, hígado, vesícula, estómago, píloro, duodeno, bazo, páncreas, porta y cava), cuadrante caudal (colon, vejiga, uretra, próstata o útero, anillos inguinales), todo el intestino con sus vasos y linfonodos, y las goteras: con el mesoduodeno a la izquierda se ve el riñón, la adrenal, el uréter y el ovario derechos; con el colon descendente a la derecha, los izquierdos.', cite: 'Fossum p. 517' },
];

const SOURCES = {
  fossum: (cap, tema) => ({ text: `Fossum TW. Small Animal Surgery, 5.ª ed. Elsevier, 2019. Cap. ${cap}, ${tema}.`, kind: 'libro' }),
  tobias: (tema) => ({ text: `Johnston SA, Tobias KM. Veterinary Surgery: Small Animal, 2.ª ed. Elsevier, 2018. ${tema}.`, kind: 'libro' }),
  aaha: { text: 'Grubb T y col. AAHA Anesthesia and Monitoring Guidelines for Dogs and Cats, 2020.', kind: 'complemento' },
  wsava: { text: 'Monteiro B y col. WSAVA Guidelines for the Recognition, Assessment and Treatment of Pain, 2022.', kind: 'complemento' },
  plumbs: { text: 'Plumb\'s Veterinary Drug Handbook (dosis).', kind: 'complemento' },
};

// Closing an abdomen that was opened onto a contaminated viscus (Fossum p. 517)
const CLEAN_CLOSURE_STEPS = [
  { title: 'Lava si hubo contaminación.', body: 'Abundante solución salina estéril tibia; no agregues povidona yodada al lavado (no mejora y en peritonitis inhibe la quimiotaxis de los macrófagos). Nunca a temperatura ambiente en un paciente anestesiado.', cite: 'Fossum p. 517' },
  { title: 'Aspira y revisa.', body: 'Retira el líquido y la sangre y comprueba que no quede material extraño.' },
  { title: 'Cuenta las gasas.', body: 'Compara con el conteo inicial.', cite: 'Fossum p. 517' },
  { title: 'Cambia guantes e instrumental.', body: 'Reemplaza lo contaminado por contenido gástrico o intestinal antes de cerrar la pared.' },
  { title: 'Cierra la pared.', body: 'Línea alba con continuo simple de absorbible fuerte (6–8 nudos en cada extremo) o puntos simples a 5–10 mm, tomando 4–10 mm de fascia a cada lado. No incluyas peritoneo ni falciforme. Subcutáneo continuo y piel sin tensión.', cite: 'Fossum p. 517–518' },
];

module.exports = { DRUGS, pick, drug, ABDOMINAL_CLOSURE, CELIOTOMY_STEPS, CLEAN_CLOSURE_STEPS, SOURCES };
