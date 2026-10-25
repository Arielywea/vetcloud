// Hepatotomía y hepatectomía (id 9). Rewritten from Fossum 5.ª ed., cap. 20 (tabla 20.1, pp. 541–549, 563–567).
const { drug, ABDOMINAL_CLOSURE, CELIOTOMY_STEPS, SOURCES } = require('./_common');

module.exports = {
  id: 9,
  legacy: {
    indicaciones: 'Biopsia hepática (enfermedad hepática clínica o alteraciones de laboratorio o imagen); lobectomía parcial en lesiones de parte de un lóbulo (fístula arteriovenosa periférica, neoplasia focal, absceso, trauma); lobectomía completa en lesiones focales de uno o dos lóbulos (laceraciones, fístulas AV, carcinoma hepatocelular masivo).',
    tecnica_quirurgica: 'Celiotomía media craneal (se puede abrir el esternón caudal). Biopsia en guillotina del borde, sacabocados de 6 mm o Tru-Cut. Lobectomía parcial: incidir la cápsula en la línea elegida, fracturar el parénquima con los dedos o el mango del bisturí, ligar los vasos grandes (o clips) y coagular los pequeños; o grapadora TA; o guillotinas superpuestas en perros pequeños y gatos. Lobectomía completa: lóbulos izquierdos en perros pequeños y gatos con una ligadura que rodea la base tras aplastar el parénquima cerca del hilio; lóbulos derechos y caudado con disección de la cava, ligadura individual de arteria, vía biliar, porta y venas hepáticas, dejando muñón; cintas alrededor de porta, celíaca, mesentérica craneal y cava para ocluir si hay hemorragia incontrolable.',
    material_quirurgico: 'Instrumental de laparotomía, separador de Balfour, sacabocados de Baker de 6 mm, aguja Tru-Cut de 14 G, clips hemostáticos, grapadora TA 30–90 y toracoabdominal, sellador de vasos o bisturí armónico, punta de aspiración de Poole, pinzas de Lahey, cinta umbilical y tubos de goma (torniquetes), esponja de gelatina absorbible, sangre o plasma disponibles.',
    tipo_sutura: 'Guillotina: 0 o 2-0 (catgut crómico o Vicryl). Lobectomía parcial: sutura con buena seguridad de nudo (por ejemplo seda) o absorbible. Vasos: absorbible; doble ligadura o sobrecostura de los grandes. Lazo preanudado de 0 de copolímero glicólido-láctico para lobectomía parcial en perros de hasta 50 kg.',
    complicaciones_frecuentes: 'Hemorragia (la más frecuente y grave, por ligaduras que se deslizan del tejido friable); peritonitis biliar si se perfora la vesícula o un conducto; sepsis anaerobia en tejido hipóxico; hipoglucemia e hipofosfatemia tras resecciones grandes; hipertensión portal, ascitis, fiebre, drenaje biliar persistente (13 % de complicaciones tras resecciones mayores); muestras inútiles si están aplastadas o fragmentadas.',
    manejo_anestesico_sugerido: 'Tabla 20.1: dosis bajas tituladas (menos unión a albúmina y aclaramiento); midazolam si está ansioso, opioide si no está deprimido; preoxigenar 3–5 min, propofol 2–6 mg/kg o etomidato con benzodiazepina; isoflurano o sevoflurano (mantienen el flujo arterial hepático) con fentanilo en infusión como opioide de elección y ketamina a dosis baja. Presión media 60–80 mmHg con vasopresores; dos vías en miembros anteriores, sangre y coloides disponibles; dextrosa si hay hipoglucemia. AINE contraindicados.',
    consideraciones_por_raza: 'Hepatopatías en Bedlington terrier, Dóberman, Cocker spaniel, West Highland, Dálmata, Skye terrier y Labrador (hepatitis crónica asociada a cobre, más en hembras). Los cortocircuitos portosistémicos no se tratan con lobectomía.',
    consideraciones_comorbilidades: 'Coagulopatía: plasma fresco congelado y vitamina K1; no biopsia percutánea con plaquetas <20.000/µL, sangrado de mucosas prolongado o lesiones muy vasculares o cavitarias. Ascitis: drenarla antes con cuidado (la extracción brusca causa hipotensión). Hematocrito <20 % (perros) o <18 % (gatos): transfusión. Protector gástrico (inhibidor de bomba de protones).',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 20, tabla 20.1 y pp. 541–549 y 563–567.',
  },
  guide: {
    draft: true,
    lede: 'Desde la biopsia del borde de un lóbulo hasta la extirpación de un lóbulo completo. El hígado es friable, tiene poco estroma y los vasos y conductos cortados se retraen en el parénquima, donde casi no se pueden ligar: la técnica busca hemostasia antes de cortar. A cambio, regenera tanto que tolera perder hasta el 80 % de su masa.',
    meta: { species: ['perro', 'gato'], duration: '30–120 min (según la técnica)', difficulty: 'avanzada', contamination: 'limpia' },
    before_you_start: [
      'Mide la coagulación y corrígela (vitamina K1, plasma fresco congelado); transfunde si el hematocrito es menor de 20 % en perros o 18 % en gatos.',
      'Ten sangre o plasma disponibles y dos vías venosas en los miembros anteriores.',
      'Usa dosis bajas y tituladas, fentanilo en infusión como opioide y nada de AINE; vigila la glucosa.',
      'Liga antes de cortar y deja siempre un muñón de tejido distal a cada ligadura para que no se deslice.',
      'En los lóbulos derechos y el caudado, pasa cintas alrededor de la porta, la celíaca, la mesentérica craneal y la cava antes de disecar, por si hay que ocluir de urgencia.',
    ],
    indications: [
      'Biopsia en enfermedad hepática clínica o con alteraciones de laboratorio o imagen compatibles (p. 544).',
      'Lobectomía parcial: lesión de parte de un lóbulo (fístula arteriovenosa periférica, neoplasia focal, absceso, trauma) (p. 546).',
      'Lobectomía completa: lesiones focales de uno o dos lóbulos (laceraciones, fístulas AV, carcinoma hepatocelular masivo) (p. 547).',
      'Laceraciones con hemorragia profusa o fracturas complejas que no ceden con la ligadura de la arteria hepática propia (p. 549).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Laboratorio (tabla 20.1).', body: 'Hematocrito, proteínas, electrolitos, urea, creatinina, glucosa y albúmina; según el caso, bilirrubina, ácidos biliares, proteína C, coagulación, gases y calcio si se transfundió.', cite: 'tabla 20.1' },
              { title: 'Imágenes.', body: 'Radiografía y ecografía abdominal; TC en masas grandes para saber qué lóbulo es y su relación con la cava y la porta.' },
              { title: 'Coagulación.', body: 'Plasma fresco congelado si hay coagulopatía; vitamina K1 24–48 h antes si el tiempo de protrombina está alargado.', cite: 'tabla 20.1' },
              { title: 'Ascitis.', body: 'Si está disneico o no tolera el decúbito dorsal, drena antes; en cirugía, la aspiración brusca causa hipotensión profunda por descompresión venosa.', cite: 'Fossum p. 542–543' },
              { title: 'Estómago.', body: 'Protector gástrico, de preferencia inhibidor de bomba de protones.', cite: 'tabla 20.1' },
              { title: 'Antibiótico (Box 20.1).', body: 'Profilaxis en hepatopatía grave para cualquier cirugía distinta de una biopsia simple: ampicilina 22 mg/kg IV, cefazolina 22 mg/kg IV, metronidazol 10–12 mg/kg IV o clindamicina. Evita los hepatotóxicos (doxiciclina, eritromicina). Metronidazol sobre 40–50 mg/kg/día da signos neurológicos.', cite: 'Fossum p. 543' },
            ],
          },
          {
            type: 'table',
            columns: ['Técnica de biopsia', 'Ventajas', 'Límites'],
            rows: [
              ['Aspirado con aguja fina', 'Barato; útil en linfoma difuso, infecciones y lipidosis felina', 'Concordancia baja con la histopatología'],
              ['Tru-Cut percutánea ecoguiada (14 G)', 'Sensible y específica en lesiones focales', 'Poco fiable en enfermedad difusa; la pistola automática puede matar gatos por reflejo vagal'],
              ['Laparoscópica (pinza de doble cuchara de 5 mm)', 'Unos 45 mg de tejido, varios lóbulos, alta en horas', 'Equipo y entrenamiento'],
              ['Quirúrgica (guillotina o sacabocados)', 'Inspección completa, hemostasia controlada', 'Laparotomía'],
            ],
            caption: 'Fossum p. 544–546. En enfermedad difusa, las muestras laparoscópicas o quirúrgicas son superiores a las percutáneas.',
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'Menos albúmina y menos aclaramiento: empieza con dosis bajas y titula. Los inhalatorios mantienen el flujo arterial hepático; a veces basta la mitad o tres cuartos de la CAM (p. 542).',
        blocks: [
          {
            type: 'drugs',
            items: [
              drug('Premedicación', 'Midazolam', '0,1–0,2 mg/kg', 'IV o IM', 'Solo si está ansioso; evitar sedantes en pacientes enfermos o deprimidos. Cuidado en la encefalopatía.'),
              drug('Premedicación', 'Metadona', '0,1–0,2 mg/kg', 'IV o IM', 'Dosis reducida, si no está deprimido. Alternativas de la tabla: hidromorfona 0,05–0,2 mg/kg, buprenorfina 0,005–0,01 mg/kg.'),
              drug('Preoxigenación', 'Oxígeno', '3–5 min', 'Mascarilla'),
              drug('Inducción', 'Propofol', '2–6 mg/kg', 'IV, titulado', 'O etomidato 0,5–1 mg/kg IV precedido de diazepam o midazolam 0,25 mg/kg.'),
              drug('Mantenimiento', 'Isoflurano o sevoflurano', 'CAM reducida', 'Inhalatoria', 'Sin halotano.'),
              drug('Intraoperatorio', 'Fentanilo', '0,001–0,005 mg/kg', 'IV, carga', 'Opioide de elección; luego infusión 2–15 µg/kg/h.'),
              drug('Intraoperatorio', 'Ketamina', '0,5 mg/kg', 'IV, carga', 'Luego 10 µg/kg/min; reduce el opioide necesario.'),
              drug('Soporte', 'Glucosa', 'Infusión al 2,5–5 %', 'IV', 'Si hay hipoglucemia.'),
              drug('Postoperatorio', 'Buprenorfina', '0,005–0,02 mg/kg', 'IV o IM cada 4–8 h', 'O transmucosa 0,01–0,02 mg/kg en gatos. AINE contraindicados.'),
            ],
          },
          { type: 'note', kind: 'error', title: 'Cuidados', bullets: ['Presión arterial media de 60–80 mmHg con fenilefrina, efedrina, dopamina, noradrenalina o vasopresina.', 'Evita lo que reduce el flujo hepático: hipotensión, dolor mal controlado, presiones de vía aérea altas.', 'Reemplaza la evaporación con cristaloides y la sangre con coloides; con hipoalbuminemia, coloides en vez de grandes bolos de cristaloides.', 'Oxígeno inspirado alto y extubación sin prisa; vigila 24–48 h por descompensación.'] },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          {
            type: 'list',
            items: [
              'Seis lóbulos: lateral izquierdo, medial izquierdo, cuadrado, medial derecho, lateral derecho y caudado (procesos caudado y papilar). La cara visceral toca el estómago, el duodeno, el páncreas y el riñón derecho (p. 543).',
              'Doble aporte: la porta (baja presión, cuatro quintos de la sangre, drena estómago, intestino, páncreas y bazo) y 2–5 arterias hepáticas propias (alta presión). El drenaje es por las venas hepáticas a la cava.',
              'La porta, los conductos biliares, la arteria, los linfáticos y los nervios van en el ligamento hepatoduodenal del omento menor. Cuidado con el colédoco al disecar cerca del píloro.',
              'Los lóbulos izquierdos mantienen su separación cerca del hilio más que los demás: se pueden quitar con una ligadura en la base en perros pequeños y gatos. Los derechos y el caudado están unidos a la cava.',
              'La vesícula está entre el cuadrado y el medial derecho; las vías biliares principales están a la derecha, por eso las biopsias con aguja se toman del lado izquierdo.',
            ],
          },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          { id: 'abordaje', title: 'A. Abordaje', blocks: [{ type: 'steps', items: [...CELIOTOMY_STEPS.slice(0, 3), { title: 'Exposición craneal.', body: 'Celiotomía media craneal; si hace falta más acceso, abre el esternón caudal.', cite: 'Fossum p. 544' }, ...CELIOTOMY_STEPS.slice(3)] }] },
          {
            id: 'biopsia',
            title: 'B. Biopsia quirúrgica',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Dónde.', body: 'Enfermedad difusa: el sitio más accesible (biopsia de borde). Focal: palpa todo el hígado buscando nódulos o cavidades y toma muestras representativas.', cite: 'Fossum p. 546' },
                  { title: 'Guillotina: lazada.', body: 'Pasa una lazada de 0 o 2-0 alrededor del borde saliente de un lóbulo (fig. 20.3A).', cite: 'Fossum p. 546' },
                  { title: 'Aprieta antes de anudar.', body: 'Tira hasta que el hilo atraviese el parénquima: al cortar el tejido blando liga los vasos y conductos. Luego anuda.', cite: 'Fossum p. 546' },
                  { title: 'Corta.', body: 'Con hoja afilada, unos 5 mm distal a la ligadura, dejando el muñón aplastado con el hilo.', cite: 'Fossum p. 546' },
                  { title: 'Manipula la muestra lo menos posible.', body: 'Sin pinzas (crean artefactos); usa el envoltorio de la sutura como tabla de corte. Una parte en formol, el resto para cultivo y citología.', cite: 'Fossum p. 546' },
                  { title: 'Hemostasia.', body: 'Si sigue sangrando, una lámina de esponja de gelatina absorbible.' },
                  { title: 'Lesión no marginal.', body: 'Sacabocados de Baker de 6 mm (incluye 6–8 tríadas portales) girando sin pasar de la mitad del espesor y separando el fondo con Metzenbaum; o Tru-Cut; o varias guillotinas superpuestas alrededor de la lesión (fig. 20.3B).', cite: 'Fossum p. 546' },
                ],
              },
            ],
          },
          {
            id: 'parcial',
            title: 'C. Lobectomía parcial',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Línea de separación.', body: 'Define el límite entre el parénquima normal y el que vas a quitar e incide la cápsula a lo largo de esa línea (fig. 20.4A).', cite: 'Fossum p. 546' },
                  { title: 'Fractura el parénquima.', body: 'Con los dedos o el extremo romo de un mango de Bard-Parker, para exponer los vasos (fig. 20.4B).', cite: 'Fossum p. 546' },
                  { title: 'Liga y coagula.', body: 'Liga los vasos grandes (o clips) y coagula los pequeños a medida que aparecen (fig. 20.4C).', cite: 'Fossum p. 546' },
                  { title: 'O grapa.', body: 'Grapadora TA 90, 55 o 30 en la base del lóbulo. Con prudencia: puede sangrar si las grapas no comprimen bien el tejido; en gatos, 14 de 18 necesitaron hemostasia adicional.', cite: 'Fossum p. 546' },
                  { title: 'Perros pequeños y gatos.', body: 'Varias guillotinas superpuestas a lo largo de toda la línea, incluyendo todo el ancho del parénquima (fig. 20.5).', cite: 'Fossum p. 546' },
                  { title: 'Alternativas.', body: 'En perros de hasta 50 kg, un lazo preanudado de 0, sellador de vasos o bisturí armónico; puede hacer falta ligar o poner clips adicionales.', cite: 'Fossum p. 546–547' },
                  { title: 'Corta y revisa.', body: 'Corta distal a las ligaduras o grapas y comprueba que la superficie cruenta esté seca antes de cerrar.', cite: 'Fossum p. 546' },
                ],
              },
            ],
          },
          {
            id: 'completa',
            title: 'D. Lobectomía completa',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Torniquetes de seguridad.', body: 'Para los lóbulos derechos y el caudado, pasa cinta umbilical por un tubo de goma alrededor de la porta, la celíaca, la mesentérica craneal y la cava, delante y detrás del hígado, para ocluir si hay hemorragia incontrolable.', cite: 'Fossum p. 547' },
                  { title: 'Izquierdos en perros pequeños y gatos.', body: 'Aplasta el parénquima cerca del hilio con los dedos o una pinza y coloca una ligadura que rodee la zona aplastada.', cite: 'Fossum p. 547' },
                  { title: 'Izquierdos en perros grandes, derechos y caudado.', body: 'Diseca el lóbulo de la cava si hace falta, aísla vasos y conductos cerca del hilio y lígalos; doble ligadura o sobrecostura de los vasos grandes.', cite: 'Fossum p. 547' },
                  { title: 'Orden.', body: 'Primero la arteria y el conducto biliar del lóbulo, luego la porta lobar y por último las venas hepáticas (ligadas o con grapadora toracoabdominal). La punta interna de una cánula de Poole sirve para separar el parénquima de las venas.', cite: 'Fossum p. 547' },
                  { title: 'Lateral izquierdo.', body: 'Liga y corta la arteria y el conducto; separa el lateral hacia afuera y el medial hacia adentro; liga y corta la porta lobar; separa el parénquima de la vena hepática, corta el ligamento triangular y liga la vena.', cite: 'Fossum p. 547–548' },
                  { title: 'Lateral derecho.', body: 'Duodeno y división central a la izquierda; ventana en el peritoneo; liga la porta, la arteria y el conducto lobares sin tocar la porta de la división central; la vena hepática se aborda por craneoventral.', cite: 'Fossum p. 549' },
                  { title: 'Caudado.', body: 'Por el ligamento hepatorrenal; liga la arteria y el conducto, luego la porta tras su salida de la porta derecha y la vena hepática craneal y dorsal a ella. El proceso papilar se aborda por la bolsa omental, evitando la porta izquierda que lo cruza.', cite: 'Fossum p. 549' },
                  { title: 'División central.', body: 'Con o sin colecistectomía: liga en bloque la porta, el conducto y la arteria del cuadrado y del medial derecho, separa el parénquima y liga la vena hepática derecha accesoria y la central. Si queda la vesícula, fíjala al diafragma o al medial izquierdo para que no se tuerza.', cite: 'Fossum p. 548–549' },
                  { title: 'Deja muñón.', body: 'Corta el parénquima distal a las ligaduras dejando un muñón para que el tejido no se retraiga y sangre.', cite: 'Fossum p. 547' },
                  { title: 'Revisa.', body: 'Llena el abdomen de salino y busca sangrado o burbujas en la cava y el hilio; revisa la vesícula y el colédoco.' },
                ],
              },
              { type: 'note', kind: 'error', title: 'Lóbulos derechos y caudado', text: 'Están pegados a la cava caudal: la tracción la desgarra. Si no tienes experiencia ni grapadora vascular, deriva.' },
              { type: 'note', kind: 'book', title: 'Laceraciones', text: 'Se suturan solo si sangran mucho y sin crear bolsillos de bilis o sangre ni isquemia. La ligadura de la arteria hepática propia es una medida de urgencia; si no basta, lobectomía (p. 549).' },
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
              { title: 'Recuperación lenta.', body: 'La vida media de algunos fármacos se alarga: vigila de cerca.', cite: 'Fossum p. 549' },
              { title: 'Líquidos.', body: 'Hasta que mantenga la hidratación, sin sobrehidratar al hipoalbuminémico.' },
              { title: 'Glucosa y fósforo.', body: 'La hipoglucemia transitoria es frecuente tras quitar mucho hígado; la hipofosfatemia puede requerir fosfato de potasio en los líquidos.', cite: 'Fossum p. 549' },
              { title: 'Albúmina.', body: 'Si baja de 2 g/dL o aumenta el líquido en tercer espacio: plasma, sangre entera o coloides.', cite: 'Fossum p. 549' },
              { title: 'Hematocrito y coagulación.', body: 'Hematocrito seriado; tiempos de coagulación si hay sangrado o petequias.' },
              { title: 'Antibióticos.', body: 'Continuar 2–3 días tras una lobectomía parcial.', cite: 'Fossum p. 549' },
              { title: 'Analgesia.', body: 'Opioides; en dolor intenso, infusión de fentanilo, lidocaína y ketamina. Sin AINE.', cite: 'Fossum p. 549' },
              { title: 'Nutrición.', body: 'Apoyo nutricional si está anoréxico o con vómitos o diarrea intensos.' },
            ],
          },
        ],
      },
    ],
    closure: [
      { layer: 'Biopsia en guillotina', suture: 'Catgut crómico o Vicryl', gauge: '0 o 2-0', pattern: 'Lazada que atraviesa el parénquima; corte 5 mm distal', why: 'Liga y corta a la vez; el muñón aplastado queda con el hilo.' },
      { layer: 'Lobectomía parcial', suture: 'Seda o absorbible; clips; grapas TA', gauge: '2-0 a 0', pattern: 'Ligadura de vasos expuestos o guillotinas superpuestas', why: 'Buena seguridad del nudo en tejido friable.' },
      { layer: 'Hilio lobular', suture: 'Absorbible, o grapadora vascular', gauge: '2-0 o 0', pattern: 'Ligadura individual o en bloque; doble ligadura o sobrecostura de vasos grandes', why: 'Arteria y conducto primero, luego porta y venas hepáticas; dejar muñón.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Hemorragia', prevent: 'Corregir coagulación, ligar antes de cortar, dejar muñón, torniquetes de seguridad, sangre disponible.', manage: 'Compresión, oclusión con los torniquetes, ligadura de la arteria hepática, transfusión, reintervención.' },
      { name: 'Peritonitis biliar', prevent: 'Biopsias con aguja del lado izquierdo; revisar vesícula y conductos.', manage: 'Reintervención y lavado.' },
      { name: 'Sepsis anaerobia', prevent: 'Antibióticos de amplio espectro en trauma grave y cirugía hepática.', manage: 'Antibiótico, drenaje del foco.' },
      { name: 'Hipoglucemia e hipofosfatemia', prevent: 'Medir glucosa y fósforo.', manage: 'Glucosa IV, fosfato de potasio en los líquidos.' },
      { name: 'Hipertensión portal, ascitis, drenaje biliar persistente', prevent: 'Respetar la porta de los lóbulos que quedan.', manage: 'Soporte; reintervención según la causa.' },
      { name: 'Muestra no diagnóstica', prevent: 'Muestras grandes, sin pinzas ni aplastamiento, sin tejido necrótico ni solo sangre.', manage: 'Nueva biopsia.' },
    ],
    quiz: [
      { q: '¿Por qué el hígado necesita técnicas distintas de otros órganos?', a: 'Porque es friable y con poco estroma: los vasos y conductos cortados se retraen y casi no se pueden ligar, y compactarlo para hacer hemostasia causa isquemia.' },
      { q: '¿Cómo se hace la biopsia en guillotina?', a: 'Una lazada de 0 o 2-0 alrededor del borde, apretada hasta que atraviese el parénquima antes de anudar, y corte unos 5 mm distal dejando el muñón con el hilo.' },
      { q: '¿Qué lóbulos se pueden quitar con una sola ligadura en la base y en qué pacientes?', a: 'Los izquierdos, en perros pequeños y gatos, porque mantienen su separación cerca del hilio.' },
      { q: '¿Qué preparas antes de disecar los lóbulos derechos o el caudado?', a: 'Cintas en tubos de goma alrededor de la porta, la celíaca, la mesentérica craneal y la cava, para ocluir si hay hemorragia incontrolable.' },
      { q: '¿Qué controlas en el postoperatorio de una lobectomía grande?', a: 'Glucosa, fósforo, albúmina, hematocrito y coagulación; antibióticos 2–3 días; analgesia sin AINE.' },
      { q: '¿Cuánto hígado se puede perder con función adecuada?', a: 'Hasta el 80 %, por su gran capacidad de regeneración.' },
    ],
    videos: [
      { title: 'ICG-guided liver lobectomy in a dog', url: 'https://www.youtube.com/watch?v=31-QydopYaI', channel: 'Federico Massari, Dipl. ECVS', lang: 'inglés', note: 'Lobectomía de los lóbulos izquierdos por tumor' },
      { title: 'Surgical removal of a liver tumor: Hepatocellular Carcinoma', url: 'https://www.youtube.com/watch?v=j0SPDe0u3Ls', channel: 'The Cancer Vet Clinic', lang: 'inglés', note: 'Caso completo con TC' },
    ],
    sources: [
      SOURCES.fossum(20, 'cirugía del hígado: anestesia (tabla 20.1), antibióticos, anatomía, biopsias, lobectomía parcial y completa, cicatrización y complicaciones (pp. 541–549), neoplasias (pp. 563–567)'),
      SOURCES.fossum(19, 'cirugía de la cavidad abdominal: celiotomía y cierre (pp. 514–518)'),
      SOURCES.plumbs,
    ],
  },
};
