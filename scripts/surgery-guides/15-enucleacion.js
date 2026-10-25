// Enucleación (id 15). Rewritten from Fossum 5.ª ed., cap. 16 (tabla 16.1, pp. 266–271, 296–301).
const { drug, SOURCES } = require('./_common');

module.exports = {
  id: 15,
  legacy: {
    indicaciones: 'Glaucoma terminal con ceguera permanente cuando el tratamiento médico ya no controla el dolor; lesión corneal o intraocular irreparable; neoplasia; proptosis grave; uveítis crónica con ceguera. La evisceración con implante (derivar al oftalmólogo) es alternativa en el glaucoma primario sin infección ni neoplasia.',
    tecnica_quirurgica: 'Se extirpan el globo y los tejidos productores de lágrima (glándula lagrimal orbitaria, tercer párpado con su glándula, fondo de saco conjuntival y bordes palpebrales con las glándulas de Meibomio). Técnica transconjuntival (la más usada; menos hundimiento y sangrado, no para úlceras infectadas o perforaciones), lateral o transpalpebral (mejor aislamiento de la superficie ocular infectada o con neoplasia; más sangrado y tracción del nervio óptico). Sin traccionar el globo (puede dejar ciego el otro ojo, sobre todo en gatos), sin incidirlo ni vaciarlo. Pinzar y cortar el pedículo a medio camino entre el globo y el fondo de la órbita. Cierre del septo orbitario con PDS 3-0 o 4-0 en colchonero horizontal, bupivacaína en la órbita, subcutáneo y piel. Opcional: malla orbitaria o implante de silicona de 16–22 mm.',
    material_quirurgico: 'Cuatro pinzas de campo, pinzas de Allis, Brown-Adson, mango y hoja n.º 15, Metzenbaum cortas curvas, Mayo, tijeras de enucleación curvas fuertes, pinzas mosquito o Crile curvas, clips hemostáticos grandes, portaagujas pequeño, separador palpebral; opcional cauterio, aspiración, alginato de calcio e implante de silicona.',
    tipo_sutura: 'Septo orbitario: PDS 2-0 a 4-0 (3-0 o 4-0), colchonero horizontal. Subcutáneo y piel: Vicryl 2-0 a 4-0. Malla orbitaria: nylon o polipropileno 3-0 a 5-0 continuo en el periostio del reborde, con puntadas a 2–4 mm.',
    complicaciones_frecuentes: 'Infección y dehiscencia; secreción crónica, fluctuación o tumefacción de la órbita por tejido productor de lágrima remanente (quiste orbitario, infección, drenaje intermitente); ceguera del ojo contralateral por tracción del quiasma; hemorragia; hundimiento orbitario.',
    manejo_anestesico_sugerido: 'Tabla 16.1: pacientes a menudo geriátricos; anticolinérgico (atropina 0,02–0,04 mg/kg o glicopirrolato 0,01 mg/kg) para el reflejo oculocardíaco, con precaución en cardiópatas y gatos geriátricos, o dosis calculada a mano; ansiolítico y opioide. Propofol o alfaxalona; isoflurano o sevoflurano con fentanilo si hace falta. Bloqueo orbitario con bupivacaína 0,5 % tras cerrar el septo (0,5–2 mg/kg en perros, 0,2–0,5 mg/kg en gatos, máximo 2 mg/kg). AINE postoperatorio.',
    consideraciones_por_raza: 'Glaucoma primario en Cocker spaniel, Basset hound, Shar Pei, Chow chow, Bouvier des Flandres y Shiba Inu; en gatos, secundario a uveítis (primario raro en siameses y persas). Implantes más pequeños en braquicéfalos y más grandes en dolicocéfalos.',
    consideraciones_comorbilidades: 'Uveítis crónica: buscar enfermedad sistémica (infecciosa, neoplásica o inmunomediada) antes de anestesiar; radiografía de tórax y ecografía abdominal si se sospecha. Tratar el glaucoma y las úlceras hasta la cirugía. Enviar siempre el globo a histopatología.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 16, tabla 16.1 y pp. 266–271 y 296–301.',
  },
  guide: {
    draft: true,
    lede: 'Extirpación del globo ocular junto con todos los tejidos que producen lágrima: glándula lagrimal orbitaria, tercer párpado con su glándula, conjuntiva y bordes palpebrales con sus glándulas. Elimina de forma definitiva un ojo ciego y doloroso y el pronóstico de confort es excelente. Las reglas: nunca traccionar el globo y no dejar ningún tejido que produzca líquido.',
    meta: { species: ['perro', 'gato'], duration: '30–60 min', difficulty: 'intermedia', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Confirma cuál ojo y márcalo; examina el contralateral.',
      'Nunca tires del globo: la tracción del nervio óptico y el quiasma puede dejar ciego el otro ojo, sobre todo en gatos.',
      'No incidas ni vacíes el globo: disemina la enfermedad y arruina la histopatología.',
      'Elige la técnica: transconjuntival en la mayoría; transpalpebral si hay úlcera infectada, perforación o neoplasia de superficie.',
      'Ten atropina o glicopirrolato calculados para el reflejo oculocardíaco, y extirpa toda la conjuntiva, el tercer párpado con su glándula y los bordes palpebrales.',
    ],
    indications: [
      'Glaucoma terminal con ceguera permanente cuando el tratamiento médico ya no controla la presión ni el dolor (p. 297).',
      'Lesión corneal o intraocular irreparable; proptosis grave.',
      'Neoplasia intraocular; uveítis crónica con ceguera.',
      'La evisceración con implante es alternativa estética en el glaucoma primario doloroso sin infección ni neoplasia (derivar) (p. 301).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Preoperatorio',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Examen.', body: 'Del ojo afectado (presión intraocular: normal 10–20 mmHg en perros y 10–25 en gatos) y del contralateral. Ecografía ocular en ojos opacos.', cite: 'Fossum p. 296' },
              { title: 'Causa.', body: 'En la uveítis crónica, busca enfermedad sistémica (fúngica, rickettsial, leptospirosis, neosporosis, brucelosis, moquillo; en gatos, FeLV, FIV, PIF, toxoplasmosis) o neoplasia: radiografía de tórax y ecografía abdominal.', cite: 'Fossum p. 296' },
              { title: 'Tratamiento hasta la cirugía.', body: 'Antiglaucomatosos y tratamiento de úlceras.', cite: 'Fossum p. 297' },
              { title: 'Laboratorio (tabla 16.1).', body: 'Mínimo hematocrito, proteínas, creatinina y ALT; mejor hemograma y bioquímica, con orina desde los 5 años; estudio cardiaco si hay soplo.', cite: 'tabla 16.1' },
              { title: 'Antibiótico.', body: 'Cefazolina IV antes de la cirugía; tópico de amplio espectro (neomicina-polimixina-bacitracina en perros; eritromicina u oxitetraciclina en gatos, que rara vez hacen anafilaxia a la neomicina o polimixina).', cite: 'Fossum p. 268' },
              { title: 'Posición.', body: 'Decúbito ventral con una toalla enrollada bajo el mentón para nivelar la cabeza.', cite: 'Fossum p. 297' },
              { title: 'Explica.', body: 'La órbita queda cerrada con piel y puede hundirse; una malla o un implante mejoran la estética (no con infección o neoplasia).' },
            ],
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'La tracción o compresión del globo puede desencadenar el reflejo oculocardíaco (bradicardia). Cuidado con la mascarilla si el ojo es frágil (tabla 16.1, p. 267).',
        blocks: [
          {
            type: 'drugs',
            items: [
              drug('Premedicación', 'Atropina', '0,02–0,04 mg/kg', 'IM o SC', 'O glicopirrolato 0,01 mg/kg. Cuidado en cardiópatas y gatos geriátricos: tenla calculada para dar IV si aparece la bradicardia.'),
              drug('Premedicación', 'Midazolam', '0,1–0,2 mg/kg', 'IM o IV'),
              drug('Premedicación', 'Metadona', '0,1–0,5 mg/kg', 'IM', 'O hidromorfona 0,1–0,2 mg/kg (perro), buprenorfina 0,01–0,02 mg/kg.'),
              drug('Inducción', 'Propofol', '2–6 mg/kg', 'IV, a efecto', 'O alfaxalona 2–3 mg/kg (perros) o 2–5 mg/kg (gatos).'),
              drug('Mantenimiento', 'Isoflurano o sevoflurano', 'A efecto', 'Inhalatoria', 'Con fentanilo en infusión si hace falta.'),
              drug('Bloqueo orbitario', 'Bupivacaína 0,5 %', '0,5–2 mg/kg (máximo 2 mg/kg)', 'En la órbita a través del septo cerrado, aguja 23 G', 'Gatos: 0,2–0,5 mg/kg. 1–3 mL en total.'),
              drug('Rescate', 'Atropina', '0,02–0,04 mg/kg', 'IV', 'Bradicardia intensa o arritmias; o glicopirrolato 0,005–0,01 mg/kg IV.'),
              drug('Postoperatorio', 'Carprofeno', '2,2 mg/kg', 'VO o IM cada 12 h', 'Solo perros.'),
              drug('Postoperatorio', 'Meloxicam', '0,1–0,2 mg/kg', 'SC o VO, una vez', 'Luego 0,1 mg/kg cada 24 h en perros; en gatos, 0,3 mg/kg SC una vez.'),
              drug('Postoperatorio', 'Buprenorfina', '0,01–0,02 mg/kg', 'IV, IM o SC cada 4–6 h'),
            ],
          },
          { type: 'note', kind: 'tip', title: 'Recuperación', text: 'Extuba y recupera en un ambiente tranquilo para que no se golpee la cabeza. Si está disfórico, acepromacina a dosis baja (0,005–0,01 mg/kg IV) potencia el opioide (p. 268).' },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          {
            type: 'list',
            items: [
              'Los párpados se unen en los cantos medial y lateral, fijados por los ligamentos palpebrales; el canto medial está muy adherido a planos profundos y puede tener vasos grandes (p. 268, 298).',
              'Los bordes palpebrales tienen una fila de glándulas de Meibomio (aceite de la lágrima) que hay que extirpar por completo.',
              'Tercer párpado: pliegue triangular en el canto medial con un cartílago en T y su glándula en la base; también produce lágrima.',
              'El septo orbitario es una fascia densa dentro del párpado: al traccionarlo se mueve toda la cabeza. Es la capa que se cierra para que la órbita no se hunda.',
              'El pedículo orbitario contiene los vasos, el nervio óptico y el músculo retractor del globo; los tendones de los músculos extraoculares se insertan en la esclera, de color amarillento.',
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
            id: 'transconjuntival',
            title: 'A. Enucleación transconjuntival',
            intro: 'La más usada: conserva tejido orbitario (menos hundimiento) y sangra menos. No se prefiere con úlceras infectadas o perforaciones, porque expone la órbita a la superficie contaminada (p. 298).',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Cantotomía lateral.', body: 'Amplia, con Mayo; puedes pinzar antes con una hemostática recta para que sangre menos (fig. 16.24A). Un separador palpebral mejora la visión.', cite: 'Fossum p. 298' },
                  { title: 'Peritomía.', body: 'Incisión de 360° en la conjuntiva bulbar a pocos mm del limbo con tijera de Stevens o Metzenbaum pequeña (fig. 16.24B).', cite: 'Fossum p. 298' },
                  { title: 'Profundiza.', body: 'Usando el reborde orbitario dorsal como referencia, diseca roma y cortante hasta ver la esclera amarillenta y los tendones extraoculares.', cite: 'Fossum p. 298' },
                  { title: 'Músculos.', body: 'Corta los tendones cerca del globo (puedes pinzarlos antes), sujetando la conjuntiva del limbo para no tirar del ojo (fig. 16.24C). Completa los 360°; no rotes el globo más de 90°.', cite: 'Fossum p. 298' },
                  { title: 'Pedículo.', body: 'Sujetando el globo para no traccionarlo, pinza el pedículo (vasos, nervio óptico y retractor del globo) con hemostáticas curvas y córtalo a medio camino entre el globo y el fondo de la órbita, sin cortar la esclera (fig. 16.24D).', cite: 'Fossum p. 298' },
                  { title: 'Hemostasia.', body: 'Pinzando los vasos del lado medial, presión directa, clips o alginato de calcio.', cite: 'Fossum p. 298' },
                  { title: 'Tercer párpado.', body: 'Retira el separador e incide ampliamente la base de la membrana nictitante, pinzando antes; extirpa todo el tercer párpado con su cartílago y su glándula, y toda la conjuntiva (fig. 16.24E).', cite: 'Fossum p. 298' },
                  { title: 'Bordes palpebrales.', body: 'Extirpa los bordes con tijera recta fuerte desde la cantotomía, incluyendo todo el borde sin pelo y sus glándulas de Meibomio, y el canto medial (fig. 16.24F).', cite: 'Fossum p. 298' },
                  { title: 'Lava.', body: 'Irriga la órbita con abundante salino estéril.', cite: 'Fossum p. 298' },
                  { title: 'Septo orbitario.', body: 'Identifícalo traccionando el tejido del párpado (se mueve la cabeza) y ciérralo bien con PDS 3-0 o 4-0 en colchonero horizontal; busca huecos con la punta del portaagujas.', cite: 'Fossum p. 298' },
                  { title: 'Bloqueo.', body: 'Inyecta 1–3 mL de bupivacaína 0,5 % en la órbita a través del septo con aguja 23 G.', cite: 'Fossum p. 298–299' },
                  { title: 'Cierra.', body: 'Subcutáneo y piel de forma habitual.', cite: 'Fossum p. 299' },
                ],
              },
              { type: 'note', kind: 'tip', title: 'Más espacio', text: 'Para acceder mejor al polo posterior antes de sacar el globo, extirpa los bordes palpebrales y el tercer párpado justo después de la cantotomía (p. 299).' },
            ],
          },
          {
            id: 'transpalpebral',
            title: 'B. Enucleación transpalpebral',
            intro: 'Diseca por fuera del saco conjuntival: aísla mejor la superficie ocular (infección o neoplasia), a cambio de más sangrado y más tracción del nervio óptico, un problema en gatos y perros de órbita profunda (p. 300).',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Cierra los párpados.', body: 'Con pinzas de Allis o un continuo simple dejando cabos largos para posicionar el globo (fig. 16.26A).', cite: 'Fossum p. 300' },
                  { title: 'Incisión de piel.', body: 'Circunferencial en la capa de piel y orbicular, paralela y a 4–5 mm de los bordes, con hoja n.º 15 o electrocauterio (fig. 16.26B).', cite: 'Fossum p. 300' },
                  { title: 'Diseca fuera del saco.', body: 'Con Metzenbaum pequeña, alrededor del globo, por detrás del fondo de saco conjuntival; Allis en el subcutáneo para mantener abiertos los bordes (fig. 16.26C-D).', cite: 'Fossum p. 300' },
                  { title: 'Cantos.', body: 'Corta los tendones cantales medial y lateral con Mayo.', cite: 'Fossum p. 300' },
                  { title: 'Hasta la esclera.', body: 'A la altura del reborde orbitario dorsal, profundiza hasta ver la esclera y los tendones; libera 360° paralelo al limbo.', cite: 'Fossum p. 300' },
                  { title: 'Pedículo.', body: 'Pinza el polo posterior, retira la pinza y corta el pedículo a medio camino entre el globo y el fondo de la órbita con tijera de enucleación (fig. 16.26E).', cite: 'Fossum p. 300' },
                  { title: 'Retira el bloque.', body: 'Globo, bordes palpebrales, glándula lagrimal orbitaria, conjuntiva y tercer párpado con su glándula (fig. 16.26F). Lava la órbita.', cite: 'Fossum p. 300' },
                  { title: 'Cierra.', body: 'Septo orbitario, bupivacaína, subcutáneo y piel como en la transconjuntival.', cite: 'Fossum p. 300' },
                ],
              },
            ],
          },
          {
            id: 'lateral',
            title: 'C. Enucleación lateral',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Cuándo.', body: 'Mejor visión del tejido retrobulbar antes de sacar el globo (órbitas profundas) y buen aislamiento de la superficie; pierde más tejido orbitario y puede sangrar más que la transconjuntival.', cite: 'Fossum p. 299' },
                  { title: 'Cantotomía y capas.', body: 'Cantotomía lateral amplia; separa con Metzenbaum curva cada párpado en una capa anterior de piel y orbicular y otra posterior tarsoconjuntival, hasta el canto medial (fig. 16.25A-B).', cite: 'Fossum p. 299' },
                  { title: 'Corta la capa anterior.', body: 'Paralela al borde, lo más cerca posible del canto medial (fig. 16.25C).', cite: 'Fossum p. 299' },
                  { title: 'Cierra el ojo.', body: 'Allis o continuo 3-0 o 4-0 con cabos largos (fig. 16.25D).', cite: 'Fossum p. 299' },
                  { title: 'Diseca desde lateral.', body: 'Por fuera del saco conjuntival, pinzando y cortando los músculos cerca de su inserción mientras giras el tejido hacia medial (fig. 16.25E).', cite: 'Fossum p. 300' },
                  { title: 'Pedículo y medial.', body: 'Pinza y corta el pedículo; rueda el globo de lateral a medial y corta los músculos restantes, el tendón cantal medial y las uniones del canto medial (fig. 16.25F).', cite: 'Fossum p. 300' },
                  { title: 'Termina.', body: 'Extirpa el tercer párpado con su glándula y la conjuntiva que quede (fig. 16.25G); cierra como en la transconjuntival.', cite: 'Fossum p. 300' },
                ],
              },
            ],
          },
          {
            id: 'estetica',
            title: 'D. Malla o implante orbitario',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Malla.', body: 'Continuo tenso de nylon o polipropileno 3-0 a 5-0 en el periostio del reborde orbitario anterior, con puntadas a 2–4 mm, horizontal y vertical. Retira todas las gasas antes de las últimas puntadas.', cite: 'Fossum p. 299' },
                  { title: 'Implante.', body: 'Esfera de silicona de 16–22 mm (menor en braquicéfalos, mayor en dolicocéfalos), esterilizada con gas y enjuagada; se puede recortar el 25 % anterior y colocar con la cara plana hacia adelante, retenida por el septo o la malla.', cite: 'Fossum p. 299' },
                  { title: 'Cuándo no.', body: 'Si la órbita pudo contaminarse (infección, transpalpebral por úlcera infectada) o hay neoplasia: valora el riesgo del cuerpo extraño frente al beneficio estético.', cite: 'Fossum p. 300–301' },
                ],
              },
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
              { title: 'Collar rígido.', body: 'Que sobrepase la nariz con la cabeza extendida; los collares blandos o inflables no evitan que se frote.', cite: 'Fossum p. 271' },
              { title: 'Herida.', body: 'Vigila inflamación, enrojecimiento y secreción como en cualquier herida de piel.', cite: 'Fossum p. 301' },
              { title: 'Frío y calor.', body: 'Compresas frías el primer día y tibias después reducen la inflamación.' },
              { title: 'Analgesia.', body: 'Opioide y AINE los primeros días (tabla 16.1).' },
              { title: 'Histopatología.', body: 'Envía siempre el globo y los tejidos sospechosos.', cite: 'Fossum p. 298' },
              { title: 'Secreción tardía.', body: 'Aire o líquido que aumenta en la órbita, drenaje crónico o quiste: queda tejido productor de lágrima; reopera para extirparlo o ablacionar los puntos lagrimales.', cite: 'Fossum p. 301' },
            ],
          },
        ],
      },
    ],
    closure: [
      { layer: 'Septo orbitario', suture: 'PDS', gauge: '3-0 o 4-0', pattern: 'Colchonero horizontal, sin huecos', why: 'Evita que la órbita se hunda; por aquí se infiltra la bupivacaína.' },
      { layer: 'Subcutáneo', suture: 'Vicryl', gauge: '2-0 a 4-0', pattern: 'Continuo o simples', why: 'Reduce el espacio muerto.' },
      { layer: 'Piel', suture: 'Vicryl o nylon', gauge: '3-0 o 4-0', pattern: 'Simples o continuo', why: 'Piel fina de la cara.' },
      { layer: 'Malla orbitaria (opcional)', suture: 'Nylon o polipropileno', gauge: '3-0 a 5-0', pattern: 'Continuo tenso en el periostio, puntadas a 2–4 mm', why: 'Mejora la estética sin implante.' },
    ],
    complications: [
      { name: 'Ceguera del ojo contralateral', prevent: 'No traccionar el globo ni el nervio óptico, sobre todo en gatos.', manage: 'Sin tratamiento eficaz.' },
      { name: 'Secreción crónica o quiste orbitario', prevent: 'Extirpar toda la conjuntiva, el tercer párpado con su glándula, la glándula lagrimal y los bordes con sus glándulas de Meibomio.', manage: 'Reoperar para extirpar el tejido remanente.' },
      { name: 'Hemorragia', prevent: 'Pinzar antes de cortar; vasos mediales y del canto medial.', manage: 'Presión, clips, alginato de calcio.' },
      { name: 'Infección y dehiscencia', prevent: 'Técnica transpalpebral si la superficie está infectada; asepsia.', manage: 'Antibiótico, drenaje.' },
      { name: 'Hundimiento de la órbita', prevent: 'Cierre hermético del septo; malla o implante si es apropiado.', manage: 'Estético.' },
      { name: 'Bradicardia (reflejo oculocardíaco)', prevent: 'Anticolinérgico preparado o en la premedicación.', manage: 'Atropina o glicopirrolato IV.' },
    ],
    quiz: [
      { q: '¿Por qué no se tracciona el globo al cortar el pedículo?', a: 'Porque la tracción del nervio óptico y el quiasma puede dejar ciego el otro ojo, sobre todo en gatos.' },
      { q: '¿Qué tejidos deben salir con el globo?', a: 'La glándula lagrimal orbitaria, el tercer párpado con su glándula, toda la conjuntiva y los bordes palpebrales con sus glándulas de Meibomio.' },
      { q: '¿Cuándo prefieres la técnica transpalpebral?', a: 'Con úlcera infectada, perforación o neoplasia de superficie, porque aísla mejor la superficie ocular del sitio quirúrgico.' },
      { q: '¿Cómo identificas y cierras el septo orbitario?', a: 'Traccionando el tejido del párpado (se mueve toda la cabeza) y cerrándolo con PDS 3-0 o 4-0 en colchonero horizontal sin dejar huecos.' },
      { q: '¿Qué dosis de bupivacaína usas en la órbita y por dónde?', a: '0,5–2 mg/kg en perros (0,2–0,5 en gatos, máximo 2 mg/kg), 1–3 mL a través del septo cerrado con aguja 23 G.' },
      { q: '¿Qué significa una órbita que drena o se llena de aire meses después?', a: 'Que quedó tejido productor de lágrima o una comunicación; se reopera para extirparlo.' },
    ],
    videos: [
      { title: 'Canine Enucleation Surgery: Transpalpebral Approach Step-by-Step', url: 'https://www.youtube.com/watch?v=tieEss7gTAI', channel: 'VetEyeDoctor', lang: 'inglés', note: 'Paso a paso' },
      { title: 'Enucleation: surgical technique explained', url: 'https://www.youtube.com/watch?v=JXVqhTgmUz0', channel: 'Dr. Shadi Ireifej', lang: 'inglés', note: 'Compara las técnicas' },
    ],
    sources: [
      SOURCES.fossum(16, 'cirugía del ojo: anestesia (tabla 16.1), antibióticos, anatomía, cuidados (pp. 266–271), glaucoma terminal y enucleación transconjuntival, lateral y transpalpebral, implantes y complicaciones (pp. 296–301)'),
      SOURCES.plumbs,
    ],
  },
};
