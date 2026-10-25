// Toracocentesis, toracostomía con tubo y lavado pleural (id 19). Rewritten from Fossum 5.ª ed., cap. 30 (pp. 917–926, 947–951).
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 19,
  legacy: {
    indicaciones: 'Toracocentesis con aguja: diagnóstico y alivio de derrame pleural o neumotórax. Tubo de toracostomía: neumotórax que se reproduce tras varias toracocentesis, derrame que se acumula rápido, piotórax (drenaje y lavado), después de una toracotomía. Lavado pleural: piotórax.',
    tecnica_quirurgica: 'Toracocentesis: aguja mariposa 19–23 G con llave de tres vías en el centro del 6.º–8.º espacio intercostal cerca de la unión costocondral, aspirando al avanzar, bisel hacia adentro y aguja apoyada contra la pared. Tubo de trocar o de gran calibre: perforaciones adicionales (≤ 1/3 de la circunferencia, la última sobre la línea radiopaca), incisión en el tercio dorsal del 10.º–11.º espacio, túnel subcutáneo craneoventral de 3–4 espacios, sujetar el tubo a 1–2 cm de la pared y entrar de un golpe, pinzar antes de retirar el trocar, bolsa de tabaco y trampa china o sandalia romana, adaptador asegurado con sutura, radiografía y vendaje holgado. Tubo pequeño con guía (MILA): incisión en el 9.º–10.º espacio, túnel hasta el 7.º–8.º, entrada por el borde craneal de la costilla, guía en J hacia craneoventral y catéter sobre la guía. Lavado en piotórax: 20 mL/kg de salino o Ringer lactato tibio con heparina 1500 U/100 mL, 1 hora dentro, 2–3 veces al día durante 5–7 días.',
    material_quirurgico: 'Aguja mariposa 19–23 G o catéter sobre aguja, alargadera, llave de tres vías, jeringas; tubo de toracostomía de trocar (14–36 Fr según peso) o catéter pequeño con guía (14 o 12 G, MILA); hoja de bisturí, pinza hemostática grande, tijeras estériles; pinza de tubo; adaptador o Luer-Lock; sistema de aspiración continua comercial o de tres frascos; válvula de Heimlich solo en perros medianos y grandes; vendaje.',
    tipo_sutura: 'Bolsa de tabaco en la piel alrededor del tubo (sin atravesar la luz) con monofilamento no absorbible, y con los mismos cabos trampa china o sandalia romana. Sutura para asegurar el tubo a los conectores. Retiro: 1–2 puntos simples en la piel.',
    complicaciones_frecuentes: 'Neumotórax por daño del tubo (mordida, rascado) o conexiones flojas (la principal); acodamiento o mala posición (sobre todo tubos pequeños); perforación pulmonar; empiema (piotórax en 6 de 8 perros sanos a los 4–6 días con tubo); laceración de un vaso intercostal; aspiración de pulmón en las perforaciones; pleuritis fibrosante con derrames crónicos.',
    manejo_anestesico_sugerido: 'Manejo sin estrés y oxígeno; toracocentesis antes de inducir si hay disnea. Sin premedicación que deprima la respiración; benzodiacepina sola si el compromiso es mínimo. Preoxigenar 3–5 min, inducción rápida e intubación; nunca máscara ni cámara. Ventilación con volúmenes corrientes bajos (5–7 mL/kg), presiones pico bajas y frecuencia alta. Sin óxido nitroso. Bupivacaína máximo 2 mg/kg diluida al 0,125 % para bloqueo intercostal de 5 nervios e infiltración; intrapleural por el tubo (cuenta en la dosis total; inútil con sangre o pus).',
    consideraciones_por_raza: 'Gatos: piotórax frecuente, con Pasteurella y anaerobios. Perros de caza y de campo: piotórax por migración de cuerpos extraños vegetales, con Actinomyces y Nocardia.',
    consideraciones_comorbilidades: 'Piotórax: Gram y cultivo, antibiótico de amplio espectro con cobertura de anaerobios, 4–6 semanas y 2 semanas más allá de la resolución. Cirugía si hay enfermedad subyacente (absceso, torsión de lóbulo, cuerpo extraño) o no responde en 3–4 días. Corregir hidratación, electrolitos y equilibrio ácido-base antes de la cirugía.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 30, pp. 917–926 y 947–951; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Drenaje del espacio pleural con aguja o con tubo, y lavado de la pleura en el piotórax. Casi siempre es una urgencia: el paciente llega sin aire. Primero se estabiliza con oxígeno y toracocentesis. Después se coloca el tubo con calma, en el lado correcto de la costilla y con todas las conexiones aseguradas.',
    meta: { species: ['perro', 'gato'], duration: '5–10 min (toracocentesis); 15–30 min (tubo)', difficulty: 'intermedia', contamination: 'limpia (contaminada en piotórax)' },
    before_you_start: [
      'Estabiliza primero: oxígeno, manejo sin estrés y toracocentesis antes de inducir si el paciente tiene disnea.',
      'Nada de premedicación que deprima la respiración, ni inducción con máscara o cámara: preoxigena e intuba rápido.',
      'Lejos del borde caudal de la costilla, por donde corre el paquete vasculonervioso: la aguja en el centro del espacio, el tubo por el borde craneal.',
      'Con trocar, sujeta el tubo a 1–2 cm de la pared antes de empujar: si no, entra de más y perfora pulmón o corazón.',
      'Pinza de tubo junto a la salida y cada conexión asegurada con sutura: la desconexión es la complicación principal.',
      'El tubo es un cuerpo extraño: produce unos 2,2 mL/kg/día de líquido por sí mismo.',
    ],
    indications: [
      'Toracocentesis con aguja: diagnóstico del derrame (citología, cultivo, bioquímica) y alivio del derrame o del neumotórax (p. 920–921).',
      'Tubo de toracostomía: neumotórax que se reproduce o necesita toracocentesis repetidas, derrame que se acumula más rápido de lo que se puede puncionar, piotórax, después de una toracotomía (p. 921–922).',
      'Lavado pleural: piotórax, junto con el antibiótico sistémico (p. 949).',
      'Colocación toracoscópica o quirúrgica si el líquido está loculado o hay adherencias extensas (p. 923, 926).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Estabilización',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Oxígeno sin estrés.', body: 'Flow-by o mascarilla mientras pones el catéter IV; oxímetro fijado a la cola. Ten listos tubos endotraqueales, máquina, monitores y fármacos de urgencia.', cite: 'Fossum p. 918' },
              { title: 'Ausculta.', body: 'Sin ruidos pulmonares en el tórax dorsolateral: neumotórax. Sin ruidos ventrales y corazón apagado: derrame o hemotórax.', cite: 'Fossum p. 919' },
              { title: 'Punciona antes de las radiografías si hay disnea.', body: 'La toracocentesis diagnostica y alivia a la vez; la radiografía puede esperar a que respire.', cite: 'Fossum p. 920, 950' },
              { title: 'Ecografía.', body: 'Localiza bolsas de líquido y adherencias; si el líquido está muy loculado, piensa en colocación toracoscópica o quirúrgica.', cite: 'Fossum p. 926' },
              { title: 'Laboratorio.', body: 'Hematocrito, proteínas totales, albúmina, electrolitos, BUN, creatinina y, si se puede, gases. Corrige hidratación, electrolitos y ácido-base antes de una cirugía.', cite: 'Fossum p. 919, 950' },
              { title: 'Transfunde si hace falta.', body: 'Hematocrito < 20 % en perros o < 18 % en gatos.', cite: 'Fossum p. 919' },
            ],
          },
          {
            type: 'note',
            kind: 'why',
            title: 'El mediastino no siempre comunica',
            text: 'En perros y gatos el mediastino es fino y permeable, y un lado drena el otro. En el quilotórax y el piotórax la inflamación crónica lo engruesa y el derrame puede quedar en un lado: a veces hacen falta tubos bilaterales (p. 921–922).',
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Sin depresores antes de intubar.', body: 'Evita opioides, xilacina, medetomidina y dexmedetomidina antes de la inducción; con hipotensión, tampoco acepromacina; con taquicardia, sin atropina ni dosis de inducción de ketamina. Si el compromiso es mínimo, midazolam o diazepam 0,1–0,2 mg/kg.', cite: 'Fossum p. 919 (tabla 30.3)' },
              { title: 'Rasura antes de acostar.', body: 'Tras la benzodiacepina, rasura con el paciente de pie o en decúbito lateral; no lo pongas en decúbito dorsal hasta intubarlo.', cite: 'Fossum p. 919' },
              { title: 'Preoxigena e intuba rápido.', body: '3–5 min con mascarilla o flow-by; inducción rápida para intubar y ventilar cuanto antes.', cite: 'Fossum p. 918–919' },
              { title: 'Ventila con cuidado.', body: 'SpO2 > 95 %, volumen corriente 5–7 mL/kg, 10–30 respiraciones/min y presión pico < 12–15 mm Hg si basta; expande el pulmón despacio mirando. En el neumotórax, las presiones bajas reducen la fuga por alvéolos dañados.', cite: 'Fossum p. 918–919' },
              { title: 'Sin óxido nitroso.', body: 'Difunde a los espacios con aire y agrava el neumotórax.', cite: 'Fossum p. 918' },
              { title: 'Extuba sin prisa.', body: 'Despierto, respirando bien y cómodo.', cite: 'Fossum p. 918' },
            ],
          },
          {
            type: 'drugs',
            items: [
              drug('Premedicación', 'Midazolam', '0,1–0,2 mg/kg', 'IV o IM', 'Solo si el compromiso respiratorio es mínimo. Sin opioides ni α2 antes de intubar.'),
              drug('Inducción', 'Propofol', '2–6 mg/kg', 'IV, rápido si hay disnea', 'Paciente hidratado.'),
              drug('Inducción', 'Alfaxalona', '2–5 mg/kg', 'IV, rápido si hay disnea', 'Paciente hidratado.'),
              drug('Inducción', 'Etomidato', '0,5–1,5 mg/kg', 'IV', 'Paciente deshidratado; tras la benzodiacepina para evitar mioclonías.'),
              drug('Mantenimiento', 'Isoflurano o sevoflurano', 'A efecto, en O2', 'Inhalatoria', 'La analgesia permite bajar la concentración y evita la hipotensión.'),
              drug('Intraoperatorio', 'Fentanilo', '0,002–0,01 mg/kg', 'IV, a demanda', 'Perros 2–10 µg/kg; gatos 1–4 µg/kg. Infusión 2–30 µg/kg/h tras carga de 1–5 µg/kg.'),
              drug('Intraoperatorio', 'Ketamina', '0,5–1 mg/kg', 'IV', 'O carga de 0,5 mg/kg e infusión de 10 µg/kg/min.'),
              drug('Local', 'Bupivacaína (bloqueo intercostal e incisional)', '2 mg/kg (máximo)', 'Diluida al 0,125 %; la mitad para 5 nervios intercostales, la otra mitad incisional', 'Dosis máxima en 6–8 h. 3 mL de salino por cada mL al 0,5 %. Aguja 22 G, por caudal de la costilla, lo más dorsal posible.'),
              drug('Postoperatorio', 'Bupivacaína intrapleural', '1 mL al 0,5 % en 5–10 mL de salino', 'Por el tubo', 'Cuenta en la dosis máxima total. Rueda al paciente cada 2–3 min y aspira el resto. Inútil con sangre o pus en la pleura.'),
              drug('Postoperatorio', 'Buprenorfina', '0,005–0,02 mg/kg', 'IV, a demanda', 'Tras extubar; dolor leve a moderado.'),
              ...pick('metadonaPost'),
            ],
          },
          {
            type: 'note',
            kind: 'error',
            title: 'Bloqueos que no sirven',
            text: 'Echar anestésico local sobre la herida (splash block) tiene poco valor y gasta la dosis disponible (p. 918, recuadro 30.2).',
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
              'Cada cavidad pleural es un espacio virtual con una película capilar de líquido entre pleura parietal y visceral (p. 918).',
              'El paquete vasculonervioso intercostal corre por el borde caudal de cada costilla: la aguja entra en el centro del espacio y el tubo por el borde craneal (p. 921, 923, fig. 30.13).',
              'El mediastino suele ser permeable en perros y gatos, pero se ocluye en el quilotórax y el piotórax (p. 921).',
              'El aire sube y el líquido baja: punciona dorsal para neumotórax y ventral para derrame, con el paciente de pie o en decúbito esternal.',
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
            id: 'toracocentesis',
            title: 'A. Toracocentesis con aguja',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Material.', body: 'Aguja mariposa 19–23 G con alargadera y llave de tres vías, o catéter sobre aguja; jeringa grande.', cite: 'Fossum p. 921' },
                  { title: 'Posición.', body: 'De pie o en decúbito esternal, como tolere; rasura y antisepsia de la zona.', cite: 'Fossum p. 921' },
                  { title: 'Sitio.', body: '6.º–8.º espacio intercostal, cerca de la unión costocondral, salvo que el examen, la radiografía o la ecografía indiquen otro. Bloqueo local rara vez hace falta. En perros grandes u obesos, catéter en lugar de mariposa para llegar a la pleura.', cite: 'Fossum p. 921' },
                  { title: 'Entra.', body: 'En el centro del espacio intercostal, lejos de los vasos del borde caudal de la costilla. Aspira mientras avanzas para reconocer la profundidad; si notas el latido o el roce del pulmón, retira y reevalúa.', cite: 'Fossum p. 921' },
                  { title: 'Orienta.', body: 'Con el bisel hacia adentro, apoya la aguja contra la pared costal para no dañar la superficie del pulmón.', cite: 'Fossum p. 921' },
                  { title: 'Aspira.', body: 'Saca lo máximo posible, cerrando la llave cada vez que vacías la jeringa.', cite: 'Fossum p. 921' },
                  { title: 'Muestras.', body: '5 mL en tubo con EDTA (recuento) y 5 mL en tubo seco (bioquímica), 6–8 frotis directos, y cultivo aerobio y anaerobio.', cite: 'Fossum p. 921–922' },
                  { title: 'El otro lado.', body: 'Si queda líquido o aire, punciona también el hemitórax opuesto.', cite: 'Fossum p. 921' },
                ],
              },
              { type: 'note', kind: 'book', title: 'Antibiótico', text: 'Una toracocentesis con buena asepsia en un paciente inmunocompetente casi no produce infección: no se indica antibiótico profiláctico (p. 918).' },
            ],
          },
          {
            id: 'trocar',
            title: 'B. Tubo de trocar o de gran calibre',
            blocks: [
              {
                type: 'table',
                columns: ['Paciente', 'Tubo (recuadro 30.3)'],
                rows: [
                  ['Gatos y perros < 7 kg', '14–16 Fr'],
                  ['Perros 7–15 kg', '18–22 Fr'],
                  ['Perros 16–30 kg', '22–28 Fr'],
                  ['Perros > 30 kg', '28–36 Fr'],
                ],
                caption: 'Fossum p. 922. Los tubos grandes se conectan a aspiración continua; los pequeños tienden a colapsarse con ella.',
              },
              {
                type: 'steps',
                items: [
                  { title: 'Prepara.', body: 'Rasura y prepara el tórax lateral para cirugía aséptica; anestesia general o sedación profunda con bloqueo.', cite: 'Fossum p. 923' },
                  { title: 'Perforaciones.', body: 'Dobla el tubo y corta muescas con tijeras estériles, cada una no mayor de un tercio de la circunferencia (fig. 30.7). Todas deben quedar dentro del tórax; haz la última sobre la línea radiopaca para verla en la radiografía.', cite: 'Fossum p. 923' },
                  { title: 'Incisión.', body: 'Pequeña incisión en la piel del tercio dorsal de la pared lateral, a la altura del 10.º u 11.º espacio intercostal.', cite: 'Fossum p. 923' },
                  { title: 'Túnel.', body: 'Avanza el tubo por el subcutáneo en dirección craneoventral 3–4 espacios intercostales.', cite: 'Fossum p. 923' },
                  { title: 'Sujeta corto.', body: 'Toma el tubo con firmeza a 1–2 cm de la pared con una mano; con la otra, entra de un golpe por la musculatura y la pleura (fig. 30.8). Con un tubo sin trocar, usa una pinza hemostática grande.', cite: 'Fossum p. 923' },
                  { title: 'Dirige.', body: 'Avanza el tubo hacia craneoventral hasta el punto medido de antemano.', cite: 'Fossum p. 923' },
                  { title: 'Pinza antes de sacar el trocar.', body: 'Pinza el tubo con una hemostática antes de retirar el trocar por completo; deja una pinza de tubo junto a la salida (mejor que la hemostática: no daña el tubo y es más cómoda) (fig. 30.9).', cite: 'Fossum p. 923' },
                  { title: 'Fija.', body: 'Bolsa de tabaco en la piel alrededor del tubo, sin entrar en la luz, con cabos largos; con ellos haz una trampa china o sandalia romana (fig. 30.10).', cite: 'Fossum p. 923' },
                  { title: 'Conecta.', body: 'Adaptador de tubo (o Luer-Lock hembra en tubos pequeños) y llave de tres vías, hermético. Asegura cada conexión con sutura (fig. 30.11).', cite: 'Fossum p. 923' },
                  { title: 'Radiografía.', body: 'Comprueba la posición antes de cubrir con un vendaje holgado (fig. 30.12).', cite: 'Fossum p. 923' },
                ],
              },
              { type: 'note', kind: 'error', title: 'El empujón de más', text: 'Si la mano que sujeta el tubo no lo aprieta firme, el trocar entra más de lo previsto y puede perforar el pulmón o el corazón (fig. 30.8, p. 923).' },
            ],
          },
          {
            id: 'guia',
            title: 'C. Tubo pequeño con guía (MILA)',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Cuándo.', body: 'Catéteres de 14 o 12 G, colocados con sedación y bloqueo local; menos complicaciones de inserción e infección que los grandes, pero se acodan o colapsan con aspiración continua.', cite: 'Fossum p. 922' },
                  { title: 'Incisión.', body: 'Pequeña incisión en el tercio dorsal de la pared lateral, en el 9.º o 10.º espacio intercostal (fig. 30.13A).', cite: 'Fossum p. 923' },
                  { title: 'Túnel y entrada.', body: 'Tuneliza el catéter introductor hasta el 7.º u 8.º espacio e introdúcelo en el tórax por el borde craneal de la costilla (fig. 30.13B–C).', cite: 'Fossum p. 923' },
                  { title: 'Guía.', body: 'Avanza el introductor sobre el estilete y pasa una guía en J por el catéter, hacia craneoventral, hasta notar resistencia (fig. 30.13D).', cite: 'Fossum p. 923' },
                  { title: 'Cambia.', body: 'Retira el introductor dejando la guía e introduce el catéter pequeño sobre ella.', cite: 'Fossum p. 924' },
                  { title: 'Comprueba.', body: 'Aspira con suavidad para confirmar la posición.', cite: 'Fossum p. 924' },
                  { title: 'Fija.', body: 'A la piel por los orificios de sutura del catéter. Si no entra entero (gatos, perros pequeños), fija la parte externa con trampa china.', cite: 'Fossum p. 924' },
                  { title: 'Radiografía y vendaje.', body: 'Igual que con el tubo grande.', cite: 'Fossum p. 923–925' },
                ],
              },
            ],
          },
          {
            id: 'drenaje',
            title: 'D. Drenaje intermitente o continuo',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Intermitente.', body: 'Suele bastar: aspira con jeringa y llave de tres vías, con guantes y jeringas estériles. Aspira suave para no meter pulmón en las perforaciones.', cite: 'Fossum p. 918, 924–925' },
                  { title: 'Continuo.', body: 'Cuando el líquido se acumula demasiado rápido, con mucho aire o tras pleurodesis: aspiración de 10–15 cm H2O, hasta 20 cm H2O con líquido viscoso.', cite: 'Fossum p. 924' },
                  { title: 'Tres frascos.', body: 'Si no hay equipo comercial: frasco colector, sello de agua (2–3 cm de agua estéril) y frasco de control de aspiración con tubo de ventilación abierto al aire; la aspiración se regula con la altura del agua (fig. 30.15). En el neumotórax sobra el colector.', cite: 'Fossum p. 924' },
                  { title: 'Válvula de Heimlich.', body: 'Solo en perros medianos y grandes: los pequeños y los gatos no generan presión espiratoria suficiente, y falla si entra líquido.', cite: 'Fossum p. 924' },
                  { title: 'No ordeñes el tubo.', body: 'Exprimirlo para soltar coágulos genera presiones intrapleurales altas y daña el pulmón.', cite: 'Fossum p. 924' },
                  { title: 'Anota.', body: 'Volumen de aire y líquido en cada aspiración, y su aspecto.' },
                ],
              },
            ],
          },
          {
            id: 'lavado',
            title: 'E. Lavado pleural en el piotórax',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Antes.', body: 'Gram, cultivo y antibiograma del líquido; inicia antibiótico de amplio espectro.', cite: 'Fossum p. 949 (recuadro 30.11)' },
                  { title: 'Uno o dos tubos.', body: 'Coloca uno o más tubos; aspiración intermitente en la mayoría, continua si está disponible.', cite: 'Fossum p. 949' },
                  { title: 'Volumen.', body: '20 mL/kg de salino o Ringer lactato isotónico, a temperatura ambiente o tibio.', cite: 'Fossum p. 949' },
                  { title: 'Heparina.', body: '1500 U por cada 100 mL de lavado (hasta 10 mL/kg), o 100 U/kg SC cada 8 h; parece beneficiosa.', cite: 'Fossum p. 949' },
                  { title: 'Deja y saca.', body: 'El líquido queda 1 hora en el tórax y luego se retira.', cite: 'Fossum p. 949' },
                  { title: 'Frecuencia.', body: '2–3 veces al día, en general durante 5–7 días.', cite: 'Fossum p. 949' },
                  { title: 'Sin antibiótico ni enzimas en el lavado.', body: 'El antibiótico en el lavado no supera al sistémico (si se usa, baja la dosis sistémica); las enzimas proteolíticas ya no se recomiendan.', cite: 'Fossum p. 949' },
                ],
              },
              { type: 'note', kind: 'book', title: 'Sin lavado recae', text: 'La recidiva es frecuente cuando el piotórax se trata solo con antibiótico, sin lavado torácico. Supervivencia publicada: 83 % en perros y 62 % en gatos (p. 950).' },
            ],
          },
          {
            id: 'toracotomia',
            title: 'F. Cuándo pasar a toracotomía',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Indicación.', body: 'Enfermedad subyacente (absceso pulmonar, torsión de lóbulo, cuerpo extraño) o falta de respuesta al tratamiento médico en 3–4 días; disnea sin mucho líquido sugiere pleuritis fibrosante.', cite: 'Fossum p. 950' },
                  { title: 'Abordaje.', body: 'Toracotomía intercostal si la lesión está en un hemitórax; esternotomía media si no se localiza.', cite: 'Fossum p. 950' },
                  { title: 'Explora y limpia.', body: 'Busca abscesos, cuerpos extraños y adherencias que loculan el líquido; quita la fibrina de los pulmones si se puede y envía muestras.', cite: 'Fossum p. 950' },
                  { title: 'Antes de cerrar.', body: 'Lava con salino estéril tibio y deja un tubo para el lavado postoperatorio. Usa sutura absorbible (PDS, Maxon); nunca seda trenzada en lobectomías con infección.', cite: 'Fossum p. 950' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio y retiro del tubo',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Oxígeno.', body: 'Si la disnea sigue tras la toracocentesis o el tubo, oxígeno nasal o en jaula.', cite: 'Fossum p. 925' },
              { title: 'Radiografía.', body: 'Para ver cuánto aire o líquido queda y la posición del tubo.', cite: 'Fossum p. 925' },
              { title: 'Vigilancia constante.', body: 'Un paciente con tubo no se deja solo: mordida, rascado o una conexión floja producen neumotórax. Vendaje torácico, pinza junto a la salida y conexiones con sutura.', cite: 'Fossum p. 925–926' },
              { title: 'Asepsia.', body: 'Guantes y jeringas estériles en cada manipulación: los tubos se contaminan con facilidad.', cite: 'Fossum p. 918, 925' },
              { title: 'Piotórax.', body: 'Sigue el lavado hasta que la infección se resuelva; controla proteínas y potasio, y mantén fluidos hasta que coma y beba. Antibiótico según cultivo, al menos 4–6 semanas y 2 semanas más allá de la resolución, cubriendo anaerobios aunque no crezcan.', cite: 'Fossum p. 949–950' },
              { title: 'Retiro con derrame.', body: 'Cuando el volumen pueda manejarse con toracocentesis intermitente; recuerda que el tubo produce unos 2,2 mL/kg/día por sí solo.', cite: 'Fossum p. 924' },
              { title: 'Retiro con neumotórax.', body: 'Tras 12–24 h de presión negativa mantenida.', cite: 'Fossum p. 924' },
              { title: 'Cultivo de la punta.', body: 'Si el tubo estuvo varios días o hay signos de infección.', cite: 'Fossum p. 924' },
              { title: 'Cierre.', body: 'Uno o dos puntos simples en la piel.', cite: 'Fossum p. 924' },
            ],
          },
          {
            type: 'table',
            columns: ['Agente', 'Antibiótico (recuadro 30.12, perros)'],
            rows: [
              ['Actinomyces', 'Ampicilina 22 mg/kg IV c/6–8 h · clindamicina 11–33 mg/kg VO c/12 h · doxiciclina 5 mg/kg VO c/12 h · amoxicilina 20–40 mg/kg c/6 h'],
              ['Nocardia', 'Trimetoprim-sulfa 45–60 mg/kg VO c/12 h · amikacina 20–25 mg/kg IV o SC c/24 h si hay resistencia (sin AINE, hidratado, control renal)'],
              ['Gatos', 'Pasteurella y anaerobios: penicilinas (ampicilina, amoxicilina-clavulánico) mientras llega el cultivo'],
            ],
            caption: 'Fossum p. 949–950. Tratar al menos 6 semanas en Nocardia y Actinomyces. E. coli es cada vez menos sensible a la enrofloxacina.',
          },
        ],
      },
    ],
    closure: [
      { layer: 'Piel alrededor del tubo', suture: 'Monofilamento no absorbible (nylon)', gauge: '2-0 o 0', pattern: 'Bolsa de tabaco sin entrar en la luz', why: 'Sella la entrada y deja los cabos largos para fijar el tubo.' },
      { layer: 'Tubo', suture: 'Los cabos de la bolsa de tabaco', gauge: '2-0 o 0', pattern: 'Trampa china o sandalia romana', why: 'Evita que el tubo salga o entre (fig. 30.10).' },
      { layer: 'Conectores', suture: 'Nylon o cinta', gauge: '2-0', pattern: 'Ligadura sobre el adaptador', why: 'Una conexión suelta produce neumotórax (fig. 30.11).' },
      { layer: 'Piel al retirar', suture: 'Nylon', gauge: '3-0', pattern: '1–2 puntos simples', why: 'Cierra el orificio; el túnel subcutáneo evita la entrada de aire.' },
    ],
    complications: [
      { name: 'Neumotórax por el tubo', prevent: 'Pinza junto a la salida, conexiones aseguradas con sutura, vendaje y vigilancia constante.', manage: 'Pinza el tubo, revisa conexiones, aspira y radiografía.' },
      { name: 'Acodamiento o mala posición', prevent: 'Medir antes, dirigir craneoventral; más frecuente con tubos pequeños.', manage: 'Radiografía; recolocar o cambiar el tubo.' },
      { name: 'Perforación pulmonar', prevent: 'Sujetar el tubo a 1–2 cm de la pared al usar trocar; toracocentesis con aguja paralela a la pared.', manage: 'Aspiración continua; toracotomía si la fuga no cede.' },
      { name: 'Empiema', prevent: 'Asepsia en cada manipulación; retirar el tubo cuanto antes (piotórax en 6 de 8 perros sanos a los 4–6 días).', manage: 'Cultivo, antibiótico y lavado.' },
      { name: 'Laceración de un vaso intercostal', prevent: 'Entrar por el borde craneal de la costilla.', manage: 'Compresión; toracotomía si el hemotórax progresa.' },
      { name: 'Pulmón aspirado en las perforaciones', prevent: 'Aspirar con suavidad; no ordeñar el tubo.', manage: 'Detener la aspiración; radiografía.' },
      { name: 'Pleuritis fibrosante', prevent: 'Drenaje eficaz de exudados y hemotórax crónicos.', manage: 'Decorticación; pronóstico malo si varios lóbulos no se expanden.' },
    ],
    quiz: [
      { q: '¿Dónde haces una toracocentesis con aguja?', a: 'En el 6.º–8.º espacio intercostal, cerca de la unión costocondral, en el centro del espacio y lejos del borde caudal de la costilla, con el bisel hacia adentro y la aguja apoyada contra la pared.' },
      { q: '¿Qué tamaño de tubo usas en un perro de 20 kg?', a: '22–28 Fr (recuadro 30.3).' },
      { q: '¿Por qué se sujeta el tubo a 1–2 cm de la pared al entrar con el trocar?', a: 'Para que no entre más de lo previsto y perfore el pulmón o el corazón.' },
      { q: '¿Cuál es la complicación principal del tubo de toracostomía?', a: 'El neumotórax por daño del tubo o conexiones flojas.' },
      { q: '¿Cómo se hace el lavado en el piotórax?', a: '20 mL/kg de salino o Ringer lactato tibio con heparina 1500 U/100 mL, 1 hora dentro, 2–3 veces al día durante 5–7 días.' },
      { q: '¿Cuándo retiras el tubo en un neumotórax?', a: 'Tras 12–24 h de presión negativa mantenida.' },
      { q: '¿En qué pacientes no sirve la válvula de Heimlich?', a: 'Perros pequeños y gatos: no generan presión espiratoria suficiente.' },
    ],
    videos: [
      { title: 'Large-Bore Thoracostomy Tube Placement in Small Animals', url: 'https://www.youtube.com/watch?v=j8o4npLj9Cc', channel: 'American Veterinary Medical Association', lang: 'inglés', note: 'Tubo de trocar paso a paso' },
      { title: 'Chest Tube Placement: Seldinger Method', url: 'https://www.youtube.com/watch?v=K-tArydxETg', channel: 'JIP VFU', lang: 'inglés', note: 'Tubo de calibre pequeño con guía' },
    ],
    sources: [
      SOURCES.fossum(30, 'cirugía de la cavidad pleural: toracocentesis, tubos de toracostomía y drenaje (pp. 917–926) y piotórax (pp. 947–951)'),
      SOURCES.plumbs,
    ],
  },
};
