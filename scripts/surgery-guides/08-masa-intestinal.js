// Resección en masa intestinal (id 8). Medium depth: oncologic enterectomy; the anastomosis is in guide 7.
const { pick, ABDOMINAL_CLOSURE, SOURCES } = require('./_common');

module.exports = {
  id: 8,
  legacy: {
    indicaciones: 'Masa intestinal focal: adenocarcinoma, leiomiosarcoma, GIST, linfoma focal que obstruye o perfora, pólipos adenomatosos; granulomas (pitiosis en zonas endémicas); masa que causa obstrucción o hemorragia.',
    tecnica_quirurgica: 'Estadificación previa. Celiotomía y exploración completa con biopsia de hígado y de linfonodos mesentéricos. Resección en bloque de la masa con 4–8 cm de intestino sano a cada lado y la porción de mesenterio con su drenaje linfático, sin manipular el tumor. Anastomosis término-terminal en una capa. Cambio de guantes e instrumental tras la resección.',
    material_quirurgico: 'Instrumental de laparotomía, pinzas Doyen y Carmalt, compresas, separador de Balfour, recipientes con formol separados para la masa, los linfonodos y el hígado. Opcional: grapadora GIA y TA.',
    tipo_sutura: 'Anastomosis: PDS o Monocryl 3-0 o 4-0, una capa aposicional. Vasos: 3-0 absorbible. Biopsias hepáticas: 3-0 o 4-0 absorbible (técnica de guillotina).',
    complicaciones_frecuentes: 'Dehiscencia y peritonitis (más riesgo con hipoalbuminemia y tumores que infiltran la pared); recidiva local; metástasis; estenosis.',
    manejo_anestesico_sugerido: 'Igual que enterectomía: estabilización, intubación rápida, cefazolina IV prequirúrgica, opioide en infusión con lidocaína o ketamina. Pacientes anémicos por sangrado tumoral: valorar transfusión antes.',
    consideraciones_por_raza: 'Perros: adenocarcinoma más frecuente en machos de edad media a avanzada (Collie, Pastor alemán). Gatos: linfoma, adenocarcinoma (Siamés) y mastocitoma intestinal.',
    consideraciones_comorbilidades: 'Linfoma difuso o de células pequeñas en gatos: el tratamiento es médico, no quirúrgico; la cirugía solo si obstruye o perfora. Anemia y melena por sangrado crónico.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 20; Withrow & MacEwen\'s Small Animal Clinical Oncology, 6.ª ed.',
  },
  guide: {
    draft: true,
    lede: 'Enterectomía con criterio oncológico: se extirpa la masa en bloque con márgenes amplios y su drenaje linfático, se toman muestras para estadificar y se une el intestino como en cualquier anastomosis.',
    meta: { species: ['perro', 'gato'], duration: '75–120 min', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Estadifica antes: radiografía de tórax en tres proyecciones y ecografía abdominal; citología de la masa si es accesible.',
      'En gatos, descarta un linfoma difuso: si no obstruye ni perfora, el tratamiento es médico.',
      'Márgenes de 4–8 cm de intestino sano a cada lado y el mesenterio correspondiente.',
      'Toca el tumor lo menos posible y cambia guantes e instrumental después de la resección.',
      'Toma biopsia de los linfonodos mesentéricos y del hígado aunque se vean normales.',
    ],
    indications: [
      'Masa intestinal focal con o sin obstrucción (adenocarcinoma, leiomiosarcoma, GIST, linfoma focal).',
      'Pólipos adenomatosos y granulomas.',
      'Hemorragia digestiva crónica por un tumor.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Estadificación y preparación',
        blocks: [
          { type: 'steps', items: [
            { title: 'Imágenes.', body: 'Radiografía de tórax en tres proyecciones, ecografía abdominal (pérdida de las capas de la pared, linfonodos, hígado, carcinomatosis). TC si está disponible.' },
            { title: 'Citología o biopsia.', body: 'Citología ecoguiada de la masa y los linfonodos: un linfoma puede cambiar el plan.' },
            { title: 'Laboratorio.', body: 'Hemograma (anemia por sangrado), albúmina, coagulación.' },
            { title: 'Plan.', body: 'Si hay metástasis múltiples, la cirugía solo es paliativa (obstrucción o perforación).' },
          ] },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        blocks: [{ type: 'drugs', items: pick('maropitant', 'metadona', 'midazolam', 'fentanilo', 'propofol', 'isoflurano', 'ketamina', 'cefazolina', 'metadonaPost') }],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [
          { type: 'steps', items: [
            { title: 'Explora.', body: 'Celiotomía amplia y exploración de todo el abdomen: hígado, bazo, linfonodos, peritoneo, todo el intestino.' },
            { title: 'Muestras de estadificación.', body: 'Biopsia de los linfonodos mesentéricos (extirpa uno entero si está aumentado) y del hígado con técnica de guillotina. Formol en frascos separados.' },
            { title: 'Aísla el segmento.', body: 'Exterioriza y rodea con compresas sin manipular la masa.' },
            { title: 'Márgenes.', body: 'Marca 4–8 cm de intestino sano a cada lado del borde palpable del tumor.' },
            { title: 'Mesenterio en bloque.', body: 'Liga los vasos yeyunales que irrigan el segmento y extirpa la cuña de mesenterio correspondiente con sus linfáticos.' },
            { title: 'Reseca.', body: 'Pinzas aplastantes en la pieza, atraumáticas en el intestino que queda, y corte.' },
            { title: 'Anastomosis.', body: 'Término-terminal en una capa aposicional (ver la guía de enterectomía): mesentérico, antimesentérico, caras, prueba de fugas, omento.' },
            { title: 'Cambia guantes e instrumental.', body: 'Antes de lavar y cerrar, para no implantar células tumorales en la herida.' },
            { title: 'Identifica las muestras.', body: 'Marca con hilo los extremos proximal y distal de la pieza para que el patólogo evalúe los márgenes.' },
          ] },
          { type: 'note', kind: 'book', title: 'Pronóstico orientativo', bullets: ['Leiomiosarcoma y GIST sin metástasis: supervivencias largas tras la resección completa.', 'Adenocarcinoma: peor si hay linfonodos o metástasis positivos.', 'Linfoma focal en gatos: la cirugía se acompaña de quimioterapia.'] },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [
          { type: 'steps', items: [
            { title: 'Como cualquier enterectomía.', body: 'Alimentación temprana, analgesia, fluidos y vigilancia de dehiscencia los días 3–5.' },
            { title: 'Oncología.', body: 'Con la histopatología, decide quimioterapia y seguimiento (radiografía de tórax y ecografía cada 3 meses el primer año).' },
          ] },
        ],
      },
    ],
    closure: [
      { layer: 'Anastomosis', suture: 'PDS o Monocryl, aguja ahusada', gauge: '3-0 o 4-0', pattern: 'Una capa aposicional', why: 'Igual que en la enterectomía.' },
      { layer: 'Biopsia hepática', suture: 'PDS o Monocryl', gauge: '3-0 o 4-0', pattern: 'Guillotina', why: 'Hemostasia del borde hepático sin sutura del parénquima.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Dehiscencia', prevent: 'Márgenes sanos, buena técnica, albúmina corregida.', manage: 'Reintervención y lavado.' },
      { name: 'Recidiva local', prevent: 'Márgenes de 4–8 cm y mesenterio en bloque.', manage: 'Nueva resección o tratamiento oncológico.' },
      { name: 'Implantación tumoral', prevent: 'No manipular el tumor, cambiar guantes e instrumental.', manage: 'Tratamiento oncológico.' },
    ],
    quiz: [
      { q: '¿Qué muestras tomas además de la masa?', a: 'Linfonodos mesentéricos y biopsia hepática, aunque se vean normales.' },
      { q: '¿Cuándo no operas una masa intestinal en un gato?', a: 'Si es un linfoma difuso o de células pequeñas sin obstrucción ni perforación: el tratamiento es médico.' },
      { q: '¿Qué márgenes dejas?', a: '4–8 cm de intestino sano a cada lado con el mesenterio correspondiente.' },
    ],
    videos: [
      { title: 'Intestinal resection and anastomosis', url: 'https://www.youtube.com/watch?v=ZzEdo43ZSxM', channel: 'Stanley Kim', lang: 'inglés', note: 'La técnica de resección y anastomosis' },
    ],
    sources: [
      SOURCES.fossum(20, 'cirugía del sistema digestivo (neoplasias intestinales)'),
      { text: 'Vail DM, Thamm DH, Liptak JM. Withrow & MacEwen\'s Small Animal Clinical Oncology, 6.ª ed. Elsevier, 2020. Tumores del tracto gastrointestinal.', kind: 'libro' },
      SOURCES.plumbs,
    ],
  },
};
