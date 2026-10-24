// Cesárea (id 3). Rewritten from Fossum 5.ª ed., cap. 26 (tabla 26.4, pp. 724–726 y 735–738, 745).
const { drug, ABDOMINAL_CLOSURE, SOURCES } = require('./_common');

module.exports = {
  id: 3,
  legacy: {
    indicaciones: 'Distocia real o probable (fetos grandes, mal posicionados o malformados, canal pélvico estrecho, inercia uterina) y putrefacción fetal. Cesárea programada en braquicéfalos (Boston terrier, Bulldog inglés y francés), Mastín, Scottish terrier, perras con distocia previa o fractura pélvica mal consolidada.',
    tecnica_quirurgica: 'Preparación del abdomen antes de inducir, preoxigenación e inducción rápida. Laparotomía media desde craneal al ombligo hasta cerca del pubis, levantando la vaina del recto para no lacerar el útero. Exteriorización de los cuernos levantándolos (no traccionando) y aislamiento con paños. Histerotomía ventral en el cuerpo uterino, longitudinal o en U. Extracción de cada feto ordeñando desde craneal, rotura del saco amniótico, doble pinza del cordón y corte. Placenta: retirar solo si se suelta. Palpar el canal pélvico. Oxitocina si no hay contracción. Cierre uterino con 3-0 o 4-0 absorbible en una o dos capas (aposicional + Cushing o Lembert), lavado, cambio de guantes e instrumental, omento y cierre abdominal en tres capas con intradérmico. Alternativa: OVH en bloque en menos de 60 segundos con un segundo equipo.',
    material_quirurgico: 'Instrumental de laparotomía, pinzas Mosquito curvas para cordones, paños o compresas para aislar el útero, aspirador, toallas tibias, pera de succión, oxígeno con mascarillas pequeñas, fuente de calor (32 °C), naloxona, aguja 25 G de 1,5 cm, oxitocina y gluconato de calcio.',
    tipo_sutura: 'Útero: absorbible 3-0 o 4-0, continuo simple aposicional en una capa, dos capas aposicionales, o aposicional seguido de Cushing o Lembert. Pared: vaina externa del recto, subcutáneo y piel con intradérmico (sin cabos que molesten a las crías).',
    complicaciones_frecuentes: 'Hemorragia, hipovolemia, hipotermia, hipocalcemia (eclampsia, más en razas pequeñas con camadas grandes), anorexia, anemia, agalactia, metritis, vómitos, feto retenido, adherencias y cicatrices uterinas, problemas de la herida, shock. Mortalidad neonatal asociada a cirugía de urgencia, camadas grandes, madres braquicéfalas y mala elección anestésica.',
    manejo_anestesico_sugerido: 'Tabla 26.4 del Fossum: premedicación mínima (fentanilo si está ansiosa; glicopirrolato si no está taquicárdica). Preoxigenar 3–5 min; inducción con propofol o alfaxalona (la alfaxalona mejora la viabilidad neonatal en la primera hora) e intubación rápida; isoflurano o sevoflurano. Bloqueo incisional con lidocaína o bupivacaína; epidural con morfina sin conservante. Tras sacar a las crías: opioides completos y ketamina a dosis baja. Naloxona disponible para los neonatos.',
    consideraciones_por_raza: 'Braquicéfalos: cesárea programada frecuente, vía aérea difícil, preoxigenar y extubar tarde. Razas pequeñas: más eclampsia. Boston terrier, Bulldog, Mastín y Scottish terrier con alta frecuencia de cesárea.',
    consideraciones_comorbilidades: 'Distocia prolongada: corregir líquidos, electrolitos, glucosa y calcio antes. Muerte fetal o infección uterina: cefazolina 22 mg/kg IV. La OVH puede hacerse en el mismo acto si la paciente recibe fluidoterapia adecuada.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 26, pp. 724–726, 735–738 y 745.',
  },
  guide: {
    draft: true,
    lede: 'Extracción de los fetos por histerotomía cuando el parto no puede seguir por vía natural. El objetivo del libro es claro: sacar a todos los fetos del útero lo más rápido posible. La depresión fetal es proporcional a la depresión materna, así que la anestesia se piensa para las crías y el tiempo entre inducción y extracción se reduce al mínimo.',
    meta: { species: ['perro', 'gato'], duration: '45–90 min', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Rasura y haz una primera antisepsia del abdomen antes de inducir; ten listo al equipo de reanimación neonatal (un ayudante por cada dos crías).',
      'Preoxigena 3–5 minutos, induce rápido e intuba de inmediato; da el mínimo de fármacos antes de sacar a las crías.',
      'Saca los cuernos levantándolos, nunca traccionando: los vasos uterinos se arrancan y la pared se desgarra con facilidad.',
      'Incide en la cara ventral del cuerpo uterino, con una incisión suficiente para que el feto no la desgarre al salir.',
      'No arranques placentas adheridas, palpa el canal pélvico y cuenta las crías contra la radiografía antes de cerrar.',
    ],
    indications: [
      'Distocia por fetos grandes, mal posicionados o malformados, o por canal pélvico estrecho (p. 736).',
      'Inercia uterina que no responde al tratamiento médico.',
      'Putrefacción o muerte fetal.',
      'Cesárea programada en razas con alta frecuencia de distocia (Boston terrier, Bulldog inglés y francés, Mastín, Scottish terrier) o con antecedentes de distocia o fractura pélvica mal consolidada.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Decidir y preparar',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Confirma la distocia.', body: 'Contracciones fuertes de más de 30–60 minutos sin expulsar una cría, más de 2–4 h entre crías, fase 1 de más de 12–24 h o secreción verde oscura sin crías.' },
              { title: 'Valora los fetos.', body: 'Radiografía para número, tamaño y posición; ecografía para la frecuencia cardiaca fetal (sufrimiento por debajo de 150–160 lpm en perros).' },
              { title: 'Corrige a la madre.', body: 'Las pacientes con distocia suelen llegar con alteraciones de líquidos y electrolitos; la eclampsia preparto causa hipocalcemia. Corrige antes de operar.', cite: 'Fossum p. 736' },
              { title: 'Exámenes.', body: 'Hematocrito, proteínas totales, glucosa y calcio; en mayores de 5–7 años, electrolitos, enzimas hepáticas, urea y creatinina.', cite: 'tabla 26.4' },
              { title: 'Antibiótico.', body: 'Cefazolina 22 mg/kg IV solo si se sospecha muerte fetal o infección uterina.', cite: 'Fossum p. 736' },
              { title: 'Preparación previa.', body: 'Rasura y haz una antisepsia preliminar del abdomen antes de la inducción para acortar el tiempo hasta la extracción.', cite: 'Fossum p. 737' },
              { title: 'Equipo neonatal.', body: 'Toallas tibias, aspirador o pera, oxígeno con mascarillas pequeñas, fuente de calor a 32 °C, naloxona, aguja 25 G de 1,5 cm, pinzas para cordones.', cite: 'Fossum p. 738' },
            ],
          },
          {
            type: 'note',
            kind: 'why',
            title: 'Por qué tanta prisa',
            text: 'La gestación aumenta el volumen sanguíneo, el gasto cardiaco, la frecuencia y el consumo de oxígeno, y disminuye el hematocrito, el volumen pulmonar y el vaciamiento gástrico. La madre se desatura rápido y regurgita con facilidad, y todo lo que la deprime deprime al feto (p. 724).',
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia: pensada para las crías',
        intro: 'Premedicación mínima, preoxigenación, inducción rápida, intubación inmediata y analgesia completa recién después de sacar a las crías (tabla 26.4, p. 725).',
        blocks: [
          {
            type: 'drugs',
            items: [
              drug('Premedicación', 'Fentanilo', '0,002–0,01 mg/kg', 'IV', 'Solo si está ansiosa. 2–10 µg/kg en perras, 1–4 µg/kg en gatas.'),
              drug('Premedicación', 'Glicopirrolato', '0,005–0,01 mg/kg', 'IV', 'Si no está taquicárdica, y durante la cirugía si hay bradicardia al manipular el útero.'),
              drug('Preoxigenación', 'Oxígeno', '3–5 min', 'Mascarilla'),
              drug('Inducción', 'Alfaxalona', '2–5 mg/kg', 'IV, a efecto', 'Mejor viabilidad neonatal en la primera hora que con propofol (dosis de la tabla 26.4, sin premedicación).'),
              drug('Inducción', 'Propofol', '4–8 mg/kg', 'IV, a efecto', 'Sin premedicación hacen falta dosis más altas; titula.'),
              drug('Mantenimiento', 'Isoflurano o sevoflurano', 'Mínimo eficaz', 'Inhalatoria', 'Con fentanilo en bolos según necesidad hasta sacar a las crías.'),
              drug('Bloqueo', 'Lidocaína incisional', '5 mg/kg (máximo)', 'Infiltración de la línea de incisión', 'En gatas, 2–4 mg/kg como máximo.'),
              drug('Bloqueo', 'Bupivacaína incisional', '2 mg/kg (máximo)', 'Infiltración de la línea de incisión'),
              drug('Epidural', 'Morfina sin conservante', '0,075 mg/kg', 'Epidural', 'Tras la inducción y antes de la preparación final; reduce el anestésico necesario.'),
              drug('Tras sacar a las crías', 'Ketamina', '0,5–1 mg/kg', 'IV', 'Dosis baja, junto con un opioide completo.'),
              drug('Tras sacar a las crías', 'Metadona', '0,2–0,3 mg/kg', 'IV o IM', 'O hidromorfona 0,05–0,2 mg/kg IV (tabla 26.4).'),
              drug('Útero', 'Oxitocina', '2 UI/kg (máximo 20 UI)', 'IM', 'Perras (Box 26.6). Gatas: 2–3 UI IM o IV, máximo 3 UI por gata, hasta 3 veces cada 30–60 min.'),
              drug('Neonatos', 'Naloxona', '1–2 gotas', 'Sublingual', 'Si la cría está deprimida por el opioide de la madre.'),
            ],
          },
          { type: 'note', kind: 'error', title: 'Evitar', bullets: ['Agonistas α2 y acepromacina: depresión materna y fetal prolongada.', 'Inhalatorio alto: baja la presión de la madre y la perfusión uterina.', 'Óxido nitroso sin dar oxígeno a las crías al nacer (p. 724).'] },
          { type: 'note', kind: 'book', title: 'Líquidos', text: 'La tabla 26.4 indica 10–20 mL/kg/h más tres veces la pérdida de sangre estimada, con monitoreo de presión, ECG, SpO2, EtCO2 y temperatura.' },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          {
            id: 'abordaje',
            title: 'A. Posición y abordaje',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Posición.', body: 'Decúbito dorsal. Puedes inclinar la mesa con la cabeza 15–30° más alta que la cola para quitar presión al diafragma y reducir la contaminación del abdomen.', cite: 'Fossum p. 737' },
                  { title: 'Antisepsia final.', body: 'Última preparación del abdomen ventral.' },
                  { title: 'Incisión.', body: 'Línea media desde justo craneal al ombligo hasta cerca del pubis. Las mamas están congestionadas: no las incidas.', cite: 'Fossum p. 737' },
                  { title: 'Entra con cuidado.', body: 'Levanta la vaina externa del recto antes de la incisión punzante en la línea alba: el útero está justo debajo y se lacera fácil.', cite: 'Fossum p. 737' },
                  { title: 'Exterioriza los cuernos.', body: 'Levántalos con cuidado en lugar de tirar de ellos (fig. 26.12): los vasos se arrancan y la pared se rompe.', cite: 'Fossum p. 737' },
                  { title: 'Aísla.', body: 'Rodea el útero con paños o compresas estériles.' },
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
                  { title: 'Incide el cuerpo uterino.', body: 'Levanta en tienda la cara ventral del cuerpo e incide con cuidado de no cortar al feto.', cite: 'Fossum p. 737–738' },
                  { title: 'Amplía.', body: 'Con tijera de Metzenbaum, longitudinal por la cara ventral del cuerpo o en U de un cuerno al otro. Debe ser suficiente para que no se desgarre al sacar los fetos.', cite: 'Fossum p. 738' },
                  { title: 'Ordeña cada cuerno.', body: 'Aprieta suavemente craneal a cada feto para llevarlo a la incisión, tómalo y sácalo con delicadeza (fig. 26.13).', cite: 'Fossum p. 738' },
                  { title: 'Saco y cordón.', body: 'Rompe el saco amniótico y pinza el cordón con dos Mosquito curvas; corta entre ellas.', cite: 'Fossum p. 738' },
                  { title: 'Sin contaminar.', body: 'Evita que el líquido amniótico caiga al abdomen o al campo. Entrega cada cría al ayudante de forma aséptica.' },
                  { title: 'Placenta.', body: 'A término suele salir con la cría. Si no se ha separado, tracciónala con suavidad; nunca la arranques de la pared o habrá hemorragia grave.', cite: 'Fossum p. 738' },
                  { title: 'Canal pélvico.', body: 'Palpa el canal y saca cualquier feto que esté ahí.', cite: 'Fossum p. 738' },
                  { title: 'Cuenta.', body: 'Revisa ambos cuernos hasta los ovarios y compara con la radiografía.' },
                ],
              },
            ],
          },
          {
            id: 'cierre-utero',
            title: 'C. Útero y cierre',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Contracción.', body: 'El útero empieza a contraerse al vaciarse. Si no, oxitocina o maleato de ergonovina (Box 26.6). Si el endometrio sangra mucho, oxitocina y compresión de la pared.', cite: 'Fossum p. 738' },
                  { title: 'Lava el útero.', body: 'Retira restos de la superficie externa.' },
                  { title: 'Cierra el útero.', body: 'Absorbible 3-0 o 4-0: continuo simple aposicional en una capa, dos capas aposicionales (mucosa-submucosa y luego muscular-serosa), o aposicional seguida de Cushing o Lembert.', cite: 'Fossum p. 738' },
                  { title: 'Cambia todo.', body: 'Lava el sitio y reemplaza paños, gasas, instrumental y guantes contaminados.', cite: 'Fossum p. 738' },
                  { title: 'Revisa vasos.', body: 'Busca vasos uterinos arrancados y controla la hemorragia.' },
                  { title: 'Lava el abdomen.', body: 'Si hubo derrame de contenido uterino.' },
                  { title: 'Omento.', body: 'Cubre la histerotomía con omento para reducir adherencias.', cite: 'Fossum p. 738, 743' },
                  { title: 'Pared.', body: 'Tres capas: vaina del recto, subcutáneo y piel con intradérmico, para que no queden cabos que molesten a las crías.', cite: 'Fossum p. 738' },
                  { title: 'Limpia.', body: 'Retira antisépticos, sangre y restos del abdomen y las mamas antes de que mamen.', cite: 'Fossum p. 738' },
                ],
              },
              { type: 'note', kind: 'book', title: 'Cesárea con OVH', text: 'Si la madre no se va a reproducir, se sacan las crías como se describe y luego se hace la OVH habitual (p. 728). Es segura si recibe fluidoterapia adecuada (p. 736).' },
            ],
          },
          {
            id: 'bloque',
            title: 'D. OVH en bloque',
            intro: 'Se extirpa el útero grávido entero antes de abrirlo. Poco tiempo anestésico, mínima contaminación y esterilización sin segunda cirugía; necesita un segundo equipo y no se hace si los fetos están en sufrimiento, bradicárdicos o hipóxicos (p. 736–737).',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Prepara los pedículos.', body: 'Exterioriza y aísla los pedículos ováricos y separa el ligamento ancho del útero hasta el cérvix.', cite: 'Fossum p. 738' },
                  { title: 'Fetos caudales.', body: 'Empuja al cuerpo uterino cualquier feto que esté en la vagina o el cérvix.' },
                  { title: 'Pinza.', body: 'Doble o triple pinza en los pedículos ováricos y en el útero justo craneal al cérvix.' },
                  { title: 'Corta y entrega.', body: 'Corta entre pinzas y entrega el útero al equipo que lo abre y reanima a las crías. Desde el pinzado hasta sacar a los neonatos: menos de 60 segundos.', cite: 'Fossum p. 738' },
                  { title: 'Liga.', body: 'Doble ligadura de pedículos ováricos y uterino, revisa y cierra.' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'neonatos',
        title: 'Cuidado de los neonatos',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Aspira.', body: 'Narinas y nasofaringe, con suavidad.', cite: 'Fossum p. 738' },
              { title: 'Oxígeno.', body: 'Flujo libre o mascarillas pequeñas.' },
              { title: 'Seca y frota.', body: 'Frota con energía cada cría para estimular la respiración.' },
              { title: 'Naloxona.', body: 'Una gota sublingual si sospechas depresión por opioide.' },
              { title: 'Punto de reanimación.', body: 'Aguja 25 G de 1,5 cm, 2–4 mm de profundidad en la línea media del surco entre el labio superior y la nariz; gírala hasta tocar hueso.', cite: 'Fossum p. 738' },
              { title: 'Doxapram.', body: 'Su uso es controvertido: aumenta la demanda de oxígeno, contraindicado en una cría hipoxémica o bradicárdica.', cite: 'Fossum p. 738' },
              { title: 'Cordón.', body: 'Liga, corta y desinfecta el cordón umbilical.' },
              { title: 'Revisa anomalías.', body: 'Paladar hendido, deformidades de miembros, hernias, ano imperforado.', cite: 'Fossum p. 738' },
              { title: 'Calor.', body: 'Ambiente a 32 °C hasta que la madre pueda cuidarlas.' },
              { title: 'Calostro.', body: 'Que mamen en cuanto la madre esté extubada. Vigila su conducta las primeras horas: algunas rechazan o matan a las crías.', cite: 'Fossum p. 738' },
              { title: 'Alta temprana.', body: 'Envía a la madre y las crías a casa lo antes posible para reducir estrés y exposición a patógenos.' },
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
              { title: 'Madre.', body: 'Temperatura, mucosas, presión y glucosa; calcio si sospechas eclampsia (calcio iónico de 6 mg/dL o menos). La eclampsia puede aparecer durante todo el primer mes posparto.', cite: 'Fossum p. 745' },
              { title: 'Loquios.', body: 'Secreción rojo oscuro a serosa, sin olor, normal 4–6 semanas. Olor fétido o pus: metritis.', cite: 'Fossum p. 745' },
              { title: 'Analgesia.', body: 'Opioide las primeras horas; AINE (meloxicam en dosis única según la tabla 26.4) si la función renal y la presión son normales.' },
              { title: 'Herida.', body: 'Sin collar si es posible (estorba al amamantar); body si se lame.' },
              { title: 'Lactancia.', body: 'Comprueba que haya leche y que las crías ganen peso cada día; vigila mastitis.' },
            ],
          },
        ],
      },
    ],
    closure: [
      { layer: 'Útero', suture: 'Absorbible monofilamento (PDS, Monocryl)', gauge: '3-0 o 4-0', pattern: 'Continuo simple aposicional; o dos capas aposicionales; o aposicional + Cushing o Lembert', why: 'Sella sin estrechar; la segunda capa invaginante reduce adherencias.' },
      ...ABDOMINAL_CLOSURE.slice(0, 2),
      { layer: 'Piel', suture: 'Monocryl', gauge: '4-0', pattern: 'Intradérmico', why: 'Sin cabos que irriten a las crías que maman (p. 738).' },
    ],
    complications: [
      { name: 'Neonatos deprimidos', prevent: 'Preparar antes de inducir, fármacos mínimos y reversibles, alfaxalona o propofol, sin α2.', manage: 'Aspirar, secar, oxígeno, calor, naloxona, punto de reanimación nasolabial.' },
      { name: 'Hemorragia uterina', prevent: 'Levantar los cuernos sin traccionar, no arrancar placentas.', manage: 'Oxitocina y compresión; OVH si es grave (p. 745).' },
      { name: 'Hipocalcemia (eclampsia)', prevent: 'Medir el calcio en razas pequeñas con camadas grandes.', manage: 'Gluconato de calcio IV lento con ECG.' },
      { name: 'Hipotermia e hipovolemia', prevent: 'Calor activo, fluidos 10–20 mL/kg/h más pérdidas.', manage: 'Calentar, bolos de cristaloides, transfusión si hace falta.' },
      { name: 'Metritis', prevent: 'Retirar crías y membranas, asepsia.', manage: 'Antibiótico; OVH si es grave.' },
      { name: 'Agalactia o rechazo de las crías', prevent: 'Crías a mamar pronto, buen control del dolor, alta temprana.', manage: 'Estimular la succión, alimentación artificial si hace falta.' },
      { name: 'Adherencias y cicatriz uterina', prevent: 'Cierre invaginante y omento.', manage: 'Pueden impedir futuras placentaciones (p. 745).' },
    ],
    quiz: [
      { q: '¿Por qué se rasura y prepara el abdomen antes de inducir?', a: 'Para acortar el tiempo entre la inducción y la extracción, porque la depresión fetal es proporcional a la materna.' },
      { q: '¿Qué agente de inducción mejora la viabilidad neonatal según el Fossum?', a: 'La alfaxalona, frente al propofol, en los primeros 60 minutos tras el nacimiento.' },
      { q: '¿Cómo se sacan los cuernos y por qué?', a: 'Levantándolos, no traccionando, porque los vasos uterinos se arrancan y la pared se desgarra con facilidad.' },
      { q: '¿Qué haces con una placenta adherida?', a: 'Traccionarla suavemente; si no se suelta, dejarla, porque arrancarla provoca hemorragia grave.' },
      { q: '¿Cuál es la dosis de oxitocina en la perra según el Box 26.6?', a: '2 UI/kg IM con un máximo de 20 UI.' },
      { q: '¿Cuándo no se hace la OVH en bloque?', a: 'Cuando los fetos están en sufrimiento, bradicárdicos o hipóxicos; además exige un segundo equipo y sacar a las crías en menos de 60 segundos.' },
    ],
    videos: [
      { title: '¿Cómo anestesiar y realizar una cesárea en perras?', url: 'https://www.youtube.com/watch?v=JbGqVEWX8Do', channel: 'Cachorros de Raza', lang: 'español', note: 'Anestesia y técnica' },
      { title: 'Cesárea y OVH en una perra', url: 'https://www.youtube.com/watch?v=BHgmqG3nvhA', channel: 'Clínica Veterinaria Miraflores', lang: 'español', note: 'Cesárea con OVH en el mismo acto' },
    ],
    sources: [
      SOURCES.fossum(26, 'cirugía de los aparatos reproductor y genital: anestesia en la cesárea (tabla 26.4, pp. 724–726), cesárea y cuidado neonatal (pp. 735–738), complicaciones (p. 745)'),
      { text: 'Doebeli A y col. Alfaxalona versus propofol para la inducción en la cesárea canina. Theriogenology, 2013.', kind: 'complemento' },
      SOURCES.plumbs,
    ],
  },
};
