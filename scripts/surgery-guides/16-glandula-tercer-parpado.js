// Prolapso de glándula del tercer párpado (id 16). Rewritten from Fossum 5.ª ed., cap. 16 (tabla 16.1, pp. 266–271, 283–286).
const { drug, SOURCES } = require('./_common');

module.exports = {
  id: 16,
  legacy: {
    indicaciones: 'Prolapso de la glándula del tercer párpado ("ojo de cereza"), habitualmente antes del año de edad, uni o bilateral. Reponer la glándula, no extirparla, es el estándar: la extirpación aumenta el riesgo de queratoconjuntivitis seca y está contraindicada.',
    tecnica_quirurgica: 'Técnica de bolsillo: separador palpebral, tercer párpado extendido con dos pinzas pequeñas a cada lado de la glándula. Incisión conjuntival lineal entre la glándula y la córnea (conservando 5–7 mm de conjuntiva en el limbo) hasta ver los vasos conjuntivales, y otra paralela entre el borde del tercer párpado y la glándula (conservando 4–5 mm junto al borde). Nudo de Vicryl 6-0 en la cara palpebral externa, paso del hilo a la cara bulbar, continuo simple uniendo ambas incisiones sobre la glándula mientras se empuja con un hisopo, y vuelta a la cara palpebral para el nudo final. Combinar con anclaje (cartílago, músculos extraoculares, periórbita o reborde orbitario) en prolapsos grandes o crónicos.',
    material_quirurgico: 'Separador palpebral (Barraquer o Castroviejo), 4–6 pinzas de campo Baby Jones, portaagujas de Castroviejo o Barraquer de punta curva, pinzas de microcirugía Colibri 0,3 mm con plataforma, Bishop-Harmon 0,8 mm, tijeras de iris u oculares, hisopos de algodón, lupas con luz focal.',
    tipo_sutura: 'Vicryl (poliglactina 910) 6-0 en perros pequeños y gatos, 5-0 o 6-0 en perros muy grandes, con aguja espatulada de corte inverso de un cuarto de círculo; nudos en la cara palpebral externa, sin contacto con la córnea.',
    complicaciones_frecuentes: 'Exposición del hilo a la córnea con úlcera; dehiscencia o desgarro del bolsillo con nuevo prolapso; borde del tercer párpado deformado o tejido engrosado en la base si la glándula era muy grande; queratoconjuntivitis seca mucho más probable si se extirpa total o parcialmente la glándula.',
    manejo_anestesico_sugerido: 'Tabla 16.1, considerando que suelen ser jóvenes: anticolinérgico, ansiolítico y opioide; propofol o alfaxalona; isoflurano o sevoflurano; anestesia tópica (proparacaína o tetracaína). AINE postoperatorio.',
    consideraciones_por_raza: 'Cocker spaniel, Bulldog inglés, Beagle, Pekinés, Boston terrier, Basset hound, Shih Tzu y Lhasa Apso; en gatos, sobre todo Burmés.',
    consideraciones_comorbilidades: 'Queratoconjuntivitis seca (puede aparecer años después). Diferenciales: neoplasia, adenitis, folículos linfoides, tercer párpado elevado (Horner, Haws, enoftalmos), quiste, cartílago evertido.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 16, tabla 16.1 y pp. 266–271 y 283–286.',
  },
  guide: {
    draft: true,
    lede: 'Reposición de la glándula del tercer párpado prolapsada ("ojo de cereza") en un bolsillo de conjuntiva. El Fossum lo deja claro: la reposición, no la extirpación, es el estándar, porque quitar la glándula aumenta mucho el riesgo de ojo seco más adelante. Es microcirugía con hilo 6-0 en un tejido muy delicado.',
    meta: { species: ['perro', 'gato'], duration: '20–40 min por ojo', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Nunca extirpes la glándula por un prolapso: está contraindicado por el riesgo de queratoconjuntivitis seca.',
      'Conserva al menos 5–7 mm de conjuntiva junto al limbo y 4–5 mm junto al borde del tercer párpado para poder suturar.',
      'Usa Vicryl 6-0, instrumental de microcirugía, lupas con luz focal y un separador palpebral.',
      'Los nudos van en la cara palpebral externa del tercer párpado; el hilo nunca debe tocar la córnea.',
      'Toma la aguja solo con el portaagujas (dañaría las pinzas de microcirugía) y el hilo solo con instrumental, no con los dedos.',
    ],
    indications: [
      'Prolapso de la glándula del tercer párpado, idealmente operado pronto, antes de que se inflame y fibrose (p. 285).',
      'Recidiva tras una reposición previa: repetir el bolsillo o combinarlo con un anclaje.',
      'Los corticoides tópicos reducen la inflamación pero en general no resuelven el prolapso.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Diagnóstico y preparación',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Examen.', body: 'Masa redonda u oval, rosada y carnosa detrás del borde del tercer párpado cerca del canto medial; si no se ve, aparece al empujar suavemente el globo. Puede haber conjuntivitis y secreción mucosa; con ojo seco, vascularización o pigmentación corneal.', cite: 'Fossum p. 285' },
              { title: 'Diferenciales.', body: 'Neoplasia, adenitis, folículos linfoides, tercer párpado elevado (Horner, Haws, enoftalmos), quiste, cartílago evertido y malformación. El cultivo y la citología no suelen hacer falta.', cite: 'Fossum p. 285' },
              { title: 'Tratamiento previo.', body: 'Si la fluoresceína es negativa y la glándula está inflamada, antibiótico con corticoide tópico para reducir su tamaño.', cite: 'Fossum p. 285' },
              { title: 'Preparación.', body: 'No hace falta rasurar. Limpia los exudados con gasa estéril e hisopos humedecidos con lavado ocular o Ringer lactato y mantén la córnea lubricada.', cite: 'Fossum p. 285' },
              { title: 'Posición.', body: 'Decúbito ventral con una toalla enrollada bajo el mentón.', cite: 'Fossum p. 285' },
              { title: 'Antibiótico.', body: 'Tópico de amplio espectro (neomicina-polimixina-bacitracina en perros; eritromicina u oxitetraciclina en gatos).', cite: 'Fossum p. 268' },
            ],
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'Suelen ser animales jóvenes (tabla 16.1 y consideraciones pediátricas). Lubrica el otro ojo cada 2 h y evita presionarlo en decúbito lateral (p. 268).',
        blocks: [
          {
            type: 'drugs',
            items: [
              drug('Premedicación', 'Glicopirrolato', '0,01 mg/kg', 'IM o SC', 'O atropina 0,02–0,04 mg/kg.'),
              drug('Premedicación', 'Midazolam', '0,1–0,2 mg/kg', 'IM o IV'),
              drug('Premedicación', 'Buprenorfina', '0,01–0,02 mg/kg', 'IM', 'En gatos 0,005 mg/kg SC. O metadona 0,2 mg/kg.'),
              drug('Inducción', 'Propofol', '2–6 mg/kg', 'IV, a efecto', 'O alfaxalona 2–3 mg/kg (perros), 2–5 mg/kg (gatos).'),
              drug('Mantenimiento', 'Isoflurano o sevoflurano', 'A efecto', 'Inhalatoria'),
              drug('Tópico', 'Proparacaína 0,5 %', '1–2 gotas', 'Tópica', 'O tetracaína.'),
              drug('Postoperatorio', 'Meloxicam', '0,1–0,2 mg/kg', 'SC o VO, una vez', 'Luego 0,1 mg/kg cada 24 h en perros; en gatos, dosis única.'),
              drug('Postoperatorio', 'Carprofeno', '2,2 mg/kg', 'VO cada 12 h', 'Solo perros.'),
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
              'El tercer párpado es un pliegue triangular de mucosa en el canto medial, cubierto de conjuntiva; la base del triángulo es su borde libre (p. 285).',
              'Un cartílago en forma de T le da estructura; los brazos de la T corren a lo largo del borde libre.',
              'La glándula está normalmente dentro de la conjuntiva bulbar en la base del tercer párpado; sus conductos excretores salen en la parte media de la cara bulbar.',
              'En la cara bulbar hay folículos linfoides (pequeñas elevaciones translúcidas).',
              'Irrigación por ramas de la arteria maxilar interna; la conjuntiva es muy vascularizada (infección rara, pero se desgarra con facilidad).',
              'El prolapso se debe probablemente a laxitud de la unión entre la glándula y la periórbita, con predisposición genética.',
            ],
          },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica de bolsillo paso a paso',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Exposición.', body: 'Coloca el separador palpebral para la máxima exposición.', cite: 'Fossum p. 285' },
              { title: 'Extiende el tercer párpado.', body: 'Tómalo con dos pinzas de campo pequeñas o mosquitos, a cada lado de la glándula.', cite: 'Fossum p. 285' },
              { title: 'Primera incisión.', body: 'Lineal, en la conjuntiva entre la glándula y la córnea (proximal a la glándula), conservando al menos 5–7 mm de conjuntiva en el limbo (fig. 16.17A).', cite: 'Fossum p. 285' },
              { title: 'Profundidad.', body: 'Profundiza hasta ver los vasos conjuntivales prominentes.', cite: 'Fossum p. 285' },
              { title: 'Segunda incisión.', body: 'Paralela, entre el borde del tercer párpado y la glándula (distal a ella), conservando al menos 4–5 mm de conjuntiva junto al borde.', cite: 'Fossum p. 285' },
              { title: 'Primer nudo.', body: 'En un extremo de la incisión, anuda Vicryl 6-0 en la cara palpebral externa del tercer párpado, de espesor parcial, con pinzas Colibri y portaagujas de Castroviejo sin traba.', cite: 'Fossum p. 285' },
              { title: 'Pasa al lado bulbar.', body: 'Atraviesa el tercer párpado de la cara palpebral a la bulbar, saliendo dentro de un extremo de una de las incisiones.', cite: 'Fossum p. 286' },
              { title: 'Forma el bolsillo.', body: 'Une las dos incisiones sobre la glándula con un continuo simple, tomando a cada lado, mientras empujas la glándula hacia abajo con un hisopo para meterla en la conjuntiva bulbar (fig. 16.17B). Mantén el hilo ajustado y sin exponer.', cite: 'Fossum p. 286' },
              { title: 'Vuelve y anuda.', body: 'Pasa el hilo de nuevo a través del tercer párpado y haz el último punto y el nudo en la cara palpebral externa (fig. 16.17C).', cite: 'Fossum p. 286' },
              { title: 'Revisa.', body: 'La glándula no debe verse, el hilo no debe tocar la córnea y la conjuntiva no debe estar desgarrada.', cite: 'Fossum p. 286' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Bolsillo, anclaje o ambos', text: 'Además del bolsillo se describen anclajes del tercer párpado al cartílago, a los músculos extraoculares, a la esclera, a la fascia periorbitaria o al reborde orbitario. Los anclajes limitan la movilidad del tercer párpado y los bolsillos pueden dañar los conductos; combinar bolsillo y anclaje puede funcionar mejor en prolapsos grandes y crónicos, y el bolsillo solo en jóvenes con prolapsos leves (p. 285).' },
          { type: 'note', kind: 'error', title: 'Contraindicado', text: 'Extirpar la glándula del tercer párpado aumenta el riesgo de ojo seco (queratoconjuntivitis seca) (p. 286).' },
          { type: 'note', kind: 'tip', title: 'Microcirugía', text: 'Con hilo 6-0 o más fino, toma la aguja solo con el portaagujas y manipula el hilo solo con instrumental de microcirugía, para no dañar ni las pinzas ni el hilo (p. 284).' },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Collar rígido.', body: 'Que sobrepase la nariz con la cabeza extendida; los suaves o de cuello no evitan que se frote.', cite: 'Fossum p. 286' },
              { title: 'Antibiótico tópico.', body: 'Neomicina-polimixina-bacitracina 4 veces al día hasta que la conjuntiva cicatrice, en 10–14 días.', cite: 'Fossum p. 286' },
              { title: 'Sin corticoides tópicos.', body: 'Evítalos varias semanas: perjudican la cicatrización.', cite: 'Fossum p. 286' },
              { title: 'Tamaño.', body: 'Una glándula inflamada puede tardar varias semanas en volver a su tamaño.', cite: 'Fossum p. 286' },
              { title: 'Controles.', body: 'Fluoresceína para descartar úlcera por el hilo; test de Schirmer a largo plazo.' },
              { title: 'Otro ojo.', body: 'Suele empezar unilateral pero a menudo se vuelve bilateral: avisa al tutor.', cite: 'Fossum p. 285' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Pronóstico', text: 'Bueno con la técnica de bolsillo. Puede quedar el borde del tercer párpado deformado o tejido engrosado en la base si la glándula era muy grande. Las recidivas pueden requerir otra cirugía (p. 286).' },
        ],
      },
    ],
    closure: [
      { layer: 'Bolsillo conjuntival', suture: 'Vicryl (poliglactina 910), aguja espatulada de corte inverso', gauge: '6-0 (5-0 o 6-0 en perros muy grandes)', pattern: 'Continuo simple; nudos en la cara palpebral externa', why: 'Entierra la glándula; hilo blando y absorbible que no daña la córnea.' },
    ],
    complications: [
      { name: 'Úlcera corneal por el hilo', prevent: 'Nudos en la cara palpebral externa, hilo sin exponer.', manage: 'Retirar o reemplazar el hilo; tratar la úlcera.' },
      { name: 'Dehiscencia o nuevo prolapso', prevent: 'Conservar suficiente conjuntiva a cada lado, no desgarrarla, collar rígido; anclaje en prolapsos grandes.', manage: 'Repetir el bolsillo o combinarlo con anclaje.' },
      { name: 'Deformidad del borde del tercer párpado', prevent: 'Operar antes de que la glándula crezca mucho.', manage: 'Generalmente estética.' },
      { name: 'Queratoconjuntivitis seca', prevent: 'Conservar la glándula.', manage: 'Ciclosporina o tacrolimus tópicos y lágrimas artificiales.' },
      { name: 'Hemorragia', prevent: 'Manipulación delicada.', manage: 'Presión con hisopo.' },
    ],
    quiz: [
      { q: '¿Por qué no se extirpa la glándula prolapsada?', a: 'Porque la extirpación aumenta el riesgo de queratoconjuntivitis seca y está contraindicada.' },
      { q: '¿Cuánta conjuntiva conservas a cada lado?', a: 'Al menos 5–7 mm junto al limbo y 4–5 mm junto al borde del tercer párpado.' },
      { q: '¿Dónde van los nudos y por qué?', a: 'En la cara palpebral externa del tercer párpado, para que el hilo no toque la córnea.' },
      { q: '¿Qué hilo usas?', a: 'Vicryl 6-0 (5-0 o 6-0 en perros muy grandes) con aguja espatulada de corte inverso.' },
      { q: '¿Cuándo combinarías bolsillo y anclaje?', a: 'En prolapsos grandes y crónicos; el bolsillo solo funciona mejor en jóvenes con prolapsos leves.' },
      { q: '¿Qué evitas en el postoperatorio?', a: 'Los corticoides tópicos durante varias semanas, porque perjudican la cicatrización.' },
    ],
    videos: [
      { title: 'Morgan Pocket Technique to repair a Cherry Eye', url: 'https://www.youtube.com/watch?v=8E1Iz-3k8VA', channel: 'Veterinary Eye Center of New York City', lang: 'inglés', note: 'Técnica de bolsillo' },
      { title: 'Morgan pocket (Veteye App)', url: 'https://www.youtube.com/watch?v=bUSX9PXhw_U', channel: 'Vetweb Veterinary Ophthalmology', lang: 'inglés', note: 'Trucos para el cirujano' },
    ],
    sources: [
      SOURCES.fossum(16, 'cirugía del ojo: anestesia (tabla 16.1), antibióticos, instrumental (pp. 266–271), conjuntiva y tercer párpado, prolapso de la glándula y técnica de bolsillo (pp. 283–286)'),
      { text: 'Multari D y col. Técnica de bolsillo sola o combinada con anclaje al reborde orbitario en 353 perros. Veterinary Ophthalmology, 2016 (citado en el Fossum).', kind: 'complemento' },
    ],
  },
};
