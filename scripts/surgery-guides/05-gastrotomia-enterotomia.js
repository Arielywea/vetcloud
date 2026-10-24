// Gastrotomía y enterotomía (id 5). Rewritten from Fossum 5.ª ed., cap. 18 (pp. 398–401, 413–418, 433–455).
const { pick, drug, ABDOMINAL_CLOSURE, CELIOTOMY_STEPS, CLEAN_CLOSURE_STEPS, SOURCES } = require('./_common');

module.exports = {
  id: 5,
  legacy: {
    indicaciones: 'Cuerpo extraño gástrico que no se puede retirar por endoscopia; cuerpo extraño intestinal que obstruye, no avanza en 8 h en radiografías seriadas o no se elimina en unas 36 h; cuerpo extraño lineal; biopsia de pared de espesor completo; exploración de la luz.',
    tecnica_quirurgica: 'Celiotomía del xifoides al pubis, exploración de todo el abdomen y del tubo digestivo. Gastrotomía: aislar con compresas, puntos de sostén, incisión en la cara ventral en zona poco vascularizada entre curvaturas y lejos del píloro, aspiración, extracción, cierre con 2-0 o 3-0 absorbible en dos capas invertidas seromusculares (Cushing o continuo simple que incluye submucosa, luego Lembert o Cushing). Enterotomía: aislar, ordeñar y ocluir 4–6 cm a cada lado, incisión en el borde antimesentérico en tejido sano distal al cuerpo extraño, recortar mucosa evertida, cierre con puntos simples de 3-0 o 4-0 a 2 mm del borde y 2–3 mm entre sí (o continuo), prueba de fugas, omento o parche seroso, cambio de guantes e instrumental.',
    material_quirurgico: 'Instrumental de laparotomía, separador de Balfour, separadores maleables, pinzas Doyen (no aplastantes) y Babcock, tijeras de Metzenbaum, hoja n.º 11, drenaje de Penrose (como torniquete), aspirador, jeringa y aguja 25 G para la prueba de fugas, solución salina tibia, segundo juego de instrumental y guantes.',
    tipo_sutura: 'Estómago: PDS o Maxon 2-0 o 3-0, dos capas invertidas. Intestino: PDS, Maxon, Monocryl o Biosyn 3-0 o 4-0 con aguja ahusada, puntos simples aposicionales o continuo; con albúmina de 2 g/dL o menos, absorbible de larga duración o no absorbible monofilamento. Evitar catgut crómico y no absorbible que entre en la luz gástrica.',
    complicaciones_frecuentes: 'Dehiscencia, fuga y peritonitis séptica (más a los 3–5 días); íleo; vómitos; estenosis (rara con patrones aposicionales); perforaciones del borde mesentérico por cuerpos extraños lineales; síndrome de intestino corto si se reseca mucho; shock endotóxico.',
    manejo_anestesico_sugerido: 'Tabla 18.4 (abdomen agudo): rehidratar en 4–6 h si se puede, corregir electrolitos; evitar sedantes, α2 y acepromacina en pacientes deprimidos; midazolam si está ansioso; opioide si no está deprimido. Inducción con propofol o alfaxalona si está estable; etomidato o ketamina con benzodiazepina si está inestable. Isoflurano o sevoflurano con fentanilo y ketamina a dosis baja. Sin óxido nitroso en obstrucciones. Cefazolina 22 mg/kg IV antes de incidir, repetida a las 2 h. Sin AINE si está hipotenso.',
    consideraciones_por_raza: 'Animales jóvenes (cachorros y gatitos) con más ingestión de cuerpos extraños. Gatos: cuerpos extraños lineales, a menudo anclados bajo la lengua o en el píloro.',
    consideraciones_comorbilidades: 'Revisar siempre debajo de la lengua en gatos (puede requerir sedación). Repetir la radiografía justo antes de operar. Gas libre en el abdomen o líquido séptico: cirugía de urgencia. Hipoalbuminemia, debilitación y cuerpo extraño lineal: más riesgo de fuga.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 18, pp. 398–401, 413–418 y 433–455; cap. 19, pp. 514–518.',
  },
  guide: {
    draft: true,
    lede: 'Apertura del estómago o del intestino para sacar un cuerpo extraño o tomar biopsias. La gastrotomía es más segura que la enterotomía porque el estómago cicatriza rápido y tiene pocas bacterias; en el intestino, lo que decide el resultado es incidir en tejido sano, incluir la submucosa en cada punto y no contaminar el abdomen.',
    meta: { species: ['perro', 'gato'], duration: '45–90 min', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Repite la radiografía justo antes de operar: el cuerpo extraño puede haber pasado al intestino o al colon.',
      'En gatos, revisa debajo de la lengua (con sedación si hace falta): un hilo anclado cambia toda la cirugía.',
      'Explora todo el abdomen y todo el tubo digestivo: puede haber más de un cuerpo extraño.',
      'En el intestino, incide en el borde antimesentérico del tejido sano distal al cuerpo extraño, y espera a sacarlo antes de juzgar la viabilidad.',
      'Cada punto debe tomar la submucosa, la capa que da la resistencia. Al terminar, prueba de fugas, omento, y guantes e instrumental limpios para cerrar.',
    ],
    indications: [
      'Cuerpo extraño gástrico que no se puede retirar por endoscopia (la endoscopia es preferible cuando es posible, p. 400).',
      'Cuerpo extraño intestinal: obstrucción completa, o parcial que no se mueve en radiografías seriadas en 8 h o no se elimina en unas 36 h. No esperes si hay dolor, fiebre, vómitos o decaimiento (p. 454).',
      'Cuerpo extraño lineal (puede necesitar gastrotomía y 2–4 enterotomías).',
      'Biopsia de espesor completo del estómago o del intestino; exploración de la luz.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Imágenes.', body: 'Radiografía en tres proyecciones y ecografía. En gatos, una relación entre el diámetro máximo del intestino y la altura de la placa craneal de L2 mayor de 3 sugiere obstrucción y mayor de 4 casi la confirma. No uses bario si sospechas perforación.', cite: 'Fossum p. 434' },
              { title: 'Laboratorio (Box 18.35).', body: 'Hemograma, bioquímica, orina y, si se puede, coagulación y ECG. Los vómitos gástricos dan alcalosis hipoclorémica e hipopotasémica; las obstrucciones distales, más acidosis e hipopotasemia.', cite: 'Fossum p. 433, 454' },
              { title: 'Corrige.', body: 'Hidratación, electrolitos y ácido-base; transfusión si el hematocrito es menor de 20 %.', cite: 'Fossum p. 433' },
              { title: 'Ayuno.', body: 'Adultos 12–18 h (estómago vacío al menos 8–12 h); pediátricos solo 4–6 h por la hipoglucemia.', cite: 'Fossum p. 398, 433' },
              { title: 'Cuándo no esperar (Box 18.36).', body: 'Opera sin demora si hay herida penetrante, bacterias en el líquido abdominal, diferencia de glucosa sangre-líquido mayor de 20 mg/dL, lactato del líquido mayor de 2,5–5,5 mmol/L, gas libre o vólvulo.', cite: 'Fossum p. 435' },
              { title: 'Antibiótico (Box 18.37).', body: 'Cefazolina 22 mg/kg IV antes de incidir, repetida a las 2 h; en cirugía del intestino distal, cefoxitina o ampicilina con sulbactam. En la gastrotomía simple sin derrame casi nunca hace falta.', cite: 'Fossum p. 399, 436' },
              { title: 'Campo.', body: 'Decúbito dorsal, preparado desde la mitad del tórax hasta el periné.', cite: 'Fossum p. 454' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Principios de la cirugía intestinal (Box 18.38)', bullets: ['Diagnóstico precoz y buena técnica evitan la mayoría de las complicaciones.', 'Operar en cuanto se pueda anestesiar si hay perforación, estrangulación u obstrucción completa.', 'La cicatrización necesita buen riego, aposición exacta de la mucosa y poco trauma.', 'Patrones aposicionales (simples, Gambee, continuo) que incluyan la submucosa.', 'Absorbible monofilamento sintético; parche seroso si preocupa la dehiscencia.', 'Instrumental y guantes nuevos antes de cerrar el abdomen.'] },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'Pacientes deshidratados, hipotensos, con alteraciones electrolíticas y a veces arritmias; regurgitan con facilidad. Preoxigenar, inducción rápida, intubación inmediata (tabla 18.4, p. 399).',
        blocks: [
          {
            type: 'drugs',
            items: [
              ...pick('maropitant'),
              drug('Premedicación', 'Midazolam', '0,2 mg/kg', 'IV o IM', 'Solo si está estable y ansioso. Evitar α2 y acepromacina.'),
              drug('Premedicación', 'Metadona', '0,2–0,3 mg/kg', 'IV o IM', 'Si no está deprimido. Alternativa de la tabla: hidromorfona 0,05–0,2 mg/kg.'),
              drug('Premedicación', 'Buprenorfina', '0,005–0,02 mg/kg', 'IV o IM', 'Si el dolor esperado es moderado.'),
              drug('Inducción (estable)', 'Propofol', '2–6 mg/kg', 'IV, a efecto', 'Evitar en el paciente hipovolémico: hipotensión marcada (p. 435).'),
              drug('Inducción (estable)', 'Alfaxalona', '2–3 mg/kg', 'IV, a efecto'),
              drug('Inducción (inestable)', 'Ketamina', '5,5 mg/kg', 'IV', 'Con diazepam o midazolam 0,28 mg/kg IV; o etomidato 0,5–1,5 mg/kg IV.'),
              drug('Mantenimiento', 'Isoflurano o sevoflurano', 'A dosis reducida', 'Inhalatoria', 'Sin óxido nitroso: aumenta el gas atrapado en las vísceras.'),
              drug('Intraoperatorio', 'Fentanilo', '0,002–0,01 mg/kg', 'IV, en bolos', 'Luego infusión 2–30 µg/kg/h.'),
              ...pick('ketamina', 'cefazolina'),
              drug('Local', 'Lidocaína incisional', '5 mg/kg (máximo)', 'Infiltración', 'En gatos, 2–4 mg/kg como máximo.'),
              drug('Epidural', 'Morfina sin conservante', '0,1 mg/kg', 'Epidural', 'Sin anestésicos locales por vía espinal en el abdomen agudo (tabla 18.4).'),
              ...pick('metadonaPost'),
            ],
          },
          { type: 'note', kind: 'error', title: 'En el paciente comprometido', bullets: ['Sin AINE si hay hipotensión.', 'Prepárate para una caída de la presión al inducir, aun con volumen repuesto.', 'Mantén la temperatura sobre 35 °C (calentadores de líquidos y de paciente).', 'Presión arterial media de 60–80 mmHg: fenilefrina, efedrina, noradrenalina o dopamina si hace falta.'] },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          {
            type: 'list',
            items: [
              'Estómago: cardias, fundus, cuerpo, antro pilórico, canal y ostium pilórico. Irrigado por las arterias gástricas (curvatura menor), gastroepiploicas (curvatura mayor) y gástricas cortas (de la esplénica), todas de la celíaca (p. 400).',
              'La mucosa gástrica es la mitad del peso del estómago y se separa fácil de la submucosa; las incisiones sangran más que en el intestino.',
              'Intestino delgado: el perro tiene cinco veces su longitud corporal de intestino, 80 % delgado. Duodeno fijo, de unos 25 cm, con la papila del colédoco y del páncreas en sus primeros centímetros; yeyuno largo y móvil; íleon de unos 15 cm con un vaso antimesentérico (p. 436).',
              'Capas: mucosa (barrera), submucosa (vasos y la mayor resistencia a la tensión), muscular (motilidad) y serosa (sella rápido).',
              'Ramas de la celíaca y la mesentérica craneal irrigan el intestino a través de las arcadas y los vasos rectos del mesenterio.',
            ],
          },
        ],
      },
      {
        id: 'abordaje',
        title: 'Abordaje y exploración',
        blocks: [
          { type: 'steps', items: CELIOTOMY_STEPS },
          { type: 'note', kind: 'tip', title: 'Muestras antes de abrir la luz', text: 'Toma las biopsias de linfonodos, hígado u otros órganos antes de abrir el estómago o el intestino, para no contaminar entre sitios (p. 438).' },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          {
            id: 'gastrotomia',
            title: 'A. Gastrotomía',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Aísla el estómago.', body: 'Rodéalo con compresas húmedas para reducir la contaminación.', cite: 'Fossum p. 401' },
                  { title: 'Puntos de sostén.', body: 'Ayudan a manipularlo y a que no se derrame contenido.' },
                  { title: 'Elige el sitio.', body: 'Cara ventral, en una zona poco vascularizada entre la curvatura mayor y la menor (fig. 18.66). Lejos del píloro: al cerrar cerca de él se pliega demasiado tejido hacia la luz y se obstruye la salida.', cite: 'Fossum p. 401' },
                  { title: 'Incide.', body: 'Incisión punzante con bisturí y amplía con tijera de Metzenbaum (fig. 18.67A-B).', cite: 'Fossum p. 401' },
                  { title: 'Aspira y extrae.', body: 'Aspira el contenido para reducir derrames y retira el cuerpo extraño.' },
                  { title: 'Hemostasia.', body: 'El estómago sangra más que el intestino: presión suave; evita pinzas aplastantes y el electrocauterio en la mucosa.', cite: 'Fossum p. 415' },
                  { title: 'Primera capa.', body: 'PDS o Maxon 2-0 o 3-0, Cushing o continuo simple que incluya serosa, muscular y submucosa (fig. 18.67C). Puedes cerrar antes la mucosa con un continuo simple aparte para reducir el sangrado postoperatorio.', cite: 'Fossum p. 401' },
                  { title: 'Segunda capa.', body: 'Lembert o Cushing que invierta serosa y muscular sobre la primera (fig. 18.67D).', cite: 'Fossum p. 401' },
                  { title: 'Revisa el intestino.', body: 'Siempre que saques un cuerpo extraño gástrico, recorre todo el intestino buscando más material.', cite: 'Fossum p. 401' },
                ],
              },
              { type: 'note', kind: 'error', title: 'En el estómago, no', bullets: ['No absorbible en continuo que entre en la luz: úlceras a lo largo de la sutura (p. 416).', 'Catgut crómico: se digiere rápido (p. 415).', 'Juzgar la viabilidad por el color de la mucosa: en la DVG suele estar negra (p. 402).'] },
            ],
          },
          {
            id: 'enterotomia',
            title: 'B. Enterotomía',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Exterioriza y aísla.', body: 'Saca el asa y aíslala con compresas o paños (fig. 18.97A).', cite: 'Fossum p. 438' },
                  { title: 'Ordeña el contenido.', body: 'Desplaza el quimo fuera del segmento.' },
                  { title: 'Ocluye.', body: 'El ayudante ocluye la luz con los dedos índice y medio en tijera, 4–6 cm a cada lado. Sin ayudante: pinzas Doyen o un torniquete de Penrose.', cite: 'Fossum p. 438' },
                  { title: 'Incide en tejido sano.', body: 'En el borde antimesentérico, distal al cuerpo extraño (fig. 18.98), con hoja n.º 11 de espesor completo. Alarga en el eje longitudinal lo necesario para sacarlo sin desgarrar.', cite: 'Fossum p. 438–439' },
                  { title: 'Extrae.', body: 'Empuja el cuerpo extraño hacia la incisión desde proximal; no tires de él.' },
                  { title: 'Valora la viabilidad después.', body: 'Un asa muy distendida puede verse cianótica: descomprímela, sácalo y báñala unos minutos en salino tibio antes de decidir. Viable: rosada o roja, con peristaltismo, pulso arterial y sangrado al cortar. Si dudas, reseca (guía de enterectomía).', cite: 'Fossum p. 436, 455' },
                  { title: 'Prepara los bordes.', body: 'Recorta la mucosa evertida al nivel de la serosa o usa un punto de Gambee modificado. Aspira la luz aislada.', cite: 'Fossum p. 439' },
                  { title: 'Cierra.', body: 'Puntos simples de todo el espesor a 2 mm del borde y 2–3 mm entre sí, nudos fuera de la luz (fig. 18.101A). Inclina la aguja para tomar algo más de serosa que de mucosa: devuelve la mucosa evertida a la luz. Ajusta sin cortar ni aplastar.', cite: 'Fossum p. 440' },
                  { title: 'Luz pequeña.', body: 'Cierra en sentido transversal: une los extremos de la incisión longitudinal con un primer punto y completa a 2–3 mm (fig. 18.99).', cite: 'Fossum p. 439' },
                  { title: 'Prueba de fugas.', body: 'Manteniendo la oclusión, distiende moderadamente con salino estéril, presiona con suavidad y busca fugas entre puntos o por los agujeros de la aguja (fig. 18.102). Añade puntos donde haga falta.', cite: 'Fossum p. 440' },
                  { title: 'Protege.', body: 'Omento sobre la sutura; parche seroso si la integridad es dudosa o filtra por los agujeros de la aguja.', cite: 'Fossum p. 440' },
                ],
              },
              { type: 'note', kind: 'why', title: 'Por qué aposicional y en una capa', text: 'Los patrones aposicionales cicatrizan antes; los invertidos y evertidos retrasan la cicatrización y estenosan más. Los evertidos además tienen menos resistencia en la fase de retardo y filtran más (p. 449).' },
              { type: 'note', kind: 'tip', title: 'Albúmina baja', text: 'Con albúmina de 2 g/dL o menos, usa un monofilamento absorbible de larga duración o incluso no absorbible (polipropileno, nylon) 3-0 o 4-0, y considera un parche seroso (p. 440, 449).' },
            ],
          },
          {
            id: 'lineal',
            title: 'C. Cuerpo extraño lineal',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Suelta el ancla.', body: 'Corta el hilo bajo la lengua o haz una gastrotomía si está anclado en el píloro.', cite: 'Fossum p. 455' },
                  { title: 'Primer tramo.', body: 'Coloca una pinza en el extremo distal del cuerpo extraño que sale del píloro y tira con suavidad para ver el siguiente punto donde está fijo.', cite: 'Fossum p. 455' },
                  { title: 'Enterotomía.', body: 'Haz una enterotomía ahí y saca el tramo proximal.' },
                  { title: 'Repite.', body: 'Pon otra pinza distal, corta el cuerpo extraño, tensa suavemente lo que queda y busca el siguiente punto de fijación. Repite hasta sacarlo todo (suelen hacer falta 2–4 enterotomías).', cite: 'Fossum p. 454–455' },
                  { title: 'Sin tensión.', body: 'Demasiada tracción hace que el hilo sierre el borde mesentérico de espesor completo.' },
                  { title: 'Revisa el borde mesentérico.', body: 'Cierra las enterotomías y busca perforaciones en todo el borde mesentérico; reseca si están.', cite: 'Fossum p. 455' },
                ],
              },
              { type: 'note', kind: 'tip', title: 'Técnica de una sola enterotomía con sonda', text: 'Incide donde el objeto está fijo, sutúralo a una sonda blanda, avanza la sonda por el intestino distal, cierra la enterotomía y ordeña la sonda y el hilo hasta sacarlos por el ano. Funciona mejor si el hilo no ha penetrado la mucosa (p. 455).' },
              { type: 'note', kind: 'book', title: 'En gatos con hilo bajo la lengua', text: 'Si llegan 1–3 días después de la ingestión, se puede cortar el hilo y vigilar que pase; si el gato no está claramente mejor a las 6 h, a cirugía (p. 454).' },
            ],
          },
          {
            id: 'cierre',
            title: 'D. Lavado y cierre',
            blocks: [{ type: 'steps', items: CLEAN_CLOSURE_STEPS }],
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
              { title: 'Fluidos y electrolitos.', body: 'Hasta que beba lo suficiente; vigila el potasio.', cite: 'Fossum p. 416' },
              { title: 'Agua y comida.', body: 'Agua a las 8–12 h y comida a las 12–24 h si no vomita (comida blanda, baja en grasa, 3–4 veces al día); dieta normal desde las 48–72 h. La alimentación temprana aumenta el flujo intestinal y favorece la cicatrización.', cite: 'Fossum p. 449' },
              { title: 'Antibiótico.', body: 'Suspender a las 2–6 h salvo peritonitis o contaminación grosera.', cite: 'Fossum p. 449' },
              { title: 'Analgesia.', body: 'Opioide; sin AINE ni corticoides en el postoperatorio inmediato (inhiben las prostaglandinas protectoras).', cite: 'Fossum p. 449' },
              { title: 'Movilidad.', body: 'Caminar pronto reduce el íleo.' },
              { title: 'Vigila la fuga.', body: 'Decaimiento, fiebre alta, dolor abdominal, vómitos o íleo: abdominocentesis, hemograma y bioquímica; cultivo del líquido, antibiótico y exploración si hay peritonitis.', cite: 'Fossum p. 449' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Cicatrización intestinal', text: 'Fase de retardo (días 0–4): la resistencia la dan las suturas y es mínima al final, por eso la dehiscencia es más frecuente a los 3–5 días. Fase proliferativa (días 3–14): la resistencia se acerca a la normal entre los días 10 y 17. Maduración hasta los 180 días (p. 449).' },
        ],
      },
    ],
    closure: [
      { layer: 'Estómago', suture: 'PDS o Maxon', gauge: '2-0 o 3-0', pattern: 'Dos capas invertidas: Cushing o continuo que incluye submucosa, luego Lembert o Cushing', why: 'Pared gruesa que tolera la inversión; la mucosa puede cerrarse aparte para reducir el sangrado.' },
      { layer: 'Intestino delgado', suture: 'PDS, Maxon, Monocryl o Biosyn, aguja ahusada', gauge: '3-0 o 4-0', pattern: 'Simples aposicionales a 2 mm del borde y 2–3 mm entre sí (o continuo)', why: 'Incluye la submucosa sin estrechar la luz; los aposicionales cicatrizan antes.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Fuga, dehiscencia y peritonitis séptica', prevent: 'Incidir en tejido sano, submucosa en cada punto, prueba de fugas, omento o parche, alimentación temprana.', manage: 'Abdominocentesis, cultivo, antibiótico (Box 18.39), fluidos y reintervención.' },
      { name: 'Estenosis u obstrucción de la salida gástrica', prevent: 'Gastrotomía lejos del píloro; patrones aposicionales en el intestino; cierre transversal en luces pequeñas.', manage: 'Enterectomía del segmento; corrección de la salida gástrica.' },
      { name: 'Perforación por cuerpo extraño lineal', prevent: 'No traccionar; varias enterotomías.', manage: 'Resección del segmento perforado.' },
      { name: 'Íleo y vómitos', prevent: 'Manipulación suave, analgesia, alimentación y movilidad tempranas.', manage: 'Procinéticos, corregir el potasio.' },
      { name: 'Síndrome de intestino corto', prevent: 'Resecar solo lo necesario.', manage: 'Nutrición enteral (elemental al inicio) 1–2 meses, comidas frecuentes.' },
      { name: 'Cuerpo extraño olvidado', prevent: 'Explorar todo el tubo digestivo.', manage: 'Nueva cirugía.' },
    ],
    quiz: [
      { q: '¿Dónde incides el estómago y por qué no cerca del píloro?', a: 'En la cara ventral, en zona poco vascularizada entre las curvaturas; cerca del píloro el cierre pliega tejido hacia la luz y obstruye la salida.' },
      { q: '¿Cómo cierra el Fossum la gastrotomía?', a: 'Con 2-0 o 3-0 absorbible en dos capas invertidas: Cushing o continuo que incluye serosa, muscular y submucosa, y encima Lembert o Cushing.' },
      { q: '¿Dónde incides el intestino para sacar un cuerpo extraño?', a: 'En el borde antimesentérico, en el tejido sano distal al cuerpo extraño.' },
      { q: '¿Qué distancia y separación tienen los puntos de la enterotomía?', a: 'A 2 mm del borde y 2–3 mm entre sí, con algo más de serosa que de mucosa y nudos extraluminales.' },
      { q: '¿Cómo sacas un cuerpo extraño lineal?', a: 'Soltando el ancla y sacándolo por tramos con varias enterotomías, sin traccionar, y revisando después el borde mesentérico.' },
      { q: '¿Cuándo es más probable la dehiscencia y por qué?', a: 'A los 3–5 días, al final de la fase de retardo, cuando la resistencia depende casi solo de las suturas.' },
    ],
    videos: [
      { title: 'Time Lapse Enterotomy Dog Surgery', url: 'https://www.youtube.com/watch?v=ogoUFPC5hjE', channel: 'VETgirl', lang: 'inglés', note: 'Enterotomía por cuerpo extraño' },
      { title: 'Enterotomy & closure', url: 'https://www.youtube.com/watch?v=ml18-oV3DoY', channel: 'Stephen Birchard', lang: 'inglés', note: 'Cierre con continuo simple' },
      { title: 'Canine Gastrotomy, Removal of Foreign Body From Stomach', url: 'https://www.youtube.com/watch?v=XCfTAPOryis', channel: 'MellowYellow1800', lang: 'inglés', note: 'Gastrotomía' },
    ],
    sources: [
      SOURCES.fossum(18, 'cirugía del sistema digestivo: estómago (pp. 398–401, 413–418) e intestino delgado (pp. 433–455)'),
      SOURCES.fossum(19, 'cirugía de la cavidad abdominal: celiotomía, exploración y cierre (pp. 514–518)'),
      SOURCES.plumbs,
    ],
  },
};
