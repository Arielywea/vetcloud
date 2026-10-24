// Gastropexia preventiva (id 6). Rewritten from Fossum 5.ª ed., cap. 18 (pp. 400, 406–416, 419–425).
const { pick, drug, ABDOMINAL_CLOSURE, CELIOTOMY_STEPS, SOURCES } = require('./_common');

module.exports = {
  id: 6,
  legacy: {
    indicaciones: 'Prevención de la dilatación-vólvulo gástrico (DVG) en razas de pecho profundo, a menudo junto con la esterilización; siempre tras resolver una DVG (antro pilórico a la pared derecha); hernia de hiato recurrente (fundus a la pared izquierda).',
    tecnica_quirurgica: 'Gastropexia incisional (de colgajo muscular): incisión de la seromuscular del antro pilórico a medio camino entre las curvaturas, en sentido longitudinal, e incisión del peritoneo y del transverso del abdomen derecho paralela a sus fibras; sutura de los bordes con dos continuos simples de 2-0 absorbible o no absorbible, primero el borde craneal y luego el caudal, con la muscular del estómago en contacto con el músculo de la pared. Variantes: transversa, en cinturón (belt-loop), circuncostal, con sonda, asistida por laparoscopia, intracorpórea con sutura barbada, endoscópica y por minilaparotomía.',
    material_quirurgico: 'Instrumental de laparotomía, separador de Balfour, pinzas Babcock y Allis, puntos de sostén; para circuncostal, pinza Carmalt para el túnel bajo la costilla; para la técnica con sonda, sonda Foley de 18–30 Fr o de silicona con hongo; para laparoscopia, cánulas, pinzas Babcock endoscópicas y sutura barbada opcional.',
    tipo_sutura: 'Incisional y en cinturón: 2-0 absorbible o no absorbible monofilamento, continuo simple. Circuncostal: 2-0 absorbible. Con sonda: bolsa de tabaco de 2-0 absorbible y 3–4 puntos entre antro y pared. Mucosa perforada por error: 3-0 absorbible.',
    complicaciones_frecuentes: 'Estómago mal posicionado (obstrucción de la salida, vómitos crónicos o dilatación); neumotórax y fractura costal (circuncostal); fuga y peritonitis (con sonda mal colocada); en técnicas endoscópicas, rotura o pérdida de la aguja y atrapamiento de órganos; vómitos o diarrea transitorios menos de 7 días. La pexia no previene la dilatación.',
    manejo_anestesico_sugerido: 'Preventiva en paciente sano: tabla 19.1 (opioide ± benzodiazepina, propofol o alfaxalona, inhalatorio, infusiones de fentanilo, ketamina o lidocaína según dolor, epidural con morfina). En DVG: tabla 18.4, estabilización con dos vías gruesas, sin α2 ni acepromacina, inducción con ketamina-benzodiazepina o etomidato, ECG por arritmias.',
    consideraciones_por_raza: 'Razas grandes y gigantes de pecho profundo: Gran Danés, San Bernardo, Weimaraner, Setter irlandés y Gordon, Pastor alemán, Dóberman, Basset hound, Akita, Bloodhound.',
    consideraciones_comorbilidades: 'Si se hace con la OVH, ampliar la incisión hacia craneal. En DVG, la pexia se hace después de descomprimir, reposicionar y valorar la viabilidad del estómago y del bazo.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 18, pp. 400 y 406–425; cap. 19, tabla 19.1.',
  },
  guide: {
    draft: true,
    lede: 'Adherencia permanente del antro pilórico a la pared abdominal derecha para que el estómago no pueda rotar. La técnica incisional es fácil y rápida, no abre la luz gástrica y en dos estudios previno la DVG en perros normales y su recidiva; no previene la dilatación.',
    meta: { species: ['perro'], duration: '20–40 min (sola o añadida a otra cirugía)', difficulty: 'básica', contamination: 'limpia' },
    before_you_start: [
      'La pexia va en el antro pilórico a la pared derecha; en la hernia de hiato es lo contrario: fundus a la pared izquierda.',
      'Incide solo la seromuscular del antro: si ves la mucosa, te pasaste (ciérrala con 3-0 absorbible).',
      'La incisión de la pared va en el peritoneo y el transverso del abdomen, paralela a sus fibras, caudal a la última costilla.',
      'Antes de anudar, comprueba que el estómago quede en posición normal, el antro sin torcer y la muscular gástrica en contacto con el músculo.',
      'Explica al tutor que la pexia evita el vólvulo pero no la dilatación: si el perro se hincha, igual es una urgencia.',
    ],
    indications: [
      'Prevención en razas de pecho profundo, idealmente en el mismo acto que la esterilización.',
      'Siempre tras corregir una DVG (antro a la pared derecha, p. 406).',
      'Hernia de hiato recurrente (fundus a la pared izquierda).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio y elección de la técnica',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Momento.', body: 'En cachorros de raza grande suele hacerse con la esterilización; en machos, con la orquiectomía o por laparoscopia o minilaparotomía.' },
              { title: 'Ayuno y exámenes.', body: 'Como cualquier cirugía electiva en paciente sano: hematocrito y proteínas; desde los 5–7 años, electrolitos, enzimas hepáticas, urea y creatinina (tabla 19.1).', cite: 'Fossum p. 514' },
              { title: 'Elige la técnica.', body: 'Según el abordaje (laparotomía, laparoscopia o minilaparotomía), la necesidad de descomprimir el estómago después y tu experiencia.' },
            ],
          },
          {
            type: 'table',
            columns: ['Técnica', 'Ventajas', 'Inconvenientes'],
            rows: [
              ['Incisional (colgajo muscular)', 'Fácil y rápida, no abre la luz (Box 18.23)', 'Menos fuerte que la circuncostal; no permite descomprimir después'],
              ['En cinturón (belt-loop)', 'Sencilla, adherencias adecuadas', 'Igual que la incisional'],
              ['Circuncostal', 'Adherencia más fuerte, no abre la luz (Box 18.22)', 'Más difícil; riesgo de neumotórax y fractura costal'],
              ['Con sonda (gastrostomía)', 'Rápida; permite descomprimir y dar medicamentos', 'Se abre la luz; peritonitis si se coloca mal; sonda 7–10 días'],
              ['Asistida por laparoscopia', 'Mínimamente invasiva y rápida', 'Equipo y entrenamiento'],
              ['Minilaparotomía', 'Incisión de 6 cm, sin equipo especial', 'Poca exposición; hay que identificar bien el antro'],
            ],
            caption: 'Fossum p. 406–415. La gastrocolopexia (curvatura mayor al colon transverso) tiene hasta 20 % de recidiva.',
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        blocks: [
          {
            type: 'drugs',
            items: [
              ...pick('metadona', 'midazolam', 'propofol', 'alfaxalona', 'isoflurano', 'fentanilo', 'ketamina'),
              drug('Intraoperatorio', 'Lidocaína', '1–2 mg/kg', 'IV, carga', 'Luego infusión 1–3 mg/kg/h en perros (tabla 19.1); útil también como antiarrítmico en la DVG.'),
              drug('Epidural', 'Morfina sin conservante', '0,1 mg/kg', 'Epidural', 'Puede combinarse con bupivacaína 0,5 mg/kg (tabla 19.1).'),
              ...pick('lidocainaLocal'),
              drug('Postoperatorio', 'Carprofeno', '2,2 mg/kg', 'VO cada 12 h', 'Solo en la pexia preventiva en paciente sano.'),
              ...pick('meloxicam'),
            ],
          },
          { type: 'note', kind: 'error', title: 'En la DVG', text: 'Paciente en shock: sin α2 ni acepromacina, inducción con ketamina y benzodiazepina o etomidato, líquidos de choque por dos vías gruesas, ECG continuo. El propofol causa hipotensión marcada en el hipovolémico (p. 435).' },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          {
            type: 'list',
            items: [
              'Antro pilórico: porción en embudo antes del canal pilórico, a la derecha. La pexia se hace en su cara ventral, a medio camino entre la curvatura mayor y la menor (p. 400, 411).',
              'La mucosa es la mitad del peso del estómago y se separa fácil de la submucosa y la serosa: por eso se puede levantar un colgajo seromuscular sin abrir la luz.',
              'Arterias gástricas (curvatura menor), gastroepiploicas (curvatura mayor) y gástricas cortas; en la DVG las cortas suelen arrancarse y explican el hemoabdomen.',
              'Pared derecha: transverso del abdomen bajo el oblicuo interno; caudal a la última costilla y unos centímetros lateral a la unión con el recto queda el sitio de la pexia.',
              'El colédoco cruza el omento menor cerca del píloro: cuidado al trabajar en esa zona.',
            ],
          },
          { type: 'figure', key: 'gastropexy-incisional', caption: 'Incisión en la seromuscular del antro pilórico e incisión del mismo largo en el transverso del abdomen derecho, caudal a la última costilla. Se unen los bordes craneales entre sí y los caudales entre sí (Fossum fig. 18.79).' },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          {
            id: 'incisional',
            title: 'A. Gastropexia incisional',
            blocks: [
              {
                type: 'steps',
                items: [
                  ...CELIOTOMY_STEPS.slice(1, 3),
                  { title: 'Identifica el antro.', body: 'Localiza el píloro y el antro y llévalo hacia la pared derecha sin tensión ni torsión.' },
                  { title: 'Incisión en el antro.', body: 'Incide la seromuscular del antro pilórico en sentido longitudinal, a medio camino entre la curvatura mayor y la menor (fig. 18.79A). No entres en la mucosa.', cite: 'Fossum p. 408, 411' },
                  { title: 'Incisión en la pared.', body: 'En la pared ventrolateral derecha, incide el peritoneo y la fascia interna del recto o del transverso del abdomen, paralela a las fibras del transverso.', cite: 'Fossum p. 408, 411' },
                  { title: 'Borde craneal.', body: 'Continuo simple con 2-0 absorbible o no absorbible uniendo el borde craneal de la incisión gástrica con el craneal de la pared, empezando por la mitad dorsal (fig. 18.79B).', cite: 'Fossum p. 408' },
                  { title: 'Borde caudal.', body: 'Otro continuo uniendo los bordes caudales (fig. 18.79C).', cite: 'Fossum p. 408' },
                  { title: 'Contacto muscular.', body: 'La capa muscular del estómago debe quedar en contacto con el músculo de la pared: es lo que forma la adherencia.', cite: 'Fossum p. 408' },
                  { title: 'Más contacto (opcional).', body: 'Puedes levantar colgajos en el estómago y en la pared para aumentar la superficie de contacto.' },
                  { title: 'Revisa la posición.', body: 'Estómago en posición anatómica, píloro sin torcer, pexia sin tensión.' },
                ],
              },
              { type: 'note', kind: 'tip', title: 'Variante transversa (fig. 18.80)', text: 'Incisión horizontal en el antro suturada a una incisión que cruza las fibras del transverso. Más fácil sin ayudante: primero el borde dorsal (aborad) y luego el ventral (orad) (p. 409).' },
              { type: 'note', kind: 'error', title: 'Errores frecuentes', bullets: ['Pexia del fundus o en el lado izquierdo (salvo la hernia de hiato): mala posición, no evita el vólvulo.', 'Perforar la mucosa: contamina y debilita.', 'Incluir la pexia en el cierre de la línea media: una futura laparotomía cortaría el estómago.', 'Mala posición del estómago: obstrucción de la salida y vómitos crónicos (p. 416).'] },
            ],
          },
          {
            id: 'cinturon',
            title: 'B. En cinturón (belt-loop)',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Colgajo gástrico.', body: 'Levanta un colgajo seromuscular en el antro.', cite: 'Fossum p. 409' },
                  { title: 'Túnel en la pared.', body: 'Dos incisiones transversas en la pared ventrolateral, de 3–5 cm de largo y separadas 2,5–4 cm, por el peritoneo y la musculatura; túnel entre ellas con una pinza (fig. 18.81).', cite: 'Fossum p. 409' },
                  { title: 'Pasa el colgajo.', body: 'Con puntos de sostén en su borde, pásalo de craneal a caudal bajo el puente muscular.', cite: 'Fossum p. 410' },
                  { title: 'Sutura.', body: 'Une el colgajo a su margen gástrico original con un continuo simple de 2-0 o grapas. Puedes añadir puntos entre pared y estómago para quitar tensión.', cite: 'Fossum p. 410' },
                ],
              },
            ],
          },
          {
            id: 'circuncostal',
            title: 'C. Circuncostal',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Colgajo.', body: 'Colgajo con bisagra de una o dos capas, de unos 5–6 cm en perros grandes, en la seromuscular del antro; si es de una bisagra, la bisagra hacia la curvatura menor (fig. 18.77A).', cite: 'Fossum p. 407–408' },
                  { title: 'Incisión sobre la costilla.', body: 'De 5–6 cm sobre la 11.ª o 12.ª costilla a la altura de la unión costocondral, sin entrar en las inserciones del diafragma (neumotórax).', cite: 'Fossum p. 408' },
                  { title: 'Túnel.', body: 'Bajo la costilla con una pinza Carmalt.', cite: 'Fossum p. 408' },
                  { title: 'Pasa y sutura.', body: 'Pasa el colgajo craneodorsal bajo la costilla y sutúralo con 2-0 absorbible a su margen original (una bisagra) o al otro colgajo (dos bisagras).', cite: 'Fossum p. 408' },
                ],
              },
            ],
          },
          {
            id: 'sonda',
            title: 'D. Con sonda (gastrostomía)',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Sonda.', body: 'Incisión punzante en la pared derecha, caudal a la última costilla y 4–10 cm lateral a la línea media; pasa una Foley de 18–30 Fr o una sonda de silicona con hongo.', cite: 'Fossum p. 407' },
                  { title: 'Bolsa de tabaco.', body: 'En una zona poco vascularizada de la cara ventral del antro donde el balón no obstruya la salida: bolsa de tabaco de 2-0 absorbible, incisión punzante en el centro y sonda dentro; infla el balón con salino, no con aire.', cite: 'Fossum p. 407' },
                  { title: 'Puntos de fijación.', body: '3–4 puntos absorbibles preanudados entre el antro y la pared donde sale la sonda, sin perforarla; tracciona la sonda y anuda.', cite: 'Fossum p. 407' },
                  { title: 'Fijación a la piel.', body: 'Patrón en sandalia romana (resiste más que los puntos de fricción), vendaje y collar.', cite: 'Fossum p. 407' },
                  { title: 'Retiro.', body: 'A los 7–10 días: desinfla y retira; la herida de la piel se deja abierta para que drene.', cite: 'Fossum p. 407' },
                ],
              },
            ],
          },
          {
            id: 'laparoscopica',
            title: 'E. Asistida por laparoscopia y minilaparotomía',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Laparoscopia: cánulas.', body: 'Decúbito dorsal. Primera cánula justo caudal al ombligo; la segunda, de 10 mm, a la derecha de la línea media y 2–4 cm caudal a la última costilla, paralela a ella.', cite: 'Fossum p. 410' },
                  { title: 'Toma el antro.', body: 'Con una Babcock, a medio camino entre las curvaturas y 6–8 cm del píloro; sácalo junto con la cánula hasta ver la pared gástrica asomando.', cite: 'Fossum p. 410' },
                  { title: 'Pexia.', body: 'Amplía la incisión a 4–5 cm, coloca puntos de sostén y haz la pexia incisional. No tuerzas el antro; revisa por laparoscopia antes de cerrar.', cite: 'Fossum p. 410' },
                  { title: 'Minilaparotomía.', body: 'Decúbito lateral izquierdo; incisión vertical de 6 cm justo caudal y ventral a la 13.ª costilla derecha, disección roma de los músculos, toma del antro con Babcock y puntos de sostén.', cite: 'Fossum p. 414–415' },
                  { title: 'Minilaparotomía: pexia.', body: 'Palpa el píloro para confirmar; incisión de 3 cm en la seromuscular unos 5 cm orad al píloro y sutura a los músculos con continuo simple desde el borde dorsal.', cite: 'Fossum p. 415' },
                ],
              },
            ],
          },
          {
            id: 'dvg',
            title: 'F. Durante una dilatación-vólvulo',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Estabiliza y descomprime.', body: 'Líquidos de choque por dos vías gruesas (hasta 90 mL/kg o más), descompresión por sonda o trocarización antes de la cirugía.', cite: 'Fossum p. 435' },
                  { title: 'Reposiciona.', body: 'El píloro suele estar a la izquierda: llévalo a la derecha mientras empujas el fundus hacia dorsal.' },
                  { title: 'Valora la viabilidad.', body: 'Color de la serosa, textura y grosor de la pared, permeabilidad vascular y sangrado al incidir; no por el color de la mucosa. Si dudas, reseca o invagina la curvatura mayor.', cite: 'Fossum p. 402' },
                  { title: 'Bazo.', body: 'Revisa el bazo y sus vasos; esplenectomía si está torcido o trombosado.' },
                  { title: 'Pexia.', body: 'Incisional en el antro derecho, igual que la preventiva.' },
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
              { title: 'Electrolitos.', body: 'Sobre todo el potasio, y ECG si hubo o se esperan arritmias (DVG).', cite: 'Fossum p. 416' },
              { title: 'Líquidos.', body: 'Hasta que beba lo suficiente.' },
              { title: 'Comida.', body: 'A las 12 h si no vomita.', cite: 'Fossum p. 416' },
              { title: 'Analgesia y reposo.', body: 'AINE 3–5 días en la pexia preventiva; paseos con correa 10–14 días.' },
              { title: 'Manejo de por vida.', body: 'Varias comidas pequeñas al día y nada de ejercicio intenso una hora antes y después de comer.' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Cicatrización gástrica', text: 'El estómago tiene una irrigación muy rica, pocas bacterias por la acidez, un epitelio que se regenera rápido y la defensa del omento: cicatriza rápido. Por su pared gruesa cuesta encontrar los vasos que sangran; presión suave en lugar de pinzas aplastantes o electrocauterio (p. 415).' },
        ],
      },
    ],
    closure: [
      { layer: 'Gastropexia incisional o en cinturón', suture: 'Absorbible o no absorbible monofilamento', gauge: '2-0', pattern: 'Dos continuos simples (craneal y luego caudal)', why: 'Muscular gástrica contra músculo de la pared para una adherencia permanente.' },
      { layer: 'Circuncostal', suture: 'Absorbible', gauge: '2-0', pattern: 'Colgajo al margen original o al otro colgajo', why: 'El colgajo rodea la costilla y da la adherencia más fuerte.' },
      { layer: 'Mucosa perforada por error', suture: 'Absorbible', gauge: '3-0', pattern: 'Continuo', why: 'Cierra la luz antes de seguir.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Estómago mal posicionado', prevent: 'Antro sin torcer, revisar antes de anudar y por laparoscopia antes de cerrar.', manage: 'Obstrucción de la salida y vómitos crónicos: nueva pexia.' },
      { name: 'Neumotórax y fractura costal', prevent: 'No entrar en el diafragma en la circuncostal.', manage: 'Toracocentesis.' },
      { name: 'Fuga y peritonitis (sonda)', prevent: 'Bolsa de tabaco y fijación correctas; sonda 7–10 días.', manage: 'Reintervención y lavado.' },
      { name: 'Perforación de la mucosa', prevent: 'Incidir solo la seromuscular.', manage: 'Cerrar la mucosa con 3-0 absorbible.' },
      { name: 'Vómitos o diarrea transitorios', prevent: '—', manage: 'Suelen ceder en menos de 7 días (p. 416).' },
      { name: 'Dilatación sin vólvulo', prevent: 'Manejo alimentario.', manage: 'Descompresión; la pexia no la evita.' },
    ],
    quiz: [
      { q: '¿Dónde se hace la gastropexia por DVG y dónde por hernia de hiato?', a: 'Por DVG, antro pilórico a la pared derecha; por hernia de hiato, fundus a la pared izquierda.' },
      { q: '¿Qué incides en el estómago y qué en la pared en la técnica incisional?', a: 'La seromuscular del antro, longitudinal entre las curvaturas; el peritoneo y el transverso del abdomen, paralelo a sus fibras.' },
      { q: '¿En qué orden se suturan los bordes?', a: 'Primero el craneal y luego el caudal, con la muscular gástrica en contacto con el músculo.' },
      { q: '¿Qué técnica da la adherencia más fuerte y cuál es su riesgo?', a: 'La circuncostal; puede causar neumotórax o fractura costal.' },
      { q: '¿Qué técnica permite descomprimir el estómago después?', a: 'La gastropexia con sonda, que se deja 7–10 días.' },
      { q: '¿La pexia evita la dilatación?', a: 'No, evita el vólvulo; el perro puede dilatarse y debe consultar de urgencia.' },
    ],
    videos: [
      { title: 'Incisional Gastropexy', url: 'https://www.youtube.com/watch?v=E5hWZcyRXoo', channel: 'Alex Fox-Alvarez, cirujano veterinario', lang: 'inglés', note: 'Paso a paso de la técnica preventiva' },
      { title: 'Right open technique gastropexy in dog', url: 'https://www.youtube.com/watch?v=wfX2shluCb4', channel: 'Federico Massari, Dipl. ECVS', lang: 'inglés' },
      { title: 'How to perform a gastropexy in a dog', url: 'https://www.youtube.com/watch?v=Yy3hj5zUP4s', channel: 'VETgirl', lang: 'inglés' },
    ],
    sources: [
      SOURCES.fossum(18, 'cirugía del sistema digestivo: gastropexia (pp. 406–415), cicatrización, cuidados y complicaciones del estómago (pp. 415–416), DVG (pp. 419–425)'),
      SOURCES.fossum(19, 'cirugía de la cavidad abdominal: tabla 19.1 y cierre (pp. 514–518)'),
      { text: 'Ward MP y col. Beneficio de la gastropexia profiláctica en razas con riesgo de DVG. JAVMA, 2003.', kind: 'complemento' },
      SOURCES.plumbs,
    ],
  },
};
