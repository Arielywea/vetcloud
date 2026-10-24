// Limpieza y extracción de abscesos (id 20). Full depth: the bite abscess, cat and dog.
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 20,
  legacy: {
    indicaciones: 'Absceso subcutáneo (por mordedura, sobre todo en gatos enteros), absceso por cuerpo extraño (espiguillas), heridas infectadas con tejido necrótico, celulitis con colección. Abscesos que no drenan solos o recidivan.',
    tecnica_quirurgica: 'Sedación o anestesia general. Rasurado amplio. Punción para confirmar y tomar muestra para cultivo. Incisión en la parte más declive y fluctuante, amplia para drenar. Vaciado del pus, exploración digital o con pinza para romper tabiques y buscar cuerpos extraños, desbridamiento del tejido necrótico. Lavado abundante con solución salina tibia a presión moderada (jeringa de 35–60 mL con aguja 18 G). Dejar abierto para cicatrización por segunda intención, o colocar drenaje de Penrose si la cavidad es grande. Antibiótico según la gravedad y el cultivo.',
    material_quirurgico: 'Máquina de rasurar, hoja 15, tijeras de Metzenbaum, pinzas hemostáticas curvas, cucharilla, jeringa de 35–60 mL y aguja 18 G, solución salina tibia (litros), drenaje de Penrose, gasas, hisopos estériles y tubos de cultivo.',
    tipo_sutura: 'Habitualmente no se sutura (segunda intención). Si se coloca Penrose: nylon 3-0 para fijarlo en el extremo dorsal. Si se hace extirpación completa de la cápsula y se cierra: Monocryl 3-0 subcutáneo, nylon 3-0 piel, con drenaje.',
    complicaciones_frecuentes: 'Recidiva por drenaje insuficiente o cuerpo extraño no retirado; celulitis; septicemia en pacientes debilitados; en gatos, transmisión de VIF y ViLeF por la mordedura; fístulas crónicas por cuerpos extraños vegetales.',
    manejo_anestesico_sugerido: 'Gatos: protocolo IM (dexmedetomidina + ketamina o alfaxalona + butorfanol o metadona). Perros: sedación profunda o anestesia general. Bloqueo local alrededor (no dentro del tejido infectado, donde el anestésico local funciona mal). AINE si está hidratado y normotenso.',
    consideraciones_por_raza: 'Gatos machos enteros con acceso al exterior: abscesos por mordedura en cola, cara y miembros. Perros de caza y de campo: espiguillas en espacios interdigitales, oído y axila.',
    consideraciones_comorbilidades: 'Gatos: test de VIF y ViLeF (repetir a los 2 meses). Abscesos recurrentes: buscar cuerpo extraño, inmunosupresión, micobacterias o nocardia (cultivo especial).',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 15 (manejo de heridas); Pavletic MM, Atlas of Small Animal Wound Management and Reconstructive Surgery, 4.ª ed.; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Apertura, vaciado, desbridamiento y lavado de un absceso, casi siempre por mordedura en gatos o por cuerpo extraño en perros. Lo que cura es el drenaje, no el antibiótico: una incisión amplia y en declive, un buen lavado y dejar que la herida cierre desde el fondo.',
    meta: { species: ['perro', 'gato'], duration: '15–45 min', difficulty: 'básica', contamination: 'sucia' },
    before_you_start: [
      'Rasura un área amplia alrededor: el absceso suele ser más grande de lo que parece y la piel puede estar necrótica.',
      'Toma la muestra para cultivo por punción antes de abrir, cuando el absceso es recurrente o el paciente está grave.',
      'Incide en la parte más declive, de largo suficiente para que drene sola: una incisión pequeña se cierra antes que la cavidad.',
      'Rompe los tabiques y busca cuerpos extraños (espiguillas, dientes, astillas) con el dedo o una pinza.',
      'No suturas la herida de un absceso: se deja abierta o con drenaje.',
    ],
    indications: [
      'Absceso subcutáneo fluctuante por mordedura.',
      'Absceso o fístula por cuerpo extraño vegetal.',
      'Herida infectada con tejido necrótico o colección.',
      'Absceso que no drena solo, recidiva o se extiende (celulitis).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Evaluación',
        blocks: [
          { type: 'steps', items: [
            { title: 'Examen.', body: 'Temperatura (fiebre frecuente antes de que se rompa), extensión de la inflamación, dolor, otras heridas. En gatos, revisa la base de la cola, la cara, el cuello y los miembros.' },
            { title: 'Estado general.', body: 'Decaimiento marcado, deshidratación o signos de sepsis: hemograma, glucosa, fluidos y antibiótico IV antes del procedimiento.' },
            { title: 'Ecografía.', body: 'Útil si no fluctúa, si sospechas cuerpo extraño (espiguilla visible como estructura hiperecogénica fusiforme) o en abscesos profundos.' },
            { title: 'En gatos.', body: 'Test de VIF y ViLeF; repetir a los 60 días.' },
          ] },
          { type: 'note', kind: 'why', title: '¿Celulitis o absceso?', text: 'Si no hay colección (sin fluctuación, sin pus a la punción), es celulitis: antibiótico y compresas tibias 24–48 h, y se reevalúa. Abrir una celulitis no drena nada.' },
        ],
      },
      {
        id: 'anestesia',
        title: 'Sedación o anestesia',
        intro: 'El tejido infectado es ácido y el anestésico local funciona mal dentro de él: el bloqueo se hace alrededor, en tejido sano.',
        blocks: [{ type: 'drugs', items: [
          drug('Gatos (IM)', 'Dexmedetomidina', '0,005–0,01 mg/kg', 'IM', 'En protocolo combinado con ketamina o alfaxalona y un opioide.'),
          drug('Gatos (IM)', 'Ketamina', '3–5 mg/kg', 'IM', 'Con dexmedetomidina y metadona o butorfanol.'),
          drug('Gatos (IM)', 'Alfaxalona', '2–3 mg/kg', 'IM', 'Alternativa a la ketamina.'),
          ...pick('metadona', 'propofol', 'isoflurano'),
          drug('Local', 'Lidocaína', '2 mg/kg (máximo)', 'Infiltración en anillo alrededor, en tejido sano', 'En gatos, máximo 1 mg/kg.'),
          ...pick('meloxicam', 'buprenorfina'),
        ] }],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [
          { type: 'steps', items: [
            { title: 'Rasura y limpia.', body: 'Área amplia; antisepsia de la piel con clorhexidina diluida al 0,05 % o povidona yodada al 1 %.' },
            { title: 'Muestra.', body: 'Punción con aguja y jeringa para cultivo y antibiograma (o hisopo del fondo de la cavidad tras abrir).' },
            { title: 'Incide.', body: 'En la zona más fluctuante y declive, de 1–3 cm según el tamaño, con hoja 15. Si la piel está necrótica, extirpa el tejido negro o gris.' },
            { title: 'Vacía.', body: 'Presiona suavemente para sacar el pus.' },
            { title: 'Explora.', body: 'Con el dedo enguantado o una pinza curva, rompe los tabiques y recorre toda la cavidad buscando cuerpos extraños.' },
            { title: 'Desbrida.', body: 'Con tijera o cucharilla, retira el tejido necrótico y la membrana de fibrina hasta ver tejido rosado que sangra.' },
            { title: 'Lava a presión.', body: 'Solución salina tibia con jeringa de 35–60 mL y aguja 18 G (unos 8 psi). Volumen generoso: hasta que el líquido salga limpio. Clorhexidina al 0,05 % o povidona al 0,1 % solo en el primer lavado si la contaminación es intensa.' },
            { title: 'Drena.', body: 'Cavidades pequeñas: abiertas, con la incisión amplia. Cavidades grandes: drenaje de Penrose que entra por arriba y sale por la parte más declive, fijado con nylon 3-0, nunca saliendo por la incisión principal.' },
            { title: 'Termina.', body: 'Sin sutura de la herida. Crema o gel cicatrizante opcional; vendaje si la zona lo permite.' },
          ] },
          { type: 'note', kind: 'error', title: 'Errores frecuentes', bullets: ['Incisión pequeña que se cierra en 24 h y el absceso vuelve.', 'Suturar la herida de un absceso.', 'Dar solo antibiótico sin drenar.', 'No buscar la espiguilla: fístula que drena una y otra vez.'] },
        ],
      },
      {
        id: 'antibiotico',
        title: 'Antibiótico',
        blocks: [
          { type: 'table', columns: ['Situación', 'Antibiótico', 'Duración'], rows: [
            ['Absceso drenado, paciente estable, sin celulitis', 'A veces no hace falta tras un drenaje completo; si se usa, amoxicilina con ácido clavulánico 12,5–20 mg/kg VO cada 12 h', '5–7 días'],
            ['Celulitis, fiebre o absceso extenso', 'Amoxicilina con ácido clavulánico; en gatos que no aceptan pastillas, cefovecina 8 mg/kg SC (dura 14 días)', '7–10 días o según evolución'],
            ['Sepsis o paciente grave', 'IV de amplio espectro (ampicilina más enrofloxacino, o según el protocolo de la clínica) hasta el cultivo', 'Según cultivo'],
            ['Recidiva o fístula', 'Según cultivo; considerar micobacterias o nocardia', 'Prolongado'],
          ], caption: 'Las mordeduras de gato llevan Pasteurella multocida y anaerobios, casi siempre sensibles a la amoxicilina con clavulánico.' },
        ],
      },
      {
        id: 'postop',
        title: 'Cuidados en casa',
        blocks: [{ type: 'steps', items: [
          { title: 'Limpieza.', body: 'Lavar la herida con solución salina 1–2 veces al día y retirar costras para que siga drenando.' },
          { title: 'Compresas tibias.', body: '5–10 minutos, 2–3 veces al día, los primeros 3 días.' },
          { title: 'Collar isabelino.', body: 'Hasta que cierre.' },
          { title: 'Drenaje.', body: 'Retirar a los 3–5 días, cuando la secreción sea escasa y serosa.' },
          { title: 'Control.', body: 'A los 3–5 días. La herida cierra por segunda intención en 1–2 semanas.' },
          { title: 'Prevención.', body: 'Castración de gatos machos enteros (reduce peleas) y control de salidas.' },
        ] }],
      },
    ],
    closure: [
      { layer: 'Herida del absceso', suture: 'Ninguna', gauge: '—', pattern: 'Segunda intención', why: 'Cerrar una cavidad infectada atrapa el pus y recidiva.' },
      { layer: 'Drenaje de Penrose', suture: 'Nylon', gauge: '3-0', pattern: 'Un punto en el extremo dorsal (y ventral si hace falta)', why: 'Se retira a los 3–5 días; nunca por la incisión principal.' },
    ],
    complications: [
      { name: 'Recidiva', prevent: 'Incisión amplia y declive, romper tabiques, buscar cuerpos extraños, lavados en casa.', manage: 'Nueva exploración, ecografía, cultivo.' },
      { name: 'Celulitis o sepsis', prevent: 'Drenaje temprano, antibiótico en casos extensos.', manage: 'Antibiótico IV, fluidos, desbridamiento.' },
      { name: 'Fístula crónica', prevent: 'Extraer la espiguilla u otro cuerpo extraño.', manage: 'Exploración del trayecto (a veces con fistulografía o ecografía) y extracción.' },
      { name: 'VIF o ViLeF (gatos)', prevent: 'Castración, vacunación contra ViLeF, control de salidas.', manage: 'Test a los 60 días de la mordedura.' },
    ],
    quiz: [
      { q: '¿Dónde y cómo incides un absceso?', a: 'En la zona más fluctuante y declive, con una incisión amplia para que drene sola.' },
      { q: '¿Por qué no se infiltra anestesia local dentro del absceso?', a: 'Porque el tejido infectado es ácido y el anestésico funciona mal; se infiltra en anillo en tejido sano.' },
      { q: '¿Qué diferencia una celulitis de un absceso en el manejo?', a: 'La celulitis no tiene colección: se trata con antibiótico y compresas y se reevalúa; abrirla no drena nada.' },
      { q: '¿Qué bacteria esperas en una mordedura de gato y qué antibiótico usas?', a: 'Pasteurella multocida y anaerobios; amoxicilina con ácido clavulánico.' },
      { q: '¿Qué estudio indicas en un gato con absceso por mordedura?', a: 'Test de VIF y ViLeF, repetido a los 60 días.' },
    ],
    videos: [
      { title: 'Facial abscess in a cat: when to drain, lance or use antibiotics', url: 'https://www.youtube.com/watch?v=tO9pMyzkI3Q', channel: 'Krista Magnifico, DVM', lang: 'inglés' },
      { title: 'Drain placement in a cat with a non healing abscess', url: 'https://www.youtube.com/watch?v=5NTtsvxEizQ', channel: 'Krista Magnifico, DVM', lang: 'inglés', note: 'Drenaje de Penrose' },
    ],
    sources: [
      SOURCES.fossum(15, 'manejo de heridas'),
      { text: 'Pavletic MM. Atlas of Small Animal Wound Management and Reconstructive Surgery, 4.ª ed. Wiley-Blackwell, 2018.', kind: 'libro' },
      { text: 'Lappin MR y col. Guías ISCAID para el uso de antimicrobianos (infecciones de piel y tejidos blandos), 2017.', kind: 'complemento' },
      SOURCES.plumbs,
    ],
  },
};
