// Gastrotomía y enterotomía (id 5). Full depth: the foreign-body surgery of every clinic.
const { pick, ABDOMINAL_CLOSURE, CELIOTOMY_STEPS, SOURCES } = require('./_common');

module.exports = {
  id: 5,
  legacy: {
    indicaciones: 'Cuerpo extraño gástrico o intestinal que no se puede retirar por endoscopia ni avanza; cuerpo extraño lineal; biopsia de pared gástrica o intestinal de espesor completo.',
    tecnica_quirurgica: 'Celiotomía media completa y exploración de todo el tubo digestivo. Gastrotomía: exteriorizar el estómago, puntos de sostén, aislar con compresas, incisión en la cara ventral del cuerpo entre las curvaturas, extraer el cuerpo extraño y cerrar en dos capas. Enterotomía: incisión longitudinal en el borde antimesentérico sobre tejido sano distal al cuerpo extraño, extracción y cierre en una capa aposicional de puntos simples o continuo. Prueba de fugas, omentalización, lavado y cambio de guantes e instrumental.',
    material_quirurgico: 'Instrumental de laparotomía, separador de Balfour, pinzas Babcock y Doyen (atraumáticas), compresas húmedas, aspirador, jeringa de 10–20 mL con aguja 25 G para la prueba de fugas, solución salina tibia, segundo juego de instrumental y guantes para el cierre.',
    tipo_sutura: 'Estómago: PDS o Monocryl 3-0, dos capas (continuo simple de espesor completo seguido de Cushing o Lembert). Intestino: PDS o Monocryl 3-0 o 4-0 con aguja ahusada, una capa aposicional (simples interrumpidos o continuo simple). Pared abdominal según peso.',
    complicaciones_frecuentes: 'Dehiscencia intestinal y peritonitis séptica (la más grave, típicamente a los 3–5 días); íleo; vómitos; estenosis; perforaciones múltiples en cuerpos extraños lineales; neumonía por aspiración.',
    manejo_anestesico_sugerido: 'Estabilizar antes (fluidos, electrolitos). Maropitant y protector gástrico. Metadona ± midazolam en pacientes inestables; inducción con propofol o alfaxalona en secuencia rápida con intubación inmediata (riesgo de regurgitación). Cefazolina 22 mg/kg IV 30–60 min antes de incidir. Analgesia con opioide en infusión o en bolos; AINE solo si está normotenso y sin lesión digestiva extensa.',
    consideraciones_por_raza: 'Razas de pecho profundo (Gran Danés, Pastor alemán): considerar gastropexia preventiva si ya se está en el abdomen. Labradores y perros jóvenes: mayor incidencia de cuerpos extraños.',
    consideraciones_comorbilidades: 'Hipoalbuminemia (<2,5 g/dL) y peritonitis previa aumentan el riesgo de dehiscencia. Cuerpo extraño lineal en gatos: revisar debajo de la lengua. Necrosis intestinal: no basta la enterotomía, hace falta enterectomía.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), caps. 19 y 20; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Apertura del estómago o del intestino para sacar un cuerpo extraño o tomar biopsias. La técnica es sencilla; lo que define el resultado es explorar todo el tubo digestivo, cerrar sin fugas y no contaminar el abdomen.',
    meta: { species: ['perro', 'gato'], duration: '45–90 min', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Revisa debajo de la lengua (sobre todo en gatos) por si hay un hilo anclado: un cuerpo extraño lineal cambia la cirugía.',
      'Estabiliza antes de anestesiar: fluidos, potasio y cloro; el paciente que vomita llega con alcalosis hipoclorémica.',
      'Explora todo el tubo digestivo, del cardias al recto: puede haber más de un cuerpo extraño.',
      'Incide el intestino en tejido sano distal al cuerpo extraño, nunca sobre la zona dañada.',
      'Separa lo sucio de lo limpio: compresas, guantes e instrumental nuevos antes de cerrar el abdomen.',
    ],
    indications: [
      'Cuerpo extraño gástrico que no se puede retirar por endoscopia.',
      'Cuerpo extraño intestinal que obstruye o no avanza en 12–24 h.',
      'Cuerpo extraño lineal (casi siempre necesita varias enterotomías o una gastrotomía).',
      'Biopsia de espesor completo del estómago o el intestino.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Diagnóstico.', body: 'Radiografía de abdomen en dos proyecciones y ecografía. Signos de obstrucción: asas dilatadas con gas, patrón de dos poblaciones de asas, intestino plegado en acordeón (lineal).' },
              { title: 'Laboratorio.', body: 'Hemograma, bioquímica con albúmina, electrolitos y gases si es posible. Lactato si sospechas compromiso vascular.' },
              { title: 'Estabilización.', body: 'Corrige la deshidratación y los electrolitos (sobre todo potasio). Si hay perforación o peritonitis, no esperes demasiado: estabiliza y opera.' },
              { title: 'Antibiótico.', body: 'Cefazolina IV 30–60 minutos antes de incidir; repite cada 90 minutos. En peritonitis, antibiótico terapéutico de amplio espectro.' },
              { title: 'Endoscopia primero.', body: 'Si el cuerpo extraño está en el estómago y no es lineal ni cortante, intenta retirarlo por endoscopia antes de operar.' },
            ],
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'El riesgo anestésico propio es la regurgitación y la aspiración: inducción rápida, intubación inmediata y cuff inflado.',
        blocks: [
          { type: 'drugs', items: pick('maropitant', 'metadona', 'midazolam', 'propofol', 'alfaxalona', 'isoflurano', 'fentanilo', 'ketamina', 'cefazolina', 'lidocainaLocal', 'metadonaPost', 'buprenorfina') },
          { type: 'note', kind: 'error', title: 'AINE con cuidado', text: 'No des AINE a un paciente hipotenso, deshidratado o con lesión gástrica o intestinal extensa: aumenta el riesgo de úlcera y de daño renal. El opioide es la base del control del dolor.' },
        ],
      },
      {
        id: 'abordaje',
        title: 'Abordaje y exploración',
        blocks: [
          { type: 'steps', items: [...CELIOTOMY_STEPS, { title: 'Explora todo.', body: 'Estómago, duodeno, yeyuno, íleon, ciego y colon, palpando cada segmento entre los dedos. Revisa también el páncreas, el hígado y el mesenterio.' }, { title: 'Valora la viabilidad.', body: 'Asa viable: rosada o roja, con peristaltismo, pulso en los vasos mesentéricos y sangrado al cortar. Asa no viable (gris, negra, verde, delgada y sin pulso): enterectomía.' }] },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          {
            id: 'gastrotomia',
            title: 'A. Gastrotomía',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Exterioriza el estómago.', body: 'Coloca dos puntos de sostén en la cara ventral, entre la curvatura mayor y la menor, y eleva el estómago fuera del abdomen.' },
                  { title: 'Aísla.', body: 'Rodea el estómago con compresas húmedas para que el contenido no caiga a la cavidad.' },
                  { title: 'Incide.', body: 'En la cara ventral del cuerpo, en una zona poco vascularizada entre las dos curvaturas y lejos del píloro. Incisión punzante y amplía con tijera de Metzenbaum.' },
                  { title: 'Extrae.', body: 'Retira el cuerpo extraño con pinzas y aspira el contenido. Revisa el píloro y el duodeno proximal desde dentro.' },
                  { title: 'Cierra en dos capas.', body: 'Primera: continuo simple de espesor completo (o mucosa y submucosa). Segunda: Cushing o Lembert invaginando seromuscular.' },
                ],
              },
            ],
          },
          {
            id: 'enterotomia',
            title: 'B. Enterotomía',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Exterioriza el asa.', body: 'Saca el segmento afectado y aíslalo con compresas húmedas.' },
                  { title: 'Ocluye.', body: 'Pide al ayudante que ocluya la luz con los dedos (o pinzas Doyen) a ambos lados para que no salga contenido.' },
                  { title: 'Incide distal.', body: 'Incisión longitudinal en el borde antimesentérico, sobre el intestino sano inmediatamente distal al cuerpo extraño.' },
                  { title: 'Extrae.', body: 'Empuja el cuerpo extraño hacia la incisión ordeñando desde proximal; no tires de él.' },
                  { title: 'Recorta la mucosa evertida.', body: 'Si la mucosa sobresale, recórtala con Metzenbaum a ras de la serosa para que no interfiera con el cierre.' },
                  { title: 'Cierra.', body: 'Una capa aposicional de espesor completo: puntos simples separados 2–3 mm, a 2–3 mm del borde, o continuo simple. Si la luz es pequeña, cierra en sentido transversal para no estenosar.' },
                ],
              },
              { type: 'note', kind: 'why', title: 'Por qué una sola capa en el intestino', text: 'La submucosa es la capa que sostiene. Una sola capa aposicional que la incluye cicatriza más rápido y estenosa menos que dos capas invaginantes, que reducen la luz.' },
            ],
          },
          {
            id: 'lineal',
            title: 'C. Cuerpo extraño lineal',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Encuentra el ancla.', body: 'Suele estar debajo de la lengua (gatos) o en el píloro (perros). Corta el hilo bajo la lengua al inicio.' },
                  { title: 'Gastrotomía.', body: 'Si el ancla está en el estómago, ábrelo y libéralo primero.' },
                  { title: 'No tires.', body: 'El hilo sierra el borde mesentérico. Haz varias enterotomías pequeñas a lo largo del intestino plegado y saca el hilo por tramos.' },
                  { title: 'Revisa el borde mesentérico.', body: 'Busca perforaciones a lo largo de todo el segmento plegado; resécalas si están.' },
                ],
              },
              { type: 'note', kind: 'tip', title: 'Una alternativa', text: 'Se puede atar el hilo a un catéter de goma estéril introducido por la gastrotomía y ordeñarlo hacia distal, sacándolo por una sola enterotomía o por el ano.' },
            ],
          },
          {
            id: 'verificacion',
            title: 'D. Prueba de fugas y protección',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Prueba de fugas.', body: 'Ocluye la luz a ambos lados e inyecta solución salina con aguja 25 G hasta distender moderadamente; busca fugas entre los puntos y añade los que hagan falta.' },
                  { title: 'Omentaliza.', body: 'Envuelve la sutura con omento (o haz un parche de serosa con otra asa).' },
                  { title: 'Lava.', body: 'Lava la zona y el abdomen con solución salina tibia abundante y aspira.' },
                  { title: 'Cambia todo.', body: 'Retira compresas, cambia guantes e instrumental para cerrar.' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Alimentación temprana.', body: 'Ofrece comida blanda en las primeras 12–24 h, en cuanto el paciente esté despierto y sin vómitos. Comer pronto mejora la cicatrización intestinal.' },
              { title: 'Fluidos y electrolitos.', body: 'Hasta que coma y beba solo; controla el potasio.' },
              { title: 'Analgesia.', body: 'Opioide las primeras 24–48 h. Antiemético si hace falta.' },
              { title: 'Vigila la dehiscencia.', body: 'Días 3–5: fiebre, dolor abdominal, vómitos, decaimiento. Ecografía y citología de líquido abdominal (neutrófilos degenerados, bacterias, glucosa del líquido menor que la de la sangre).' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Factores de riesgo de dehiscencia', bullets: ['Peritonitis séptica antes de la cirugía.', 'Hipoalbuminemia.', 'Más de una enterotomía o enterectomía.', 'Cuerpo extraño presente por mucho tiempo.'] },
        ],
      },
    ],
    closure: [
      { layer: 'Estómago', suture: 'PDS o Monocryl', gauge: '3-0', pattern: 'Continuo simple de espesor completo + Cushing o Lembert', why: 'Pared gruesa y contenido ácido: dos capas aseguran el sellado.' },
      { layer: 'Intestino delgado', suture: 'PDS o Monocryl, aguja ahusada', gauge: '3-0 o 4-0', pattern: 'Una capa aposicional: simples o continuo simple', why: 'Incluye la submucosa sin reducir la luz.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Dehiscencia y peritonitis séptica', prevent: 'Incidir en tejido sano, buena técnica de cierre, prueba de fugas, omentalización, alimentación temprana.', manage: 'Reintervención inmediata, resección de la zona, lavado abundante y, a veces, abdomen abierto o drenaje activo.' },
      { name: 'Estenosis', prevent: 'Una capa aposicional; cierre transversal en luces pequeñas.', manage: 'Enterectomía del segmento estenosado.' },
      { name: 'Íleo', prevent: 'Manipulación suave, analgesia, alimentación temprana.', manage: 'Procinéticos (metoclopramida en infusión, lidocaína), corregir el potasio.' },
      { name: 'Neumonía por aspiración', prevent: 'Intubación rápida, cuff inflado, cabeza baja al extubar.', manage: 'Antibiótico, oxígeno, fisioterapia.' },
      { name: 'Cuerpo extraño olvidado', prevent: 'Explorar todo el tubo digestivo.', manage: 'Nueva cirugía.' },
    ],
    quiz: [
      { q: '¿Dónde incides el intestino para sacar un cuerpo extraño?', a: 'En el borde antimesentérico, sobre el tejido sano inmediatamente distal al cuerpo extraño.' },
      { q: '¿Por qué el estómago se cierra en dos capas y el intestino en una?', a: 'La pared gástrica es gruesa y tolera la invaginación; en el intestino una capa aposicional que incluye la submucosa sella bien sin estrechar la luz.' },
      { q: '¿Qué haces con un cuerpo extraño lineal?', a: 'Liberar el ancla (lengua o píloro), no tirar del hilo y sacarlo por varias enterotomías, revisando el borde mesentérico.' },
      { q: '¿Cuándo aparece la dehiscencia y cómo la confirmas?', a: 'Típicamente a los 3–5 días; con ecografía y citología del líquido abdominal (neutrófilos degenerados, bacterias, glucosa baja respecto de la sangre).' },
      { q: '¿Cómo reconoces un asa no viable?', a: 'Color gris, negro o verde, pared delgada, sin peristaltismo, sin pulso mesentérico y sin sangrado al cortar.' },
    ],
    videos: [
      { title: 'Time Lapse Enterotomy Dog Surgery', url: 'https://www.youtube.com/watch?v=ogoUFPC5hjE', channel: 'VETgirl', lang: 'inglés', note: 'Enterotomía por cuerpo extraño' },
      { title: 'Enterotomy & closure', url: 'https://www.youtube.com/watch?v=ml18-oV3DoY', channel: 'Stephen Birchard', lang: 'inglés', note: 'Cierre con continuo simple' },
      { title: 'Canine Gastrotomy, Removal of Foreign Body From Stomach', url: 'https://www.youtube.com/watch?v=XCfTAPOryis', channel: 'MellowYellow1800', lang: 'inglés', note: 'Gastrotomía' },
    ],
    sources: [
      SOURCES.fossum(20, 'cirugía del sistema digestivo'),
      SOURCES.fossum(19, 'cirugía de la cavidad abdominal'),
      { text: 'Ralphs SC y col. Factores de riesgo de dehiscencia tras cirugía intestinal en perros. JAVMA, 2003.', kind: 'complemento' },
      SOURCES.aaha,
      SOURCES.plumbs,
    ],
  },
};
