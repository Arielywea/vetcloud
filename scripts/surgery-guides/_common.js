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

const ABDOMINAL_CLOSURE = [
  { layer: 'Línea alba (vaina externa del recto)', suture: 'PDS', gauge: 'Gato y <10 kg: 3-0 a 2-0 · 10–25 kg: 2-0 a 0 · >25 kg: 0 a 1', pattern: 'Continuo simple', why: 'Capa que sostiene; absorbible de larga duración porque la fascia recupera fuerza lentamente.' },
  { layer: 'Subcutáneo', suture: 'Monocryl', gauge: '3-0 o 4-0', pattern: 'Continuo simple', why: 'Cierra el espacio muerto y reduce el seroma.' },
  { layer: 'Piel', suture: 'Monocryl (intradérmico) o nylon', gauge: '4-0 o 3-0', pattern: 'Intradérmico, o simples o en X', why: 'El intradérmico no requiere retirar puntos.' },
];

const CELIOTOMY_STEPS = [
  { title: 'Posición y campo.', body: 'Decúbito dorsal; prepara de xifoides a pubis y ancho hasta los flancos, para poder ampliar la incisión.' },
  { title: 'Incisión.', body: 'Línea media ventral, de largo suficiente para explorar todo el abdomen si la causa no está clara. En machos, desvía la incisión de piel junto al prepucio y liga la arteria y vena epigástricas superficiales caudales.' },
  { title: 'Entrada.', body: 'Levanta la línea alba en tienda e incide con el filo hacia arriba; amplía con tijera protegiendo las vísceras.' },
  { title: 'Exposición.', body: 'Separador de Balfour, compresas húmedas en los bordes y exploración sistemática de todo el abdomen antes de ir al órgano.' },
];

const SOURCES = {
  fossum: (cap, tema) => ({ text: `Fossum TW. Small Animal Surgery, 5.ª ed. Elsevier, 2019. Cap. ${cap}, ${tema}.`, kind: 'libro' }),
  tobias: (tema) => ({ text: `Johnston SA, Tobias KM. Veterinary Surgery: Small Animal, 2.ª ed. Elsevier, 2018. ${tema}.`, kind: 'libro' }),
  aaha: { text: 'Grubb T y col. AAHA Anesthesia and Monitoring Guidelines for Dogs and Cats, 2020.', kind: 'complemento' },
  wsava: { text: 'Monteiro B y col. WSAVA Guidelines for the Recognition, Assessment and Treatment of Pain, 2022.', kind: 'complemento' },
  plumbs: { text: 'Plumb\'s Veterinary Drug Handbook (dosis).', kind: 'complemento' },
};

module.exports = { DRUGS, pick, drug, ABDOMINAL_CLOSURE, CELIOTOMY_STEPS, SOURCES };
