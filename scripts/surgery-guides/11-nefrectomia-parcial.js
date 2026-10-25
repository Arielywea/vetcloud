// Nefrectomía parcial y total (id 11). Rewritten from Fossum 5.ª ed., cap. 24 (pp. 650–663, 671–674).
const { drug, ABDOMINAL_CLOSURE, CELIOTOMY_STEPS, SOURCES } = require('./_common');

module.exports = {
  id: 11,
  legacy: {
    indicaciones: 'Nefrectomía total (ureteronefrectomía): neoplasia renal, hemorragia renal incontrolable, fuga persistente de orina, pielonefritis resistente (con nefrolitos), hidronefrosis y anomalías ureterales irreparables (avulsión, estenosis, rotura, obstrucción por cálculos). Parcial: lesiones focales cuando hay que conservar función por disfunción bilateral; en la mayoría de los casos la total es más fácil y sangra menos.',
    tecnica_quirurgica: 'Celiotomía del xifoides a caudal al ombligo (hasta el pubis si se corta el uréter distal). Exponer el riñón derecho elevando el duodeno y el izquierdo elevando el mesocolon. Total: incidir el peritoneo, liberar el riñón de sus uniones sublumbares, elevarlo y llevarlo a medial para ver la arteria y la vena en la cara dorsal del hilio; identificar todas las ramas arteriales; doble ligadura de la arteria cerca de la aorta (transfixiante si mide más de 3–4 mm) y luego de la vena, sin ligarlas juntas; conservar la vena ovárica o testicular izquierda en enteros; ligadura del uréter cerca de la vejiga. Parcial: despegar la cápsula, hilo absorbible 0 o 1 con dos agujas rectas largas atravesando el riñón en la línea de resección y tres ligaduras, resección distal, ligadura de vasos y sutura de los divertículos con 2-0 o 3-0, cápsula sobre el extremo y anclaje sublumbar; o pinzas vasculares en los vasos renales. Sin electrocoagulación del parénquima.',
    material_quirurgico: 'Instrumental de laparotomía, separadores de Balfour, compresas, pinzas vasculares (bulldog, Satinsky) o torniquete, hilo absorbible 0 o 1 con dos agujas rectas largas, seda cardiovascular opcional, instrumental fino, sangre disponible.',
    tipo_sutura: 'Arteria y vena renales: doble ligadura absorbible (PDS, Maxon, Biosyn, Monocryl) o seda cardiovascular; transfixiante si la arteria mide más de 3–4 mm. Uréter: ligadura circunferencial. Parcial: 0 o 1 absorbible (ligaduras parenquimatosas), 2-0 o 3-0 (vasos y divertículos), cápsula continua. Evitar no absorbibles en el urotelio (cálculos e infección).',
    complicaciones_frecuentes: 'Insuficiencia renal, hemorragia y fuga de orina; fístula arteriovenosa si se ligan arteria y vena juntas; lesión del uréter contralateral al extirpar masas grandes; hemorragia posoperatoria más frecuente en la parcial.',
    manejo_anestesico_sugerido: 'Tabla 24.1: no retirar el agua; rehidratar en 4–6 h; transfundir si hematocrito <20 % (perros) o <18 % (gatos); evitar sedantes en enfermos, α2 y acepromacina; midazolam si ansioso; opioide si no está descompensado. Inducción lenta a dosis bajas (etomidato, propofol 1–4 mg/kg o alfaxalona si deshidratado); isoflurano con fentanilo. Presión media 70–80 mmHg, diuresis ≥0,5 mL/kg/h. AINE, aminoglucósidos y algunos contrastes contraindicados.',
    consideraciones_por_raza: 'Pastor alemán: cistoadenocarcinoma renal con dermatofibrosis nodular. Gatos: el linfoma es el tumor renal más común, a menudo bilateral (no quirúrgico). Uréter circuncavo frecuente en gatos.',
    consideraciones_comorbilidades: 'Antes de la nefrectomía, medir la función del riñón contralateral (TFG con marcador exógeno o gammagrafía); la disfunción bilateral empeora el pronóstico. En neoplasias, radiografía o TC de tórax y abdomen y ecografía (metástasis, también al otro riñón). Coagulopatía: evitar la parcial.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 24, tabla 24.1 y pp. 650–663 y 671–674.',
  },
  guide: {
    draft: true,
    lede: 'Extirpación de un riñón con su uréter, o de solo una parte del riñón. El libro es claro: en la mayoría de los casos la nefrectomía total es más fácil y sangra menos que la parcial, que se reserva para conservar función cuando ambos riñones fallan. Antes de quitar nada, hay que saber que el otro riñón funciona.',
    meta: { species: ['perro', 'gato'], duration: '60–120 min', difficulty: 'avanzada', contamination: 'limpia' },
    before_you_start: [
      'Mide la función del riñón contralateral (TFG con marcador exógeno o gammagrafía): sin eso no extirpes tejido renal.',
      'Identifica el uréter contralateral antes de sacar el riñón afectado, sobre todo con masas grandes.',
      'Liga primero la arteria, cerca de la aorta para incluir todas sus ramas, y luego la vena; nunca juntas (fístula arteriovenosa).',
      'En hembras y machos enteros, conserva la vena ovárica o testicular izquierda, que drena en la vena renal.',
      'Mantén la presión media en 70–80 mmHg y la diuresis en al menos 0,5 mL/kg/h; nada de AINE ni aminoglucósidos.',
    ],
    indications: [
      'Total: neoplasia renal (85 % de los tumores renales son malignos; en el perro predomina el carcinoma tubular) (p. 673).',
      'Total: hemorragia renal incontrolable, fuga persistente de orina, pielonefritis resistente con nefrolitos, hidronefrosis (p. 655–656).',
      'Total: anomalías ureterales irreparables (avulsión, estenosis, rotura, obstrucción por cálculos) con buen riñón contralateral.',
      'Parcial: lesión focal de un polo cuando hay que preservar función por disfunción renal bilateral (p. 656).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Función de cada riñón.', body: 'Creatinina, urea, SDMA, orina y relación proteína/creatinina; TFG del riñón contralateral con un marcador exógeno o gammagrafía. Estadio IRIS de la enfermedad crónica si la hay (Box 24.1).', cite: 'Fossum p. 651, 656' },
              { title: 'Estadificación en tumores.', body: 'Radiografía o TC de tórax y abdomen y ecografía para descartar metástasis, también en el otro riñón.', cite: 'Fossum p. 656' },
              { title: 'Electrolitos y volemia.', body: 'Corrige despacio la hipovolemia, el potasio, la anemia y la hipotermia. En la obstrucción aguda, limita los líquidos hasta resolverla.', cite: 'Fossum p. 651' },
              { title: 'Agua.', body: 'No retires el agua antes de la cirugía y da líquidos IV a casi todos los pacientes renales.', cite: 'Fossum p. 653' },
              { title: 'Transfusión.', body: 'Si el hematocrito es menor de 20 % en perros o 18 % en gatos.', cite: 'Fossum p. 651' },
              { title: 'Antibiótico (Box 24.2).', body: 'Según el urocultivo; si no se empezó, cefazolina 22 mg/kg IV tras tomar los cultivos intraoperatorios. Evitar aminoglucósidos, tetraciclinas (salvo doxiciclina) y sulfonamidas.', cite: 'Fossum p. 653, 672' },
              { title: 'Coagulación.', body: 'No hagas una nefrectomía parcial con coagulopatía clínicamente significativa.', cite: 'Fossum p. 656' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Estadios IRIS por creatinina (Box 24.1)', bullets: ['Perro: estadio 1 <1,4 mg/dL · 2: 1,4–2,0 · 3: 2,1–5,0 · 4: >5,0.', 'Gato: estadio 1 <1,6 mg/dL · 2: 1,6–2,8 · 3: 2,9–5,0 · 4: >5,0.', 'Subestadios por proteinuria y por presión sistólica (riesgo alto sobre 180 mmHg).'] },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'Volumen de distribución y aclaramiento reducidos: dosis bajas, administradas despacio y tituladas (tabla 24.1, p. 652).',
        blocks: [
          {
            type: 'drugs',
            items: [
              drug('Premedicación', 'Midazolam', '0,1–0,2 mg/kg', 'IV o IM', 'Solo si está ansioso. Evitar sedantes en el enfermo, α2 y acepromacina.'),
              drug('Premedicación', 'Metadona', '0,1–0,2 mg/kg', 'IV o IM', 'Si no está descompensado. El descompensado a menudo no necesita premedicación.'),
              drug('Premedicación', 'Atropina o glicopirrolato', '0,02–0,04 mg/kg (atropina)', 'IV o IM', 'Si está bradicárdico.'),
              drug('Inducción (deshidratado)', 'Propofol', '1–4 mg/kg', 'IV lento', 'O etomidato 0,5–1,5 mg/kg o alfaxalona 2–3 mg/kg.'),
              drug('Inducción (hidratado)', 'Alfaxalona', '3–5 mg/kg', 'IV, a efecto', 'O propofol 2–6 mg/kg. Evitar ketamina a dosis de inducción en el enfermo crónico.'),
              drug('Mantenimiento', 'Isoflurano', 'CAM reducida', 'Inhalatoria', 'De elección en pacientes con arritmias.'),
              drug('Intraoperatorio', 'Fentanilo', '0,001–0,005 mg/kg', 'IV, carga', 'Luego infusión 1–10 µg/kg/h.'),
              drug('Líquidos', 'Cristaloides', '20 mL/kg la primera hora', 'IV', 'Si no está anúrico; luego 5–10 mL/kg/h más tres veces la pérdida de sangre.'),
              drug('Oliguria', 'Manitol', '0,25–0,5 g/kg', 'IV', 'Si está oligúrico pero normotenso (gatos, según el texto).'),
              drug('Oliguria con hipotensión', 'Dopamina', '0,005–0,02 mg/kg/min', 'IV, infusión', 'Perros: 5–20 µg/kg/min; gatos: 2 µg/kg/min. O dobutamina 2 µg/kg/min.'),
              drug('Postoperatorio', 'Buprenorfina', '0,005–0,02 mg/kg', 'IV o IM cada 4–8 h', 'AINE contraindicados.'),
            ],
          },
          { type: 'note', kind: 'why', title: 'Por qué 70–80 mmHg', text: 'El riñón autorregula su flujo entre 75 y 160 mmHg; por debajo se vasocontrae y se daña. Si vas a quitar un riñón, proteger el flujo del que queda es la prioridad (p. 651).' },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          {
            type: 'list',
            items: [
              'Los riñones son retroperitoneales, a los lados de la aorta y la cava, con cápsula fibrosa. El polo craneal del derecho está a la altura de la 13.ª costilla y lo cubre el proceso caudado del hígado; el izquierdo está media longitud renal más caudal (p. 653).',
              'La arteria renal suele dividirse en ramas dorsal y ventral, pero las variaciones de arterias y venas son frecuentes: identifica todas las ramas.',
              'La vena ovárica o testicular izquierda drena en la vena renal izquierda.',
              'El uréter sale de la pelvis renal y entra oblicuo en la cara dorsal de la vejiga; lo irrigan la arteria ureteral craneal (de la renal) y la caudal (prostática o vaginal).',
              'Riñón derecho: se expone elevando el duodeno y llevando el intestino a la izquierda. Izquierdo: elevando el mesocolon y llevando el intestino a la derecha (p. 654).',
            ],
          },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          { id: 'abordaje', title: 'A. Abordaje', blocks: [{ type: 'steps', items: [...CELIOTOMY_STEPS.slice(0, 3), { title: 'Largo.', body: 'Del xifoides a caudal al ombligo; hasta el pubis si se va a cortar el uréter distal o hacer una cistotomía.', cite: 'Fossum p. 654' }, ...CELIOTOMY_STEPS.slice(4), { title: 'Aísla el riñón.', body: 'Con compresas húmedas tras exponerlo con el duodeno o el mesocolon.', cite: 'Fossum p. 654' }] }] },
          {
            id: 'total',
            title: 'B. Nefrectomía total (ureteronefrectomía)',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Uréter contralateral.', body: 'Identifícalo antes de extirpar el riñón afectado para no cortarlo por error.', cite: 'Fossum p. 656' },
                  { title: 'Libera el riñón.', body: 'Toma e incide el peritoneo sobre el riñón y libéralo de sus uniones sublumbares con disección roma y cortante.', cite: 'Fossum p. 656' },
                  { title: 'Expón el hilio.', body: 'Eleva el riñón y llévalo a medial para ver la arteria y la vena en la cara dorsal del hilio (fig. 24.3).', cite: 'Fossum p. 656' },
                  { title: 'Todas las ramas.', body: 'Identifica cada rama de la arteria renal.' },
                  { title: 'Arteria.', body: 'Doble ligadura con absorbible o seda cardiovascular cerca de la aorta, para incluir todas las ramas; transfixiante si mide más de 3–4 mm.', cite: 'Fossum p. 656' },
                  { title: 'Vena.', body: 'Doble ligadura igual. En enteros, no ligues la vena ovárica o testicular izquierda.', cite: 'Fossum p. 656' },
                  { title: 'Nunca juntas.', body: 'Ligar arteria y vena en bloque puede formar una fístula arteriovenosa.', cite: 'Fossum p. 656' },
                  { title: 'Uréter.', body: 'Síguelo hasta cerca de la vejiga y lígalo con una ligadura circunferencial.', cite: 'Fossum p. 656' },
                  { title: 'Muestras.', body: 'Toma los cultivos y envía el riñón y el uréter a histopatología.', cite: 'Fossum p. 656' },
                  { title: 'Revisa.', body: 'Hemostasia del retroperitoneo y de las ligaduras.' },
                ],
              },
            ],
          },
          {
            id: 'parcial',
            title: 'C. Nefrectomía parcial',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Cápsula.', body: 'Si se puede, despega la cápsula de la zona que vas a extirpar.', cite: 'Fossum p. 656' },
                  { title: 'Hilo con dos agujas.', body: 'Absorbible 0 o 1 con dos agujas rectas largas; pásalas a través del riñón en la línea de resección (fig. 24.4A-B).', cite: 'Fossum p. 656' },
                  { title: 'Tres ligaduras.', body: 'Anuda el hilo en tres ligaduras separadas sin dañar los vasos renales ni el uréter (fig. 24.4C).', cite: 'Fossum p. 656' },
                  { title: 'Reseca.', body: 'Extirpa el tejido distal a las ligaduras.' },
                  { title: 'Hemostasia y divertículos.', body: 'Liga los vasos que sangren y sutura los divertículos expuestos con 2-0 o 3-0 absorbible. No electrocoagules el parénquima: lo daña en exceso.', cite: 'Fossum p. 656' },
                  { title: 'Cápsula y anclaje.', body: 'Aproxima la cápsula sobre el extremo del riñón (fig. 24.4D) y fíjala a los tejidos sublumbares para que el riñón no rote.', cite: 'Fossum p. 656' },
                  { title: 'Alternativa con pinzas.', body: 'Pinzas vasculares en los vasos renales, resección, ligadura de los vasos del parénquima y cierre de la pelvis y los divertículos; sutura la cápsula y retira las pinzas.', cite: 'Fossum p. 656' },
                ],
              },
              { type: 'note', kind: 'error', title: 'Isquemia', text: 'Si ocluyes los vasos renales, hazlo el menor tiempo posible y planifica cada paso antes de pinzar.' },
            ],
          },
          {
            id: 'nefrotomia',
            title: 'D. Nefrotomía y pielolitotomía (alternativas para cálculos)',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Cuándo no.', body: 'No en hidronefrosis grave (falta parénquima para evitar la fuga); puede bajar la función renal un 25–50 %; las bilaterales, en tiempos separados.', cite: 'Fossum p. 656' },
                  { title: 'Ocluye.', body: 'Ocluye temporalmente los vasos renales con pinzas vasculares, torniquete o los dedos de un ayudante.', cite: 'Fossum p. 656' },
                  { title: 'Bisección.', body: 'Incisión en la línea media del borde convexo de la cápsula y disección roma del parénquima hasta la pelvis, ligando vasos según haga falta (fig. 24.5).', cite: 'Fossum p. 656' },
                  { title: 'Cálculos y lavado.', body: 'Cultiva la pelvis, saca los cálculos, lava con salino o Ringer tibio y comprueba la permeabilidad del uréter con una sonda de 3,5 Fr.', cite: 'Fossum p. 656' },
                  { title: 'Cierre sin suturas.', body: 'Aproxima las mitades y comprime unos 5 minutos mientras restableces el flujo; o cápsula con continuo absorbible; colchoneros transparenquimatosos solo si sangra o filtra.', cite: 'Fossum p. 657' },
                  { title: 'Pielolitotomía.', body: 'Si la pelvis y el uréter proximal están dilatados: incisión sobre ellos por la cara dorsal, extracción, lavado y cierre continuo con 5-0 o 6-0 absorbible (fig. 24.6). Evita el daño del parénquima.', cite: 'Fossum p. 657' },
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
              { title: 'Hematocrito.', body: 'Seriado; abdominocentesis ecoguiada o drenaje peritoneal si sospechas hemorragia o fuga.', cite: 'Fossum p. 662–663' },
              { title: 'Transfusión u oxígeno.', body: 'Sangre o nueva cirugía si hay hemorragia importante; oxígeno nasal al anémico en la recuperación.', cite: 'Fossum p. 663' },
              { title: 'Diuresis e hidratación.', body: 'Sonda urinaria para medir la producción de orina; presión venosa central si hace falta.', cite: 'Fossum p. 663' },
              { title: 'Fuga de orina.', body: 'Creatinina y potasio del líquido abdominal mayores que los séricos.', cite: 'Fossum p. 663' },
              { title: 'Electrolitos y analgesia.', body: 'Corrige electrolitos y ácido-base; analgesia con opioides, sin AINE.', cite: 'Fossum p. 663' },
              { title: 'Geriátricos.', body: 'Suelen tener algún grado de enfermedad renal: evita la hipotensión y, si hay cardiopatía, no sobrehidrates.', cite: 'Fossum p. 663' },
            ],
          },
        ],
      },
    ],
    closure: [
      { layer: 'Arteria renal', suture: 'PDS, Maxon, Biosyn o Monocryl; o seda cardiovascular', gauge: '2-0 o 3-0', pattern: 'Doble ligadura cerca de la aorta; transfixiante si >3–4 mm', why: 'Incluye todas las ramas; se liga antes que la vena.' },
      { layer: 'Vena renal', suture: 'Absorbible o seda', gauge: '2-0 o 3-0', pattern: 'Doble ligadura, por separado de la arteria', why: 'Evita la fístula arteriovenosa; conserva la vena gonadal izquierda.' },
      { layer: 'Uréter', suture: 'Absorbible', gauge: '3-0', pattern: 'Ligadura circunferencial cerca de la vejiga', why: 'Un muñón largo puede infectarse o acumular orina.' },
      { layer: 'Parénquima (parcial)', suture: 'Absorbible con dos agujas rectas', gauge: '0 o 1', pattern: 'Tres ligaduras a través del riñón', why: 'Hemostasia del parénquima antes de cortar.' },
      { layer: 'Divertículos y vasos (parcial)', suture: 'Absorbible', gauge: '2-0 o 3-0', pattern: 'Ligadura y sutura', why: 'Evita la fuga de orina.' },
      { layer: 'Cápsula', suture: 'Absorbible', gauge: '3-0 o 4-0', pattern: 'Continuo, anclada a los tejidos sublumbares', why: 'Cubre el extremo y evita que el riñón rote.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Insuficiencia renal', prevent: 'Confirmar la función contralateral, presión media 70–80 mmHg, diuresis, sin nefrotóxicos.', manage: 'Líquidos guiados por la diuresis, manitol o dopamina según el caso, soporte renal.' },
      { name: 'Hemorragia', prevent: 'Ligar cada rama arterial cerca de la aorta, transfixiante en arterias grandes; evitar la parcial con coagulopatía.', manage: 'Transfusión, reintervención.' },
      { name: 'Fuga de orina', prevent: 'Suturar los divertículos en la parcial; no hacer nefrotomía en hidronefrosis grave.', manage: 'Drenaje, nefrectomía completa si persiste.' },
      { name: 'Fístula arteriovenosa', prevent: 'Ligar arteria y vena por separado.', manage: 'Reintervención.' },
      { name: 'Lesión del uréter contralateral', prevent: 'Identificarlo antes de extirpar.', manage: 'Reparación o reimplante urgente.' },
    ],
    quiz: [
      { q: '¿Qué confirmas antes de una nefrectomía y cómo?', a: 'La función del riñón contralateral, con la TFG medida con un marcador exógeno o por gammagrafía.' },
      { q: '¿Dónde y en qué orden ligas los vasos renales?', a: 'Primero la arteria, con doble ligadura cerca de la aorta para incluir todas las ramas (transfixiante si mide más de 3–4 mm), y luego la vena, por separado.' },
      { q: '¿Por qué no se ligan juntas la arteria y la vena renales?', a: 'Porque puede formarse una fístula arteriovenosa.' },
      { q: '¿Qué vena conservas en un perro entero y por qué?', a: 'La ovárica o testicular izquierda, que drena en la vena renal izquierda.' },
      { q: '¿Cómo se hace la nefrectomía parcial según el Fossum?', a: 'Con un hilo absorbible 0 o 1 con dos agujas rectas que atraviesa el riñón y forma tres ligaduras; resección distal, sutura de vasos y divertículos con 2-0 o 3-0, cápsula sobre el extremo y anclaje sublumbar, sin electrocoagular.' },
      { q: '¿Qué presión arterial y qué diuresis buscas durante la cirugía?', a: 'Presión media de 70–80 mmHg y al menos 0,5 mL/kg/h de orina.' },
    ],
    videos: [
      { title: 'Nephrectomy in a dog', url: 'https://www.youtube.com/watch?v=jBo-Pl9H67U', channel: 'VetDojo (Dr. James Simcock)', lang: 'inglés', note: 'Nefrectomía completa por hidrouréter infectado' },
    ],
    sources: [
      SOURCES.fossum(24, 'cirugía del riñón y el uréter: anestesia (tabla 24.1), antibióticos, anatomía, biopsia, nefrectomía total y parcial, nefrotomía, pielolitotomía, cuidados y complicaciones (pp. 650–663), cálculos y neoplasias (pp. 671–674)'),
      SOURCES.fossum(19, 'cirugía de la cavidad abdominal: celiotomía y cierre (pp. 514–518)'),
      SOURCES.plumbs,
    ],
  },
};
