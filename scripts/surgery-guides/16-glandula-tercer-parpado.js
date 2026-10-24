// Prolapso de glándula del tercer párpado (id 16). Medium depth: pocket technique; excision only as last resort.
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 16,
  legacy: {
    indicaciones: 'Prolapso de la glándula del tercer párpado ("ojo de cereza"), habitualmente en perros jóvenes. El tratamiento es reposicionar la glándula; extirparla aumenta mucho el riesgo de queratoconjuntivitis seca (la glándula produce 30–50 % de la lágrima) y solo se acepta ante neoplasia o glándula necrótica.',
    tecnica_quirurgica: 'Técnica de bolsillo de Morgan: dos incisiones paralelas en la conjuntiva bulbar del tercer párpado, por encima y por debajo de la glándula prolapsada; se une el borde de una incisión con el de la otra con un continuo absorbible 6-0 que entierra la glándula en un bolsillo, dejando aberturas en los extremos para el drenaje de la secreción. Los nudos quedan en la cara bulbar sin tocar la córnea. Alternativa o complemento: anclaje orbitario (al periostio del borde ventral de la órbita).',
    material_quirurgico: 'Instrumental oftálmico (pinzas Bishop-Harmon, tijeras de Westcott o Stevens, portaagujas de Castroviejo), lupa de aumento, pinzas para evertir el tercer párpado.',
    tipo_sutura: 'Poliglactina 910 (Vicryl) 6-0 o PDS 6-0, continuo, con aguja espatulada; nudos enterrados lejos de la córnea.',
    complicaciones_frecuentes: 'Recidiva (5–20 %, más en razas grandes y braquicéfalas); úlcera corneal por un nudo o hilo expuesto; quiste por bolsillo cerrado sin drenaje; queratoconjuntivitis seca si la glándula se extirpó o estaba dañada.',
    manejo_anestesico_sugerido: 'Anestesia general corta: metadona o butorfanol ± dexmedetomidina, propofol, inhalatorio. Anestesia tópica (proparacaína) y AINE postoperatorio.',
    consideraciones_por_raza: 'Bulldog inglés y francés, Cocker spaniel, Beagle, Shar Pei, Cane Corso, Napolitano, Lhasa Apso, Shih Tzu, Boston terrier; a menudo bilateral.',
    consideraciones_comorbilidades: 'Medir la producción de lágrima (Schirmer) antes y después. Cartílago del tercer párpado evertido (scrolled cartilage) en razas grandes: corregir en el mismo acto.',
    fuente: 'Gelatt KN, Veterinary Ophthalmology, 6.ª ed. (2021); Maggs DJ, Slatter\'s Fundamentals of Veterinary Ophthalmology, 6.ª ed.',
  },
  guide: {
    draft: true,
    lede: 'Reposición de la glándula del tercer párpado prolapsada ("ojo de cereza") en un bolsillo de conjuntiva. La glándula produce hasta la mitad de la lágrima: se conserva siempre que se pueda, porque extirparla deja al perro con ojo seco de por vida.',
    meta: { species: ['perro'], duration: '20–40 min por ojo', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Nunca extirpes la glándula por un prolapso simple: la queratoconjuntivitis seca es una complicación frecuente y crónica.',
      'Mide el test de Schirmer en ambos ojos antes: te sirve de base.',
      'Trabaja con magnificación y sutura 6-0.',
      'Los nudos y el hilo van en la cara bulbar del tercer párpado y nunca deben tocar la córnea.',
      'Deja abiertos los extremos del bolsillo para que drene la secreción de la glándula.',
    ],
    indications: [
      'Prolapso de la glándula del tercer párpado, idealmente operado pronto (antes de que la glándula se inflame y fibrose).',
      'Recidiva tras una reposición previa (repetir el bolsillo o combinar con anclaje orbitario).',
      'Extirpación solo en neoplasia o glándula necrótica.',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio y anestesia',
        blocks: [
          { type: 'steps', items: [
            { title: 'Tratamiento médico previo.', body: 'Antibiótico y corticoide tópicos 3–5 días si la glándula está muy inflamada; reduce el tamaño y facilita la cirugía.' },
            { title: 'Schirmer y fluoresceína.', body: 'Lágrima de base y descartar úlcera.' },
            { title: 'Preparación.', body: 'Povidona yodada al 0,2 % en el saco conjuntival; nada de clorhexidina con alcohol.' },
          ] },
          { type: 'drugs', items: [...pick('metadona', 'dexmed', 'propofol', 'isoflurano'), drug('Tópico', 'Proparacaína 0,5 %', '1–2 gotas', 'Tópica', 'Anestesia de superficie antes de manipular.'), ...pick('meloxicam')] },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica de bolsillo (Morgan)',
        blocks: [
          { type: 'steps', items: [
            { title: 'Evierte el tercer párpado.', body: 'Toma el borde libre con dos pinzas y gíralo para exponer su cara bulbar (la que mira al ojo), con la glándula prolapsada.' },
            { title: 'Primera incisión.', body: 'Incisión en la conjuntiva bulbar, paralela al borde libre, justo dorsal a la glándula (lado del borde libre), de 1–1,5 cm.' },
            { title: 'Segunda incisión.', body: 'Paralela a la primera, ventral a la glándula (lado del fondo de saco). Las dos incisiones deben ser más largas que la glándula.' },
            { title: 'Libera los bordes.', body: 'Despega un poco la conjuntiva de los bordes externos para que se unan sin tensión.' },
            { title: 'Sutura.', body: 'Comienza con el nudo en la cara anterior (palpebral) del tercer párpado o en la cara bulbar lejos del borde, pasando la aguja a través del párpado. Continuo simple uniendo el borde externo de una incisión con el de la otra, sobre la glándula, que queda enterrada.' },
            { title: 'Deja drenaje.', body: 'No cierres los extremos del bolsillo: 2–3 mm abiertos en cada lado.' },
            { title: 'Termina.', body: 'Anuda fuera del contacto con la córnea (de nuevo en la cara anterior o enterrado).' },
            { title: 'Revisa.', body: 'La glándula no debe verse y el borde libre del tercer párpado debe quedar liso.' },
          ] },
          { type: 'note', kind: 'tip', title: 'Recidiva o razas grandes', text: 'Combinar el bolsillo con un anclaje orbitario (un punto de la base de la glándula al periostio del borde ventral de la órbita) reduce la recidiva en Mastín, Cane Corso y Bulldog.' },
          { type: 'note', kind: 'error', title: 'Errores', bullets: ['Nudo o hilo en la cara bulbar tocando la córnea: úlcera.', 'Bolsillo cerrado del todo: quiste de retención.', 'Extirpar la glándula "porque es más rápido".'] },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [{ type: 'steps', items: [
          { title: 'Tratamiento tópico.', body: 'Antibiótico tópico 7–10 días; AINE oral 3–5 días.' },
          { title: 'Collar isabelino.', body: '10–14 días.' },
          { title: 'Control.', body: 'A la semana (fluoresceína para descartar úlcera) y al mes (Schirmer).' },
          { title: 'Ojo contralateral.', body: 'Avisa al tutor: con frecuencia se prolapsa también.' },
        ] }],
      },
    ],
    closure: [
      { layer: 'Bolsillo conjuntival', suture: 'Vicryl o PDS, aguja espatulada', gauge: '6-0', pattern: 'Continuo simple, extremos abiertos', why: 'Entierra la glándula y la deja drenar; absorbible para no tener que retirar.' },
    ],
    complications: [
      { name: 'Recidiva', prevent: 'Incisiones más largas que la glándula, anclaje orbitario en razas de riesgo.', manage: 'Repetir el bolsillo o combinar técnicas.' },
      { name: 'Úlcera corneal', prevent: 'Nudos lejos de la córnea.', manage: 'Retirar el hilo, tratamiento de la úlcera.' },
      { name: 'Quiste del bolsillo', prevent: 'Dejar los extremos abiertos.', manage: 'Abrir el quiste.' },
      { name: 'Queratoconjuntivitis seca', prevent: 'Conservar la glándula.', manage: 'Ciclosporina o tacrolimus tópicos y lágrimas artificiales de por vida.' },
    ],
    quiz: [
      { q: '¿Por qué no se extirpa la glándula prolapsada?', a: 'Porque produce 30–50 % de la lágrima y extirparla causa queratoconjuntivitis seca en muchos perros.' },
      { q: '¿Por qué los extremos del bolsillo quedan abiertos?', a: 'Para que drene la secreción de la glándula y no se forme un quiste.' },
      { q: '¿Dónde van los nudos?', a: 'Lejos de la córnea: en la cara anterior del tercer párpado o enterrados.' },
    ],
    videos: [
      { title: 'Morgan Pocket Technique to repair a Cherry Eye', url: 'https://www.youtube.com/watch?v=8E1Iz-3k8VA', channel: 'Veterinary Eye Center of New York City', lang: 'inglés', note: 'Técnica de bolsillo' },
      { title: 'Morgan pocket (Veteye App)', url: 'https://www.youtube.com/watch?v=bUSX9PXhw_U', channel: 'Vetweb Veterinary Ophthalmology', lang: 'inglés', note: 'Trucos para el cirujano' },
    ],
    sources: [
      { text: 'Gelatt KN y col. Veterinary Ophthalmology, 6.ª ed. Wiley-Blackwell, 2021. Enfermedades y cirugía del tercer párpado.', kind: 'libro' },
      { text: 'Morgan RV y col. Técnica de bolsillo para el prolapso de la glándula del tercer párpado en perros. JAAHA, 1993.', kind: 'complemento' },
      { text: 'Mazzucchelli S y col. Factores de riesgo y resultados de la reposición de la glándula del tercer párpado en perros. Veterinary Record, 2012.', kind: 'complemento' },
    ],
  },
};
