// Amputación de cola (id 18). Medium depth: therapeutic caudectomy, never cosmetic.
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 18,
  legacy: {
    indicaciones: 'Terapéutica: trauma grave o necrosis de la cola, fracturas con lesión neurológica (cola flácida sin sensibilidad), tumores, heridas crónicas que no cicatrizan ("cola feliz"), dermatitis de pliegue en razas de cola enroscada (Bulldog). La amputación estética está prohibida en Chile (Ley 21.020) y en muchos países.',
    tecnica_quirurgica: 'Torniquete en la base. Incisión de piel en V o doble arco dejando colgajos dorsal y ventral más largos que la vértebra, proximal a la lesión. Ligadura de las arterias y venas coccígeas medianas (ventrales) y laterales. Desarticulación en el espacio intervertebral (no a través del hueso) con bisturí. Sutura de los músculos sobre el muñón, subcutáneo y piel sin tensión.',
    material_quirurgico: 'Instrumental de tejidos blandos, torniquete (Penrose o banda), hoja 10 o 15, pinzas hemostáticas Mosquito, gasas.',
    tipo_sutura: 'Vasos coccígeos: 3-0 o 4-0 absorbible. Músculo y subcutáneo: Monocryl 3-0. Piel: nylon 3-0 simples (o intradérmico 4-0).',
    complicaciones_frecuentes: 'Dehiscencia por automutilación (sobre todo en "cola feliz"); infección; hemorragia de las arterias coccígeas; muñón doloroso; incontinencia si la amputación es muy proximal (lesión de nervios sacros).',
    manejo_anestesico_sugerido: 'Epidural sacrococcígea con lidocaína o bupivacaína: analgesia completa de la cola. Metadona ± dexmedetomidina, propofol, inhalatorio. AINE postoperatorio.',
    consideraciones_por_raza: 'Razas de cola larga y activa (Labrador, Gran Danés, Galgo): "cola feliz". Bulldog inglés, Pug: cola enroscada con pliegue infectado (amputación muy proximal, más compleja).',
    consideraciones_comorbilidades: 'Lesión de la cola por tracción ("tail pull") en gatos: valorar función de vejiga y ano antes; si no se recupera, el problema no es la cola. Tumores: estadificar.',
    fuente: 'Fossum, Small Animal Surgery, 5.ª ed. (2019), cap. 22; Ley 21.020 (Chile).',
  },
  guide: {
    draft: true,
    lede: 'Amputación terapéutica de la cola por trauma, necrosis, tumor o heridas que no cicatrizan. Se desarticula en un espacio intervertebral, con colgajos de piel que cubran el muñón sin tensión. La amputación estética no se hace: es ilegal en Chile.',
    meta: { species: ['perro', 'gato'], duration: '30–60 min', difficulty: 'básica', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Solo con indicación terapéutica; la caudectomía estética está prohibida por la Ley 21.020.',
      'Amputa en tejido sano, varios centímetros proximal a la lesión.',
      'Desarticula en un espacio intervertebral; no cortes a través de la vértebra.',
      'Deja los colgajos de piel más largos de lo que parece: deben cubrir el muñón sin tensión.',
      'Liga las arterias coccígeas medianas (ventrales) antes de soltar el torniquete.',
    ],
    indications: [
      'Trauma o necrosis de la cola, fracturas con lesión neurológica sin recuperación.',
      'Tumores de la cola.',
      'Heridas crónicas de la punta por golpes repetidos ("cola feliz") que no responden a vendajes.',
      'Dermatitis de pliegue grave en colas enroscadas.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio y anestesia',
        blocks: [
          { type: 'steps', items: [
            { title: 'Nivel de amputación.', body: 'Palpa y radiografía para decidir el nivel: tejido sano, sin fracturas, con buena sensibilidad.' },
            { title: 'En gatos con cola flácida.', body: 'Valora la función de la vejiga, el tono anal y la sensibilidad perineal: si están comprometidos, el pronóstico depende de los nervios sacros, no de la cola.' },
            { title: 'Preparación.', body: 'Rasura la cola proximal a la lesión y la base; cubre la parte distal con un guante o vendaje estéril.' },
          ] },
          { type: 'drugs', items: [...pick('metadona', 'dexmed', 'propofol', 'isoflurano'), drug('Epidural', 'Lidocaína (sacrococcígea)', '0,5–1 mg/kg', 'Epidural sacrococcígea o intercoccígea', 'Analgesia completa de la cola sin bloquear los miembros pelvianos.'), ...pick('meloxicam', 'buprenorfina')] },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [
          { type: 'steps', items: [
            { title: 'Posición.', body: 'Decúbito esternal con la cola extendida hacia caudal.' },
            { title: 'Torniquete.', body: 'Penrose o banda en la base de la cola.' },
            { title: 'Localiza el espacio.', body: 'Flexiona la cola para palpar el espacio intervertebral elegido.' },
            { title: 'Incisión de piel.', body: 'Dos incisiones en arco o en V, dorsal y ventral, comenzando 1–2 cm distal al espacio, para formar colgajos dorsal y ventral.' },
            { title: 'Vasos.', body: 'Identifica y liga las arterias y venas coccígeas medianas (ventrales) y las laterales con 3-0 o 4-0.' },
            { title: 'Desarticula.', body: 'Corta los músculos y tendones y entra en el espacio intervertebral con el bisturí; separa la cola.' },
            { title: 'Suelta el torniquete.', body: 'Revisa la hemostasia.' },
            { title: 'Cubre el muñón.', body: 'Une los músculos y el tejido subcutáneo sobre la vértebra con Monocryl 3-0.' },
            { title: 'Piel.', body: 'Puntos simples de nylon 3-0 o intradérmico, sin tensión.' },
          ] },
          { type: 'note', kind: 'tip', title: 'En "cola feliz"', text: 'Amputa más proximal de lo que pide la herida: si el muñón queda largo y el perro sigue golpeándolo, se abre de nuevo.' },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [{ type: 'steps', items: [
          { title: 'Protección.', body: 'Collar isabelino y, en perros que mueven la cola con fuerza, un protector acolchado sobre el muñón.' },
          { title: 'Analgesia.', body: 'AINE 5 días.' },
          { title: 'Puntos.', body: 'Retiro a los 10–14 días; limpieza por la cercanía del ano.' },
        ] }],
      },
    ],
    closure: [
      { layer: 'Vasos coccígeos', suture: 'PDS o Monocryl', gauge: '3-0 o 4-0', pattern: 'Ligadura', why: 'Las coccígeas medianas sangran al soltar el torniquete.' },
      { layer: 'Músculo y subcutáneo', suture: 'Monocryl', gauge: '3-0', pattern: 'Simples o continuo', why: 'Acolchan el muñón.' },
      { layer: 'Piel', suture: 'Nylon o Monocryl', gauge: '3-0 o 4-0', pattern: 'Simples o intradérmico', why: 'Cierre sin tensión de los colgajos.' },
    ],
    complications: [
      { name: 'Dehiscencia', prevent: 'Colgajos largos, collar, protector.', manage: 'Nueva amputación más proximal.' },
      { name: 'Hemorragia', prevent: 'Ligar las coccígeas antes de soltar el torniquete.', manage: 'Compresión, ligadura.' },
      { name: 'Infección', prevent: 'Asepsia, limpieza diaria.', manage: 'Antibiótico, drenaje.' },
      { name: 'Incontinencia', prevent: 'No amputar a nivel de las vértebras sacras.', manage: 'Según la lesión neurológica.' },
    ],
    quiz: [
      { q: '¿Dónde se corta la cola?', a: 'En un espacio intervertebral, desarticulando, nunca a través de la vértebra.' },
      { q: '¿Qué vasos ligas?', a: 'Las arterias y venas coccígeas medianas (ventrales) y las laterales.' },
      { q: '¿Está permitida la amputación estética en Chile?', a: 'No; la Ley 21.020 la prohíbe.' },
    ],
    videos: [
      { title: 'Tail Amputation (Dog)', url: 'https://www.youtube.com/watch?v=8VbyfOJJqDc', channel: 'Vet Surgery at Ease', lang: 'inglés' },
      { title: 'Caudectomy Surgery for Bulldogs with Corkscrew Tails', url: 'https://www.youtube.com/watch?v=bkAs4CTeeZY', channel: 'Lynbrook Vet', lang: 'inglés', note: 'Cola enroscada, amputación proximal' },
    ],
    sources: [
      SOURCES.fossum(22, 'cirugía del recto, el ano y el periné (cola)'),
      { text: 'Ley 21.020 sobre tenencia responsable de mascotas y animales de compañía (Chile), 2017.', kind: 'complemento' },
      SOURCES.plumbs,
    ],
  },
};
