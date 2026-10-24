// Toracostomía con tubo y lavado pleural (id 19). Medium depth: placement, drainage and lavage.
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 19,
  legacy: {
    indicaciones: 'Piotórax (lavado pleural); neumotórax recurrente o que requiere toracocentesis repetidas; quilotórax o hemotórax en manejo; después de una toracotomía. El lavado pleural se indica sobre todo en piotórax.',
    tecnica_quirurgica: 'Tubo de toracostomía (perros 14–28 Fr, gatos 10–16 Fr según tamaño) o tubo de calibre pequeño colocado con guía (técnica de Seldinger). Incisión de piel dorsal en el 10.º espacio intercostal, túnel subcutáneo craneoventral de 2–3 espacios, entrada al tórax en el 7.º u 8.º espacio por el borde craneal de la costilla, tubo dirigido hacia craneoventral. Fijación con sutura en "trampa china" y vendaje. Lavado: 10–20 mL/kg de solución salina tibia estéril, se deja 1 hora y se aspira, 2–4 veces al día.',
    material_quirurgico: 'Tubo de toracostomía con trocar o tubo de calibre pequeño con guía, hoja de bisturí, pinza Carmalt larga, llave de tres vías y tapón o sistema de aspiración continua (válvula de Heimlich solo en perros grandes), jeringa de 60 mL, solución salina tibia, vendaje.',
    tipo_sutura: 'Fijación del tubo: nylon 0 o 2-0 en "trampa china" (finger-trap), más punto en bolsa de tabaco alrededor de la entrada en la piel.',
    complicaciones_frecuentes: 'Neumotórax iatrogénico por desconexión o fuga; infección ascendente; mala posición del tubo (subcutáneo o en el abdomen); obstrucción por fibrina; dolor; laceración pulmonar o vascular al colocarlo.',
    manejo_anestesico_sugerido: 'Paciente con dificultad respiratoria: estabilizar con toracocentesis y oxígeno primero. Anestesia general corta con intubación inmediata y ventilación (propofol o alfaxalona titulados tras metadona), o sedación profunda con bloqueo intercostal en pacientes muy inestables para tubos pequeños. Bloqueo intercostal con bupivacaína y bupivacaína intrapleural por el tubo para el dolor.',
    consideraciones_por_raza: 'Gatos: piotórax frecuente (heridas por mordedura). Perros de caza y de campo: piotórax por migración de cuerpos extraños vegetales (espiguillas). Galgos y Lebreles: quilotórax.',
    consideraciones_comorbilidades: 'Piotórax: cultivo del líquido y antibiótico de amplio espectro hasta el antibiograma; si hay cuerpo extraño, abscesos pulmonares o mala respuesta en 3–5 días, toracotomía.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 31; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Colocación de un tubo en el espacio pleural para drenar aire, pus o líquido, y lavar la pleura en el piotórax. Es una maniobra de urgencia frecuente: el paciente llega sin aire, así que primero se estabiliza y después se coloca el tubo con calma.',
    meta: { species: ['perro', 'gato'], duration: '15–30 min (colocación)', difficulty: 'intermedia', contamination: 'limpia' },
    before_you_start: [
      'Estabiliza primero: oxígeno y toracocentesis para sacar aire o líquido antes de anestesiar.',
      'El tubo entra por el borde craneal de la costilla: el paquete vasculonervioso intercostal corre por el borde caudal.',
      'Haz un túnel subcutáneo de 2–3 espacios intercostales para que el aire no entre alrededor del tubo.',
      'Toda conexión debe ir asegurada (llave de tres vías y tapón, con abrazaderas): una desconexión produce neumotórax en segundos.',
      'Confirma la posición con radiografía en dos proyecciones.',
    ],
    indications: [
      'Piotórax (drenaje y lavado pleural).',
      'Neumotórax que se reproduce o requiere más de 2–3 toracocentesis en 24 h.',
      'Hemotórax o quilotórax en manejo.',
      'Después de una toracotomía.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Estabilización y anestesia',
        blocks: [
          { type: 'steps', items: [
            { title: 'Oxígeno.', body: 'Flow-by o caja de oxígeno; manipulación mínima.' },
            { title: 'Toracocentesis.', body: 'Aguja o catéter 19–22 G en el 7.º–9.º espacio intercostal: dorsal para aire, ventral para líquido. Saca lo máximo.' },
            { title: 'Líquido.', body: 'Citología, cultivo y triglicéridos. Pus con bacterias: piotórax.' },
            { title: 'Elige el tubo.', body: 'Tubo de calibre pequeño con guía (14 G en gatos y perros pequeños) para aire y líquido poco espeso; tubo de mayor calibre para pus espeso.' },
          ] },
          { type: 'drugs', items: [...pick('metadona', 'midazolam', 'propofol', 'alfaxalona', 'isoflurano'), drug('Local', 'Bupivacaína intercostal', '1 mg/kg (máximo)', 'Bloqueo de 2–3 espacios intercostales', 'Por caudal de cada costilla. En gatos, máximo 1 mg/kg en total.'), drug('Postoperatorio', 'Bupivacaína intrapleural', '1–1,5 mg/kg', 'Por el tubo, diluida en salino, cada 6–8 h', 'Gatos: máximo 1 mg/kg. Puede doler al instilar.'), ...pick('metadonaPost', 'buprenorfina')] },
        ],
      },
      {
        id: 'tecnica',
        title: 'Colocación del tubo',
        blocks: [
          { type: 'steps', items: [
            { title: 'Posición.', body: 'Decúbito lateral; rasura y prepara un área amplia del tórax lateral.' },
            { title: 'Mueve la piel.', body: 'Un ayudante desplaza la piel hacia craneal unos 2–3 espacios intercostales.' },
            { title: 'Incisión.', body: 'Pequeña incisión en la piel desplazada a la altura del 10.º espacio, en el tercio dorsal.' },
            { title: 'Túnel.', body: 'Con una pinza Carmalt, haz un túnel subcutáneo hacia craneoventral hasta el 7.º u 8.º espacio.' },
            { title: 'Entra al tórax.', body: 'Por el borde craneal de la costilla, con el trocar controlado (sujétalo cerca de la punta para que no penetre de más) o abriendo con la pinza y guiando el tubo.' },
            { title: 'Dirige el tubo.', body: 'Hacia craneoventral, hasta el nivel de la 2.ª–3.ª costilla. Retira el trocar y pinza el tubo.' },
            { title: 'Suelta la piel.', body: 'Al soltarla, el túnel queda sellado por la piel.' },
            { title: 'Fija.', body: 'Bolsa de tabaco alrededor de la entrada y sutura en "trampa china" al tubo con nylon 0 o 2-0.' },
            { title: 'Conecta y aspira.', body: 'Llave de tres vías con tapón, asegurada con abrazaderas; aspira hasta presión negativa.' },
            { title: 'Radiografía.', body: 'Ventrodorsal y lateral: el tubo dentro del tórax, con todas las fenestraciones dentro.' },
            { title: 'Vendaje.', body: 'Vendaje torácico suave, sin comprimir la respiración.' },
          ] },
        ],
      },
      {
        id: 'lavado',
        title: 'Lavado pleural',
        blocks: [
          { type: 'steps', items: [
            { title: 'Volumen.', body: '10–20 mL/kg de solución salina estéril tibia por tubo (si hay dos tubos, por cada lado).' },
            { title: 'Instila despacio.', body: 'Vigila la respiración; para si el paciente se angustia.' },
            { title: 'Espera.', body: '30–60 minutos, cambiando la posición del paciente.' },
            { title: 'Aspira.', body: 'Recupera al menos el 75 % del volumen; anota lo que entra y lo que sale.' },
            { title: 'Frecuencia.', body: '2–4 veces al día, hasta que el líquido sea claro y la citología muestre menos neutrófilos degenerados y sin bacterias.' },
          ] },
          { type: 'note', kind: 'book', title: 'Heparina en el lavado', text: 'Añadir heparina (10 UI/mL) al lavado reduce la formación de fibrina; en perros con piotórax se asoció a mejor resolución sin cirugía.' },
          { type: 'note', kind: 'error', title: 'Cuándo pasar a toracotomía', bullets: ['No mejora en 3–5 días de drenaje y antibiótico.', 'Cuerpo extraño visible, abscesos pulmonares o masa mediastínica.', 'Líquido encapsulado que el tubo no drena.'] },
        ],
      },
      {
        id: 'postop',
        title: 'Manejo del tubo y retiro',
        blocks: [{ type: 'steps', items: [
          { title: 'Supervisión continua.', body: 'Un paciente con tubo no se deja sin vigilancia ni sin collar isabelino.' },
          { title: 'Aspiración.', body: 'Cada 2–4 h o continua; registra los volúmenes.' },
          { title: 'Retiro.', body: 'Cuando el aire deja de salir 12–24 h, o el líquido baja a 2 mL/kg/día o menos y la citología mejora.' },
          { title: 'Herida.', body: 'Al retirar, la entrada se deja cerrar sola o con un punto; vendaje 24 h.' },
        ] }],
      },
    ],
    closure: [
      { layer: 'Entrada en la piel', suture: 'Nylon', gauge: '2-0', pattern: 'Bolsa de tabaco', why: 'Sella alrededor del tubo.' },
      { layer: 'Fijación del tubo', suture: 'Nylon', gauge: '0 o 2-0', pattern: 'Trampa china', why: 'Impide que el tubo se deslice.' },
    ],
    complications: [
      { name: 'Neumotórax por desconexión', prevent: 'Conexiones aseguradas, collar, vigilancia.', manage: 'Pinzar, reconectar, aspirar.' },
      { name: 'Mala posición', prevent: 'Radiografía de control.', manage: 'Recolocar.' },
      { name: 'Infección ascendente', prevent: 'Manejo estéril del sistema, retiro en cuanto se pueda.', manage: 'Cultivo y antibiótico.' },
      { name: 'Laceración pulmonar o vascular', prevent: 'Trocar controlado, entrar por el borde craneal de la costilla.', manage: 'Según la lesión; toracotomía si hay hemorragia.' },
      { name: 'Obstrucción del tubo', prevent: 'Heparina en el lavado, aspiraciones frecuentes.', manage: 'Lavar o reemplazar el tubo.' },
    ],
    quiz: [
      { q: '¿Por qué el tubo entra por el borde craneal de la costilla?', a: 'Porque la arteria, la vena y el nervio intercostales corren por el borde caudal.' },
      { q: '¿Para qué sirve el túnel subcutáneo?', a: 'Para que al soltar la piel se selle la entrada y no pase aire alrededor del tubo.' },
      { q: '¿Cuándo retiras el tubo?', a: 'Sin aire durante 12–24 h, o con líquido de 2 mL/kg/día o menos y citología que mejora.' },
      { q: '¿Cuándo indica cirugía un piotórax?', a: 'Sin mejoría en 3–5 días, con cuerpo extraño, abscesos pulmonares, masa mediastínica o líquido encapsulado.' },
    ],
    videos: [
      { title: 'Large-Bore Thoracostomy Tube Placement in Small Animals', url: 'https://www.youtube.com/watch?v=j8o4npLj9Cc', channel: 'American Veterinary Medical Association', lang: 'inglés', note: 'Tutorial paso a paso' },
      { title: 'Chest Tube Placement: Seldinger Method', url: 'https://www.youtube.com/watch?v=K-tArydxETg', channel: 'JIP VFU', lang: 'inglés', note: 'Tubo de calibre pequeño con guía' },
    ],
    sources: [
      SOURCES.fossum(31, 'cirugía de la cavidad pleural'),
      { text: 'Boothe HW y col. Tratamiento del piotórax en perros y gatos: médico frente a quirúrgico. JAVMA, 2010.', kind: 'complemento' },
      { text: 'Valtolina C, Adamantos S. Tubos de toracostomía de calibre pequeño colocados con guía. JSAP, 2009.', kind: 'complemento' },
      SOURCES.plumbs,
    ],
  },
};
