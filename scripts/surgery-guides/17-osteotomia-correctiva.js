// Osteotomía correctiva de deformidad angular (id 17). Rewritten from Fossum 5.ª ed., cap. 32 (pp. 1032–1035) y cap. 33 (pp. 1079–1084).
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 17,
  legacy: {
    indicaciones: 'Deformidades angulares por cierre fisario prematuro o mala unión de fracturas que alteran la marcha o predisponen a artrosis: realinear superficies articulares, recuperar longitud, corregir torsión y mejorar la congruencia articular. En el antebrazo, cierre prematuro de la fisis cubital distal (acortamiento, arqueamiento craneal, rotación externa y valgo carpiano) o de la fisis radial.',
    tecnica_quirurgica: 'Planificación con radiografías craneocaudal y lateral del hueso completo con ambas articulaciones y del contralateral (o TC con reconstrucción 3D): ángulos articulares, ejes y centro de rotación de la angulación. Inmaduros: ostectomía cubital (o radial) de 1–2 cm con todo su periostio e injerto libre de grasa del flanco; resección del puente óseo fisario con injerto de grasa. Maduros: osteotomía oblicua de radio y cúbito en el punto de mayor curvatura, paralela a la superficie articular distal, realineada con clavos de transfixión paralelos a las articulaciones y fijada con fijador externo tipo II (o híbrido o placa); osteotomía en cúpula con placa; distracción continua con fijador circular para acortamientos graves. Cuñas de apertura (conservan longitud) o de cierre (más estables).',
    material_quirurgico: 'Sierra oscilante con irrigación salina fría, taladro de bajas revoluciones, clavos de fijación de rosca central y perfil positivo, rótulas y barras de conexión o acrílico, placas y tornillos, fijador circular, cizalla ósea, cureta o fresa de alta velocidad, aguja hipodérmica para explorar la fisis, separadores de Hohmann, elevadores de periostio.',
    tipo_sutura: 'Planos musculares, subcutáneo y piel por separado; absorbible monofilamento 2-0 o 3-0 para planos profundos y subcutáneo, nylon 3-0 o grapas en piel.',
    complicaciones_frecuentes: 'Corrección incompleta, falla del implante, retardo de consolidación, no unión, osteomielitis, infección del trayecto de los clavos; puente óseo prematuro de la ostectomía (puede requerir otra); la deformidad rotacional persiste tras la ostectomía sola.',
    manejo_anestesico_sugerido: 'Protocolo ortopédico (tablas 32.1 y 32.2 del Fossum): opioide agonista puro, inducción con propofol o alfaxalona, inhalatorio, infusiones de fentanilo, ketamina o lidocaína, bloqueo del plexo braquial (miembro torácico) o epidural y bloqueos femoral y ciático (pelviano); AINE postoperatorio.',
    consideraciones_por_raza: 'Perros jóvenes de razas grandes (crecimiento rápido entre los 4 y 6 meses, termina a los 9–10). Condrodistróficos con deformidades del antebrazo. Las deformidades de crecimiento son raras en gatos.',
    consideraciones_comorbilidades: 'Diferenciar de mala conformación y laxitud o contractura de tendones y ligamentos. Artrosis secundaria limita el resultado. Inmaduros: el plan depende del crecimiento que queda.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 32, pp. 1032–1035; cap. 33, pp. 1079–1084.',
  },
  guide: {
    draft: true,
    lede: 'Corte y realineación de un hueso largo deformado para devolver la alineación normal de las articulaciones. El caso típico es el antebrazo tras el cierre prematuro de una fisis. El Fossum insiste en que la planificación es requisito del éxito: dónde cortar, si los tejidos blandos toleran el cambio y qué fijación mantendrá la estabilidad hasta la unión.',
    meta: { species: ['perro', 'gato'], duration: '120–240 min', difficulty: 'avanzada', contamination: 'limpia' },
    before_you_start: [
      'Planifica con radiografías craneocaudal y lateral del hueso completo con ambas articulaciones, y del miembro contralateral como referencia (o TC con reconstrucción 3D).',
      'Mide angulación, rotación y diferencia de longitud; la rotación se estima mejor en el examen físico o por TC.',
      'En inmaduros con crecimiento por delante, una ostectomía con injerto de grasa puede dejar que el hueso sano crezca y corrija; en maduros, osteotomía correctiva.',
      'Usa clavos de transfixión paralelos a las superficies articulares como guías para realinear.',
      'Irriga la sierra con salino frío y deja el periostio con el segmento que extirpas en una ostectomía.',
    ],
    indications: [
      'Deformidades angulares por traumatismo fisario o mala unión de fracturas que realinean las superficies articulares (p. 1033).',
      'Huesos acortados (alargamiento agudo o progresivo).',
      'Deformidades torsionales.',
      'Mejora de la configuración articular (osteotomías de liberación en el codo incongruente).',
      'Cierre prematuro de la fisis cubital distal o radial con cojera, arqueamiento, valgo o incongruencia de codo o carpo (p. 1080).',
    ],
    sections: [
      {
        id: 'planificacion',
        title: 'Diagnóstico y planificación',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Historia y examen.', body: 'Antecedente de fractura de radio y cúbito o traumatismo poco claro; cojera, arqueamiento craneal y acortamiento del antebrazo, valgo del carpo; dolor de codo en el cierre radial simétrico.', cite: 'Fossum p. 1080' },
              { title: 'Radiografías.', body: 'Craneocaudal y lateral de radio y cúbito con codo y carpo, más el contralateral; sedación si hace falta. La fisis cerrada se ve con densidad ósea; mide las longitudes en las laterales.', cite: 'Fossum p. 1080' },
              { title: 'Ángulo y punto de corte.', body: 'Traza una línea sobre la superficie articular proximal del radio y su perpendicular por el centro del radio proximal; otra sobre la superficie distal y su perpendicular. Donde se cruzan está el punto de mayor curvatura y el sitio de la osteotomía. Repite en la lateral para la angulación craneocaudal.', cite: 'Fossum p. 1081' },
              { title: 'Centro de rotación de la angulación.', body: 'Para la osteotomía en cúpula con placa: líneas de orientación articular del codo y del carpo, eje anatómico proximal y distal; su intersección es el centro de rotación. Si no se tocan, la deformidad es biapical.', cite: 'Fossum p. 1081' },
              { title: 'Rotación.', body: 'Flexiona carpo y codo y mide el ángulo de los metacarpianos respecto de radio y cúbito; TC 3D o modelos estereolitográficos en casos complejos.', cite: 'Fossum p. 1034, 1081' },
              { title: 'Laboratorio y tutor.', body: 'Hemograma y bioquímica; explica las metas, los límites, los cuidados complicados y la posibilidad de nuevas cirugías.', cite: 'Fossum p. 1081' },
            ],
          },
          {
            type: 'table',
            columns: ['Deformidad', 'Técnica (tabla 32.8)'],
            rows: [
              ['Angular', 'Cuña de apertura (conserva longitud) o de cierre (superficie más estable)'],
              ['Acortamiento', 'Cuña invertida, alargamiento transverso, en escalón, distracción continua'],
              ['Rotacional', 'Osteotomía transversa desrotacional'],
              ['Angular, acortamiento y rotación', 'Cúpula, cuña de apertura, distracción continua'],
              ['Articulación incongruente', 'Pélvica triple, intertrocantérea, nivelación de la meseta tibial, ostectomía cubital'],
            ],
            caption: 'Fossum p. 1034. Una mala planificación lleva a corrección incompleta, falla del implante, retardo de unión, infección y no unión.',
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
              ...pick('metadona', 'dexmed', 'propofol', 'alfaxalona', 'isoflurano', 'fentanilo', 'ketamina', 'cefazolina'),
              drug('Regional', 'Bupivacaína', '1–2 mg/kg (máximo)', 'Plexo braquial o femoral y ciático, guiado por neuroestimulador o ecografía', 'En gatos, máximo 1 mg/kg.'),
              ...pick('meloxicam', 'metadonaPost'),
            ],
          },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía y fisiología del crecimiento',
        blocks: [
          {
            type: 'list',
            items: [
              'El radio recibe el 40 % de su longitud de la fisis proximal y el 60 % de la distal; el cúbito, el 85 % de la distal. El crecimiento se acelera entre los 4 y 6 meses y termina hacia los 9–10 (p. 1080).',
              'La fisis cubital distal, cónica, sufre con frecuencia lesiones de Salter-Harris tipo V por aplastamiento: cúbito corto que frena al radio, que se arquea hacia craneal, rota hacia externo y da valgo carpiano.',
              'El cierre completo de una fisis radial da un radio corto pero recto, incongruencia de codo y varo carpiano; el cierre parcial caudolateral distal, valgo.',
              'El cúbito distal del inmaduro es grande y palpable por lateral; lo bordean los tendones flexores del carpo. El periostio del inmaduro es grueso.',
              'La arteria interósea corre entre radio y cúbito: suele encontrarse en las ostectomías (pinzar o presionar 5 minutos).',
            ],
          },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnicas paso a paso',
        blocks: [],
        subsections: [
          {
            id: 'ostectomia',
            title: 'A. Ostectomía cubital con injerto de grasa (inmaduros)',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Posición.', body: 'Decúbito lateral; prepara el miembro y el flanco del mismo lado.', cite: 'Fossum p. 1081' },
                  { title: 'Abordaje.', body: 'Incisión lateral sobre el cúbito medio y distal; separa el extensor digital lateral del extensor cubital del carpo para ver la metáfisis distal (fig. 33.57A).', cite: 'Fossum p. 1081' },
                  { title: 'Aísla.', body: 'Libera 1–2 cm de metáfisis justo proximal a la fisis, por debajo del ligamento interóseo para conservar la estabilidad del codo.', cite: 'Fossum p. 1081' },
                  { title: 'Periostio con el hueso.', body: 'Todo el periostio debe quedar con el segmento que extirpas: si queda, el hueco se cierra antes de tiempo.', cite: 'Fossum p. 1081' },
                  { title: 'Reseca.', body: 'Corta 1–2 cm de cúbito con cizalla o sierra oscilante enfriada con salino (fig. 33.57B).', cite: 'Fossum p. 1081' },
                  { title: 'Injerto de grasa.', body: 'Incisión de 2–3 cm en el flanco, toma una sola pieza grande de grasa subcutánea y colócala en el hueco (fig. 33.57C-D).', cite: 'Fossum p. 1081' },
                  { title: 'Cierra.', body: 'El flanco y el miembro por planos, sobre el injerto.', cite: 'Fossum p. 1082' },
                ],
              },
              { type: 'note', kind: 'book', title: 'Variantes en inmaduros', text: 'Cierre parcial de la fisis radial distal: explora el puente óseo con una aguja (la fisis normal se atraviesa fácil), retíralo con cureta o fresa hasta ver cartílago fisario y rellena con grasa. Radial: ostectomía de 1–2 cm del radio por abordaje craneomedial con injerto de grasa. Cierre completo de ambas fisis: osteotomías y distracción continua (p. 1080–1082).' },
            ],
          },
          {
            id: 'oblicua',
            title: 'B. Osteotomía oblicua de radio y cúbito (maduros)',
            intro: 'Para deformidades angulares y rotacionales con poca diferencia de longitud y angulación craneocaudal leve (p. 1080).',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Posición.', body: 'Decúbito dorsal con el miembro suspendido; prepara desde el borde dorsal de la escápula hasta debajo del carpo.', cite: 'Fossum p. 1081' },
                  { title: 'Clavo proximal.', body: 'Clavo de rosca central de perfil positivo por el radio proximal desde lateral, paralelo a la superficie articular proximal y en su plano frontal (fig. 33.60A).', cite: 'Fossum p. 1082' },
                  { title: 'Clavo distal.', body: 'Otro por el radio distal desde lateral, paralelo a la superficie articular distal y en su plano frontal. Son las guías para realinear.', cite: 'Fossum p. 1083' },
                  { title: 'Cúbito.', body: 'Abordaje lateral al cúbito distal y corte con sierra oscilante; a veces hay que quitar 1–2 cm para alinear bien el radio.', cite: 'Fossum p. 1083' },
                  { title: 'Radio.', body: 'Abordaje craneomedial al punto de mayor curvatura y osteotomía oblicua paralela a la superficie articular distal en los planos frontal y sagital.', cite: 'Fossum p. 1083' },
                  { title: 'Distrae y alinea.', body: 'Baja la mesa para que el peso del animal distraiga el radio distal; realinea con los clavos hasta eliminar la angulación y la rotación.', cite: 'Fossum p. 1083' },
                  { title: 'Fijador tipo II.', body: 'Barra medial con rótulas simples y barra lateral sin rótulas; clavos adicionales por las rótulas mediales, al menos uno más en cada segmento (fig. 33.60B).', cite: 'Fossum p. 1083' },
                  { title: 'Cierra y ajusta.', body: 'Subcutáneo y piel por separado; aprieta las rótulas y corta los clavos.', cite: 'Fossum p. 1083' },
                  { title: 'Radiografía.', body: 'Superficies articulares del radio paralelas y caras craneales de ambos segmentos en el plano frontal; si no, reajusta el fijador.', cite: 'Fossum p. 1083' },
                ],
              },
              { type: 'note', kind: 'tip', title: 'Otras fijaciones', text: 'Fijadores híbridos; placas si hay espacio distal para tres tornillos; osteotomía en cúpula con placa para deformidades uni o biapicales; fijador circular con distracción continua para angulaciones graves con diferencia de longitud (p. 1080).' },
              { type: 'note', kind: 'error', title: 'Errores', bullets: ['Corregir el ángulo y olvidar la rotación.', 'Cortar sin irrigar: necrosis térmica y retardo de unión.', 'Fijación insuficiente para el tamaño y la actividad del paciente.'] },
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
              { title: 'Tras la ostectomía.', body: 'Radiografía de la posición y longitud del hueco; vendaje acolchado o férula 2 semanas si fue radial o cubital bilateral; actividad limitada y radiografías mensuales hasta la madurez esquelética.', cite: 'Fossum p. 1083' },
              { title: 'Tras la osteotomía.', body: 'Paseos con correa y rehabilitación hasta la consolidación; cambio semanal del vendaje del fijador o hidroterapia diaria con ducha.', cite: 'Fossum p. 1083' },
              { title: 'Controles.', body: 'A las 2 semanas (puntos y fijador) y cada 6 semanas con radiografía.', cite: 'Fossum p. 1083' },
              { title: 'Analgesia.', body: 'Opioide 24–48 h y AINE según el dolor.' },
              { title: 'Clavos.', body: 'Cuidado diario de los trayectos para prevenir infección.' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Pronóstico', text: 'Reservado en inmaduros tras ostectomías: depende del crecimiento que queda; una ostectomía cubital puede lograr longitud normal y algo de corrección del valgo, pero la rotación persiste. Bueno para la unión tras la osteotomía; la función depende de la corrección lograda y de la artrosis (p. 1084).' },
        ],
      },
    ],
    closure: [
      { layer: 'Planos musculares', suture: 'Absorbible monofilamento', gauge: '2-0 o 3-0', pattern: 'Simples o continuo', why: 'Cubren el hueso y el injerto de grasa.' },
      { layer: 'Subcutáneo', suture: 'Monocryl', gauge: '3-0', pattern: 'Continuo', why: 'Espacio muerto.' },
      { layer: 'Piel', suture: 'Nylon o grapas', gauge: '3-0', pattern: 'Simples', why: 'Retiro a las 2 semanas.' },
    ],
    complications: [
      { name: 'Corrección incompleta', prevent: 'Planificación completa, guías paralelas a las articulaciones, control intraoperatorio.', manage: 'Reajustar el fijador o reintervenir.' },
      { name: 'Retardo de unión o no unión', prevent: 'Estabilidad adecuada, irrigar la sierra, respetar los tejidos blandos.', manage: 'Injerto óseo esponjoso, nueva fijación.' },
      { name: 'Osteomielitis e infección de los clavos', prevent: 'Asepsia, profilaxis, cuidado de los trayectos.', manage: 'Antibiótico según cultivo; retirar implantes flojos.' },
      { name: 'Falla del implante', prevent: 'Implante dimensionado al paciente.', manage: 'Nueva fijación.' },
      { name: 'Cierre prematuro de la ostectomía', prevent: 'Extirpar todo el periostio, injerto de grasa.', manage: 'Segunda ostectomía.' },
    ],
    quiz: [
      { q: '¿Cuáles son las cuatro indicaciones de una osteotomía correctiva?', a: 'Corregir deformidades angulares realineando las articulaciones, recuperar longitud, corregir torsión y mejorar la configuración articular.' },
      { q: '¿Cómo localizas el sitio de la osteotomía en el radio?', a: 'Con perpendiculares a las superficies articulares proximal y distal trazadas por el centro del hueso; su intersección marca el punto de mayor curvatura.' },
      { q: '¿Qué diferencia una cuña de apertura de una de cierre?', a: 'La de apertura conserva la longitud; la de cierre da una superficie más estable.' },
      { q: '¿Por qué se extirpa el periostio con el segmento en una ostectomía?', a: 'Porque su capacidad osteogénica cerraría el hueco antes de tiempo.' },
      { q: '¿Para qué sirve el injerto de grasa?', a: 'Para impedir que el hueco o el puente fisario vuelvan a unirse con hueso.' },
      { q: '¿Qué deformidad no corrige la ostectomía cubital sola?', a: 'La rotación.' },
    ],
    videos: [],
    sources: [
      SOURCES.fossum(32, 'principios de fracturas: malunión y osteotomías correctivas (pp. 1032–1035)'),
      SOURCES.fossum(33, 'fracturas específicas: deformidades de crecimiento de radio y cúbito, ostectomías, resección fisaria y osteotomía oblicua (pp. 1079–1084)'),
      SOURCES.plumbs,
    ],
  },
};
