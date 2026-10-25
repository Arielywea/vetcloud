// Cistotomía (id 12). Rewritten from Fossum 5.ª ed., cap. 25 (pp. 678–687, 696–697, 701–705).
const { drug, ABDOMINAL_CLOSURE, CELIOTOMY_STEPS, SOURCES } = require('./_common');

module.exports = {
  id: 12,
  legacy: {
    indicaciones: 'Cálculos vesicales y uretrales (llevados a la vejiga por retrohidropulsión); identificación y biopsia de masas; reparación de uréteres ectópicos; infección urinaria resistente; divertículo uracal. La cirugía es necesaria para los cálculos de oxalato de calcio, fosfato de calcio y sílice, y cuando la disolución no es posible o recomendable, se necesita cultivo de mucosa o los cálculos pueden obstruir la uretra en la urohidropropulsión.',
    tecnica_quirurgica: 'Incisión del ombligo a caudal al pubis. Aislar la vejiga con compresas húmedas, puntos de sostén en el ápice y el trígono. Incisión longitudinal en la cara ventral (preferida) o dorsal del cuerpo, lejos de uréteres y uretra y entre los vasos grandes. Aspirar la orina, extirpar un trozo de mucosa para cultivo, revisar el ápice por divertículo, sacar los cálculos, lavar la uretra retrógrada y normógrada hasta que no queden cálculos. Cierre en una capa con continuo simple (preferido) o simples con absorbible; mucosa aparte si se espera hemorragia grave. Radiografía postoperatoria.',
    material_quirurgico: 'Instrumental de laparotomía, separador de Balfour, puntos de sostén, cucharilla, sonda urinaria estéril, jeringa grande y solución salina tibia, aspirador o aguja para cistocentesis, hisopos de algodón, tubos para cultivo de mucosa y de cálculo, frasco para análisis mineral.',
    tipo_sutura: 'Vejiga: absorbible (PDS, Maxon, Vicryl, Monocryl, Biosyn o Caprosyn) 3-0 o 4-0, una capa continua aposicional; PDS, Maxon o Biosyn si hay infección por E. coli; precaución con cualquier hilo hidrolizable si hay Proteus. Sin no absorbibles en vejiga ni uretra.',
    complicaciones_frecuentes: 'Cálculos que quedan (20 % sin lavado y radiografía), hematuria y disuria transitorias (37–50 %), fuga de orina y uroabdomen (raro), atonía vesical, recidiva de cálculos (12–25 %).',
    manejo_anestesico_sugerido: 'Corregir antes la hiperpotasemia y la azotemia posrenal (Box 25.1), ECG; líquidos para la diuresis. Sin problema renal, cualquier protocolo seguro; con obstrucción, tablas 25.1 y 25.2 (dosis bajas de opioide, etomidato o propofol o alfaxalona reducidos, isoflurano). En gatos obstruidos, evitar o reducir la ketamina. Evitar inducción con mascarilla o cámara si vomita. Epidural con morfina para analgesia.',
    consideraciones_por_raza: 'Estruvita: Schnauzer miniatura, Bichón frisé, Cocker, Shih Tzu, Caniche miniatura, Lhasa Apso; hembras. Oxalato: Schnauzer miniatura, Shih Tzu, Pomerania, Yorkshire, Maltés; machos castrados obesos. Urato: Dálmata y Bulldog inglés, y razas con cortocircuito portosistémico. Sílice: Pastor alemán y Bobtail. Cistina: Dachshund, Basset, Bulldog inglés, Terranova, Chihuahua.',
    consideraciones_comorbilidades: 'Infección urinaria frecuente aunque el sedimento sea normal: urocultivo y cultivo de mucosa y cálculo. Hiperpotasemia (>7 mEq/L: salino 0,9 %). Dálmatas con urato: cistotomía con uretrostomía escrotal reduce la recidiva.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 25, pp. 678–687, 696–697 y 701–705.',
  },
  guide: {
    draft: true,
    lede: 'Apertura de la vejiga para retirar cálculos, tomar biopsias o tratar otras lesiones. La vejiga cicatriza rápido y recupera toda su fuerza en 2–3 semanas; lo que falla en la práctica es dejar cálculos atrás, cosa que ocurre en hasta el 20 % de las cistotomías. Por eso la cirugía termina con un lavado completo de la uretra y una radiografía.',
    meta: { species: ['perro', 'gato'], duration: '30–60 min', difficulty: 'básica', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Repite la radiografía el mismo día: los cálculos se mueven y pueden estar en la uretra.',
      'Si hay un cálculo uretral, devuélvelo a la vejiga con retrohidropulsión para hacer una cistotomía y no una uretrotomía.',
      'Incide la cara ventral del cuerpo, lejos de los uréteres, la uretra y los vasos grandes.',
      'Lava la uretra hacia la vejiga y desde la vejiga hasta que estés seguro de que no queda nada; envía los cálculos a análisis y un trozo de mucosa a cultivo.',
      'Termina con una radiografía antes de despertar al paciente.',
    ],
    indications: [
      'Cálculos vesicales que no se disuelven (oxalato de calcio, fosfato de calcio, sílice) o que pueden obstruir la uretra (p. 704).',
      'Cálculos uretrales devueltos a la vejiga por retrohidropulsión.',
      'Identificación y biopsia de masas; uréteres ectópicos; divertículo uracal.',
      'Infección urinaria resistente al tratamiento (biopsia y cultivo de mucosa).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Imágenes.', body: 'Radiografía y ecografía de todo el aparato urinario (también riñones y uréteres). Los cálculos de calcio son los más radiopacos y los de urato y cistina los menos; la cistografía de doble contraste es el método más sensible para hallarlos.', cite: 'Fossum p. 703' },
              { title: 'Laboratorio.', body: 'Hemograma, bioquímica con electrolitos, orina y urocultivo: la infección es frecuente aunque falten piuria, hematuria y bacteriuria. En uratos, busca insuficiencia hepática.', cite: 'Fossum p. 703' },
              { title: '¿Disolver o operar? (tabla 25.5)', body: 'La estruvita, el urato y la cistina pueden disolverse con dieta o fármacos; el oxalato, el fosfato de calcio y el sílice requieren extracción. La urohidropropulsión con vaciamiento o la cistoscopia con canastilla o láser sirven para cálculos pequeños.', cite: 'Fossum p. 702–704' },
              { title: 'Obstrucción.', body: 'Desobstruye o descomprime la vejiga; trata la azotemia posrenal y la hiperpotasemia antes de anestesiar (Box 25.1) y empieza la diuresis.', cite: 'Fossum p. 679, 704' },
              { title: 'Infección.', body: 'Controla la infección antes si se puede; si el urocultivo es negativo, puedes esperar al cultivo de la mucosa para dar el antibiótico.', cite: 'Fossum p. 704–705' },
              { title: 'Campo.', body: 'Decúbito dorsal; prepara desde debajo del pubis hasta el tórax. En machos, lava el prepucio con clorhexidina o povidona diluida si queda en el campo.', cite: 'Fossum p. 685, 705' },
            ],
          },
          {
            type: 'steps',
            items: [
              { title: 'Retrohidropulsión: sonda.', body: 'Coloca una sonda en la uretra distal al cálculo.', cite: 'Fossum p. 703' },
              { title: 'Ocluye.', body: 'Un ayudante ocluye la uretra entre el cálculo y la vejiga con un dedo en el recto (o en la vagina en hembras).' },
              { title: 'Distiende.', body: 'Inyecta con fuerza salino estéril, o salino con un poco de lubricante estéril (1:5), hasta dilatar la uretra.', cite: 'Fossum p. 703' },
              { title: 'Suelta.', body: 'Retira la presión del dedo para que el cálculo vuelva a la vejiga (fig. 25.36). Deja la sonda hasta la cirugía.', cite: 'Fossum p. 703' },
            ],
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
              drug('Premedicación', 'Metadona', '0,1–0,3 mg/kg', 'IV o IM', 'Dosis baja si está obstruido o deprimido.'),
              drug('Premedicación', 'Midazolam', '0,2 mg/kg', 'IV o IM', 'Con opioide para inducir sin vasodilatación ni depresión miocárdica graves.'),
              drug('Inducción', 'Alfaxalona', '1–3 mg/kg', 'IV, a efecto', 'O propofol reducido, o etomidato (estabilidad cardiovascular, no arritmógeno).'),
              drug('Mantenimiento', 'Isoflurano', 'A efecto', 'Inhalatoria', 'Sevoflurano con flujo de oxígeno >2 L/min si hay compromiso renal.'),
              drug('Epidural', 'Morfina sin conservante', '0,1 mg/kg', 'Epidural lumbosacra', 'Puede combinarse con bupivacaína 0,5 mg/kg. Puede retener orina.'),
              drug('Hiperpotasemia', 'Gluconato de calcio 10 %', '0,2–1,5 mL/kg', 'IV lento en 5–10 min con ECG', 'Protección cardiaca transitoria (Box 25.1).'),
              drug('Hiperpotasemia', 'Insulina regular', '0,2–0,4 UI/kg', 'IV', 'Con dextrosa 2 g por unidad de insulina (Box 25.1).'),
              ...[drug('Postoperatorio', 'Meloxicam', '0,1–0,2 mg/kg', 'SC o VO, una vez', 'Solo con función renal normal y sin hipotensión; en gatos, dosis única.'), drug('Postoperatorio', 'Buprenorfina', '0,01–0,02 mg/kg', 'IV, IM o transmucosa', 'En gatos es mejor analgésico que la morfina.')],
            ],
          },
          { type: 'note', kind: 'error', title: 'En el obstruido', bullets: ['En gatos obstruidos o con disfunción renal, evita o reduce la ketamina: se elimina activa por la orina.', 'Hiperpotasemia mayor de 7 mEq/L: líquidos con salino 0,9 %.', 'Sin inducción con mascarilla o cámara si vomita.', 'Sin aminoglucósidos.'] },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          {
            type: 'list',
            items: [
              'Vacía, la vejiga queda sobre todo en la cavidad pélvica; un perro de 12 kg la llena con unos 120 mL sin distenderla en exceso (p. 684).',
              'Trígono (unión con la uretra, donde desembocan los uréteres) y cuerpo.',
              'Irrigación por las arterias vesicales craneal y caudal (de la umbilical y la urogenital).',
              'Inervación simpática por los hipogástricos, parasimpática por el pélvico y somática del esfínter externo por el pudendo.',
              'La uretra del macho tiene porción prostática, membranosa (pélvica) y peneana; la prostática se alcanza desde el abdomen, la membranosa requiere osteotomía o sinfisiotomía.',
            ],
          },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [
          { type: 'steps', items: [CELIOTOMY_STEPS[0], { title: 'Incisión.', body: 'Del ombligo a caudal al pubis; en machos, junto al prepucio, ligando la epigástrica superficial caudal.', cite: 'Fossum p. 684' }, CELIOTOMY_STEPS[2]] },
          {
            type: 'steps',
            items: [
              { title: 'Aísla.', body: 'Compresas húmedas bajo la vejiga.', cite: 'Fossum p. 685' },
              { title: 'Puntos de sostén.', body: 'En el ápice y en el trígono para manipularla (fig. 25.8A).', cite: 'Fossum p. 685' },
              { title: 'Vacía.', body: 'Aspira la orina, o haz una cistocentesis antes de abrir si no hay aspirador.', cite: 'Fossum p. 685' },
              { title: 'Incide.', body: 'Longitudinal en la cara ventral (preferida por el acceso y para identificar o sondar los uréteres), lejos de uréteres y uretra y entre los vasos grandes.', cite: 'Fossum p. 685' },
              { title: 'Cultivo.', body: 'Extirpa un pequeño trozo de mucosa junto a la incisión para cultivo aerobio (y histología si hace falta).', cite: 'Fossum p. 685, 705' },
              { title: 'Ápice.', body: 'Busca un divertículo uracal y extírpalo si lo hay.', cite: 'Fossum p. 685' },
              { title: 'Extrae los cálculos.', body: 'Con cucharilla; revisa la mucosa en busca de lesiones.' },
              { title: 'Lava la uretra retrógrada.', body: 'En machos, sonda desde el pene, tu dedo ocluye el orificio vesicouretral desde dentro, el ayudante ocluye la uretra peneana alrededor de la sonda; inyecta salino hasta dilatar al máximo y, sin dejar de inyectar, retira el dedo. Repite hasta estar seguro.', cite: 'Fossum p. 705' },
              { title: 'Lava normógrado.', body: 'Pasa una sonda desde la vejiga por la uretra y lava hacia afuera para no pasar por alto ningún cálculo.', cite: 'Fossum p. 705' },
              { title: 'Cierra.', body: 'Una capa con continuo simple (preferido) o simples, absorbible 3-0 o 4-0. Atravesar la luz en vejigas finas no forma cálculos si el hilo es absorbible monofilamento. Si sangra mucho, cierra la mucosa aparte con un continuo.', cite: 'Fossum p. 685' },
              { title: 'Prueba.', body: 'Distiende la vejiga con salino por la sonda y revisa fugas; en vejigas finas que filtran, segunda capa (fig. 25.8B).', cite: 'Fossum p. 687' },
              { title: 'Análisis.', body: 'Envía los cálculos a análisis mineral y cultivo: el tipo no se deduce de los cristales de la orina.', cite: 'Fossum p. 704–705' },
              { title: 'Radiografía.', body: 'Antes de despertarlo, para confirmar que no quedan cálculos radiopacos.', cite: 'Fossum p. 685, 705' },
            ],
          },
          { type: 'note', kind: 'why', title: 'Por qué una sola capa', text: 'Un estudio no encontró diferencias de complicaciones entre el cierre en dos capas invertidas y el de una capa aposicional; la capa única aposicional se prefiere siempre que la pared es gruesa y basta en vejigas normales (p. 685).' },
          { type: 'note', kind: 'error', title: 'Errores frecuentes', bullets: ['Dejar cálculos en la uretra: el error más común.', 'No absorbibles en vejiga o uretra: núcleo de nuevos cálculos (p. 696).', 'Hilo que se degrada rápido en orina infectada: Vicryl y Monocryl se degradan antes; con Proteus, cualquier monofilamento hidrolizable puede perder fuerza en 7 días.'] },
          { type: 'note', kind: 'tip', title: 'Cistostomía temporal', text: 'Si hay que desviar la orina (uretra lesionada o reparada, atonía): sonda Foley de 6–20 Fr por una incisión aparte con bolsa de tabaco y pexia de la vejiga a la pared, o sonda de Malecot percutánea. La Foley se deja al menos 5–7 días (p. 685–686).' },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Diuresis.', body: 'Tras desobstruir, líquidos IV hasta que cese la diuresis postobstructiva; vigila el potasio (hipopotasemia).', cite: 'Fossum p. 696' },
              { title: 'Que orine.', body: 'La atonía vesical aparece con apenas 12 h de distensión si está sedado, con opioides o no orina por dolor: vacía la vejiga por expresión o sonda hasta que orine normal.', cite: 'Fossum p. 696' },
              { title: 'Hematuria y disuria.', body: 'Transitorias en el 37–50 %: avisa al tutor.', cite: 'Fossum p. 697' },
              { title: 'Analgesia.', body: 'Según el dolor; collar isabelino si hay sonda.' },
              { title: 'Prevención.', body: 'Según el análisis: dieta, más agua, controles de orina y radiografía; el tratamiento médico de prevención no antes de 2 semanas.', cite: 'Fossum p. 705' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Cicatrización y pronóstico', text: 'La vejiga recupera el 100 % de su fuerza en 14–21 días y se reepiteliza en 30. La recidiva de cálculos llega al 12–25 %, más con cistina y urato; prevenir la infección reduce la de estruvita. En Dálmatas con urato, la cistotomía con uretrostomía escrotal es lo más eficaz (p. 696, 704–705).' },
        ],
      },
    ],
    closure: [
      { layer: 'Vejiga', suture: 'PDS, Maxon, Biosyn, Monocryl o Vicryl', gauge: '3-0 o 4-0', pattern: 'Una capa continua simple aposicional (o simples)', why: 'Cicatriza rápido; el absorbible monofilamento en la luz no forma cálculos. PDS, Maxon o Biosyn si hay infección.' },
      { layer: 'Mucosa (si sangra mucho)', suture: 'Absorbible', gauge: '4-0', pattern: 'Continuo simple aparte', why: 'Reduce la hemorragia postoperatoria.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Cálculos que quedan (20 %)', prevent: 'Lavado retrógrado y normógrado de la uretra, radiografía postoperatoria.', manage: 'Reintervenir antes de despertar si se ven.' },
      { name: 'Hematuria y disuria', prevent: 'Manipulación suave.', manage: 'Transitorias; analgesia.' },
      { name: 'Fuga de orina y uroabdomen', prevent: 'Cierre estanco, prueba de distensión.', manage: 'Sonda, reintervención.' },
      { name: 'Atonía vesical', prevent: 'Evitar la sobredistensión postoperatoria.', manage: 'Vaciamiento manual o sonda.' },
      { name: 'Recidiva (12–25 %)', prevent: 'Análisis del cálculo y prevención específica; tratar la infección.', manage: 'Dieta, urohidropropulsión o cistoscopia.' },
    ],
    quiz: [
      { q: '¿Cuál es la complicación más frecuente de la cistotomía y cómo la evitas?', a: 'Dejar cálculos (hasta 20 %); con lavado retrógrado y normógrado de la uretra y radiografía postoperatoria.' },
      { q: '¿Cómo haces la retrohidropulsión?', a: 'Sonda distal al cálculo, oclusión de la uretra por el recto o la vagina, infusión forzada de salino (con lubricante 1:5) y liberación brusca de la oclusión.' },
      { q: '¿Qué cálculos requieren cirugía y cuáles pueden disolverse?', a: 'Oxalato, fosfato de calcio y sílice requieren extracción; estruvita, urato y cistina pueden disolverse.' },
      { q: '¿Cómo cierras la vejiga según el Fossum?', a: 'En una capa con continuo simple aposicional de absorbible 3-0 o 4-0; mucosa aparte si sangra mucho.' },
      { q: '¿Qué precaución tienes con el hilo en una infección por Proteus?', a: 'Que los monofilamentos absorbibles hidrolizables pueden perder fuerza en 7 días en orina con Proteus.' },
      { q: '¿Por qué cultivas la mucosa además de la orina?', a: 'Porque puede ser positiva aunque el urocultivo sea negativo.' },
    ],
    videos: [
      { title: 'Bladder Stone Removal in a Dog', url: 'https://www.youtube.com/watch?v=tXwW_7wGY8c', channel: 'Everyday Vet', lang: 'inglés', note: 'Cistotomía y análisis del urolito' },
      { title: 'Cystotomy for bladder stone removal', url: 'https://www.youtube.com/watch?v=wsruME9HTJA', channel: 'Complete Care Animal Hospital', lang: 'inglés', note: 'Cirugía completa' },
    ],
    sources: [
      SOURCES.fossum(25, 'cirugía de la vejiga y la uretra: anestesia, antibióticos, anatomía, cistotomía y cistostomía (pp. 678–687), cicatrización, suturas, cuidados y complicaciones (pp. 696–697), cálculos (pp. 701–705)'),
      SOURCES.fossum(19, 'cirugía de la cavidad abdominal: celiotomía y cierre (pp. 514–518)'),
      SOURCES.plumbs,
    ],
  },
};
