// Ureterotomía y ureteroneocistostomía (id 13). Rewritten from Fossum 5.ª ed., cap. 24 (pp. 650–674).
const { drug, ABDOMINAL_CLOSURE, CELIOTOMY_STEPS, SOURCES } = require('./_common');

module.exports = {
  id: 13,
  legacy: {
    indicaciones: 'Ureterolitos que obstruyen o probablemente obstruirán (hidrouréter, hidronefrosis), infectados o que no se disuelven; traumatismo, estenosis o ligadura accidental del uréter; uréter ectópico (neoureterostomía en los intramurales, ureteroneocistostomía en los extramurales). Alternativas actuales: stent ureteral y bypass ureteral subcutáneo (SUB), sobre todo en gatos.',
    tecnica_quirurgica: 'Celiotomía media del xifoides al pubis con magnificación. Cálculos en el tercio proximal: ureterotomía transversa o longitudinal en el uréter dilatado proximal al cálculo, extracción, lavado con sonda blanda hacia proximal y distal, cierre con puntos simples de 5-0 a 7-0 absorbible (o longitudinal cerrada en transversal si no está dilatado). Cálculos en los dos tercios distales: ureterectomía parcial y ureteroneocistostomía. Pelvis y uréter proximal dilatados: pielolitotomía. Ureteroneocistostomía: cistotomía ventral, ligar y cortar el uréter conservando longitud, túnel submucoso oblicuo (3:1), pasar el uréter, espatular y suturar a la mucosa con 5-0 simples. Técnica extravesical con puntos simples en gatos. Anastomosis ureteral espatulada con 6-0 a 8-0. Liberar tensión moviendo el riñón a caudal o fijando la vejiga al psoas.',
    material_quirurgico: 'Lupas o microscopio quirúrgico, instrumental pediátrico u oftálmico, sondas blandas de 3,5 Fr, catéter IV de 20 G, sonda de nefrostomía con cola de cerdo o de 5 Fr, stent de polipropileno 4-0, stent ureteral de doble cola de cerdo 2,5 Fr o sistema SUB, drenaje peritoneal.',
    tipo_sutura: 'Uréter: PDS, Maxon, Monocryl o Biosyn 5-0 a 8-0, puntos simples. Mucosa uréter-vejiga: 4-0 o 5-0 (5-0 Monocryl o Biosyn en la ureteroneocistostomía; nylon 6-0 a 8-0 en la extravesical felina). Ligadura del uréter distal en ectópicos: no absorbible 3-0 o 4-0. Vejiga: continuo simple o invertido. Evitar no absorbibles en la luz y multifilamento en orina infectada.',
    complicaciones_frecuentes: 'Fuga de orina y obstrucción por estenosis o estrechez (frecuentes tras cirugía ureteral); obstrucción transitoria por edema; uroabdomen; insuficiencia renal si la corrección es bilateral; recidiva de cálculos; en stents, migración, fractura, reobstrucción e infección (27 % de recambio); en SUB, fuga, oclusión, acodamiento e infección.',
    manejo_anestesico_sugerido: 'Tabla 24.1: obstrucción aguda en paciente por lo demás sano, limitar líquidos hasta desobstruir; hiperpotasemia con cambios en el ECG; dosis bajas tituladas; evitar α2, acepromacina, AINE y aminoglucósidos; isoflurano con fentanilo; presión media 70–80 mmHg y diuresis ≥0,5 mL/kg/h. En gatos muy enfermos, nefropielostomía percutánea previa para tratar la azotemia.',
    consideraciones_por_raza: 'Gatos: ureterolitos (sobre todo oxalato de calcio) con azotemia; uréter circuncavo frecuente; diámetro ureteral distal de unos 0,4 mm, lo que obliga a microcirugía. Perros: uréter ectópico más diagnosticado en hembras; más de un tercio bilateral.',
    consideraciones_comorbilidades: 'Medir la función de cada riñón antes, sobre todo si se considera la nefrectomía. Infección urinaria concomitante frecuente: urocultivo. La función renal se recupera mejor si la obstrucción se resuelve dentro de la primera semana. La nefrectomía puede ser preferible a una reparación ureteral compleja si el otro riñón es bueno.',
    fuente: 'Fossum TW, Small Animal Surgery, 5.ª ed. (2019), cap. 24, tabla 24.1 y pp. 650–674.',
  },
  guide: {
    draft: true,
    lede: 'Cirugía del uréter para quitar una obstrucción, reparar un uréter dañado o reimplantarlo en la vejiga. El urotelio regenera rápido, pero una mala técnica deja estenosis: es microcirugía en un tubo de milímetros que se hace con lupas o microscopio. En gatos, el stent y el bypass ureteral subcutáneo son hoy alternativas de igual o mejor resultado.',
    meta: { species: ['perro', 'gato'], duration: '90–180 min', difficulty: 'avanzada', contamination: 'limpia-contaminada' },
    before_you_start: [
      'Sin lupas o microscopio e instrumental fino, no la hagas: deriva o considera un stent o un bypass ureteral subcutáneo.',
      'Mide la función de cada riñón y limita los líquidos hasta desobstruir: un gato anúrico se sobrecarga fácil.',
      'Explora todo el aparato urinario y localiza el cálculo: tercio proximal, ureterotomía; dos tercios distales, ureterectomía parcial y ureteroneocistostomía.',
      'Incide el uréter dilatado proximal al cálculo y ciérralo con puntos simples sin estrecharlo; si no está dilatado, incide longitudinal y cierra transversal.',
      'Manipula el uréter con puntos de sostén, sin pinzas traumáticas ni disección que dañe su irrigación, y sin tensión en la reparación.',
    ],
    indications: [
      'Ureterolitos que obstruyen o probablemente lo harán (hidrouréter, hidronefrosis) o infectados (p. 657, 672).',
      'Traumatismo, estenosis, avulsión o ligadura accidental del uréter (por ejemplo, tras una OVH).',
      'Uréter ectópico: neoureterostomía en los intramurales, ureteroneocistostomía en los extramurales o si el túnel no se identifica (p. 666–667).',
      'Si no hay obstrucción, los cálculos de estruvita pueden intentar disolverse con dieta (p. 657).',
    ],
    sections: [
      {
        id: 'preop',
        title: 'Decisión y preparación',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Imágenes.', body: 'Radiografía y ecografía (casi todos los gatos con ureterolitos tienen también nefrolitos); TC o RM si hace falta. La urografía excretora rinde poco con la filtración alterada.', cite: 'Fossum p. 671' },
              { title: 'Laboratorio.', body: 'Hemograma, bioquímica, orina y urocultivo; la infección concomitante es frecuente. En uratos, busca enfermedad hepática o cortocircuito.', cite: 'Fossum p. 671' },
              { title: 'Manejo médico.', body: 'Diuresis con líquidos, con o sin diuréticos, puede resolver obstrucciones intraluminales. El glucagón no se recomienda. Vigila la obstrucción si estás disolviendo nefrolitos con dieta.', cite: 'Fossum p. 671' },
              { title: 'Gato muy enfermo.', body: 'Nefropielostomía percutánea ecoguiada (catéter de 16 G y sonda de 3,5 Fr a la pelvis) para tratar la azotemia y ver si el riñón obstruido conserva función.', cite: 'Fossum p. 671' },
              { title: 'Elige la técnica.', body: 'Ureterotomía (tercio proximal), ureterectomía parcial con ureteroneocistostomía (dos tercios distales), pielolitotomía (muy proximal con pelvis dilatada), stent o SUB.', cite: 'Fossum p. 672' },
              { title: 'Antibiótico.', body: 'Según el urocultivo; si no se empezó, cefazolina tras tomar los cultivos intraoperatorios.', cite: 'Fossum p. 672' },
              { title: 'Corrige.', body: 'Hidratación, ácido-base y electrolitos; potasio con ECG si hay hiperpotasemia.', cite: 'Fossum p. 651' },
            ],
          },
          {
            type: 'table',
            columns: ['Opción', 'Datos del Fossum', 'Inconvenientes'],
            rows: [
              ['Ureterotomía', 'Gatos: supervivencia media 1519 días, mortalidad perioperatoria 8 %', 'Microcirugía; fuga y estenosis'],
              ['Stent de doble cola de cerdo (2,5 Fr)', 'Menor mortalidad perioperatoria que la cirugía sin stent (8 % frente a 22 %) en un estudio; similar en otro', 'Migración, fractura, reobstrucción, infección; 27 % necesitó recambio'],
              ['Bypass ureteral subcutáneo (SUB)', 'Resultados iniciales comparables a otras técnicas', 'Fuga, oclusión, acodamiento, infección; lavados cada 3–4 meses; pelvis dilatada ≥5 mm'],
            ],
            caption: 'Fossum p. 672–673. La función renal se recupera mejor si la obstrucción se resuelve dentro de la primera semana.',
          },
        ],
      },
      {
        id: 'anestesia',
        title: 'Anestesia y analgesia',
        intro: 'El obstruido agudo puede estar sano salvo por la hiperpotasemia y la hipovolemia; tolera pocas dosis de sedantes o hipotensores (tabla 24.1, p. 651).',
        blocks: [
          {
            type: 'drugs',
            items: [
              drug('Premedicación', 'Midazolam', '0,1–0,2 mg/kg', 'IV o IM', 'Solo si está ansioso; evitar α2 y acepromacina.'),
              drug('Premedicación', 'Metadona', '0,1–0,2 mg/kg', 'IV o IM', 'Si no está descompensado.'),
              drug('Inducción', 'Alfaxalona', '2–3 mg/kg', 'IV lento', 'O propofol 1–4 mg/kg o etomidato 0,5–1,5 mg/kg en el deshidratado.'),
              drug('Mantenimiento', 'Isoflurano', 'CAM reducida', 'Inhalatoria'),
              drug('Intraoperatorio', 'Fentanilo', '0,001–0,005 mg/kg', 'IV, carga', 'Luego 1–10 µg/kg/h; en gatos, bolos de 1–4 µg/kg.'),
              drug('Epidural', 'Morfina sin conservante', '0,1 mg/kg', 'Epidural', 'Sin anestésicos locales espinales en hipotensos.'),
              drug('Oliguria', 'Manitol', '0,25–0,5 g/kg', 'IV', 'Si está oligúrico y normotenso.'),
              drug('Postoperatorio', 'Buprenorfina', '0,005–0,02 mg/kg', 'IV o IM cada 4–8 h', 'O transmucosa 0,01–0,02 mg/kg en gatos. AINE contraindicados.'),
            ],
          },
          { type: 'note', kind: 'error', title: 'Líquidos', text: 'Limita los líquidos IV hasta aliviar la obstrucción; después, guíalos por la diuresis medida (p. 651).' },
        ],
      },
      {
        id: 'anatomia',
        title: 'Anatomía quirúrgica',
        blocks: [
          {
            type: 'list',
            items: [
              'El uréter nace en la pelvis renal, corre retroperitoneal y entra oblicuo por la cara dorsolateral caudal de la vejiga, con un trayecto intramural corto hasta el trígono (p. 654, 663).',
              'Irrigación longitudinal: arteria ureteral craneal (de la renal) y caudal (prostática o vaginal). Disecar poco alrededor para no comprometerla.',
              'El uréter felino mide unos 0,4 mm cerca de la vejiga: las técnicas estándar lo obstruyen fácil (p. 658).',
              'Uréter circuncavo (dorsal a la cava): malformación frecuente en gatos que puede asociarse a obstrucción benigna.',
              'Ectópico intramural: entra en la pared vesical en posición normal pero sigue bajo la mucosa hasta la uretra; extramural: no pasa por la vejiga (fig. 24.14).',
            ],
          },
        ],
      },
      {
        id: 'tecnica',
        title: 'Técnica paso a paso',
        blocks: [],
        subsections: [
          { id: 'abordaje', title: 'A. Abordaje y exploración', blocks: [{ type: 'steps', items: [...CELIOTOMY_STEPS.slice(0, 3), { title: 'Largo.', body: 'Del xifoides al pubis: necesitas el riñón y la vejiga.', cite: 'Fossum p. 654, 667' }, ...CELIOTOMY_STEPS.slice(4), { title: 'Expón el uréter.', body: 'Duodeno a la izquierda para el derecho, mesocolon a la derecha para el izquierdo; localiza el uréter dilatado y el cálculo.', cite: 'Fossum p. 654' }, { title: 'Magnificación.', body: 'Lupas o microscopio desde aquí.', cite: 'Fossum p. 658' }] }] },
          {
            id: 'ureterotomia',
            title: 'B. Ureterotomía',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Puntos de sostén.', body: 'Manipula el uréter con puntos de sostén, sin pinzas traumáticas.', cite: 'Fossum p. 659' },
                  { title: 'Cálculos distales.', body: 'Algunos del uréter distal se pueden empujar o traer a la vejiga por una cistotomía y evitar la ureterotomía.', cite: 'Fossum p. 657' },
                  { title: 'Incide.', body: 'Incisión transversa o longitudinal en el uréter dilatado, proximal al cálculo (fig. 24.7A). La transversa queda con menos tensión y puede cicatrizar mejor.', cite: 'Fossum p. 657' },
                  { title: 'Extrae y lava.', body: 'Saca el cálculo y pasa una sonda blanda pequeña hacia proximal y distal lavando con líquido tibio; comprueba que no queden cálculos y que el uréter sea permeable.', cite: 'Fossum p. 657–658' },
                  { title: 'Cierra.', body: 'Puntos simples de 5-0 a 7-0 absorbible (fig. 24.7B).', cite: 'Fossum p. 658' },
                  { title: 'Uréter no dilatado.', body: 'Si es probable la estenosis, incide longitudinal sobre el cálculo y cierra en sentido transversal (fig. 24.7C).', cite: 'Fossum p. 658' },
                  { title: 'Stent.', body: 'Su uso es controvertido (estenosis e infección); si lo pones, de menor diámetro que el uréter.', cite: 'Fossum p. 657' },
                  { title: 'Fuga.', body: 'Una sonda de nefrostomía reduce la fuga pero tiene complicaciones; alternativa: drenaje peritoneal para la fuga transitoria.', cite: 'Fossum p. 672' },
                  { title: 'Muestras.', body: 'Analiza y cultiva siempre los cálculos; cultiva la pelvis o el uréter.', cite: 'Fossum p. 672' },
                ],
              },
              { type: 'note', kind: 'tip', title: 'Pielolitotomía', text: 'Para cálculos muy proximales con pelvis y uréter proximal dilatados: incisión dorsal sobre ellos, extracción, lavado de pelvis y divertículos y cierre continuo con 5-0 o 6-0 absorbible. Evita el daño del parénquima de la nefrotomía (p. 657).' },
            ],
          },
          {
            id: 'neocistostomia',
            title: 'C. Ureteroneocistostomía',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Cistotomía ventral.', body: 'Vacía la vejiga, puntos de sostén y absorbe la orina con hisopos de algodón (no gasas) para no lesionar la mucosa.', cite: 'Fossum p. 667' },
                  { title: 'Corta el uréter.', body: 'Liga el uréter distal y córtalo conservando toda la longitud posible; punto de sostén en el extremo proximal (fig. 24.20).', cite: 'Fossum p. 667' },
                  { title: 'Túnel.', body: 'Incide la mucosa vesical y crea un túnel submucoso corto y oblicuo. En perros, tirón transverso simple o túnel intramural con relación 3:1 (largo del túnel a diámetro del orificio), que fibrosa menos.', cite: 'Fossum p. 667' },
                  { title: 'Pasa el uréter.', body: 'Tira del punto de sostén para llevarlo a la luz sin dañarlo.', cite: 'Fossum p. 667' },
                  { title: 'Espatula y sutura.', body: 'Recorta el extremo, espatúlalo y sutúralo a la mucosa con 5-0 absorbible sintético (Monocryl o Biosyn) en puntos simples aposicionales.', cite: 'Fossum p. 667' },
                  { title: 'Cierra la vejiga.', body: 'Cierre estanco con continuo simple o patrón invertido.', cite: 'Fossum p. 667' },
                ],
              },
              {
                type: 'steps',
                items: [
                  { title: 'Gatos: técnica extravesical.', body: 'Incisión de espesor parcial (muscular y submucosa) en la cara ventral del ápice vesical hasta ver la mucosa (fig. 24.8A).', cite: 'Fossum p. 659' },
                  { title: 'Abre la mucosa.', body: 'Espatula el uréter e incide la mucosa vesical, en el extremo caudal, el mismo largo que la espatulación.' },
                  { title: 'Primeros puntos.', body: 'Nylon 6-0 a 8-0: uno entre el extremo proximal de la espatulación y el borde craneal de la incisión mucosa, otro entre el extremo distal y el borde caudal (fig. 24.8B).', cite: 'Fossum p. 659' },
                  { title: 'Stent temporal.', body: 'Polipropileno 4-0 en la luz tras los dos primeros puntos; retíralo antes de anudar los últimos.', cite: 'Fossum p. 659' },
                  { title: 'Completa.', body: 'Dos puntos más por lado y cierre de la incisión seromuscular (fig. 24.8C-D).', cite: 'Fossum p. 659' },
                ],
              },
            ],
          },
          {
            id: 'anastomosis',
            title: 'D. Anastomosis ureteral y alivio de tensión',
            blocks: [
              {
                type: 'steps',
                items: [
                  { title: 'Cuándo.', body: 'Técnicamente difícil en perros pequeños y gatos, con alta tasa de obstrucción. Cerca de la vejiga, mejor ureteroneocistostomía. Si el otro riñón funciona bien, la nefrectomía tiene menos morbilidad y mortalidad que una reparación compleja.', cite: 'Fossum p. 659' },
                  { title: 'Espatula.', body: 'Incisión longitudinal en lados opuestos de cada extremo (fig. 24.11A).', cite: 'Fossum p. 659' },
                  { title: 'Puntos guía.', body: 'Preanuda puntos de 6-0 a 8-0 absorbible monofilamento en el vértice de cada espatulación y alinea los extremos sin torsión (fig. 24.11B).', cite: 'Fossum p. 659' },
                  { title: 'Completa.', body: 'Puntos simples hasta que no filtre (fig. 24.11C-D).', cite: 'Fossum p. 660' },
                  { title: 'Sin tensión.', body: 'Libera el riñón de sus uniones peritoneales, llévalo a caudal y fíjalo a la pared; o lleva el ápice vesical a craneal y lateral y sutúralo al psoas.', cite: 'Fossum p. 660' },
                  { title: 'Cerca de la vejiga.', body: 'Ureteroplastia con colgajo vesical: colgajo de la cara ventral, reimplante del uréter y cierre en tubo (fig. 24.10).', cite: 'Fossum p. 659' },
                  { title: 'Nefrostomía.', body: 'Solo si es muy probable la fuga: catéter de 20 G desde la ureterotomía a la pelvis y la corteza, sonda de 5 Fr o con cola de cerdo, nefropexia y sistema cerrado.', cite: 'Fossum p. 660–662' },
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
              { title: 'Diuresis e hidratación.', body: 'Sonda urinaria para medir la orina; presión venosa central si hace falta.', cite: 'Fossum p. 663' },
              { title: 'Obstrucción.', body: 'Tras la reimplantación, vigila la obstrucción por edema o estenosis del estoma; si la uretra se obstruye por edema, sonda 3–4 días. Con corrección bilateral, riesgo de insuficiencia renal.', cite: 'Fossum p. 663, 668' },
              { title: 'Fuga.', body: 'Abdominocentesis: creatinina y potasio del líquido mayores que los séricos indican uroabdomen.', cite: 'Fossum p. 663' },
              { title: 'Imágenes.', body: 'Ecografía o radiografía para el hidrouréter o la hidronefrosis.' },
              { title: 'Analgesia y electrolitos.', body: 'Opioides sin AINE; corrige electrolitos y ácido-base.', cite: 'Fossum p. 663' },
              { title: 'Prevención.', body: 'Los urolitos recidivan en meses si no se trata la causa: análisis del cálculo y manejo específico.', cite: 'Fossum p. 672' },
            ],
          },
          { type: 'note', kind: 'book', title: 'Cicatrización del uréter', text: 'El urotelio puede sellar un defecto en 48 h. Si queda al menos el 50 % de la circunferencia, el uréter cicatriza con contracción longitudinal. Tras cortarlo no hay peristaltismo distal al menos 10 días, lo que favorece el hidrouréter (p. 662).' },
        ],
      },
    ],
    closure: [
      { layer: 'Ureterotomía', suture: 'PDS, Maxon, Monocryl o Biosyn', gauge: '5-0 a 7-0', pattern: 'Puntos simples (longitudinal o cerrada en transversal)', why: 'Con magnificación; un continuo estenosa un tubo tan fino.' },
      { layer: 'Pielolitotomía', suture: 'Absorbible', gauge: '5-0 o 6-0', pattern: 'Continuo', why: 'Pelvis dilatada, sin dañar el parénquima.' },
      { layer: 'Mucosa uréter-vejiga', suture: 'Monocryl o Biosyn (nylon en la extravesical felina)', gauge: '5-0 (6-0 a 8-0 en gatos)', pattern: 'Puntos simples aposicionales', why: 'La aposición de mucosas evita la estenosis.' },
      { layer: 'Anastomosis ureteral', suture: 'Absorbible monofilamento', gauge: '6-0 a 8-0', pattern: 'Simples sobre extremos espatulados', why: 'Agranda la boca y reduce la estenosis.' },
      { layer: 'Uréter distal ectópico', suture: 'No absorbible', gauge: '3-0 o 4-0', pattern: 'Ligadura submucosa circunferencial', why: 'Evita la recanalización y la incontinencia.' },
      { layer: 'Vejiga', suture: 'Absorbible monofilamento', gauge: '3-0 o 4-0', pattern: 'Continuo simple o invertido', why: 'Cierre estanco.' },
      ...ABDOMINAL_CLOSURE,
    ],
    complications: [
      { name: 'Fuga de orina y uroabdomen', prevent: 'Magnificación, puntos precisos, sin tensión, drenaje o nefrostomía si es muy probable.', manage: 'Drenaje, stent, nefrostomía o reintervención.' },
      { name: 'Estenosis u obstrucción', prevent: 'Incidir el uréter dilatado, puntos simples, espatular, cierre transversal si no está dilatado.', manage: 'Reimplante, stent o SUB.' },
      { name: 'Obstrucción por edema', prevent: 'Manipulación suave.', manage: 'Sonda urinaria 3–4 días; vigilar la función renal.' },
      { name: 'Insuficiencia renal', prevent: 'Medir la función de cada riñón, desobstruir pronto, evitar nefrotóxicos.', manage: 'Soporte renal, diuresis guiada.' },
      { name: 'Recidiva de cálculos', prevent: 'Analizar el cálculo y tratar la causa.', manage: 'Dieta, stent o SUB según el caso.' },
      { name: 'Complicaciones de stent o SUB', prevent: 'Técnica correcta, lavados del SUB cada 3–4 meses.', manage: 'Recambio (27 % de los stents en un estudio).' },
    ],
    quiz: [
      { q: '¿Qué técnica eliges según la posición del cálculo?', a: 'Tercio proximal, ureterotomía; dos tercios distales, ureterectomía parcial y ureteroneocistostomía; muy proximal con pelvis dilatada, pielolitotomía.' },
      { q: '¿Dónde incides el uréter y cómo lo cierras?', a: 'En el uréter dilatado proximal al cálculo, cerrando con puntos simples de 5-0 a 7-0; si no está dilatado, incisión longitudinal cerrada en transversal.' },
      { q: '¿Qué relación tiene el túnel submucoso de la ureteroneocistostomía?', a: '3:1 entre el largo del túnel y el diámetro del orificio.' },
      { q: '¿Cómo alivias la tensión de una anastomosis ureteral?', a: 'Llevando el riñón a caudal y fijándolo a la pared, o fijando el ápice vesical al psoas.' },
      { q: '¿Qué mostraron los stents frente a la cirugía sin stent en gatos?', a: 'Menor mortalidad perioperatoria en un estudio (8 % frente a 22 %) y similar en otro; un 27 % necesitó recambio.' },
      { q: '¿Cómo confirmas un uroabdomen?', a: 'Con creatinina y potasio del líquido abdominal mayores que los séricos.' },
    ],
    videos: [],
    sources: [
      SOURCES.fossum(24, 'cirugía del riñón y el uréter: anestesia (tabla 24.1), anatomía, ureterotomía, reimplantación, anastomosis, nefrostomía, cicatrización y complicaciones (pp. 650–663), uréter ectópico (pp. 663–668), cálculos, stent y SUB (pp. 671–673)'),
      SOURCES.fossum(19, 'cirugía de la cavidad abdominal: celiotomía y cierre (pp. 514–518)'),
      SOURCES.plumbs,
    ],
  },
};
