// Enterectomía y anastomosis (id 7). Full depth: resection margins and end-to-end anastomosis.
const { pick, ABDOMINAL_CLOSURE, CELIOTOMY_STEPS, SOURCES } = require('./_common');

module.exports = {
  id: 7,
  legacy: {
    indicaciones: 'Segmento intestinal no viable (vólvulo mesentérico, intususcepción irreductible o necrótica, cuerpo extraño con necrosis o perforación); neoplasia intestinal; estenosis; perforación con contaminación extensa.',
    tecnica_quirurgica: 'Celiotomía media y exploración completa. Delimitar el segmento con márgenes de intestino sano (4–8 cm en neoplasias). Doble ligadura de los vasos arcuados y mesentéricos que irrigan el segmento. Pinzas atraumáticas o dedos del ayudante para ocluir la luz; pinzas aplastantes en el lado que se extirpa. Sección oblicua (60°) en el lado antimesentérico si hay disparidad de luces. Anastomosis término-terminal en una capa aposicional (simples interrumpidos o dos continuos simples), empezando por los bordes mesentérico y antimesentérico. Cierre del mesenterio, prueba de fugas, omentalización y cambio de instrumental.',
    material_quirurgico: 'Instrumental de laparotomía, separador de Balfour, pinzas Doyen (atraumáticas) y Carmalt (aplastantes), tijera de Metzenbaum, compresas húmedas, aspirador, jeringa con aguja 25 G. Opcional: grapadora gastrointestinal (GIA y TA).',
    tipo_sutura: 'Anastomosis: PDS o Monocryl 3-0 o 4-0, aguja ahusada, una capa aposicional. Vasos mesentéricos: 3-0 absorbible. Mesenterio: continuo simple 4-0. Pared abdominal según peso.',
    complicaciones_frecuentes: 'Dehiscencia de la anastomosis y peritonitis séptica (días 3–5); estenosis; íleo; síndrome de intestino corto si se resecciona más del 70–80 %; recidiva de intususcepción.',
    manejo_anestesico_sugerido: 'Estabilización previa; maropitant; inducción en secuencia rápida con intubación inmediata; cefazolina IV prequirúrgica; analgesia con opioide en infusión (fentanilo) o bolos de metadona, lidocaína y ketamina en infusión; AINE solo si está normotenso y sin peritonitis.',
    consideraciones_por_raza: 'Cachorros: intususcepción secundaria a parasitosis o enteritis (parvovirus). Gatos: linfoma y adenocarcinoma intestinal; Siameses con más adenocarcinoma.',
    consideraciones_comorbilidades: 'Hipoalbuminemia, peritonitis previa y anastomosis múltiples aumentan el riesgo de dehiscencia. En neoplasias, biopsiar linfonodos mesentéricos e hígado.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 20; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Resección de un segmento de intestino delgado y unión de los extremos sanos. Se hace cuando el intestino no es viable o tiene un tumor; el éxito depende de dejar márgenes de tejido bien irrigado y de una anastomosis sin tensión ni fugas.',
    meta: { species: ['perro', 'gato'], duration: '60–120 min', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Decide los márgenes por la viabilidad, no por la apariencia del cuerpo extraño: corta en intestino que sangra y late.',
      'Liga los vasos que irrigan el segmento antes de cortar el intestino, respetando los que llegan a los extremos que quedan.',
      'Si los extremos tienen distinto diámetro, corta el más pequeño en oblicuo por el lado antimesentérico.',
      'Los dos primeros puntos van en el borde mesentérico y el antimesentérico; el mesentérico es donde más fugas hay.',
      'Prueba de fugas, omento y cambio de guantes e instrumental antes de cerrar el abdomen.',
    ],
    indications: [
      'Segmento no viable: vólvulo mesentérico, intususcepción necrótica o irreductible, isquemia por cuerpo extraño.',
      'Perforación o laceración extensa.',
      'Neoplasia intestinal (adenocarcinoma, leiomiosarcoma, GIST, linfoma focal).',
      'Estenosis.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Estabiliza.', body: 'Fluidos, electrolitos, albúmina si está muy baja. En peritonitis séptica, estabilizar sin demorar demasiado la cirugía.' },
              { title: 'Profilaxis antibiótica.', body: 'Cefazolina IV 30–60 min antes; si ya hay peritonitis o perforación, antibiótico terapéutico de amplio espectro (por ejemplo ampicilina con enrofloxacino o una cefalosporina de tercera generación con metronidazol, según el protocolo de tu clínica).' },
              { title: 'Estadificación en neoplasias.', body: 'Radiografía de tórax y ecografía abdominal para ver linfonodos y metástasis antes de decidir.' },
            ],
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        blocks: [{ type: 'drugs', items: pick('maropitant', 'metadona', 'midazolam', 'fentanilo', 'propofol', 'alfaxalona', 'isoflurano', 'ketamina', 'cefazolina', 'lidocainaLocal', 'metadonaPost') }],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          { id: 'abordaje', title: 'A. Abordaje y decisión', blocks: [{ type: 'steps', items: [...CELIOTOMY_STEPS, { title: 'Delimita.', body: 'Identifica el segmento afectado y marca los márgenes: en isquemia, hasta el tejido claramente viable; en neoplasias, 4–8 cm a cada lado del tumor.' }] }] },
          {
            id: 'reseccion',
            title: 'B. Resección',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Exterioriza y aísla.', body: 'Saca el segmento y rodéalo con compresas húmedas.' },
                  { title: 'Liga los vasos.', body: 'Doble ligadura de los vasos arcuados que llegan al segmento y de los vasos yeyunales del mesenterio que solo irrigan la parte que se va. Corta entre ligaduras.' },
                  { title: 'Ordeña el contenido.', body: 'Empuja el contenido lejos de los extremos en 4–5 cm a cada lado.' },
                  { title: 'Ocluye.', body: 'Pinzas Doyen o los dedos del ayudante en el intestino que queda; pinzas Carmalt aplastantes en el lado que se extirpa.' },
                  { title: 'Corta.', body: 'Con bisturí o tijera, a lo largo de la cara externa de las pinzas aplastantes. Si las luces son distintas, corta el extremo más estrecho en oblicuo (60°) con la parte más larga en el borde mesentérico.' },
                  { title: 'Retira el segmento.', body: 'Envíalo a histopatología si hay sospecha de tumor o la causa no está clara. Recorta la mucosa evertida a ras de la serosa.' },
                ],
              },
            ],
          },
          {
            id: 'anastomosis',
            title: 'C. Anastomosis término-terminal',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Primer punto: borde mesentérico.', body: 'Punto simple de espesor completo que une ambos bordes mesentéricos; aquí la grasa oculta la pared y es donde más fugas hay.' },
                  { title: 'Segundo punto: borde antimesentérico.', body: 'Opuesto al primero, a 180°. Deja los cabos largos como puntos de sostén.' },
                  { title: 'Completa una cara.', body: 'Puntos simples separados 2–3 mm, a 2–3 mm del borde, incluyendo la submucosa en cada pasada. O un continuo simple desde cada punto de sostén.' },
                  { title: 'Gira y completa la otra.', body: 'Rota el intestino con los puntos de sostén y cierra la cara opuesta igual.' },
                  { title: 'Prueba de fugas.', body: 'Ocluye a ambos lados, distiende con solución salina con aguja 25 G y refuerza donde salga líquido.' },
                  { title: 'Cierra el mesenterio.', body: 'Continuo simple de 4-0, sin tomar los vasos que irrigan la anastomosis.' },
                  { title: 'Omentaliza y lava.', body: 'Envuelve la anastomosis con omento, lava el abdomen y cambia guantes e instrumental.' },
                ],
              },
              { type: 'note', kind: 'tip', title: 'Con grapadora', text: 'La anastomosis funcional término-terminal con grapadora GIA y TA es más rápida y tiene tasas de dehiscencia similares o menores, útil en pacientes inestables o con peritonitis.' },
              { type: 'note', kind: 'book', title: 'Intususcepción', text: 'Intenta reducirla con tracción suave del intestino invaginado (no empujando). Si no se reduce o el segmento no es viable, enterectomía. La enteroplicatura para prevenir la recidiva es controvertida y puede causar obstrucción.' },
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
              { title: 'Alimentación temprana.', body: 'Comida blanda en 12–24 h; si no come, sonda nasoesofágica o esofágica.' },
              { title: 'Analgesia y fluidos.', body: 'Opioide 24–72 h, fluidos y potasio hasta que coma solo.' },
              { title: 'Vigila la dehiscencia.', body: 'Días 3–5: fiebre, dolor, vómitos, decaimiento. Ecografía y citología del líquido abdominal.' },
              { title: 'Histopatología.', body: 'Define el tratamiento oncológico si era un tumor.' },
            ],
          },
        ],
      },
    ],
    closure: [
      { layer: 'Vasos arcuados y yeyunales', suture: 'PDS o Monocryl', gauge: '3-0', pattern: 'Doble ligadura', why: 'Solo los que irrigan el segmento que se extirpa.' },
      { layer: 'Anastomosis', suture: 'PDS o Monocryl, aguja ahusada', gauge: '3-0 o 4-0', pattern: 'Una capa aposicional: simples o dos continuos', why: 'Incluye la submucosa sin estrechar la luz.' },
      { layer: 'Mesenterio', suture: 'Monocryl', gauge: '4-0', pattern: 'Continuo simple', why: 'Evita hernias internas sin comprometer la irrigación.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Dehiscencia y peritonitis', prevent: 'Márgenes viables, puntos mesentéricos cuidadosos, prueba de fugas, omento, alimentación temprana.', manage: 'Reintervención, nueva resección, lavado, drenaje activo o abdomen abierto.' },
      { name: 'Estenosis', prevent: 'Corte oblicuo con luces dispares, una capa aposicional.', manage: 'Nueva resección.' },
      { name: 'Síndrome de intestino corto', prevent: 'Reseccionar solo lo necesario.', manage: 'Dieta muy digestible, comidas frecuentes, suplementos.' },
      { name: 'Íleo', prevent: 'Manipulación suave, analgesia, alimentación temprana.', manage: 'Procinéticos, corregir el potasio.' },
    ],
    quiz: [
      { q: '¿Qué márgenes dejas en un tumor intestinal?', a: '4–8 cm de intestino sano a cada lado.' },
      { q: '¿Qué haces si los extremos tienen distinto diámetro?', a: 'Cortar el extremo más estrecho en oblicuo por el lado antimesentérico para igualar las luces.' },
      { q: '¿Por qué el primer punto va en el borde mesentérico?', a: 'Porque la grasa mesentérica oculta la pared y es donde más fugas se producen.' },
      { q: '¿Qué capa del intestino debe incluir cada punto?', a: 'La submucosa, que es la que sostiene la sutura.' },
    ],
    videos: [
      { title: 'Intestinal resection and anastomosis', url: 'https://www.youtube.com/watch?v=ZzEdo43ZSxM', channel: 'Stanley Kim', lang: 'inglés', note: 'En modelo sintético, muy didáctico' },
      { title: 'Anastomosis intestinal con Monosyn', url: 'https://www.youtube.com/watch?v=bQJ_85GjTIA', channel: 'B. Braun VetCare ES', lang: 'español', note: 'Con un cirujano diplomado ECVS' },
    ],
    sources: [
      SOURCES.fossum(20, 'cirugía del sistema digestivo (intestino delgado)'),
      { text: 'Duell JR y col. Dehiscencia tras anastomosis con grapadora versus sutura manual en perros. Veterinary Surgery, 2016.', kind: 'complemento' },
      SOURCES.aaha,
      SOURCES.plumbs,
    ],
  },
};
