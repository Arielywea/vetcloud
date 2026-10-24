// Hepatotomía y hepatectomía (id 9). Medium depth: biopsy, partial and complete lobectomy.
const { pick, drug, ABDOMINAL_CLOSURE, SOURCES } = require('./_common');

module.exports = {
  id: 9,
  legacy: {
    indicaciones: 'Biopsia hepática; masa hepática solitaria (adenoma, carcinoma hepatocelular masivo); absceso o quiste; torsión de lóbulo; trauma con hemorragia que no cede.',
    tecnica_quirurgica: 'Celiotomía media craneal extendida hasta el xifoides. Biopsia: guillotina en el borde de un lóbulo o punch de 4–6 mm. Lobectomía parcial: aplastamiento del parénquima con los dedos o con pinzas y ligadura de vasos y conductos expuestos, o grapadora TA. Lobectomía completa: disección del hilio y ligadura transfixiante del lóbulo en bloque o de la vena, arteria y conducto por separado; grapadora en perros grandes. Revisión de hemostasia y omentalización.',
    material_quirurgico: 'Instrumental de laparotomía, separador de Balfour, pinzas Satinsky o Carmalt, grapadora TA 30–55 con grapas vasculares, sellador de vasos, hemostáticos tópicos (esponja de gelatina), compresas, aspirador, sangre disponible para transfusión.',
    tipo_sutura: 'Guillotina y ligaduras: PDS o Monocryl 3-0 (2-0 en lóbulos grandes). Ligadura transfixiante del hilio: 2-0 o 0 absorbible. Pared abdominal según peso.',
    complicaciones_frecuentes: 'Hemorragia (la más importante); fuga biliar; hipoglucemia y coagulopatía en insuficiencia hepática; trombosis portal; hipotermia.',
    manejo_anestesico_sugerido: 'Fármacos de metabolismo hepático mínimo o reversibles: fentanilo o metadona, propofol o alfaxalona titulados, isoflurano o sevoflurano. Evitar acepromacina y AINE en hepatopatía. Medir glucosa y tiempo de coagulación. Plasma o sangre disponibles.',
    consideraciones_por_raza: 'Labrador y Dóberman con hepatitis crónica; Yorkshire con shunt portosistémico (no se trata con lobectomía). Razas con más carcinoma hepatocelular: machos de edad avanzada.',
    consideraciones_comorbilidades: 'Coagulopatía: plasma fresco congelado y vitamina K1 antes. Hipoalbuminemia: más riesgo de dehiscencia y ascitis. Encefalopatía hepática: evitar benzodiazepinas.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 21; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Desde la biopsia del borde de un lóbulo hasta la extirpación de un lóbulo entero. El hígado sangra con facilidad y tolera mal la isquemia: la técnica busca hemostasia segura con el mínimo tiempo de manipulación.',
    meta: { species: ['perro', 'gato'], duration: '30–120 min (según la técnica)', difficulty: 'avanzada', contamination: 'limpia' },
    before_you_start: [
      'Mide la coagulación (TP, TTPa, plaquetas) y corrígela antes: plasma fresco congelado y vitamina K1.',
      'Ten sangre o plasma disponible y una vía venosa gruesa.',
      'Usa fármacos de metabolismo hepático mínimo o reversibles y vigila la glucosa durante la cirugía.',
      'Prepara grapadora o sellador de vasos para lóbulos grandes: la sutura manual del hilio en perros grandes es lenta y sangra.',
      'Revisa la vesícula y el conducto biliar común antes y después de cualquier lobectomía.',
    ],
    indications: [
      'Biopsia hepática para diagnóstico.',
      'Masa solitaria: adenoma, carcinoma hepatocelular masivo, quiste o absceso.',
      'Torsión de un lóbulo hepático.',
      'Trauma con hemorragia que no responde a tratamiento médico.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio y anestesia',
        blocks: [
          { type: 'steps', items: [
            { title: 'Laboratorio.', body: 'Hemograma, bioquímica con ácidos biliares y amoníaco si hay sospecha de insuficiencia, glucosa, albúmina y coagulación.' },
            { title: 'Imágenes.', body: 'Ecografía y, en masas grandes, TC para saber qué lóbulo es y su relación con la cava y la vena porta.' },
            { title: 'Corrige.', body: 'Vitamina K1 1–2 mg/kg SC 24–48 h antes si la coagulación está alterada; plasma fresco congelado 10–15 mL/kg si sigue prolongada.' },
          ] },
          { type: 'drugs', items: [...pick('metadona', 'fentanilo', 'propofol', 'alfaxalona', 'isoflurano', 'cefazolina', 'lidocainaLocal'), drug('Soporte', 'Glucosa', 'Infusión al 2,5–5 %', 'IV', 'Si la glucosa baja de 70 mg/dL.'), ...pick('metadonaPost', 'buprenorfina')] },
          { type: 'note', kind: 'error', title: 'Evitar en hepatopatía', bullets: ['Acepromacina y benzodiazepinas en encefalopatía.', 'AINE: riesgo de toxicidad hepática y sangrado.', 'Hipotermia: empeora la coagulación; calienta activamente.'] },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [{ type: 'list', items: [
          'Seis lóbulos: lateral izquierdo, medial izquierdo, cuadrado, medial derecho, lateral derecho y caudado (procesos caudado y papilar).',
          'Los lóbulos izquierdos tienen un hilio estrecho y son los más fáciles de extirpar; los derechos y el caudado están adheridos a la vena cava caudal.',
          'La vesícula biliar está entre el cuadrado y el medial derecho.',
          'Cada lóbulo recibe una rama de la porta y de la arteria hepática, y drena por venas hepáticas directamente a la cava.',
        ] }],
      },
      {
        id: 'tecnica',
        title: 'Técnicas paso a paso',
        blocks: [],
        subsections: [
          { id: 'biopsia', title: 'A. Biopsia en guillotina', blocks: [{ type: 'steps', items: [
            { title: 'Elige el borde.', body: 'Borde afilado de un lóbulo, lejos del hilio.' },
            { title: 'Lazada.', body: 'Pasa una lazada de absorbible 3-0 alrededor de la punta del lóbulo, a 1 cm del borde.' },
            { title: 'Aprieta.', body: 'Ajusta despacio: el hilo corta el parénquima y liga los vasos.' },
            { title: 'Corta.', body: 'Corta el tejido 2–3 mm distal a la ligadura y revisa que no sangre.' },
          ] }] },
          { id: 'parcial', title: 'B. Lobectomía parcial', blocks: [{ type: 'steps', items: [
            { title: 'Línea de resección.', body: 'Marca la línea en tejido sano proximal a la lesión.' },
            { title: 'Aplasta.', body: 'Comprime el parénquima con los dedos o con pinzas a lo largo de la línea, dejando expuestos los vasos y conductos.' },
            { title: 'Liga.', body: 'Liga cada vaso o conducto expuesto con 3-0 absorbible y corta distal.' },
            { title: 'O con grapadora.', body: 'Coloca la grapadora TA a lo largo de la línea, dispara y corta distal a las grapas.' },
            { title: 'Hemostasia.', body: 'Compresión, hemostático tópico u omento sobre la superficie de corte.' },
          ] }] },
          { id: 'completa', title: 'C. Lobectomía completa', blocks: [{ type: 'steps', items: [
            { title: 'Libera el lóbulo.', body: 'Corta los ligamentos triangulares y la adherencia al diafragma; separa el lóbulo de los vecinos.' },
            { title: 'Identifica el hilio.', body: 'Disección roma para ver la vena hepática, la rama portal, la arteria y el conducto biliar del lóbulo.' },
            { title: 'Liga.', body: 'Lóbulos izquierdos pequeños: ligadura transfixiante en bloque del hilio con 2-0 o 0 absorbible, más una circunferencial. Lóbulos derechos o grandes: ligadura individual de cada estructura o grapadora vascular.' },
            { title: 'Corta y revisa.', body: 'Corta distal a la ligadura dejando muñón suficiente; revisa la cava y el hilio con el abdomen lleno de solución salina para ver burbujas o sangrado.' },
          ] }, { type: 'note', kind: 'error', title: 'Lóbulos derechos y caudado', text: 'Están pegados a la vena cava caudal: una tracción excesiva la desgarra. Si no tienes experiencia ni grapadora, deriva.' }] },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [{ type: 'steps', items: [
          { title: 'Primeras 24 h.', body: 'Hematocrito cada 4–6 h, presión, glucosa y temperatura.' },
          { title: 'Analgesia.', body: 'Opioide; sin AINE en hepatopatía.' },
          { title: 'Fuga biliar.', body: 'Ictericia, dolor y líquido abdominal con bilirrubina mayor que la sérica: reintervención.' },
        ] }],
      },
    ],
    closure: [
      { layer: 'Biopsia en guillotina', suture: 'PDS o Monocryl', gauge: '3-0', pattern: 'Lazada que corta el parénquima', why: 'Liga y corta a la vez; sin sutura del parénquima.' },
      { layer: 'Hilio lobular', suture: 'PDS o Monocryl, o grapas', gauge: '2-0 o 0', pattern: 'Transfixiante + circunferencial, o grapadora vascular', why: 'El hilio contiene vasos grandes de baja presión que se retraen.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Hemorragia', prevent: 'Corregir coagulación, ligaduras seguras, grapadora en lóbulos grandes.', manage: 'Transfusión, compresión, reintervención.' },
      { name: 'Fuga biliar', prevent: 'Ligar los conductos del hilio; revisar la vesícula.', manage: 'Reintervención y lavado.' },
      { name: 'Hipoglucemia', prevent: 'Medir y suplementar glucosa.', manage: 'Glucosa IV.' },
      { name: 'Desgarro de la cava', prevent: 'Tracción suave, derivar lóbulos derechos complejos.', manage: 'Presión digital y sutura vascular; riesgo vital.' },
    ],
    quiz: [
      { q: '¿Qué corriges antes de operar el hígado?', a: 'La coagulación (vitamina K1 y plasma), la glucosa y la temperatura.' },
      { q: '¿Qué lóbulos son más fáciles de extirpar?', a: 'Los izquierdos, por su hilio estrecho; los derechos y el caudado están pegados a la cava.' },
      { q: '¿Cómo funciona la biopsia en guillotina?', a: 'Una lazada que, al apretarla, corta el parénquima y liga los vasos del borde del lóbulo.' },
    ],
    videos: [
      { title: 'ICG-guided liver lobectomy in a dog', url: 'https://www.youtube.com/watch?v=31-QydopYaI', channel: 'Federico Massari, Dipl. ECVS', lang: 'inglés', note: 'Lobectomía de los lóbulos izquierdos por tumor' },
      { title: 'Surgical removal of a liver tumor: Hepatocellular Carcinoma', url: 'https://www.youtube.com/watch?v=j0SPDe0u3Ls', channel: 'The Cancer Vet Clinic', lang: 'inglés', note: 'Caso completo con TC' },
    ],
    sources: [
      SOURCES.fossum(21, 'cirugía del sistema hepatobiliar'),
      SOURCES.aaha,
      SOURCES.plumbs,
    ],
  },
};
