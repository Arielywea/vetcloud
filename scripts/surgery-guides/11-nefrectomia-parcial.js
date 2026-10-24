// Nefrectomía parcial (id 11). Medium depth; complete nephrectomy is included because it is the common case.
const { pick, ABDOMINAL_CLOSURE, SOURCES } = require('./_common');

module.exports = {
  id: 11,
  legacy: {
    indicaciones: 'Lesión focal de un polo renal (trauma, quiste, absceso, tumor benigno pequeño) cuando interesa conservar tejido renal, sobre todo si el riñón contralateral es insuficiente. La nefrectomía completa (ureteronefrectomía) es la indicación más frecuente: tumor renal, hidronefrosis terminal, pielonefritis refractaria, trauma grave.',
    tecnica_quirurgica: 'Celiotomía media craneal. Liberar el riñón del retroperitoneo. Parcial: oclusión temporal de la arteria renal (máximo 20 min de isquemia caliente), incisión en V del polo afectado, ligadura de vasos intrarrenales, cierre de la cápsula sobre hemostático o con colchonero. Completa: ligadura de arteria y vena renales por separado (arteria primero), y del uréter cerca de la vejiga.',
    material_quirurgico: 'Instrumental de laparotomía, separador de Balfour, pinza vascular atraumática (bulldog, Satinsky) o torniquete de Rumel, sellador de vasos, hemostático tópico (esponja de gelatina o celulosa oxidada), compresas.',
    tipo_sutura: 'Vasos intrarrenales: 4-0 absorbible. Cápsula: 4-0 colchonero o continuo. Nefrectomía completa: arteria y vena renales 2-0 o 3-0 absorbible (doble ligadura en la arteria), uréter 3-0.',
    complicaciones_frecuentes: 'Hemorragia; fuga de orina; deterioro de la función renal (isquemia, pérdida de nefronas); infección; recidiva tumoral.',
    manejo_anestesico_sugerido: 'Protección renal: presión arterial media >70 mmHg, fluidos, evitar AINE y fármacos nefrotóxicos. Opioide, inducción titulada, inhalatorio. Sangre disponible.',
    consideraciones_por_raza: 'Pastor alemán: cistoadenocarcinoma renal con dermatofibrosis nodular. Gatos: linfoma renal (no quirúrgico).',
    consideraciones_comorbilidades: 'Antes de cualquier nefrectomía, demostrar que el otro riñón funciona (urografía excretora, gammagrafía o al menos ecografía y creatinina). Coagulopatía y anemia: corregir.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 24; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Extirpación de parte de un riñón, o del riñón entero con su uréter. El riñón sangra mucho y no tolera la isquemia: se trabaja con oclusión vascular breve, hemostasia meticulosa y sabiendo antes que el otro riñón puede sostener al paciente.',
    meta: { species: ['perro', 'gato'], duration: '60–120 min', difficulty: 'avanzada', contamination: 'limpia' },
    before_you_start: [
      'Confirma que el riñón contralateral funciona: sin eso, no extirpes tejido renal.',
      'Ten sangre disponible y una vía venosa gruesa.',
      'En la nefrectomía parcial, la isquemia caliente no debe pasar de 20 minutos: planifica cada paso antes de ocluir.',
      'En la nefrectomía completa, liga la arteria antes que la vena.',
      'Mantén la presión arterial media sobre 70 mmHg y evita AINE.',
    ],
    indications: [
      'Parcial: trauma, quiste, absceso o lesión focal de un polo, sobre todo con función renal limitada.',
      'Completa: tumor renal, hidronefrosis terminal, pielonefritis o urolitiasis renal refractaria, trauma con hemorragia que no cede, uréter con lesión irreparable.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio y anestesia',
        blocks: [
          { type: 'steps', items: [
            { title: 'Función de cada riñón.', body: 'Creatinina, SDMA, urianálisis, ecografía de ambos riñones. Urografía excretora o gammagrafía para la función individual si está disponible.' },
            { title: 'Estadificación en tumores.', body: 'Radiografía de tórax, ecografía abdominal, TC si es posible (invasión de la vena renal o la cava).' },
            { title: 'Coagulación y hematocrito.', body: 'Sangre compatible disponible.' },
          ] },
          { type: 'drugs', items: pick('metadona', 'fentanilo', 'midazolam', 'propofol', 'alfaxalona', 'isoflurano', 'cefazolina', 'metadonaPost', 'buprenorfina') },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [{ type: 'list', items: [
          'Riñón derecho más craneal, en contacto con el proceso caudado del hígado; izquierdo más móvil.',
          'La arteria renal suele dividirse antes del hilio (en perros es frecuente una arteria doble, sobre todo en el lado izquierdo): liga cada rama.',
          'La vena renal izquierda recibe la vena ovárica o testicular izquierda.',
          'El uréter sale del hilio por caudal y corre dorsal al peritoneo hasta el trígono.',
        ] }],
      },
      {
        id: 'tecnica',
        title: 'Técnica (resumen)',
        blocks: [],
        subsections: [
          { id: 'completa', title: 'A. Nefrectomía completa (ureteronefrectomía)', blocks: [{ type: 'steps', items: [
            { title: 'Libera el riñón.', body: 'Incide el peritoneo lateral al riñón y despégalo del retroperitoneo con disección roma, girándolo hacia medial para ver el hilio por dorsal.' },
            { title: 'Identifica el hilio.', body: 'Arteria (dorsal, pulsátil, puede ser doble), vena (ventral, gruesa) y uréter (caudal).' },
            { title: 'Arteria primero.', body: 'Doble ligadura circunferencial más una transfixiante de la arteria (o de cada rama). Así el riñón no se congestiona.' },
            { title: 'Vena después.', body: 'Doble ligadura. Conserva la vena gonadal si es posible.' },
            { title: 'Uréter.', body: 'Síguelo hasta cerca de la vejiga, liga y corta: un muñón largo puede infectarse o acumular orina.' },
            { title: 'Revisa.', body: 'Hemostasia del retroperitoneo y de las ligaduras.' },
          ] }] },
          { id: 'parcial', title: 'B. Nefrectomía parcial', blocks: [{ type: 'steps', items: [
            { title: 'Ocluye.', body: 'Pinza vascular atraumática o torniquete de Rumel en la arteria renal; anota la hora.' },
            { title: 'Reseca.', body: 'Incisión en cuña o en V del polo afectado con bisturí.' },
            { title: 'Hemostasia.', body: 'Liga los vasos arcuados e interlobares visibles con 4-0 y cauteriza el parénquima.' },
            { title: 'Cierra.', body: 'Une la cápsula sobre un hemostático tópico con puntos de colchonero o continuo 4-0, sin cortar el parénquima.' },
            { title: 'Suelta.', body: 'Retira la oclusión antes de 20 minutos y comprime 5 minutos.' },
          ] }, { type: 'note', kind: 'error', title: 'La isquemia', text: 'Más de 20 minutos de oclusión caliente causa daño renal medible. Si la resección se alarga, suelta la pinza unos minutos y vuelve a ocluir.' }] },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [{ type: 'steps', items: [
          { title: 'Función renal.', body: 'Diuresis, creatinina y potasio cada 12–24 h los primeros días.' },
          { title: 'Hematocrito.', body: 'Cada 4–6 h las primeras 24 h; hematuria leve es esperable en la parcial.' },
          { title: 'Analgesia.', body: 'Opioide; sin AINE.' },
          { title: 'Seguimiento.', body: 'Función renal al mes y cada 3–6 meses; estadificación si era tumor.' },
        ] }],
      },
    ],
    closure: [
      { layer: 'Arteria renal', suture: 'PDS, Monocryl o seda', gauge: '2-0 o 3-0', pattern: 'Doble circunferencial + transfixiante', why: 'Presión arterial alta; se liga primero.' },
      { layer: 'Vena renal', suture: 'PDS o Monocryl', gauge: '2-0 o 3-0', pattern: 'Doble circunferencial', why: 'Vaso grueso de baja presión.' },
      { layer: 'Cápsula (parcial)', suture: 'PDS o Monocryl', gauge: '4-0', pattern: 'Colchonero o continuo sobre hemostático', why: 'El parénquima no sostiene suturas; la cápsula sí.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Hemorragia', prevent: 'Ligar cada rama arterial; hemostático en la parcial.', manage: 'Transfusión, reintervención.' },
      { name: 'Insuficiencia renal', prevent: 'Confirmar el otro riñón, isquemia <20 min, presión arterial, sin AINE.', manage: 'Fluidos, soporte renal.' },
      { name: 'Fuga de orina (parcial)', prevent: 'Cierre de la cápsula, revisar la pelvis.', manage: 'Drenaje, nefrectomía completa si persiste.' },
    ],
    quiz: [
      { q: '¿Qué confirmas antes de cualquier nefrectomía?', a: 'Que el riñón contralateral funciona.' },
      { q: '¿Qué ligas primero, la arteria o la vena renal?', a: 'La arteria, para que el riñón no se congestione y sangre.' },
      { q: '¿Cuánto tiempo puedes ocluir la arteria renal en una parcial?', a: 'Hasta unos 20 minutos de isquemia caliente.' },
    ],
    videos: [
      { title: 'Nephrectomy in a dog', url: 'https://www.youtube.com/watch?v=jBo-Pl9H67U', channel: 'VetDojo (Dr. James Simcock)', lang: 'inglés', note: 'Nefrectomía completa por hidrouréter infectado' },
    ],
    sources: [
      SOURCES.fossum(24, 'cirugía del riñón y el uréter'),
      SOURCES.aaha,
      SOURCES.plumbs,
    ],
  },
};
