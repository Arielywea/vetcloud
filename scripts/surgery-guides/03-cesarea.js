// Cesárea (id 3). Full depth: an emergency where anesthesia decides the outcome for the litter.
const { pick, drug, ABDOMINAL_CLOSURE, SOURCES } = require('./_common');

module.exports = {
  id: 3,
  legacy: {
    indicaciones: 'Distocia que no responde al tratamiento médico (inercia uterina primaria o secundaria); feto demasiado grande o malposición no corregible; estrechez pélvica; sufrimiento fetal (frecuencia cardiaca fetal <150–160 lpm en perros); feto muerto retenido; cesárea programada en razas braquicéfalas o con antecedentes.',
    tecnica_quirurgica: 'Celiotomía por línea media desde el ombligo hasta el pubis, sin dañar las mamas. Exteriorización del útero aislándolo con compresas. Histerotomía ventral en el cuerpo uterino, en la zona menos vascularizada. Extracción de cada feto con sus membranas, pinza y corte del cordón a 2–3 cm. Revisión de ambos cuernos y del canal pélvico. Cierre del útero en una o dos capas con absorbible monofilamento (continuo simple más Cushing o Lembert invaginante). Lavado del útero y del campo, cambio de guantes y cierre abdominal habitual. Opcional: OVH en el mismo acto si la madre no se va a reproducir.',
    material_quirurgico: 'Instrumental de laparotomía, separador de Balfour, compresas estériles húmedas, pinzas Babcock, aspirador, toallas tibias, pera de succión, pinzas mosquito para cordones, incubadora o fuente de calor para los neonatos, oxígeno.',
    tipo_sutura: 'Útero: PDS o Monocryl 3-0 (2-0 en perras grandes), continuo simple aposicional seguido de patrón invaginante (Cushing o Lembert). Línea alba: PDS 2-0 a 1 según peso. Subcutáneo e intradérmico: Monocryl 3-0 o 4-0 (intradérmico evita puntos que molesten al amamantar).',
    complicaciones_frecuentes: 'Hipotensión y depresión neonatal por la anestesia; hemorragia uterina; metritis; peritonitis por contaminación con líquido uterino; agalactia; mastitis; dehiscencia; rechazo de las crías.',
    manejo_anestesico_sugerido: 'Preoxigenar 3–5 min. Premedicación mínima (opioide de acción corta o metadona a dosis baja). Inducción con propofol o alfaxalona a efecto. Mantenimiento con isoflurano o sevoflurano a la menor concentración posible. Bloqueo de la línea de incisión con lidocaína. Evitar agonistas α2, ketamina a dosis altas y acepromacina. AINE solo después de extraer los fetos, si la madre está estable.',
    consideraciones_por_raza: 'Braquicéfalas (Bulldog inglés y francés, Boston Terrier): cesárea programada casi siempre; vía aérea difícil, preoxigenar e intubar rápido, extubar lo más tarde posible. Razas miniatura: inercia uterina frecuente, fetos únicos grandes.',
    consideraciones_comorbilidades: 'Hipocalcemia e hipoglucemia de la madre: medir y corregir antes. Deshidratación o shock por distocia prolongada: fluidoterapia antes de inducir. Fetos muertos o putrefactos: considerar OVH y antibiótico.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 26; Plumb\'s Veterinary Drug Handbook; literatura de anestesia obstétrica.',
  },
  guide: {
    draft: true,
    lede: 'Extracción de los fetos por histerotomía cuando el parto no puede seguir por vía natural. Son dos pacientes a la vez: todo lo que recibe la madre llega a las crías, así que la anestesia se piensa para ellas y la cirugía se hace rápido y limpio.',
    meta: { species: ['perro', 'gato'], duration: '45–90 min', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Prepara el equipo de reanimación neonatal antes de inducir: toallas tibias, aspirador o pera, fuente de calor, oxígeno, naloxona y un ayudante por cada dos crías.',
      'Rasura y haz la antisepsia del abdomen con la perra despierta o sedada, para que el tiempo desde la inducción hasta la extracción sea mínimo.',
      'Preoxigena 3–5 minutos e induce con la menor dosis posible; nada de agonistas α2 ni acepromacina.',
      'Incide el útero en el cuerpo, en la cara ventral y en la zona menos vascularizada; una sola histerotomía suele bastar para todas las crías.',
      'Cuenta las crías extraídas contra las vistas en la radiografía y revisa ambos cuernos y el canal pélvico antes de cerrar.',
    ],
    indications: [
      'Inercia uterina primaria o secundaria que no responde a calcio y oxitocina.',
      'Feto demasiado grande, malposición o malformación que no se corrige por manipulación.',
      'Estrechez del canal pélvico (fracturas antiguas, razas braquicéfalas).',
      'Sufrimiento fetal: frecuencia cardiaca fetal menor de 150–160 lpm en perros (menor de 150 en gatos) por ecografía.',
      'Fetos muertos o putrefactos, torsión o rotura uterina.',
      'Cesárea programada en razas con alto riesgo de distocia o con cesáreas previas.',
    ],
    sections: [
      {
        id: 'decision',
        title: 'Decidir y preparar',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Confirma la distocia.', body: 'Más de 30–60 minutos de contracciones fuertes sin expulsar una cría, más de 2–4 horas entre crías, fase 1 que dura más de 12–24 horas o secreción verde oscura sin crías.' },
              { title: 'Cuenta y valora los fetos.', body: 'Radiografía para el número, tamaño y posición; ecografía para la frecuencia cardiaca fetal (sufrimiento por debajo de 150–160 lpm).' },
              { title: 'Estabiliza a la madre.', body: 'Vía venosa, fluidos, glucosa y calcio ionizado. Corrige la hipocalcemia y la hipoglucemia antes de anestesiar.' },
              { title: 'Prepara el campo antes de inducir.', body: 'Rasura y lava el abdomen con la paciente despierta o con sedación mínima. Inclinar ligeramente la mesa evita que el útero comprima la cava.' },
              { title: 'Prepara la reanimación neonatal.', body: 'Incubadora o caja con calor, toallas tibias, aspirador, oxígeno, naloxona (y doxapram si se usa en tu clínica), hilo o pinzas para cordones.' },
            ],
          },
          { type: 'note', kind: 'why', title: 'Por qué tanta prisa antes de inducir', text: 'Cada minuto entre la inducción y la extracción expone a los fetos a más anestésico y menos oxígeno. Si todo está listo, ese tiempo puede ser de 10–15 minutos.' },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia: pensada para las crías',
        intro: 'Todos los anestésicos cruzan la placenta. Se eligen los de acción corta o reversibles, a la menor dosis eficaz, y la analgesia fuerte se da después de sacar a las crías.',
        blocks: [
          {
            type: 'drugs',
            items: [
              drug('Preoxigenación', 'Oxígeno', '3–5 min', 'Mascarilla', 'Aumenta la reserva de oxígeno de madre y fetos.'),
              drug('Premedicación', 'Metadona', '0,1–0,2 mg/kg', 'IM o IV', 'Dosis baja; reversible con naloxona en los neonatos. Opcional si la madre está tranquila.'),
              drug('Inducción', 'Alfaxalona', '1–2 mg/kg', 'IV, a efecto', 'Asociada a mejor vitalidad neonatal que el propofol en algunos estudios; ambos son aceptables.'),
              drug('Inducción', 'Propofol', '2–4 mg/kg', 'IV lento, a efecto'),
              drug('Mantenimiento', 'Isoflurano', '1–1,5 % en O2', 'Inhalatoria', 'La gestación reduce la concentración necesaria.'),
              drug('Local', 'Lidocaína', '2 mg/kg (máximo)', 'Infiltración de la línea de incisión', 'Permite menos inhalatorio. En gatas, máximo 1 mg/kg.'),
              drug('Tras extraer las crías', 'Metadona', '0,2–0,3 mg/kg', 'IV', 'Analgesia completa de la madre.'),
              drug('Tras extraer las crías', 'Meloxicam', '0,1–0,2 mg/kg', 'SC, una vez', 'Solo si está normotensa e hidratada. Pasa poco a la leche; una dosis se considera aceptable.'),
              drug('Útero', 'Oxitocina', '0,5–2 UI por animal (perra) · 0,5 UI (gata)', 'IM o IV lento', 'Tras cerrar el útero, si hay atonía o hemorragia.'),
            ],
          },
          { type: 'note', kind: 'error', title: 'Qué evitar', bullets: ['Dexmedetomidina y xilacina: bradicardia y depresión fetal marcada.', 'Acepromacina: hipotensión de la madre y efecto prolongado en los neonatos.', 'Ketamina a dosis altas y benzodiazepinas: neonatos deprimidos e hipotónicos.', 'Inhalatorio alto "para que no se mueva": baja la presión de la madre y la perfusión uterina.'] },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          {
            id: 'abordaje',
            title: 'A. Abordaje',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Incisión.', body: 'Línea media desde el ombligo hasta cerca del pubis. Las mamas están congestionadas: no las incidas ni las traumatices.' },
                  { title: 'Entra con cuidado.', body: 'La pared es delgada y el útero está justo debajo: levanta la línea alba en tienda e incide con el filo hacia arriba.' },
                  { title: 'Exterioriza el útero.', body: 'Saca el útero con suavidad, sujetándolo con la palma (nunca de los vasos) y aíslalo con compresas húmedas para que el líquido uterino no caiga al abdomen.' },
                ],
              },
            ],
          },
          {
            id: 'histerotomia',
            title: 'B. Histerotomía y extracción',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Incide el útero.', body: 'En la cara ventral del cuerpo uterino, en la zona menos vascularizada, de largo suficiente para sacar la cría más grande sin desgarrar.' },
                  { title: 'Saca la primera cría.', body: 'Empuja con suavidad cada feto por el cuerno hacia la incisión (ordeñando desde afuera), no tires de él. Sácalo con sus membranas.' },
                  { title: 'Abre las membranas.', body: 'Rómpelas sobre la cara para despejar la boca y la nariz, y entrega la cría al ayudante.' },
                  { title: 'Pinza el cordón.', body: 'Dos pinzas mosquito a 2–3 cm del abdomen de la cría y corte entre ellas. El ayudante liga después con hilo si sangra.' },
                  { title: 'Retira la placenta.', body: 'Tracción suave; si no se suelta fácil, déjala: se expulsa sola y forzarla sangra.' },
                  { title: 'Repite.', body: 'Todas las crías por la misma incisión, ordeñando desde la punta de cada cuerno.' },
                  { title: 'Revisa.', body: 'Palpa ambos cuernos hasta los ovarios y el canal pélvico: una cría encajada en la pelvis se empuja hacia el útero desde la vagina con ayuda de un asistente.' },
                ],
              },
              { type: 'note', kind: 'tip', title: 'Una incisión o dos', text: 'Con fetos muy grandes o el útero muy distendido, a veces hace falta una segunda histerotomía en un cuerno. Antes de hacerla, intenta ordeñar el feto hacia la primera.' },
            ],
          },
          {
            id: 'cierre-utero',
            title: 'C. Cierre del útero',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Primera capa.', body: 'Continuo simple aposicional con absorbible monofilamento 3-0, tomando todo el espesor de la pared sin entrar en la luz.' },
                  { title: 'Segunda capa.', body: 'Patrón invaginante (Cushing o Lembert) sobre la primera, sin perforar la mucosa. Sella la línea y reduce las adherencias.' },
                  { title: 'Involución.', body: 'El útero se contrae visiblemente en minutos; si queda flácido o sangra, oxitocina.' },
                  { title: 'Lava.', body: 'Limpia el útero con solución salina tibia, retira las compresas contaminadas, cámbiate los guantes y el instrumental antes de cerrar el abdomen.' },
                ],
              },
              { type: 'note', kind: 'book', title: 'Cesárea con OVH en el mismo acto', text: 'Si la madre no se va a reproducir, la OVH puede hacerse después de extraer las crías. Alarga la cirugía y sangra más (útero grande y vascularizado), pero la lactancia y la supervivencia de las crías son similares.' },
            ],
          },
        ],
      },
      {
        id: 'neonatos',
        title: 'Reanimación de los neonatos',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Despeja la vía aérea.', body: 'Aspira boca y nariz con pera o aspirador suave. No sacudas a la cría (riesgo de hemorragia cerebral).' },
              { title: 'Seca y estimula.', body: 'Frota con toalla tibia el tórax y el dorso hasta que llore y respire.' },
              { title: 'Oxígeno.', body: 'Mascarilla pequeña si respira poco. Si no respira, ventila con mascarilla ajustada.' },
              { title: 'Naloxona.', body: 'Si la madre recibió opioide y la cría está deprimida: 0,01–0,02 mg/kg IV en la vena umbilical, o 1–2 gotas sublinguales.' },
              { title: 'Calor.', body: 'La hipotermia es la principal causa de muerte temprana: mantenlas a 30–32 °C hasta que estén con la madre.' },
              { title: 'Valora.', body: 'Puntaje de Apgar modificado a los 5 minutos: frecuencia cardiaca, respiración, reflejo de succión, movilidad y color de mucosas.' },
              { title: 'Con la madre.', body: 'Pon las crías a mamar en cuanto la madre esté despierta y tranquila; supervisa que no las aplaste.' },
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
              { title: 'Madre.', body: 'Temperatura, mucosas, presión y secreción vaginal (loquios rojo oscuro normales hasta 3–6 semanas; olor fétido o pus son anormales).' },
              { title: 'Analgesia.', body: 'Opioide en las primeras horas y AINE 3 días si la función renal es normal.' },
              { title: 'Herida.', body: 'Intradérmico para que las crías no se enganchen en los puntos. Sin collar si es posible (estorba al amamantar); usa body si se lame.' },
              { title: 'Lactancia.', body: 'Revisa que haya leche y que las crías ganen peso cada día. Vigila mastitis.' },
              { title: 'Control.', body: 'A las 24–48 h y a los 10–14 días.' },
            ],
          },
        ],
      },
    ],
    closure: [
      { layer: 'Útero, primera capa', suture: 'PDS o Monocryl', gauge: '3-0 (2-0 en perras grandes)', pattern: 'Continuo simple aposicional', why: 'Cierra todo el espesor sin entrar en la luz.' },
      { layer: 'Útero, segunda capa', suture: 'PDS o Monocryl', gauge: '3-0', pattern: 'Cushing o Lembert', why: 'Invagina la línea, sella mejor y reduce adherencias.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Neonatos deprimidos', prevent: 'Campo preparado antes de inducir, fármacos de acción corta, dosis mínimas, sin α2.', manage: 'Reanimación: vía aérea, estímulo, oxígeno, calor, naloxona si hubo opioide.' },
      { name: 'Hipotensión materna', prevent: 'Fluidos antes de inducir, inhalatorio bajo, evitar compresión de la cava.', manage: 'Bolo de cristaloides, bajar el inhalatorio, vasopresor si persiste.' },
      { name: 'Hemorragia uterina', prevent: 'Incidir en la zona avascular; no arrancar placentas adheridas.', manage: 'Oxitocina, compresión, sutura; OVH si no se controla.' },
      { name: 'Peritonitis', prevent: 'Aislar el útero con compresas, cambiar guantes e instrumental, lavar.', manage: 'Lavado abdominal, antibiótico, drenaje si es séptica.' },
      { name: 'Metritis', prevent: 'Retirar todas las crías y membranas posibles; asepsia.', manage: 'Antibiótico, soporte; OVH si es grave.' },
      { name: 'Agalactia o mastitis', prevent: 'Crías a mamar pronto, buen control del dolor.', manage: 'Estimular la succión; antibiótico compatible con lactancia en mastitis.' },
    ],
    quiz: [
      { q: '¿Por qué se rasura y prepara el abdomen antes de inducir?', a: 'Para acortar el tiempo entre la inducción y la extracción, que es el tiempo que los fetos reciben anestésico.' },
      { q: '¿Qué fármacos evitas en la cesárea y por qué?', a: 'Agonistas α2 (bradicardia y depresión fetal), acepromacina (hipotensión y efecto largo) y dosis altas de ketamina o benzodiazepinas (neonatos deprimidos).' },
      { q: '¿Dónde incides el útero?', a: 'En la cara ventral del cuerpo uterino, en la zona menos vascularizada, y se intenta sacar todas las crías por esa incisión.' },
      { q: 'Una cría no respira: ¿qué haces en orden?', a: 'Despejar la vía aérea, secar y estimular, oxígeno o ventilación, calor, y naloxona si la madre recibió opioide.' },
      { q: '¿Cómo se cierra el útero?', a: 'Dos capas con absorbible monofilamento 3-0: continuo simple aposicional y encima un patrón invaginante (Cushing o Lembert).' },
    ],
    videos: [
      { title: '¿Cómo anestesiar y realizar una cesárea en perras?', url: 'https://www.youtube.com/watch?v=JbGqVEWX8Do', channel: 'Cachorros de Raza', lang: 'español', note: 'Anestesia y técnica' },
      { title: 'Cesárea y OVH en una perra', url: 'https://www.youtube.com/watch?v=BHgmqG3nvhA', channel: 'Clínica Veterinaria Miraflores', lang: 'español', note: 'Cesárea con OVH en el mismo acto' },
    ],
    sources: [
      SOURCES.fossum(26, 'cirugía de los aparatos reproductor y genital'),
      { text: 'Traas AM. Cesárea y reanimación neonatal en perros y gatos. Theriogenology, 2008.', kind: 'complemento' },
      { text: 'Doebeli A y col. Alfaxalona versus propofol para la inducción en la cesárea canina. Theriogenology, 2013.', kind: 'complemento' },
      SOURCES.aaha,
      SOURCES.plumbs,
    ],
  },
};
