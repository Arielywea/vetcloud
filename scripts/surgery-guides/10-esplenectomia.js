// Esplenectomía (id 10). Rewritten from Fossum 5.ª ed., cap. 23 (pp. 637–648).
const { pick, drug, ABDOMINAL_CLOSURE, CELIOTOMY_STEPS, SOURCES } = require('./_common');

module.exports = {
  id: 10,
  legacy: {
    indicaciones: 'Total: neoplasia esplénica (hemangiosarcoma, linfoma con esplenomegalia masiva o rotura), hematoma y hemangioma, torsión esplénica o gástrica, trauma con hemorragia que no cede; trastornos inmunomediados refractarios en casos seleccionados. Parcial: lesiones traumáticas o focales benignas para conservar la función. Esplenorrafia: laceraciones superficiales de la cápsula.',
    tecnica_quirurgica: 'Celiotomía media del xifoides a caudal al ombligo, exploración completa. Total: exteriorizar el bazo sobre compresas húmedas y doble ligar y cortar todos los vasos del hilio (absorbible preferido) o sellarlos (LigaSure, vasos <7 mm), conservando si es posible las gástricas cortas; o abrir la bolsa omental y doble ligar la arteria esplénica distal a la rama pancreática. Parcial: doble ligadura de los vasos hiliares de la zona, usar la isquemia como guía, exprimir la pulpa, pinzas, corte y cierre continuo de 3-0 o 4-0 absorbible (o dos filas de colchonero, o grapas TA de 3,5 o 4,8). Torsión: esplenectomía sin desrotar.',
    material_quirurgico: 'Instrumental de tejidos blandos con muchas pinzas hemostáticas, sellador bipolar (LigaSure) o pinzas vasculares, grapadora TA (grapas 3,5 o 4,8 mm) para la parcial, esponja de gelatina, compresas, sangre entera o glóbulos rojos disponibles.',
    tipo_sutura: 'Vasos hiliares: absorbible (preferido) o no absorbible, doble ligadura; con peritonitis, absorbible sintético monofilamento. Cápsula y parcial: absorbible 3-0 o 4-0 (simples, colchonero o continuo). Pared en pacientes con neoplasia: monofilamento fuerte absorbible o no absorbible.',
    complicaciones_frecuentes: 'Hemorragia (más en biopsia o parcial que en la total bien ligada); arritmias ventriculares; CID; pancreatitis por isquemia de la rama pancreática; abscesos; fístula gástrica por alteración del riego; hemoparásitos subclínicos que se manifiestan; leucocitosis leve y cuerpos de Howell-Jolly (normales).',
    manejo_anestesico_sugerido: 'Oxígeno antes de la inducción y en la recuperación si hay anemia; anticolinérgico contra la bradicardia. Evitar barbitúricos y acepromacina (secuestro de eritrocitos, hipotensión, efecto plaquetario); el propofol agranda el bazo (relevante en laparoscopia): ketamina-diazepam o alfaxalona, o propofol reducido tras hidromorfona con midazolam o dexmedetomidina. Monitoreo de presión (hipotensión por pérdida de volumen), ECG. En urgencias, tabla 18.4.',
    consideraciones_por_raza: 'Torsión esplénica en razas grandes y gigantes de pecho profundo (Gran Danés, Pastor alemán) y Bulldog inglés; más en machos castrados. Hemangiosarcoma más en Pastor alemán, Golden y Labrador retriever.',
    consideraciones_comorbilidades: 'Transfusión si el hematocrito es menor de 20 % o la hemoglobina menor de 5–7 g/dL (44 % de los perros con masas esplénicas la necesitaron). Coagulación en sangrados no traumáticos; plasma ± heparina si hay CID. Ecocardiografía (tumor en aurícula derecha). Contraindicada si el bazo es el principal sitio de hematopoyesis (hipoplasia medular).',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 23, pp. 637–648.',
  },
  guide: {
    draft: true,
    lede: 'Extirpación total o parcial del bazo. Casi siempre es por una masa, a menudo rota, en un paciente anémico y con riesgo de arritmias: la cirugía es técnicamente sencilla, pero la preparación (transfusión, ECG, coagulación) y la vigilancia de las primeras 24 h pesan tanto como la técnica.',
    meta: { species: ['perro', 'gato'], duration: '45–90 min', difficulty: 'intermedia', contamination: 'limpia' },
    before_you_start: [
      'Ten sangre entera o glóbulos rojos disponibles y transfunde si el hematocrito es menor de 20 %; revísalo de nuevo justo antes de anestesiar (los líquidos lo diluyen).',
      'ECG antes y durante: las arritmias ventriculares son frecuentes con masas, anemia y hemoabdomen.',
      'Busca metástasis: radiografía de tórax, ecografía y ecocardiografía; con tumor en la aurícula derecha la esplenectomía puede no estar indicada.',
      'Liga los vasos en el hilio, cerca del bazo, y conserva las gástricas cortas; si ligas la arteria esplénica, hazlo distal a la rama del páncreas.',
      'En la torsión, extirpa el bazo sin desrotarlo: desrotar libera detritos necróticos y toxinas a la circulación.',
    ],
    indications: [
      'Neoplasia: hemangiosarcoma (si no hay metástasis extensa que impida el beneficio a corto plazo), linfoma con esplenomegalia masiva o rotura (p. 647).',
      'Hematoma y hemangioma (tratamiento de elección); las masas grandes son con más frecuencia benignas.',
      'Torsión esplénica (aguda o crónica) o asociada a torsión gástrica (p. 644).',
      'Trauma con hemorragia que pone en riesgo la vida y no se detiene.',
      'Trombocitopenia o anemia hemolítica inmunomediadas refractarias, en casos seleccionados (p. 641).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Clasifica la esplenomegalia.', body: 'Difusa (congestión por torsión, insuficiencia cardiaca derecha, DVG o fármacos; infiltración infecciosa, inmunomediada o neoplásica) o focal (hiperplasia nodular, hematoma, trauma, hemangiosarcoma, linfoma).', cite: 'Fossum p. 638' },
              { title: 'Anemia y transfusión.', body: 'Transfusión si el hematocrito es menor de 20 % o la hemoglobina de 5–7 g/dL en un paciente hidratado.', cite: 'Fossum p. 638' },
              { title: 'Coagulación y CID (Box 23.2).', body: 'Perfil de coagulación si el sangrado no es traumático; si hay CID, plasma fresco congelado 10–20 mL/kg (reponer antitrombina III) con o sin heparina.', cite: 'Fossum p. 638' },
              { title: 'Hidratación.', body: 'Líquidos IV a los deshidratados antes de la cirugía; corrige electrolitos y ácido-base.' },
              { title: 'Estadificación.', body: 'Radiografía de tórax, ecografía abdominal y ecocardiografía si sospechas hemangiosarcoma. La laparoscopia detecta metástasis viscerales mejor que las imágenes.', cite: 'Fossum p. 647' },
              { title: 'Citología con cautela.', body: 'No aspires lesiones cavitarias (pueden romperse, sobre todo con coagulopatía). La citología no distingue bien hemangiosarcoma de hematoma.', cite: 'Fossum p. 639' },
              { title: 'Antibiótico.', body: 'En pacientes sanos suele ser innecesario; si se usa, cefazolina 22 mg/kg IV en la inducción y suspender dentro de 24 h.', cite: 'Fossum p. 638, 648' },
            ],
          },
          { type: 'note', kind: 'error', title: 'Esplenectomía y limpieza dental', text: 'Se han descrito abscesos múltiples, septicemia y muerte en perros a los que se hizo la esplenectomía junto con limpieza y extracciones dentales (p. 639).' },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'Oxígeno antes de inducir y en la recuperación si hay anemia; anticolinérgico contra la bradicardia; vigila la presión porque la esplenectomía resta volumen (p. 638).',
        blocks: [
          {
            type: 'drugs',
            items: [
              drug('Preoxigenación', 'Oxígeno', '3–5 min', 'Mascarilla', 'Obligatorio en el paciente anémico.'),
              ...pick('metadona', 'midazolam'),
              drug('Premedicación', 'Dexmedetomidina', '0,001–0,003 mg/kg', 'IV', 'Solo en el paciente estable; no agranda el bazo y reduce el propofol necesario.'),
              drug('Inducción', 'Alfaxalona', '1–3 mg/kg', 'IV, a efecto', 'O ketamina con diazepam. El propofol agranda el bazo; si lo usas, a dosis reducida tras opioide y benzodiazepina o α2.'),
              drug('Inducción (inestable)', 'Ketamina', '5 mg/kg', 'IV', 'Con diazepam o midazolam 0,25 mg/kg.'),
              ...pick('isoflurano', 'fentanilo'),
              drug('Rescate', 'Glicopirrolato', '0,005–0,01 mg/kg', 'IV', 'Si hay bradicardia.'),
              drug('Arritmias', 'Lidocaína', '2 mg/kg', 'IV, bolo lento', 'Hasta 8 mg/kg en total; luego infusión 0,05 mg/kg/min si persisten. Solo perros.'),
              ...pick('metadonaPost', 'buprenorfina'),
            ],
          },
          { type: 'note', kind: 'error', title: 'Evitar', bullets: ['Barbitúricos: congestión esplénica.', 'Acepromacina: secuestro de eritrocitos en el bazo, hipotensión y alteración plaquetaria.', 'AINE en el paciente con hemorragia, hipotensión o coagulopatía.'] },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          {
            type: 'list',
            items: [
              'El bazo está en el cuadrante craneal izquierdo, paralelo a la curvatura mayor; con el estómago muy dilatado puede estar en el abdomen caudal (p. 639).',
              'La arteria esplénica nace de la celíaca, mide más de 2 mm y da 3–5 ramas largas en el omento mayor. La primera suele ir al páncreas y es el aporte principal de su rama izquierda (fig. 23.10).',
              'Las ramas restantes dan 20–30 ramas esplénicas que entran en el parénquima y siguen por el ligamento gastroesplénico hacia la curvatura mayor como gástricas cortas (fundus) y gastroepiploica izquierda.',
              'El drenaje venoso va por la vena esplénica a la gastroesplénica y a la porta.',
              'La cápsula tiene fibras elásticas y musculares lisas con receptores α-adrenérgicos: el bazo contraído se siente firme; las placas sideróticas pardas de la superficie son normales.',
            ],
          },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          { id: 'abordaje', title: 'A. Abordaje', blocks: [{ type: 'steps', items: [...CELIOTOMY_STEPS.slice(0, 3), { title: 'Largo suficiente.', body: 'Del xifoides hasta caudal al ombligo; alarga para masas grandes o para explorar todo el abdomen, obligatorio si se sospecha neoplasia.', cite: 'Fossum p. 639' }, ...CELIOTOMY_STEPS.slice(4)] }] },
          {
            id: 'total',
            title: 'B. Esplenectomía total',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Exterioriza.', body: 'Saca el bazo con las manos sin traccionar la masa (puede romperse) y coloca compresas húmedas alrededor de la incisión, debajo del bazo.', cite: 'Fossum p. 642' },
                  { title: 'Adherencias.', body: 'Liga las adherencias del omento a la masa a medida que las encuentres.' },
                  { title: 'Liga el hilio.', body: 'Doble ligadura y corte de todos los vasos del hilio, de un polo al otro, con absorbible (preferido) o no absorbible (fig. 23.13).', cite: 'Fossum p. 642' },
                  { title: 'O sella.', body: 'Sellador bipolar (LigaSure) para vasos de menos de 7 mm: rápido y eficaz.', cite: 'Fossum p. 641–642' },
                  { title: 'Conserva las gástricas cortas.', body: 'Liga las ramas en el hilio, no en su origen gástrico, para mantener el riego del fundus.', cite: 'Fossum p. 642' },
                  { title: 'Alternativa por la arteria esplénica.', body: 'Abre la bolsa omental, aísla la arteria esplénica, identifica la rama o ramas del lóbulo izquierdo del páncreas y doble liga la esplénica distal a ellas (fig. 23.14).', cite: 'Fossum p. 642' },
                  { title: 'Revisa.', body: 'Hemostasia del hilio y del omento; páncreas sin lesión.' },
                  { title: 'Explora el hígado.', body: 'En el hemangiosarcoma, la biopsia de un hígado de aspecto normal rinde poco; los nódulos (múltiples, oscuros o que sangran) se asocian mucho a malignidad: biopsia esos.', cite: 'Fossum p. 647' },
                ],
              },
              { type: 'note', kind: 'tip', title: 'Con la gastropexia', text: 'Es incierto si la esplenectomía aumenta el riesgo de DVG: un estudio no encontró diferencias y otro halló 5,3 veces más riesgo. En razas predispuestas puede hacerse la gastropexia en el mismo acto (p. 642, 647).' },
            ],
          },
          {
            id: 'parcial',
            title: 'C. Esplenectomía parcial y esplenorrafia',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Cuándo.', body: 'Lesiones traumáticas o focales para conservar la función del bazo (reserva de eritrocitos, hematopoyesis, fagocitosis, inmunidad). No en tumores malignos ni masas benignas grandes.', cite: 'Fossum p. 641, 647' },
                  { title: 'Liga la zona.', body: 'Define el área, doble liga y corta los vasos hiliares que la irrigan (fig. 23.12A).', cite: 'Fossum p. 641' },
                  { title: 'Usa la isquemia de guía.', body: 'La zona sin riego se oscurece y marca la línea de resección.', cite: 'Fossum p. 641' },
                  { title: 'Exprime la pulpa.', body: 'Aprieta el bazo en esa línea entre el pulgar y el índice desplazando la pulpa hacia la zona isquémica.', cite: 'Fossum p. 641' },
                  { title: 'Pinza y corta.', body: 'Pinzas en la porción aplanada y corte entre ellas (fig. 23.12B).', cite: 'Fossum p. 641' },
                  { title: 'Cierra.', body: 'Continuo de 3-0 o 4-0 absorbible junto a la pinza (fig. 23.12C), o dos filas de colchonero continuo superpuestas; si sigue sangrando, sobrecostura continua del extremo.', cite: 'Fossum p. 641' },
                  { title: 'O grapa.', body: 'Grapadora TA con grapas de 3,5 o 4,8 mm, con tejido suficiente para que no se suelten: menos tiempo y menos adherencias de omento.', cite: 'Fossum p. 641' },
                  { title: 'Esplenorrafia.', body: 'En laceraciones superficiales de la cápsula: liga los vasos grandes dañados, simples o colchonero de 3-0 o 4-0 absorbible en la cápsula, esponja de gelatina en las pequeñas y presión suave varios minutos.', cite: 'Fossum p. 641' },
                  { title: 'Si no para.', body: 'Liga las ramas que irrigan la lesión lo más cerca posible del hilio; las zonas pequeñas de isquemia se revascularizan.', cite: 'Fossum p. 641' },
                ],
              },
              { type: 'note', kind: 'book', title: 'Bazo frágil', text: 'Con hipertensión portal y esplenomegalia la cápsula es tan frágil que las suturas desgarran y hasta la presión la rompe; incluso defectos pequeños pueden obligar a la esplenectomía (p. 641). Las laceraciones traumáticas suelen resolverse solas.' },
            ],
          },
          {
            id: 'torsion',
            title: 'D. Torsión esplénica',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Estabiliza.', body: 'Líquidos, transfusión si hace falta y cefazolina 22 mg/kg IV (la oclusión vascular favorece la proliferación bacteriana).', cite: 'Fossum p. 644' },
                  { title: 'Incisión amplia.', body: 'Desde el xifoides, larga para manipular y exteriorizar el bazo agrandado.', cite: 'Fossum p. 644' },
                  { title: 'No desrotes.', body: 'Liga el pedículo torcido tal como está y extirpa el bazo: desrotar libera detritos y toxinas, y no hay forma fiable de fijarlo para que no vuelva a torcerse.', cite: 'Fossum p. 644' },
                  { title: 'Páncreas.', body: 'La obstrucción puede extenderse a la rama pancreática: espera vómitos por pancreatitis.', cite: 'Fossum p. 645' },
                ],
              },
            ],
          },
          {
            id: 'muestras',
            title: 'E. Muestras',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Formol suficiente.', body: '10 volúmenes de formol por uno de tejido.', cite: 'Fossum p. 639' },
                  { title: 'Masas grandes.', body: 'Haz cortes en varios sitios pero déjala entera para que el patólogo la oriente; si no se puede, envía varias muestras de distintos sitios, incluido el borde entre lo anormal y lo normal.', cite: 'Fossum p. 640' },
                  { title: 'Cavitarias.', body: 'Ábrelas antes de ponerlas en formol.', cite: 'Fossum p. 640' },
                  { title: 'Varias muestras.', body: 'Es difícil distinguir hemangiosarcoma de hematoma: envía muestras de varias zonas.', cite: 'Fossum p. 647' },
                ],
              },
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
              { title: 'Vigilancia 24 h.', body: 'Observación estrecha por hemorragia; hematocrito cada pocas horas hasta que esté estable y transfusión si baja de 20 %.', cite: 'Fossum p. 642, 648' },
              { title: 'Oxígeno y analgesia.', body: 'Oxígeno nasal en el anémico; analgesia según las tablas 13.1 y 13.2.', cite: 'Fossum p. 642' },
              { title: 'Arritmias.', body: 'Prepárate para tratarlas, sobre todo con hemoabdomen o anemia.', cite: 'Fossum p. 648' },
              { title: 'CID.', body: 'Vigila en el hemangiosarcoma y la torsión; la hemorragia puede ser falla técnica o CID.', cite: 'Fossum p. 642, 648' },
              { title: 'Líquidos y electrolitos.', body: 'Hasta que mantenga la hidratación.' },
              { title: 'Hemograma esperable.', body: 'Leucocitosis leve, cuerpos de Howell-Jolly, eritrocitos nucleados, dianocitos y plaquetas altas son normales; una leucocitosis marcada o prolongada sugiere absceso o peritonitis.', cite: 'Fossum p. 642–643' },
              { title: 'Antibiótico.', body: 'Suspender dentro de 24 h en la mayoría.', cite: 'Fossum p. 648' },
            ],
          },
          {
            type: 'note',
            kind: 'book',
            title: 'Pronóstico (p. 648)',
            bullets: [
              'Masas benignas frente a malignas: supervivencia media de 436 frente a 110 días.',
              'Hemangiosarcoma solo con esplenectomía: mediana de 1,6 meses; la quimioterapia prolongó la supervivencia los primeros 4 meses.',
              'Peor con hemoperitoneo, anemia o trombocitopenia al ingreso o arritmias ventriculares en la cirugía.',
              'Linfoma esplénico: más del 50 % vive al menos 1 año solo con esplenectomía.',
              'Gatos: mediana de 197 días; la pérdida de peso previa empeora mucho el pronóstico.',
              'No niegues la cirugía sin un diagnóstico definitivo de hemangiosarcoma: los hematomas viven mucho más.',
            ],
          },
        ],
      },
    ],
    closure: [
      { layer: 'Vasos del hilio', suture: 'Absorbible (preferido) o no absorbible; o sellador bipolar', gauge: '3-0 (2-0 en perros grandes)', pattern: 'Doble ligadura', why: 'Cerca del bazo para conservar las gástricas cortas y la gastroepiploica.' },
      { layer: 'Arteria esplénica (alternativa)', suture: 'Absorbible', gauge: '2-0 o 0', pattern: 'Doble ligadura distal a la rama pancreática', why: 'Mantiene el riego del lóbulo izquierdo del páncreas.' },
      { layer: 'Borde de esplenectomía parcial', suture: 'Absorbible, o grapas TA de 3,5 o 4,8 mm', gauge: '3-0 o 4-0', pattern: 'Continuo, o dos filas de colchonero continuo', why: 'El parénquima esplénico es friable y necesita compresión.' },
      { layer: 'Cápsula (esplenorrafia)', suture: 'Absorbible', gauge: '3-0 o 4-0', pattern: 'Simples o colchonero', why: 'Hemostasia de laceraciones superficiales.' },
      { layer: 'Línea alba en pacientes con neoplasia', suture: 'Monofilamento fuerte absorbible o no absorbible', gauge: 'Según el peso', pattern: 'Continuo simple', why: 'Los debilitados con neoplasia cicatrizan mal (p. 648).' },
      ...ABDOMINAL_CLOSURE.slice(1),
    ],
    complications: [
      { name: 'Hemorragia', prevent: 'Doble ligadura o sellado de cada vaso del hilio; corregir coagulación.', manage: 'Transfusión; reintervención si es falla técnica; plasma si es CID.' },
      { name: 'Arritmias ventriculares', prevent: 'Corregir hipovolemia, anemia, dolor, hipoxia y electrolitos.', manage: 'Lidocaína IV.' },
      { name: 'Pancreatitis', prevent: 'Ligar distal a la rama pancreática; manipular poco el páncreas.', manage: 'Soporte, analgesia, nutrición.' },
      { name: 'Fístula gástrica', prevent: 'Conservar las gástricas cortas.', manage: 'Gastrectomía parcial.' },
      { name: 'Abscesos y sepsis', prevent: 'No combinar con procedimientos dentales; antibiótico en inmunosuprimidos.', manage: 'Antibiótico, drenaje.' },
      { name: 'Hemoparásitos que se manifiestan', prevent: 'Detectarlos antes en zonas endémicas.', manage: 'Tratamiento específico (Babesia, Ehrlichia, micoplasmas).' },
    ],
    quiz: [
      { q: '¿Qué fármacos evitas en la esplenectomía y por qué?', a: 'Barbitúricos (congestión esplénica) y acepromacina (secuestro de eritrocitos, hipotensión y efecto plaquetario); el propofol agranda el bazo.' },
      { q: '¿Dónde ligas los vasos y qué conservas?', a: 'En el hilio, cerca del bazo, conservando las gástricas cortas; si ligas la arteria esplénica, distal a la rama pancreática.' },
      { q: '¿Qué haces con un bazo torcido?', a: 'Lo extirpas sin desrotarlo, porque desrotar libera detritos necróticos y toxinas.' },
      { q: '¿Cómo envías una masa esplénica grande?', a: 'Con cortes en varios sitios pero entera para orientarla, o varias muestras de distintas zonas incluido el borde con tejido normal, en 10 volúmenes de formol.' },
      { q: '¿Cuándo transfundes y qué vigilas las primeras 24 h?', a: 'Si el hematocrito es menor de 20 %; vigilas hemorragia, hematocrito cada pocas horas, arritmias y CID.' },
      { q: '¿Cuál es la supervivencia del hemangiosarcoma tratado solo con esplenectomía?', a: 'Una mediana de 1,6 meses según el estudio citado en el Fossum.' },
    ],
    videos: [
      { title: 'Splenectomy', url: 'https://www.youtube.com/watch?v=zmPuR9tG34I', channel: 'Stanley Kim', lang: 'inglés', note: 'Esplenectomía total en modelo sintético' },
      { title: 'Splenic Mass Removal Using a Vessel Sealing Device', url: 'https://www.youtube.com/watch?v=_qbcqUiLiL0', channel: 'VetOvation', lang: 'inglés', note: 'Caso real con sellador de vasos' },
      { title: 'Laparoscopic Canine Splenectomy', url: 'https://www.youtube.com/watch?v=6QdUWdRoZ3s', channel: 'VetOvation y Dra. Elaine Holmes', lang: 'inglés', note: 'Variante laparoscópica' },
    ],
    sources: [
      SOURCES.fossum(23, 'cirugía del sistema hemolinfático: bazo, anestesia, anatomía, técnicas, torsión y masas esplénicas (pp. 637–648)'),
      SOURCES.fossum(19, 'cirugía de la cavidad abdominal: celiotomía y cierre (pp. 514–518)'),
      SOURCES.plumbs,
    ],
  },
};
