// Orquiectomía (id 2). Full depth: canine prescrotal (open and closed) and feline scrotal.
module.exports = {
  id: 2,
  legacy: {
    indicaciones: 'Esterilización electiva; hiperplasia prostática benigna, prostatitis y quistes prostáticos; tumores testiculares; criptorquidia; orquitis o epididimitis; traumatismo testicular; hernia perineal o adenoma perianal dependientes de andrógenos; conductas dependientes de andrógenos.',
    tecnica_quirurgica: 'Perro: incisión prescrotal en la línea media, desplazando un testículo hacia ella. Técnica abierta (se incide la túnica vaginal parietal y se ligan por separado los vasos y el conducto deferente) o cerrada (la túnica queda intacta y se liga el cordón completo). Tres pinzas y doble ligadura, revisión del muñón y cierre de subcutáneo e intradérmico. Gato: dos incisiones escrotales y ligadura del cordón consigo mismo o con hilo; las heridas se dejan cicatrizar por segunda intención.',
    material_quirurgico: 'Mango de bisturí n.º 3 con hoja 10 o 15, tijeras de Mayo y Metzenbaum, pinzas Adson, portaagujas, pinzas hemostáticas Kelly y Mosquito, pinzas Backhaus, gasas. Gato: hoja 15 y dos mosquitos bastan.',
    tipo_sutura: 'Cordón espermático: absorbible monofilamento (PDS, Monocryl) 3-0 en <10 kg, 2-0 en 10–25 kg, 2-0 o 0 en >25 kg. Subcutáneo: Monocryl 3-0. Piel: intradérmico 4-0 absorbible. Gato: 3-0 absorbible o ligadura del cordón consigo mismo; la piel no se sutura.',
    complicaciones_frecuentes: 'Hematoma o inflamación escrotal (la más frecuente); hemorragia del cordón; dehiscencia; autotraumatismo; granuloma por hilo; granuloma espermático si se incide la túnica albugínea; testículo retenido no extirpado.',
    manejo_anestesico_sugerido: 'Premedicación con metadona 0,2–0,3 mg/kg IM ± dexmedetomidina 2–5 µg/kg IM. Inducción: propofol 2–4 mg/kg IV o alfaxalona 1–2 mg/kg IV. Mantenimiento inhalatorio. Lidocaína intratesticular (máximo 2 mg/kg en total en perros, 1 mg/kg en gatos) y bloqueo incisional. AINE postoperatorio si está normotenso. En gatos, protocolo inyectable IM es habitual.',
    consideraciones_por_raza: 'Braquicéfalos: preoxigenar y extubar tarde. Razas grandes: discutir la edad (riesgo ortopédico y de algunos tumores con la castración temprana). Criptorquidia más frecuente en razas toy y miniatura: palpar ambos testículos antes de incidir.',
    consideraciones_comorbilidades: 'Criptorquidia: el testículo retenido puede estar inguinal o abdominal; localizarlo con palpación o ecografía antes de operar. Tumores testiculares con hiperestrogenismo (sertolinoma): hemograma por riesgo de aplasia medular. Prostatitis: tratamiento antibiótico además de la castración.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 26; Plumb\'s Veterinary Drug Handbook; AAHA 2020 Anesthesia and Monitoring Guidelines.',
  },
  guide: {
    draft: true,
    lede: 'Extirpación de ambos testículos por una incisión prescrotal en el perro o dos incisiones escrotales en el gato. Rápida y limpia; el resultado depende de tres cosas: no tocar el escroto más de lo necesario, ligaduras seguras en el cordón y una hemostasia cuidadosa del subcutáneo.',
    meta: { species: ['perro', 'gato'], duration: '15–40 min', difficulty: 'básica', contamination: 'limpia' },
    before_you_start: [
      'Palpa los dos testículos antes de anestesiar. Si falta uno, es una criptorquidia: planifica dónde buscarlo antes de incidir.',
      'En el perro, prepara la piel prescrotal y la cara medial de los muslos sin rasurar ni frotar el escroto: se inflama con muy poco.',
      'Desplaza el testículo hacia la incisión prescrotal con presión firme; incide sobre él, no sobre el escroto.',
      'Nunca incidas la túnica albugínea: expone el parénquima y causa granuloma espermático.',
      'Revisa cada muñón antes de soltarlo: el cordón se retrae al abdomen por el anillo inguinal y una hemorragia ahí no se ve desde fuera.',
    ],
    indications: [
      'Esterilización electiva y control reproductivo.',
      'Hiperplasia prostática benigna, prostatitis, quistes y abscesos prostáticos (como parte del tratamiento).',
      'Tumores testiculares, orquitis, epididimitis y traumatismo testicular.',
      'Criptorquidia (el testículo retenido tiene más riesgo de tumor y torsión).',
      'Enfermedades dependientes de andrógenos: hernia perineal, adenoma perianal.',
      'Conductas dependientes de andrógenos (marcaje, monta, vagabundeo).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Examen.', body: 'Palpa ambos testículos y la próstata. Testículo ausente: criptorquidia (busca en el canal inguinal y el abdomen caudal con palpación o ecografía). Testículo agrandado o asimétrico: sospecha de tumor.' },
              { title: 'Ayuno y exámenes.', body: 'Igual que cualquier anestesia electiva: 4–6 h de sólidos en adultos. Hematocrito y proteínas; perfil completo en mayores de 7 años. En sertolinomas con feminización, hemograma por la posible aplasia medular.' },
              { title: 'Antibióticos.', body: 'No hacen falta en la castración electiva.' },
              { title: 'Preparación del perro.', body: 'Decúbito dorsal. Rasura el área prescrotal y la cara medial de los muslos; el escroto se deja sin rasurar o se recorta con mucho cuidado. Antisepsia suave. Puedes incluir el escroto en el campo para manipular el testículo.' },
              { title: 'Preparación del gato.', body: 'Decúbito dorsal o lateral con los miembros traccionados hacia craneal. Arranca el pelo del escroto con los dedos (no se rasura) y haz antisepsia.' },
            ],
          },
          { type: 'note', kind: 'why', title: 'Por qué prescrotal y no escrotal en el perro', text: 'La piel escrotal del perro es fina, sensible y muy vascularizada: incidirla causa más inflamación, lamido y hematoma. La incisión prescrotal queda en piel normal, se cierra en dos capas y se ve menos.' },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'La tracción del cordón espermático es el estímulo más doloroso; el bloqueo intratesticular lo atenúa mucho y baja la necesidad de anestésico inhalatorio.',
        blocks: [
          {
            type: 'drugs',
            items: [
              { phase: 'Premedicación', drug: 'Metadona', dose: '0,2–0,3 mg/kg', route: 'IM o IV' },
              { phase: 'Premedicación', drug: 'Dexmedetomidina', dose: '0,002–0,005 mg/kg', route: 'IM', note: 'Gatos sanos: hasta 0,01 mg/kg IM en protocolos inyectables.' },
              { phase: 'Inducción', drug: 'Propofol', dose: '2–4 mg/kg', route: 'IV, a efecto' },
              { phase: 'Inducción', drug: 'Alfaxalona', dose: '1–2 mg/kg', route: 'IV, a efecto', note: 'En gatos también 2–3 mg/kg IM en protocolos combinados.' },
              { phase: 'Local', drug: 'Lidocaína', dose: '2 mg/kg (máximo)', route: 'Intratesticular e incisional', note: 'Dividida entre ambos testículos e incisión. Gatos: máximo 1 mg/kg en total.' },
              { phase: 'Postoperatorio', drug: 'Meloxicam', dose: '0,2 mg/kg', route: 'SC, una vez', note: 'Luego 0,1 mg/kg VO cada 24 h en perros. Gatos: 0,05–0,1 mg/kg dosis única.' },
              { phase: 'Postoperatorio', drug: 'Buprenorfina', dose: '0,01–0,02 mg/kg', route: 'IV, IM o transmucosa', note: 'Cada 6–8 h según la escala de dolor.' },
            ],
          },
          {
            type: 'steps',
            items: [
              { title: 'Bloqueo intratesticular.', body: 'Con el paciente anestesiado y el campo preparado, inserta una aguja 22–25 G desde el polo caudal hacia el centro del testículo, aspira, e inyecta hasta notar el testículo firme (más o menos la mitad de la dosis calculada por testículo, sin superar el máximo total). El anestésico migra por los linfáticos al cordón en pocos minutos.' },
            ],
          },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          { type: 'figure', key: 'testis-layers', caption: 'Capas del testículo de afuera hacia adentro. La técnica abierta incide la túnica vaginal parietal; la cerrada la deja intacta. La albugínea nunca se incide.' },
          {
            type: 'list',
            items: [
              'Escroto: entre la región inguinal y el ano, con un septo medio. En el perro la piel es fina y con poco pelo; en el gato está más dorsal, cerca del ano, y tiene pelo denso.',
              'Capas de afuera hacia adentro: piel y dartos, fascia espermática, túnica vaginal parietal, cavidad vaginal (continúa con el peritoneo), túnica vaginal visceral, túnica albugínea y parénquima.',
              'Ligamento de la cola del epidídimo: une la cola del epidídimo a la túnica vaginal parietal. Es lo que se separa con el dedo o una gasa en la técnica abierta.',
              'Cordón espermático: arteria testicular, plexo pampiniforme (venas), conducto deferente con su arteria y vena, linfáticos y nervios, envueltos por la túnica vaginal visceral. El músculo cremáster corre por fuera de la túnica parietal.',
              'Anillo inguinal: el cordón lo atraviesa hacia el abdomen. Un muñón que se suelta se retrae por él y sangra dentro del abdomen.',
            ],
          },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica en el perro (prescrotal)',
        blocks: [],
        subsections: [
          {
            id: 'incision',
            title: 'A. Incisión y exposición',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Desplaza el testículo.', body: 'Empuja un testículo hacia craneal, a la zona prescrotal, sujetándolo entre el pulgar y el índice para que la piel quede tensa sobre él.' },
                  { title: 'Incide.', body: 'Incisión en la línea media prescrotal, de largo similar al testículo, sobre piel y subcutáneo hasta ver la fascia espermática. Evita el pene y el músculo retractor del pene, que quedan craneales.' },
                  { title: 'Saca el testículo.', body: 'Sigue empujando hasta que el testículo, cubierto por la túnica vaginal parietal, salga por la incisión.' },
                  { title: 'Libera la fascia.', body: 'Con una gasa, despega la fascia espermática y la grasa del cordón tirando suavemente hacia afuera hasta exteriorizar 3–5 cm de cordón.' },
                ],
              },
            ],
          },
          {
            id: 'abierta',
            title: 'B. Técnica abierta',
            intro: 'Se abre la túnica vaginal parietal y se ligan los vasos y el conducto deferente por separado. Más segura en perros grandes porque cada ligadura toma menos tejido.',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Abre la túnica parietal.', body: 'Incide la túnica vaginal parietal sobre el testículo, con cuidado de no cortar la albugínea. El testículo sale de la túnica.' },
                  { title: 'Separa el ligamento.', body: 'Pinza la túnica con un hemostato y separa el ligamento de la cola del epidídimo con el dedo o rompiéndolo con una gasa. El testículo queda libre, colgando del cordón.' },
                  { title: 'Identifica las estructuras.', body: 'El conducto deferente es el cordón firme y blanquecino; el paquete vascular (arteria y plexo pampiniforme) es más grueso y tortuoso. Separa ambos con una pinza.' },
                  { title: 'Liga cada estructura.', body: 'Una ligadura circunferencial alrededor del paquete vascular y otra alrededor del conducto deferente, y luego una ligadura circunferencial (o transfixiante en perros grandes) que tome ambos juntos, proximal a las anteriores.' },
                  { title: 'Pinza y corta.', body: 'Coloca una pinza distal a las ligaduras y corta entre la pinza y las ligaduras, dejando un muñón de 3–5 mm.' },
                  { title: 'Revisa y suelta.', body: 'Toma el muñón con una pinza de disección, comprueba que no sangra y deja que vuelva a la túnica. Cierra la túnica con un punto o una ligadura que incluya también el cremáster si quieres sellar la cavidad vaginal (opcional).' },
                ],
              },
            ],
          },
          {
            id: 'cerrada',
            title: 'C. Técnica cerrada',
            intro: 'La túnica vaginal parietal queda intacta y se liga el cordón completo dentro de ella. Rápida y sin abrir la cavidad vaginal; ideal en perros pequeños y medianos.',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Despeja el cordón.', body: 'Separa con una gasa la grasa y la fascia de la túnica parietal, tirando hacia distal, hasta tener un cordón limpio.' },
                  { title: 'Torsiona si lo prefieres.', body: 'Girar el cordón dos o tres vueltas sobre sí mismo ayuda a comprimir los vasos antes de pinzar (opcional).' },
                  { title: 'Tres pinzas.', body: 'Coloca tres pinzas sobre el cordón cubierto. Retira la proximal y liga en su surco con una circunferencial con nudo de fricción (Miller o estrangulador).' },
                  { title: 'Segunda ligadura.', body: 'Coloca una ligadura transfixiante entre la primera y la pinza media; atraviesa el cremáster y la túnica para que no se deslice.' },
                  { title: 'Corta y revisa.', body: 'Corta entre la pinza media y la distal, revisa el muñón sujetándolo con la pinza de disección y suéltalo.' },
                  { title: 'Segundo testículo.', body: 'Desplaza el otro testículo hacia la misma incisión, incide el septo o la fascia sobre él y repite.' },
                ],
              },
              { type: 'note', kind: 'error', title: 'Si el cordón se retrae sangrando', bullets: ['Toma de inmediato el cordón con una pinza si todavía se ve en el canal inguinal.', 'Si ya no se ve, comprime el canal inguinal y prepara una laparotomía caudal: el cordón se busca dorsal a la vejiga, siguiendo el conducto deferente hasta la próstata.', 'Un hematoma escrotal que crece rápido después de la cirugía también puede ser hemorragia del cordón.'] },
            ],
          },
          {
            id: 'cierre-perro',
            title: 'D. Cierre',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Hemostasia del subcutáneo.', body: 'Revisa el tejido subcutáneo y el septo: los pequeños sangrados aquí son la causa principal del hematoma escrotal.' },
                  { title: 'Subcutáneo.', body: 'Continuo simple con Monocryl 3-0 cerrando el espacio muerto; toma algo de fascia para que no quede bolsillo.' },
                  { title: 'Piel.', body: 'Intradérmico con 4-0 absorbible, o puntos simples con nylon 3-0 si el paciente tolera el collar.' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'gato',
        title: 'Técnica en el gato (escrotal)',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Incide el escroto.', body: 'Sujeta un testículo contra la piel y haz una incisión de 1 cm sobre él, paralela al rafe, con hoja 15. Una incisión por testículo.' },
              { title: 'Exterioriza.', body: 'Presiona para que el testículo salga. Separa la fascia con una gasa tirando hacia afuera para exponer 2–3 cm de cordón.' },
              { title: 'Elige la ligadura.', body: 'Técnica cerrada con ligadura de 3-0 absorbible, o técnica abierta anudando el conducto deferente con el paquete vascular (dos o tres nudos cuadrados) sin hilo. También se puede anudar el cordón consigo mismo alrededor de una pinza.' },
              { title: 'Corta y revisa.', body: 'Corta distal al nudo, revisa el muñón y suéltalo.' },
              { title: 'No suturas.', body: 'Las incisiones escrotales se dejan abiertas para que drenen y cicatricen por segunda intención en pocos días.' },
            ],
          },
          { type: 'note', kind: 'tip', title: 'El nudo del cordón consigo mismo', text: 'Sin hilo, sin cuerpo extraño y en un minuto por lado. Requiere un cordón largo (tracciona bien) y no es apropiado en gatos adultos grandes con vasos gruesos: ahí usa ligadura.' },
        ],
      },
      {
        id: 'criptorquidia',
        title: 'Criptorquidia',
        blocks: [
          {
            type: 'defs',
            items: [
              { tag: 'Inguinal o subcutáneo', title: 'Testículo palpable fuera del escroto', text: 'Incide directamente sobre él y castra con la técnica cerrada.' },
              { tag: 'Abdominal', title: 'Testículo no palpable', text: 'Laparotomía caudal paramediana al prepucio (perro) o media (gato). Busca el conducto deferente dorsal a la vejiga y síguelo hasta el testículo; está entre el polo caudal del riñón y el anillo inguinal. También es posible por laparoscopia.' },
              { tag: 'Siempre', title: 'Castra los dos', text: 'La criptorquidia es hereditaria: se extirpan ambos testículos, también el descendido.' },
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
              { title: 'Collar isabelino.', body: '7–10 días. El lamido es la causa principal de inflamación y dehiscencia.' },
              { title: 'Frío local.', body: 'Compresas frías 5–10 minutos varias veces el primer día reducen la inflamación escrotal.' },
              { title: 'Analgesia.', body: 'AINE 3 días en perros; en gatos, la dosis única suele bastar.' },
              { title: 'Reposo.', body: 'Paseos con correa 7–10 días.' },
              { title: 'Fertilidad.', body: 'El perro puede ser fértil hasta 6 semanas después: avisa al tutor si convive con hembras enteras.' },
            ],
          },
        ],
      },
    ],
    closure: [
      { layer: 'Cordón espermático (perro)', suture: 'PDS o Monocryl', gauge: '<10 kg: 3-0 · 10–25 kg: 2-0 · >25 kg: 2-0 o 0', pattern: 'Circunferencial con nudo de Miller + transfixiante', why: 'Doble ligadura y transfixiante para que no se deslice al retraerse el cordón.' },
      { layer: 'Cordón espermático (gato)', suture: 'Monocryl o sin hilo', gauge: '3-0', pattern: 'Circunferencial, o nudo del cordón consigo mismo', why: 'Vasos pequeños; evitar cuerpo extraño.' },
      { layer: 'Subcutáneo (perro)', suture: 'Monocryl', gauge: '3-0', pattern: 'Continuo simple', why: 'Cierra el espacio muerto; previene el hematoma escrotal.' },
      { layer: 'Piel (perro)', suture: 'Monocryl o nylon', gauge: '4-0 o 3-0', pattern: 'Intradérmico o simples', why: 'Intradérmico: sin puntos que retirar ni que el perro se arranque.' },
      { layer: 'Piel (gato)', suture: 'Ninguna', gauge: '—', pattern: 'Segunda intención', why: 'Las incisiones escrotales pequeñas drenan y cierran solas.' },
    ],
    complications: [
      { name: 'Inflamación y hematoma escrotal', prevent: 'No traumatizar el escroto al preparar ni al empujar; hemostasia cuidadosa del subcutáneo; collar.', manage: 'Frío local y AINE. Un hematoma grande o que crece puede requerir ablación escrotal.' },
      { name: 'Hemorragia del cordón', prevent: 'Ligaduras en el surco de la pinza, transfixiante, revisar el muñón.', manage: 'Si es abdominal (mucosas pálidas, abdomen que crece), laparotomía y ligadura del cordón.' },
      { name: 'Autotraumatismo y dehiscencia', prevent: 'Collar isabelino, intradérmico, analgesia suficiente.', manage: 'Limpieza y nueva sutura o cicatrización por segunda intención.' },
      { name: 'Granuloma espermático', prevent: 'No incidir la albugínea; ligar el conducto deferente con firmeza.', manage: 'Extirpación del granuloma.' },
      { name: 'Granuloma o fístula por hilo', prevent: 'Solo hilos absorbibles monofilamento.', manage: 'Extraer el hilo y el trayecto.' },
      { name: 'Testículo retenido no extirpado', prevent: 'Palpar los dos testículos antes de empezar.', manage: 'Localizar por ecografía y extirpar.' },
    ],
    quiz: [
      { q: '¿Qué diferencia la técnica abierta de la cerrada?', a: 'En la abierta se incide la túnica vaginal parietal y se ligan por separado el paquete vascular y el conducto deferente; en la cerrada la túnica queda intacta y se liga el cordón completo dentro de ella.' },
      { q: '¿Por qué en el perro se incide prescrotal y en el gato escrotal?', a: 'La piel escrotal del perro es fina y sensible y se inflama mucho; en el gato el escroto está lejos de la zona prescrotal y las incisiones pequeñas cicatrizan bien por segunda intención.' },
      { q: '¿Qué estructura separas para liberar el testículo en la técnica abierta?', a: 'El ligamento de la cola del epidídimo, que lo une a la túnica vaginal parietal.' },
      { q: '¿Qué causa un granuloma espermático?', a: 'Incidir la túnica albugínea, que deja salir espermatozoides al tejido, o una ligadura floja del conducto deferente.' },
      { q: 'Te falta un testículo al palpar: ¿dónde lo buscas?', a: 'En el canal inguinal y el tejido subcutáneo inguinal; si no está, en el abdomen, siguiendo el conducto deferente desde la próstata hasta el testículo.' },
    ],
    videos: [
      { title: 'UTCVM Dog Castration', url: 'https://www.youtube.com/watch?v=bj38-ZwfA3s', channel: 'Nick Kirk (Universidad de Tennessee)', lang: 'inglés', note: 'Castración del perro, video de facultad' },
      { title: 'Pre-Scrotal Castration in a Dog (closed)', url: 'https://www.youtube.com/watch?v=FQEJiMDejZs', channel: 'Vet Ismaeel Official', lang: 'inglés', note: 'Técnica prescrotal cerrada' },
      { title: 'Feline neuter, open cat castration', url: 'https://www.youtube.com/watch?v=a9xT9FOMuuM', channel: 'Neuter Clinic Vetcpd', lang: 'inglés', note: 'Castración felina abierta' },
    ],
    sources: [
      { text: 'Fossum TW. Small Animal Surgery, 5.ª ed. Elsevier, 2019. Cap. 26, cirugía de los aparatos reproductor y genital.', kind: 'libro' },
      { text: 'Huuskonen V y col. Bloqueo intratesticular con lidocaína en la castración canina. Veterinary Journal, 2013.', kind: 'complemento' },
      { text: 'Grubb T y col. AAHA Anesthesia and Monitoring Guidelines for Dogs and Cats, 2020.', kind: 'complemento' },
      { text: 'Plumb\'s Veterinary Drug Handbook (dosis).', kind: 'complemento' },
    ],
  },
};
