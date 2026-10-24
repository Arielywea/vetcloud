// Gastropexia preventiva (id 6). Full depth: incisional technique, laparoscopic option, during GDV.
const { pick, ABDOMINAL_CLOSURE, SOURCES } = require('./_common');

module.exports = {
  id: 6,
  legacy: {
    indicaciones: 'Prevención de la dilatación-vólvulo gástrico (DVG) en razas de pecho profundo, idealmente junto con la esterilización; tratamiento definitivo tras resolver una DVG; hernia de hiato recurrente.',
    tecnica_quirurgica: 'Gastropexia incisional en el lado derecho: incisión de 4–5 cm en la seromuscular del antro pilórico, paralela al eje largo del estómago, e incisión de igual largo en el músculo transverso del abdomen derecho, caudal a la última costilla. Sutura de los bordes craneales y caudales de ambas incisiones con dos continuos simples de absorbible monofilamento 2-0. Alternativas: laparoscópica asistida, en cinturón o circuncostal.',
    material_quirurgico: 'Instrumental de laparotomía, separador de Balfour, pinzas Babcock, hilo para puntos de sostén, compresas húmedas, torre de laparoscopia con trócares y pinzas atraumáticas (solo variante laparoscópica)',
    tipo_sutura: 'Gastropexia: PDS 2-0 (o 0 en perros gigantes), dos continuos simples. Pared abdominal según peso.',
    complicaciones_frecuentes: 'Raras: seroma, infección de la herida, neumotórax si se perfora el diafragma (técnicas circuncostales), falla de la pexia. Tras la gastropexia puede haber dilatación, pero el vólvulo es excepcional.',
    manejo_anestesico_sugerido: 'Protocolo habitual de laparotomía en paciente sano: metadona ± dexmedetomidina, propofol o alfaxalona, inhalatorio, bloqueo incisional y AINE postoperatorio. En DVG: estabilización previa, sin α2, con fentanilo y lidocaína en infusión.',
    consideraciones_por_raza: 'Gran Danés (riesgo de por vida de hasta 40 %), San Bernardo, Weimaraner, Setter irlandés, Gordon setter, Pastor alemán, Dóberman, Basset hound, Akita, Bloodhound.',
    consideraciones_comorbilidades: 'Si se hace con la OVH, ampliar la incisión hacia craneal. En DVG, la gastropexia se hace siempre después de reposicionar el estómago y valorar su viabilidad.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 20; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Fijación permanente del antro pilórico a la pared abdominal derecha para que el estómago no pueda rotar. En razas de pecho profundo previene una urgencia mortal con una cirugía corta, idealmente en el mismo acto que la esterilización.',
    meta: { species: ['perro'], duration: '20–40 min (sola o añadida a otra cirugía)', difficulty: 'básica', contamination: 'limpia' },
    before_you_start: [
      'La pexia va en el lado derecho, en el antro pilórico, nunca en el fundus ni en el lado izquierdo.',
      'Incide solo la seromuscular del estómago: si ves mucosa (aterciopelada, rosada), te pasaste.',
      'La incisión de la pared va en el transverso del abdomen, caudal a la última costilla y unos centímetros lateral a la línea media.',
      'Comprueba antes de suturar que el estómago queda en posición normal y sin tensión.',
      'En una DVG, primero descomprime, reposiciona y valora la viabilidad; la pexia es el último paso.',
    ],
    indications: [
      'Prevención en razas de pecho profundo, sobre todo si hay un familiar con DVG.',
      'Siempre después de corregir una DVG (sin pexia, la recidiva supera el 50 %).',
      'Hernia de hiato que recidiva (gastropexia izquierda en ese caso).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Momento.', body: 'En cachorros de raza grande se suele hacer junto con la esterilización (a partir de los 6 meses, o según la edad que se discuta para cada raza). En machos se puede hacer con la orquiectomía o por laparoscopia.' },
              { title: 'Ayuno y exámenes.', body: 'Como cualquier cirugía electiva en paciente sano.' },
              { title: 'Tutor.', body: 'Explica que la pexia evita el vólvulo pero no la dilatación: si el perro se hincha, igual debe venir de urgencia.' },
            ],
          },
          { type: 'table', columns: ['Técnica', 'Ventajas', 'Inconvenientes'], rows: [['Incisional', 'Simple, rápida, fuerte; la más usada', 'Requiere laparotomía'], ['Laparoscópica asistida', 'Incisiones pequeñas, recuperación rápida', 'Equipo y entrenamiento'], ['En cinturón (belt-loop)', 'Muy resistente', 'Más disección'], ['Circuncostal', 'Muy resistente', 'Riesgo de neumotórax; más compleja']], caption: 'Todas producen adherencias firmes; la incisional es suficiente en la gran mayoría de los perros.' },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        blocks: [{ type: 'drugs', items: pick('metadona', 'dexmed', 'propofol', 'alfaxalona', 'isoflurano', 'lidocainaLocal', 'meloxicam', 'carprofeno') }],
      },
      {
        id: 'tecnica',
        title: 'Técnica incisional paso a paso',
        blocks: [
          { type: 'figure', key: 'gastropexy-incisional', caption: 'Incisión en la seromuscular del antro pilórico e incisión del mismo largo en el transverso del abdomen derecho, caudal a la última costilla. Se unen los bordes craneales entre sí y los caudales entre sí.' },
          {
            type: 'steps',
            items: [
              { title: 'Celiotomía.', body: 'Línea media desde el xifoides hasta caudal al ombligo (o ampliando la incisión de la OVH hacia craneal).' },
              { title: 'Identifica el antro.', body: 'Localiza el píloro y el antro pilórico y llévalos hacia la pared abdominal derecha sin tensión, a unos 3–5 cm caudal a la última costilla.' },
              { title: 'Marca el sitio de la pared.', body: 'Retrae la pared derecha y elige un punto en el transverso del abdomen, unos centímetros dorsal a la unión con el recto, donde el antro llega cómodo.' },
              { title: 'Incisión en el antro.', body: 'Incisión de 4–5 cm en la seromuscular del antro, paralela al eje largo del estómago, a medio camino entre la curvatura mayor y la menor. Separa los bordes con disección roma sin entrar en la submucosa.' },
              { title: 'Incisión en la pared.', body: 'Incisión del mismo largo en el peritoneo y el transverso del abdomen, perpendicular a las fibras (craneocaudal), sin atravesar los oblicuos.' },
              { title: 'Sutura craneal.', body: 'Continuo simple con PDS 2-0 uniendo el borde craneal de la incisión gástrica al borde craneal de la incisión de la pared, empezando por el extremo más dorsal.' },
              { title: 'Sutura caudal.', body: 'Otro continuo simple uniendo los bordes caudales. Las dos superficies cruentas quedan en contacto.' },
              { title: 'Comprueba.', body: 'El estómago debe estar en posición anatómica, el píloro sin torcer y la pexia sin tensión.' },
            ],
          },
          { type: 'note', kind: 'error', title: 'Errores frecuentes', bullets: ['Pexia del fundus o en el lado izquierdo: deja el estómago en mala posición y no evita el vólvulo.', 'Perforar la mucosa gástrica: contamina y debilita.', 'Incorporar la pexia a la incisión de la línea media: si luego hay que operar, se corta el estómago al abrir.'] },
        ],
      },
      {
        id: 'laparoscopica',
        title: 'Variante laparoscópica asistida',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Portales.', body: 'Un portal umbilical para la cámara y otro en el sitio de la pexia, a la derecha, caudal a la última costilla.' },
              { title: 'Toma el antro.', body: 'Con pinzas atraumáticas, lleva el antro hasta el portal derecho y sácalo por esa incisión ampliada a 3–4 cm.' },
              { title: 'Pexia extracorpórea.', body: 'Incide la seromuscular y sutúrala a los bordes del transverso a través de esa misma incisión, como en la técnica abierta.' },
            ],
          },
        ],
      },
      {
        id: 'dvg',
        title: 'Durante una dilatación-vólvulo',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Estabiliza y descomprime.', body: 'Fluidos por dos vías gruesas, descompresión por sonda o trocarización antes de la cirugía.' },
              { title: 'Reposiciona.', body: 'El estómago suele rotar en sentido horario (vista desde el cirujano). Toma el píloro, que está a la izquierda, y llévalo a la derecha mientras empujas el fundus hacia dorsal.' },
              { title: 'Valora.', body: 'Viabilidad de la pared gástrica (color, grosor, sangrado al cortar) y del bazo; resecciona lo necrótico.' },
              { title: 'Pexia.', body: 'Incisional en el antro derecho, igual que la preventiva.' },
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
              { title: 'Igual que la cirugía a la que acompaña.', body: 'Analgesia 3–5 días, reposo con correa 10–14 días.' },
              { title: 'Alimentación.', body: 'Varias comidas pequeñas al día y sin ejercicio intenso una hora antes y después de comer, aun con pexia.' },
            ],
          },
        ],
      },
    ],
    closure: [
      { layer: 'Gastropexia (antro a transverso)', suture: 'PDS', gauge: '2-0 (0 en perros gigantes)', pattern: 'Dos continuos simples (bordes craneales y caudales)', why: 'Las superficies cruentas en contacto forman una adherencia permanente.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Falla de la pexia', prevent: 'Superficies cruentas amplias, suturas firmes, sin tensión.', manage: 'Nueva pexia si hay recidiva.' },
      { name: 'Perforación gástrica', prevent: 'Incidir solo la seromuscular.', manage: 'Cerrar la mucosa por separado y lavar.' },
      { name: 'Neumotórax', prevent: 'Evitar el diafragma (técnicas circuncostales).', manage: 'Toracocentesis.' },
      { name: 'Seroma o infección de la herida', prevent: 'Asepsia, cierre del espacio muerto.', manage: 'Conservador o drenaje.' },
    ],
    quiz: [
      { q: '¿Dónde se hace la gastropexia preventiva y por qué?', a: 'En el antro pilórico a la pared derecha (transverso del abdomen), porque fija el estómago en su posición normal e impide la rotación.' },
      { q: '¿Qué capas incides en el estómago?', a: 'Solo la seromuscular; la submucosa y la mucosa quedan intactas.' },
      { q: '¿La pexia evita la dilatación?', a: 'No, evita el vólvulo; un perro con pexia puede dilatarse y debe consultar igual.' },
      { q: '¿Por qué no se incluye la pexia en el cierre de la línea media?', a: 'Porque una futura laparotomía cortaría el estómago al abrir la línea alba.' },
    ],
    videos: [
      { title: 'Incisional Gastropexy', url: 'https://www.youtube.com/watch?v=E5hWZcyRXoo', channel: 'Alex Fox-Alvarez, cirujano veterinario', lang: 'inglés', note: 'Paso a paso de la técnica preventiva' },
      { title: 'Right open technique gastropexy in dog', url: 'https://www.youtube.com/watch?v=wfX2shluCb4', channel: 'Federico Massari, Dipl. ECVS', lang: 'inglés' },
      { title: 'How to perform a gastropexy in a dog', url: 'https://www.youtube.com/watch?v=Yy3hj5zUP4s', channel: 'VETgirl', lang: 'inglés' },
    ],
    sources: [
      SOURCES.fossum(20, 'cirugía del sistema digestivo (estómago)'),
      { text: 'Ward MP y col. Beneficio de la gastropexia profiláctica en razas con riesgo de DVG. JAVMA, 2003.', kind: 'complemento' },
      { text: 'Allen P, Paul A. Gastropexia para la prevención de la DVG: revisión. JAAHA, 2014.', kind: 'complemento' },
      SOURCES.plumbs,
    ],
  },
};
