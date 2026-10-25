// Perineorrafia / herniorrafia perineal (id 14). Rewritten from Fossum 5.ª ed., cap. 18 (pp. 496–501).
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 14,
  legacy: {
    indicaciones: 'Hernia perineal (falla del diafragma pélvico) con o sin contenido rectal, grasa, próstata, vejiga o intestino; siempre se recomienda la herniorrafia. La retroflexión de la vejiga y el atrapamiento visceral son urgencias. Casi exclusiva de machos enteros (93 %); en gatos, machos castrados y bilateral.',
    tecnica_quirurgica: 'Decúbito ventral con la cola sobre el lomo, pelvis elevada y miembros acolchados. Incisión curvilínea desde craneal a los coccígeos, 1–2 cm lateral al ano, hasta 2–3 cm ventral al piso pélvico. Abrir el saco, reducir y mantener con una gasa marcada; biopsiar estructuras anormales (no confundir la próstata con una masa). Identificar músculos, vasos y nervio pudendos, vasos rectales caudales y ligamento sacrotuberoso. Técnica de transposición del obturador interno: elevar el obturador del isquion con elevador de periostio, transponerlo dorsomedial al defecto y suturarlo con puntos simples preanudados de 0 o 2-0 monofilamento a menos de 1 cm, primero el elevador del ano y el coccígeo al esfínter anal externo, luego el obturador al esfínter (medial) y al coccígeo y elevador (lateral), anudando de dorsal a ventral. Técnica tradicional como alternativa. Castración caudal por incisión perineal media. Deferentopexia si hubo retroflexión.',
    material_quirurgico: 'Instrumental de tejidos blandos, separadores de Gelpi, elevador de periostio, aguja curva grande, gasa marcada, sonda urinaria, aguja para cistocentesis perineal, compresas frías.',
    tipo_sutura: 'Herniorrafia: monofilamento 0 o 2-0 (absorbible o no absorbible), puntos simples preanudados a menos de 1 cm. Subcutáneo: PDS, Maxon, Monocryl o Biosyn 3-0 o 4-0. Piel: nylon 3-0 o 4-0 interrumpido. Deferentopexia: monofilamento 3-0.',
    complicaciones_frecuentes: 'Complicaciones en cerca del 40 %: infección, dehiscencia, tenesmo, prolapso rectal, incontinencia fecal o urinaria, disuria, atonía o necrosis vesical, atrapamiento del ciático (dolor intenso, cojera sin apoyo, nudillos), recidiva (20 %, mayor con cirujanos inexpertos; 2,7 veces más en machos enteros).',
    manejo_anestesico_sugerido: 'Recomendaciones para cirugía perineal (tabla 18.1); muchos pacientes son geriátricos. La epidural puede reducir el prolapso rectal postoperatorio. Antibiótico IV contra gramnegativos y anaerobios tras la inducción, suspendido dentro de 12 h salvo tejido isquémico o contaminado.',
    consideraciones_por_raza: 'Boston terrier, Bóxer, Welsh corgi, Pekinés, Collie, Caniche, Kelpie, Dachshund, Bobtail y mestizos; perros de cola corta; edad media de 10 años.',
    consideraciones_comorbilidades: 'Tratar las causas de pujo (prostatitis, cistitis, obstrucción urinaria o colorrectal, diarrea, constipación). Vejiga retroflexionada: azotemia, hiperpotasemia, hiperfosfatemia; sonda o cistocentesis perineal y estabilizar. Las alteraciones neurológicas previas no se corrigen con la cirugía.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 18, pp. 496–501.',
  },
  guide: {
    draft: true,
    lede: 'Reparación del diafragma pélvico cuando los músculos que rodean el ano ceden y el recto, la grasa, la próstata o la vejiga se desplazan bajo la piel del periné. La transposición del obturador interno cierra el defecto con menos tensión y menos deformidad del ano que la técnica tradicional; la castración en el mismo acto reduce la recidiva.',
    meta: { species: ['perro', 'gato'], duration: '60–90 min por lado', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Una tumefacción fluctuante con disuria puede ser la vejiga atrapada: descomprime por sonda o cistocentesis perineal y estabiliza antes; es una urgencia.',
      'Ablandadores de heces 2–3 días antes y evacuación del intestino grueso con laxantes, enemas y extracción manual.',
      'Identifica el nervio pudendo, los vasos pudendos internos, los vasos rectales caudales y el ligamento sacrotuberoso antes de suturar.',
      'Pasa los puntos a través del ligamento sacrotuberoso, nunca alrededor: el ciático está justo craneal y lateral.',
      'No confundas la próstata con una masa ni intentes extirparla. Castra en el mismo acto si está entero.',
    ],
    indications: [
      'Hernia perineal uni o bilateral con dificultad para defecar, tumefacción perineal, tenesmo o disuria; la herniorrafia siempre se recomienda (p. 498).',
      'Retroflexión de la vejiga o atrapamiento visceral: cirugía de urgencia.',
      'El manejo médico prolongado (laxantes, enemas, vaciamiento) está contraindicado por el riesgo de estrangulación.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Diagnóstico y preparación',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Tacto rectal.', body: 'El diagnóstico es encontrar el diafragma pélvico débil; no todos tienen tumefacción. Suele haber desviación rectal con heces impactadas; predominio derecho en algunos estudios; en gatos, bilateral.', cite: 'Fossum p. 497' },
              { title: 'Contenido.', body: 'Ecografía, cistografía o uretrografía para ver la vejiga retroflexionada; radiografías para intestino o próstata. Una hernia con la vejiga llena se siente tensa y elástica.', cite: 'Fossum p. 497–498' },
              { title: 'Laboratorio.', body: 'Con vejiga retroflexionada: azotemia, hiperpotasemia, hiperfosfatemia y leucocitosis.', cite: 'Fossum p. 498' },
              { title: 'Causas de pujo (Box 18.64).', body: 'Prostatitis, cistitis, obstrucción urinaria o colorrectal, desviación rectal, inflamación perianal, saculitis anal, diarrea, constipación: corrígelas.', cite: 'Fossum p. 497' },
              { title: 'Intestino.', body: 'Ablandadores 2–3 días antes; evacuación con laxantes, enemas y extracción manual.', cite: 'Fossum p. 498' },
              { title: 'Vejiga.', body: 'Si está retroflexionada, sonda urinaria o cistocentesis por el periné.', cite: 'Fossum p. 498–499' },
              { title: 'Antibiótico.', body: 'IV tras la inducción, eficaz contra gramnegativos y anaerobios (cefoxitina 30 mg/kg o ampicilina con sulbactam).', cite: 'Fossum p. 498' },
              { title: 'Bilateral.', body: 'Puede repararse en un tiempo, con más dolor y tenesmo; algunos cirujanos esperan 4–6 semanas para el segundo lado.', cite: 'Fossum p. 498' },
            ],
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'Muchos pacientes son geriátricos con enfermedades concurrentes. La epidural puede reducir el prolapso rectal postoperatorio (p. 499).',
        blocks: [
          {
            type: 'drugs',
            items: [
              ...pick('metadona', 'dexmed', 'propofol', 'alfaxalona', 'isoflurano'),
              drug('Epidural', 'Morfina sin conservante', '0,1 mg/kg', 'Epidural lumbosacra', 'Analgesia del periné 12–24 h; puede retener orina.'),
              drug('Epidural', 'Bupivacaína', '0,5 mg/kg', 'Epidural, junto con la morfina', 'Prolonga el bloqueo sensitivo.'),
              drug('Profilaxis', 'Cefoxitina', '30 mg/kg', 'IV tras la inducción', 'Cubre gramnegativos y anaerobios; suspender dentro de 12 h salvo tejido contaminado.'),
              ...pick('meloxicam', 'buprenorfina'),
            ],
          },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          {
            type: 'list',
            items: [
              'Diafragma pélvico: elevador del ano (nace del piso pélvico y la diáfisis medial del ilion, rodea el recto y se inserta en la 7.ª vértebra caudal) y coccígeo (más grueso y lateral, desde la espina isquiática a las vértebras caudales 2.ª–5.ª) (p. 499).',
              'La hernia más común (caudal) aparece entre el elevador del ano, el esfínter anal externo y el obturador interno; también hay ciática (ligamento sacrotuberoso y coccígeo), dorsal y ventral (p. 497).',
              'Ligamento sacrotuberoso: banda fibrosa desde la última sacra y la primera caudal hasta la tuberosidad isquiática; el ciático corre justo craneal y lateral a él. Los gatos no lo tienen.',
              'Obturador interno: músculo en abanico sobre la cara dorsal del isquion; su tendón pasa por la escotadura isquiática menor, ventral al ligamento.',
              'Arteria y vena pudendas internas y nervio pudendo: corren en dirección caudomedial sobre el obturador interno, laterales al coccígeo y al elevador; el nervio, dorsal a los vasos, da los nervios rectal caudal y perineales. El contenido herniario puede desplazarlos.',
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
            id: 'abordaje',
            title: 'A. Posición y abordaje',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Campo.', body: 'Prepara 10–15 cm craneal a la base de la cola, lateral más allá de la tuberosidad isquiática y ventral hasta incluir el escroto.', cite: 'Fossum p. 499' },
                  { title: 'Posición.', body: 'Decúbito ventral con la cola fijada sobre el lomo, la pelvis elevada y los miembros acolchados, o una mesa perineal acolchada.', cite: 'Fossum p. 499' },
                  { title: 'Incisión.', body: 'Curvilínea, desde craneal a los coccígeos, sobre la tumefacción a 1–2 cm lateral al ano y hasta 2–3 cm ventral al piso pélvico (fig. 18.150).', cite: 'Fossum p. 499' },
                  { title: 'Saco.', body: 'Incide el subcutáneo y el saco herniario (fascia perineal fina).' },
                  { title: 'Reduce.', body: 'Libera y reduce el contenido disecando las uniones; biopsia las estructuras anormales. Mantén la reducción con una gasa húmeda marcada.', cite: 'Fossum p. 499' },
                  { title: 'Identifica.', body: 'Los músculos de la hernia, los vasos y el nervio pudendos, los vasos y el nervio rectal caudal y el ligamento sacrotuberoso.', cite: 'Fossum p. 499' },
                ],
              },
            ],
          },
          {
            id: 'obturador',
            title: 'B. Transposición del obturador interno',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Incide el periostio.', body: 'Fascia y periostio a lo largo del borde caudal del isquion y el origen del obturador interno.', cite: 'Fossum p. 500' },
                  { title: 'Eleva.', body: 'Con un elevador de periostio, levanta el periostio y el obturador del isquion (fig. 18.151A).', cite: 'Fossum p. 500' },
                  { title: 'Transpón.', body: 'Llévalo hacia dorsomedial (o enróllalo) dentro del defecto, para que cierre la parte ventral entre el coccígeo, el elevador del ano y el esfínter anal externo.', cite: 'Fossum p. 500' },
                  { title: 'Tendón.', body: 'Si no cubre bien, corta el tendón de inserción (difícil de ver), sin lesionar los vasos glúteos caudales ni el nervio perineal.', cite: 'Fossum p. 500' },
                  { title: 'Preanuda los puntos.', body: 'Puntos simples de monofilamento 0 o 2-0 con aguja curva grande, a menos de 1 cm entre sí.', cite: 'Fossum p. 499–500' },
                  { title: 'Dorsales.', body: 'Primero el elevador del ano y el coccígeo con el esfínter anal externo.', cite: 'Fossum p. 500' },
                  { title: 'Ventrales.', body: 'Luego el obturador con el esfínter anal externo (medial) y con el elevador y el coccígeo (lateral), y el ligamento sacrotuberoso si hace falta (fig. 18.151B).', cite: 'Fossum p. 500' },
                  { title: 'Anuda.', body: 'De dorsal a ventral, retirando la gasa antes de los últimos puntos. Revisa y añade puntos si quedan defectos.', cite: 'Fossum p. 499–500' },
                ],
              },
              { type: 'note', kind: 'why', title: 'Por qué el obturador', text: 'La técnica tradicional cuesta en la parte ventral y deforma el ano (más tenesmo y prolapso, sobre todo bilateral). La transposición pone menos tensión en los puntos, deforma menos y crea un parche ventral; es más difícil si el obturador está muy atrofiado (p. 498).' },
            ],
          },
          {
            id: 'tradicional',
            title: 'C. Técnica tradicional (anatómica)',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Dorsales y laterales.', body: 'Puntos simples preanudados de 0 o 2-0 entre el esfínter anal externo y el elevador, el coccígeo o ambos, a menos de 1 cm.', cite: 'Fossum p. 499' },
                  { title: 'Ligamento sacrotuberoso.', body: 'Inclúyelo si hace falta para un cierre seguro, pasando el punto a través de él, no alrededor.', cite: 'Fossum p. 499' },
                  { title: 'Ventrales.', body: 'Entre el esfínter anal externo y el obturador interno, cuidando los vasos y nervios pudendos.', cite: 'Fossum p. 499' },
                  { title: 'Anuda.', body: 'De dorsal a ventral, retirando la gasa antes de los últimos.' },
                ],
              },
            ],
          },
          {
            id: 'cierre',
            title: 'D. Cierre, castración y pexias',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Lava y cierra.', body: 'Subcutáneo con 3-0 o 4-0 absorbible monofilamento (PDS, Maxon, Monocryl, Biosyn); piel con puntos simples de nylon 3-0 o 4-0.', cite: 'Fossum p. 500' },
                  { title: 'Castración.', body: 'Caudal por una incisión perineal media tras la herniorrafia, o prescrotal; ninguna tiene más complicaciones. Los machos enteros recidivan 2,7 veces más.', cite: 'Fossum p. 498–499' },
                  { title: 'Próstata.', body: 'Biopsia la próstata aumentada si es accesible.', cite: 'Fossum p. 498' },
                  { title: 'Deferentopexia.', body: 'Si hubo retroflexión de vejiga o próstata: laparotomía caudal, separa el deferente ligado de los vasos testiculares, tráelo por el anillo inguinal, tracciona para llevar la vejiga y la próstata a craneal, pásalo por un túnel entre dos incisiones de 1,5–2 cm en el transverso y sutúralo con 3–4 puntos de 3-0. Repite del otro lado.', cite: 'Fossum p. 500' },
                  { title: 'Colopexia.', body: 'Puede prevenir el prolapso rectal recurrente. La cistopexia no se recomienda de rutina (cistitis por retención) y la imbricación rectal aumenta la infección.', cite: 'Fossum p. 498' },
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
              { title: 'Analgesia.', body: 'Suficiente para evitar el pujo y el prolapso rectal; si hay prolapso, bolsa de tabaco.', cite: 'Fossum p. 500' },
              { title: 'Frío y calor.', body: 'Compresas frías justo después y 2–3 veces al día 15–20 minutos las primeras 48–72 h; luego tibias 2–3 veces al día.', cite: 'Fossum p. 500' },
              { title: 'Ablandadores y dieta.', body: 'Ablandadores 1–2 meses y comida húmeda rica en fibra.', cite: 'Fossum p. 500' },
              { title: 'Antibiótico.', body: 'Suspender dentro de 12 h salvo tejido isquémico, necrótico o contaminado, o paciente debilitado.', cite: 'Fossum p. 500' },
              { title: 'Herida.', body: 'Vigila enrojecimiento, dolor, inflamación y secreción; collar.' },
              { title: 'Urémicos.', body: 'Continúa los líquidos.', cite: 'Fossum p. 500' },
              { title: 'Ciático.', body: 'Dolor intenso, cojera sin apoyo y nudillos tras la cirugía: retira de inmediato el punto por un abordaje caudolateral a la cadera.', cite: 'Fossum p. 501' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Pronóstico', text: 'Regular a bueno con un cirujano experimentado; la vejiga retroflexionada tiene el peor pronóstico. Complicaciones en cerca del 40 % y recidiva del 20 %, relacionada con la experiencia del cirujano. Las alteraciones neurológicas previas (esfínter, vejiga) no se corrigen (p. 500–501).' },
        ],
      },
    ],
    closure: [
      { layer: 'Herniorrafia', suture: 'Monofilamento absorbible o no absorbible, aguja curva grande', gauge: '0 o 2-0', pattern: 'Simples preanudados a <1 cm, anudados de dorsal a ventral', why: 'Cierre sin tensión del defecto; a través del sacrotuberoso, nunca alrededor.' },
      { layer: 'Subcutáneo', suture: 'PDS, Maxon, Monocryl o Biosyn', gauge: '3-0 o 4-0', pattern: 'Simples o continuo aposicional', why: 'Cierra el espacio muerto.' },
      { layer: 'Piel', suture: 'Nylon', gauge: '3-0 o 4-0', pattern: 'Simples', why: 'Zona contaminada; facilita la limpieza.' },
      { layer: 'Deferentopexia', suture: 'Monofilamento', gauge: '3-0', pattern: '3–4 puntos del deferente a sí mismo y a la pared', why: 'Mantiene la vejiga y la próstata en posición craneal.' },
    ],
    complications: [
      { name: 'Infección y dehiscencia', prevent: 'Evacuación intestinal, antibiótico contra gramnegativos y anaerobios, técnica cuidadosa.', manage: 'Drenaje, antibiótico según cultivo.' },
      { name: 'Recidiva (20 %)', prevent: 'Obturador interno, castración, ablandadores, experiencia.', manage: 'Nueva herniorrafia, a veces con malla o injertos.' },
      { name: 'Atrapamiento del ciático', prevent: 'Puntos a través del sacrotuberoso, no alrededor.', manage: 'Retirar el punto de inmediato por abordaje caudolateral a la cadera.' },
      { name: 'Tenesmo y prolapso rectal', prevent: 'Epidural, analgesia, heces blandas.', manage: 'Bolsa de tabaco; colopexia si recurre.' },
      { name: 'Incontinencia fecal o urinaria', prevent: 'Respetar el nervio pudendo y los nervios rectales.', manage: 'Suele ser transitoria si no se seccionaron.' },
      { name: 'Problemas urinarios', prevent: 'Descomprimir la vejiga retroflexionada; cuidar la uretra.', manage: 'Sonda, tratamiento de la atonía; necrosis vesical: cirugía.' },
    ],
    quiz: [
      { q: '¿Entre qué músculos se forma la hernia perineal más común?', a: 'Entre el elevador del ano, el esfínter anal externo y el obturador interno (hernia caudal).' },
      { q: '¿Cómo se hace la transposición del obturador interno?', a: 'Se eleva el obturador del isquion con elevador de periostio, se transpone dorsomedial al defecto y se sutura al esfínter anal externo (medial) y al coccígeo y elevador (lateral) con puntos simples preanudados de 0 o 2-0.' },
      { q: '¿Por qué los puntos van a través del ligamento sacrotuberoso y no alrededor?', a: 'Porque el nervio ciático está justo craneal y lateral al ligamento y podría quedar atrapado.' },
      { q: '¿Por qué castras en el mismo acto?', a: 'Porque los machos enteros tienen 2,7 veces más recidiva.' },
      { q: '¿Qué haces si tras la cirugía el perro no apoya la pata y tiene dolor intenso?', a: 'Sospechar atrapamiento del ciático y retirar de inmediato el punto por un abordaje caudolateral a la cadera.' },
      { q: '¿Qué haces si la vejiga está en la hernia?', a: 'Es una urgencia: sonda o cistocentesis perineal, estabilizar y operar; considerar la deferentopexia.' },
    ],
    videos: [
      { title: 'Perineal hernia and castration surgery in a dog', url: 'https://www.youtube.com/watch?v=PeyWwXbPrio', channel: 'Veterinary Surgery & Radiology Education', lang: 'inglés', note: 'Herniorrafia con castración' },
      { title: 'Perineal hernia: colopexy, vasopexy, cystopexy and castration', url: 'https://www.youtube.com/watch?v=qiOi3yzt-nc', channel: 'Francesco Poerio', lang: 'inglés', note: 'Pexias en hernia bilateral' },
    ],
    sources: [
      SOURCES.fossum(18, 'cirugía del sistema digestivo: hernia perineal (pp. 496–501)'),
      SOURCES.fossum(26, 'castración caudal (p. 734)'),
      SOURCES.plumbs,
    ],
  },
};
