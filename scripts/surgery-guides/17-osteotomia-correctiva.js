// Osteotomía correctiva de deformidad angular (id 17). Medium depth: planning matters more than cutting.
const { pick, drug, SOURCES } = require('./_common');

module.exports = {
  id: 17,
  legacy: {
    indicaciones: 'Deformidad angular de un hueso largo (valgo o varo, con o sin torsión y acortamiento) que causa cojera, dolor o incongruencia articular: cierre prematuro de la fisis distal del cúbito o del radio, mala unión de fracturas, condrodistrofia con deformidad grave. Antes del cierre de las fisis, considerar primero cirugías que liberen el crecimiento.',
    tecnica_quirurgica: 'Planificación con radiografías ortogonales del miembro completo (y del contralateral) o TC: ejes mecánicos y anatómicos, ángulos articulares, centro de rotación de la angulación (CORA). Osteotomía en cuña de cierre, cuña de apertura o cupuliforme (radial) a nivel del CORA. Corrección de la angulación y la rotación, verificación del alineamiento de las articulaciones proximal y distal. Estabilización con placa ósea o fijador externo (lineal o circular). Si hay acortamiento, distracción con fijador circular.',
    material_quirurgico: 'Instrumental ortopédico: sierra oscilante, osteótomos, elevadores de periostio, separadores de Hohmann, pinzas de reducción, taladro, guías, placas (bloqueadas o de compresión) y tornillos, o fijador externo; agujas de Kirschner para guías de corte; intensificador de imágenes si está disponible.',
    tipo_sutura: 'Fascia y músculos: PDS o Monocryl 2-0 o 3-0. Subcutáneo: Monocryl 3-0. Piel: nylon 3-0 o grapas.',
    complicaciones_frecuentes: 'Corrección insuficiente o excesiva; retardo de consolidación o no unión; infección del implante; falla del implante; rigidez articular; en fijadores externos, infección del trayecto de los clavos.',
    manejo_anestesico_sugerido: 'Opioide agonista puro, inducción con propofol o alfaxalona, inhalatorio; bloqueo regional (plexo braquial para miembro torácico, epidural o bloqueo femoral y ciático para el pelviano). Cefazolina IV 22 mg/kg antes de incidir y cada 90 min. AINE postoperatorio.',
    consideraciones_por_raza: 'Condrodistróficas (Dachshund, Basset, Bulldog, Corgi): deformidades del antebrazo. Razas grandes jóvenes: cierre prematuro de fisis por trauma.',
    consideraciones_comorbilidades: 'Cachorros en crecimiento: el plan cambia según cuánto crecimiento queda. Osteoartritis secundaria: limita el resultado.',
    fuente: 'Johnston SA, Tobias KM, Veterinary Surgery: Small Animal, 2.ª ed. (2018); Fossum, Small Animal Surgery, 5.ª ed., caps. 32–34; Fox DB, Tomlinson JL, principios de corrección de deformidades.',
  },
  guide: {
    draft: true,
    lede: 'Corte y realineación de un hueso largo deformado. El éxito se decide antes de entrar a pabellón: medir los ejes, encontrar el centro de rotación de la angulación y planificar el corte y la fijación. Es cirugía de especialista; esta guía resume los principios.',
    meta: { species: ['perro', 'gato'], duration: '120–240 min', difficulty: 'avanzada', contamination: 'limpia' },
    before_you_start: [
      'Planifica con radiografías ortogonales del hueso completo, con ambas articulaciones, y del miembro contralateral como referencia.',
      'Localiza el CORA: la osteotomía hecha ahí corrige sin desplazar el eje.',
      'Mide también la torsión y el acortamiento: corregir solo el ángulo puede dejar un pie rotado.',
      'Ten preparado el implante calculado (placa o fijador) y un plan B.',
      'Comprueba el alineamiento de las articulaciones proximal y distal antes de fijar.',
    ],
    indications: [
      'Deformidad angular con cojera, dolor o incongruencia articular (por ejemplo, codo incongruente por cierre prematuro de la fisis cubital distal).',
      'Mala unión de fracturas.',
      'Deformidades graves en razas condrodistróficas.',
    ],
    sections: [
      {
        id: 'planificacion',
        title: 'Planificación',
        blocks: [
          { type: 'steps', items: [
            { title: 'Imágenes.', body: 'Radiografías craneocaudal y mediolateral perfectas del hueso completo (o TC con reconstrucción 3D), del miembro afectado y del sano.' },
            { title: 'Ejes y ángulos.', body: 'Traza los ejes anatómicos o mecánicos del segmento proximal y distal, y mide los ángulos articulares de referencia comparados con el lado sano o los valores publicados.' },
            { title: 'CORA.', body: 'El punto donde se cruzan los ejes proximal y distal. Su posición indica dónde cortar.' },
            { title: 'Tipo de osteotomía.', body: 'Cuña de cierre (simple, acorta un poco), cuña de apertura (alarga, necesita injerto), cupuliforme o radial (corrige sin cambiar el largo, buena para el radio).' },
            { title: 'Fijación.', body: 'Placa ósea (cuando hay buen hueso a ambos lados) o fijador externo lineal o circular (permite ajustar y distraer si hay acortamiento).' },
          ] },
          { type: 'note', kind: 'why', title: 'Por qué el CORA', text: 'Si la osteotomía se hace lejos del CORA, al corregir el ángulo el segmento distal se desplaza lateralmente y la articulación queda fuera del eje, aunque el hueso parezca recto.' },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        blocks: [{ type: 'drugs', items: [...pick('metadona', 'dexmed', 'propofol', 'alfaxalona', 'isoflurano', 'fentanilo', 'ketamina', 'cefazolina'), drug('Regional', 'Bupivacaína', '1–2 mg/kg (máximo)', 'Bloqueo del plexo braquial o femoral y ciático, guiado por neuroestimulador o ecografía', 'En gatos, máximo 1 mg/kg.'), ...pick('meloxicam', 'metadonaPost')] }],
      },
      {
        id: 'tecnica',
        title: 'Técnica (principios)',
        blocks: [
          { type: 'steps', items: [
            { title: 'Abordaje.', body: 'Según el hueso; expón el sitio de la osteotomía respetando el periostio y los tejidos blandos.' },
            { title: 'Guías.', body: 'Agujas de Kirschner proximal y distal, paralelas a las articulaciones o a los ejes de referencia: sirven para orientar el corte y comprobar la corrección.' },
            { title: 'Osteotomía.', body: 'Con sierra oscilante irrigada con salino frío (evitar la necrosis térmica), siguiendo el plan.' },
            { title: 'Corrige.', body: 'Ángulo, rotación y largo. Las guías deben quedar paralelas entre sí o en el ángulo planificado.' },
            { title: 'Fijación provisional.', body: 'Pinzas de reducción o agujas; comprueba el alineamiento articular con fluoroscopia o radiografía.' },
            { title: 'Fijación definitiva.', body: 'Placa o fijador según el plan.' },
            { title: 'Cierre.', body: 'Fascia, subcutáneo y piel.' },
            { title: 'Radiografía postoperatoria.', body: 'Ortogonales: corrección lograda, posición de los implantes.' },
          ] },
          { type: 'note', kind: 'error', title: 'Errores frecuentes', bullets: ['Corregir el ángulo y olvidar la rotación.', 'Cortar sin irrigar: necrosis térmica y retardo de consolidación.', 'Fijación insuficiente para el tamaño y la actividad del paciente.'] },
        ],
      },
      {
        id: 'postop',
        title: 'Postoperatorio',
        blocks: [{ type: 'steps', items: [
          { title: 'Analgesia.', body: 'Opioide 24–48 h, AINE 10–14 días.' },
          { title: 'Restricción.', body: 'Ejercicio controlado con correa 8–12 semanas; fisioterapia.' },
          { title: 'Radiografías.', body: 'A las 6–8 semanas y hasta la consolidación.' },
          { title: 'Fijador externo.', body: 'Cuidado diario de los trayectos de los clavos; ajustes si es circular.' },
        ] }],
      },
    ],
    closure: [
      { layer: 'Fascia y músculo', suture: 'PDS o Monocryl', gauge: '2-0 o 3-0', pattern: 'Continuo simple o simples', why: 'Cubre el implante.' },
      { layer: 'Subcutáneo', suture: 'Monocryl', gauge: '3-0', pattern: 'Continuo simple', why: 'Espacio muerto.' },
      { layer: 'Piel', suture: 'Nylon o grapas', gauge: '3-0', pattern: 'Simples', why: 'Retiro a los 10–14 días.' },
    ],
    complications: [
      { name: 'Corrección insuficiente o excesiva', prevent: 'Planificación con CORA, guías, control intraoperatorio.', manage: 'Reintervención o ajuste del fijador.' },
      { name: 'Retardo de consolidación o no unión', prevent: 'Estabilidad, respetar tejidos blandos, irrigar la sierra.', manage: 'Injerto óseo, refijación.' },
      { name: 'Infección', prevent: 'Asepsia, profilaxis, tiempo quirúrgico.', manage: 'Antibiótico según cultivo; retirar el implante tras la consolidación.' },
      { name: 'Falla del implante', prevent: 'Implante dimensionado al paciente.', manage: 'Refijación.' },
    ],
    quiz: [
      { q: '¿Qué es el CORA y por qué importa?', a: 'El centro de rotación de la angulación, donde se cruzan los ejes proximal y distal; la osteotomía ahí corrige sin desplazar el eje.' },
      { q: '¿Qué tres componentes de la deformidad tienes que medir?', a: 'Angulación, torsión (rotación) y acortamiento.' },
      { q: '¿Por qué se irriga la sierra?', a: 'Para evitar la necrosis térmica del hueso, que retrasa la consolidación.' },
    ],
    videos: [],
    sources: [
      SOURCES.tobias('Corrección de deformidades angulares'),
      SOURCES.fossum('32–34', 'principios de ortopedia y manejo de fracturas'),
      { text: 'Fox DB, Tomlinson JL. Principios de corrección de deformidades angulares de los miembros. En: Tobias KM, Johnston SA, Veterinary Surgery: Small Animal.', kind: 'complemento' },
      SOURCES.plumbs,
    ],
  },
};
