// Orquiectomía (id 2). Rewritten from Fossum 5.ª ed., cap. 26 (pp. 724–745), at the depth of the OVH guide.
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 2,
  legacy: {
    indicaciones: 'Esterilización y control de conducta (agresividad, vagabundeo, marcaje); prevención de enfermedades dependientes de andrógenos (próstata, adenoma perianal, hernia perineal); anomalías congénitas, enfermedad testicular o del epidídimo, neoplasia, trauma o absceso escrotal; herniorrafia inguinoescrotal; uretrostomía escrotal; control de epilepsia y de algunas endocrinopatías.',
    tecnica_quirurgica: 'Perro: abordaje prescrotal (el más común) o perineal. Técnica abierta: se incide la túnica vaginal parietal, se separa con el dedo el ligamento de la cola del epidídimo y se ligan por separado el cordón vascular y el conducto deferente, más una ligadura que rodea ambos; se cierra la túnica con una ligadura que incluye el cremáster. Técnica cerrada: la túnica queda intacta y se coloca una ligadura circunferencial y una transfixiante a través del cremáster. Cierre de la fascia a cada lado del pene, subcutáneo continuo e intradérmico. Gato: dos incisiones escrotales de 0,5–1 cm, doble ligadura con 3-0, nudo del deferente con los vasos o nudo del cordón consigo mismo; las incisiones cicatrizan por segunda intención.',
    material_quirurgico: 'Mango de bisturí n.º 3 con hoja 10 o 15, tijeras de Metzenbaum y Mayo, pinzas Adson o Brown-Adson, portaagujas Mayo-Hegar, pinzas hemostáticas Mosquito curvas y Carmalt, pinzas de campo Backhaus, gasas. Gato: hoja 15 y dos Mosquito curvas.',
    tipo_sutura: 'Cordón espermático: absorbible 2-0 o 3-0 (Vicryl, PDS, Monocryl, Maxon o Biosyn). Fascia peneana y subcutáneo: absorbible monofilamento 3-0, continuo. Piel: intradérmico 4-0 absorbible o puntos simples. Gato: 3-0 absorbible o hemoclips, o nudo del cordón sin hilo; la piel no se sutura.',
    complicaciones_frecuentes: 'Inflamación, hematoma y equimosis escrotal; hemorragia del cordón; seroma, celulitis, infección, autotraumatismo y dehiscencia; granuloma (espermático si se incide la albugínea, o por hilo); lesión del pene o la uretra al disecar; incontinencia, alopecia endocrina y cambios de conducta (raros); preñez si el macho recién castrado cubre a una hembra (los espermatozoides persisten 21 días en el perro y 49 en el gato).',
    manejo_anestesico_sugerido: 'Paciente sano (tabla 26.3 del Fossum): premedicación con opioide (metadona, hidromorfona o buprenorfina) ± sedante, inducción con propofol o alfaxalona y mantenimiento inhalatorio. Lidocaína intratesticular e incisional. AINE postoperatorio (carprofeno o meloxicam en perros; meloxicam en dosis única en gatos). Antibióticos no indicados en la castración electiva.',
    consideraciones_por_raza: 'Braquicéfalos: preoxigenar y extubar tarde. Razas grandes castradas antes de los 6 meses: más riesgo de ángulo de meseta tibial excesivo y retraso del cierre fisario de 8–9 semanas. Criptorquidia más frecuente en razas toy y miniatura; se considera hereditaria, por lo que se castran ambos testículos.',
    consideraciones_comorbilidades: 'Criptorquidia: el testículo retenido tiene más riesgo de seminoma y sertolinoma; si no es palpable se busca por laparotomía o laparoscopia. Prostatitis bacteriana: antibiótico liposoluble según cultivo además de la castración. Pacientes pediátricos: tejidos friables, ligaduras 3-0 a 5-0, control de hipotermia e hipoglucemia.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 26, pp. 724–745; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Extirpación de ambos testículos. En el perro se hace por una incisión prescrotal, con técnica abierta o cerrada; en el gato, por dos incisiones escrotales pequeñas. Es rápida, pero sus complicaciones (hematoma escrotal, hemorragia del cordón, granulomas) casi siempre vienen de tres errores evitables: traumatizar el escroto, ligar mal el cordón o incidir la albugínea.',
    meta: { species: ['perro', 'gato'], duration: '15–40 min', difficulty: 'básica', contamination: 'limpia' },
    before_you_start: [
      'Palpa los dos testículos en el escroto antes de empezar; si falta uno, planifica la búsqueda del retenido antes de incidir.',
      'En el perro, rasura y prepara la zona prescrotal y la cara medial de los muslos sin tocar el escroto con la máquina ni con antisépticos: se inflama con muy poco.',
      'Empuja el testículo a la zona prescrotal e incide sobre él, en el rafe medio: nunca sobre el escroto.',
      'No incidas la túnica albugínea: expone el parénquima y provoca un granuloma espermático.',
      'Revisa cada muñón sujetándolo con pinza de disección antes de soltarlo: un cordón que sangra se retrae al abdomen por el anillo inguinal.',
    ],
    indications: [
      'Esterilización; disminución de agresividad, vagabundeo y marcaje con orina.',
      'Prevención y tratamiento de enfermedades dependientes de andrógenos: hiperplasia prostática, prostatitis, adenoma perianal, hernia perineal.',
      'Anomalías congénitas y criptorquidia; enfermedad testicular o del epidídimo; neoplasia, trauma o absceso escrotal.',
      'Como parte de la herniorrafia inguinoescrotal y de la uretrostomía escrotal.',
      'Control de epilepsia y de algunas alteraciones endocrinas.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Ayuno.', body: 'El Fossum indica 12–18 h en adultos y 4–6 h en pediátricos. Las guías de anestesia actuales proponen 4–6 h en adultos sanos; en cachorros, ayuno corto por el riesgo de hipoglucemia.', cite: 'Fossum p. 728' },
              { title: 'Examen.', body: 'Palpa ambos testículos, el epidídimo (palpable en la epididimitis) y la próstata por vía rectal. Testículo asimétrico o agrandado: sospecha de tumor.', cite: 'Fossum p. 728' },
              { title: 'Exámenes.', body: 'Hematocrito y proteínas totales; desde los 5–7 años, electrolitos, enzimas hepáticas, urea y creatinina.', cite: 'tabla 26.3' },
              { title: 'Antibióticos.', body: 'No son necesarios en la castración electiva. En prostatitis bacteriana, según cultivo y con fármacos que crucen la barrera prostática (enrofloxacino, trimetoprim, clindamicina, eritromicina).', cite: 'Fossum p. 724–725' },
              { title: 'Preparación del perro.', body: 'Decúbito dorsal. Rasura y prepara el abdomen caudal y la cara medial de los muslos; deja el escroto fuera del campo con los paños.', cite: 'Fossum p. 732' },
              { title: 'Preparación del gato.', body: 'Decúbito dorsal o lateral con los miembros posteriores traccionados hacia craneal. Arranca el pelo del escroto con los dedos; en gatitos de menos de 16–20 semanas, si cuesta, recórtalo con cuidado con la máquina.', cite: 'Fossum p. 734' },
            ],
          },
          {
            type: 'note',
            kind: 'book',
            title: 'Edad de castración (Box 26.4)',
            bullets: [
              'La gonadectomía temprana es segura desde las 7 semanas y se asocia a recuperación anestésica más rápida.',
              'Retrasa el cierre de las fisis 8–9 semanas (huesos largos algo más largos).',
              'En razas grandes castradas antes de los 6 meses aumenta el riesgo de ángulo de meseta tibial excesivo.',
              'Pene, prepucio y hueso peneano pueden quedar infantiles si se castra a las 6–8 semanas.',
              'Tejidos pediátricos: manipulación suave y ligaduras de 3-0 a 5-0.',
            ],
          },
          {
            type: 'defs',
            items: [
              { tag: 'Instrumental', title: 'Mesa básica', text: 'Mango n.º 3 con hoja 10 o 15, tijeras de Metzenbaum y Mayo, pinzas Adson o Brown-Adson, portaagujas, pinzas Mosquito curvas y Carmalt, pinzas Backhaus, gasas.' },
              { tag: 'Gato', title: 'Mínimo', text: 'Hoja 15 y dos pinzas Mosquito curvas bastan para la técnica sin hilo.' },
            ],
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'La tracción del cordón espermático es el momento más doloroso. El bloqueo intratesticular con lidocaína reduce mucho esa respuesta y la necesidad de anestésico inhalatorio.',
        blocks: [
          {
            type: 'drugs',
            items: [
              ...pick('metadona', 'dexmed', 'propofol', 'alfaxalona', 'isoflurano'),
              drug('Local', 'Lidocaína', '2 mg/kg (máximo)', 'Intratesticular e incisional', 'Repartida entre ambos testículos y la línea de incisión. Gatos: máximo 1 mg/kg en total.'),
              drug('Postoperatorio', 'Carprofeno', '2,2 mg/kg', 'VO cada 12 h', 'Solo perros (dosis de la tabla 26.3). También 4 mg/kg cada 24 h.'),
              drug('Postoperatorio', 'Meloxicam', '0,1–0,2 mg/kg', 'SC o VO, una vez', 'Luego 0,1 mg/kg VO cada 24 h en perros. En gatos, una sola dosis (hasta 0,3 mg/kg SC en la ficha aprobada).'),
              drug('Postoperatorio', 'Buprenorfina', '0,01–0,02 mg/kg', 'IV, IM o transmucosa', 'En gatos es mejor analgésico que la morfina (tabla 26.3).'),
            ],
          },
          {
            type: 'steps',
            items: [
              { title: 'Bloqueo intratesticular.', body: 'Con el paciente anestesiado y el campo preparado, introduce una aguja de 22–25 G desde el polo caudal hacia el centro del testículo, aspira e inyecta hasta notar el testículo tenso. El anestésico migra por los linfáticos al cordón en unos minutos.' },
            ],
          },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          { type: 'figure', key: 'testis-layers', caption: 'Capas del testículo de afuera hacia adentro. La técnica abierta incide la túnica vaginal parietal; la cerrada la deja intacta. La albugínea nunca se incide (Fossum p. 727, 733).' },
          {
            type: 'list',
            items: [
              'Escroto: entre la región inguinal y el ano, bolsa membranosa con un septo medio. En el perro la piel es fina y con poco pelo; en el gato está más dorsal y tiene pelo denso (p. 727).',
              'Testículo, epidídimo, conducto deferente y sus vasos y nervios están cubiertos por la túnica vaginal visceral y parietal y por la fascia espermática.',
              'Epidídimo: grande, en el borde lateral del testículo. La cola se une al testículo por el ligamento propio y a la túnica vaginal y la fascia por el ligamento de la cola del epidídimo, que es lo que se separa en la técnica abierta.',
              'Cordón espermático: empieza en el anillo inguinal y contiene la arteria testicular, el plexo pampiniforme, linfáticos, plexo nervioso, el conducto deferente con su arteria y vena, músculo liso y la túnica visceral. El cremáster (extensión del oblicuo interno) corre por fuera de la túnica parietal.',
              'El conducto deferente rodea al uréter al salir del anillo inguinal y entra por dorsal en la próstata; el uréter queda dorsal al deferente. Importa en la criptorquidia abdominal.',
              'Pene del perro dirigido hacia craneal, ventral a la pared abdominal: la incisión prescrotal queda justo caudal a él; el músculo retractor del pene corre por su cara ventral.',
            ],
          },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica en el perro',
        intro: 'El abordaje prescrotal es el más usado y el más fácil. El perineal se elige solo si el perro ya está en posición perineal para otra cirugía (por ejemplo, una hernia perineal).',
        blocks: [],
        subsections: [
          {
            id: 'abierta',
            title: 'A. Castración prescrotal abierta',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Verifica y prepara.', body: 'Decúbito dorsal; comprueba que ambos testículos estén en el escroto. Prepara el abdomen caudal y los muslos sin irritar el escroto y déjalo fuera de los paños.', cite: 'Fossum p. 732' },
                  { title: 'Desplaza el testículo.', body: 'Presiona el escroto para llevar un testículo lo más craneal posible, a la zona prescrotal.' },
                  { title: 'Incide.', body: 'Piel y subcutáneo sobre el rafe medio, encima del testículo desplazado (fig. 26.7A). Continúa por la fascia espermática hasta exteriorizar el testículo.', cite: 'Fossum p. 732' },
                  { title: 'Abre la túnica parietal.', body: 'Incide la túnica vaginal parietal sobre el testículo (fig. 26.7B). No incidas la albugínea.', cite: 'Fossum p. 733' },
                  { title: 'Separa el ligamento.', body: 'Coloca una pinza hemostática atravesando la túnica donde se une al epidídimo y separa con el dedo el ligamento de la cola del epidídimo mientras traccionas la pinza (fig. 26.7C).', cite: 'Fossum p. 733' },
                  { title: 'Exterioriza.', body: 'Tracción caudal y hacia afuera del testículo para sacar más cordón.' },
                  { title: 'Identifica las estructuras.', body: 'El cordón vascular (arteria y plexo pampiniforme) y el conducto deferente, blanquecino y firme.' },
                  { title: 'Liga.', body: 'Liga por separado el cordón vascular y el conducto deferente, y luego coloca una ligadura que rodee a ambos, proximal a las anteriores. Muchos cirujanos ligan el deferente y el plexo juntos. Absorbible 2-0 o 3-0.', cite: 'Fossum p. 733' },
                  { title: 'Pinza y corta.', body: 'Pinza hemostática atravesando el cordón cerca del testículo. Sujeta el deferente con pinza de disección por encima de la ligadura y corta ambos entre la pinza y las ligaduras (fig. 26.7D).', cite: 'Fossum p. 733' },
                  { title: 'Revisa y devuelve.', body: 'Comprueba que el cordón no sangre y devuélvelo dentro de la túnica.' },
                  { title: 'Cierra la túnica.', body: 'Rodea el cremáster y la túnica con una ligadura.', cite: 'Fossum p. 733' },
                  { title: 'Segundo testículo.', body: 'Llévalo a la misma incisión, incide su fascia y extírpalo igual.' },
                ],
              },
              { type: 'note', kind: 'why', title: 'Por qué abrir la túnica', text: 'Con la túnica abierta cada ligadura toma menos tejido y queda más segura; por eso se prefiere en perros grandes. El costo es que la cavidad vaginal, que se comunica con el peritoneo, queda abierta hasta que se liga la túnica.' },
            ],
          },
          {
            id: 'cerrada',
            title: 'B. Castración prescrotal cerrada',
            intro: 'Igual que la abierta, pero la túnica vaginal parietal no se incide.',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Despeja el cordón.', body: 'Retira con una gasa la grasa y la fascia de la túnica parietal para exteriorizar al máximo el cordón.', cite: 'Fossum p. 734' },
                  { title: 'Libera las adherencias.', body: 'Tracciona el testículo mientras se rompen las uniones fibrosas entre la túnica del cordón y el escroto.' },
                  { title: 'Pinza.', body: 'Coloca una pinza hemostática sobre el cordón justo distal al testículo.' },
                  { title: 'Ligadura circunferencial.', body: 'Absorbible 2-0 o 3-0 alrededor de todo el cordón con sus túnicas.', cite: 'Fossum p. 734' },
                  { title: 'Ligadura transfixiante.', body: 'Pasa la aguja de una segunda ligadura a través del cremáster, o entre estructuras dentro de la túnica, proximal o distal a la primera.', cite: 'Fossum p. 734' },
                  { title: 'Corta y revisa.', body: 'Corta entre la ligadura más distal y la pinza; revisa que no sangre.' },
                  { title: 'Segundo testículo.', body: 'Llévalo a la incisión y repite.' },
                ],
              },
              { type: 'note', kind: 'error', title: 'Si el cordón se retrae sangrando', bullets: ['Tómalo de inmediato con una pinza si todavía se ve en el canal inguinal.', 'Si ya no se ve, comprime el canal y prepara una laparotomía caudal: el cordón se encuentra siguiendo el conducto deferente desde la cara dorsal del cuello de la vejiga.', 'Un hematoma escrotal que crece rápido tras la cirugía también puede venir del cordón.'] },
              { type: 'note', kind: 'tip', title: 'Nudo en ocho', text: 'En perros pequeños también puede usarse el nudo en ocho descrito para el pedículo ovárico (p. 729) en lugar de la segunda ligadura.' },
            ],
          },
          {
            id: 'cierre-perro',
            title: 'C. Cierre',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Hemostasia.', body: 'Revisa el subcutáneo y el septo: los pequeños sangrados aquí son la causa principal del hematoma escrotal.' },
                  { title: 'Fascia peneana.', body: 'Aproxima la fascia densa incidida a cada lado del pene con puntos simples o continuo.', cite: 'Fossum p. 733' },
                  { title: 'Subcutáneo.', body: 'Continuo con absorbible monofilamento 3-0, cerrando el espacio muerto.' },
                  { title: 'Piel.', body: 'Intradérmico o puntos simples externos.', cite: 'Fossum p. 733' },
                ],
              },
            ],
          },
          {
            id: 'perineal',
            title: 'D. Abordaje perineal',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Cuándo.', body: 'Cuando el perro ya está en posición perineal (por ejemplo, herniorrafia perineal) para no reposicionar ni preparar otro campo.', cite: 'Fossum p. 732' },
                  { title: 'Incisión.', body: 'En la línea media del periné, dorsal al escroto y ventral al ano.', cite: 'Fossum p. 734' },
                  { title: 'Técnica.', body: 'Lleva cada testículo a la incisión (cuesta más que en la prescrotal), incide fascia y túnica y liga como en la técnica abierta: aquí debe usarse técnica abierta.', cite: 'Fossum p. 734' },
                ],
              },
            ],
          },
          {
            id: 'ablacion',
            title: 'E. Ablación escrotal',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Indicaciones.', body: 'Neoplasia escrotal, castración junto a uretrostomía escrotal, trauma grave, absceso o isquemia del escroto, o escroto péndulo por estética.', cite: 'Fossum p. 734' },
                  { title: 'Incisión.', body: 'Eleva el escroto y los testículos y haz una incisión elíptica en su base sin quitar demasiada piel.' },
                  { title: 'Castra.', body: 'Técnica abierta o cerrada; incide el septo medio y retira el escroto.' },
                  { title: 'Cierra.', body: 'Subcutáneo con continuo simple 3-0 absorbible; piel con puntos simples 3-0 o 4-0 no absorbible, o intradérmico.', cite: 'Fossum p. 734' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'gato',
        title: 'Técnica en el gato',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Prepara.', body: 'Arranca el pelo del escroto (fig. 26.8A) y haz la antisepsia.', cite: 'Fossum p. 734' },
              { title: 'Fija el testículo.', body: 'Inmovilízalo con el pulgar y el índice en la base del escroto.' },
              { title: 'Incide.', body: 'Incisión de 0,5–1 cm sobre cada testículo, en el extremo del escroto, de craneal a caudal (fig. 26.8B).', cite: 'Fossum p. 734' },
              { title: 'Abre la túnica.', body: 'Incide la túnica vaginal parietal y exterioriza el testículo.' },
              { title: 'Separa el ligamento.', body: 'Despega con el dedo el ligamento de la cola del epidídimo de la túnica (fig. 26.8C).' },
              { title: 'Elige el cierre del cordón.', body: 'Doble ligadura con 3-0 absorbible o hemoclips; o separa el deferente del testículo y anúdalo con los vasos con 2–3 nudos cuadrados (5–6 lazadas, fig. 26.8D); o nudo del cordón consigo mismo (fig. 26.9).', cite: 'Fossum p. 734–736' },
              { title: 'Corta y revisa.', body: 'Corta el cordón, revisa que no sangre y devuélvelo dentro de la túnica.' },
              { title: 'Segundo testículo.', body: 'Igual por su propia incisión.' },
              { title: 'Termina.', body: 'Recorta los restos de tejido que asomen. Las incisiones se dejan cicatrizar por segunda intención.', cite: 'Fossum p. 734' },
            ],
          },
          {
            type: 'steps',
            items: [
              { title: 'Nudo del cordón: posición.', body: 'Coloca una pinza Mosquito curva sobre el cordón (fig. 26.9A). Conviene separar antes la túnica del epidídimo.', cite: 'Fossum p. 734' },
              { title: 'Enrolla.', body: 'Pasa el extremo del testículo una vez sobre la pinza (fig. 26.9B).' },
              { title: 'Gira.', body: 'Lleva la pinza enrollada por ventral al cordón mientras sostienes el testículo con la otra mano (fig. 26.9C).' },
              { title: 'Toma el cordón.', body: 'Abre la punta de la pinza y toma el cordón cerca del testículo (fig. 26.9D).' },
              { title: 'Corta y pasa.', body: 'Corta el cordón junto al testículo y pasa el extremo por las vueltas de la pinza (fig. 26.9E).' },
              { title: 'Ajusta.', body: 'Aprieta el nudo con los dedos, recorta el sobrante, revisa y devuelve el cordón a la túnica (fig. 26.9F).' },
            ],
          },
          { type: 'note', kind: 'tip', title: 'Sin hilo, pero no siempre', text: 'Los nudos sin hilo no dejan cuerpo extraño y ahorran tiempo, pero necesitan un cordón largo. En gatos adultos grandes con vasos gruesos, liga con hilo.' },
        ],
      },
      {
        id: 'criptorquidia',
        title: 'Criptorquidia',
        intro: 'Falta de descenso de uno o ambos testículos a los 2 meses de edad; lo más frecuente es unilateral. Se considera hereditaria (rasgo autosómico recesivo ligado al sexo en perros) y el testículo retenido predispone a seminoma y sertolinoma: se castran siempre los dos (p. 734).',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Localiza.', body: 'El testículo retenido suele ser pequeño, blando y deforme. Ya anestesiado, a veces se palpa entre el anillo inguinal y el escroto; la grasa inguinal puede ocultarlo.', cite: 'Fossum p. 734' },
              { title: 'Inguinal móvil.', body: 'Llévalo a la incisión prescrotal y extírpalo.' },
              { title: 'Inguinal fijo.', body: 'Incisión sobre el anillo inguinal, disección por la grasa subcutánea, movilización y extirpación.' },
              { title: 'No palpable.', body: 'Laparotomía media del ombligo al pubis, o paramediana junto al prepucio, o laparoscopia.', cite: 'Fossum p. 734' },
              { title: 'Encuéntralo por el deferente.', body: 'Retroflexiona la vejiga, localiza el conducto deferente dorsal al cuello vesical y síguelo hasta el testículo. Si entra en el anillo inguinal y el testículo no baja al abdomen, haz una incisión inguinal.', cite: 'Fossum p. 734' },
              { title: 'Liga.', body: 'Arranca el ligamento de la cola del epidídimo y liga dos veces la arteria y vena testiculares y el deferente por separado. Corta, revisa y cierra el abdomen en tres capas.', cite: 'Fossum p. 734' },
              { title: 'Histopatología.', body: 'Envía los testículos para confirmar que se extirpó todo el tejido testicular y descartar neoplasia.', cite: 'Fossum p. 734' },
            ],
          },
          { type: 'note', kind: 'error', title: 'Cuidado', text: 'Durante la criptorquidectomía se ha extirpado la próstata por error: el testículo abdominal pequeño puede confundirse. Confírmalo siguiendo el deferente (p. 745).' },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Agua y comida.', body: 'Agua a las 4–6 h y comida a las 6–12 h si no vomita.', cite: 'Fossum p. 744' },
              { title: 'Analgesia.', body: 'AINE 3 días en perros; en gatos, la dosis única suele bastar.' },
              { title: 'Herida.', body: 'Revisión dos veces al día por enrojecimiento, inflamación o secreción. Collar isabelino para evitar el autotraumatismo.', cite: 'Fossum p. 744' },
              { title: 'Frío y calor.', body: 'Compresas frías 2–3 veces al día los primeros 2–3 días y luego tibias 2–3 días más reducen hematoma e inflamación.', cite: 'Fossum p. 744' },
              { title: 'Actividad.', body: 'Paseos con correa hasta retirar los puntos (10–14 días).', cite: 'Fossum p. 744' },
              { title: 'Fertilidad residual.', body: 'Los espermatozoides persisten en el deferente hasta 21 días en el perro y 49 en el gato: evita el contacto con hembras en celo.', cite: 'Fossum p. 745' },
            ],
          },
        ],
      },
    ],
    closure: [
      { layer: 'Cordón espermático (perro)', suture: 'Vicryl, PDS, Monocryl, Maxon o Biosyn', gauge: '2-0 o 3-0', pattern: 'Abierta: ligaduras separadas + una que rodea ambas. Cerrada: circunferencial + transfixiante por el cremáster', why: 'Doble ligadura y transfixión para que no se deslice al retraerse el cordón.' },
      { layer: 'Túnica y cremáster (abierta)', suture: 'Absorbible', gauge: '2-0 o 3-0', pattern: 'Ligadura circunferencial', why: 'Cierra la cavidad vaginal, que comunica con el peritoneo.' },
      { layer: 'Cordón espermático (gato)', suture: 'Absorbible, hemoclips o sin hilo', gauge: '3-0', pattern: 'Doble ligadura, nudo deferente-vasos o nudo del cordón', why: 'Vasos pequeños; los nudos sin hilo evitan cuerpo extraño.' },
      { layer: 'Fascia peneana (perro)', suture: 'Absorbible monofilamento', gauge: '3-0', pattern: 'Simples o continuo', why: 'Cierra el plano profundo a cada lado del pene.' },
      { layer: 'Subcutáneo (perro)', suture: 'Absorbible monofilamento', gauge: '3-0', pattern: 'Continuo', why: 'Cierra el espacio muerto y previene el hematoma.' },
      { layer: 'Piel (perro)', suture: 'Absorbible o no absorbible', gauge: '4-0 o 3-0', pattern: 'Intradérmico o simples', why: 'El intradérmico evita retirar puntos.' },
      { layer: 'Piel (gato)', suture: 'Ninguna', gauge: '—', pattern: 'Segunda intención', why: 'Incisiones escrotales pequeñas que drenan y cierran solas.' },
    ],
    complications: [
      { name: 'Inflamación, equimosis y hematoma escrotal', prevent: 'No irritar el escroto al preparar, hemostasia del subcutáneo y el septo, collar.', manage: 'Frío y luego calor local, AINE. Un hematoma grande o que crece puede requerir ablación escrotal.' },
      { name: 'Hemorragia del cordón', prevent: 'Ligaduras bien colocadas, transfixiante, revisar antes de soltar.', manage: 'Si es abdominal (mucosas pálidas, abdomen que crece), laparotomía y ligadura del cordón siguiendo el deferente.' },
      { name: 'Seroma, celulitis, infección, dehiscencia', prevent: 'Asepsia, cierre del espacio muerto, evitar el lamido.', manage: 'Limpieza, antibiótico según el caso, nueva sutura o segunda intención.' },
      { name: 'Granuloma espermático', prevent: 'No incidir la albugínea; ligadura firme del deferente.', manage: 'Extirpación.' },
      { name: 'Granuloma o fístula por hilo', prevent: 'Solo hilos absorbibles; nunca multifilamento no absorbible.', manage: 'Extraer el hilo y el trayecto.' },
      { name: 'Lesión del pene o la uretra', prevent: 'Disección cuidadosa, sobre todo en la ablación escrotal.', manage: 'Reparación; sonda urinaria.' },
      { name: 'Preñez tras la castración', prevent: 'Separar de hembras en celo 3 semanas (perro) o 7 (gato).', manage: 'Según el caso.' },
    ],
    quiz: [
      { q: '¿Qué diferencia la técnica abierta de la cerrada?', a: 'En la abierta se incide la túnica vaginal parietal, se separa el ligamento de la cola del epidídimo y se ligan por separado el cordón vascular y el deferente; en la cerrada la túnica queda intacta y se liga todo el cordón con una circunferencial y una transfixiante por el cremáster.' },
      { q: '¿Por qué en el perro la incisión es prescrotal?', a: 'Porque la piel escrotal canina es fina y sensible y se inflama con muy poco trauma; la prescrotal queda en piel normal y se cierra en capas.' },
      { q: '¿Cuándo usarías el abordaje perineal?', a: 'Cuando el perro ya está en posición perineal para otra cirugía, como una herniorrafia perineal; obliga a usar técnica abierta.' },
      { q: '¿Cómo encuentras un testículo abdominal?', a: 'Retroflexionando la vejiga, localizando el deferente dorsal al cuello vesical y siguiéndolo hasta el testículo.' },
      { q: '¿Por qué se castran ambos testículos en la criptorquidia?', a: 'Porque se considera hereditaria y el testículo retenido predispone a seminoma y sertolinoma.' },
      { q: '¿Cuánto tiempo puede ser fértil un macho recién castrado?', a: 'Hasta 21 días en el perro y 49 en el gato, porque quedan espermatozoides en el deferente.' },
    ],
    videos: [
      { title: 'UTCVM Dog Castration', url: 'https://www.youtube.com/watch?v=bj38-ZwfA3s', channel: 'Nick Kirk (Universidad de Tennessee)', lang: 'inglés', note: 'Castración del perro, video de facultad' },
      { title: 'Pre-Scrotal Castration in a Dog (closed)', url: 'https://www.youtube.com/watch?v=FQEJiMDejZs', channel: 'Vet Ismaeel Official', lang: 'inglés', note: 'Técnica prescrotal cerrada' },
      { title: 'Feline neuter, open cat castration', url: 'https://www.youtube.com/watch?v=a9xT9FOMuuM', channel: 'Neuter Clinic Vetcpd', lang: 'inglés', note: 'Castración felina abierta' },
    ],
    sources: [
      SOURCES.fossum(26, 'cirugía de los aparatos reproductor y genital, pp. 724–745 (anestesia, anatomía, orquiectomía, criptorquidia, cuidados y complicaciones)'),
      { text: 'Huuskonen V y col. Bloqueo intratesticular con lidocaína en la castración canina. Veterinary Journal, 2013.', kind: 'complemento' },
      SOURCES.aaha,
      SOURCES.plumbs,
    ],
  },
};
