// Entries missing from the disease catalog (Oct 2026 audit). DRAFTS: every dose and protocol here
// must be reviewed by a veterinarian before the entries move to the shared catalog.
// They are inserted as entries owned by one organization, so only that clinic sees them and can edit them.
//   node scripts/add-diseases-2026-10.js --org=2          → dry run: lists what would be inserted
//   node scripts/add-diseases-2026-10.js --org=2 --apply  → inserts them in one transaction
// Entries whose name already exists (global or in that organization) are skipped, so re-running is safe.
require('dotenv').config({ quiet: true });
const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');
const ORG = Number((process.argv.find((a) => a.startsWith('--org=')) || '').slice(6));
const DRAFT_NOTE = 'Borrador pendiente de revisión veterinaria (oct. 2026): verifica dosis y protocolos antes de usarlos.';

const DISEASES = [
  {
    name: 'Enfermedad valvular mitral degenerativa',
    english_name: 'Myxomatous mitral valve disease (MMVD)',
    scientific_name: null,
    species: 'dog', category: 'cardiovascular', severity: 'severe', prognosis: 'guarded', life_stage: 'senior',
    is_zoonotic: false, prevalence_rank: 4,
    description: 'Degeneración mixomatosa de la válvula mitral (y a veces tricúspide) que produce insuficiencia valvular progresiva. Es la cardiopatía adquirida más frecuente del perro: afecta sobre todo a razas pequeñas y medianas mayores de 7 años (Cavalier King Charles, Poodle, Chihuahua, Yorkshire, Dachshund). Se clasifica según el consenso ACVIM en estadios A (riesgo), B1 (soplo sin remodelado), B2 (soplo con agrandamiento cardíaco), C (insuficiencia cardíaca congestiva actual o previa) y D (refractaria).',
    pathophysiology: 'La degeneración mixomatosa engrosa y deforma las valvas y las cuerdas tendinosas. La regurgitación mitral sobrecarga de volumen la aurícula y el ventrículo izquierdos, que se dilatan. Cuando la presión auricular supera la capacidad de drenaje linfático pulmonar aparece edema pulmonar cardiogénico. La rotura de cuerdas tendinosas puede descompensar bruscamente a un paciente estable.',
    key_signs: [
      'Soplo sistólico apical izquierdo: Suele ser el primer hallazgo; su intensidad se correlaciona de forma aproximada con la gravedad.',
      'Tos: Por compresión del bronquio principal izquierdo (atrio agrandado) o por edema pulmonar; más frecuente de noche.',
      'Taquipnea en reposo: Frecuencia respiratoria en sueño >30-35 rpm, signo precoz de descompensación.',
      'Intolerancia al ejercicio: Fatiga, se detiene en los paseos.',
      'Síncope: Por arritmias (fibrilación auricular) o hipertensión pulmonar.',
      'Disnea y crepitaciones: Edema pulmonar en el estadio C.',
    ],
    diagnosis: {
      clinicalExam: 'Auscultación del soplo y del ritmo, frecuencia y patrón respiratorio, tiempo de llenado capilar, pulso femoral (déficit de pulso en arritmias). Pedir al tutor que cuente la frecuencia respiratoria en sueño.',
      labTests: [
        'NT-proBNP: Apoya la presencia de remodelado o insuficiencia cardíaca; útil cuando no hay ecocardiografía disponible.',
        'Perfil bioquímico y electrolitos: Función renal y potasio basales antes de diuréticos e IECA.',
      ],
      imaging: [
        'Radiografía torácica: VHS (vertebral heart score) >10,5 y VLAS ≥3 sugieren agrandamiento (estadio B2); infiltrado perihiliar en edema.',
        'Ecocardiografía: Estándar de oro para estadificar. B2 si LA/Ao ≥1,6 y LVIDDN ≥1,7.',
        'Electrocardiograma: Si hay arritmia a la auscultación o síncope.',
      ],
      differentialDiagnosis: [
        'Colapso traqueal: Tos tipo graznido, sin agrandamiento cardíaco.',
        'Bronquitis crónica: Tos con radiografía de patrón bronquial y corazón normal.',
        'Cardiomiopatía dilatada: Razas grandes; ventrículo dilatado con mala contractilidad.',
        'Neoplasia pulmonar o neumonía: Distinto patrón radiográfico.',
      ],
    },
    treatment: {
      firstLine: [
        'Pimobendan (estadio B2, C y D): 0,25-0,3 mg/kg VO cada 12 h, una hora antes de la comida. En B2 retrasa la aparición de insuficiencia cardíaca (estudio EPIC).',
        'Furosemida (estadio C): 1-2 mg/kg VO cada 12 h, ajustar a la dosis mínima que controla la frecuencia respiratoria en sueño.',
        'IECA (estadio C): Enalapril o benazepril 0,25-0,5 mg/kg VO cada 12-24 h, controlando creatinina y potasio a la semana.',
        'Espironolactona (estadio C): 2 mg/kg VO cada 24 h.',
      ],
      secondLine: [
        'Torasemida (estadio D o resistencia a furosemida): 0,1-0,3 mg/kg VO cada 24 h.',
        'Control de la frecuencia en fibrilación auricular: Diltiazem y/o digoxina según ECG y especialista.',
        'Sildenafilo: 1-2 mg/kg VO cada 8-12 h si hay hipertensión pulmonar.',
        'Dieta: Restricción moderada de sodio y aporte calórico suficiente para evitar la caquexia cardíaca.',
      ],
      emergency: 'PRESENTACIÓN: Edema pulmonar cardiogénico agudo (disnea, crepitaciones, cianosis).\nPROTOCOLO:\n  - Oxígeno (jaula, flujo libre o cánulas nasales); manipular lo mínimo\n  - Furosemida 2 mg/kg IV o IM; repetir cada 1-2 h hasta que baje la frecuencia respiratoria (máx. ~8 mg/kg en 4 h) o infusión 0,66-1 mg/kg/h\n  - Butorfanol 0,2-0,25 mg/kg IV/IM para reducir la ansiedad\n  - Pimobendan 0,25-0,3 mg/kg VO en cuanto pueda tragar\n  - Toracocentesis si hay derrame pleural significativo',
      duration: 'De por vida. Control a los 7-14 días de cada cambio de dosis, luego cada 3-6 meses.',
      notes: `${DRAFT_NOTE} Chile: pimobendan disponible en presentaciones veterinarias; furosemida, enalapril y espironolactona en farmacias.`,
    },
    prevention: [
      'Detección precoz: Auscultación anual en razas predispuestas desde los 5-6 años; ecocardiografía si hay soplo.',
      'Monitoreo en casa: Enseñar al tutor a contar la frecuencia respiratoria en sueño y consultar si supera 30-35 rpm.',
      'Selección reproductiva: En Cavalier King Charles, no reproducir animales con soplo a edad temprana.',
    ],
    references_list: [
      'Keene BW, et al. ACVIM consensus guidelines for the diagnosis and treatment of myxomatous mitral valve disease in dogs. J Vet Intern Med. 2019;33(3):1127-1140.',
      'Boswood A, et al. Effect of pimobendan in dogs with preclinical myxomatous mitral valve disease and cardiomegaly: the EPIC study. J Vet Intern Med. 2016;30(6):1765-1779.',
    ],
  },
  {
    name: 'Diabetes mellitus canina',
    english_name: 'Canine diabetes mellitus',
    scientific_name: null,
    species: 'dog', category: 'endocrine', severity: 'severe', prognosis: 'chronic', life_stage: 'adult',
    is_zoonotic: false, prevalence_rank: 18,
    description: 'Hiperglucemia persistente por déficit absoluto de insulina. En el perro es casi siempre insulinodependiente (destrucción de células beta), por lo que requiere insulina de por vida; la remisión es excepcional salvo en la diabetes del diestro en hembras enteras. Afecta sobre todo a perros de 7-10 años; predisponen la pancreatitis, el hiperadrenocorticismo, la obesidad, los progestágenos y los corticoides.',
    pathophysiology: 'La falta de insulina impide la entrada de glucosa en las células: hiperglucemia, glucosuria con diuresis osmótica (poliuria y polidipsia compensatoria) y catabolismo de grasas y proteínas (pérdida de peso con polifagia). Sin tratamiento, la lipólisis genera cuerpos cetónicos y cetoacidosis.',
    key_signs: [
      'Poliuria y polidipsia: El signo que más consultan los tutores.',
      'Polifagia con pérdida de peso: Come más y adelgaza.',
      'Cataratas: Aparecen en la mayoría de los perros diabéticos durante el primer año, a veces en semanas.',
      'Letargia y debilidad: Más marcadas en la cetoacidosis.',
      'Vómitos, anorexia y aliento cetónico: Signos de cetoacidosis diabética, una urgencia.',
    ],
    diagnosis: {
      clinicalExam: 'Condición corporal, hidratación, examen ocular (cataratas, uveítis inducida por el cristalino), hepatomegalia. Buscar enfermedades concurrentes (Cushing, pancreatitis, infección urinaria).',
      labTests: [
        'Glucemia en ayunas: Persistentemente >200 mg/dL junto con glucosuria y signos compatibles.',
        'Fructosamina: Elevada; confirma hiperglucemia sostenida y descarta la de estrés.',
        'Urianálisis y urocultivo: Glucosuria, cetonuria; las infecciones urinarias son frecuentes.',
        'Cetonas en sangre (beta-hidroxibutirato): Para descartar cetoacidosis.',
        'Gases y electrolitos: Acidosis metabólica, potasio y fósforo en la cetoacidosis.',
      ],
      imaging: [
        'Ecografía abdominal: Pancreatitis, adrenales (Cushing), útero en hembras enteras.',
      ],
      differentialDiagnosis: [
        'Hiperadrenocorticismo: También da poliuria, polidipsia y polifagia; puede coexistir.',
        'Glucosuria renal primaria: Glucosuria con glucemia normal.',
        'Hiperglucemia por estrés: Fructosamina normal.',
        'Enfermedad renal crónica: Poliuria sin glucosuria.',
      ],
    },
    treatment: {
      firstLine: [
        'Insulina lenta porcina (lente): Inicio 0,25 U/kg SC cada 12 h con la comida. Ajustar en pasos del 10-20% cada 5-7 días según curva de glucosa o sensor continuo.',
        'Insulina NPH (alternativa): 0,25 U/kg SC cada 12 h.',
        'Dieta constante: Misma comida y misma cantidad cada 12 h, junto con la insulina; preferir dietas altas en fibra si el perro no está delgado.',
        'Ovariohisterectomía en hembras enteras: La progesterona del diestro causa resistencia a la insulina.',
      ],
      secondLine: [
        'Monitoreo con sensor continuo de glucosa (p. ej. FreeStyle Libre): Curvas de 14 días sin hospitalizar.',
        'Tratar enfermedades concurrentes: Infecciones, Cushing, hipotiroidismo y pancreatitis dificultan el control.',
        'Cirugía de cataratas: Facoemulsificación en perros bien controlados.',
      ],
      emergency: 'PRESENTACIÓN: Cetoacidosis diabética (vómitos, deshidratación, letargia, cetonas positivas, acidosis).\nPROTOCOLO:\n  - Fluidoterapia con NaCl 0,9% o Ringer lactato para corregir deshidratación en 12-24 h\n  - Insulina regular en infusión 2,2 U/kg/día diluida en 250 mL de NaCl 0,9%, iniciar a 10 mL/h tras 2-6 h de fluidos\n  - Medir glucemia cada 1-2 h; agregar dextrosa al 2,5-5% cuando baje de 250 mg/dL\n  - Suplementar potasio y fósforo según electrolitos (la insulina los baja)\n  - Pasar a insulina de acción intermedia cuando coma y no vomite\n\nPRESENTACIÓN: Hipoglucemia por sobredosis de insulina (temblores, convulsiones).\nPROTOCOLO:\n  - Dextrosa 0,5 g/kg IV diluida al 25% en bolo lento; en casa, jarabe de glucosa en las encías\n  - Suspender la siguiente dosis y reducir la insulina un 25-50%',
      duration: 'De por vida. Curva de glucosa a la semana de cada ajuste; control clínico cada 3-4 meses una vez estable.',
      notes: `${DRAFT_NOTE} Chile: insulina lenta porcina veterinaria disponible; insulina NPH humana en farmacias. Usar siempre la jeringa que corresponde a la concentración (U-40 o U-100).`,
    },
    prevention: [
      'Esterilización temprana de hembras: Evita la diabetes del diestro.',
      'Control de peso: La obesidad empeora la resistencia a la insulina.',
      'Evitar progestágenos y corticoides prolongados sin necesidad.',
      'Educación del tutor: Técnica de inyección, conservación de la insulina y signos de hipoglucemia.',
    ],
    references_list: [
      'Behrend E, et al. 2018 AAHA Diabetes Management Guidelines for Dogs and Cats. J Am Anim Hosp Assoc. 2018;54(1):1-21.',
      'Feldman EC, Nelson RW, et al. Canine and Feline Endocrinology. 4th ed. Elsevier; 2015.',
    ],
  },
  {
    name: 'Intoxicación por lirios en gatos',
    english_name: 'Lily toxicosis in cats',
    scientific_name: 'Lilium spp., Hemerocallis spp.',
    species: 'cat', category: 'toxic', severity: 'critical', prognosis: 'guarded', life_stage: 'all',
    is_zoonotic: false, prevalence_rank: 38,
    description: 'Lesión renal aguda en gatos por ingestión de cualquier parte de lirios verdaderos (Lilium: lirio de Pascua, tigre, asiático, oriental) o lirios de día (Hemerocallis). Basta con morder una hoja, lamer polen del pelaje o beber el agua del florero. El perro no se ve afectado. Con descontaminación y fluidoterapia en las primeras 18 horas el pronóstico es bueno; si ya hay anuria, es grave.',
    pathophysiology: 'Una toxina hidrosoluble no identificada daña el epitelio de los túbulos renales proximales y produce necrosis tubular aguda entre las 24 y 72 horas. También puede causar pancreatitis.',
    key_signs: [
      'Vómitos, salivación y depresión: En las primeras 0-12 horas tras la ingestión.',
      'Mejoría aparente: Entre las 12 y 24 horas; no debe tranquilizar.',
      'Poliuria y luego oliguria o anuria: Entre las 24 y 72 horas, por lesión renal aguda.',
      'Deshidratación, anorexia y debilidad: Al progresar la azotemia.',
      'Riñones agrandados y dolorosos a la palpación.',
    ],
    diagnosis: {
      clinicalExam: 'El diagnóstico es por la historia: exposición a lirios, polen en el pelaje o la boca. Evaluar hidratación, producción de orina (pesar arena o sondaje) y tamaño renal.',
      labTests: [
        'Creatinina, urea, fósforo y potasio: Basales y a las 24, 48 y 72 horas.',
        'Urianálisis: Glucosuria, proteinuria y cilindros epiteliales aparecen antes que la azotemia.',
      ],
      imaging: [
        'Ecografía abdominal: Riñones agrandados con corteza hiperecogénica; descarta obstrucción.',
      ],
      differentialDiagnosis: [
        'Intoxicación por etilenglicol: Cristales de oxalato, brecha osmolar.',
        'Pielonefritis aguda: Fiebre, urocultivo positivo.',
        'Obstrucción ureteral: Hidronefrosis en la ecografía.',
        'Intoxicación por AINE: Antecedente de medicación.',
      ],
    },
    treatment: {
      firstLine: [
        'Emesis si la ingestión fue hace menos de 1-2 horas: Dexmedetomidina 7 µg/kg IM (revertir con atipamezol) o xilazina 0,44 mg/kg IM.',
        'Carbón activado: 1-2 g/kg VO una vez, tras la emesis.',
        'Fluidoterapia IV: Cristaloide a 2-3 veces la tasa de mantención durante 48 horas, idealmente iniciada antes de las 18 horas.',
        'Baño: Retirar el polen del pelaje para evitar que siga ingiriéndolo al acicalarse.',
      ],
      secondLine: [
        'Antieméticos: Maropitant 1 mg/kg SC/IV cada 24 h.',
        'Control de la diuresis: Medir producción de orina; si es <0,5 mL/kg/h pese a hidratación, riesgo de sobrecarga.',
        'Diálisis o hemodiálisis: En anuria; derivar a un centro que la ofrezca.',
      ],
      emergency: 'PRESENTACIÓN: Gato con exposición a lirios (aunque esté asintomático).\nPROTOCOLO:\n  - Tratar como urgencia aunque no haya signos\n  - Descontaminar (emesis + carbón activado) si fue reciente\n  - Fluidoterapia IV a 2-3 veces la mantención por 48 h\n  - Creatinina y potasio a las 24, 48 y 72 h\n  - Si hay oliguria o anuria: derivar a diálisis',
      duration: 'Hospitalización de 48-72 horas. Si hay lesión renal, controles renales durante semanas.',
      notes: `${DRAFT_NOTE} Chile: los lirios (Lilium) y las azucenas son comunes en ramos y floristerías; incluir la advertencia en la educación de tutores de gatos.`,
    },
    prevention: [
      'No tener lirios en casas con gatos: Ni en floreros ni en el jardín.',
      'Educación del tutor: Todas las partes son tóxicas, incluido el polen y el agua del florero.',
      'Consultar de inmediato ante cualquier exposición, sin esperar signos.',
    ],
    references_list: [
      'Fitzgerald KT. Lily toxicity in the cat. Top Companion Anim Med. 2010;25(4):213-217.',
      'Bennett AJ, Reineke EL. Outcome following gastrointestinal tract decontamination and intravenous fluid diuresis in cats with known lily ingestion: 25 cases (2001-2010). J Am Vet Med Assoc. 2013;242(8):1110-1116.',
    ],
  },
  {
    name: 'Intoxicación por paracetamol en gatos',
    english_name: 'Acetaminophen (paracetamol) toxicosis in cats',
    scientific_name: null,
    species: 'cat', category: 'toxic', severity: 'critical', prognosis: 'guarded', life_stage: 'all',
    is_zoonotic: false, prevalence_rank: 37,
    description: 'Intoxicación frecuente porque los tutores medican al gato con paracetamol para el dolor o la fiebre. Los gatos tienen muy poca capacidad de glucuronidación, por lo que dosis desde 10 mg/kg pueden ser tóxicas (un comprimido de 500 mg puede matar a un gato). Produce metahemoglobinemia y anemia por cuerpos de Heinz; en el perro predomina el daño hepático y se necesitan dosis mucho mayores.',
    pathophysiology: 'Al saturarse la conjugación, el paracetamol se metaboliza a NAPQI, un metabolito oxidante que agota el glutatión. En el gato oxida la hemoglobina (metahemoglobina, que no transporta oxígeno) y la desnaturaliza (cuerpos de Heinz y hemólisis); también puede causar necrosis hepática.',
    key_signs: [
      'Mucosas color chocolate o cianóticas: Por metahemoglobinemia, en las primeras 4-12 horas.',
      'Edema de cara y patas: Signo muy característico en el gato.',
      'Disnea y taquipnea: Por hipoxemia funcional.',
      'Depresión, salivación y vómitos.',
      'Ictericia y orina oscura: Por hemólisis y daño hepático, a los 2-3 días.',
    ],
    diagnosis: {
      clinicalExam: 'Antecedente de administración o acceso a paracetamol, mucosas pardas, edema facial. La sangre puede verse color chocolate en el tubo.',
      labTests: [
        'Prueba de la gota en papel: La sangre con metahemoglobina >10% queda parda al compararla con una gota normal.',
        'Hemograma con frotis: Cuerpos de Heinz y anemia hemolítica.',
        'Perfil hepático: ALT y bilirrubina elevadas.',
        'Cooximetría (si está disponible): Cuantifica la metahemoglobina.',
      ],
      imaging: [],
      differentialDiagnosis: [
        'Intoxicación por cebolla o ajo: También cuerpos de Heinz, sin edema facial.',
        'Anemia hemolítica de otra causa: Sin metahemoglobinemia.',
        'Insuficiencia cardíaca o respiratoria: Cianosis sin sangre parda.',
      ],
    },
    treatment: {
      firstLine: [
        'N-acetilcisteína: 140 mg/kg IV (diluida al 5%, en 15-20 min) o VO como dosis de carga; luego 70 mg/kg cada 6 h, 7 dosis o más según evolución.',
        'Oxígeno: Mientras haya metahemoglobinemia o disnea; manipular con mínimo estrés.',
        'Descontaminación: Emesis y carbón activado solo si la ingestión fue muy reciente y el gato está estable.',
        'Fluidoterapia IV de soporte.',
      ],
      secondLine: [
        'S-adenosilmetionina (SAMe): 20 mg/kg VO cada 24 h para apoyar el glutatión hepático.',
        'Ácido ascórbico: 30 mg/kg VO o IV cada 6 h como coadyuvante (evidencia limitada).',
        'Transfusión de sangre: Si la anemia o la hipoxemia son graves.',
      ],
      emergency: 'PRESENTACIÓN: Gato con mucosas pardas, edema facial o disnea tras recibir paracetamol.\nPROTOCOLO:\n  - Oxígeno de inmediato\n  - N-acetilcisteína 140 mg/kg IV lenta, luego 70 mg/kg cada 6 h\n  - Fluidoterapia IV de soporte\n  - Hematocrito, frotis (cuerpos de Heinz) y enzimas hepáticas al ingreso y a las 24-48 h\n  - Transfusión si el hematocrito cae de forma importante',
      duration: 'Hospitalización de 2-4 días. Control hepático y del hematocrito a la semana.',
      notes: `${DRAFT_NOTE} Chile: el paracetamol es de venta libre; la N-acetilcisteína está disponible en presentaciones humanas (ampollas y sobres).`,
    },
    prevention: [
      'Nunca dar paracetamol a gatos: Explicarlo en cada consulta de primera vez.',
      'Guardar los medicamentos humanos fuera del alcance.',
      'Analgesia solo con fármacos indicados por el veterinario.',
    ],
    references_list: [
      'Richardson JA. Management of acetaminophen and ibuprofen toxicoses in dogs and cats. J Vet Emerg Crit Care. 2000;10(4):285-291.',
      'Peterson ME, Talcott PA. Small Animal Toxicology. 3rd ed. Elsevier; 2013.',
    ],
  },
  {
    name: 'Intoxicación por permetrina en gatos',
    english_name: 'Permethrin toxicosis in cats',
    scientific_name: null,
    species: 'cat', category: 'toxic', severity: 'critical', prognosis: 'good', life_stage: 'all',
    is_zoonotic: false, prevalence_rank: 33,
    description: 'Intoxicación neurológica en gatos expuestos a antiparasitarios para perros con permetrina concentrada (pipetas spot-on de 45-65%), ya sea por aplicación directa o por contacto estrecho con un perro recién tratado. Los gatos metabolizan mal los piretroides por su deficiencia en glucuronidación. Con tratamiento oportuno la mayoría se recupera en 24-72 horas.',
    pathophysiology: 'La permetrina prolonga la apertura de los canales de sodio de las neuronas, lo que causa descargas repetidas: temblores, fasciculaciones y convulsiones. La actividad muscular sostenida produce hipertermia.',
    key_signs: [
      'Temblores y fasciculaciones musculares: Empiezan en horas tras la exposición, a menudo en orejas y cara.',
      'Hiperestesia e hiperexcitabilidad.',
      'Convulsiones: En casos graves.',
      'Hipertermia: Por la actividad muscular.',
      'Midriasis, salivación y ataxia.',
    ],
    diagnosis: {
      clinicalExam: 'Historia de aplicación de un producto para perros o de convivencia con un perro tratado; pelo grasoso en la nuca. Medir temperatura y glucemia.',
      labTests: [
        'Glucemia y electrolitos: Descartar hipoglucemia como causa de convulsiones.',
        'CK y función renal: Si hay temblores prolongados (rabdomiólisis).',
      ],
      imaging: [],
      differentialDiagnosis: [
        'Intoxicación por organofosforados o carbamatos: Miosis, bradicardia, signos muscarínicos.',
        'Intoxicación por metaldehído: Antecedente de molusquicida.',
        'Epilepsia o encefalopatía hepática.',
        'Hipoglucemia o hipocalcemia.',
      ],
    },
    treatment: {
      firstLine: [
        'Metocarbamol: 55-220 mg/kg IV lento hasta controlar los temblores (máximo 330 mg/kg/día).',
        'Emulsión lipídica IV al 20%: 1,5 mL/kg en bolo en 1 min, luego 0,25 mL/kg/min durante 30-60 min.',
        'Baño descontaminante: Con detergente lavaloza suave y agua tibia, una vez estabilizado; secar bien para evitar hipotermia.',
        'Control de temperatura: Enfriar si hay hipertermia y abrigar tras el baño.',
      ],
      secondLine: [
        'Diazepam o midazolam: 0,5 mg/kg IV para convulsiones (no controlan bien los temblores).',
        'Propofol o fenobarbital: En convulsiones refractarias.',
        'Fluidoterapia IV: Mantener hidratación y proteger la función renal.',
      ],
      emergency: 'PRESENTACIÓN: Gato con temblores o convulsiones tras exposición a un antiparasitario para perros.\nPROTOCOLO:\n  - Controlar convulsiones con diazepam o midazolam 0,5 mg/kg IV\n  - Metocarbamol IV lento hasta controlar los temblores\n  - Emulsión lipídica al 20% si no responde\n  - Baño con detergente suave una vez estable; vigilar la temperatura\n  - Fluidoterapia y monitoreo de glucosa',
      duration: 'Hospitalización de 24-72 horas hasta que desaparezcan los temblores.',
      notes: `${DRAFT_NOTE} Chile: se venden pipetas con permetrina para perros en tiendas y supermercados; revisar la etiqueta con el tutor. El metocarbamol inyectable puede ser difícil de conseguir; la emulsión lipídica es la alternativa.`,
    },
    prevention: [
      'Nunca usar productos para perros en gatos: Leer la etiqueta; muchos dicen "no usar en gatos".',
      'Separar al gato del perro recién tratado hasta que la pipeta se seque (24-72 h).',
      'Elegir antiparasitarios autorizados para gatos.',
    ],
    references_list: [
      'Boland LA, Angles JM. Feline permethrin toxicity: retrospective study of 42 cases. J Feline Med Surg. 2010;12(2):61-71.',
      'Peterson ME, Talcott PA. Small Animal Toxicology. 3rd ed. Elsevier; 2013.',
    ],
  },
  {
    name: 'Tumores mamarios caninos',
    english_name: 'Canine mammary tumors',
    scientific_name: null,
    species: 'dog', category: 'oncological', severity: 'severe', prognosis: 'guarded', life_stage: 'senior',
    is_zoonotic: false, prevalence_rank: 12,
    description: 'Neoplasias más frecuentes de la perra entera. Cerca de la mitad son malignas (carcinomas en su mayoría) y alrededor de la mitad de las malignas puede hacer metástasis. El riesgo depende de la exposición hormonal: la esterilización antes del primer celo lo reduce a ~0,5%, antes del segundo a ~8% y después del segundo a ~26%. Edad media de presentación: 8-10 años.',
    pathophysiology: 'Los estrógenos y la progesterona estimulan la proliferación del epitelio mamario. Los tumores pueden ser múltiples y de distintos tipos en la misma perra. La diseminación es linfática (ganglios axilares e inguinales) y hematógena (pulmón). El carcinoma inflamatorio es una forma especialmente agresiva.',
    key_signs: [
      'Nódulos en las mamas: Uno o varios, firmes, más frecuentes en las mamas caudales (4ª y 5ª).',
      'Crecimiento rápido, fijación a planos profundos o ulceración: Sugieren malignidad.',
      'Ganglios axilares o inguinales agrandados: Posible metástasis.',
      'Tos o disnea: Metástasis pulmonares en casos avanzados.',
      'Mama inflamada, caliente, dolorosa y difusa: Carcinoma inflamatorio (se confunde con mastitis).',
    ],
    diagnosis: {
      clinicalExam: 'Palpar las 10 mamas y medir cada nódulo; palpar ganglios regionales. Estadificar por tamaño (T1 <3 cm, T2 3-5 cm, T3 >5 cm), ganglios y metástasis.',
      labTests: [
        'Citología por punción (PAF) de ganglios: Útil para metástasis; la del tumor mamario es poco fiable.',
        'Histopatología de cada nódulo extirpado: Define tipo, grado y márgenes.',
        'Hemograma, bioquímica y coagulación: Prequirúrgicos.',
      ],
      imaging: [
        'Radiografía torácica en 3 proyecciones: Buscar metástasis pulmonares antes de operar.',
        'Ecografía abdominal: Ganglios ilíacos y órganos abdominales.',
      ],
      differentialDiagnosis: [
        'Mastitis: Perra en lactancia o seudogestación, responde a antibióticos.',
        'Hiperplasia mamaria o quistes.',
        'Lipoma o mastocitoma subcutáneo: Citología.',
      ],
    },
    treatment: {
      firstLine: [
        'Cirugía: Tratamiento principal; desde nodulectomía (nódulos <1 cm, benignos probables) hasta mastectomía regional o de cadena completa, con márgenes amplios.',
        'Ovariohisterectomía en el mismo acto: Puede mejorar la sobrevida en algunos carcinomas; evita nuevos tumores benignos.',
        'Histopatología de todo lo extirpado: Para decidir tratamiento complementario.',
      ],
      secondLine: [
        'Quimioterapia adyuvante (carcinomas de alto grado, invasión vascular o ganglionar): Doxorrubicina 30 mg/m² IV cada 21 días o carboplatino; evidencia limitada, derivar a oncología.',
        'Inhibidores de COX-2: Piroxicam 0,3 mg/kg VO cada 24 h o firocoxib como adyuvante o paliativo, con gastroprotección y control renal.',
        'Carcinoma inflamatorio: No operar; manejo paliativo del dolor y antiinflamatorios.',
      ],
      emergency: 'PRESENTACIÓN: Tumor ulcerado, infectado o sangrante.\nPROTOCOLO:\n  - Analgesia y limpieza de la herida\n  - Antibiótico según cultivo si hay infección\n  - Radiografía torácica antes de planificar cirugía',
      duration: 'Controles cada 3 meses el primer año (examen mamario y radiografía torácica), luego cada 6 meses.',
      notes: `${DRAFT_NOTE} Chile: la esterilización temprana se promueve en programas municipales; aprovecharla en la educación de tutores.`,
    },
    prevention: [
      'Esterilización antes del primer celo: Medida preventiva más eficaz.',
      'Evitar progestágenos para suprimir el celo.',
      'Palpación mamaria en cada control de perras enteras mayores de 5 años.',
      'Extirpar los nódulos cuando son pequeños: El tamaño es un factor pronóstico.',
    ],
    references_list: [
      'Schneider R, Dorn CR, Taylor DO. Factors influencing canine mammary cancer development and postsurgical survival. J Natl Cancer Inst. 1969;43(6):1249-1261.',
      'Sorenmo KU, Worley DR, Zappulli V. Tumors of the mammary gland. In: Withrow & MacEwen\'s Small Animal Clinical Oncology. 6th ed. Elsevier; 2020.',
    ],
  },
  {
    name: 'Tumores mamarios felinos',
    english_name: 'Feline mammary tumors',
    scientific_name: null,
    species: 'cat', category: 'oncological', severity: 'critical', prognosis: 'poor', life_stage: 'senior',
    is_zoonotic: false, prevalence_rank: 19,
    description: 'Tercera neoplasia más frecuente de la gata. A diferencia de la perra, el 80-90% son malignos (adenocarcinomas) y agresivos, con metástasis frecuente a ganglios y pulmón. El tamaño del tumor es el factor pronóstico más importante. La esterilización antes de los 6 meses reduce el riesgo en ~91% y antes del año en ~86%.',
    pathophysiology: 'Tumor hormonodependiente en su origen. El adenocarcinoma invade los linfáticos con rapidez; las cadenas mamarias de la gata están conectadas, por lo que se recomienda la mastectomía de cadena completa.',
    key_signs: [
      'Nódulo mamario firme: A menudo pequeño al descubrirse; cualquier nódulo en una gata es sospechoso.',
      'Ulceración y secreción: En tumores avanzados.',
      'Ganglios agrandados.',
      'Disnea o derrame pleural: Metástasis torácicas.',
    ],
    diagnosis: {
      clinicalExam: 'Palpar las 8 mamas, medir cada nódulo y palpar ganglios axilares e inguinales.',
      labTests: [
        'Histopatología: Confirma el tipo y el grado.',
        'Hemograma, bioquímica, T4 total y FeLV/FIV: Gatas mayores, evaluación prequirúrgica.',
      ],
      imaging: [
        'Radiografía torácica en 3 proyecciones: Metástasis o derrame antes de la cirugía.',
        'Ecografía abdominal: Ganglios y órganos.',
      ],
      differentialDiagnosis: [
        'Hiperplasia fibroadenomatosa: Gatas jóvenes o tratadas con progestágenos; agrandamiento mamario difuso y benigno.',
        'Mastitis.',
        'Otros tumores cutáneos: Mastocitoma, carcinoma de células escamosas.',
      ],
    },
    treatment: {
      firstLine: [
        'Mastectomía radical: Cadena completa del lado afectado, o bilateral en dos tiempos (separados 2-4 semanas); reduce la recurrencia frente a cirugías conservadoras.',
        'Analgesia multimodal perioperatoria.',
      ],
      secondLine: [
        'Quimioterapia adyuvante: Doxorrubicina 1 mg/kg IV cada 21 días o carboplatino; derivar a oncología.',
        'Inhibidores de COX-2: Meloxicam en dosis bajas como paliativo, con control renal.',
        'Manejo paliativo: Toracocentesis en derrames, control del dolor.',
      ],
      emergency: 'PRESENTACIÓN: Disnea por derrame pleural metastásico.\nPROTOCOLO:\n  - Oxígeno y mínima manipulación\n  - Toracocentesis terapéutica\n  - Citología del líquido\n  - Conversar pronóstico y calidad de vida con el tutor',
      duration: 'Controles cada 3 meses el primer año con radiografía torácica.',
      notes: `${DRAFT_NOTE} Sobrevida media orientativa según tamaño: <2 cm, más de 3 años; 2-3 cm, unos 2 años; >3 cm, 4-12 meses.`,
    },
    prevention: [
      'Esterilización antes de los 6 meses: La medida más eficaz.',
      'No usar progestágenos para suprimir el celo.',
      'Palpación mamaria en cada control de gatas mayores.',
      'Biopsia de cualquier nódulo mamario sin esperar a que crezca.',
    ],
    references_list: [
      'Overley B, et al. Association between ovariohysterectomy and feline mammary carcinoma. J Vet Intern Med. 2005;19(4):560-563.',
      'Sorenmo KU, Worley DR, Zappulli V. Tumors of the mammary gland. In: Withrow & MacEwen\'s Small Animal Clinical Oncology. 6th ed. Elsevier; 2020.',
    ],
  },
  {
    name: 'Rabia',
    english_name: 'Rabies',
    scientific_name: 'Lyssavirus rabies',
    species: 'both', category: 'infectious', severity: 'critical', prognosis: 'grave', life_stage: 'all',
    is_zoonotic: true, prevalence_rank: 47,
    description: 'Encefalitis viral aguda, siempre mortal una vez que aparecen los signos. En Chile la variante canina está controlada, pero el virus circula en murciélagos insectívoros (sobre todo Tadarida brasiliensis), y cada año se detectan murciélagos positivos y, de forma esporádica, perros o gatos contagiados por ellos. Es de notificación obligatoria y la vacunación de perros y gatos es obligatoria por ley.',
    pathophysiology: 'El virus entra por mordedura o contacto de saliva con heridas o mucosas, se replica en el músculo y avanza por los nervios periféricos hasta el sistema nervioso central, y desde ahí a las glándulas salivales. El período de incubación es variable (semanas a meses).',
    key_signs: [
      'Cambio de comportamiento: Animal manso que se vuelve agresivo o animal agresivo que se vuelve dócil; se esconde.',
      'Forma furiosa: Agresividad, mordiscos al aire, hiperexcitabilidad, pica.',
      'Forma paralítica: Parálisis mandibular y faríngea (mandíbula caída, salivación, no puede tragar), parálisis ascendente.',
      'Cambio de voz o maullido.',
      'Muerte en 7-10 días desde el inicio de los signos.',
    ],
    diagnosis: {
      clinicalExam: 'Sospechar ante signos neurológicos de progresión rápida en un animal no vacunado o con contacto con murciélagos. Manipular con guantes y protección, sin exponer al personal.',
      labTests: [
        'Inmunofluorescencia directa en tejido encefálico: Diagnóstico definitivo post mortem, realizado por el laboratorio de referencia nacional.',
        'No hay prueba fiable en el animal vivo.',
      ],
      imaging: [],
      differentialDiagnosis: [
        'Moquillo canino nervioso.',
        'Cuerpo extraño en la boca o la faringe: Ojo, explorar la boca con protección.',
        'Intoxicaciones neurológicas.',
        'Encefalitis de otra causa y traumatismo craneal.',
      ],
    },
    treatment: {
      firstLine: [
        'No hay tratamiento: Ante sospecha, aislar al animal y notificar de inmediato a la autoridad sanitaria.',
        'Personas expuestas: Lavar la herida con agua y jabón durante 15 minutos y derivar a un centro de salud para profilaxis postexposición.',
        'Animal mordedor sano: Observación obligatoria de 10 días según instrucción de la autoridad sanitaria.',
      ],
      secondLine: [
        'Eutanasia y envío del encéfalo para diagnóstico: Según instrucción de la autoridad sanitaria.',
      ],
      emergency: 'PRESENTACIÓN: Perro o gato con signos neurológicos agudos y posible contacto con murciélagos, o que mordió a una persona.\nPROTOCOLO:\n  - Aislar al animal y limitar el contacto a personal con guantes y protección\n  - No tomar muestras de saliva ni explorar la boca sin protección\n  - Notificar de inmediato a la SEREMI de Salud\n  - Derivar a las personas expuestas a un centro de salud\n  - Registrar a todas las personas y animales en contacto',
      duration: 'No aplica.',
      notes: `${DRAFT_NOTE} Chile: enfermedad de notificación obligatoria inmediata. Murciélago encontrado en el suelo o activo de día: no tocarlo con las manos y avisar a la SEREMI de Salud.`,
    },
    prevention: [
      'Vacunación antirrábica de perros y gatos: Obligatoria; mantenerla vigente según el registro de la vacuna.',
      'Gatos de interior también: Los murciélagos entran a las casas.',
      'Educación del tutor: No manipular murciélagos; avisar a la autoridad sanitaria.',
      'Vacunación preexposición del personal veterinario: Según recomendación de salud ocupacional.',
    ],
    references_list: [
      'Day MJ, et al. WSAVA Guidelines for the vaccination of dogs and cats. J Small Anim Pract. 2016;57(1):E1-E45.',
      'World Health Organization. WHO Expert Consultation on Rabies: third report. WHO Technical Report Series 1012. Geneva; 2018.',
    ],
  },
  {
    name: 'Equinococosis canina (hidatidosis)',
    english_name: 'Canine echinococcosis (hydatid disease)',
    scientific_name: 'Echinococcus granulosus sensu lato',
    species: 'dog', category: 'parasitic', severity: 'moderate', prognosis: 'excellent', life_stage: 'all',
    is_zoonotic: true, prevalence_rank: 42,
    description: 'El perro es el hospedador definitivo de Echinococcus granulosus: aloja la tenia adulta en el intestino, casi siempre sin signos, y elimina huevos en las heces. Las personas y el ganado se infectan al ingerir esos huevos y desarrollan quistes hidatídicos en hígado y pulmón. En Chile es endémica en zonas rurales y ganaderas, con mayor carga en el sur (Araucanía, Aysén, Magallanes). La importancia clínica está en la salud pública, no en el perro.',
    pathophysiology: 'El perro se infecta al comer vísceras crudas (hígado, pulmón) de ovejas, vacunos o cerdos con quistes hidatídicos. Los protoescólices se convierten en tenias adultas de 3-6 mm en el intestino delgado y en unas 6-7 semanas empiezan a eliminar huevos, que son infectantes de inmediato y resisten meses en el ambiente.',
    key_signs: [
      'Habitualmente asintomático: Incluso con cargas parasitarias altas.',
      'Prurito anal o arrastre: Poco frecuente.',
      'Diarrea leve: En infecciones masivas.',
      'Antecedente clave: Perro rural, de campo o de faena que come vísceras crudas.',
    ],
    diagnosis: {
      clinicalExam: 'El examen suele ser normal. Preguntar por acceso a vísceras crudas, faenas domésticas y contacto con ganado.',
      labTests: [
        'Coproantígeno (ELISA): Detecta la infección intestinal; usado en programas de vigilancia.',
        'PCR en heces: Confirma la especie.',
        'Coproparasitario: Los huevos no se distinguen de los de Taenia, por lo que un resultado positivo obliga a manejarlo como posible Echinococcus.',
      ],
      imaging: [],
      differentialDiagnosis: [
        'Taenia spp.: Huevos idénticos; segmentos visibles en las heces.',
        'Dipylidium caninum: Proglótides como granos de arroz, transmitido por pulgas.',
      ],
    },
    treatment: {
      firstLine: [
        'Praziquantel: 5 mg/kg VO dosis única; elimina las tenias adultas.',
        'Desparasitación periódica en zonas endémicas: Praziquantel cada 6 semanas en perros con acceso a vísceras (pauta de los programas de control).',
      ],
      secondLine: [
        'Manejo de heces tras el tratamiento: Recoger y eliminar las heces de las 48 horas siguientes con guantes (bolsa cerrada o enterrar profundo); contienen huevos infectantes.',
        'Bañar al perro tras el tratamiento: Retira huevos del pelaje perianal.',
      ],
      emergency: 'No aplica en el perro. En personas con sospecha de quiste hidatídico: derivar a un centro de salud.',
      duration: 'Dosis única; repetir según el riesgo de reinfección.',
      notes: `${DRAFT_NOTE} Chile: la hidatidosis humana es de notificación obligatoria. El praziquantel está disponible en antiparasitarios veterinarios combinados.`,
    },
    prevention: [
      'No dar vísceras crudas a los perros: Cocerlas o eliminarlas; la medida más importante.',
      'Faenamiento controlado: Evitar faenas domésticas con acceso de perros.',
      'Desparasitación periódica con praziquantel en perros de riesgo.',
      'Higiene: Lavado de manos tras tocar perros y antes de comer; lavar verduras.',
    ],
    references_list: [
      'Craig PS, et al. Echinococcosis: control and prevention. Adv Parasitol. 2017;96:55-158.',
      'Eckert J, Gemmell MA, Meslin FX, Pawlowski ZS (eds). WHO/OIE Manual on Echinococcosis in Humans and Animals. Paris: OIE; 2001.',
    ],
  },
  {
    name: 'Brucelosis canina',
    english_name: 'Canine brucellosis',
    scientific_name: 'Brucella canis',
    species: 'dog', category: 'infectious', severity: 'moderate', prognosis: 'guarded', life_stage: 'adult',
    is_zoonotic: true, prevalence_rank: 41,
    description: 'Infección bacteriana crónica que causa fallas reproductivas en perros: abortos tardíos, infertilidad y epididimitis. Se transmite por contacto con fluidos genitales, abortos, orina y semen, y se disemina en criaderos. La bacteria persiste en el organismo pese al tratamiento, por lo que no se considera curable. Es zoonótica, sobre todo para criadores, personal veterinario y personas inmunodeprimidas.',
    pathophysiology: 'Brucella canis es una bacteria intracelular que sobrevive dentro de los macrófagos; se localiza en órganos reproductivos, ganglios, bazo, próstata y discos intervertebrales, con bacteriemia intermitente que puede durar años.',
    key_signs: [
      'Aborto tardío: Entre los días 45 y 55 de gestación, con secreción vaginal prolongada.',
      'Infertilidad: En hembras y machos; camadas pequeñas o cachorros débiles.',
      'Epididimitis y orquitis: Escroto aumentado, dermatitis escrotal por lamido; luego atrofia testicular.',
      'Linfadenomegalia generalizada.',
      'Discoespondilitis y uveítis: Dolor de columna, cojera u ojo rojo.',
    ],
    diagnosis: {
      clinicalExam: 'Historia reproductiva (abortos, infertilidad), palpación testicular y de ganglios, examen de columna y ocular.',
      labTests: [
        'Aglutinación rápida en placa (RSAT/2ME-RSAT): Tamizaje sensible; un negativo es muy fiable, un positivo requiere confirmación.',
        'Inmunodifusión en gel (AGID) o IFI: Confirmación serológica.',
        'Hemocultivo o PCR en sangre, semen o secreción vaginal: Confirmación definitiva.',
      ],
      imaging: [
        'Radiografía de columna: Discoespondilitis.',
        'Ecografía testicular y prostática.',
      ],
      differentialDiagnosis: [
        'Herpesvirus canino: Muerte neonatal, abortos.',
        'Toxoplasmosis o neosporosis.',
        'Orquitis traumática o por otras bacterias.',
        'Causas hormonales de infertilidad.',
      ],
    },
    treatment: {
      firstLine: [
        'Castración u ovariohisterectomía: Reduce la eliminación de bacterias; los animales infectados no deben reproducirse.',
        'Doxiciclina: 10 mg/kg VO cada 12 h durante 4 semanas, combinada con un segundo antibiótico.',
        'Enrofloxacino: 5 mg/kg VO cada 24 h durante 4 semanas, como segundo fármaco (u otro según especialista).',
      ],
      secondLine: [
        'Gentamicina: 5 mg/kg SC/IV cada 24 h por 7 días en la primera y cuarta semana, con control renal (pauta alternativa).',
        'Serología cada 3-6 meses tras el tratamiento: Las recidivas son frecuentes.',
        'Criaderos: Aislar o retirar animales positivos y testear a todos.',
      ],
      emergency: 'No suele haber urgencias. En abortos: manejar fetos, placentas y secreciones con guantes y mascarilla, y desinfectar con hipoclorito.',
      duration: 'Tratamiento de 4 semanas o más; seguimiento serológico de por vida.',
      notes: `${DRAFT_NOTE} Chile: la brucelosis humana es de notificación obligatoria; hay reportes de B. canis en perros de varias regiones. Informar al tutor del riesgo zoonótico.`,
    },
    prevention: [
      'Testear a los reproductores antes de cada cruza y a los perros nuevos de un criadero.',
      'No reproducir animales positivos.',
      'Protección del personal: Guantes y mascarilla al atender abortos y partos.',
      'Esterilización de perros no destinados a la reproducción.',
    ],
    references_list: [
      'Hensel ME, Negron M, Arenas-Gamboa AM. Brucellosis in dogs and public health risk. Emerg Infect Dis. 2018;24(8):1401-1406.',
      'Greene CE, Carmichael LE. Canine brucellosis. In: Greene CE (ed). Infectious Diseases of the Dog and Cat. 4th ed. Elsevier; 2012.',
    ],
  },
  {
    name: 'Bartonelosis felina (enfermedad por arañazo de gato)',
    english_name: 'Feline bartonellosis (cat scratch disease)',
    scientific_name: 'Bartonella henselae',
    species: 'cat', category: 'infectious', severity: 'mild', prognosis: 'excellent', life_stage: 'all',
    is_zoonotic: true, prevalence_rank: 30,
    description: 'Infección por Bartonella henselae transmitida entre gatos por la pulga Ctenocephalides felis. La mayoría de los gatos infectados no tiene signos pero mantiene bacteriemia durante meses, sobre todo los gatitos y los gatos jóvenes con pulgas. En personas causa la enfermedad por arañazo de gato (adenopatía, fiebre prolongada), una causa frecuente de fiebre de origen desconocido en niños en Chile.',
    pathophysiology: 'La bacteria infecta los eritrocitos y el endotelio. Las heces de las pulgas contienen bacterias viables; llegan a la piel humana por arañazos o mordeduras contaminadas.',
    key_signs: [
      'Habitualmente asintomático.',
      'Fiebre transitoria y letargia: Poco frecuente, en gatos jóvenes.',
      'Linfadenomegalia.',
      'Uveítis, gingivitis o estomatitis: Asociación descrita, no siempre causal.',
      'Endocarditis: Rara, pero grave.',
    ],
    diagnosis: {
      clinicalExam: 'Buscar pulgas o heces de pulga, ganglios agrandados, inflamación ocular u oral. En gatos sanos el diagnóstico solo se busca si hay una persona inmunodeprimida en casa.',
      labTests: [
        'Serología (IFI): Indica exposición; muchos gatos sanos son positivos.',
        'PCR en sangre: Detecta bacteriemia activa; un negativo no la descarta (es intermitente).',
        'Hemocultivo: Confirma la infección.',
      ],
      imaging: [
        'Ecocardiografía: Si hay soplo nuevo o sospecha de endocarditis.',
      ],
      differentialDiagnosis: [
        'Otras causas de uveítis: FIP, FIV, FeLV, toxoplasmosis.',
        'Complejo gingivitis-estomatitis felino: Calicivirus.',
        'Otras causas de fiebre o linfadenomegalia.',
      ],
    },
    treatment: {
      firstLine: [
        'Tratar solo a gatos enfermos: El tratamiento de portadores sanos no está recomendado de rutina.',
        'Doxiciclina: 10 mg/kg VO cada 24 h durante 4 semanas; dar con agua o comida para evitar estenosis esofágica.',
        'Control de pulgas en todos los animales de la casa.',
      ],
      secondLine: [
        'Pradofloxacino: 5-7,5 mg/kg VO cada 24 h como alternativa.',
        'Azitromicina: Evitar la monoterapia por riesgo de resistencias.',
      ],
      emergency: 'No suele haber urgencias en el gato. Persona con fiebre o ganglio inflamado tras un arañazo: derivar a un centro de salud.',
      duration: '4-6 semanas en gatos enfermos.',
      notes: `${DRAFT_NOTE} Chile: la enfermedad por arañazo de gato es frecuente en niños; aconsejar control de pulgas y lavar arañazos de inmediato.`,
    },
    prevention: [
      'Control de pulgas todo el año: La medida más eficaz.',
      'Lavar con agua y jabón cualquier arañazo o mordedura de gato.',
      'Casas con personas inmunodeprimidas: Preferir gatos adultos sin pulgas y testeados.',
      'Uñas cortas y evitar juegos bruscos con las manos.',
    ],
    references_list: [
      'Álvarez-Fernández A, Breitschwerdt EB, Solano-Gallego L. Bartonella infections in cats and dogs including zoonotic aspects. Parasit Vectors. 2018;11(1):624.',
      'Pennisi MG, et al. Bartonella species infection in cats: ABCD guidelines on prevention and management. J Feline Med Surg. 2013;15(7):563-569.',
    ],
  },
];

