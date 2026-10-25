// Ovariohisterectomía (id 1). Pilot guide: full depth, the level of the reference study guide.
// Sources at chapter level only; doses checked against Plumb's. Draft until the vet reviews it.
module.exports = {
  id: 1,
  legacy: {
    indicaciones: 'Esterilización electiva; prevención de tumores mamarios, piómetra y tumores ováricos o uterinos; piómetra; hiperplasia o prolapso vaginal; torsión o prolapso uterino; enfermedades que el celo descompensa (diabetes mellitus, epilepsia).',
    tecnica_quirurgica: 'Celiotomía por línea media (en la perra, tercio craneal del abdomen caudal). Localización del cuerno con gancho, estiramiento o ruptura del ligamento suspensorio, ventana en el ligamento ancho. Técnica de las tres pinzas en cada pedículo ovárico con ligadura circunferencial más transfixiante. Ligadura del ligamento ancho si está vascularizado. Cuerpo uterino ligado craneal al cérvix con dos ligaduras (circunferencial y transfixiante). Revisión de muñones, conteo de gasas y cierre en tres capas: vaina externa del recto, subcutáneo y piel.',
    material_quirurgico: 'Mango de bisturí n.º 3 con hoja 10 o 15, tijeras de Mayo y Metzenbaum, pinzas Adson o Brown-Adson, portaagujas Mayo-Hegar, gancho de OVH (Snook o Covault), pinzas Rochester-Carmalt, Kelly y Mosquito, pinzas de campo Backhaus, separador (Gelpi o Balfour en perras grandes), gasas con marcador radiopaco.',
    tipo_sutura: 'Pedículos y cuerpo uterino: absorbible monofilamento (PDS, Monocryl) 3-0 a 0 según el tamaño. Línea alba: PDS 2-0 a 1 según el peso, continuo simple. Subcutáneo: Monocryl 3-0 o 4-0. Piel: intradérmico 4-0 absorbible o nylon 3-0 interrumpido.',
    complicaciones_frecuentes: 'Hemorragia del pedículo ovárico o de los vasos uterinos; síndrome de ovario remanente; piómetra del muñón; ligadura accidental del uréter; granulomas o fístulas por hilo no absorbible; reacción de la herida, seroma y dehiscencia; incontinencia urinaria (más en perras grandes).',
    manejo_anestesico_sugerido: 'Premedicación con opioide agonista puro (metadona 0,2–0,3 mg/kg IM) ± dexmedetomidina 2–5 µg/kg IM o acepromacina 0,01–0,03 mg/kg IM. Inducción: propofol 2–4 mg/kg IV titulado o alfaxalona 1–2 mg/kg IV. Mantenimiento: isoflurano o sevoflurano en O2. Bloqueo incisional y lidocaína o bupivacaína intraperitoneal. AINE al final si está normotensa e hidratada (meloxicam 0,2 mg/kg SC).',
    consideraciones_por_raza: 'Braquicéfalas: preoxigenar, intubar rápido y extubar tarde, vigilar la vía aérea en la recuperación. Razas grandes y gigantes: valorar gastropexia preventiva en la misma cirugía y discutir la edad de esterilización (riesgo ortopédico e incontinencia). Galgos y lebreles: dosis bajas de propofol, recuperación más lenta con tiopental (evitarlo).',
    consideraciones_comorbilidades: 'Obesidad: pedículos con mucha grasa, ampliar la incisión y ligar por partes si hace falta. Celo o preñez: vasos más grandes y friables, mejor operar en anestro. Piómetra: estabilizar con fluidoterapia y antibiótico, manipular el útero sin romperlo. Geriátricas: perfil renal y hepático antes de anestesiar. Coagulopatías: tiempo de coagulación y plaquetas antes.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 26, pp. 725–732 y 744–745; cap. 19, pp. 516–518; Plumb\'s Veterinary Drug Handbook; AAHA 2020 Anesthesia and Monitoring Guidelines.',
  },
  guide: {
    draft: true,
    lede: 'Extirpación de ambos ovarios y del útero hasta craneal al cérvix, con ligaduras seguras en los pedículos y en el cuerpo uterino. Es la cirugía abdominal más frecuente de la clínica: lo difícil no es la técnica, es no tener nunca un pedículo que se suelte.',
    meta: { species: ['perro', 'gato'], duration: '30–60 min', difficulty: 'básica', contamination: 'limpia' },
    before_you_start: [
      'Vacía la vejiga antes de entrar: una vejiga llena estorba la exposición y lleva los uréteres hacia la zona de ligadura.',
      'En la perra, incide justo caudal al ombligo (tercio craneal del abdomen caudal); más caudal cuesta mucho exteriorizar los ovarios.',
      'Antes de cortar un pedículo, confirma que la ligadura asentó en el surco de la pinza y deja una pinza sobre el muñón hasta revisarlo.',
      'Liga con absorbible monofilamento; nunca dejes multifilamento no absorbible enterrado (seda, Supramid).',
      'Cuenta las gasas al abrir y antes de cerrar. La capa que sostiene el cierre es la vaina externa del recto.',
    ],
    indications: [
      'Esterilización electiva en hembras que no se van a reproducir.',
      'Prevención de tumores mamarios: el riesgo es mucho menor si se esteriliza antes del primer o segundo celo.',
      'Piómetra, metritis, torsión o prolapso uterino.',
      'Tumores ováricos, uterinos o vaginales; hiperplasia y prolapso vaginal.',
      'Enfermedades que el celo descompensa: diabetes mellitus, epilepsia, demodicosis generalizada.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Ayuno.', body: 'En adultas sanas, 4–6 h de sólidos según las guías de anestesia actuales; el agua se deja hasta la premedicación. En cachorras de menos de 8 semanas o de menos de 2 kg, 1–2 h como máximo, por el riesgo de hipoglucemia.', cite: 'AAHA 2020' },
              { title: 'Evaluación.', body: 'Examen físico completo. Hematocrito, proteínas totales y glucosa como mínimo; desde los 7 años suma perfil renal y hepático. En razas con riesgo, tiempo de coagulación.' },
              { title: 'Momento del ciclo.', body: 'Opera en anestro. Durante el celo o la preñez los vasos son más grandes y friables y el ligamento ancho sangra más; si no hay urgencia, espera 2–3 meses después del celo.', cite: 'Fossum p. 730, 744' },
              { title: 'Antibióticos.', body: 'No hacen falta en la OVH electiva. Úsalos solo si hay piómetra o metritis, o si se rompe la técnica aséptica.', cite: 'Fossum p. 744' },
              { title: 'Vejiga.', body: 'Pásala a orinar antes de la inducción o exprímela con suavidad ya anestesiada.', cite: 'Fossum p. 728' },
              {
                title: 'Campo.',
                body: 'Rasura y prepara el abdomen ventral desde el xifoides hasta el pubis, y lateral hasta las mamas. Decúbito dorsal con los miembros sujetos.',
              },
              { title: 'Conteo.', body: 'Cuenta las gasas antes de incidir; usa gasas con marcador radiopaco.', cite: 'Fossum p. 516' },
            ],
          },
          {
            type: 'defs',
            items: [
              { tag: 'Instrumental', title: 'Mesa básica', text: 'Mango n.º 3 con hoja 10 o 15, tijeras de Mayo y Metzenbaum, pinzas Adson o Brown-Adson, portaagujas Mayo-Hegar, gancho de OVH (Snook o Covault), pinzas Rochester-Carmalt, Kelly y Mosquito, pinzas Backhaus.' },
              { tag: 'Opcional', title: 'Perras grandes u obesas', text: 'Separador de Gelpi o Balfour, pinzas Rochester-Carmalt largas, sellador de vasos si está disponible.' },
            ],
          },
          {
            type: 'note',
            kind: 'book',
            title: 'Edad de esterilización',
            bullets: [
              'La gonadectomía temprana es segura desde las 7–8 semanas con un protocolo pediátrico (tejidos friables, ligaduras 3-0 a 5-0, control de hipotermia e hipoglucemia).',
              'En razas grandes, la esterilización antes del cierre de las fisis se asocia a más problemas ortopédicos e incontinencia urinaria: discute la edad con el tutor caso a caso.',
            ],
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'La tracción del ligamento suspensorio y del pedículo es el momento más doloroso: por eso se usa un opioide agonista puro y analgesia local, no solo un sedante.',
        blocks: [
          {
            type: 'drugs',
            items: [
              { phase: 'Premedicación', drug: 'Metadona', dose: '0,2–0,3 mg/kg', route: 'IM o IV', note: 'Opioide de elección. En gatas, 0,2 mg/kg.' },
              { phase: 'Premedicación', drug: 'Dexmedetomidina', dose: '0,002–0,005 mg/kg', route: 'IM', note: 'Equivale a 2–5 µg/kg. Solo en pacientes sanas (ASA I–II).' },
              { phase: 'Premedicación', drug: 'Acepromacina', dose: '0,01–0,03 mg/kg', route: 'IM', note: 'Alternativa a la dexmedetomidina; evitar en hipovolemia.' },
              { phase: 'Inducción', drug: 'Propofol', dose: '2–4 mg/kg', route: 'IV lento, a efecto', note: 'Sin premedicación hace falta hasta 6 mg/kg.' },
              { phase: 'Inducción', drug: 'Alfaxalona', dose: '1–2 mg/kg', route: 'IV lento, a efecto' },
              { phase: 'Mantenimiento', drug: 'Isoflurano', dose: '1,5–2 % en O2', route: 'Inhalatoria', note: 'Ajustar a la profundidad; baja con buena analgesia local.' },
              { phase: 'Local', drug: 'Lidocaína', dose: '2 mg/kg (máximo)', route: 'Incisional e intraperitoneal', note: 'En gatas, máximo 1 mg/kg.' },
              { phase: 'Local', drug: 'Bupivacaína', dose: '1–2 mg/kg (máximo)', route: 'Incisional e intraperitoneal', note: 'En gatas, máximo 1 mg/kg. Nunca IV.' },
              { phase: 'Postoperatorio', drug: 'Meloxicam', dose: '0,2 mg/kg', route: 'SC, una vez', note: 'Luego 0,1 mg/kg VO cada 24 h. En gatas, 0,05–0,1 mg/kg dosis única. Solo si está normotensa e hidratada.' },
              { phase: 'Postoperatorio', drug: 'Carprofeno', dose: '4 mg/kg', route: 'SC o VO, cada 24 h', note: 'Solo perras.' },
              { phase: 'Postoperatorio', drug: 'Buprenorfina', dose: '0,01–0,02 mg/kg', route: 'IV, IM o transmucosa (gatas)', note: 'Cada 6–8 h si la escala de dolor lo indica.' },
            ],
          },
          {
            type: 'note',
            kind: 'why',
            title: 'Por qué analgesia local',
            text: 'El bloqueo incisional y la lidocaína o bupivacaína instilada sobre los pedículos o en la cavidad disminuyen el dolor postoperatorio y la necesidad de anestésico inhalatorio. Es barato y basta una jeringa.',
          },
          {
            type: 'note',
            kind: 'error',
            title: 'Errores frecuentes',
            bullets: [
              'Usar butorfanol como único analgésico: dura menos de 1–2 h y no cubre el dolor visceral de la OVH.',
              'Usar tramadol como analgésico principal en perras: su efecto es poco fiable en esta especie.',
              'Dar el AINE antes de corregir una hipotensión intraoperatoria.',
            ],
          },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          {
            type: 'list',
            items: [
              'Ovarios: dentro de la bolsa ovárica, justo caudal al polo caudal de cada riñón. El derecho es más craneal, dorsal al duodeno descendente; el izquierdo, dorsal al colon descendente y lateral al bazo.',
              'Ligamento suspensorio: banda blanca y tensa que va del ovario a la pared, a nivel de las últimas dos costillas (p. 726). Es lo que se estira o se rompe para exteriorizar el ovario.',
              'Pedículo ovárico (mesovario): arteria y vena ováricas, de trayecto tortuoso, y una cantidad variable de grasa. La perra tiene mucha más grasa que la gata, por eso cuesta más ver los vasos (p. 726).',
              'Drenaje venoso: la vena ovárica izquierda drena en la vena renal izquierda y la derecha en la cava caudal; la arteria nace de la aorta. Un pedículo suelto sangra mucho y rápido (p. 726).',
              'Ligamento ancho (mesometrio): suspende el útero. En su borde libre corre el ligamento redondo hasta el canal inguinal; con mucha grasa, sus vasos se ligan (p. 726).',
              'Útero: cuerpo corto y cuernos largos. Las arterias y venas uterinas corren a cada lado del cuerpo. El cérvix es la porción caudal, más gruesa y firme (p. 726).',
              'Uréter: pasa dorsal al pedículo, cerca del polo caudal del riñón, y junto al cuerpo uterino cerca del trígono. Es lo que pones en riesgo si pinzas a ciegas (p. 744).',
            ],
          },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        intro: 'Primero el lado izquierdo (el ovario derecho es más craneal y profundo), luego el derecho, luego el cuerpo uterino.',
        blocks: [],
        subsections: [
          {
            id: 'abordaje',
            title: 'A. Abordaje: celiotomía por línea media',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Ubica la incisión.', body: 'Divide mentalmente el abdomen caudal (del ombligo al pubis) en tercios. En la perra, incide en el tercio craneal, justo caudal al ombligo.', bullets: ['En perras de tórax profundo o con útero grande, amplía hacia craneal o caudal para no traccionar de más.', 'En cachorras prepúberes, el tercio medio facilita ligar el cuerpo uterino.'], cite: 'Fossum p. 729–730' },
                  { title: 'Piel y subcutáneo.', body: 'Incisión de 4–8 cm con hoja 10 de un solo trazo. Sigue por el subcutáneo hasta ver la línea alba, una banda blanca brillante entre los rectos. Controla los sangrados pequeños con presión o electrocauterio.', cite: 'Fossum p. 730' },
                  { title: 'Despeja la fascia.', body: 'Limpia unos milímetros de grasa a cada lado de la línea alba: tendrás que ver la vaina externa del recto para el cierre.' },
                  { title: 'Entra a la cavidad.', body: 'Toma la línea alba con pinza de dientes, levántala en tienda y haz una incisión punzante con el filo hacia arriba. Palpa por dentro buscando adherencias.', cite: 'Fossum p. 730' },
                  { title: 'Amplía.', body: 'Con tijera de Mayo, extiende hacia craneal y caudal protegiendo las vísceras con los dedos por debajo.', cite: 'Fossum p. 730' },
                ],
              },
              {
                type: 'note',
                kind: 'why',
                title: 'Por qué justo caudal al ombligo',
                text: 'Los ovarios de la perra están altos y profundos, sujetos por el ligamento suspensorio. La incisión craneal te deja trabajar encima de los pedículos, que es donde está el riesgo de hemorragia. En la gata es al revés: lo difícil es el cuerpo uterino, que es más caudal.',
              },
            ],
          },
          {
            id: 'pediculo',
            title: 'B. Cuerno uterino y pedículo ovárico',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Introduce el gancho.', body: 'Levanta la pared abdominal izquierda tomando la vaina externa con una pinza. Desliza el gancho con la punta contra la pared, 2–3 cm caudal al riñón.', cite: 'Fossum p. 730' },
                  { title: 'Engancha y eleva.', body: 'Gira el gancho hacia medial para tomar el cuerno uterino, el ligamento ancho o el redondo, y elévalo con suavidad.', cite: 'Fossum p. 730' },
                  { title: 'Confirma que es útero.', body: 'Síguelo hasta la bifurcación o hasta el ovario. Puedes haber enganchado intestino delgado, uréter o solo el ligamento redondo.', bullets: ['Si no aparece, retroflexiona la vejiga: el cuerpo uterino está entre la vejiga y el colon.'], cite: 'Fossum p. 730' },
                  { title: 'Identifica el ligamento suspensorio.', body: 'Con tracción caudal y medial del cuerno, palpa la banda tensa en el borde craneal del pedículo.', cite: 'Fossum p. 730' },
                  { title: 'Estíralo o rómpelo.', body: 'Con el índice, tracciona el ligamento hacia caudolateral, cerca del riñón, mientras mantienes el cuerno hacia caudomedial. Rómpelo o estíralo sin desgarrar los vasos ováricos. El ovario debe llegar a la herida sin tensión.', cite: 'Fossum p. 730' },
                  { title: 'Abre una ventana en el ligamento ancho.', body: 'Caudal al pedículo, en la zona sin vasos, con el dedo o la punta de una pinza. El pedículo queda aislado para pinzarlo.', cite: 'Fossum p. 730' },
                ],
              },
              {
                type: 'note',
                kind: 'tip',
                title: 'Si el ligamento no cede',
                text: 'En perras grandes u obesas, en vez de forzar con el dedo, pinza y corta el ligamento suspensorio con tijera cerca del ovario, o amplía la incisión hacia craneal. Desgarrar el pedículo es peor que una incisión 2 cm más larga.',
              },
            ],
          },
          {
            id: 'tres-pinzas',
            title: 'C. Técnica de las tres pinzas y ligadura del pedículo',
            blocks: [
              { type: 'figure', key: 'ovh-three-clamps', caption: 'Se retira la pinza 1 y en el surco que deja se coloca la primera ligadura. La segunda va proximal a ella. Se corta entre la pinza 2 y la 3.' },
              {
                type: 'steps',
                items: [
                  { title: 'Coloca las pinzas.', body: 'Pon tres pinzas (Rochester-Carmalt, Kelly o Mosquito según el tamaño) atravesando el pedículo, proximales al ovario.', bullets: ['Pinza proximal: aplasta el tejido y deja un surco donde asienta la ligadura.', 'Pinza media: sostiene el pedículo mientras ligas.', 'Pinza distal: junto al ovario, evita el reflujo de sangre al cortar.'], cite: 'Fossum p. 730' },
                  { title: 'Primera ligadura en el surco.', body: 'Retira la pinza proximal y coloca una ligadura circunferencial con nudo de fricción (Miller o estrangulador) exactamente en el surco. Ajusta mientras tu ayudante abre la pinza poco a poco, si la dejas.', cite: 'Fossum p. 729–730' },
                  { title: 'Segunda ligadura.', body: 'Coloca una ligadura transfixiante (en 8) o una segunda circunferencial entre la primera y la pinza media. La transfixiante no puede deslizarse del muñón.', bullets: ['Pasa la aguja por el centro del pedículo, en una zona sin vasos visibles, para no pincharlos.'], cite: 'Fossum p. 730' },
                  { title: 'Corta.', body: 'Corta entre la pinza media y la distal, dejando 3–5 mm de muñón sobre la pinza media.', cite: 'Fossum p. 730' },
                  { title: 'Revisa el muñón.', body: 'Toma el borde del muñón con una pinza de disección, abre la pinza media y observa durante unos segundos. Si sangra, vuelve a pinzar proximal y liga de nuevo.', cite: 'Fossum p. 730' },
                  { title: 'Suelta con control.', body: 'Devuelve el muñón a la cavidad sosteniéndolo con la pinza hasta el final; nunca lo sueltes desde la pinza cerrada.', cite: 'Fossum p. 730' },
                ],
              },
              {
                type: 'table',
                columns: ['Paciente', 'Pedículo ovárico', 'Cuerpo uterino'],
                rows: [
                  ['Gata y perra de menos de 10 kg', '3-0', '3-0'],
                  ['Perra de 10 a 25 kg', '2-0', '2-0'],
                  ['Perra de más de 25 kg', '0 o 2-0', '0'],
                  ['Cachorras', '3-0 a 4-0', '3-0 a 4-0'],
                ],
                caption: 'Calibre orientativo de las ligaduras con absorbible monofilamento (PDS, Monocryl).',
              },
              {
                type: 'note',
                kind: 'error',
                title: 'Si el pedículo se suelta',
                bullets: [
                  'No pinces a ciegas en un charco de sangre: puedes tomar el uréter.',
                  'Amplía la incisión hacia craneal, retrae el duodeno (lado derecho) o el colon descendente (lado izquierdo) hacia medial: el mesoduodeno o el mesocolon funcionan como separador y dejan ver el riñón y el pedículo.',
                  'Comprime con una gasa mientras aspiras, localiza el vaso y pínzalo bajo visión directa.',
                ],
              },
              {
                type: 'note',
                kind: 'book',
                title: 'Nudos',
                text: 'Los nudos de fricción de primera lazada (Miller, estrangulador) resisten presiones mucho mayores que el nudo de cirujano, que puede filtrar a presión arterial normal. Termina siempre con lazadas cuadradas: 3–4 con monofilamento.',
              },
              {
                type: 'steps',
                items: [
                  { title: 'Nudo de Miller: primera vuelta.', body: 'Pasa el hilo alrededor del pedículo y haz un medio nudo, con un cabo corto y otro largo.', cite: 'Fossum p. 729 (fig. 26.4A)' },
                  { title: 'Reserva el espacio.', body: 'Pon el índice, palma arriba, entre el cabo largo y la ligadura.', cite: 'Fossum p. 729 (fig. 26.4B)' },
                  { title: 'Segunda vuelta.', body: 'Con el portaagujas, lleva el cabo largo alrededor del pedículo una segunda vez.', cite: 'Fossum p. 729 (fig. 26.4B)' },
                  { title: 'Pasa el cabo.', body: 'Mételo por el espacio que reservaba tu dedo y ajusta: la vuelta de arriba comprime a las de abajo.', cite: 'Fossum p. 729 (fig. 26.4C)' },
                  { title: 'Asegura.', body: 'Termina con lazadas cuadradas.', cite: 'Fossum p. 729 (fig. 26.4C)' },
                ],
              },
            ],
          },
          {
            id: 'utero',
            title: 'D. Ligamento ancho y cuerpo uterino',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Repite en el lado derecho.', body: 'El ovario derecho es más craneal: suele hacer falta más incisión o más tracción. Misma técnica.', cite: 'Fossum p. 730' },
                  { title: 'Ligamento ancho.', body: 'Si tiene vasos o grasa visibles (celo, obesidad, perra adulta), lígalo o pínzalo en bloque y córtalo. Si está delgado y sin vasos, puede romperse con los dedos.', cite: 'Fossum p. 726, 730' },
                  { title: 'Exterioriza el cuerpo uterino.', body: 'Tracciona los cuernos hacia craneal para ver el cuerpo y el cérvix.', cite: 'Fossum p. 730' },
                  { title: 'Liga los vasos uterinos.', body: 'En perras medianas y grandes, liga las arterias y venas uterinas por separado a cada lado del cuerpo, con una transfixiante que pase por la pared del útero, antes de la ligadura del cuerpo.', cite: 'Fossum p. 730' },
                  { title: 'Liga el cuerpo.', body: 'Craneal al cérvix, coloca una ligadura circunferencial y, craneal a ella, una transfixiante (o en 8). En perras grandes, una pinza proximal y la técnica de las tres pinzas igual que en el pedículo.', cite: 'Fossum p. 730' },
                  { title: 'Corta y revisa.', body: 'Corta craneal a las ligaduras dejando muñón. Revisa que no sangre antes de devolverlo.', cite: 'Fossum p. 730' },
                ],
              },
              {
                type: 'note',
                kind: 'why',
                title: 'Por qué craneal al cérvix y no sobre él',
                text: 'Dejar todo el tejido uterino posible fuera disminuye el riesgo de piómetra del muñón, pero ligar sobre o caudal al cérvix arriesga los uréteres y entra en la vagina, que está contaminada.',
              },
            ],
          },
          {
            id: 'revision',
            title: 'E. Revisión antes de cerrar',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Mira los tres muñones.', body: 'Ambos pedículos y el cuerpo uterino. Busca sangrado en el ligamento ancho.', cite: 'Fossum p. 744' },
                  { title: 'Revisa la pieza.', body: 'Confirma que cada ovario salió completo: abre la bolsa ovárica y busca el tejido ovárico. Un fragmento olvidado causa el síndrome de ovario remanente.', cite: 'Fossum p. 730, 745' },
                  { title: 'Cuenta las gasas.', body: 'Mismo número que al abrir.', cite: 'Fossum p. 517' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'cierre',
        title: 'Cierre por capas',
        intro: 'La capa que sostiene es la vaina externa del músculo recto. El peritoneo no se sutura por separado y la grasa subcutánea no aporta resistencia.',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Línea alba.', body: 'Continuo simple con absorbible monofilamento de larga duración (PDS). Cada pasada toma 5–10 mm de la vaina externa del recto a cada lado, separadas 5–10 mm. No incluyas grasa.', bullets: ['Inicio: 5 lazadas. Final, contra el último asa: 6–7 lazadas.'], cite: 'Fossum p. 517–518' },
              { title: 'Subcutáneo.', body: 'Continuo simple con Monocryl 3-0 o 4-0 para cerrar el espacio muerto, tomando a ratos la fascia de abajo.', cite: 'Fossum p. 518' },
              { title: 'Piel.', body: 'Intradérmico con 4-0 absorbible (no hay que retirar puntos) o puntos simples o en X con nylon 3-0, a retirar a los 10–14 días.', cite: 'Fossum p. 518' },
            ],
          },
          { type: 'note', kind: 'error', title: 'Qué no usar en la línea alba', text: 'Catgut en patrón continuo (se afloja y se absorbe de forma impredecible) ni monofilamento no absorbible (senos de sutura).' },
        ],
      },
      {
        id: 'gata',
        title: 'En la gata, en cachorras y la ovariectomía',
        blocks: [
          {
            type: 'defs',
            items: [
              { tag: 'Gata', title: 'Incisión más caudal', text: 'Incide en el tercio medio del abdomen caudal: el ligamento suspensorio es laxo y los ovarios salen fácil; lo difícil es el cuerpo uterino. Hay poca grasa y los vasos se ven bien. Ligaduras 3-0.' },
              { tag: 'Cachorras', title: 'Tejidos friables', text: 'Manipulación mínima, ligaduras 3-0 a 4-0, a veces basta una ligadura por pedículo. Abrigo activo e incisión corta: la hipotermia y la hipoglucemia son el riesgo real.' },
              { tag: 'Alternativa', title: 'Ovariectomía (OVE)', text: 'Extirpa solo los ovarios y deja el útero. En hembras sanas, los resultados a largo plazo son equivalentes a la OVH, con una incisión más corta. No sirve si hay enfermedad uterina.' },
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
              { title: 'Recuperación.', body: 'Temperatura, color de mucosas y escala de dolor (Glasgow abreviada en perras, Feline Grimace Scale en gatas) cada 15–30 min hasta que se pare.' },
              { title: 'Analgesia en casa.', body: 'AINE 3–5 días. Explica al tutor los signos de dolor.' },
              { title: 'Herida.', body: 'Collar isabelino o body hasta el control. Revisión a los 10–14 días (retiro de puntos si son externos).', cite: 'Fossum p. 744' },
              { title: 'Reposo.', body: 'Paseos con correa, sin saltar ni correr, 10–14 días.', cite: 'Fossum p. 744' },
              { title: 'Alimentación.', body: 'Comida en pequeña cantidad esa noche. La esterilización baja las necesidades energéticas: ajusta la ración desde el control para evitar el sobrepeso.', cite: 'Fossum p. 744–745' },
            ],
          },
          {
            type: 'note',
            kind: 'tip',
            title: 'Para el tutor',
            text: 'Avisar de inmediato si hay mucosas pálidas, abdomen distendido, decaimiento marcado, herida que supura o se abre, o si deja de comer más de 24 h.',
          },
        ],
      },
    ],
    closure: [
      { layer: 'Pedículos ováricos', suture: 'PDS o Monocryl', gauge: '3-0 a 0', pattern: 'Circunferencial con nudo de Miller + transfixiante', why: 'Dos ligaduras: si una falla, la otra sostiene. La transfixiante no se desliza.' },
      { layer: 'Cuerpo uterino', suture: 'PDS o Monocryl', gauge: '3-0 a 0', pattern: 'Circunferencial + transfixiante, craneal al cérvix', why: 'Vasos uterinos grandes; sin entrar en la vagina ni acercarse al uréter.' },
      { layer: 'Línea alba (vaina externa del recto)', suture: 'PDS', gauge: 'Gata y <10 kg: 3-0 a 2-0 · 10–25 kg: 2-0 a 0 · >25 kg: 0 a 1', pattern: 'Continuo simple', why: 'Es la capa que sostiene; absorbible de larga duración porque la fascia tarda en recuperar fuerza.' },
      { layer: 'Subcutáneo', suture: 'Monocryl', gauge: '3-0 o 4-0', pattern: 'Continuo simple', why: 'Cierra el espacio muerto y disminuye el seroma.' },
      { layer: 'Piel', suture: 'Monocryl (intradérmico) o nylon', gauge: '4-0 o 3-0', pattern: 'Intradérmico, o simples o en X', why: 'El intradérmico evita retirar puntos y que la paciente se los arranque.' },
    ],
    complications: [
      { name: 'Hemorragia del pedículo ovárico', prevent: 'Ligadura en el surco de la pinza, nudo de fricción, revisar el muñón antes de soltarlo.', manage: 'Ampliar la incisión, exponer con el mesoduodeno o el mesocolon, pinzar bajo visión directa. Si es postoperatoria y la paciente se descompensa, reintervenir.' },
      { name: 'Hemorragia de los vasos uterinos o del ligamento ancho', prevent: 'Ligar los vasos uterinos por separado en perras grandes; ligar el ligamento ancho si está vascularizado.', manage: 'Igual que el pedículo; revisar ambos lados del cuerpo uterino.' },
      { name: 'Síndrome de ovario remanente', prevent: 'Exteriorizar bien el ovario y revisar la pieza antes de cerrar.', manage: 'Confirmar con citología vaginal en celo o con hormonas; laparotomía exploratoria en celo, cuando el tejido es más visible.' },
      { name: 'Piómetra del muñón', prevent: 'Retirar todo el tejido ovárico y ligar craneal al cérvix.', manage: 'Resección del muñón; estabilización previa.' },
      { name: 'Ligadura del uréter', prevent: 'Vejiga vacía, no pinzar a ciegas, ligar craneal al cérvix.', manage: 'Ecografía si hay hidronefrosis; retirar la ligadura o reimplantar el uréter.' },
      { name: 'Granulomas y fístulas', prevent: 'Ligaduras absorbibles; nunca multifilamento no absorbible.', manage: 'Extraer el hilo; resección del trayecto fistuloso.' },
      { name: 'Seroma, reacción de la herida, dehiscencia', prevent: 'Cerrar la vaina externa con buena toma, cerrar el espacio muerto, collar isabelino, reposo.', manage: 'Seroma: compresión y esperar. Dehiscencia de la línea alba: cirugía de urgencia.' },
      { name: 'Incontinencia urinaria', prevent: 'Discutir la edad de esterilización en razas grandes.', manage: 'Fenilpropanolamina o estriol, según el caso.' },
    ],
    quiz: [
      { q: '¿Por qué en la perra se incide justo caudal al ombligo y en la gata más caudal?', a: 'En la perra lo difícil son los ovarios, altos y fijados por el ligamento suspensorio; en la gata el ligamento es laxo y lo difícil es el cuerpo uterino, más caudal.' },
      { q: '¿Para qué sirve cada una de las tres pinzas?', a: 'La proximal deja el surco donde asienta la ligadura, la media sostiene el pedículo mientras ligas y la distal evita el reflujo de sangre desde el útero al cortar.' },
      { q: '¿Qué haces si se suelta el pedículo izquierdo?', a: 'No pinzar a ciegas. Ampliar la incisión, retraer el colon descendente hacia medial con su mesocolon para exponer el riñón y el pedículo, comprimir, aspirar y pinzar bajo visión directa.' },
      { q: '¿Qué capa sostiene el cierre de la pared y con qué hilo se cierra?', a: 'La vaina externa del recto, con absorbible monofilamento de larga duración (PDS) en continuo simple, con el calibre según el peso.' },
      { q: '¿Por qué no se usa seda ni Supramid en las ligaduras?', a: 'Porque el multifilamento no absorbible enterrado forma granulomas y fístulas que no curan hasta retirar el hilo.' },
      { q: '¿Cuándo se ligan los vasos uterinos por separado?', a: 'En perras medianas y grandes, o con el útero aumentado de tamaño, antes de la ligadura del cuerpo.' },
    ],
    videos: [
      { title: 'How to perform a dog spay surgery (ovariohysterectomy)', url: 'https://www.youtube.com/watch?v=i27OAjuxH9E', channel: 'WVS Academy', lang: 'inglés', note: 'Técnica completa con consejos de seguridad' },
      { title: 'Ovariohisterectomía en hembras caninas', url: 'https://www.youtube.com/watch?v=TSqyKDToXMo', channel: 'Universidad CES', lang: 'español', note: 'Video académico de facultad' },
      { title: 'Ovariohisterectomía en perra (castración)', url: 'https://www.youtube.com/watch?v=sonTD6f310k', channel: 'Cirugía Veterinaria Susana J. & Fernando M.', lang: 'español' },
      { title: 'Dog Spay Surgery Step-by-Step', url: 'https://www.youtube.com/watch?v=Q27waY5JLUY', channel: 'The London Vet', lang: 'inglés', note: 'Paso a paso narrado' },
      { title: 'How to tie a Miller\'s Knot', url: 'https://www.youtube.com/watch?v=HOkL5ixD0DU', channel: 'Obi Veterinary Education', lang: 'inglés', note: 'El nudo de Miller de cerca' },
    ],
    sources: [
      { text: 'Fossum TW. Small Animal Surgery, 5.ª ed. Elsevier, 2019. Cap. 26, cirugía de los aparatos reproductor y genital: anatomía, OVH y OVE (pp. 725–732), postoperatorio y complicaciones (pp. 744–745).', kind: 'libro' },
      { text: 'Fossum TW. Small Animal Surgery, 5.ª ed. Cap. 19 (cavidad abdominal, pp. 516–518) y cap. 8 (biomateriales, sutura y hemostasia).', kind: 'libro' },
      { text: 'Leitch BJ y col. Seguridad de nudos de ligadura en un modelo de pedículo vascular. Veterinary Surgery, 2012.', kind: 'complemento' },
      { text: 'Rosin E, Robinson GM. Seguridad de nudos con polidioxanona. Veterinary Surgery, 1989.', kind: 'complemento' },
      { text: 'Van Goethem B y col. Ovariectomía versus ovariohisterectomía en la perra: revisión. Veterinary Surgery, 2006.', kind: 'complemento' },
      { text: 'Grubb T y col. AAHA Anesthesia and Monitoring Guidelines for Dogs and Cats, 2020.', kind: 'complemento' },
      { text: 'Monteiro B y col. WSAVA Guidelines for the Recognition, Assessment and Treatment of Pain, 2022.', kind: 'complemento' },
      { text: 'Plumb\'s Veterinary Drug Handbook (dosis).', kind: 'complemento' },
    ],
  },
};
