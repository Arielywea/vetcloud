// Mastectomía unilateral en cadena (id 4). Rewritten from Fossum 5.ª ed., cap. 26 (pp. 738, 746–750).
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 4,
  legacy: {
    indicaciones: 'Tumores mamarios: en la perra 35–50 % son malignos y en la gata alrededor del 90 %. Excisión de todos los tumores salvo el carcinoma inflamatorio. En la gata, mastectomía unilateral aunque haya una sola masa, por la recidiva local con técnicas menores. Hiperplasia que no responde a tratamiento médico.',
    tecnica_quirurgica: 'Incisión elíptica a un mínimo de 1 cm del tumor hasta la fascia de la pared abdominal; disección en bloque deslizando la tijera sobre la fascia del pectoral y del recto. Ligadura de la epigástrica superficial craneal donde perfora el recto entre la glándula torácica caudal y la abdominal craneal, de la epigástrica superficial caudal junto a la grasa inguinal cerca del anillo inguinal, y de las ramas a las glándulas torácicas al atravesar los pectorales. Se extirpan la grasa y el linfonodo inguinal con la glándula inguinal; el axilar no se incluye en bloque. Fascia o pared si el tumor la invade. Cierre con suturas en walking, subcutáneo o subcuticular 3-0 o 4-0 absorbible y piel con puntos aposicionales o grapas; drenaje si hay mucho espacio muerto; colgajo axilar o del pliegue del flanco si hay tensión. OVH antes, con instrumental limpio.',
    material_quirurgico: 'Mango n.º 3 con hoja 10, tijeras de Mayo y Metzenbaum, pinzas Adson, pinzas de Allis para traccionar, hemostáticas Kelly y Rochester-Carmalt, electrocauterio, drenaje de Penrose o de aspiración cerrada, vendaje abdominal acolchado, frascos de formol identificados por tumor.',
    tipo_sutura: 'Vasos: absorbible 3-0. Subcutáneo, suturas en walking y subcuticular: absorbible monofilamento 3-0 o 4-0 (PDS, Monocryl, Biosyn, Maxon) con aguja ahusada, simples o continuo. Piel: nylon, Novafil o Prolene 3-0 o 4-0, o grapas.',
    complicaciones_frecuentes: 'Dolor, inflamación, hemorragia, seroma, infección, necrosis isquémica, autotraumatismo, dehiscencia, edema del miembro posterior y recidiva tumoral (en perras 20–73 % dentro de 2 años).',
    manejo_anestesico_sugerido: 'Protocolo de paciente sano (tabla 26.3) adaptado a la edad. Anestesia general mejor tolerada que la local incluso para nódulos pequeños. Epidural con opioide antes y después si se extirpa una gran superficie. Analgesia multimodal y AINE postoperatorio si la función renal es normal.',
    consideraciones_por_raza: 'Más frecuentes en Poodle, Boston terrier, Fox terrier, Airedale, Dachshund, Gran Pirineo, Samoyedo, Keeshond y razas deportivas (pointer, retriever, setter, spaniel). En gatas, el 99 % ocurre en hembras enteras.',
    consideraciones_comorbilidades: 'Estadificación completa antes de operar. Masas ulceradas e infectadas: compresas tibias y antibiótico unos días antes. Enfermedad renal (hipercalcemia o tumor): fluidos previos. Carcinoma inflamatorio: no se opera (pronóstico grave, CID y metástasis frecuentes).',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 26, pp. 738 y 746–750.',
  },
  guide: {
    draft: true,
    lede: 'Extirpación de una o varias glándulas mamarias, o de toda una cadena, con el tejido subcutáneo y los linfáticos. Es la cirugía oncológica más frecuente: en la perra la técnica no cambia la supervivencia si los márgenes quedan limpios, pero en la gata la cadena completa sí reduce la recidiva. Lo que decide el resultado es estadificar antes, extirpar cada masa y cerrar sin tensión.',
    meta: { species: ['perro', 'gato'], duration: '60–120 min', difficulty: 'intermedia', contamination: 'limpia' },
    before_you_start: [
      'Estadifica antes: radiografía de tórax en tres proyecciones (25–50 % de las perras con tumor maligno ya tienen metástasis pulmonar), ecografía abdominal y citología de los linfonodos aumentados.',
      'Si parece un carcinoma inflamatorio (glándulas difusamente inflamadas, calientes, dolorosas, sin bordes), no operes: la cirugía no lo controla ni lo alivia.',
      'Rasura todo el abdomen ventral y el tórax caudal y vuelve a palpar: aparecen masas nuevas al quitar el pelo. Mapéalas todas.',
      'Si haces la OVH en el mismo acto, hazla primero y con instrumental y guantes limpios, para no sembrar células tumorales en el abdomen.',
      'Cada masa puede ser un tumor distinto: extírpalas todas y envíalas identificadas por separado.',
    ],
    indications: [
      'Tumores mamarios en perras y gatas, salvo el carcinoma inflamatorio (p. 748).',
      'En la gata, mastectomía unilateral aunque haya una sola masa (p. 747).',
      'Hiperplasia mamaria que no responde a tratamiento médico; mastitis grave localizada.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Evaluación y elección de la técnica',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Examen.', body: 'Palpa ambas cadenas y los linfonodos axilares, inguinales y sublumbares (por vía rectal). Los tumores son más frecuentes en las glándulas caudales y el 66 % de las perras tiene más de uno. Cojera o edema de un miembro sugieren metástasis.', cite: 'Fossum p. 747' },
              { title: 'Imágenes.', body: 'Radiografía de tórax en tres proyecciones, radiografía abdominal (linfonodos ilíacos en tumores caudales) y ecografía abdominal. TC o RM en tumores invasivos.', cite: 'Fossum p. 747' },
              { title: 'Laboratorio.', body: 'Hemograma, bioquímica y orina para detectar enfermedades concurrentes y síndromes paraneoplásicos. Citología de la masa y de los linfonodos.', cite: 'Fossum p. 748' },
              { title: 'Diferenciales.', body: 'Hipertrofia mamaria (gatas jóvenes enteras 2–4 semanas después del celo), mastitis, granulomas, ectasia de conductos, tumores de piel y cuerpos extraños.', cite: 'Fossum p. 748' },
              { title: 'Masas ulceradas.', body: 'Compresas tibias y antibiótico unos días antes para reducir la inflamación y ver mejor los márgenes.', cite: 'Fossum p. 748' },
              { title: 'Riñón.', body: 'Si hay enfermedad renal (por ejemplo, por hipercalcemia), fluidos antes de operar.' },
              { title: 'Elige la técnica.', body: 'Según el tamaño, la localización y la consistencia del tumor, el estado del paciente y la preferencia del cirujano.', cite: 'Fossum p. 748' },
            ],
          },
          {
            type: 'table',
            columns: ['Técnica', 'Qué se extirpa', 'Cuándo'],
            rows: [
              ['Nodulectomía (mamectomía parcial)', 'La masa con 1 cm de tejido normal', 'Masa menor de 5 mm, encapsulada, no invasiva, en la periferia de la glándula'],
              ['Mastectomía simple', 'Una glándula completa', 'Tumor central o que ocupa la mayor parte de la glándula; evita la salida de leche y linfa a la herida'],
              ['Mastectomía regional', 'La glándula afectada y las vecinas', 'Varios tumores en glándulas contiguas o masa entre dos glándulas; a veces es más fácil quitar juntas la abdominal caudal y la inguinal'],
              ['Mastectomía unilateral', 'Toda una cadena con el subcutáneo y los linfáticos', 'Muchos tumores en la cadena; siempre en la gata'],
              ['Bilateral', 'Ambas cadenas a la vez', 'No recomendada: cierre muy difícil o imposible. Se prefieren dos unilaterales separadas por 3–4 semanas'],
            ],
            caption: 'Fossum p. 746–748. Si no se puede extirpar todo en una cirugía, la segunda se hace 3–4 semanas después para que la piel cicatrice y se relaje.',
          },
          {
            type: 'note',
            kind: 'book',
            title: 'Puntos clave (Box 26.13)',
            bullets: [
              'La mayoría de los tumores se previenen con la OVH en el primer año: el riesgo es 0,05 % si se esteriliza antes del primer celo, 8 % tras un celo y 26 % tras dos.',
              'En gatas, la ovariectomía antes de los 6 meses reduce el riesgo de carcinoma un 91 %; entre 6 y 12 meses, un 86 %.',
              'Si los márgenes quedan limpios, la técnica no cambia la supervivencia en la perra; en la gata, cadena completa.',
              'La quimioterapia adyuvante no mejoró la supervivencia en los estudios citados y no se recomienda de rutina.',
              'La OVH en el mismo acto no previene nuevos tumores pero evita la enfermedad uterina; en un estudio redujo la recaída en carcinomas de grado 2 con receptores de estrógeno.',
            ],
          },
          { type: 'note', kind: 'error', title: 'Carcinoma inflamatorio', text: 'Crece rápido, invade los linfáticos de la piel, produce edema, inflamación y dolor intenso, a veces en ambas cadenas y con edema de los miembros. La CID y la metástasis torácica son frecuentes. Puede confundirse con mastitis. No se opera (p. 747–748).' },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'Una herida desde el tórax hasta la ingle duele mucho. El libro recomienda anestesia general (mejor tolerada que la local incluso en nódulos pequeños) y una epidural con opioide antes y después si se extirpa una gran superficie (p. 748).',
        blocks: [
          {
            type: 'drugs',
            items: [
              ...pick('metadona', 'dexmed', 'propofol', 'alfaxalona', 'isoflurano', 'fentanilo', 'ketamina'),
              drug('Epidural', 'Morfina sin conservante', '0,1 mg/kg', 'Epidural lumbosacra', 'Para mastectomías caudales o de toda la cadena; puede causar retención urinaria.'),
              drug('Local', 'Lidocaína tumescente', '7–10 mg/kg (máximo)', 'Infiltración subcutánea diluida al 0,1–0,3 %', 'Solo perras; en toda el área antes de incidir. No en gatas a esta dosis.'),
              ...pick('meloxicam', 'metadonaPost'),
            ],
          },
          { type: 'note', kind: 'why', title: 'Por qué la infiltración tumescente', text: 'Mucha lidocaína muy diluida bajo la piel de toda la cadena bloquea el dolor de la incisión y despega los planos, lo que también reduce el sangrado. Calcula la dosis total antes de diluir.' },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          {
            type: 'list',
            items: [
              'La perra tiene cinco pares de glándulas (torácicas craneal y caudal, abdominales craneal y caudal, inguinal) y la gata cuatro (p. 748).',
              'Glándulas 1 y 2: ramas ventrales y laterales de las intercostales, la torácica interna y la torácica lateral (Box 26.14).',
              'Glándulas 2 y 3: vasos epigástricos superficiales craneales, que también irrigan la piel sobre el recto.',
              'Glándulas 4 y 5: vasos epigástricos superficiales caudales, que nacen de la pudenda externa cerca del linfonodo inguinal superficial. Las ramas craneales y caudales se anastomosan.',
              'Linfáticos: el linfonodo axilar drena las tres glándulas craneales y el inguinal las dos caudales, pero hay conexiones entre glándulas y a través de la línea media (p. 749).',
              'Las glándulas abdominales e inguinales están sueltas sobre la fascia del recto, unidas por grasa; las torácicas están pegadas a los pectorales con poca grasa entre medio.',
              'La separación entre las dos cadenas en la línea media es nítida.',
            ],
          },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          {
            id: 'posicion',
            title: 'A. Posición e incisión',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Posición.', body: 'Decúbito dorsal con los miembros torácicos fijados hacia craneal y los pelvianos hacia caudal, en posición relajada.', cite: 'Fossum p. 749' },
                  { title: 'Campo.', body: 'Prepara todo el abdomen ventral, el tórax caudal y las regiones inguinales.' },
                  { title: 'Marca la elipse.', body: 'Incisión elíptica alrededor de las glándulas afectadas, a 1 cm o más del tumor (fig. 26.22A). Comprueba con los dedos que podrás cerrar.', cite: 'Fossum p. 749' },
                  { title: 'Profundiza.', body: 'Continúa por el subcutáneo hasta la fascia de la pared abdominal. Evita cortar tejido mamario, aunque a veces es imposible porque está unido entre glándulas.', cite: 'Fossum p. 749' },
                  { title: 'Hemostasia superficial.', body: 'Electrocoagulación, pinzas o ligadura.' },
                ],
              },
            ],
          },
          {
            id: 'diseccion',
            title: 'B. Disección en bloque',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Eleva un borde.', body: 'Levanta un borde de la incisión y separa el subcutáneo de la fascia del pectoral y del recto deslizando la tijera con un movimiento suave (fig. 26.22B). La tracción sobre la piel elevada facilita la disección.', cite: 'Fossum p. 749' },
                  { title: 'Abdominales e inguinales.', body: 'Se separan fácil de la fascia del recto porque están unidas por grasa y tejido laxo.' },
                  { title: 'Torácicas.', body: 'Están pegadas a los pectorales: diseca con más cuidado y liga las ramas que los atraviesan.' },
                  { title: 'Grasa y linfonodo inguinales.', body: 'Se extirpan junto con la glándula inguinal. El linfonodo axilar no se incluye en la resección en bloque de las glándulas torácicas.', cite: 'Fossum p. 749' },
                  { title: 'Profundidad.', body: 'Si el tumor invadió el subcutáneo, extirpa la fascia debajo; si invadió la musculatura, incluye una parte de la pared abdominal.', cite: 'Fossum p. 749' },
                ],
              },
            ],
          },
          {
            id: 'vasos',
            title: 'C. Ligadura de los vasos principales',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Epigástrica superficial craneal.', body: 'Ligala donde perfora el recto, entre la glándula torácica caudal y la abdominal craneal (tercera).', cite: 'Fossum p. 749' },
                  { title: 'Epigástrica superficial caudal.', body: 'Ligala junto a la grasa inguinal, cerca del anillo inguinal (fig. 26.22C).', cite: 'Fossum p. 749' },
                  { title: 'Ramas torácicas.', body: 'Liga las ramas a las glándulas torácicas a medida que aparecen atravesando los pectorales.', cite: 'Fossum p. 749' },
                  { title: 'Lava y revisa.', body: 'Lava el lecho y busca tejido anormal remanente.' },
                  { title: 'Identifica la pieza.', body: 'Marca cada masa (o la orientación de la cadena) para saber de dónde viene cada informe de histopatología.', cite: 'Fossum p. 748' },
                ],
              },
            ],
          },
          {
            id: 'cierre',
            title: 'D. Cierre',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Despega los bordes.', body: 'Socava los bordes de la herida.' },
                  { title: 'Suturas en walking.', body: 'Avanza la piel hacia el centro del defecto con suturas en walking (fig. 15.22 y 26.22D): reparten la tensión y cierran el espacio muerto.', cite: 'Fossum p. 749' },
                  { title: 'Drenaje.', body: 'Si el espacio muerto es grande, coloca un drenaje de aspiración cerrada o de Penrose.', cite: 'Fossum p. 749' },
                  { title: 'Subcutáneo o subcuticular.', body: 'Absorbible monofilamento 3-0 o 4-0 con aguja ahusada, simples o continuo.', cite: 'Fossum p. 749' },
                  { title: 'Zona torácica.', body: 'Es donde más cuesta cerrar: la piel es menos móvil y las costillas no se dejan comprimir. Si la tensión es excesiva, usa un colgajo axilar o del pliegue del flanco (p. 218–220).', cite: 'Fossum p. 749' },
                  { title: 'Piel.', body: 'Puntos aposicionales de nylon, Novafil o Prolene 3-0 o 4-0, o grapas (fig. 26.22E).', cite: 'Fossum p. 749' },
                  { title: 'Vendaje.', body: 'Vendaje circunferencial acolchado que comprima el espacio muerto, inmovilice el tejido y proteja la herida.', cite: 'Fossum p. 749' },
                ],
              },
              { type: 'note', kind: 'tip', title: 'Si la elipse no cierra', text: 'Prueba el cierre antes de cortar el último puente de piel. Suturas en walking, incisiones de alivio y colgajos de avance permiten cerrar sin dehiscencia.' },
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
              { title: 'Analgesia y soporte.', body: 'Opioide las primeras 12–24 h y AINE según la función renal.', cite: 'Fossum p. 749' },
              { title: 'Vendaje.', body: 'Cambiar a diario los primeros 2–3 días, o cuando se moje.', cite: 'Fossum p. 749' },
              { title: 'Herida.', body: 'Revisa inflamación, edema, secreción, seroma, dehiscencia y necrosis.' },
              { title: 'Drenaje.', body: 'Retirar cuando la secreción sea mínima (habitualmente a los 3–5 días).', cite: 'Fossum p. 749' },
              { title: 'Puntos.', body: 'Vendaje a los 5–7 días y puntos a los 7–10 días.', cite: 'Fossum p. 749' },
              { title: 'Seguimiento.', body: 'Revisar recidiva local y metástasis cada 3–4 meses en tumores malignos.', cite: 'Fossum p. 749' },
            ],
          },
          {
            type: 'note',
            kind: 'book',
            title: 'Pronóstico (Box 26.15 y p. 749–750)',
            bullets: [
              'Factores: tipo histológico, invasión, diferenciación nuclear, reacción linfoide, tamaño, linfonodos, receptores hormonales, ulceración y fijación.',
              'Perras con tumores menores de 3 cm: 35 % de recidiva a 2 años y 22 meses de supervivencia; mayores de 3 cm: 80 % y 14 meses.',
              'Con metástasis al diagnóstico, la supervivencia media baja de 28 a 5 meses.',
              'Gatas: tumores mayores de 3 cm, supervivencia media de 6 meses; menores de 2 cm, alrededor de 3 años.',
              'Los carcinomas papilares o tubulares tienen mejor pronóstico que los sólidos o anaplásicos.',
            ],
          },
        ],
      },
    ],
    closure: [
      { layer: 'Epigástricas superficiales y ramas torácicas', suture: 'Absorbible', gauge: '3-0', pattern: 'Ligadura', why: 'Son los vasos que más sangran; la cauterización sola no basta.' },
      { layer: 'Espacio muerto', suture: 'Monocryl o PDS', gauge: '3-0 o 4-0', pattern: 'Suturas en walking', why: 'Cierran el espacio y avanzan la piel repartiendo la tensión.' },
      { layer: 'Subcutáneo o subcuticular', suture: 'PDS, Monocryl, Biosyn o Maxon, aguja ahusada', gauge: '3-0 o 4-0', pattern: 'Simples o continuo', why: 'Aproxima los bordes y quita tensión a la piel.' },
      { layer: 'Piel', suture: 'Nylon, Novafil o Prolene, o grapas', gauge: '3-0 o 4-0', pattern: 'Puntos aposicionales', why: 'Herida larga y con tensión; puntos externos que se retiran a los 7–10 días.' },
    ],
    complications: [
      { name: 'Seroma', prevent: 'Suturas en walking, drenaje si hay mucho espacio muerto, vendaje compresivo.', manage: 'Esperar; puncionar con asepsia solo si es grande y tenso.' },
      { name: 'Dehiscencia y necrosis isquémica', prevent: 'Planificar la elipse, no cerrar con tensión, colgajos en la zona torácica, no hacer bilateral en un tiempo.', manage: 'Manejo de herida abierta o reconstrucción.' },
      { name: 'Hemorragia', prevent: 'Ligar las epigástricas y las ramas que atraviesan los pectorales.', manage: 'Compresión; revisión quirúrgica si hay hematoma que crece.' },
      { name: 'Infección', prevent: 'Asepsia; tratar antes las masas ulceradas.', manage: 'Cultivo y antibiótico.' },
      { name: 'Edema del miembro posterior', prevent: 'Disección cuidadosa en la zona inguinal.', manage: 'Vendaje, movilización; suele ceder.' },
      { name: 'Recidiva tumoral', prevent: 'Márgenes de 1 cm o más, profundidad suficiente, cadena completa en gatas.', manage: 'Reintervención y valoración oncológica; en perras, 20–73 % de recidiva local en 2 años.' },
    ],
    quiz: [
      { q: '¿Qué estudios haces antes de una mastectomía?', a: 'Radiografía de tórax en tres proyecciones, radiografía y ecografía abdominal, hemograma, bioquímica, orina y citología de la masa y de los linfonodos.' },
      { q: '¿Cuándo no se opera un tumor mamario?', a: 'En el carcinoma inflamatorio, porque la cirugía no lo controla ni lo alivia.' },
      { q: '¿Qué técnica eliges en una gata con una sola masa?', a: 'Mastectomía unilateral de toda la cadena, porque la recidiva local es frecuente con técnicas menores.' },
      { q: '¿Dónde ligas la epigástrica superficial craneal y la caudal?', a: 'La craneal donde perfora el recto entre la glándula torácica caudal y la abdominal craneal; la caudal junto a la grasa inguinal, cerca del anillo inguinal.' },
      { q: '¿Qué linfonodo se extirpa con la cadena y cuál no?', a: 'El inguinal superficial se extirpa con la glándula inguinal; el axilar no se incluye en la resección en bloque.' },
      { q: '¿Por qué no se hace la mastectomía bilateral en un solo tiempo?', a: 'Porque el cierre es muy difícil o imposible por la tensión; se hacen dos unilaterales separadas 3–4 semanas.' },
    ],
    videos: [
      { title: 'Canine Mammary Mass Removal Surgery', url: 'https://www.youtube.com/watch?v=xZEGvEw3MaE', channel: 'The London Vet', lang: 'inglés', note: 'Cirugía con comentario en directo' },
      { title: 'Mammary Gland Masses Removal Surgery', url: 'https://www.youtube.com/watch?v=gwyKzhqTBlA', channel: 'The Cancer Vet Clinic', lang: 'inglés', note: 'Caso con estadificación previa' },
    ],
    sources: [
      SOURCES.fossum(26, 'neoplasia mamaria y mastectomía, pp. 738 y 746–750 (técnicas, irrigación, cierre, cuidados, pronóstico)'),
      SOURCES.fossum(15, 'cirugía del sistema tegumentario: suturas en walking (fig. 15.22) y colgajos axilar y del pliegue del flanco (pp. 218–220)'),
      { text: 'Abimussi CJX y col. Anestesia tumescente con lidocaína en la mastectomía canina. Veterinary Anaesthesia and Analgesia, 2013.', kind: 'complemento' },
      SOURCES.plumbs,
    ],
  },
};
