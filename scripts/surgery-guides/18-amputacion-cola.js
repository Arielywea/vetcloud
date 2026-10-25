// Amputación de cola (id 18). Rewritten from Fossum 5.ª ed., cap. 15 (pp. 252–256).
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 18,
  legacy: {
    indicaciones: 'Caudectomía terapéutica: lesiones traumáticas, infección, neoplasia y posiblemente fístula perianal; punta de la cola que sangra crónicamente por roce o mordisqueo; cola avulsionada; pioderma del pliegue de la cola (cola en tirabuzón). Con márgenes de 2–3 cm de tejido normal en tumores y lesiones traumáticas. La amputación estética está prohibida en Chile (Ley 21.020).',
    tecnica_quirurgica: 'Parcial: cubrir la cola distal, torniquete proximal, piel retraída hacia la base, doble incisión en V distal al espacio elegido para formar colgajos dorsal y ventral más largos que el muñón, ligar las arterias y venas caudales medial y laterales justo craneal al corte, desarticular con bisturí, ligadura circunferencial del muñón o nueva ligadura de vasos si sangra, subcutáneo y músculo sobre las vértebras con 3-0 absorbible, colgajo dorsal encima, recortar el ventral y suturar la piel con 3-0 o 4-0 no absorbible. Completa: incisión elíptica alrededor de la base, separar el elevador del ano, el rectococcígeo y el coccígeo de las vértebras, ligar los vasos caudales y desarticular entre la 2.ª y 3.ª vértebra caudal; aproximar el elevador del ano y el subcutáneo, drenaje si hace falta.',
    material_quirurgico: 'Gasa o guante para la cola distal, torniquete, bisturí, pinzas hemostáticas Mosquito, pinzas óseas o de campo para manejar la cola, sierra de Gigli o cizalla ósea, gubia o lima ósea, drenaje de aspiración cerrada.',
    tipo_sutura: 'Vasos caudales: absorbible. Músculo y subcutáneo: PDS, Monocryl, Biosyn o Maxon 3-0 o 4-0, simples o continuo. Piel: nylon, polibutéster o polipropileno 3-0 o 4-0 con aguja de corte inverso.',
    complicaciones_frecuentes: 'Infección, dehiscencia (cicatriza por segunda intención con cicatriz sin pelo), cicatriz, recidiva de la fístula, lesión del esfínter anal o del recto (amputación completa); puede hacer falta reamputar.',
    manejo_anestesico_sugerido: 'En perros y gatos de más de una semana, anestesia general o epidural. Epidural sacrococcígea con lidocaína para la cola; opioide y AINE postoperatorio.',
    consideraciones_por_raza: 'Pioderma del pliegue de la cola en braquicéfalos (Bulldog inglés), Schipperke y gatos Manx. Cola feliz en razas de cola larga y activa.',
    consideraciones_comorbilidades: 'Pioderma del pliegue: tratar y cultivar antes; fistulografía o sondaje de los trayectos. Gatos con cola avulsionada: valorar vejiga, tono anal y sensibilidad perineal.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 15, pp. 252–256; Ley 21.020 (Chile).',
  },
  guide: {
    draft: true,
    lede: 'Amputación terapéutica de la cola, parcial o completa. Se desarticula en un espacio intervertebral, con colgajos de piel que cubran el muñón sin tensión. La cicatrización no da problemas si se evita la tensión y el autotraumatismo. La amputación estética es éticamente controvertida y en Chile está prohibida.',
    meta: { species: ['perro', 'gato'], duration: '30–60 min (parcial); 60–90 min (completa)', difficulty: 'básica', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Solo con indicación terapéutica; la caudectomía estética está prohibida por la Ley 21.020.',
      'Márgenes de 2–3 cm de tejido normal en tumores y lesiones traumáticas; cerca del ano si la punta sangra crónicamente; cerca de la base en colas avulsionadas o pliegues infectados.',
      'Desarticula en un espacio intervertebral con bisturí; no cortes a través de la vértebra salvo que esté anquilosada.',
      'Haz los colgajos más largos de lo que debe quedar el muñón.',
      'Liga las arterias y venas caudales medial y laterales antes de soltar el torniquete.',
    ],
    indications: [
      'Traumatismo, infección o neoplasia de la cola; posiblemente fístula perianal (p. 253).',
      'Punta de la cola que sangra crónicamente por roce o mordisqueo ("cola feliz"): amputación cerca del ano.',
      'Cola avulsionada; pioderma del pliegue de la cola (cola en tirabuzón): amputación cerca de la base o completa.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Nivel.', body: 'Palpa y radiografía la cola para decidir el nivel y ver la deformidad vertebral en las colas en tirabuzón.', cite: 'Fossum p. 252' },
              { title: 'Pliegues y trayectos.', body: 'Sondea los trayectos o haz una fistulografía para saber su origen; descarta fístula perianal, saculitis anal, tumores, trauma y cuerpos extraños.', cite: 'Fossum p. 252' },
              { title: 'Antibiótico.', body: 'Según el cultivo del pliegue; si no lo hay, antimicrobiano empírico de amplio espectro.', cite: 'Fossum p. 252' },
              { title: 'Gatos con cola flácida.', body: 'Valora vejiga, tono anal y sensibilidad perineal: si están afectados, el pronóstico depende de los nervios sacros, no de la cola.' },
              { title: 'Anestesia.', body: 'General o epidural en mayores de una semana.', cite: 'Fossum p. 254' },
            ],
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        blocks: [
          {
            type: 'drugs',
            items: [
              ...pick('metadona', 'dexmed', 'propofol', 'isoflurano'),
              drug('Epidural', 'Lidocaína (sacrococcígea)', '0,5–1 mg/kg', 'Epidural sacrococcígea o intercoccígea', 'Analgesia de la cola sin bloquear los miembros posteriores.'),
              ...pick('cefazolina', 'meloxicam', 'buprenorfina'),
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
              'Arterias y venas caudales: medial (ventral), laterales superficiales dorsales y ventrales; se ligan justo craneal al corte (fig. 15.70).',
              'En la base se insertan el elevador del ano (7.ª vértebra caudal), el coccígeo (2.ª–5.ª) y el rectococcígeo (5.ª–6.ª): en la amputación completa se separan de las vértebras (p. 255, 499).',
              'El pliegue de la cola en tirabuzón puede tener 5–10 cm de profundidad, con pioderma, úlceras y trayectos fistulosos (p. 252).',
              'El recto y el esfínter anal están justo ventrales a la base: se lesionan en la amputación completa si no se diseca con cuidado.',
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
            id: 'parcial',
            title: 'A. Caudectomía parcial',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Cubre la cola distal.', body: 'Con gasa o un guante de examen fijado con cinta.', cite: 'Fossum p. 255' },
                  { title: 'Prepara.', body: 'Rasura una zona amplia alrededor del sitio y haz la antisepsia; posición perineal o decúbito lateral.', cite: 'Fossum p. 255' },
                  { title: 'Torniquete.', body: 'Proximal al sitio de corte.', cite: 'Fossum p. 255' },
                  { title: 'Retrae la piel.', body: 'Hacia la base de la cola.', cite: 'Fossum p. 255' },
                  { title: 'Doble V.', body: 'Incisión en doble V distal al espacio intervertebral elegido, con colgajos dorsal y ventral más largos que el muñón (fig. 15.70A).', cite: 'Fossum p. 255' },
                  { title: 'Vasos.', body: 'Identifica y liga las arterias y venas caudales medial y laterales un poco craneal al corte (fig. 15.70B).', cite: 'Fossum p. 255' },
                  { title: 'Desarticula.', body: 'Incide los tejidos blandos un poco distal al espacio y desarticula con bisturí (fig. 15.70C).', cite: 'Fossum p. 255' },
                  { title: 'Si sangra.', body: 'Ligadura circunferencial alrededor del extremo del muñón o nueva ligadura de los vasos caudales.', cite: 'Fossum p. 255' },
                  { title: 'Cubre el hueso.', body: 'Aproxima subcutáneo y músculo sobre las vértebras con puntos simples de 3-0 absorbible.', cite: 'Fossum p. 255' },
                  { title: 'Colgajos.', body: 'Pon el colgajo dorsal sobre las vértebras y recorta el ventral para que la piel cierre sin tensión (fig. 15.70D).', cite: 'Fossum p. 255' },
                  { title: 'Piel.', body: 'Puntos aposicionales de nylon o polipropileno 3-0 o 4-0 con aguja de corte inverso.', cite: 'Fossum p. 255' },
                  { title: 'Protege.', body: 'Vendaje o collar isabelino.', cite: 'Fossum p. 255' },
                ],
              },
              { type: 'note', kind: 'tip', title: 'En cola feliz', text: 'Amputa lo bastante corto: si el muñón sigue golpeando, la herida se abre de nuevo. El Fossum indica amputar cerca del ano cuando la punta sangra crónicamente (p. 253).' },
            ],
          },
          {
            id: 'completa',
            title: 'B. Caudectomía completa (pliegue de la cola)',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Prepara.', body: 'Todo el periné y la base de la cola; frota los pliegues por separado del resto del campo. Decúbito ventral.', cite: 'Fossum p. 252, 255' },
                  { title: 'Elipse.', body: 'Incisión elíptica alrededor de la base de la cola y la piel enferma, sin entrar en los pliegues (fig. 15.71A).', cite: 'Fossum p. 255–256' },
                  { title: 'En bloque.', body: 'Reseca la cola y los pliegues en bloque, manejando la cola con pinzas óseas o de campo, sin lesionar el recto.', cite: 'Fossum p. 252' },
                  { title: 'Músculos.', body: 'Separa las inserciones del elevador del ano, el rectococcígeo y el coccígeo de las vértebras caudales (fig. 15.71B).', cite: 'Fossum p. 255' },
                  { title: 'Vasos.', body: 'Liga las arterias y venas caudales medial y laterales antes o después del corte.', cite: 'Fossum p. 255' },
                  { title: 'Desarticula.', body: 'Con bisturí en la 2.ª o 3.ª vértebra caudal, craneal a las vértebras desviadas. Si la anquilosis impide hallar el espacio, corta con sierra de Gigli o cizalla y alisa los bordes con gubia o lima.', cite: 'Fossum p. 252, 255' },
                  { title: 'Lava.', body: 'Tras la hemostasia, lava abundante; drenaje de aspiración cerrada si hace falta.', cite: 'Fossum p. 252, 255' },
                  { title: 'Cierra.', body: 'Aproxima el elevador del ano y el subcutáneo con 3-0 o 4-0 absorbible; recorta la piel sobrante y sutura con 3-0 o 4-0 no absorbible.', cite: 'Fossum p. 255' },
                ],
              },
              { type: 'note', kind: 'book', title: 'Conservar el pliegue', text: 'Se puede conservar el pliegue, pero el pioderma puede persistir: para quitar todos los recesos de la base suele hacer falta la caudectomía completa (p. 252, 255).' },
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
              { title: 'Vigila.', body: 'Inflamación, drenaje y dolor del sitio.', cite: 'Fossum p. 254' },
              { title: 'Protege.', body: 'Vendaje o collar isabelino; protector acolchado en perros que mueven mucho la cola.', cite: 'Fossum p. 254' },
              { title: 'Compresas.', body: 'Tibias y húmedas 2–3 veces al día 15–20 minutos para mantener la zona limpia en la caudectomía completa.', cite: 'Fossum p. 253' },
              { title: 'Drenaje.', body: 'Retirar a los 3–5 días.', cite: 'Fossum p. 253' },
              { title: 'Puntos.', body: 'Retiro a los 10–14 días; limpieza por la cercanía del ano.' },
            ],
          },
        ],
      },
    ],
    closure: [
      { layer: 'Vasos caudales', suture: 'Absorbible', gauge: '3-0 o 4-0', pattern: 'Ligadura (circunferencial del muñón si sangra)', why: 'Sangran al soltar el torniquete.' },
      { layer: 'Músculo y subcutáneo', suture: 'PDS, Monocryl, Biosyn o Maxon', gauge: '3-0 o 4-0', pattern: 'Simples o continuo', why: 'Acolchan el muñón; elevador del ano en la completa.' },
      { layer: 'Piel', suture: 'Nylon, polibutéster o polipropileno, aguja de corte inverso', gauge: '3-0 o 4-0', pattern: 'Puntos aposicionales', why: 'Cierre sin tensión de los colgajos.' },
    ],
    complications: [
      { name: 'Dehiscencia', prevent: 'Colgajos largos, sin tensión, collar o vendaje.', manage: 'Segunda intención (cicatriz sin pelo) o reamputación.' },
      { name: 'Infección', prevent: 'Antibiótico según cultivo, lavado, drenaje.', manage: 'Drenaje y antibiótico.' },
      { name: 'Recidiva de fístula o pioderma', prevent: 'Quitar todos los recesos de la base.', manage: 'Reintervención.' },
      { name: 'Lesión del esfínter anal o del recto', prevent: 'Disección cuidadosa en la amputación completa.', manage: 'Reparación; incontinencia según la lesión.' },
      { name: 'Hemorragia', prevent: 'Ligar los vasos caudales.', manage: 'Ligadura circunferencial del muñón.' },
    ],
    quiz: [
      { q: '¿Qué márgenes deja el Fossum en tumores o lesiones traumáticas de la cola?', a: '2–3 cm de tejido normal.' },
      { q: '¿Cómo se forman los colgajos en la caudectomía parcial?', a: 'Con una doble incisión en V distal al espacio elegido, para que los colgajos dorsal y ventral sean más largos que el muñón.' },
      { q: '¿Qué vasos ligas?', a: 'Las arterias y venas caudales medial y laterales, justo craneal al corte.' },
      { q: '¿Dónde desarticulas en la caudectomía completa?', a: 'En la 2.ª o 3.ª vértebra caudal, tras separar el elevador del ano, el rectococcígeo y el coccígeo.' },
      { q: '¿Está permitida la amputación estética en Chile?', a: 'No; la Ley 21.020 la prohíbe.' },
    ],
    videos: [
      { title: 'Tail Amputation (Dog)', url: 'https://www.youtube.com/watch?v=8VbyfOJJqDc', channel: 'Vet Surgery at Ease', lang: 'inglés' },
      { title: 'Caudectomy Surgery for Bulldogs with Corkscrew Tails', url: 'https://www.youtube.com/watch?v=bkAs4CTeeZY', channel: 'Lynbrook Vet', lang: 'inglés', note: 'Cola enroscada, amputación completa' },
    ],
    sources: [
      SOURCES.fossum(15, 'cirugía del sistema tegumentario: pliegues de la cola y caudectomía parcial y completa (pp. 252–256)'),
      { text: 'Ley 21.020 sobre tenencia responsable de mascotas y animales de compañía (Chile), 2017.', kind: 'complemento' },
      SOURCES.plumbs,
    ],
  },
};
