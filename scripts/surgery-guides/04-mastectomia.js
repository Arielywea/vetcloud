// Mastectomía unilateral en cadena (id 4). Full depth: staging, technique by gland and closure under tension.
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 4,
  legacy: {
    indicaciones: 'Tumores mamarios (en la perra cerca de la mitad son malignos; en la gata más del 85 %); hiperplasia fibroepitelial que no responde a tratamiento médico; mastitis necrotizante.',
    tecnica_quirurgica: 'Estadificación previa (radiografía de tórax en tres proyecciones, ecografía abdominal, citología del linfonodo). Incisión elíptica alrededor de toda la cadena con 1–2 cm de margen lateral. Disección del tejido mamario de la fascia del recto, profundizando la fascia si el tumor está adherido. Ligadura de los vasos epigástricos craneales y caudales. Extirpación con el linfonodo inguinal superficial (el axilar solo si está aumentado o la citología es positiva). Cierre por capas reduciendo el espacio muerto con puntos de anclaje o suturas en walking.',
    material_quirurgico: 'Mango n.º 3 con hoja 10, tijeras de Mayo y Metzenbaum, pinzas Adson, Allis o Babcock para traccionar la cadena, hemostáticas Kelly y Rochester, electrocauterio o sellador de vasos, drenaje activo opcional, recipientes con formol para la histopatología.',
    tipo_sutura: 'Vasos: PDS o Monocryl 3-0. Subcutáneo y anclaje: Monocryl 3-0, suturas en walking o continuo simple. Piel: intradérmico 4-0 o puntos simples de nylon 3-0.',
    complicaciones_frecuentes: 'Seroma (la más frecuente); dehiscencia por tensión, sobre todo en la zona inguinal; infección; necrosis de bordes; dolor; recidiva local o metástasis.',
    manejo_anestesico_sugerido: 'Opioide agonista puro (metadona 0,2–0,3 mg/kg) ± dexmedetomidina; inducción con propofol o alfaxalona; mantenimiento inhalatorio. Analgesia multimodal: infusión de fentanilo o ketamina y bloqueo con infiltración tumescente de lidocaína diluida en toda el área de la cadena. AINE postoperatorio si está normotensa.',
    consideraciones_por_raza: 'Razas pequeñas y medianas (Poodle, Yorkshire, Cocker, Dachshund) con más incidencia. En gatas siameses, edad de presentación menor. En galgos, cicatrización y sangrado más delicados.',
    consideraciones_comorbilidades: 'Metástasis pulmonar: cambia el pronóstico y la conveniencia de operar. Carcinoma inflamatorio: no se opera (pronóstico grave, coagulopatía). Geriátricas: perfil completo y coagulación. Considerar OVH simultánea si es entera (sobre todo con tumores de receptor hormonal).',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 26; Withrow & MacEwen\'s Small Animal Clinical Oncology, 6.ª ed.; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Extirpación de toda una cadena mamaria con su linfonodo inguinal superficial. Es la cirugía oncológica más frecuente de la clínica: el resultado lo deciden la estadificación previa, márgenes limpios y un cierre que aguante la tensión.',
    meta: { species: ['perro', 'gato'], duration: '60–120 min', difficulty: 'intermedia', contamination: 'limpia' },
    before_you_start: [
      'Estadifica antes de operar: radiografía de tórax en tres proyecciones, ecografía abdominal y citología del linfonodo si está aumentado.',
      'Si parece un carcinoma inflamatorio (mama caliente, edematosa, dolorosa, sin bordes claros), no operes.',
      'Marca los tumores en la piel antes de rasurar y fotografíalos: tras la preparación cuesta encontrar los pequeños.',
      'En la gata, la cirugía de elección es la mastectomía en cadena (unilateral o bilateral en dos tiempos), no la extirpación del nódulo.',
      'Envía todo a histopatología, identificando la orientación y la posición de cada tumor.',
    ],
    indications: [
      'Tumores mamarios en perras y gatas (la técnica depende del número, tamaño y posición de los tumores).',
      'Hiperplasia fibroepitelial felina que no responde a aglepristona.',
      'Mastitis necrotizante o gangrenosa.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Evaluación y elección de la técnica',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Examen de las cuatro cadenas.', body: 'Palpa ambas cadenas completas y los linfonodos axilares e inguinales. Mide cada nódulo y anota la glándula (M1 torácica craneal a M5 inguinal en la perra; M1 a M4 en la gata).' },
              { title: 'Estadificación.', body: 'Radiografía de tórax en tres proyecciones (o TC si está disponible), ecografía abdominal, hemograma, bioquímica y coagulación. Citología con aguja fina del linfonodo si está aumentado.' },
              { title: 'Elige la técnica.', body: 'El objetivo es extirpar todo el tumor con márgenes; la técnica es la que lo consigue con menos cirugía.' },
              { title: 'OVH.', body: 'En perras enteras, hacer la OVH en el mismo acto o antes reduce nuevos tumores en algunas pacientes. Se hace primero, para no contaminar el abdomen con tejido tumoral.' },
            ],
          },
          {
            type: 'table',
            columns: ['Técnica', 'Qué se extirpa', 'Cuándo'],
            rows: [
              ['Nodulectomía', 'Solo el nódulo', 'Nódulo pequeño (<5 mm), superficial y móvil en la perra; casi siempre como biopsia escisional'],
              ['Mastectomía simple', 'Una glándula completa', 'Tumor central en una glándula, en la perra'],
              ['Mastectomía regional', 'Varias glándulas vecinas (M1–M3 o M3–M5)', 'Tumor en glándulas que comparten drenaje'],
              ['Mastectomía unilateral en cadena', 'Toda una cadena con el linfonodo inguinal', 'Varios tumores en una cadena; siempre en la gata'],
              ['Bilateral en dos tiempos', 'Ambas cadenas, separadas por 2–4 semanas', 'Tumores en ambas cadenas; en la gata, recomendada'],
            ],
            caption: 'La mastectomía en cadena no mejora la supervivencia de la perra frente a una técnica menor con márgenes limpios, pero sí reduce nuevos tumores en esa cadena. En la gata, la cadena completa sí mejora el pronóstico.',
          },
          { type: 'note', kind: 'error', title: 'Cuándo no operar', bullets: ['Carcinoma inflamatorio: la cirugía no cura y empeora el dolor y la coagulopatía.', 'Metástasis pulmonares múltiples: la cirugía solo es paliativa (tumor ulcerado o infectado).'] },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'Una herida de toda la longitud del abdomen y el tórax duele mucho: la analgesia multimodal y la infiltración local hacen la diferencia en la recuperación.',
        blocks: [
          {
            type: 'drugs',
            items: [
              ...pick('metadona', 'dexmed', 'propofol', 'alfaxalona', 'isoflurano', 'fentanilo', 'ketamina'),
              drug('Local', 'Lidocaína tumescente', '7–10 mg/kg (máximo)', 'Infiltración subcutánea diluida (0,1–0,3 %)', 'Solo en perras; se infiltra en toda el área antes de incidir. En gatas no se usa a esta dosis.'),
              ...pick('meloxicam', 'metadonaPost'),
            ],
          },
          { type: 'note', kind: 'why', title: 'Por qué la infiltración tumescente', text: 'Una gran cantidad de lidocaína muy diluida bajo la piel de toda la cadena bloquea el dolor de la incisión y despega los planos, lo que también reduce el sangrado. Calcula la dosis total antes de diluir.' },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          {
            type: 'list',
            items: [
              'La perra tiene cinco pares de glándulas: torácicas craneal y caudal (M1–M2), abdominales craneal y caudal (M3–M4) e inguinal (M5). La gata tiene cuatro pares.',
              'Irrigación: las glándulas craneales reciben las arterias torácica interna e intercostales; las abdominales, las epigástricas superficiales craneales; las caudales e inguinales, las epigástricas superficiales caudales (de la pudenda externa).',
              'Linfáticos: M1–M3 drenan sobre todo al linfonodo axilar y M3–M5 al inguinal superficial; M3 puede drenar a ambos.',
              'El tejido mamario está sobre la fascia del músculo recto y del pectoral; entre las glándulas M4 y M5 está la grasa inguinal con el linfonodo.',
            ],
          },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Posición.', body: 'Decúbito dorsal con los miembros extendidos. Prepara desde el tercio medio del tórax hasta la región inguinal y ambos flancos.' },
              { title: 'Dibuja la elipse.', body: 'Marca una incisión elíptica alrededor de toda la cadena, 1–2 cm por fuera de los tumores y de las glándulas, de M1 a M5. Comprueba que podrás cerrarla tomando la piel con los dedos.' },
              { title: 'Empieza por caudal.', body: 'Incide la piel en la zona inguinal. Localiza y liga la arteria y la vena epigástricas superficiales caudales y el linfonodo inguinal superficial, que se extirpa con la cadena.' },
              { title: 'Despega la cadena.', body: 'Con tijera de Metzenbaum, separa el tejido mamario de la fascia del recto desde caudal a craneal, traccionando la cadena con pinzas de Allis. Liga o cauteriza los vasos perforantes.' },
              { title: 'Profundiza si está adherido.', body: 'Si un tumor está fijo a la fascia, extirpa la fascia (y el músculo superficial si hace falta) debajo de él para tener margen profundo.' },
              { title: 'Ligadura craneal.', body: 'En la región torácica, liga las ramas de la torácica interna y las epigástricas craneales. El linfonodo axilar se extirpa solo si está aumentado o su citología es positiva.' },
              { title: 'Orienta la pieza.', body: 'Marca con un hilo el extremo craneal y envíala completa en formol (10 veces el volumen del tejido).' },
              { title: 'Hemostasia y lavado.', body: 'Revisa el lecho, lava con solución salina y cámbiate los guantes antes de cerrar.' },
            ],
          },
          { type: 'note', kind: 'tip', title: 'Si la elipse no cierra', text: 'Las técnicas de liberación de tensión (incisiones de alivio, colgajos de avance o las suturas en walking) permiten cerrar sin dehiscencia. Prueba el cierre antes de cortar el último puente de piel.' },
        ],
      },
      {
        id: 'cierre',
        title: 'Cierre: espacio muerto y tensión',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Suturas en walking.', body: 'Puntos simples de Monocryl 3-0 que toman la dermis profunda y la fascia un poco más hacia la línea media, avanzando la piel hacia el centro. Reparten la tensión y cierran el espacio muerto.' },
              { title: 'Subcutáneo.', body: 'Continuo simple de Monocryl 3-0 aproximando los bordes.' },
              { title: 'Piel.', body: 'Intradérmico 4-0 en zonas sin tensión; puntos simples o en X de nylon 3-0 donde hay tensión (sobre todo inguinal).' },
              { title: 'Drenaje.', body: 'Opcional: drenaje activo si queda espacio muerto grande; se retira cuando produce menos de 1–2 mL/kg/día.' },
            ],
          },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio y pronóstico',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Analgesia.', body: 'Opioide las primeras 12–24 h y AINE 5–7 días.' },
              { title: 'Herida.', body: 'Body o vendaje abdominal suave; collar si se lame. Revisión a los 3–5 días y retiro de puntos a los 10–14.' },
              { title: 'Seroma.', body: 'Frecuente; casi siempre se reabsorbe solo. No lo puncionas salvo que sea grande y tenso.' },
              { title: 'Histopatología.', body: 'Tipo, grado y márgenes definen el pronóstico y si hace falta quimioterapia o seguimiento estrecho.' },
              { title: 'Seguimiento.', body: 'Radiografía de tórax cada 3 meses el primer año en tumores malignos.' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Pronóstico', text: 'Factores peores: tumor de más de 3 cm en la perra (más de 2 cm en la gata), alto grado histológico, invasión vascular, linfonodo positivo, ulceración y metástasis. En la gata los tumores son malignos en la gran mayoría de los casos.' },
        ],
      },
    ],
    closure: [
      { layer: 'Vasos epigástricos', suture: 'PDS o Monocryl', gauge: '3-0', pattern: 'Ligadura circunferencial', why: 'Las epigástricas craneales y caudales sangran mucho si se cauterizan solamente.' },
      { layer: 'Espacio muerto', suture: 'Monocryl', gauge: '3-0', pattern: 'Suturas en walking', why: 'Cierran el espacio y avanzan la piel, repartiendo la tensión.' },
      { layer: 'Subcutáneo', suture: 'Monocryl', gauge: '3-0', pattern: 'Continuo simple', why: 'Aproxima bordes y quita tensión a la piel.' },
      { layer: 'Piel', suture: 'Monocryl o nylon', gauge: '4-0 o 3-0', pattern: 'Intradérmico; simples o en X donde hay tensión', why: 'La zona inguinal es la que más se abre: puntos externos ahí.' },
    ],
    complications: [
      { name: 'Seroma', prevent: 'Suturas en walking, mínimo electrocauterio, reposo, vendaje suave.', manage: 'Esperar; puncionar con asepsia solo si es grande y tenso.' },
      { name: 'Dehiscencia', prevent: 'Planificar la elipse, liberar tensión, puntos externos en la zona inguinal.', manage: 'Manejo de herida abierta o reconstrucción.' },
      { name: 'Infección', prevent: 'Asepsia, tiempo quirúrgico corto, profilaxis en cirugías largas.', manage: 'Cultivo y antibiótico; abrir si hay absceso.' },
      { name: 'Recidiva local', prevent: 'Márgenes de 1–2 cm, profundidad suficiente, cadena completa en gatas.', manage: 'Reintervención y valoración oncológica.' },
      { name: 'Hemorragia', prevent: 'Ligadura de epigástricas y perforantes; coagulación previa en geriátricas.', manage: 'Compresión, revisión quirúrgica si hay hematoma que crece.' },
    ],
    quiz: [
      { q: '¿Qué estudios haces antes de una mastectomía por tumor?', a: 'Radiografía de tórax en tres proyecciones, ecografía abdominal, perfil sanguíneo y coagulación, y citología del linfonodo si está aumentado.' },
      { q: '¿Cuándo no se opera un tumor mamario?', a: 'En el carcinoma inflamatorio y, salvo cirugía paliativa, con metástasis múltiples.' },
      { q: '¿Qué linfonodo se extirpa siempre con la cadena?', a: 'El inguinal superficial; el axilar solo si está aumentado o la citología es positiva.' },
      { q: '¿Por qué en la gata se prefiere la cadena completa?', a: 'Porque más del 85 % de sus tumores mamarios son malignos y la mastectomía radical mejora el control local y la supervivencia.' },
      { q: '¿Para qué sirven las suturas en walking?', a: 'Para cerrar el espacio muerto y avanzar la piel hacia la línea media repartiendo la tensión.' },
    ],
    videos: [
      { title: 'Canine Mammary Mass Removal Surgery', url: 'https://www.youtube.com/watch?v=xZEGvEw3MaE', channel: 'The London Vet', lang: 'inglés', note: 'Cirugía con comentario en directo' },
      { title: 'Mammary Gland Masses Removal Surgery', url: 'https://www.youtube.com/watch?v=gwyKzhqTBlA', channel: 'The Cancer Vet Clinic', lang: 'inglés', note: 'Caso con estadificación previa' },
    ],
    sources: [
      SOURCES.fossum(26, 'cirugía de los aparatos reproductor y genital (glándula mamaria)'),
      { text: 'Vail DM, Thamm DH, Liptak JM. Withrow & MacEwen\'s Small Animal Clinical Oncology, 6.ª ed. Elsevier, 2020. Tumores de la glándula mamaria.', kind: 'libro' },
      { text: 'Gemignani F y col. Mastectomía bilateral en gatas y supervivencia. Veterinary and Comparative Oncology, 2018.', kind: 'complemento' },
      { text: 'Abimussi CJX y col. Anestesia tumescente con lidocaína en la mastectomía canina. Veterinary Anaesthesia and Analgesia, 2013.', kind: 'complemento' },
      SOURCES.plumbs,
    ],
  },
};
