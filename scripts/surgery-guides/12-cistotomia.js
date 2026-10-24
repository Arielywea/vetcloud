// Cistotomía (id 12). Full depth: the most common urinary surgery, urolith removal and retrograde flushing.
const { pick, ABDOMINAL_CLOSURE, SOURCES } = require('./_common');

module.exports = {
  id: 12,
  legacy: {
    indicaciones: 'Urolitos vesicales que no se disuelven con dieta (oxalato de calcio, urato en algunos casos, estruvita refractaria) o que obstruyen; urolitos uretrales que se pueden devolver a la vejiga por retrohidropulsión; masas vesicales (biopsia o resección parcial); trauma o rotura vesical; uréter ectópico (en combinación).',
    tecnica_quirurgica: 'Celiotomía caudal (paraprepucial en machos). Exteriorizar la vejiga, aislarla con compresas, puntos de sostén. Incisión en la cara ventral o dorsal lejos del trígono, aspiración de la orina, extracción de los urolitos con cucharilla, lavado con sonda uretral anterógrado y retrógrado hasta que salga limpio. Cultivo de la mucosa o de un urolito. Cierre en una capa aposicional (continuo simple) con absorbible monofilamento 3-0 o 4-0. Radiografía postoperatoria para confirmar que no quedan urolitos.',
    material_quirurgico: 'Instrumental de laparotomía, separador, puntos de sostén, cucharilla de cistotomía o cucharilla de Volkmann, sonda urinaria estéril, jeringa de 60 mL, solución salina tibia, aspirador, tubos estériles para cultivo y frasco para análisis del urolito.',
    tipo_sutura: 'Vejiga: PDS o Monocryl 3-0 o 4-0 (aguja ahusada), continuo simple aposicional en una capa sin entrar en la luz. Puntos de sostén: 3-0. Pared abdominal según peso.',
    complicaciones_frecuentes: 'Urolitos que quedan (hasta 10–20 % sin radiografía postoperatoria); hematuria y polaquiuria transitorias; fuga de orina y uroabdomen (raro); recidiva de urolitos; obstrucción uretral postoperatoria por un urolito no retirado.',
    manejo_anestesico_sugerido: 'Si hay obstrucción: estabilizar primero (potasio, acidosis, fluidos), descompresión por cistocentesis o sonda. Metadona ± dexmedetomidina en paciente estable, propofol o alfaxalona, inhalatorio, epidural con morfina sin conservante 0,1 mg/kg y bupivacaína, AINE solo con función renal normal.',
    consideraciones_por_raza: 'Dálmata y Bulldog inglés: uratos. Schnauzer miniatura, Yorkshire, Shih Tzu, Bichón frisé: oxalato y estruvita. Gatos: oxalato y estruvita. Razas con cistinuria (Bulldog, Terranova).',
    consideraciones_comorbilidades: 'Obstrucción uretral: hiperpotasemia y arritmias; corrige antes de anestesiar. Insuficiencia renal: evitar AINE. Infección urinaria con estruvita: antibiótico según cultivo.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 25; ACVIM Consensus on Urolithiasis (2016); Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Apertura de la vejiga para retirar urolitos, tomar biopsias o reparar una rotura. La vejiga cicatriza rápido y perdona; lo que falla en la práctica es dejar urolitos atrás, así que la cirugía termina con una radiografía, no con el último punto.',
    meta: { species: ['perro', 'gato'], duration: '30–60 min', difficulty: 'básica', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Radiografía el mismo día de la cirugía: los urolitos se mueven y pueden haber bajado a la uretra.',
      'Si hay un urolito uretral, devuélvelo a la vejiga con retrohidropulsión antes de abrir.',
      'Incide lejos del trígono (cara ventral o dorsal del cuerpo) para no tocar los uréteres ni la uretra.',
      'Lava la uretra hacia arriba y hacia abajo hasta que salga limpia, y cuenta los urolitos contra la radiografía.',
      'Envía urolitos a análisis cuantitativo y una muestra de mucosa o urolito a cultivo.',
    ],
    indications: [
      'Urolitos vesicales que no se disuelven (oxalato de calcio, cistina, sílice) o que obstruyen.',
      'Estruvita que no responde a la dieta, o cuando hay obstrucción recurrente.',
      'Urolitos uretrales devueltos a la vejiga por retrohidropulsión.',
      'Masas vesicales (biopsia o cistectomía parcial), pólipos.',
      'Rotura vesical por trauma.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          { type: 'steps', items: [
            { title: 'Imágenes.', body: 'Radiografía de todo el tracto urinario (incluida la uretra peneana en machos) y ecografía. Los uratos y cistina pueden ser poco radiopacos: ecografía o cistografía de doble contraste.' },
            { title: '¿Hace falta cirugía?', body: 'La estruvita se disuelve con dieta (y antibiótico si hay infección) en 2–4 semanas. Urolitos pequeños pueden salir por urohidropropulsión o con cistoscopia. Las guías recomiendan métodos mínimamente invasivos cuando son posibles.' },
            { title: 'Si hay obstrucción.', body: 'Estabiliza: potasio, ECG, fluidos, descompresión por cistocentesis o sonda; luego retrohidropulsión.' },
            { title: 'Laboratorio.', body: 'Urianálisis y urocultivo, función renal y electrolitos.' },
          ] },
          { type: 'steps', items: [
            { title: 'Retrohidropulsión: sonda.', body: 'Con el paciente anestesiado, introduce una sonda estéril en la uretra hasta el urolito.' },
            { title: 'Ocluye.', body: 'Un ayudante ocluye la uretra pélvica por vía rectal presionando hacia el pubis (en machos), o tú ocluyes la punta del pene alrededor de la sonda.' },
            { title: 'Distiende y suelta.', body: 'Inyecta solución salina con la uretra ocluida para distenderla y, de golpe, suelta la oclusión rectal mientras sigues inyectando: el urolito sube a la vejiga.' },
          ] },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        blocks: [{ type: 'drugs', items: [...pick('metadona', 'dexmed', 'propofol', 'alfaxalona', 'isoflurano'), { phase: 'Epidural', drug: 'Morfina sin conservante', dose: '0,1 mg/kg', route: 'Epidural lumbosacra', note: 'Con bupivacaína 0,5 mg/kg (máximo 1 mg/kg en total) para bloqueo sensitivo. Puede causar retención urinaria transitoria.' }, ...pick('lidocainaLocal', 'meloxicam', 'buprenorfina')] }],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [
          { type: 'steps', items: [
            { title: 'Celiotomía caudal.', body: 'Desde el ombligo al pubis; en machos, incisión de piel paraprepucial y ligadura de la epigástrica superficial caudal.' },
            { title: 'Exterioriza la vejiga.', body: 'Sácala por la incisión y aíslala con compresas húmedas. Si está llena, vacíala por cistocentesis con aguja 22 G.' },
            { title: 'Puntos de sostén.', body: 'Dos puntos en el ápice o a cada lado de la línea de incisión para manipularla sin pinzas.' },
            { title: 'Incide.', body: 'En la cara ventral (o dorsal) del cuerpo, en una zona poco vascularizada, lejos del trígono. Incisión punzante y amplía con tijera.' },
            { title: 'Aspira y extrae.', body: 'Aspira la orina y saca los urolitos con cucharilla. Palpa el trígono y el cuello desde dentro.' },
            { title: 'Lava la uretra.', body: 'Sonda uretral desde abajo: lava hacia la vejiga. Sonda desde la vejiga hacia la uretra: lava hacia abajo. Repite hasta que salga limpio.' },
            { title: 'Muestras.', body: 'Urolito a análisis cuantitativo; mucosa o urolito a cultivo; biopsia de la pared si está engrosada.' },
            { title: 'Cierra.', body: 'Continuo simple aposicional en una capa con PDS o Monocryl 3-0 o 4-0, tomando la submucosa sin entrar en la luz.' },
            { title: 'Prueba.', body: 'Distiende la vejiga con solución salina por la sonda y revisa fugas.' },
            { title: 'Radiografía.', body: 'Antes de despertar: confirma que no quedan urolitos. Si los hay, reabre.' },
          ] },
          { type: 'note', kind: 'why', title: 'Por qué una sola capa', text: 'La vejiga recupera su fuerza en 14–21 días y cicatriza muy bien. Una capa aposicional que no entra en la luz es tan segura como dos y no forma un nido de cálculos con el hilo expuesto.' },
          { type: 'note', kind: 'error', title: 'Evitar', bullets: ['Hilo que entra en la luz (sobre todo multifilamento o no absorbible): núcleo de nuevos urolitos.', 'Incisión en el trígono.', 'Despertar al paciente sin radiografía.'] },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [
          { type: 'steps', items: [
            { title: 'Hematuria y polaquiuria.', body: 'Normales 3–5 días. Avisa al tutor.' },
            { title: 'Orina.', body: 'Que orine en las primeras 12–24 h; si no, revisar obstrucción o retención por la epidural.' },
            { title: 'Analgesia.', body: 'AINE 3–5 días si la función renal es normal.' },
            { title: 'Prevención.', body: 'Según el análisis del urolito: dieta específica, aumentar la ingesta de agua, controles de urianálisis y radiografía cada 3–6 meses.' },
          ] },
        ],
      },
    ],
    closure: [
      { layer: 'Vejiga', suture: 'PDS o Monocryl, aguja ahusada', gauge: '3-0 o 4-0', pattern: 'Continuo simple aposicional, sin entrar en la luz', why: 'Cicatriza rápido; el hilo en la luz forma urolitos.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Urolitos que quedan', prevent: 'Lavado anterógrado y retrógrado, contar urolitos, radiografía postoperatoria.', manage: 'Reintervenir antes de despertar si se ven.' },
      { name: 'Obstrucción uretral postoperatoria', prevent: 'Lavar la uretra completa.', manage: 'Retrohidropulsión y nueva cistotomía.' },
      { name: 'Uroabdomen', prevent: 'Buena toma de submucosa, prueba de fugas.', manage: 'Sonda urinaria y reintervención.' },
      { name: 'Recidiva', prevent: 'Análisis del urolito y prevención específica.', manage: 'Dieta, urohidropropulsión o cistoscopia si son pequeños.' },
    ],
    quiz: [
      { q: '¿Por qué radiografías el mismo día y después de la cirugía?', a: 'Porque los urolitos se mueven y porque sin radiografía postoperatoria quedan urolitos en hasta 10–20 % de los casos.' },
      { q: '¿Cómo devuelves un urolito uretral a la vejiga?', a: 'Retrohidropulsión: sonda hasta el urolito, oclusión de la uretra pélvica por vía rectal, distender con salino y soltar la oclusión de golpe.' },
      { q: '¿Qué urolitos no necesitan cirugía casi nunca?', a: 'Los de estruvita, que se disuelven con dieta y tratamiento de la infección.' },
      { q: '¿Por qué el hilo no debe entrar en la luz?', a: 'Porque el hilo expuesto es núcleo para nuevos urolitos.' },
    ],
    videos: [
      { title: 'Bladder Stone Removal in a Dog', url: 'https://www.youtube.com/watch?v=tXwW_7wGY8c', channel: 'Everyday Vet', lang: 'inglés', note: 'Cistotomía y análisis del urolito' },
      { title: 'Cystotomy for bladder stone removal', url: 'https://www.youtube.com/watch?v=wsruME9HTJA', channel: 'Complete Care Animal Hospital', lang: 'inglés', note: 'Cirugía completa' },
    ],
    sources: [
      SOURCES.fossum(25, 'cirugía de la vejiga y la uretra'),
      { text: 'Lulich JP y col. ACVIM Small Animal Consensus Recommendations on the Treatment and Prevention of Uroliths in Dogs and Cats. JVIM, 2016.', kind: 'complemento' },
      { text: 'Grant DC y col. Frecuencia de urolitos residuales tras cistotomía. JAVMA, 2010.', kind: 'complemento' },
      SOURCES.plumbs,
    ],
  },
};
