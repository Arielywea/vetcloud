// Esplenectomía (id 10). Full depth: total and partial, hilar ligation, ruptured masses.
const { pick, drug, ABDOMINAL_CLOSURE, SOURCES } = require('./_common');

module.exports = {
  id: 10,
  legacy: {
    indicaciones: 'Masa esplénica (hemangiosarcoma, hemangioma, hematoma, hiperplasia nodular); hemoabdomen por rotura esplénica; torsión esplénica; trauma grave; infarto extenso; en algunos casos de anemia hemolítica o trombocitopenia inmunomediada refractaria.',
    tecnica_quirurgica: 'Celiotomía media desde el xifoides. Exteriorización del bazo con cuidado si hay masas friables. Ligadura de los vasos hiliares cerca del bazo, conservando las ramas gástricas cortas y la arteria gastroepiploica izquierda; o ligadura de la arteria y vena esplénicas proximales, distal a la rama pancreática. Doble ligadura o sellador de vasos. Esplenectomía parcial con aplastamiento y grapadora TA. Exploración del hígado, omento y mesenterio buscando metástasis; biopsia de hígado si hay nódulos.',
    material_quirurgico: 'Instrumental de laparotomía, separador de Balfour, pinzas Kelly y Carmalt, sellador de vasos o grapadora LDS, grapadora TA para parcial, compresas, aspirador, sangre disponible.',
    tipo_sutura: 'Vasos hiliares: PDS, Monocryl o Vicryl 3-0 (2-0 en perros grandes), doble ligadura. Vasos esplénicos principales: 2-0 o 0, transfixiante más circunferencial. Pared abdominal según peso.',
    complicaciones_frecuentes: 'Hemorragia; arritmias ventriculares (hasta 24–72 h); necrosis gástrica si se ligan las gástricas cortas en el origen; pancreatitis; coagulación intravascular diseminada; metástasis si era hemangiosarcoma.',
    manejo_anestesico_sugerido: 'Estabilización con fluidos y transfusión si hay hemoabdomen. Fentanilo o metadona, inducción con propofol o alfaxalona titulados (sin α2 ni acepromacina en pacientes inestables), isoflurano. ECG continuo; lidocaína en bolo e infusión para arritmias ventriculares.',
    consideraciones_por_raza: 'Pastor alemán, Golden y Labrador retriever: más hemangiosarcoma. Gran Danés y razas de pecho profundo: torsión esplénica, a veces con DVG.',
    consideraciones_comorbilidades: 'Hemoabdomen: autotransfusión o transfusión, presión arterial, lactato. Masa esplénica con nódulos hepáticos o pulmonares: pronóstico reservado. Valorar ecocardiografía (hemangiosarcoma auricular derecho).',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 23; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Extirpación total o parcial del bazo. Casi siempre es por una masa, a menudo rota y sangrando: la cirugía es técnicamente sencilla, pero el paciente puede estar en shock y desarrollar arritmias, así que la preparación cuenta tanto como la técnica.',
    meta: { species: ['perro', 'gato'], duration: '45–90 min', difficulty: 'intermedia', contamination: 'limpia' },
    before_you_start: [
      'Estabiliza un hemoabdomen antes de inducir: fluidos, transfusión si el hematocrito baja de 20 % o hay signos de shock.',
      'Busca metástasis antes: radiografía de tórax en tres proyecciones y ecografía de hígado; ecocardiografía si sospechas hemangiosarcoma.',
      'Liga los vasos cerca del bazo para conservar las gástricas cortas y la gastroepiploica izquierda.',
      'Monitoriza el ECG durante y hasta 72 h después: las arritmias ventriculares son frecuentes.',
      'Explora y biopsia el hígado y cualquier nódulo del omento o el mesenterio.',
    ],
    indications: [
      'Masa esplénica: hemangiosarcoma, hemangioma, hematoma, hiperplasia nodular, otros sarcomas.',
      'Hemoabdomen por rotura esplénica.',
      'Torsión esplénica aislada o con DVG.',
      'Trauma con laceración grave, infarto extenso.',
      'Algunas enfermedades inmunomediadas refractarias.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio y anestesia',
        blocks: [
          { type: 'steps', items: [
            { title: 'Estabiliza.', body: 'Bolos de cristaloides de 10–20 mL/kg, transfusión de sangre entera o glóbulos rojos si el hematocrito es bajo o hay hemorragia activa. Vendaje abdominal compresivo como medida temporal.' },
            { title: 'Laboratorio.', body: 'Hematocrito, proteínas, plaquetas, coagulación (CID frecuente en hemangiosarcoma), lactato.' },
            { title: 'Estadificación.', body: 'Radiografía de tórax, ecografía abdominal y ecocardiografía si es posible: el hemangiosarcoma metastatiza a hígado, pulmón y aurícula derecha.' },
            { title: 'Habla con el tutor.', body: 'Masa con hemoabdomen: cerca de dos tercios son malignas. Explica el pronóstico antes de operar.' },
          ] },
          { type: 'drugs', items: [...pick('metadona', 'fentanilo', 'midazolam', 'propofol', 'alfaxalona', 'isoflurano', 'cefazolina'), drug('Arritmias', 'Lidocaína', '2 mg/kg', 'IV, bolo lento', 'Hasta 8 mg/kg en total; luego infusión 0,05 mg/kg/min (50 µg/kg/min) si persisten. Solo perros.'), ...pick('metadonaPost', 'buprenorfina')] },
          { type: 'note', kind: 'error', title: 'En el paciente inestable', bullets: ['Sin acepromacina ni agonistas α2.', 'Inducción con dosis bajas tituladas; la hipotensión al abrir el abdomen es esperable al perder el efecto de tapón.', 'AINE solo cuando esté estable y sin coagulopatía.'] },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía vascular',
        blocks: [
          { type: 'list', items: [
            'La arteria esplénica nace de la celíaca, da una rama al páncreas izquierdo y luego se divide en ramas que entran al hilio a lo largo del bazo.',
            'Las arterias gástricas cortas salen de las ramas del hilio dorsal hacia el fundus; la gastroepiploica izquierda sale de la rama ventral hacia la curvatura mayor.',
            'Las venas acompañan a las arterias y drenan a la porta por la vena esplénica.',
            'Ligar las ramas hiliares cerca del bazo conserva la irrigación del estómago y del páncreas; ligar la arteria esplénica proximal a la rama pancreática pone en riesgo el páncreas.',
          ] },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          { id: 'total', title: 'A. Esplenectomía total', blocks: [{ type: 'steps', items: [
            { title: 'Celiotomía.', body: 'Desde el xifoides hasta caudal al ombligo; aspira la sangre del abdomen (puede recogerse para autotransfusión si no hay contaminación y no hay sospecha fuerte de tumor).' },
            { title: 'Exterioriza el bazo.', body: 'Con las manos, sin traccionar de la masa (puede romperse); libera adherencias de omento ligándolas.' },
            { title: 'Liga en el hilio.', body: 'Desde un polo al otro, doble ligadura de cada rama vascular cerca del parénquima y corte entre ellas. O sellador de vasos, que acorta mucho la cirugía.' },
            { title: 'Conserva las gástricas cortas.', body: 'En el polo dorsal, liga las ramas en el hilio, no sus orígenes.' },
            { title: 'Alternativa rápida.', body: 'En una hemorragia masiva, liga la arteria y la vena esplénicas en bloque distal a la rama pancreática, más las gástricas cortas, y extrae.' },
            { title: 'Revisa.', body: 'Hemostasia del omento y del hilio, páncreas sin lesión.' },
            { title: 'Explora y biopsia.', body: 'Hígado, omento, mesenterio y diafragma; biopsia de cualquier nódulo.' },
          ] }] },
          { id: 'parcial', title: 'B. Esplenectomía parcial', blocks: [{ type: 'steps', items: [
            { title: 'Indicación.', body: 'Lesión focal benigna o trauma en un polo, cuando interesa conservar el bazo.' },
            { title: 'Liga la zona.', body: 'Liga los vasos hiliares de la porción que se va a extirpar; la zona isquémica se oscurece y marca la línea.' },
            { title: 'Aplasta.', body: 'Comprime el parénquima con los dedos a lo largo de la línea y coloca dos pinzas.' },
            { title: 'Corta y sutura.', body: 'Corta entre las pinzas y cierra el borde con un continuo de colchonero y un continuo simple encima, o con grapadora TA.' },
          ] }] },
        ],
      },
      {
        id: 'muestras',
        title: 'Muestras para histopatología',
        blocks: [
          { type: 'steps', items: [
            { title: 'Toma varias zonas.', body: 'Si el bazo es grande, envía varias secciones del borde entre tejido sano y masa (el centro suele ser coágulo y necrosis).' },
            { title: 'Formol.', body: '10 veces el volumen; corta el bazo en tajadas para que se fije.' },
            { title: 'Hígado y nódulos aparte.', body: 'Cada muestra en su frasco, identificada.' },
          ] },
          { type: 'note', kind: 'why', title: 'Por qué el borde', text: 'Hematomas, hemangiomas y hemangiosarcomas pueden verse iguales; el diagnóstico depende de encontrar tejido tumoral viable, que está en la periferia de la masa.' },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio y pronóstico',
        blocks: [
          { type: 'steps', items: [
            { title: 'ECG.', body: 'Continuo o seriado 24–72 h. Trata con lidocaína si hay taquicardia ventricular sostenida o mayor de 160–180 lpm, o con pulso deficitario.' },
            { title: 'Hematocrito.', body: 'Cada 4–6 h las primeras 24 h.' },
            { title: 'Analgesia.', body: 'Opioide; AINE cuando esté estable.' },
            { title: 'Pronóstico.', body: 'Hemangiosarcoma: supervivencia media de 1–3 meses solo con cirugía, más con quimioterapia. Lesiones benignas: curativo.' },
          ] },
        ],
      },
    ],
    closure: [
      { layer: 'Ramas del hilio', suture: 'PDS, Monocryl o Vicryl (o sellador)', gauge: '3-0 (2-0 en perros grandes)', pattern: 'Doble ligadura circunferencial', why: 'Cerca del bazo para conservar las gástricas cortas y la gastroepiploica.' },
      { layer: 'Arteria y vena esplénicas en bloque', suture: 'PDS o Monocryl', gauge: '2-0 o 0', pattern: 'Transfixiante + circunferencial', why: 'Para hemorragias masivas; distal a la rama pancreática.' },
      { layer: 'Borde de esplenectomía parcial', suture: 'PDS o Monocryl, o grapadora TA', gauge: '3-0', pattern: 'Colchonero continuo + continuo simple', why: 'El parénquima esplénico es friable y necesita compresión.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Hemorragia', prevent: 'Doble ligadura o sellador, revisar el hilio y el omento.', manage: 'Transfusión, reintervención.' },
      { name: 'Arritmias ventriculares', prevent: 'Corregir hipovolemia, dolor, hipoxia y electrolitos.', manage: 'Lidocaína IV.' },
      { name: 'Necrosis gástrica', prevent: 'Ligar las gástricas cortas en el hilio, no en el origen.', manage: 'Gastrectomía parcial.' },
      { name: 'Pancreatitis', prevent: 'Ligar distal a la rama pancreática, manipular poco el páncreas.', manage: 'Soporte, analgesia, nutrición.' },
      { name: 'Coagulación intravascular diseminada', prevent: 'Detectarla antes; plasma.', manage: 'Plasma fresco congelado, tratar la causa.' },
    ],
    quiz: [
      { q: '¿Por qué ligas los vasos cerca del bazo?', a: 'Para conservar las arterias gástricas cortas y la gastroepiploica izquierda, que irrigan el estómago.' },
      { q: '¿Qué complicación vigilas 24–72 h después?', a: 'Las arritmias ventriculares; se tratan con lidocaína IV si son sostenidas o comprometen la perfusión.' },
      { q: '¿De dónde tomas la muestra de una masa esplénica?', a: 'Del borde entre la masa y el tejido sano, en varias zonas; el centro suele ser coágulo y necrosis.' },
      { q: '¿Qué estudios haces antes por una masa esplénica?', a: 'Radiografía de tórax, ecografía abdominal (hígado) y, si es posible, ecocardiografía para buscar hemangiosarcoma en la aurícula derecha.' },
    ],
    videos: [
      { title: 'Splenectomy', url: 'https://www.youtube.com/watch?v=zmPuR9tG34I', channel: 'Stanley Kim', lang: 'inglés', note: 'Esplenectomía total en modelo sintético' },
      { title: 'Splenic Mass Removal Using a Vessel Sealing Device', url: 'https://www.youtube.com/watch?v=_qbcqUiLiL0', channel: 'VetOvation', lang: 'inglés', note: 'Caso real con sellador de vasos' },
      { title: 'Laparoscopic Canine Splenectomy', url: 'https://www.youtube.com/watch?v=6QdUWdRoZ3s', channel: 'VetOvation y Dra. Elaine Holmes', lang: 'inglés', note: 'Variante laparoscópica' },
    ],
    sources: [
      SOURCES.fossum(23, 'cirugía del sistema hemolinfático (bazo)'),
      { text: 'Hammond TN, Pesillo-Crosby SA. Prevalencia de hemangiosarcoma en perros con masa esplénica y hemoabdomen. JAVMA, 2008.', kind: 'complemento' },
      { text: 'Wendelburg KM y col. Supervivencia en perros con hemangiosarcoma esplénico tratados con cirugía y quimioterapia. JAVMA, 2015.', kind: 'complemento' },
      SOURCES.aaha,
      SOURCES.plumbs,
    ],
  },
};
