// Perineorrafia / herniorrafia perineal (id 14). Full depth: internal obturator transposition.
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 14,
  legacy: {
    indicaciones: 'Hernia perineal (falla del diafragma pélvico entre el esfínter anal externo, el elevador del ano y el coccígeo), casi siempre en machos enteros de edad media a avanzada; con o sin retroflexión de vejiga o próstata.',
    tecnica_quirurgica: 'Castración en el mismo acto. Decúbito esternal con la pelvis elevada y la cola hacia craneal. Incisión curva sobre la hernia, 1–2 cm lateral al ano. Reducción del contenido. Técnica de transposición del obturador interno: se eleva el músculo desde el isquion y se sutura con puntos simples entre el esfínter anal externo, el coccígeo y el elevador del ano remanentes, y el obturador. Cierre de subcutáneo y piel. Opcional: colopexia, cistopexia o deferentopexia si hay retroflexión.',
    material_quirurgico: 'Instrumental de tejidos blandos, separadores de Gelpi, elevador de periostio, sonda urinaria (para identificar la uretra), torunda rectal o bolsa de tabaco, pinzas de Allis.',
    tipo_sutura: 'Herniorrafia: PDS 2-0 o 0, puntos simples separados (algunos cirujanos usan no absorbible monofilamento, polipropileno). Subcutáneo: Monocryl 3-0. Piel: nylon 3-0 o intradérmico 4-0. Bolsa de tabaco anal: nylon 2-0 (retirar al final).',
    complicaciones_frecuentes: 'Infección de la herida (por cercanía del ano); tenesmo; incontinencia fecal transitoria; recidiva (10–45 % según la técnica y si se castra); lesión del nervio ciático o pudendo; prolapso rectal.',
    manejo_anestesico_sugerido: 'Epidural con morfina y bupivacaína (excelente para la zona perineal). Metadona ± dexmedetomidina, propofol, inhalatorio. Cefazolina IV prequirúrgica (herida limpia-contaminada). AINE postoperatorio si normotenso. Ablandador de heces antes y después.',
    consideraciones_por_raza: 'Bóxer, Collie, Kelpie, Pekinés, Boston terrier, Dachshund, Old English Sheepdog y mestizos de cola corta; casi exclusiva de machos enteros.',
    consideraciones_comorbilidades: 'Retroflexión de vejiga: urgencia (obstrucción urinaria); descomprimir por cistocentesis y reposicionar antes. Prostatomegalia: castrar. Estreñimiento crónico: dieta con fibra y lactulosa.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 22 (recto y ano) y cap. 26; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Reparación del diafragma pélvico cuando los músculos que rodean el ano ceden y el recto, la grasa, la próstata o la vejiga se desplazan bajo la piel. La técnica de transposición del obturador interno cierra el defecto sin tensión; la castración en el mismo acto reduce la recidiva.',
    meta: { species: ['perro'], duration: '60–90 min por lado', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Descarta y trata primero una retroflexión de vejiga: es una urgencia por obstrucción urinaria.',
      'Vacía el recto con enema 12–24 h antes (no justo antes: sale contenido líquido durante la cirugía) y pon una bolsa de tabaco anal.',
      'Coloca una sonda urinaria: te ayuda a identificar la uretra y protegerla.',
      'Ubica el nervio pudendo, la arteria y vena pudendas internas y el nervio ciático antes de suturar: los puntos se pasan medial a ellos.',
      'Castra en el mismo acto si el perro está entero.',
    ],
    indications: [
      'Hernia perineal uni o bilateral con tenesmo, estreñimiento, aumento de volumen perineal o disuria.',
      'Retroflexión de vejiga o próstata (urgente).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          { type: 'steps', items: [
            { title: 'Examen rectal.', body: 'Palpa el defecto en el diafragma pélvico y el desvío del recto (saculación, divertículo). Revisa ambos lados.' },
            { title: 'Imágenes.', body: 'Ecografía de la zona perineal y de la próstata; radiografía con contraste si sospechas retroflexión de vejiga.' },
            { title: 'Retroflexión de vejiga.', body: 'Cistocentesis a través de la hernia o sonda urinaria y reposición; estabiliza la azotemia antes de anestesiar.' },
            { title: 'Heces.', body: 'Lactulosa o dieta con fibra unos días antes; enema 12–24 h antes.' },
            { title: 'Antibiótico.', body: 'Cefazolina IV 30–60 min antes de incidir.' },
          ] },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        blocks: [{ type: 'drugs', items: [...pick('metadona', 'dexmed', 'propofol', 'isoflurano'), drug('Epidural', 'Morfina sin conservante', '0,1 mg/kg', 'Epidural lumbosacra', 'Analgesia del periné durante 12–24 h. Puede causar retención urinaria.'), drug('Epidural', 'Bupivacaína', '0,5 mg/kg', 'Epidural lumbosacra, junto con la morfina', 'Bloqueo sensitivo de 4–6 h.'), ...pick('cefazolina', 'meloxicam', 'buprenorfina')] }],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [{ type: 'list', items: [
          'Diafragma pélvico: esfínter anal externo (medial), elevador del ano y coccígeo (lateral), obturador interno (ventral, sobre el isquion) y ligamento sacrotuberoso (lateral, ausente en el gato).',
          'La hernia suele aparecer entre el esfínter anal externo y el elevador del ano, que se atrofia.',
          'Nervio pudendo y arteria y vena pudendas internas: corren sobre el obturador interno, en dirección caudomedial; inervan el esfínter anal. Si los lesionas, incontinencia fecal.',
          'Nervio ciático: craneolateral, junto al ligamento sacrotuberoso. Un punto que lo atrapa causa cojera grave.',
        ] }],
      },
      {
        id: 'tecnica',
        title: 'Técnica de transposición del obturador interno',
        blocks: [
          { type: 'steps', items: [
            { title: 'Posición.', body: 'Decúbito esternal, pelvis elevada en el borde acolchado de la mesa, cola fijada hacia craneal. Bolsa de tabaco anal.' },
            { title: 'Incisión.', body: 'Curva, sobre la hernia, 1–2 cm lateral al ano, desde la base de la cola hasta ventral al piso pélvico.' },
            { title: 'Saco y contenido.', body: 'Abre el saco herniario (fascia y peritoneo), reduce la grasa, la próstata o la vejiga empujando con una gasa húmeda.' },
            { title: 'Identifica los músculos.', body: 'Esfínter anal externo, coccígeo y elevador del ano (a menudo delgados), ligamento sacrotuberoso, nervio pudendo y vasos.' },
            { title: 'Eleva el obturador.', body: 'Incide la fascia y el periostio en el borde caudal del isquion y eleva el obturador interno con un elevador de periostio, dorsal y medialmente, hasta que llene el defecto ventral.' },
            { title: 'Coloca los puntos.', body: 'Puntos simples separados de PDS 2-0 o 0: primero entre el obturador y el esfínter anal externo, luego entre el obturador y el coccígeo o elevador, y entre el esfínter y el coccígeo dorsalmente. Pasa todos antes de anudar.' },
            { title: 'Anuda.', body: 'De ventral a dorsal. El defecto debe quedar cerrado sin tensión y el recto en su sitio.' },
            { title: 'Revisa el recto.', body: 'Con un dedo enguantado en el recto, comprueba que ningún punto lo atraviesa.' },
            { title: 'Cierra.', body: 'Subcutáneo con Monocryl 3-0 y piel con nylon 3-0. Retira la bolsa de tabaco.' },
          ] },
          { type: 'note', kind: 'error', title: 'Ojo con', bullets: ['El ligamento sacrotuberoso: el ciático pasa justo craneal. Si pones puntos ahí, rodea el ligamento sin profundizar.', 'El nervio pudendo: déjalo fuera de los puntos.', 'La uretra (sonda palpable): no la incluyas en los puntos ventrales.'] },
          { type: 'note', kind: 'tip', title: 'Pexias en casos con retroflexión', text: 'Colopexia (colon a la pared abdominal izquierda), cistopexia o deferentopexia por laparotomía en el mismo acto ayudan a que los órganos no vuelvan a la hernia.' },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [{ type: 'steps', items: [
          { title: 'Heces blandas.', body: 'Lactulosa o dieta húmeda con fibra 4–6 semanas para evitar el esfuerzo.' },
          { title: 'Analgesia.', body: 'AINE 5–7 días; opioide si hay tenesmo con dolor.' },
          { title: 'Herida.', body: 'Limpieza diaria por la cercanía del ano, collar isabelino, retiro de puntos a los 10–14 días.' },
          { title: 'Orina.', body: 'Que orine en 12–24 h (la epidural puede retenerla).' },
        ] }],
      },
    ],
    closure: [
      { layer: 'Herniorrafia', suture: 'PDS (o polipropileno)', gauge: '2-0 o 0', pattern: 'Puntos simples separados, anudados de ventral a dorsal', why: 'Cierre sin tensión del defecto; se pasan todos antes de anudar.' },
      { layer: 'Subcutáneo', suture: 'Monocryl', gauge: '3-0', pattern: 'Continuo simple', why: 'Cierra el espacio muerto.' },
      { layer: 'Piel', suture: 'Nylon o Monocryl', gauge: '3-0 o 4-0', pattern: 'Simples o intradérmico', why: 'Zona contaminada: puntos externos facilitan la limpieza.' },
      { layer: 'Bolsa de tabaco anal', suture: 'Nylon', gauge: '2-0', pattern: 'Bolsa de tabaco', why: 'Temporal; se retira al terminar.' },
    ],
    complications: [
      { name: 'Infección de la herida', prevent: 'Enema 12–24 h antes, bolsa de tabaco, profilaxis antibiótica.', manage: 'Drenaje y antibiótico según cultivo.' },
      { name: 'Recidiva', prevent: 'Obturador interno, castración, ablandadores de heces.', manage: 'Nueva herniorrafia, a veces con malla.' },
      { name: 'Incontinencia fecal', prevent: 'Respetar el nervio pudendo.', manage: 'Suele ser transitoria si el nervio no se seccionó.' },
      { name: 'Cojera por lesión del ciático', prevent: 'No poner puntos profundos alrededor del ligamento sacrotuberoso.', manage: 'Reintervenir de inmediato y retirar el punto.' },
      { name: 'Tenesmo y prolapso rectal', prevent: 'Analgesia, heces blandas.', manage: 'Bolsa de tabaco temporal, tratar la causa.' },
    ],
    quiz: [
      { q: '¿Qué músculos forman el diafragma pélvico?', a: 'Esfínter anal externo, elevador del ano, coccígeo y obturador interno, con el ligamento sacrotuberoso lateral.' },
      { q: '¿Por qué castras en el mismo acto?', a: 'Porque reduce la recidiva (influencia androgénica sobre la musculatura y la próstata).' },
      { q: '¿Qué estructuras proteges al suturar?', a: 'El nervio pudendo y los vasos pudendos internos, el nervio ciático junto al ligamento sacrotuberoso, la uretra y el recto.' },
      { q: '¿Qué haces si hay retroflexión de vejiga?', a: 'Es una urgencia: descomprimir (cistocentesis o sonda), reposicionar y estabilizar antes de la cirugía.' },
    ],
    videos: [
      { title: 'Perineal hernia and castration surgery in a dog', url: 'https://www.youtube.com/watch?v=PeyWwXbPrio', channel: 'Veterinary Surgery & Radiology Education', lang: 'inglés', note: 'Herniorrafia con castración' },
      { title: 'Perineal hernia: colopexy, vasopexy, cystopexy and castration', url: 'https://www.youtube.com/watch?v=qiOi3yzt-nc', channel: 'Francesco Poerio', lang: 'inglés', note: 'Pexias en hernia bilateral' },
    ],
    sources: [
      SOURCES.fossum(22, 'cirugía del recto, el ano y el periné'),
      { text: 'Bellenger CR, Canfield RB. Hernia perineal. En: Slatter D, Textbook of Small Animal Surgery, 3.ª ed., 2003.', kind: 'libro' },
      SOURCES.plumbs,
    ],
  },
};
