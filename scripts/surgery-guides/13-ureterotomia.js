// Ureterotomía y ureteroneocistostomía (id 13). Medium depth: specialist surgery, kept to the essentials.
const { pick, ABDOMINAL_CLOSURE, SOURCES } = require('./_common');

module.exports = {
  id: 13,
  legacy: {
    indicaciones: 'Obstrucción ureteral por urolitos (sobre todo oxalato de calcio en gatos), estenosis, trauma o ligadura accidental; uréter ectópico (ureteroneocistostomía). Hoy el bypass ureteral subcutáneo (SUB) o el stent son alternativas preferidas en gatos.',
    tecnica_quirurgica: 'Celiotomía media completa. Ureterotomía: incisión longitudinal sobre el urolito o proximal a él, con magnificación, extracción y cierre con puntos simples de 6-0 a 8-0. Ureteroneocistostomía: sección del uréter distal a la lesión y reimplante en el vértice de la vejiga con técnica extravesical o intravesical, sutura mucosa-mucosa con 6-0 a 8-0. Psoas hitch si hay tensión. Stent o nefrostomía temporal según el caso.',
    material_quirurgico: 'Magnificación (lupas 3,5–4,5x o microscopio), microinstrumental (portaagujas y pinzas de microcirugía, tijeras de Castroviejo), catéter de 22–24 G o sonda 2,5 Fr para el uréter, retractores finos, suturas 6-0 a 8-0.',
    tipo_sutura: 'Uréter: PDS o Monocryl 6-0 a 8-0, puntos simples. Neocistostomía: 6-0 a 7-0 mucosa-mucosa más seromuscular de la vejiga 4-0. Vejiga: 4-0 continuo simple.',
    complicaciones_frecuentes: 'Fuga de orina y uroabdomen; estenosis en el sitio de la ureterotomía; reobstrucción por nuevos urolitos; edema que obstruye en los primeros días.',
    manejo_anestesico_sugerido: 'Paciente azotémico: estabilizar, fluidos medidos (riesgo de sobrecarga si hay anuria), corregir potasio. Opioide (fentanilo o metadona), inducción titulada, inhalatorio. Sin AINE. Monitoreo de presión estricto.',
    consideraciones_por_raza: 'Gatos (cualquier raza, más en Ragdoll, Birmano, Persa e Himalayo por oxalato) y perros pequeños. Uréter ectópico: Golden y Labrador retriever, Husky siberiano, Caniche, Terrier.',
    consideraciones_comorbilidades: 'Enfermedad renal crónica concurrente frecuente en gatos: pronóstico depende del riñón contralateral. Hiperpotasemia y sobrecarga de volumen.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 24; Berent AC, revisiones sobre obstrucción ureteral felina.',
  },
  guide: {
    draft: true,
    lede: 'Cirugía del uréter para quitar una obstrucción o reimplantarlo en la vejiga. Es microcirugía en un tubo de 1–2 mm: requiere magnificación y experiencia, y en muchos gatos hoy se prefiere un bypass ureteral o un stent.',
    meta: { species: ['perro', 'gato'], duration: '90–180 min', difficulty: 'avanzada', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Sin lupas o microscopio y microinstrumental, no la hagas: deriva o considera un bypass ureteral subcutáneo.',
      'Valora los dos riñones: si el contralateral no funciona, el éxito es vital y el riesgo anestésico mayor.',
      'Estabiliza la azotemia y el potasio, y mide la diuresis: la sobrecarga de líquidos en un gato anúrico es frecuente.',
      'Incide el uréter longitudinalmente y ciérralo sin tensión ni estenosis; si hay tensión, reimplanta.',
      'Radiografía o ecografía después para confirmar que no quedan urolitos en el uréter ni en la pelvis renal.',
    ],
    indications: [
      'Urolito ureteral que obstruye y no avanza con tratamiento médico.',
      'Estenosis ureteral o ligadura accidental (tras OVH).',
      'Trauma ureteral.',
      'Uréter ectópico (ureteroneocistostomía, o ablación láser por cistoscopia si es intramural).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Decisión y preparación',
        blocks: [
          { type: 'steps', items: [
            { title: 'Imágenes.', body: 'Ecografía (hidronefrosis, hidrouréter, urolitos) y radiografía. Pielografía anterógrada o TC si hace falta precisar.' },
            { title: 'Tratamiento médico primero.', body: '24–72 h de fluidos medidos, manitol o diuréticos y relajantes ureterales (prazosina, amitriptilina) si el paciente está estable: algunos urolitos avanzan.' },
            { title: 'Elige la técnica.', body: 'Ureterotomía (urolito proximal, uréter sano), ureteroneocistostomía (lesión distal), bypass ureteral subcutáneo o stent (gatos, urolitos múltiples, estenosis).' },
          ] },
          { type: 'note', kind: 'book', title: 'En gatos', text: 'El bypass ureteral subcutáneo tiene menos mortalidad perioperatoria que la ureterotomía clásica en series recientes; su desventaja es el costo y las complicaciones a largo plazo (obstrucción del dispositivo, infección).' },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia',
        blocks: [{ type: 'drugs', items: pick('metadona', 'fentanilo', 'midazolam', 'propofol', 'alfaxalona', 'isoflurano', 'cefazolina', 'metadonaPost', 'buprenorfina') }, { type: 'note', kind: 'error', title: 'Sin AINE', text: 'Paciente azotémico o con un solo riñón funcional: nada de AINE.' }],
      },
      {
        id: 'tecnica',
        title: 'Técnica (resumen)',
        blocks: [],
        subsections: [
          { id: 'ureterotomia', title: 'A. Ureterotomía', blocks: [{ type: 'steps', items: [
            { title: 'Expón el uréter.', body: 'Celiotomía completa; retrae el duodeno (derecho) o el colon (izquierdo) para ver el riñón y el uréter en el retroperitoneo.' },
            { title: 'Localiza el urolito.', body: 'Palpa el uréter dilatado proximal y el urolito. Diseca el retroperitoneo sobre él con cuidado de no dañar la irrigación longitudinal.' },
            { title: 'Incide.', body: 'Con magnificación, incisión longitudinal de 3–5 mm sobre el urolito o justo proximal (en uréter dilatado, más fácil de suturar).' },
            { title: 'Extrae y lava.', body: 'Saca el urolito y pasa un catéter fino hacia la vejiga y hacia la pelvis renal, lavando para sacar fragmentos.' },
            { title: 'Cierra.', body: 'Puntos simples de 6-0 a 8-0 separados, tomando todo el espesor, sin estenosar. En uréteres muy pequeños, cierre transversal.' },
            { title: 'Cubre.', body: 'Retroperitoneo o grasa sobre la sutura; omento si es posible.' },
          ] }] },
          { id: 'neocistostomia', title: 'B. Ureteroneocistostomía', blocks: [{ type: 'steps', items: [
            { title: 'Secciona.', body: 'Liga el uréter distal a la lesión y córtalo proximal; espatula el extremo (corte longitudinal de 2–3 mm) para agrandar la boca.' },
            { title: 'Abre la vejiga.', body: 'Cistotomía ventral; crea un túnel en la pared hasta la mucosa cerca del vértice dorsal.' },
            { title: 'Pasa el uréter.', body: 'Por el túnel hacia la luz de la vejiga, sin torsión.' },
            { title: 'Sutura mucosa-mucosa.', body: 'Puntos simples de 6-0 a 7-0 uniendo la mucosa del uréter a la de la vejiga.' },
            { title: 'Sin tensión.', body: 'Si la hay, fija la vejiga al psoas (psoas hitch) o al lado de la pared.' },
            { title: 'Cierra la vejiga.', body: 'Continuo simple 4-0.' },
          ] }] },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [{ type: 'steps', items: [
          { title: 'Diuresis y creatinina.', body: 'Producción de orina cada 4–6 h (sonda o pesaje de empapadores), creatinina y potasio cada 12–24 h.' },
          { title: 'Ecografía.', body: 'A las 24–48 h y antes del alta: tamaño de la pelvis renal, líquido libre.' },
          { title: 'Fuga.', body: 'Líquido abdominal con creatinina mayor que la sérica: uroabdomen; reintervención o stent.' },
          { title: 'Seguimiento.', body: 'Ecografía cada 3 meses; los gatos con oxalato recidivan con frecuencia.' },
        ] }],
      },
    ],
    closure: [
      { layer: 'Uréter', suture: 'PDS o Monocryl', gauge: '6-0 a 8-0', pattern: 'Puntos simples separados', why: 'Con magnificación; continuo estenosa un tubo tan fino.' },
      { layer: 'Neocistostomía', suture: 'PDS o Monocryl', gauge: '6-0 a 7-0', pattern: 'Mucosa-mucosa, puntos simples', why: 'La aposición de mucosas evita la estenosis.' },
      { layer: 'Vejiga', suture: 'PDS o Monocryl', gauge: '4-0', pattern: 'Continuo simple', why: 'Igual que en la cistotomía.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Uroabdomen', prevent: 'Sutura precisa con magnificación, sin tensión.', manage: 'Stent, nefrostomía o reintervención.' },
      { name: 'Estenosis', prevent: 'Incisión en uréter dilatado, puntos separados, espatular.', manage: 'Reimplante o bypass.' },
      { name: 'Reobstrucción', prevent: 'Lavar el uréter y la pelvis renal; prevención del oxalato.', manage: 'Bypass o stent.' },
      { name: 'Sobrecarga de volumen', prevent: 'Fluidos según la diuresis.', manage: 'Diuréticos, oxígeno.' },
    ],
    quiz: [
      { q: '¿Qué necesitas imprescindiblemente para operar un uréter?', a: 'Magnificación (lupas o microscopio), microinstrumental y suturas de 6-0 a 8-0.' },
      { q: '¿Dónde incides el uréter en una ureterotomía?', a: 'Sobre el urolito o justo proximal, donde el uréter está dilatado y es más fácil de suturar.' },
      { q: '¿Qué alternativa se prefiere hoy en muchos gatos?', a: 'El bypass ureteral subcutáneo o el stent ureteral.' },
    ],
    videos: [],
    sources: [
      SOURCES.fossum(24, 'cirugía del riñón y el uréter'),
      { text: 'Berent AC y col. Bypass ureteral subcutáneo en gatos con obstrucción ureteral. JAVMA, 2018.', kind: 'complemento' },
      SOURCES.plumbs,
    ],
  },
};
