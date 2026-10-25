// Mordeduras y abscesos (id 20). Rewritten from Fossum 5.ª ed., cap. 15 (manejo de heridas pp. 183–194, mordeduras y abscesos pp. 243–244).
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 20,
  legacy: {
    indicaciones: 'Absceso subcutáneo por mordedura (sobre todo en gatos) o por punciones que sellaron; heridas por mordedura que deben explorarse y desbridarse; absceso o trayecto fistuloso por cuerpo extraño; herida infectada con tejido necrótico. Las mordeduras penetrantes no se cierran en forma primaria sin exploración y desbridamiento.',
    tecnica_quirurgica: 'Rasurar y preparar asépticamente un área amplia alrededor de la tumefacción o del trayecto; proteger la herida del pelo con gel hidrosoluble estéril o compresas húmedas. Abrir el absceso con asepsia (lancetear o agrandar el orificio del trayecto), tomar cultivo, lavar a fondo la cavidad con 500–1000 mL de salino o Ringer lactato tibio (bolsa de 1 L a 300 mm Hg con aguja 18 G = 7–8 psi), desbridar el tejido necrótico por capas desde la superficie, sin desbridar en exceso el subcutáneo (sobre todo en gatos), extirpar la grasa contaminada respetando los vasos cutáneos. Colocar un drenaje o dejar la herida abierta y vendar. Heridas por mordedura: explorar todas las punciones de espesor completo; si penetran tórax o abdomen, explorar la cavidad. Vendaje hidrofílico 3–5 días y cierre primario diferido, o cierre secundario o segunda intención en heridas crónicas.',
    material_quirurgico: 'Máquina de rasurar, gel hidrosoluble estéril, hoja 15, tijeras de Metzenbaum, pinzas hemostáticas, pinzas de disección, bolsa de presión con alargadera y aguja 18 G (o jeringa de 35–60 mL), salino o Ringer lactato tibio, hisopos y tubos de cultivo aerobio y anaerobio, drenaje de Penrose o drenaje de aspiración cerrada (mariposa y tubo de vacío para espacios pequeños), material de vendaje, collar isabelino.',
    tipo_sutura: 'Herida del absceso: no se sutura en el momento (abierta o con drenaje). Penrose: fijado a la piel en el extremo dorsal; sale por una incisión separada al menos 1 cm de la principal. Cierre primario diferido (3–5 días): subcutáneo 3-0 o 4-0 absorbible monofilamento (PDS, Maxon, Monocryl); piel 3-0 o 4-0 nylon, polipropileno o polibutéster.',
    complicaciones_frecuentes: 'Recidiva del absceso por drenaje insuficiente o cuerpo extraño; infección ascendente por el drenaje; dehiscencia si se cierra con contaminación, tejido necrótico, tensión o espacio muerto; seroma; lesión visceral no detectada en mordeduras torácicas o abdominales; infecciones graves por micobacterias o esporotricosis.',
    manejo_anestesico_sugerido: 'Suele requerir sedación o anestesia para la inspección inicial y el cuidado de la herida. Estabilizar primero las lesiones que ponen en riesgo la vida. Gatos: protocolo IM (dexmedetomidina con ketamina o alfaxalona y un opioide). Bloqueo local en tejido sano alrededor, no dentro del tejido infectado. AINE solo si está hidratado y normotenso.',
    consideraciones_por_raza: 'Gatos: las mordeduras de gato se infectan más que las de perro; machos enteros con acceso al exterior. Perros pequeños mordidos por perros grandes: lesiones profundas mucho mayores de lo que sugiere la piel.',
    consideraciones_comorbilidades: 'Cultivo de todas las heridas. Penicilinas o cefalosporinas al inicio; cefovecina 8 mg/kg SC cada 14 días si hace falta; fluoroquinolona si hay gramnegativos; metronidazol o clindamicina si se sospechan anaerobios. Gatos: test de VIF y ViLeF. Mordeduras torácicas: mortalidad mayor; radiografía y ecografía pueden subestimar la lesión.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 15, pp. 183–194 y 243–244; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Abrir, lavar, desbridar y drenar un absceso, y explorar una herida por mordedura antes de que se convierta en uno. La piel del perro y del gato se mueve libremente y la mordida aplasta y desgarra por debajo: la lesión profunda siempre es mayor que la punción que se ve. Lo que cura es el drenaje y el lavado, no el antibiótico.',
    meta: { species: ['perro', 'gato'], duration: '15–45 min', difficulty: 'básica', contamination: 'sucia' },
    before_you_start: [
      'Estabiliza primero las lesiones que ponen en riesgo la vida; cubre la herida con un vendaje limpio mientras tanto.',
      'Las mordeduras penetrantes nunca se cierran en forma primaria sin exploración y desbridamiento: cerrar o sellar las punciones es lo que produce el absceso.',
      'Rasura un área amplia y protege la herida del pelo con gel hidrosoluble estéril o compresas húmedas.',
      'Cultiva antes de dar el antibiótico.',
      'Lava, no frotes: la gasa sobre la herida daña el tejido y favorece la infección. Nada de agua oxigenada ni solución de Dakin.',
      'Drenaje o herida abierta, siempre bajo vendaje.',
    ],
    indications: [
      'Absceso por mordedura o por punciones que sellaron (p. 244).',
      'Herida por mordedura: toda punción o laceración de espesor completo se explora para retirar restos y tejido desvitalizado y ver la extensión (p. 244).',
      'Mordedura que penetra el tórax o el abdomen: exploración de la cavidad (p. 244).',
      'Herida infectada (> 10⁵ UFC/g de tejido), con exudado espeso, o de más de 6–8 h: manejo como herida abierta (p. 183).',
      'Trayecto fistuloso que drena, por cuerpo extraño (p. 244).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Evaluación',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Cubre y estabiliza.', body: 'Vendaje limpio y seco sobre la herida para frenar la contaminación y el sangrado; trata antes las lesiones que comprometen la vida.', cite: 'Fossum p. 183 (recuadro 15.2)' },
              { title: 'Busca todas las heridas.', body: 'Las mordeduras suelen ser múltiples, en cuello, miembros, cabeza, tórax, hombro, abdomen y periné. En gatos, revisa la base de la cola y la cara.', cite: 'Fossum p. 243' },
              { title: 'Clasifica.', body: 'Contaminada o infectada (> 10⁵ UFC/g, exudado espeso), y si es abrasión, laceración, avulsión, punción o aplastamiento. El "período de oro" son las primeras 6–8 h.', cite: 'Fossum p. 183' },
              { title: 'Imagen.', body: 'Radiografía y ecografía ayudan, pero pueden subestimar mucho la lesión de la pared o interna; la ecografía también ubica colecciones y cuerpos extraños.', cite: 'Fossum p. 244, 194' },
              { title: 'Mordedura torácica.', body: 'La mortalidad de las mordeduras es < 10 % y es mayor cuando son torácicas, por infección o trauma asociado.', cite: 'Fossum p. 243' },
              { title: 'Gatos.', body: 'Test de VIF y ViLeF; repetir a los 60 días de la mordedura.' },
            ],
          },
          {
            type: 'note',
            kind: 'why',
            title: 'Por qué la herida engaña',
            text: 'La piel del perro y del gato se mueve libremente y la presión de una mordida es de 150–450 psi: aplasta, desgarra y despega por debajo de una punción que parece menor. Tejido desvitalizado, espacio muerto, mala irrigación y suero acumulado con flora oral del agresor favorecen a los anaerobios. Las mordeduras de gato se infectan más que las de perro (p. 243).',
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Sedación o anestesia',
        intro: 'La inspección y la limpieza de una herida casi siempre necesitan sedación o anestesia (p. 183). El tejido infectado es ácido y el anestésico local funciona mal dentro de él: el bloqueo va alrededor, en tejido sano.',
        blocks: [
          {
            type: 'drugs',
            items: [
              drug('Gatos (IM)', 'Dexmedetomidina', '0,005–0,01 mg/kg', 'IM', 'En protocolo combinado con ketamina o alfaxalona y un opioide. Solo en pacientes estables.'),
              drug('Gatos (IM)', 'Ketamina', '3–5 mg/kg', 'IM', 'Con dexmedetomidina y metadona o butorfanol.'),
              drug('Gatos (IM)', 'Alfaxalona', '2–3 mg/kg', 'IM', 'Alternativa a la ketamina.'),
              ...pick('metadona', 'propofol', 'isoflurano'),
              drug('Local', 'Lidocaína', '2 mg/kg (máximo)', 'Infiltración en anillo, en tejido sano', 'En gatos, máximo 1 mg/kg.'),
              ...pick('meloxicam', 'buprenorfina'),
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
            id: 'absceso',
            title: 'A. Absceso',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Rasura amplio.', body: 'Un área amplia alrededor de la tumefacción o del trayecto. Protege la herida del pelo con gel hidrosoluble estéril o compresas húmedas, y corta el pelo del borde con tijeras mojadas en aceite mineral.', cite: 'Fossum p. 184, 244' },
                  { title: 'Antisepsia de la piel.', body: 'Clorhexidina o povidona yodada en jabón solo sobre la piel intacta: los detergentes irritan y dañan el tejido expuesto. Alcohol nunca sobre la herida.', cite: 'Fossum p. 184' },
                  { title: 'Abre.', body: 'Con técnica aséptica, lancetea el absceso o agranda el orificio del trayecto, en la parte declive y con largo suficiente para que drene.', cite: 'Fossum p. 244' },
                  { title: 'Cultiva.', body: 'Muestra del pus y del fondo de la cavidad para cultivo aerobio y anaerobio, antes del antibiótico.', cite: 'Fossum p. 244' },
                  { title: 'Explora.', body: 'Con el dedo enguantado o una pinza, rompe los tabiques, mide la extensión del despegamiento y busca cuerpos extraños.', cite: 'Fossum p. 185, 244' },
                  { title: 'Lava a fondo.', body: '500–1000 mL de salino o Ringer lactato tibio. Para 7–8 psi, bolsa de 1 L en manguito a 300 mm Hg con alargadera y aguja 18 G; la jeringa de 35–60 mL con aguja 18 G da presiones más altas y variables (unos 18 psi).', cite: 'Fossum p. 184–185' },
                  { title: 'Desbrida por capas.', body: 'De la superficie a la profundidad, con tijera, bisturí o electrocirugía, hasta tejido fresco. Extirpa la grasa contaminada (se desvasculariza y guarda bacterias) pero respeta los vasos cutáneos que irrigan la piel.', cite: 'Fossum p. 185' },
                  { title: 'Sin desbridar de más.', body: 'Evita el desbridamiento extenso del subcutáneo, sobre todo en gatos: retrasa la cicatrización y aumenta la infección. El músculo se desbrida hasta que sangre y se contraiga.', cite: 'Fossum p. 185' },
                  { title: 'Drena o deja abierto.', body: 'Coloca un drenaje o deja la herida abierta para que drene, y venda.', cite: 'Fossum p. 244' },
                ],
              },
              {
                type: 'table',
                columns: ['Solución', 'Uso (tabla 15.1)'],
                rows: [
                  ['Salino 0,9 % o Ringer lactato', 'De elección; isotónicos y poco citotóxicos'],
                  ['Agua del grifo', 'Eficaz y barata; algo de daño hipotónico'],
                  ['Clorhexidina 0,05 %', '1 parte en 40 (unos 25 mL de solución madre por litro); amplio espectro, actividad residual; precipita en soluciones con electrolitos'],
                  ['Povidona yodada 0,1 %', '1 parte en 100; se inactiva con materia orgánica; citotóxica por encima del 1 %'],
                  ['Tris-EDTA', 'Añadido al lavado, lisa Pseudomonas, E. coli y Proteus y potencia a la clorhexidina'],
                  ['Agua oxigenada, solución de Dakin', 'No usar: dañan el tejido'],
                ],
                caption: 'Fossum p. 184, 189. Ningún líquido ha demostrado prevenir mejor la infección; los antisépticos sirven poco en una infección ya establecida.',
              },
              { type: 'note', kind: 'error', title: 'Errores frecuentes', bullets: ['Incisión pequeña que se cierra en 24 h y el absceso vuelve.', 'Suturar la herida del absceso.', 'Dar solo antibiótico sin drenar: el coágulo y el tejido muerto impiden que llegue.', 'Frotar la herida con gasa en lugar de lavarla.', 'No buscar el cuerpo extraño: el trayecto drena una y otra vez.'] },
            ],
          },
          {
            id: 'mordedura',
            title: 'B. Herida por mordedura reciente',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Prepara.', body: 'Rasura y frota un área amplia alrededor de cada herida.', cite: 'Fossum p. 244' },
                  { title: 'Lava.', body: 'Lavado abundante y limpieza de cada herida como en el absceso.', cite: 'Fossum p. 244' },
                  { title: 'Explora cada punción.', body: 'Toda punción o laceración de espesor completo; agranda la herida si hace falta para ver la extensión y desbridar.', cite: 'Fossum p. 185, 244' },
                  { title: 'Cavidades.', body: 'Si la mordida penetró el tórax o el abdomen, explora la cavidad para tratar la lesión visceral.', cite: 'Fossum p. 244' },
                  { title: 'Espacio muerto.', body: 'Drenaje pasivo o, mejor, activo cuando el espacio muerto es grande.', cite: 'Fossum p. 191, 193' },
                  { title: 'Vendaje hidrofílico 3–5 días.', body: 'Optimiza el drenaje y el desbridamiento autolítico; minimiza las complicaciones.', cite: 'Fossum p. 244' },
                  { title: 'Decide el cierre.', body: 'A los 3–5 días, la mayoría de las heridas agudas está lista para cierre primario diferido, con o sin drenaje. Las crónicas siguen vendadas más tiempo y se cierran tras el tejido de granulación o curan por segunda intención.', cite: 'Fossum p. 244' },
                ],
              },
              {
                type: 'table',
                columns: ['Cierre', 'Cuándo (p. 193)'],
                rows: [
                  ['Primario', '< 6–8 h, contaminación y daño mínimos, buena hemostasia, sin tensión ni espacio muerto. Nunca con saliva, heces, pus o tierra'],
                  ['Primario diferido', 'A los 1–3 días, o tras 3–5 días de vendaje y desbridamiento, sin infección y antes del tejido de granulación'],
                  ['Secundario', 'Tras formarse el tejido de granulación: se resecan los bordes y se aproxima la piel sobre él'],
                  ['Segunda intención', 'Contracción y epitelización; barata y con piel normal si la contracción es completa'],
                ],
                caption: 'Fossum p. 193–194. Si hay dudas sobre cerrar, mejor dejar abierta.',
              },
            ],
          },
          {
            id: 'drenajes',
            title: 'C. Drenajes',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Activo mejor que pasivo.', body: 'Los drenajes de aspiración cerrada son preferibles al Penrose: drenan mejor y se infectan menos.', cite: 'Fossum p. 191' },
                  { title: 'Penrose.', body: 'Fijado a la piel en el extremo dorsal de la herida (a la vista o con un punto a ciegas), sale por una incisión aparte, al menos a 1 cm de la principal, en la zona más declive (fig. 15.6).', cite: 'Fossum p. 191' },
                  { title: 'Espacios pequeños.', body: 'Drenaje de aspiración casero: mariposa sin adaptador, con el tubo fenestrado dentro de la herida y la aguja en un tubo de vacío de 5–10 mL o en una jeringa (fig. 15.7).', cite: 'Fossum p. 191' },
                  { title: 'Reglas.', body: 'El menor diámetro y número posible; nunca saliendo por la incisión ni justo debajo de ella; ninguna parte en contacto con piel con pelo; bien fijado para que no salga ni se retraiga.', cite: 'Fossum p. 192' },
                  { title: 'Siempre bajo vendaje.', body: 'Cambiado antes de que se empape de lado a lado; collar isabelino.', cite: 'Fossum p. 192' },
                  { title: 'Activos.', body: 'Vacía el reservorio cuando pierde vacío o llega a la mitad; mide y anota el volumen.', cite: 'Fossum p. 192' },
                ],
              },
              { type: 'note', kind: 'book', title: 'El drenaje es un cuerpo extraño', text: 'Produce secreción mientras esté puesto y sirve de vía retrógrada para la contaminación de la piel. Retíralo cuando la secreción sea serosanguinolenta y haya bajado a un cuarto o menos; la mayoría sale a los 2–5 días (p. 192).' },
            ],
          },
        ],
      },
      {
        id: 'antibiotico',
        title: 'Antibiótico',
        blocks: [
          {
            type: 'table',
            columns: ['Situación', 'Antibiótico'],
            rows: [
              ['Inicio, hasta el cultivo', 'Penicilinas o cefalosporinas: buen espectro y llegan rápido a la herida por vía IV'],
              ['Gatos difíciles de medicar', 'Cefovecina 8 mg/kg SC, repetida cada 14 días si hace falta'],
              ['Gramnegativos en el cultivo', 'Considerar fluoroquinolona'],
              ['Sospecha de anaerobios', 'Metronidazol o clindamicina'],
              ['Riesgo de bacteriemia o infección diseminada', 'Sistémico de amplio espectro mientras llega el antibiograma'],
            ],
            caption: 'Fossum p. 186, 244. Flora: Pasteurella multocida, estafilococos, enterococos, Bacillus y E. coli; anaerobios como Clostridium y Corynebacterium (recuadro 15.11). Con la infección ya establecida, el antibiótico no evita la supuración si no se desbrida.',
          },
          { type: 'note', kind: 'tip', title: 'Tópicos', text: 'Mejor soluciones que pomadas; los polvos actúan como cuerpo extraño y no deben usarse. La pomada triple antibiótica sirve para heridas superficiales poco infectadas, pero no cubre Pseudomonas (p. 186).' },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Vendaje.', body: 'Los vendajes adherentes se cambian a diario; con mucho exudado o infección, 2–3 veces al día. Con drenaje pasivo, 1–2 veces al día; sin drenaje y con poca secreción, cada 3–4 días.', cite: 'Fossum p. 194' },
              { title: 'Vigila.', body: 'Infección, tensión, colecciones, dehiscencia y necrosis; la ecografía ayuda a detectar líquido.', cite: 'Fossum p. 194' },
              { title: 'Infección.', body: 'Fiebre, leucocitosis, anorexia o decaimiento más marcados de lo esperable: cultivo y citología; si una herida suturada se infecta, retira los puntos.', cite: 'Fossum p. 194' },
              { title: 'Drenaje.', body: 'Retiro a los 2–5 días, con secreción serosanguinolenta y escasa; venda después para absorber lo que quede.', cite: 'Fossum p. 192' },
              { title: 'Entorno.', body: 'Limpio y seco, ejercicio limitado, collar isabelino, buena nutrición y analgesia.', cite: 'Fossum p. 192, 194' },
              { title: 'Prevención.', body: 'Castrar a los gatos machos enteros reduce las peleas; control de salidas.' },
            ],
          },
        ],
      },
    ],
    closure: [
      { layer: 'Herida del absceso', suture: 'Ninguna', gauge: '—', pattern: 'Abierta o con drenaje, bajo vendaje', why: 'Cerrar una cavidad contaminada atrapa el pus; si hay dudas, se deja abierta.' },
      { layer: 'Drenaje de Penrose', suture: 'Nylon', gauge: '3-0', pattern: 'Punto en el extremo dorsal; salida separada ≥ 1 cm de la incisión', why: 'Drena por gravedad sin abrir la incisión principal.' },
      { layer: 'Subcutáneo (cierre diferido)', suture: 'PDS, Maxon, Monocryl o glicómero 631', gauge: '3-0 o 4-0', pattern: 'Puntos sepultados o continuo', why: 'Cierra el espacio muerto.' },
      { layer: 'Piel (cierre diferido)', suture: 'Nylon, polipropileno o polibutéster', gauge: '3-0 o 4-0', pattern: 'Puntos de aproximación, o intradérmico absorbible', why: 'Sin tensión; puntos de avance si hace falta.' },
    ],
    complications: [
      { name: 'Recidiva del absceso', prevent: 'Apertura amplia y declive, romper tabiques, buscar cuerpos extraños, drenaje.', manage: 'Nueva exploración, ecografía y cultivo.' },
      { name: 'Infección ascendente por el drenaje', prevent: 'Drenaje activo, vendaje siempre, retiro a tiempo.', manage: 'Retirar el drenaje y cultivar.' },
      { name: 'Dehiscencia', prevent: 'No cerrar con contaminación, tejido necrótico, tensión o espacio muerto.', manage: 'Herida abierta, vendaje y cierre secundario.' },
      { name: 'Lesión visceral no detectada', prevent: 'Explorar el tórax o el abdomen si la mordida los penetró.', manage: 'Toracotomía o celiotomía.' },
      { name: 'Infección atípica', prevent: 'Cultivo de todas las heridas.', manage: 'Micobacterias o esporotricosis: tratamiento según el agente.' },
      { name: 'VIF o ViLeF (gatos)', prevent: 'Castración, vacunación contra ViLeF, control de salidas.', manage: 'Test a los 60 días de la mordedura.' },
    ],
    quiz: [
      { q: '¿Por qué una mordedura es peor de lo que parece?', a: 'La piel se mueve libremente y la mordida (150–450 psi) aplasta, desgarra y despega el tejido por debajo de una punción pequeña.' },
      { q: '¿Cómo tratas un absceso según el Fossum?', a: 'Rasurado y preparación amplia, apertura aséptica, cultivo, lavado a fondo, desbridamiento del tejido necrótico, drenaje o herida abierta y vendaje.' },
      { q: '¿Cómo logras 7–8 psi de presión de lavado?', a: 'Con una bolsa de 1 L en un manguito a 300 mm Hg, alargadera y aguja 18 G.' },
      { q: '¿Qué soluciones no se usan para lavar una herida?', a: 'Agua oxigenada y solución de Dakin.' },
      { q: '¿Cuándo cierras una herida por mordedura?', a: 'Tras 3–5 días de vendaje hidrofílico, con cierre primario diferido si está limpia; nunca en forma primaria sin explorar y desbridar.' },
      { q: '¿Cuándo retiras un drenaje?', a: 'Cuando la secreción es serosanguinolenta y bajó a un cuarto o menos; en general a los 2–5 días.' },
    ],
    videos: [
      { title: 'Facial abscess in a cat: when to drain, lance or use antibiotics', url: 'https://www.youtube.com/watch?v=tO9pMyzkI3Q', channel: 'Krista Magnifico, DVM', lang: 'inglés' },
      { title: 'Drain placement in a cat with a non healing abscess', url: 'https://www.youtube.com/watch?v=5NTtsvxEizQ', channel: 'Krista Magnifico, DVM', lang: 'inglés', note: 'Drenaje de Penrose' },
    ],
    sources: [
      SOURCES.fossum(15, 'manejo de heridas abiertas, lavado, desbridamiento, drenajes y cierre (pp. 183–194); mordeduras y abscesos (pp. 243–244)'),
      SOURCES.plumbs,
    ],
  },
};