async function addDiseases(c, orgId, list = DISEASES) {
  const lines = [];
  let inserted = 0;
  for (const d of list) {
    const exists = await c.query(
      'SELECT id, organization_id FROM diseases WHERE lower(name) = lower($1) AND (organization_id IS NULL OR organization_id = $2)',
      [d.name, orgId],
    );
    if (exists.rowCount) { lines.push(`= ya existe: ${d.name}`); continue; }
    await c.query(
      `INSERT INTO diseases (name, english_name, scientific_name, species, category, severity, prognosis, life_stage,
         is_zoonotic, prevalence_rank, description, pathophysiology, key_signs, diagnosis, treatment, prevention,
         references_list, organization_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [d.name, d.english_name, d.scientific_name, d.species, d.category, d.severity, d.prognosis, d.life_stage,
        d.is_zoonotic, d.prevalence_rank, d.description, d.pathophysiology, JSON.stringify(d.key_signs),
        JSON.stringify(d.diagnosis), JSON.stringify(d.treatment), JSON.stringify(d.prevention),
        JSON.stringify(d.references_list), orgId],
    );
    inserted++;
    lines.push(`+ ${d.name} [${d.species}, ${d.category}, ${d.severity}${d.is_zoonotic ? ', zoonótica' : ''}]`);
  }
  return { lines, inserted };
}

module.exports = { DISEASES, addDiseases };

if (require.main === module) {
  if (!Number.isInteger(ORG) || ORG <= 0) {
    console.error('Indica la organización dueña de las fichas: --org=<id>');
    process.exit(1);
  }
  (async () => {
    const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await c.connect();
    await c.query('BEGIN');
    try {
      const org = await c.query('SELECT name FROM organizations WHERE id = $1', [ORG]);
      if (!org.rowCount) throw new Error(`No existe la organización ${ORG}`);
      const { lines, inserted } = await addDiseases(c, ORG);
      console.log(`Organización: ${org.rows[0].name}\n${lines.join('\n')}\n\n${inserted} fichas nuevas`);
      if (APPLY) { await c.query('COMMIT'); console.log('\nAPLICADO.'); }
      else { await c.query('ROLLBACK'); console.log('\nPrueba en seco: no se escribió nada. Usa --apply para aplicar.'); }
    } catch (e) {
      await c.query('ROLLBACK');
      console.error('ERROR (revertido):', e.message);
      process.exitCode = 1;
    } finally {
      await c.end();
    }
  })();
}
