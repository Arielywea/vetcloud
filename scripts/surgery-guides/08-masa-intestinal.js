// Resección en masa intestinal (id 8). Rewritten from Fossum 5.ª ed., cap. 18 (pp. 433–449, 455–458).
const { pick, drug, ABDOMINAL_CLOSURE, CELIOTOMY_STEPS, CLEAN_CLOSURE_STEPS, SOURCES } = require('./_common');

module.exports = {
  id: 8,
  legacy: {
    indicaciones: 'Tumores intestinales focales (adenocarcinoma, linfoma nodular, leiomiosarcoma, leiomioma, GIST, mastocitoma, pólipos adenomatosos), con o sin obstrucción, hemorragia crónica o perforación. Con metástasis la resección es paliativa. El linfoma difuso o de células pequeñas felino se trata con quimioterapia.',
    tecnica_quirurgica: 'Celiotomía del xifoides al pubis y exploración completa. Biopsia de linfonodos mesentéricos y de otros órganos antes de abrir el intestino. Resección de la masa con 4–8 cm de intestino macroscópicamente normal a cada lado y su mesenterio, y anastomosis término-terminal; suturar siempre tejido sano con tejido sano. Envío a histopatología para diagnóstico y estadificación. Cambio de guantes, instrumental y sutura para el cierre abdominal. Sonda de enterostomía en debilitados.',
    material_quirurgico: 'Instrumental de laparotomía, pinzas Doyen y Carmalt, compresas, separador de Balfour, aspirador; frascos de formol separados para la masa, los linfonodos y el hígado; segundo juego de instrumental y sutura para cerrar; sonda de enterostomía si hace falta.',
    tipo_sutura: 'Anastomosis: PDS, Monocryl, Maxon o Biosyn 3-0 o 4-0; en hipoalbuminémicos, nylon, polipropileno o polibutester. Biopsia hepática: lazada de 3-0 o 4-0 absorbible. Mesenterio: 4-0.',
    complicaciones_frecuentes: 'Fuga, dehiscencia y peritonitis (más en pacientes debilitados); estenosis o recidiva tumoral con nuevos signos de obstrucción; síndrome de intestino corto si se reseca mucho.',
    manejo_anestesico_sugerido: 'Como enterectomía (p. 435, tabla 18.4 o 19.1 según el estado): corregir líquidos, electrolitos y anemia (transfundir si hematocrito <20 %), antibiótico profiláctico, opioide e infusiones, sin AINE si hay hipotensión.',
    consideraciones_por_raza: 'Perros: linfoma, adenocarcinoma y leiomiosarcoma; más en Bóxer, Collie y Pastor alemán. Gatos: linfoma, adenocarcinoma (Siamés) y mastocitoma. Edad media: carcinomas 9 años en perros y 10 en gatos; leiomiosarcoma 11 años.',
    consideraciones_comorbilidades: 'Anemia por pérdida de sangre o ferropénica, hipoalbuminemia, hipoglucemia. Masas eosinofílicas idiopáticas del tubo digestivo en perros: tratamiento antihelmíntico y corticoides, no solo cirugía.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 18, pp. 433–449 y 455–458.',
  },
  guide: {
    draft: true,
    lede: 'Enterectomía con criterio oncológico. La resección es el tratamiento de elección de los tumores intestinales focales: se extirpa la masa con 4–8 cm de intestino sano a cada lado y su mesenterio, se toman muestras para estadificar y se une tejido sano con tejido sano. Suturar intestino con tumor hace probable la dehiscencia.',
    meta: { species: ['perro', 'gato'], duration: '75–120 min', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Estadifica antes: radiografía de tórax o TC y ecografía abdominal; la citología ecoguiada coincide con la histopatología solo en la mitad de los casos.',
      'En gatos, descarta un linfoma difuso o de células pequeñas: responde a quimioterapia y no se opera salvo obstrucción o perforación.',
      'Biopsia los linfonodos mesentéricos y el hígado antes de abrir el intestino.',
      'Márgenes de 4–8 cm de intestino macroscópicamente normal a cada lado, con su mesenterio; une siempre tejido sano con tejido sano.',
      'Cambia guantes, instrumental y sutura antes de cerrar; envía todo identificado para diagnóstico y estadificación.',
    ],
    indications: [
      'Masa intestinal focal con o sin obstrucción: adenocarcinoma, linfoma nodular, leiomiosarcoma, leiomioma, GIST, mastocitoma (p. 455–456).',
      'Pólipos adenomatosos (duodeno felino, recto canino).',
      'Hemorragia digestiva crónica, melena o anemia ferropénica por un tumor.',
      'Resección paliativa con metástasis si hay obstrucción, perforación o hemorragia.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Diagnóstico y preparación',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Historia y examen.', body: 'Signos vagos al inicio (decaimiento, anorexia) que progresan a diarrea, vómitos y pérdida de peso; melena, anemia, fiebre o derrame. A la palpación, masa firme, asas engrosadas o linfonodos mesentéricos grandes.', cite: 'Fossum p. 456' },
              { title: 'Imágenes.', body: 'Ecografía (engrosamiento con pérdida de capas, masas excéntricas en tumores de músculo liso, linfonodos, metástasis) y radiografía de tórax o TC. El linfoma puede existir con un intestino ecográficamente normal.', cite: 'Fossum p. 457' },
              { title: 'Citología o endoscopia.', body: 'Aspirado ecoguiado o biopsia endoscópica si el tumor afecta la mucosa al alcance del endoscopio.', cite: 'Fossum p. 457' },
              { title: 'Laboratorio.', body: 'Anemia por pérdida o ferropénica, leucocitosis, hipoalbuminemia, hipoglucemia, enzimas hepáticas altas.', cite: 'Fossum p. 457' },
              { title: 'Corrige.', body: 'Líquidos, electrolitos y ácido-base; transfusión si el hematocrito es menor de 20 %.', cite: 'Fossum p. 457' },
              { title: 'Antibiótico.', body: 'Profilaxis según el segmento (cefazolina proximal, cefoxitina o ampicilina-sulbactam distal).', cite: 'Fossum p. 436' },
              { title: 'Nutrición.', body: 'En debilitados o con vómitos o anorexia persistentes, sonda de enterostomía en la misma cirugía.', cite: 'Fossum p. 457' },
              { title: 'Campo.', body: 'Decúbito dorsal; rasura todo el abdomen y el tórax caudal.', cite: 'Fossum p. 457' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Puntos clave (Box 18.44)', bullets: ['La mayoría son malignos: adenocarcinoma, linfoma y leiomiosarcoma.', 'Causan obstrucción intramural o intraluminal.', 'Resección con 4–8 cm de intestino de aspecto normal.', 'El pronóstico depende del tipo de tumor.'] },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        blocks: [
          {
            type: 'drugs',
            items: [
              ...pick('maropitant', 'metadona', 'midazolam'),
              drug('Inducción', 'Propofol', '2–4 mg/kg', 'IV, a efecto', 'En el paciente estable y premedicado (tabla 19.1); en el inestable, ketamina con benzodiazepina o etomidato.'),
              ...pick('alfaxalona', 'isoflurano', 'fentanilo', 'ketamina'),
              drug('Intraoperatorio', 'Lidocaína', '1–2 mg/kg', 'IV, carga', 'Luego infusión 1–3 mg/kg/h en perros (tabla 19.1).'),
              ...pick('cefazolina', 'metadonaPost'),
            ],
          },
        ],
      },
      {
        id: 'patologia',
        title: 'Tumores que vas a encontrar',
        blocks: [
          {
            type: 'defs',
            items: [
              { tag: 'Adenocarcinoma', title: 'Localmente invasivo, de crecimiento lento', text: 'En el perro, más en duodeno y colon; en el gato, en yeyuno distal e íleon. Formas infiltrativa (estenosis anular), ulcerativa y proliferativa. Se extiende a serosa, mesenterio, omento y linfonodos, y metastatiza a pulmón e hígado (p. 456).' },
              { tag: 'Linfoma', title: 'Difuso o nodular', text: 'El difuso infiltra mucosa y submucosa y causa malabsorción; el nodular forma una masa que obstruye, a menudo en la zona ileocecocólica. En gatos hay varias formas; el de células pequeñas responde bien a la quimioterapia.' },
              { tag: 'Leiomiosarcoma', title: 'Músculo liso, perros mayores', text: 'En ciego y yeyuno; invasión local y metástasis lenta a mesenterio, linfonodos, peritoneo e hígado. Supervivencia media de unos 2 años tras resecar una lesión localizada, incluso con metástasis al operar.' },
              { tag: 'Benignos', title: 'Leiomioma y pólipos', text: 'Crecimiento lento; no se espera recidiva tras la resección completa.' },
            ],
          },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          { id: 'abordaje', title: 'A. Abordaje y estadificación quirúrgica', blocks: [{ type: 'steps', items: [...CELIOTOMY_STEPS, { title: 'Biopsias de estadificación.', body: 'Linfonodos mesentéricos (extirpa uno entero si está aumentado) y otros órganos según haga falta, antes de incidir el intestino; hígado con biopsia en guillotina. Frascos de formol separados.', cite: 'Fossum p. 457' }, { title: 'Decide.', body: 'Con metástasis la resección es paliativa; si la masa es irresecable, toma biopsia y cierra.', cite: 'Fossum p. 457' }] }] },
          {
            id: 'reseccion',
            title: 'B. Resección en bloque',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Aísla sin manipular.', body: 'Exterioriza el segmento y rodéalo de compresas tocando la masa lo menos posible.' },
                  { title: 'Márgenes.', body: 'Marca 4–8 cm de intestino macroscópicamente normal a cada lado del borde palpable del tumor.', cite: 'Fossum p. 456–457' },
                  { title: 'Mesenterio en cuña.', body: 'Liga los vasos yeyunales que irrigan el segmento y extirpa la cuña de mesenterio correspondiente, con sus linfáticos.' },
                  { title: 'Vasos en los puntos de corte.', body: 'Ocluye la arcada terminal y los vasos rectos donde vas a cortar.', cite: 'Fossum p. 440' },
                  { title: 'Ordeña y ocluye.', body: 'Dedos del ayudante o pinzas Doyen en el intestino que queda; pinzas en la pieza.' },
                  { title: 'Corta.', body: 'Perpendicular u oblicuo según las luces; recorta la mucosa evertida.', cite: 'Fossum p. 441' },
                  { title: 'Revisa los bordes.', body: 'Los bordes que vas a suturar deben estar sanos: suturar tejido con tumor hace probable la dehiscencia.', cite: 'Fossum p. 457' },
                ],
              },
            ],
          },
          {
            id: 'anastomosis',
            title: 'C. Anastomosis',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Hilo.', body: 'PDS, Monocryl, Maxon o Biosyn 3-0 o 4-0; en hipoalbuminémicos, nylon, polipropileno o polibutester.', cite: 'Fossum p. 457' },
                  { title: 'Puntos.', body: 'Mesentérico primero, antimesentérico después, y simples a 2 mm del borde y 2–3 mm entre sí (ver la guía de enterectomía).', cite: 'Fossum p. 441–443' },
                  { title: 'Técnica cuidadosa.', body: 'Estos pacientes suelen estar debilitados: cuida especialmente cada punto.', cite: 'Fossum p. 457' },
                  { title: 'Prueba de fugas y mesenterio.', body: 'Distiende con salino, refuerza, cierra el mesenterio con 4-0.' },
                  { title: 'Parche seroso.', body: 'Si la integridad es dudosa o la albúmina es baja.', cite: 'Fossum p. 449' },
                  { title: 'Identifica la pieza.', body: 'Marca con hilo los extremos proximal y distal para que el patólogo valore los márgenes.' },
                ],
              },
            ],
          },
          { id: 'cierre', title: 'D. Cierre', blocks: [{ type: 'steps', items: [{ title: 'Guantes, instrumental y sutura nuevos.', body: 'Para el cierre abdominal, sin material que haya tocado el tumor.', cite: 'Fossum p. 457' }, ...CLEAN_CLOSURE_STEPS] }] },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio y pronóstico',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Soporte.', body: 'Líquidos hasta que beba lo suficiente, corrección de electrolitos y ácido-base, analgesia.', cite: 'Fossum p. 457–458' },
              { title: 'Antibiótico terapéutico.', body: 'Solo si hubo peritonitis, contaminación o debilitación grave.', cite: 'Fossum p. 458' },
              { title: 'Nutrición.', body: 'Por la sonda de enterostomía si persisten los vómitos o la anorexia.', cite: 'Fossum p. 458' },
              { title: 'Quimioterapia.', body: 'Su eficacia adyuvante no está probada salvo en el linfoma; la del linfoma de células grandes tiene morbilidad.', cite: 'Fossum p. 458' },
              { title: 'Seguimiento.', body: 'Una segunda laparotomía o laparoscopia permite valorar la progresión y la respuesta, y biopsiar o resecar de nuevo.', cite: 'Fossum p. 458' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Pronóstico (p. 458)', bullets: ['Excelente tras extirpar por completo tumores benignos o pólipos.', 'Bueno para adenocarcinoma o leiomiosarcoma localizados si se resecan por completo: en perros, supervivencia media de 10 meses, 40,5 % al año y 33 % a los 2 años.', 'Gatos con adenocarcinoma pueden vivir más de 2 años.', 'Linfoma nodular solitario: mejor que el difuso; linfoblástico, malo; de células pequeñas, años de supervivencia.', 'Leiomiosarcoma: bueno incluso con metástasis al resecar.', 'Tumores irresecables: reservado a malo.'] },
        ],
      },
    ],
    closure: [
      { layer: 'Anastomosis', suture: 'PDS, Monocryl, Maxon o Biosyn; no absorbible si la albúmina es baja', gauge: '3-0 o 4-0', pattern: 'Simples aposicionales o continuo dividido', why: 'Tejido sano con tejido sano; submucosa en cada punto.' },
      { layer: 'Mesenterio', suture: 'Absorbible monofilamento', gauge: '4-0', pattern: 'Continuo o simples', why: 'Sin dañar las arcadas que irrigan la anastomosis.' },
      { layer: 'Biopsia hepática', suture: 'PDS o Monocryl', gauge: '3-0 o 4-0', pattern: 'Lazada en guillotina', why: 'Hemostasia del borde hepático sin suturar el parénquima.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Fuga, dehiscencia y peritonitis', prevent: 'Márgenes sanos, buena técnica, albúmina y anemia corregidas, parche seroso.', manage: 'Reintervención, lavado, antibiótico según cultivo.' },
      { name: 'Estenosis o recidiva tumoral', prevent: 'Márgenes de 4–8 cm con mesenterio en bloque.', manage: 'Nueva resección o tratamiento oncológico.' },
      { name: 'Implantación tumoral', prevent: 'Manipular poco el tumor; guantes, instrumental y sutura nuevos.', manage: 'Tratamiento oncológico.' },
      { name: 'Síndrome de intestino corto', prevent: 'No resecar más de lo necesario.', manage: 'Apoyo nutricional prolongado.' },
    ],
    quiz: [
      { q: '¿Qué márgenes indica el Fossum para un tumor intestinal?', a: '4–8 cm de intestino macroscópicamente normal a cada lado.' },
      { q: '¿Qué muestras tomas y cuándo?', a: 'Linfonodos mesentéricos e hígado (y otros órganos según haga falta) antes de abrir el intestino.' },
      { q: '¿Por qué hay que suturar tejido sano con tejido sano?', a: 'Porque suturar tejido con tumor hace probable la dehiscencia.' },
      { q: '¿Qué tumor intestinal felino no se opera habitualmente?', a: 'El linfoma difuso o de células pequeñas, que responde a quimioterapia.' },
      { q: '¿Qué tumor tiene buen pronóstico incluso con metástasis al resecar?', a: 'El leiomiosarcoma, con unos 2 años de supervivencia media.' },
    ],
    videos: [
      { title: 'Intestinal resection and anastomosis', url: 'https://www.youtube.com/watch?v=ZzEdo43ZSxM', channel: 'Stanley Kim', lang: 'inglés', note: 'La técnica de resección y anastomosis' },
    ],
    sources: [
      SOURCES.fossum(18, 'cirugía del sistema digestivo: neoplasia intestinal (pp. 455–458) y técnicas de resección y anastomosis (pp. 433–449)'),
      { text: 'Vail DM, Thamm DH, Liptak JM. Withrow & MacEwen\'s Small Animal Clinical Oncology, 6.ª ed. Elsevier, 2020. Tumores del tracto gastrointestinal.', kind: 'libro' },
      SOURCES.plumbs,
    ],
  },
};
