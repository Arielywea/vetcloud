// Enterectomía y anastomosis (id 7). Rewritten from Fossum 5.ª ed., cap. 18 (pp. 433–455, 458–462).
const { pick, drug, ABDOMINAL_CLOSURE, CELIOTOMY_STEPS, CLEAN_CLOSURE_STEPS, SOURCES } = require('./_common');

module.exports = {
  id: 7,
  legacy: {
    indicaciones: 'Segmentos isquémicos, necróticos, neoplásicos o con infección fúngica; intususcepción irreductible o con tejido desvitalizado; perforación extensa; estenosis; asas con viabilidad dudosa tras retirar un cuerpo extraño. Se recomienda la anastomosis término-terminal.',
    tecnica_quirurgica: 'Celiotomía amplia, exploración y toma de muestras extraintestinales. Aislar el segmento, valorar la viabilidad y la extensión. Ocluir (doble ligadura, grapas o sellado) y cortar los vasos arcadiales de la mesentérica craneal que irrigan el segmento, y los de la arcada terminal y los vasos rectos en los puntos de corte. Ordeñar, ocluir con dedos o pinzas no aplastantes, pinzas en el segmento enfermo y sección perpendicular (75–90°) o, si las luces difieren, perpendicular en la mayor y oblicua (45–60°) en la menor con el borde antimesentérico más corto. Recortar la mucosa evertida. Puntos simples de 3-0 o 4-0 de todo el espesor, primero mesentérico y luego antimesentérico, a 2 mm del borde y 2–3 mm entre sí; o continuo simple dividido. Prueba de fugas, cierre del mesenterio con 4-0, lavado, omento o parche seroso, cambio de guantes e instrumental. Alternativa con grapadoras: anastomosis funcional término-terminal (GIA + TA), la preferida con grapas.',
    material_quirurgico: 'Separadores autoestáticos y maleables, pinzas Doyen (no aplastantes) y Carmalt o Allen (solo sobre el tejido que se extirpa), Babcock, Metzenbaum, hoja n.º 11, drenajes de Penrose, aspirador, jeringa con aguja 25 G para la prueba de fugas; grapadoras GIA, TA, EEA o de piel si se usan.',
    tipo_sutura: 'Anastomosis: PDS, Maxon o Monocryl 3-0 o 4-0 con aguja ahusada o tapercut; en peritonitis, absorbible de larga duración; con albúmina baja, absorbible de larga duración o no absorbible (nylon, polibutester, polipropileno). Vasos: doble ligadura absorbible. Mesenterio: 4-0 absorbible monofilamento continuo o simples. Evitar catgut crómico en pacientes jóvenes o debilitados.',
    complicaciones_frecuentes: 'Shock, fuga, íleo, dehiscencia (más a los 3–5 días), perforación, peritonitis, estenosis (rara salvo patrones invertidos o evertidos o tensión), síndrome de intestino corto, recidiva y muerte. Más riesgo con cuerpo extraño, debilitación, hipoalbuminemia y gas libre preoperatorio.',
    manejo_anestesico_sugerido: 'Tabla 18.4 (abdomen agudo): dos vías gruesas, líquidos de choque si hace falta, preoxigenar 3–5 min, inducción con ketamina-benzodiazepina o etomidato en el inestable (evitar propofol en el hipovolémico), inhalatorio a dosis reducida, sin óxido nitroso, fentanilo e infusiones, temperatura sobre 35 °C. Cefazolina en intestino proximal y medio; cefoxitina o ampicilina-sulbactam en el distal.',
    consideraciones_por_raza: 'Pastor alemán y perros jóvenes con más intususcepción (a menudo secundaria a enteritis o parásitos). Bóxer, Collie y Pastor alemán con más tumores intestinales; gatos siameses con adenocarcinoma.',
    consideraciones_comorbilidades: 'Peritonitis séptica previa, hipoalbuminemia y anastomosis múltiples aumentan el riesgo de dehiscencia. Transfundir si el hematocrito es menor de 20 %. Debilitados: sonda de alimentación en la misma cirugía.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 18, pp. 433–455 y 458–462; cap. 19, pp. 514–518.',
  },
  guide: {
    draft: true,
    lede: 'Resección de un segmento de intestino delgado y unión término-terminal de los extremos sanos. Se hace cuando el intestino no es viable, tiene un tumor o una intususcepción que no se reduce. El resultado depende de cortar en intestino bien irrigado, igualar las luces sin estrecharlas, tomar la submucosa en cada punto y cuidar el borde mesentérico, que es donde más filtra.',
    meta: { species: ['perro', 'gato'], duration: '60–120 min', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Decide los márgenes por la viabilidad: intestino que sangra, late y se mueve. Si dudas, reseca; un aspecto normal no garantiza que cicatrice.',
      'Liga los vasos que irrigan el segmento antes de cortar el intestino y conserva los que llegan a los extremos que quedan.',
      'Si las luces difieren, corta perpendicular el extremo grande y oblicuo (45–60°) el pequeño, con el borde antimesentérico más corto. No estreches nunca la luz grande.',
      'Primer punto en el borde mesentérico, segundo en el antimesentérico: el mesentérico es el más difícil por la grasa y donde más fugas hay.',
      'Prueba de fugas, cierre del mesenterio, omento o parche seroso, y guantes e instrumental limpios para cerrar.',
    ],
    indications: [
      'Segmentos isquémicos o necróticos (vólvulo, estrangulación, cuerpo extraño con necrosis).',
      'Intususcepción irreductible, con masa en el ápice, tejido desvitalizado o vasos mesentéricos arrancados (p. 461).',
      'Neoplasia intestinal (márgenes de 4–8 cm, ver la guía de masa intestinal) e infección fúngica (pitiosis).',
      'Perforación extensa, estenosis o lesión que no se puede cerrar con una enterotomía.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Base de datos (Box 18.35).', body: 'Hemograma, bioquímica, orina, coagulación si se puede y ECG; localiza la lesión con palpación, radiografía, ecografía o endoscopia.', cite: 'Fossum p. 433' },
              { title: 'Corrige y transfunde.', body: 'Hidratación, electrolitos y ácido-base; transfusión si el hematocrito es menor de 20 % o el paciente está débil. En la enteropatía con pérdida de proteínas, el plasma rara vez sube la albúmina.', cite: 'Fossum p. 433' },
              { title: 'Ayuno.', body: 'Adultos 12–18 h, pediátricos 4–8 h.', cite: 'Fossum p. 433' },
              { title: 'Momento.', body: 'Las obstrucciones mecánicas se operan idealmente dentro de las 12 h del diagnóstico, dando tiempo a corregir; perforación, vólvulo o peritonitis, en cuanto se diagnostican.', cite: 'Fossum p. 436' },
              { title: 'Antibiótico (Box 18.37).', body: 'Cefazolina 22 mg/kg IV en intestino proximal y medio; cefoxitina 30 mg/kg IV o ampicilina con sulbactam en el distal. Repetir a las 2 h.', cite: 'Fossum p. 436' },
              { title: 'Nutrición.', body: 'En debilitados o si se espera anorexia o vómitos, planifica una sonda de enterostomía en la misma cirugía.', cite: 'Fossum p. 457' },
            ],
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'Pacientes con obstrucción, isquemia o perforación: deshidratados, hipotensos, taquicárdicos, con alteraciones electrolíticas y arritmias; las vísceras distendidas comprimen la cava y el diafragma (p. 435).',
        blocks: [
          {
            type: 'drugs',
            items: [
              ...pick('maropitant'),
              drug('Preoxigenación', 'Oxígeno', '3–5 min', 'Mascarilla'),
              drug('Premedicación', 'Metadona', '0,2–0,3 mg/kg', 'IV o IM', 'Solo si no está deprimido; a menudo no hace falta premedicar.'),
              drug('Inducción (inestable)', 'Ketamina', '5,5 mg/kg', 'IV', 'Con midazolam o diazepam 0,28 mg/kg IV; o etomidato 0,5–1,5 mg/kg IV.'),
              drug('Inducción (estable)', 'Alfaxalona', '2–3 mg/kg', 'IV, a efecto', 'El propofol causa hipotensión marcada en el hipovolémico (p. 435).'),
              drug('Mantenimiento', 'Isoflurano o sevoflurano', 'A dosis reducida', 'Inhalatoria', 'Sin óxido nitroso.'),
              drug('Intraoperatorio', 'Fentanilo', '0,001–0,005 mg/kg', 'IV, carga', 'Luego infusión 2–30 µg/kg/h (tabla 18.4).'),
              ...pick('ketamina'),
              drug('Rescate', 'Atropina o glicopirrolato', '0,02–0,04 mg/kg (atropina)', 'IV', 'Si la manipulación visceral causa bradicardia. Glicopirrolato 0,005–0,01 mg/kg.'),
              drug('Profilaxis', 'Cefoxitina', '30 mg/kg', 'IV', 'Cirugía del intestino distal (Box 18.37). Cefazolina 22 mg/kg en el proximal.'),
              ...pick('metadonaPost'),
            ],
          },
          { type: 'note', kind: 'error', title: 'Cuidado', bullets: ['Prepárate para la caída de presión al inducir, aun con volumen repuesto.', 'Grandes desplazamientos de líquidos: cristaloides abundantes y coloides si persiste la hipotensión.', 'Temperatura sobre 35 °C: la hipotermia causa coagulopatía, arritmias y mala cicatrización.', 'Sin AINE si está hipotenso.'] },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía y viabilidad',
        blocks: [
          {
            type: 'list',
            items: [
              'El yeyuno forma la mayor parte de las asas en el abdomen ventrocaudal y es el segmento más largo y móvil; el íleon, de unos 15 cm, tiene un vaso antimesentérico (p. 436).',
              'La raíz del mesenterio fija yeyuno e íleon a la pared dorsal; la mesentérica craneal da las arterias yeyunales, que forman arcadas, una arcada terminal y los vasos rectos hacia la pared.',
              'La submucosa es la capa con mayor resistencia: debe incluirse en todos los puntos.',
              'Los linfonodos mesentéricos están a lo largo de los vasos del mesenterio.',
            ],
          },
          { type: 'table', columns: ['Criterio', 'Viable', 'No viable'], rows: [['Color', 'Rosado a rojo', 'Azul, gris, verde o negro'], ['Pared', 'Gruesa, firme', 'Delgada, friable'], ['Peristaltismo', 'Presente', 'Ausente'], ['Pulso arterial', 'Presente en los vasos', 'Ausente'], ['Sangrado al incidir', 'Sí', 'No']], caption: 'Fossum p. 436. Bañar el segmento en salino tibio unos minutos puede mejorar color y peristaltismo. La fluoresceína IV (15–25 mg/kg) y la oximetría de pulso en la pared mejoran la exactitud, pero se reseca ante la duda.' },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          { id: 'abordaje', title: 'A. Abordaje y decisión', blocks: [{ type: 'steps', items: [...CELIOTOMY_STEPS, { title: 'Muestras primero.', body: 'Toma las muestras extraintestinales (linfonodos, hígado) antes de abrir el intestino.', cite: 'Fossum p. 440' }, { title: 'Aísla y valora.', body: 'Exterioriza el segmento, aíslalo con paños o compresas, valora la viabilidad y decide cuánto resecar.', cite: 'Fossum p. 440' }] }] },
          {
            id: 'reseccion',
            title: 'B. Resección',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Vasos arcadiales.', body: 'Ocluye con doble ligadura, grapas o sellado y corta los vasos arcadiales que irrigan el segmento (fig. 18.103).', cite: 'Fossum p. 440' },
                  { title: 'Vasos en los puntos de corte.', body: 'Ocluye la arcada terminal y los vasos rectos dentro de la grasa mesentérica justo donde vas a cortar el intestino.', cite: 'Fossum p. 440' },
                  { title: 'Ordeña.', body: 'Desplaza el quimo fuera del segmento.' },
                  { title: 'Ocluye.', body: 'Dedos del ayudante o pinzas Doyen en el intestino que queda, para que no se derrame contenido.', cite: 'Fossum p. 441' },
                  { title: 'Pinzas en el segmento enfermo.', body: 'Aplastantes o no aplastantes, solo sobre lo que se extirpa. Las aplastantes nunca sobre el tejido que queda.', cite: 'Fossum p. 416, 441' },
                  { title: 'Corta.', body: 'Con bisturí o Metzenbaum por fuera de las pinzas. Luces iguales: perpendicular (75–90°) en ambos extremos.', cite: 'Fossum p. 441' },
                  { title: 'Luces distintas.', body: 'Perpendicular en el extremo grande y oblicuo (45–60°) en el pequeño, con el borde antimesentérico más corto que el mesentérico (fig. 18.104).', cite: 'Fossum p. 441' },
                  { title: 'Limpia los bordes.', body: 'Aspira los extremos, retira restos con una gasa húmeda y recorta la mucosa evertida con Metzenbaum justo antes de suturar.', cite: 'Fossum p. 441' },
                  { title: 'Histopatología.', body: 'Envía el segmento si hay sospecha de tumor o la causa no está clara.' },
                ],
              },
            ],
          },
          {
            id: 'anastomosis',
            title: 'C. Anastomosis término-terminal con sutura',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Hilo.', body: 'PDS, Maxon o Monocryl 3-0 o 4-0, aguja ahusada o tapercut. En peritonitis, absorbible de larga duración.', cite: 'Fossum p. 441' },
                  { title: 'Punto mesentérico.', body: 'Primer punto simple de todo el espesor en el borde mesentérico: el más difícil por la grasa y el sitio más común de fuga.', cite: 'Fossum p. 443' },
                  { title: 'Punto antimesentérico.', body: 'Segundo punto a 180° del primero: divide la anastomosis en dos mitades iguales y muestra si los extremos tienen el mismo diámetro.', cite: 'Fossum p. 443' },
                  { title: 'Completa.', body: 'Puntos simples entre ambos a 2 mm del borde y 2–3 mm entre sí, con algo más de serosa que de mucosa y nudos fuera de la luz (fig. 18.101A).', cite: 'Fossum p. 441, 443' },
                  { title: 'Ajusta sin cortar.', body: 'Anudar con brusquedad o demasiada tensión corta serosa, muscular y mucosa y crea un punto aplastante (ya no recomendado).', cite: 'Fossum p. 441' },
                  { title: 'O continuo dividido.', body: 'Ata los dos puntos de sostén (mesentérico y antimesentérico) y une cada mitad con su propio continuo simple (fig. 18.106). Un continuo único alrededor del intestino hace efecto de bolsa de tabaco y estenosa.', cite: 'Fossum p. 441' },
                  { title: 'Disparidad residual.', body: 'Espacia algo más los puntos en la luz grande (fig. 18.105). Si no basta, quita una cuña de 1–2 cm de largo y 1–3 mm de ancho del borde antimesentérico del extremo pequeño (fig. 18.107).', cite: 'Fossum p. 443' },
                  { title: 'Prueba de fugas.', body: 'Ocluye a ambos lados, distiende moderadamente con salino, presiona suave y añade puntos donde filtre. Es una prueba subjetiva: con suficiente presión toda anastomosis filtra.', cite: 'Fossum p. 443' },
                  { title: 'Mesenterio.', body: 'Cierra el defecto con 4-0 absorbible monofilamento continuo o simples sin dañar las arcadas cercanas.', cite: 'Fossum p. 443' },
                  { title: 'Protege.', body: 'Omento alrededor de la anastomosis, o parche seroso si la integridad es dudosa.', cite: 'Fossum p. 443–444' },
                ],
              },
              { type: 'note', kind: 'error', title: 'No estreches la luz grande', text: 'Suturar parte de la luz dilatada para igualarla a la pequeña aumenta la estenosis cuando el intestino dilatado vuelve a su tamaño (p. 443).' },
            ],
          },
          {
            id: 'grapas',
            title: 'D. Anastomosis con grapadora',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Cuál.', body: 'La funcional término-terminal (GIA + TA) es la preferida: el estoma queda más grande que la luz original y acomoda las disparidades. Las grapas tienen más resistencia a los 7 días y la misma tasa de dehiscencia que la sutura, con unos 30 min menos de cirugía.', cite: 'Fossum p. 444' },
                  { title: 'GIA.', body: 'Reseca el segmento e introduce completamente (50 mm) la grapadora de corte lineal en ambas luces, uniendo los bordes antimesentéricos, y dispara (fig. 18.111).', cite: 'Fossum p. 444' },
                  { title: 'TA.', body: 'Separa la línea de grapas (desfasa un poco las líneas de la GIA) y cierra la boca común con la grapadora transversa; recorta lo que sobresale.', cite: 'Fossum p. 444, 447' },
                  { title: 'Punto de anclaje.', body: 'En la base de la línea de grapas, donde hay más tensión, para que no se suelten.', cite: 'Fossum p. 447' },
                  { title: 'Termina.', body: 'Cierra el mesenterio, lava, parche y cierra.' },
                ],
              },
              { type: 'note', kind: 'tip', title: 'Cuándo no grapar', text: 'Tejido grueso, inflamado o edematoso impide que las grapas formen la B; el intestino muy dilatado puede quedar demasiado fino. Evita las grapas en el colon por la estenosis (p. 444).' },
            ],
          },
          {
            id: 'parche',
            title: 'E. Parche seroso y plicatura',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Parche seroso.', body: 'Coloca el borde antimesentérico de una asa vecina sobre la sutura y fíjalo con puntos que tomen submucosa, muscular y serosa en tejido sano. Da soporte, sello de fibrina y riego; se cubre de mucosa en 8 semanas (fig. 18.112).', cite: 'Fossum p. 447' },
                  { title: 'Sobre una anastomosis.', body: 'Una asa sana perpendicular, suturada con continuo desde el borde mesentérico al antimesentérico de un lado y luego del otro, sin comprometer los vasos (fig. 18.113).', cite: 'Fossum p. 447–448' },
                  { title: 'Límite.', body: 'El parche no protegió contra la peritonitis ni la mortalidad en perros que ya tenían peritonitis séptica.', cite: 'Fossum p. 447' },
                  { title: 'Plicatura (enteroenteropexia).', body: 'Para evitar la recidiva de una intususcepción: asas en curvas suaves desde el duodeno distal al íleon distal, fijadas cada 6–10 cm con 3-0 o 4-0 que tomen submucosa, muscular y serosa; sin ángulos agudos (fig. 18.114).', cite: 'Fossum p. 448' },
                ],
              },
              { type: 'note', kind: 'book', title: 'Intususcepción', text: 'Reduce empujando el intussuscipiens más que tirando del intussusceptum, con tracción suave del cuello mientras ordeñas el ápice. Solo funciona sin adherencias firmes de fibrina. Palpa el ápice buscando masas y biopsia. Reseca si hay masa, no se reduce, el tejido no es viable o hay vasos arrancados (p. 461).' },
            ],
          },
          { id: 'cierre', title: 'F. Lavado y cierre', blocks: [{ type: 'steps', items: CLEAN_CLOSURE_STEPS }] },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Agua y comida.', body: 'Agua a las 8–12 h; comida en pequeñas cantidades a las 12–24 h si no vomita, blanda y baja en grasa 3–4 veces al día; dieta normal desde las 48–72 h. Debilitados: sonda o nutrición parenteral, con dieta elemental por sonda.', cite: 'Fossum p. 449' },
              { title: 'Líquidos y electrolitos.', body: 'Corrige hidratación, electrolitos y ácido-base hasta que coma.' },
              { title: 'Antibióticos.', body: 'Suspender a las 2–6 h salvo peritonitis.', cite: 'Fossum p. 449' },
              { title: 'Analgesia.', body: 'Opioide (hidromorfona o buprenorfina según la tabla 13.2); sin AINE ni corticoides en el postoperatorio inmediato.', cite: 'Fossum p. 449' },
              { title: 'Isquemia.', body: 'El intestino isquémico libera mediadores que causan inflamación sistémica (hígado, pulmón): monitoreo estrecho.', cite: 'Fossum p. 449' },
              { title: 'Vigila la fuga.', body: 'Decaimiento, fiebre alta, dolor abdominal, vómitos o íleo: abdominocentesis, hemograma, bioquímica, cultivo, antibiótico y exploración.', cite: 'Fossum p. 449' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Intestino corto', text: 'Si se reseca una gran longitud, el síndrome de intestino corto requiere apoyo nutricional (dieta elemental enteral al inicio, aunque haya nutrición parenteral) durante 1–2 meses para que el intestino se adapte (p. 450).' },
        ],
      },
    ],
    closure: [
      { layer: 'Vasos arcadiales y rectos', suture: 'Absorbible, grapas o sellado', gauge: '3-0', pattern: 'Doble ligadura', why: 'Solo los que irrigan el segmento que se extirpa.' },
      { layer: 'Anastomosis', suture: 'PDS, Maxon o Monocryl, aguja ahusada', gauge: '3-0 o 4-0', pattern: 'Simples a 2 mm del borde y 2–3 mm entre sí, o continuo dividido', why: 'Incluye la submucosa sin estrechar; mesentérico primero.' },
      { layer: 'Mesenterio', suture: 'Absorbible monofilamento', gauge: '4-0', pattern: 'Continuo o simples', why: 'Evita hernias internas sin comprometer las arcadas.' },
      { layer: 'Parche seroso o plicatura', suture: 'Absorbible o no absorbible monofilamento', gauge: '3-0 o 4-0', pattern: 'Continuo o simples seromusculares', why: 'Refuerza la sutura o previene la reintususcepción.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Fuga, dehiscencia y peritonitis', prevent: 'Márgenes viables, mesentérico cuidadoso, prueba de fugas, omento o parche, alimentación temprana.', manage: 'Reintervención, nueva resección, lavado, drenaje o abdomen abierto; externalización del segmento en casos seleccionados.' },
      { name: 'Estenosis', prevent: 'Corte oblicuo, cuña antimesentérica, patrones aposicionales, sin tensión, no estrechar la luz grande.', manage: 'Nueva resección.' },
      { name: 'Síndrome de intestino corto', prevent: 'Resecar solo lo necesario.', manage: 'Nutrición enteral y parenteral 1–2 meses, comidas frecuentes, vitaminas.' },
      { name: 'Íleo', prevent: 'Manipulación suave, alimentación y movilidad tempranas.', manage: 'Procinéticos, corregir el potasio.' },
      { name: 'Recidiva de intususcepción', prevent: 'Tratar la causa (enteritis, parásitos), plicatura.', manage: 'Nueva cirugía.' },
    ],
    quiz: [
      { q: '¿Cómo valoras la viabilidad de un asa?', a: 'Color rosado a rojo, pared firme, peristaltismo, pulso arterial y sangrado al incidir; si dudas, se reseca.' },
      { q: '¿Cómo igualas dos luces de distinto diámetro?', a: 'Corte perpendicular en la grande y oblicuo (45–60°) en la pequeña con el borde antimesentérico más corto; espaciar más los puntos en la grande; y si no basta, una cuña antimesentérica en la pequeña.' },
      { q: '¿Por qué el primer punto va en el borde mesentérico?', a: 'Porque es el más difícil por la grasa y el sitio más común de fuga.' },
      { q: '¿Por qué no se hace un continuo único alrededor del intestino?', a: 'Porque hace efecto de bolsa de tabaco y estenosa; se usa un continuo dividido en dos mitades.' },
      { q: '¿Qué anastomosis con grapas se prefiere y por qué?', a: 'La funcional término-terminal con GIA y TA, porque el estoma queda más grande que la luz original y acomoda las disparidades.' },
      { q: '¿Para qué sirve la plicatura y cómo se hace?', a: 'Para evitar la recidiva de la intususcepción: asas en curvas suaves fijadas cada 6–10 cm con puntos seromusculares, sin ángulos agudos.' },
    ],
    videos: [
      { title: 'Intestinal resection and anastomosis', url: 'https://www.youtube.com/watch?v=ZzEdo43ZSxM', channel: 'Stanley Kim', lang: 'inglés', note: 'En modelo sintético, muy didáctico' },
      { title: 'Anastomosis intestinal con Monosyn', url: 'https://www.youtube.com/watch?v=bQJ_85GjTIA', channel: 'B. Braun VetCare ES', lang: 'español', note: 'Con un cirujano diplomado ECVS' },
    ],
    sources: [
      SOURCES.fossum(18, 'cirugía del sistema digestivo: intestino delgado, resección y anastomosis, grapas, parche seroso, plicatura, cicatrización y complicaciones (pp. 433–455), intususcepción (pp. 458–462)'),
      SOURCES.fossum(19, 'cirugía de la cavidad abdominal: celiotomía, exploración y cierre (pp. 514–518)'),
      SOURCES.plumbs,
    ],
  },
};
