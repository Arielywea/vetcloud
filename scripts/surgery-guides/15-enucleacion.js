// Enucleación (id 15). Full depth: transpalpebral technique, the common one in practice.
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 15,
  legacy: {
    indicaciones: 'Ojo ciego y doloroso (glaucoma terminal, uveítis refractaria); proptosis con globo irreparable; perforación corneal o escleral irreparable; neoplasia intraocular; endoftalmitis o panoftalmitis.',
    tecnica_quirurgica: 'Técnica transpalpebral (la más usada en la práctica): sutura continua de los párpados, incisión de piel a 5 mm del borde palpebral, disección por fuera de la conjuntiva hasta la esclera, sección de los músculos extraoculares cerca de su inserción, pinzado y ligadura del nervio óptico y vasos (sin traccionar el globo), extirpación del globo con la conjuntiva, la membrana nictitante y su glándula, y los bordes palpebrales. Cierre de la órbita en capas (periórbita, subcutáneo, piel).',
    material_quirurgico: 'Instrumental oftálmico básico (pinzas de Adson o Bishop-Harmon, tijeras de Metzenbaum curvas y de enucleación), portaagujas fino, pinza hemostática curva, gasas, implante orbitario de silicona opcional.',
    tipo_sutura: 'Párpados (cierre previo): nylon 3-0 continuo. Pedículo óptico: 3-0 absorbible. Periórbita y subcutáneo: Monocryl 4-0. Piel: nylon 4-0 simples o intradérmico 4-0 absorbible.',
    complicaciones_frecuentes: 'Hemorragia orbitaria; enfisema subcutáneo o hinchazón; infección o absceso orbitario; quiste orbitario por restos de conjuntiva o glándulas; ceguera del ojo contralateral en gatos por tracción del nervio óptico (quiasma); hundimiento estético de la órbita.',
    manejo_anestesico_sugerido: 'Bloqueo retrobulbar o peribulbar con lidocaína o bupivacaína (reduce dolor y reflejo oculocardíaco). Metadona ± dexmedetomidina, propofol, inhalatorio. Vigilar bradicardia por reflejo oculocardíaco (atropina disponible). AINE postoperatorio.',
    consideraciones_por_raza: 'Braquicéfalos (Pug, Shih Tzu, Pequinés): órbita poco profunda, proptosis frecuente. Gatos: nunca traccionar el globo (nervio óptico corto, riesgo de ceguera contralateral). Cocker spaniel, Basset y Shar Pei: glaucoma primario.',
    consideraciones_comorbilidades: 'Neoplasia: enviar el globo completo a histopatología y valorar metástasis. Infección orbitaria: cultivo y antibiótico.',
    fuente: 'Gelatt KN, Veterinary Ophthalmology, 6.ª ed. (2021); Maggs DJ, Slatter\'s Fundamentals of Veterinary Ophthalmology, 6.ª ed.; Plumb\'s Veterinary Drug Handbook.',
  },
  guide: {
    draft: true,
    lede: 'Extirpación del globo ocular con la conjuntiva, el tercer párpado y los bordes de los párpados. Elimina un ojo ciego y doloroso de forma definitiva; los animales se adaptan muy bien. La regla de oro: nunca traccionar del nervio óptico.',
    meta: { species: ['perro', 'gato'], duration: '30–60 min', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Confirma con el tutor cuál ojo, y márcalo antes de la anestesia.',
      'Examina el ojo contralateral: debe tener visión o pronóstico conocido antes de quitar el otro.',
      'En el gato, no traccionas el globo al cortar el nervio óptico: su nervio es corto y la tracción del quiasma puede dejar ciego el otro ojo.',
      'Extirpa toda la conjuntiva, el tercer párpado con su glándula y los bordes palpebrales con sus glándulas: los restos forman quistes que drenan.',
      'Ten atropina preparada por el reflejo oculocardíaco.',
    ],
    indications: [
      'Ojo ciego y doloroso: glaucoma terminal, uveítis refractaria.',
      'Proptosis con globo irreparable (más de dos músculos extraoculares rotos, hipema total, nervio óptico avulsionado).',
      'Perforación corneal o escleral que no se puede reparar.',
      'Neoplasia intraocular (melanoma, adenocarcinoma), endoftalmitis o panoftalmitis.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [{ type: 'steps', items: [
          { title: 'Examen oftalmológico.', body: 'Del ojo afectado y del contralateral. En neoplasias, radiografía de tórax y linfonodos.' },
          { title: 'Explica el resultado.', body: 'La órbita queda cerrada con piel; puede hundirse un poco con el tiempo. Un implante de silicona mejora la estética (no en neoplasias ni infecciones).' },
          { title: 'Preparación.', body: 'Rasura alrededor del ojo, limpia la piel con povidona yodada diluida al 0,5–1 %, y el saco conjuntival con povidona al 0,2 %. Nunca clorhexidina con alcohol cerca del ojo.' },
        ] }],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        blocks: [
          { type: 'drugs', items: [...pick('metadona', 'dexmed', 'propofol', 'alfaxalona', 'isoflurano'), drug('Local', 'Lidocaína o bupivacaína (retrobulbar)', '1–2 mg/kg (máximo)', 'Bloqueo retrobulbar o peribulbar', 'Volumen 1–2 mL en perros medianos; aspira antes de inyectar. En gatos, máximo 1 mg/kg.'), drug('Rescate', 'Atropina', '0,02–0,04 mg/kg', 'IV', 'Si aparece bradicardia por reflejo oculocardíaco.'), ...pick('meloxicam', 'buprenorfina')] },
          { type: 'note', kind: 'why', title: 'Por qué el bloqueo retrobulbar', text: 'Reduce el dolor postoperatorio, la necesidad de inhalatorio y el reflejo oculocardíaco al manipular el globo y los músculos.' },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica transpalpebral paso a paso',
        blocks: [
          { type: 'steps', items: [
            { title: 'Cierra los párpados.', body: 'Sutura continua de nylon 3-0 uniendo los bordes palpebrales; deja los cabos largos para traccionar. Así el saco conjuntival contaminado queda cerrado.' },
            { title: 'Incisión de piel.', body: 'Elíptica alrededor de los párpados, a 5 mm del borde, incluyendo los cantos medial y lateral.' },
            { title: 'Diseca por fuera de la conjuntiva.', body: 'Con tijera de Metzenbaum curva, avanza por el tejido subcutáneo y por fuera de la conjuntiva hasta llegar a la esclera, todo alrededor.' },
            { title: 'Ligamentos cantales.', body: 'Corta el ligamento cantal lateral y medial (en el medial hay una vena angular: cauteriza o liga).' },
            { title: 'Músculos extraoculares.', body: 'Corta cada músculo cerca de su inserción en la esclera, girando el globo con los cabos de la sutura palpebral.' },
            { title: 'Nervio óptico.', body: 'Pasa una pinza hemostática curva por detrás del globo, sin traccionarlo, y pinza el pedículo (nervio óptico y vasos). Corta entre el globo y la pinza.' },
            { title: 'Liga el pedículo.', body: 'Ligadura con 3-0 absorbible proximal a la pinza (o compresión con gasa 5 minutos si el pedículo es pequeño). Retira la pinza y revisa.' },
            { title: 'Revisa la pieza.', body: 'El globo debe salir con toda la conjuntiva, el tercer párpado y su glándula, y los bordes palpebrales.' },
            { title: 'Hemostasia y lavado.', body: 'Compresión, revisa la órbita y lava con salino.' },
            { title: 'Implante (opcional).', body: 'Esfera de silicona del tamaño adecuado si no hay infección ni neoplasia.' },
            { title: 'Cierra en capas.', body: 'Periórbita (y fascia orbitaria) con Monocryl 4-0, subcutáneo 4-0 y piel con nylon 4-0 o intradérmico.' },
          ] },
          { type: 'note', kind: 'error', title: 'Errores frecuentes', bullets: ['Traccionar el globo al cortar el nervio óptico (sobre todo en gatos).', 'Dejar restos de conjuntiva o de la glándula del tercer párpado: quiste orbitario que drena meses después.', 'Cerrar la órbita con tensión: dehiscencia.'] },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [{ type: 'steps', items: [
          { title: 'Hinchazón.', body: 'Esperable 2–3 días; compresas frías 5–10 min varias veces al día el primer día.' },
          { title: 'Secreción.', body: 'Un poco de líquido sanguinolento por la nariz del mismo lado es normal 1–2 días (conducto nasolagrimal).' },
          { title: 'Collar isabelino.', body: '10–14 días; retiro de puntos.' },
          { title: 'Histopatología.', body: 'Envía el globo en formol si hay sospecha de neoplasia o la causa no está clara.' },
        ] }],
      },
    ],
    closure: [
      { layer: 'Párpados (cierre previo)', suture: 'Nylon', gauge: '3-0', pattern: 'Continuo', why: 'Aísla la conjuntiva contaminada; sirve para traccionar.' },
      { layer: 'Pedículo óptico', suture: 'PDS o Monocryl', gauge: '3-0', pattern: 'Ligadura circunferencial', why: 'Contiene la arteria oftálmica.' },
      { layer: 'Periórbita', suture: 'Monocryl', gauge: '4-0', pattern: 'Continuo simple', why: 'Primera capa de cierre de la órbita.' },
      { layer: 'Subcutáneo', suture: 'Monocryl', gauge: '4-0', pattern: 'Continuo simple', why: 'Reduce el espacio muerto.' },
      { layer: 'Piel', suture: 'Nylon o Monocryl', gauge: '4-0', pattern: 'Simples o intradérmico', why: 'Piel fina de la cara.' },
    ],
    complications: [
      { name: 'Hemorragia orbitaria', prevent: 'Ligadura o pinzado del pedículo, hemostasia de la vena angular.', manage: 'Compresión; reintervención si es grave.' },
      { name: 'Ceguera contralateral (gatos)', prevent: 'No traccionar el globo.', manage: 'Sin tratamiento eficaz.' },
      { name: 'Quiste o fístula orbitaria', prevent: 'Extirpar toda la conjuntiva, el tercer párpado y las glándulas palpebrales.', manage: 'Reexploración y extirpación del tejido residual.' },
      { name: 'Infección', prevent: 'Asepsia, aislar el saco conjuntival.', manage: 'Antibiótico, drenaje.' },
      { name: 'Hundimiento de la órbita', prevent: 'Implante de silicona cuando es posible.', manage: 'Estético; sin consecuencias funcionales.' },
    ],
    quiz: [
      { q: '¿Por qué no traccionas el globo en el gato?', a: 'Porque su nervio óptico es corto y la tracción del quiasma puede causar ceguera en el ojo contralateral.' },
      { q: '¿Qué tejidos deben salir con el globo?', a: 'Toda la conjuntiva, el tercer párpado con su glándula y los bordes palpebrales con sus glándulas.' },
      { q: '¿Para qué cierras los párpados antes de incidir?', a: 'Para aislar el saco conjuntival contaminado y tener cabos para traccionar.' },
      { q: '¿Qué reflejo vigilas y cómo lo tratas?', a: 'El oculocardíaco (bradicardia); con atropina IV y el bloqueo retrobulbar como prevención.' },
    ],
    videos: [
      { title: 'Canine Enucleation Surgery: Transpalpebral Approach Step-by-Step', url: 'https://www.youtube.com/watch?v=tieEss7gTAI', channel: 'VetEyeDoctor', lang: 'inglés', note: 'Paso a paso' },
      { title: 'Enucleation: surgical technique explained', url: 'https://www.youtube.com/watch?v=JXVqhTgmUz0', channel: 'Dr. Shadi Ireifej', lang: 'inglés', note: 'Compara las técnicas' },
    ],
    sources: [
      { text: 'Gelatt KN, Ben-Shlomo G, Gilger BC y col. Veterinary Ophthalmology, 6.ª ed. Wiley-Blackwell, 2021. Cirugía de la órbita.', kind: 'libro' },
      { text: 'Maggs DJ, Miller PE, Ofri R. Slatter\'s Fundamentals of Veterinary Ophthalmology, 6.ª ed. Elsevier, 2018.', kind: 'libro' },
      { text: 'Shilo-Benjamini Y. Anestesia regional ocular en perros y gatos: revisión. Veterinary Ophthalmology, 2019.', kind: 'complemento' },
      SOURCES.plumbs,
    ],
  },
};
