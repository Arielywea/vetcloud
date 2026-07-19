/**
 * VetCloud Disease Seed Script
 *
 * This script seeds the database with all disease data.
 *
 * Usage:
 *   1. Start Docker: cd docker && docker compose up -d
 *   2. Wait for Directus to be ready at http://localhost:8055
 *   3. Run: npx ts-node scripts/seed-diseases.ts
 */

const DIRECTUS_URL = 'http://localhost:8055';

interface DiseaseData {
  name: string;
  scientific_name: string;
  species: string;
  category: string;
  severity: string;
  description: string;
  key_signs: string[];
  diagnosis: {
    clinicalExam: string;
    labTests: string[];
    imaging: string[];
    differentialDiagnosis: string[];
  };
  treatment: {
    firstLine: string[];
    secondLine: string[];
    emergency: string;
    duration: string;
  };
  prevention: string[];
  prognosis: string;
  is_zoonotic: boolean;
  references: string[];
}

// ─────────────────────────────────────────────────────────
// Disease Data
// ─────────────────────────────────────────────────────────

const DOG_DISEASES: DiseaseData[] = [
  {
    name: 'Parvovirus Canino',
    scientific_name: 'Canine Parvovirus (CPV-2)',
    species: 'dog',
    category: 'infectious',
    severity: 'severe',
    description: 'Enfermedad viral altamente contagiosa causada por el parvovirus canino tipo 2. Afecta principalmente el tracto gastrointestinal y el sistema inmune.',
    key_signs: [
      'Vómitos severos con sangre',
      'Diarrea hemorrágica',
      'Pérdida severa de apetito',
      'Letargia y debilidad extrema',
      'Fiebre alta (39.5-41°C)',
      'Deshidratación rápida',
      'Abdomen doloroso'
    ],
    diagnosis: {
      clinicalExam: 'Evaluación de signos clínicos, deshidratación, estado corporal. Historial de vacunación incompleta.',
      labTests: [
        'Test rápido de antígeno fecal (ELISA)',
        'Hemograma: leucopenia',
        'Química sanguínea: hipoglucemia',
        'Electrolitos: alteraciones'
      ],
      imaging: ['Radiografía abdominal: distensión de asas intestinales'],
      differentialDiagnosis: ['Parasitismo severo', 'Gastroenteritis', 'Intoxicación alimentaria']
    },
    treatment: {
      firstLine: [
        'Hospitalización y fluidoterapia IV',
        'Maropitant (Cerenia) 1-2 mg/kg SC q24h',
        'Ampicilina 22 mg/kg IV q6h',
        'Omeprazol 1 mg/kg IV q24h',
        'Nutrición enteral suave'
      ],
      secondLine: [
        'Favipiravir',
        'Inmunoglobulinas antiparvovirus',
        'Plasma fresco'
      ],
      emergency: 'Shock séptico: resucitación con fluidos bolus, dobutamina si hipotensión.',
      duration: '5-7 días de hospitalización'
    },
    prevention: [
      'Vacunación completa según protocolo',
      'Evitar contacto con heces contaminadas',
      'No pasear cachorros hasta completar vacunación'
    ],
    prognosis: 'guarded',
    is_zoonotic: false,
    references: [
      'Greene CE, Sykes JE. Canine Parvovirus Infections. Infectious Diseases of the Dog and Cat. 4th ed.',
      'AVMA - Canine Parvovirus Fact Sheet'
    ]
  },
  {
    name: 'Moquillo Canino',
    scientific_name: 'Canine Distemper Virus (CDV)',
    species: 'dog',
    category: 'infectious',
    severity: 'severe',
    description: 'Enfermedad viral sistémica altamente contagiosa. Afecta tracto respiratorio, gastrointestinal, sistema nervioso y tejidos epiteliales.',
    key_signs: [
      'Fiebre bifásica',
      'Secreción nasal y ocular mucopurulenta',
      'Tos progresiva',
      'Hiperqueratosis de almohadillas',
      'Signos neurológicos: mioclonias, convulsiones'
    ],
    diagnosis: {
      clinicalExam: 'Signos sistémicos multifásicos, hiperqueratosis de almohadillas.',
      labTests: ['PCR en hisopos', 'Inmunofluorescencia directa', 'Hemograma: leucopenia'],
      imaging: ['Radiografía torácica: patrón intersticial'],
      differentialDiagnosis: ['Influenza canina', 'Adenovirus']
    },
    treatment: {
      firstLine: ['Soporte intensivo: fluidoterapia IV', 'Antibióticos para secundarias', 'Nebulización'],
      secondLine: ['Interferón omega', 'Anticonvulsivantes si signos neurológicos'],
      emergency: 'Status epilépticus: Diazepam IV.',
      duration: '2-4 semanas'
    },
    prevention: ['Vacunación DHPPi', 'Refuerzo anual', 'Evitar contacto con wildlife'],
    prognosis: 'guarded',
    is_zoonotic: false,
    references: ['Greene CE, Appel MJG. Canine Distemper. 4th ed.']
  },
  {
    name: 'Leptospirosis Canina',
    scientific_name: 'Leptospira spp.',
    species: 'dog',
    category: 'infectious',
    severity: 'severe',
    description: 'Enfermedad zoonótica causada por espiroquetas. Afecta hígado y riñones.',
    key_signs: ['Fiebre alta', 'Mialgias severas', 'Ictericia', 'Oliguria', 'Hemorragias petequiales'],
    diagnosis: {
      clinicalExam: 'Ictericia, dolor renal, fiebre.',
      labTests: ['MAT', 'PCR en sangre y orina', 'Química: elevación de ALT, creatinina'],
      imaging: ['Ecografía renal'],
      differentialDiagnosis: ['Hepatitis infecciosa', 'Piometra']
    },
    treatment: {
      firstLine: ['Fluidoterapia IV', 'Doxiciclina 10 mg/kg PO q12h por 2-4 semanas', 'Ampicilina IV'],
      secondLine: ['Penicilina G', 'Hemodiálisis'],
      emergency: 'Insuficiencia renal aguda: hemodiálisis.',
      duration: '2-4 semanas de antibióticos'
    },
    prevention: ['Vacunación anual', 'Evitar aguas estancadas', 'Control de roedores'],
    prognosis: 'guarded',
    is_zoonotic: true,
    references: ['Sykes JE. Leptospirosis. 4th ed.']
  },
  {
    name: 'Rabia',
    scientific_name: 'Rabies lyssavirus',
    species: 'dog',
    category: 'infectious',
    severity: 'critical',
    description: 'Enfermedad viral zoonótica mortal. Sin tratamiento curativo.',
    key_signs: ['Cambios de comportamiento', 'Agresividad', 'Parálisis', 'Hidrofobia', 'Hipersecreción salival'],
    diagnosis: {
      clinicalExam: 'Signos neurológicos progresivos. Diagnóstico definitivo post-mortem.',
      labTests: ['IFA en tejido encefálico post-mortem'],
      imaging: [],
      differentialDiagnosis: ['Encefalitis', 'Moquillo']
    },
    treatment: {
      firstLine: ['NO EXISTE TRATAMIENTO', 'Eutanasia humanitaria', 'Reporte obligatorio'],
      secondLine: [],
      emergency: 'Protocolo de exposición para humanos.',
      duration: 'Fatal en 100% de los casos'
    },
    prevention: ['Vacunación ANUAL obligatoria', 'Control de animales callejeros'],
    prognosis: 'grave',
    is_zoonotic: true,
    references: ['WHO - Rabies Fact Sheet']
  },
  {
    name: 'Displasia Coxofemoral',
    scientific_name: 'Canine Hip Dysplasia',
    species: 'dog',
    category: 'musculoskeletal',
    severity: 'moderate',
    description: 'Enfermedad degenerativa de la articulación coxofemoral. Más común en razas grandes.',
    key_signs: ['Cojera de extremidades posteriores', 'Dificultad para levantarse', 'Caminata de conejo', 'Atrofia muscular'],
    diagnosis: {
      clinicalExam: 'Prueba de Ortolani positiva, dolor a la manipulación.',
      labTests: [],
      imaging: ['Radiografía ventrodorsal extendida', 'Clasificación OFA/FCI'],
      differentialDiagnosis: ['Osteocondritis', 'Ruptura de ligamento cruzado']
    },
    treatment: {
      firstLine: ['Control de peso', 'AINEs: Carprofen', 'Suplementos: Glucosamina', 'Fisioterapia'],
      secondLine: ['Infiltración intraarticular', 'Prótesis total de cadera'],
      emergency: 'Crisis de dolor: AINEs parenterales.',
      duration: 'Manejo de por vida'
    },
    prevention: ['Selección genética', 'Control nutricional', 'Evitar ejercicio excesivo'],
    prognosis: 'good',
    is_zoonotic: false,
    references: ['Smith GK. Hip Dysplasia. Small Animal Surgery. 5th ed.']
  },
  {
    name: 'Dirofilariasis',
    scientific_name: 'Dirofilaria immitis',
    species: 'dog',
    category: 'parasitic',
    severity: 'severe',
    description: 'Gusano del corazón transmitido por mosquitos.',
    key_signs: ['Tos crónica', 'Intolerancia al ejercicio', 'Disnea', 'Ascitis', 'Insuficiencia cardíaca'],
    diagnosis: {
      clinicalExam: 'Soplo cardíaco, ingurgitación yugular.',
      labTests: ['Test antígeno cardíaco', 'Microhematocrito'],
      imaging: ['Ecocardiografía', 'Radiografía torácica'],
      differentialDiagnosis: ['Enfermedad valvular', 'Neumonía']
    },
    treatment: {
      firstLine: ['Restricción de ejercicio', 'Melarsamina IM', 'Doxiciclina 4 semanas'],
      secondLine: ['Cirugía extractiva'],
      emergency: 'Tromboembolismo pulmonar: oxigenoterapia, anticoagulantes.',
      duration: 'Tratamiento completo: 4 meses'
    },
    prevention: ['Profilaxis mensual: Moxidectina/Ivermectina', 'Control de mosquitos'],
    prognosis: 'good',
    is_zoonotic: false,
    references: ['American Heartworm Society Guidelines']
  },
  {
    name: 'Diabetes Mellitus',
    scientific_name: 'Diabetes Mellitus Canine',
    species: 'dog',
    category: 'endocrine',
    severity: 'moderate',
    description: 'Trastorno endocrino con hiperglucemia persistente.',
    key_signs: ['Polidipsia', 'Poliuria', 'Pérdida de peso', 'Cataratas', 'Letargia'],
    diagnosis: {
      clinicalExam: 'Pérdida de peso, cataratas, hepatomegalia.',
      labTests: ['Glucemia en ayuno >250 mg/dL', 'Glucosuria', 'Fructosamina >400 µmol/L'],
      imaging: ['Ecografía abdominal'],
      differentialDiagnosis: ['Cushing', 'Pancreatitis']
    },
    treatment: {
      firstLine: ['Insulina NPH/Caninsulin', 'Dieta alta en fibra', 'Ejercicio regular'],
      secondLine: ['Insulina glargina', 'Metformina'],
      emergency: 'Cetoacidosis: fluidoterapia IV, insulina regular.',
      duration: 'Tratamiento de por vida'
    },
    prevention: ['Esterilización en hembras', 'Control de peso', 'Alimentación balanceada'],
    prognosis: 'good',
    is_zoonotic: false,
    references: ['Nelson RW. Diabetes Mellitus. 8th ed.']
  },
  {
    name: 'Pancreatitis',
    scientific_name: 'Pancreatitis Canina',
    species: 'dog',
    category: 'gastrointestinal',
    severity: 'moderate',
    description: 'Inflamación del páncreas aguda o crónica.',
    key_signs: ['Vómitos recurrentes', 'Dolor abdominal', 'Anorexia', 'Diarrea'],
    diagnosis: {
      clinicalExam: 'Dolor abdominal, deshidratación.',
      labTests: ['Spec cPL', 'PLI sérica', 'Amilasa/lipasa'],
      imaging: ['Ecografía abdominal'],
      differentialDiagnosis: ['Hepatitis', 'Enfermedad inflamatoria intestinal']
    },
    treatment: {
      firstLine: ['NPO 24-48h', 'Fluidoterapia IV', 'Maropitant', 'Buprenorfina para dolor'],
      secondLine: ['Gabapentina', 'Pentoxifilina'],
      emergency: 'Pancreatitis hemorrágica: UCI, fluidoterapia agresiva.',
      duration: 'Aguda: 3-5 días. Crónica: manejo dietético de por vida.'
    },
    prevention: ['Dieta baja en grasa', 'Control de peso', 'Raciones fraccionadas'],
    prognosis: 'good',
    is_zoonotic: false,
    references: ['Newman S. Pancreatitis in Dogs. 8th ed.']
  },
  {
    name: 'Torsión Gástrica',
    scientific_name: 'Gastric Dilatation-Volvulus (GDV)',
    species: 'dog',
    category: 'gastrointestinal',
    severity: 'critical',
    description: 'Emergencia quirúrgica donde el estómago se dilata y torsiona.',
    key_signs: ['Distensión abdominal', 'Esfuerzo por vomitar', 'Salivación excesiva', 'Taquicardia', 'Encías pálidas'],
    diagnosis: {
      clinicalExam: 'Timpanismo abdominal, taquicardia.',
      labTests: ['Hemograma', 'Química: acidosis, hiperpotasemia', 'Troponina I'],
      imaging: ['Radiografía: signo double bubble'],
      differentialDiagnosis: ['Dilatación gástrica simple', 'Obstrucción intestinal']
    },
    treatment: {
      firstLine: ['Descompreión urgente', 'Resucitación IV', 'CIRUGÍA URGENTE: gastropexia'],
      secondLine: ['Gastropexia profiláctica'],
      emergency: 'SHOCK: fluidoterapia masiva, dobutamina, plasma.',
      duration: 'Hospitalización 3-5 días'
    },
    prevention: ['Alimentación fraccionada', 'Bol de alimentación lento', 'Gastropexia profiláctica'],
    prognosis: 'guarded',
    is_zoonotic: false,
    references: ['Glickman LT. Canine GDV. JAVMA. 2000.']
  },
  {
    name: 'Enfermedad Periodontal',
    scientific_name: 'Periodontal Disease Canine',
    species: 'dog',
    category: 'dental',
    severity: 'moderate',
    description: 'Inflamación e infección de las estructuras del diente. Afecta al 80% de perros a los 3 años.',
    key_signs: ['Halitosis', 'Sarro', 'Encías rojas', 'Sangrado', 'Pérdida de dientes'],
    diagnosis: {
      clinicalExam: 'Evaluación visual de sarro, gingivitis.',
      labTests: ['Hemograma si infección'],
      imaging: ['Radiografías dentales intraorales'],
      differentialDiagnosis: ['Fractura dental', 'Tumor oral']
    },
    treatment: {
      firstLine: ['Limpieza dental bajo anestesia', 'Extracción de dientes comprometidos', 'Clorhexidina tópica'],
      secondLine: ['Cirugía periodontal'],
      emergency: 'Absceso dental: drenaje + antibióticos.',
      duration: 'Mantenimiento dental diario'
    },
    prevention: ['Cepillado diario', 'Dietas dentales', 'Limpieza profesional anual'],
    prognosis: 'good',
    is_zoonotic: false,
    references: ['AVDC - Veterinary Dental Nomenclature']
  },
  {
    name: 'Dermatitis Atópica',
    scientific_name: 'Canine Atopic Dermatitis',
    species: 'dog',
    category: 'dermatological',
    severity: 'moderate',
    description: 'Enfermedad inflamatoria de la piel mediada por IgE.',
    key_signs: ['Prurito intenso', 'Rascado', 'Otitis recurrente', 'Dermatitis podal', 'Infecciones secundarias'],
    diagnosis: {
      clinicalExam: 'Distribución: axilas, ingles, podal.',
      labTests: ['Raspado de piel', 'Citología cutánea', 'Alergenos IgE'],
      imaging: [],
      differentialDiagnosis: ['DAPP', 'Dermatofitosis', 'Sarna']
    },
    treatment: {
      firstLine: ['Oclacitinib (Apoquel)', 'Corticoides tapering', 'Antihistamínicos'],
      secondLine: ['Ciclosporina', 'Inmunoterapia', 'Cytopoint'],
      emergency: 'Auto-traumatismo: collar isabelino + corticoides.',
      duration: 'Manejo de por vida'
    },
    prevention: ['Control de alérgenos', 'Suplementación omega-3', 'Baños regulares'],
    prognosis: 'guarded',
    is_zoonotic: false,
    references: ['Olivry T. Treatment of Canine Atopic Dermatitis. 2015.']
  },
  {
    name: 'Cataratas',
    scientific_name: 'Cataracts Canine',
    species: 'dog',
    category: 'ocular',
    severity: 'moderate',
    description: 'Opacificación del cristalino que impide el paso de la luz.',
    key_signs: ['Opacidad blanca en pupila', 'Ceguera parcial', 'Nistagmo'],
    diagnosis: {
      clinicalExam: 'Examen oftalmoscópico.',
      labTests: ['Ecografía ocular', 'Tonometría', 'ERG'],
      imaging: ['Ecografía B-scan'],
      differentialDiagnosis: ['Esclerosis nuclear', 'Glaucoma']
    },
    treatment: {
      firstLine: ['Facoemulsificación + lente intraocular', 'Gotas post-operatorias'],
      secondLine: ['Extracción extracapsular'],
      emergency: 'Glaucoma: manitol IV + timolol tópico.',
      duration: 'Recuperación: 2-6 semanas'
    },
    prevention: ['Cribado genético', 'Control de diabetes'],
    prognosis: 'good',
    is_zoonotic: false,
    references: ['Gelatt KN. Veterinary Ophthalmology. 5th ed.']
  },
  {
    name: 'Enfermedad Renal Crónica',
    scientific_name: 'Chronic Kidney Disease',
    species: 'dog',
    category: 'renal',
    severity: 'moderate',
    description: 'Pérdida progresiva e irreversible de la función renal.',
    key_signs: ['Polidipsia', 'Poliuria', 'Pérdida de peso', 'Vómitos', 'Halitosis urémica'],
    diagnosis: {
      clinicalExam: 'Pérdida de peso, halitosis.',
      labTests: ['Creatinina y BUN elevadas', 'SDMA >18 µg/dL', 'Análisis de orina'],
      imaging: ['Ecografía renal'],
      differentialDiagnosis: ['Nefropatía por amiloidosis', 'Pielonefritis']
    },
    treatment: {
      firstLine: ['Dieta renal', 'Fluidoterapia SC en casa', 'EPO si anemia'],
      secondLine: ['Telmisartán', 'Calcitriol'],
      emergency: 'Crisis urémica: fluidoterapia IV, diálisis.',
      duration: 'Manejo de por vida'
    },
    prevention: ['Dieta de calidad', 'Hidratación adecuada', 'Evitar nefrotóxicos'],
    prognosis: 'guarded',
    is_zoonotic: false,
    references: ['IRIS - Staging CKD']
  },
  {
    name: 'Linfoma Canino',
    scientific_name: 'Canine Lymphoma',
    species: 'dog',
    category: 'oncological',
    severity: 'severe',
    description: 'Neoplasia de células linfoides, una de las más comunes.',
    key_signs: ['Linfadenopatía', 'Pérdida de peso', 'Anorexia', 'Fiebre'],
    diagnosis: {
      clinicalExam: 'Nodos linfáticos agrandados.',
      labTests: ['FNA', 'Biopsia con inmunohistoquímica', 'Hemograma'],
      imaging: ['Radiografía torácica', 'Ecografía abdominal'],
      differentialDiagnosis: ['Hiperplasia reactiva', 'Ehrlichia']
    },
    treatment: {
      firstLine: ['Quimioterapia CHOP', 'Prednisona'],
      secondLine: ['Lomustina', 'Toceranib'],
      emergency: 'Hipercalcemia: fluidoterapia + furosemida.',
      duration: 'Quimioterapia: 25-30 semanas'
    },
    prevention: ['No hay prevención conocida', 'Castración puede reducir riesgo'],
    prognosis: 'guarded',
    is_zoonotic: false,
    references: ['Vail DM. Lymphoma. Small Animal Clinical Oncology. 5th ed.']
  },
  {
    name: 'Otitis Externa',
    scientific_name: 'Otitis Externa Canine',
    species: 'dog',
    category: 'dermatological',
    severity: 'mild',
    description: 'Inflamación del canal auditivo externo.',
    key_signs: ['Sacudida de cabeza', 'Rascado de orejas', 'Secreción', 'Mal olor'],
    diagnosis: {
      clinicalExam: 'Otoscopia: evaluación del canal.',
      labTests: ['Citología del cerumen', 'Cultivo si resistente'],
      imaging: ['Radiografías del oído si sospecha media'],
      differentialDiagnosis: ['Otitis media', 'Otodecosis']
    },
    treatment: {
      firstLine: ['Limpieza del canal', 'Gotas otológicas', 'Tratar causa subyacente'],
      secondLine: ['Antibióticos sistémicos', 'Cirugía si crónica'],
      emergency: 'Otitis interna: internamiento.',
      duration: 'Aguda: 7-14 días'
    },
    prevention: ['Limpieza preventiva semanal', 'Secar orejas después de nadar'],
    prognosis: 'excellent',
    is_zoonotic: false,
    references: ['Cole LK. Otitis Externa. Vet Clin North Am. 2004.']
  }
];

const CAT_DISEASES: DiseaseData[] = [
  {
    name: 'Leucemia Felina',
    scientific_name: 'Feline Leukemia Virus (FeLV)',
    species: 'cat',
    category: 'infectious',
    severity: 'severe',
    description: 'Infección retroviral que causa inmunosupresión y neoplasias.',
    key_signs: ['Pérdida de peso', 'Letargia', 'Anemia', 'Infecciones frecuentes'],
    diagnosis: {
      clinicalExam: 'Anemia, linfadenopatía.',
      labTests: ['ELISA p27', 'IFA', 'Hemograma'],
      imaging: ['Radiografía torácica'],
      differentialDiagnosis: ['FIV', 'Toxoplasmosis']
    },
    treatment: {
      firstLine: ['Aislamiento', 'Soporte nutricial', 'Interferón', 'AZT'],
      secondLine: ['Quimioterapia si linfoma'],
      emergency: 'Shock séptico: antibióticos IV.',
      duration: 'Enfermedad de por vida'
    },
    prevention: ['Vacunación FeLV', 'Test antes de vacunar', 'Mantener gatos en interiores'],
    prognosis: 'poor',
    is_zoonotic: false,
    references: ['Hartmann K. Feline Leukemia Virus. 4th ed.']
  },
  {
    name: 'Virus de Inmunodeficiencia Felina',
    scientific_name: 'Feline Immunodeficiency Virus (FIV)',
    species: 'cat',
    category: 'infectious',
    severity: 'moderate',
    description: 'Infección retroviral que causa inmunodeficiencia progresiva.',
    key_signs: ['Infecciones recurrentes', 'Estomatitis', 'Pérdida de peso', 'Linfadenopatía'],
    diagnosis: {
      clinicalExam: 'Estomatitis, infecciones recurrentes.',
      labTests: ['ELISA FIV', 'Western Blot', 'PCR'],
      imaging: [],
      differentialDiagnosis: ['FeLV', 'Enfermedad dental']
    },
    treatment: {
      firstLine: ['Manejo de infecciones', 'AZT', 'Interferón'],
      secondLine: ['Inmunomoduladores', 'Extracción dental'],
      emergency: 'Infección oportunista: antibióticos IV.',
      duration: 'Manejo de por vida'
    },
    prevention: ['No hay vacuna', 'Mantener en interiores', 'Castrar machos'],
    prognosis: 'guarded',
    is_zoonotic: false,
    references: ['Levy J. FIV Infection. 4th ed.']
  },
  {
    name: 'Peritonitis Infecciosa Felina',
    scientific_name: 'Feline Infectious Peritonitis (FIP)',
    species: 'cat',
    category: 'infectious',
    severity: 'critical',
    description: 'Enfermedad inmunomediada causada por mutación del coronavirus felino.',
    key_signs: ['Líquido abdominal amarillo', 'Fiebre persistente', 'Pérdida de peso', 'Signos neurológicos'],
    diagnosis: {
      clinicalExam: 'Líquido ascítico, fiebre, hepatomegalia.',
      labTests: ['Análisis de líquido: Rivalta positiva', 'PCR', 'Hemograma'],
      imaging: ['Ecografía abdominal'],
      differentialDiagnosis: ['Carcinomatosis', 'Insuficiencia cardíaca']
    },
    treatment: {
      firstLine: ['GS-441524 (antiviral oral) por 84 días', 'Supportivo'],
      secondLine: ['GC376', 'Prednisona'],
      emergency: 'Dificultad respiratoria: toracocentesis.',
      duration: 'Tratamiento GS-441524: 84 días'
    },
    prevention: ['Higiene estricta', 'Reducción de estrés', 'Evitar colonias superpobladas'],
    prognosis: 'poor',
    is_zoonotic: false,
    references: ['Pedersen NC. GS-441524 for FIP. J Feline Med Surg. 2019.']
  },
  {
    name: 'Calicivirus Felino',
    scientific_name: 'Feline Calicivirus (FCV)',
    species: 'cat',
    category: 'infectious',
    severity: 'moderate',
    description: 'Infección viral respiratoria con úlceras orales.',
    key_signs: ['Úlceras en lengua y paladar', 'Secreción nasal', 'Conjuntivitis', 'Fiebre'],
    diagnosis: {
      clinicalExam: 'Úlceras linguales, secreción nasal.',
      labTests: ['PCR en hisopo orofaringeo'],
      imaging: [],
      differentialDiagnosis: ['Herpesvirus', 'Estomatitis']
    },
    treatment: {
      firstLine: ['Fluidoterapia si deshidratación', 'Antibióticos para secundarias', 'Analgesia: Buprenorfina'],
      secondLine: ['Famciclovir'],
      emergency: 'Pneumonia: oxigenoterapia.',
      duration: '7-14 días'
    },
    prevention: ['Vacunación intranasal u oral', 'Aislamiento de enfermos'],
    prognosis: 'good',
    is_zoonotic: false,
    references: ['Radford AD. Feline Calicivirus. 4th ed.']
  },
  {
    name: 'Cardiomiopatía Hipertrófica',
    scientific_name: 'Hypertrophic Cardiomyopathy (HCM)',
    species: 'cat',
    category: 'cardiovascular',
    severity: 'severe',
    description: 'Enfermedad cardíaca más común en gatos. Engrosamiento del miocardio.',
    key_signs: ['Disnea', 'Taquicardia', 'Soplo cardíaco', 'Tromboembolismo'],
    diagnosis: {
      clinicalExam: 'Soplo sistólico, galope.',
      labTests: ['NT-proBNP', 'Troponina I', 'ECG'],
      imaging: ['Ecocardiografía DOPPLER', 'Radiografía torácica'],
      differentialDiagnosis: ['Hipertiroidismo', 'Hipertensión']
    },
    treatment: {
      firstLine: ['Furosemida', 'Atenolol', 'Clopidogrel', 'Oxigenoterapia'],
      secondLine: ['Enalapril', 'Pimobendan'],
      emergency: 'Tromboembolismo: heparina + analgesia.',
      duration: 'Tratamiento de por vida'
    },
    prevention: ['Screening genético', 'Ecocardiografía preventiva'],
    prognosis: 'guarded',
    is_zoonotic: false,
    references: ['ACVIM - Feline Cardiomyopathy Guidelines']
  },
  {
    name: 'Enfermedad Renal Crónica Felina',
    scientific_name: 'Chronic Kidney Disease (CKD) Feline',
    species: 'cat',
    category: 'renal',
    severity: 'moderate',
    description: 'La causa más común de muerte en gatos geriátricos.',
    key_signs: ['Polidipsia', 'Pérdida de peso', 'Pelo deteriorado', 'Vómitos', 'Halitosis urémica'],
    diagnosis: {
      clinicalExam: 'Pérdida de peso, deshidratación.',
      labTests: ['Creatinina elevada', 'SDMA >18', 'UPC >0.4'],
      imaging: ['Ecografía renal'],
      differentialDiagnosis: ['Pielonefritis', 'Amiloidosis']
    },
    treatment: {
      firstLine: ['Dieta renal', 'Fluidoterapia SC', 'EPO si anemia'],
      secondLine: ['Telmisartán', 'Calcitriol'],
      emergency: 'Crisis urémica: fluidoterapia IV.',
      duration: 'Manejo de por vida'
    },
    prevention: ['Hidratación adecuada', 'Dieta de calidad', 'Screening anual >7 años'],
    prognosis: 'guarded',
    is_zoonotic: false,
    references: ['IRIS - CKD in Cats']
  },
  {
    name: 'Hipertiroidismo',
    scientific_name: 'Hyperthyroidism Feline',
    species: 'cat',
    category: 'endocrine',
    severity: 'moderate',
    description: 'Producción excesiva de hormonas tiroideas.',
    key_signs: ['Pérdida de peso con apetito voraz', 'Hiperactividad', 'Taquicardia', 'Masa cervical'],
    diagnosis: {
      clinicalExam: 'Masa cervical, taquicardia.',
      labTests: ['T4 total elevada', 'Hemograma', 'Química'],
      imaging: ['Ecografía tiroidea'],
      differentialDiagnosis: ['Diabetes', 'Insuficiencia renal']
    },
    treatment: {
      firstLine: ['Metimazol 2.5-5 mg PO q12-24h', 'Methimazol tópico'],
      secondLine: ['Yodo radioactivo I-131', 'Cirugía tiroidectomía', 'Dieta y/d'],
      emergency: 'Crisis tirotóxica: β-bloqueantes.',
      duration: 'Metimazol: 1-4 semanas para efecto'
    },
    prevention: ['Screening T4 anual >7 años'],
    prognosis: 'excellent',
    is_zoonotic: false,
    references: ['Peterson ME. Hyperthyroidism in Cats. 8th ed.']
  },
  {
    name: 'Síndrome Urológico Felino',
    scientific_name: 'Feline Lower Urinary Tract Disease (FLUTD)',
    species: 'cat',
    category: 'renal',
    severity: 'severe',
    description: 'Trastornos del tracto urinario inferior.',
    key_signs: ['Esfuerzo para orinar', 'Hematuria', 'Orinar fuera del arenero', 'Anuria'],
    diagnosis: {
      clinicalExam: 'Vejiga dura, dolor abdominal.',
      labTests: ['Análisis de orina', 'Urocultivo', 'Química'],
      imaging: ['Radiografía abdominal', 'Ecografía vesical'],
      differentialDiagnosis: ['Cistitis bacteriana', 'Neoplasia vesical']
    },
    treatment: {
      firstLine: ['Desobstrucción uretral', 'Fluidoterapia IV', 'Dieta urinaria'],
      secondLine: ['Perineostomía', 'Ansiolíticos'],
      emergency: 'OBSTRUCCIÓN URETRAL: EMERGENCIA.',
      duration: 'Dietoterapia de por vida'
    },
    prevention: ['Dieta urinaria húmeda', 'Fuentes de agua', 'Areneros limpios', 'Reducción de estrés'],
    prognosis: 'guarded',
    is_zoonotic: false,
    references: ['WSAVA - FLUTD Guidelines']
  },
  {
    name: 'Dermatofitosis',
    scientific_name: 'Dermatophytosis (Microsporum canis)',
    species: 'cat',
    category: 'dermatological',
    severity: 'mild',
    description: 'Infección fúngica de la piel y pelo. Zoonótica.',
    key_signs: ['Lesiones circulares alopecicas', 'Costras', 'Pérdida de pelo en parches'],
    diagnosis: {
      clinicalExam: 'Lesiones redondeadas.',
      labTests: ['Lámpara Wood', 'KOH', 'Cultivo en DTM'],
      imaging: [],
      differentialDiagnosis: ['Dermatitis alérgica', 'Sarna']
    },
    treatment: {
      firstLine: ['Itraconazol 5 mg/kg', 'Shampoo clorhexidina', 'Desinfección del ambiente'],
      secondLine: ['Terbinafina', 'Micafungina'],
      duration: '6-8 semanas hasta 2 cultivos negativos'
    },
    prevention: ['Aislamiento', 'Desinfección', 'Exámenes regulares'],
    prognosis: 'excellent',
    is_zoonotic: true,
    references: ['Moriello KA. Dermatophytosis in Cats. 4th ed.']
  },
  {
    name: 'Obesidad Felina',
    scientific_name: 'Feline Obesity',
    species: 'cat',
    category: 'nutritional',
    severity: 'moderate',
    description: 'Más del 60% de gatos domésticos están con sobrepeso.',
    key_signs: ['IMC >30%', 'Pérdida de definición de cintura', 'Intolerancia al ejercicio'],
    diagnosis: {
      clinicalExam: 'Evaluación BCS 1-9.',
      labTests: ['Hemograma', 'Glucosa y fructosamina'],
      imaging: [],
      differentialDiagnosis: ['Hipertiroidismo', 'Diabetes']
    },
    treatment: {
      firstLine: ['Dieta -20% calorías', 'Alimentación fraccionada', 'Ejercicio enriquecido'],
      secondLine: ['Dieta metabolic', 'Péptidos de saciedad'],
      emergency: 'Lipidosis hepática si anorexia >48h.',
      duration: 'Programa: 3-6 meses'
    },
    prevention: ['Control de porciones', 'Ejercicio diario', 'Medir peso mensual'],
    prognosis: 'good',
    is_zoonotic: false,
    references: ['German AJ. Obesity in Dogs and Cats. J Nutr. 2006.']
  },
  {
    name: 'Asma Felino',
    scientific_name: 'Feline Asthma',
    species: 'cat',
    category: 'respiratory',
    severity: 'moderate',
    description: 'Enfermedad alérgica de las vías aéreas inferiores.',
    key_signs: ['Tos seca paroxística', 'Disnea expiratoria', 'Respiración abdominal'],
    diagnosis: {
      clinicalExam: 'Sibilancias, crepitantes.',
      labTests: ['Hemograma: eosinofilia', 'Citología BAL: eosinófilos >50%'],
      imaging: ['Radiografía torácica: patrón broncointersticial'],
      differentialDiagnosis: ['Parasitismo pulmonar', 'Insuficiencia cardíaca']
    },
    treatment: {
      firstLine: ['Prednisolona', 'Terbutalina', 'Evitar alérgenos'],
      secondLine: ['Ciclosporina'],
      emergency: 'Broncoespasmo severo: oxigenoterapia + corticoides IV.',
      duration: 'Manejo de por vida'
    },
    prevention: ['Evitar alérgenos', 'Ambiente limpio'],
    prognosis: 'good',
    is_zoonotic: false,
    references: ['Levy LR. Feline Asthma. 8th ed.']
  },
  {
    name: 'Reabsorción Dental Felina',
    scientific_name: 'Feline Odontoclastic Resorptive Lesions (FORL)',
    species: 'cat',
    category: 'dental',
    severity: 'moderate',
    description: 'Destrucción progresiva del diente por odontoclastos.',
    key_signs: ['Dolor oral', 'Babeo', 'Rechazo de alimento seco', 'Fractura dental'],
    diagnosis: {
      clinicalExam: 'Lesiones rosadas en encía.',
      labTests: [],
      imaging: ['Radiografías dentales intraorales'],
      differentialDiagnosis: ['Enfermedad periodontal', 'Neoplasia oral']
    },
    treatment: {
      firstLine: ['Extracción dental completa', 'Analgesia post-operatoria'],
      secondLine: ['Corona dental (Tipo II)'],
      emergency: 'Dolor severo: analgesia multimodal.',
      duration: 'Recuperación: 7-10 días'
    },
    prevention: ['Exámenes dentales anuales', 'Radiografías regulares'],
    prognosis: 'good',
    is_zoonotic: false,
    references: ['Gorrel C. Tooth Resorption. Elsevier; 2013.']
  },
  {
    name: 'Toxoplasmosis',
    scientific_name: 'Toxoplasma gondii',
    species: 'cat',
    category: 'parasitic',
    severity: 'moderate',
    description: 'Parasitosis donde el gato es hospedador definitivo.',
    key_signs: ['Fiebre', 'Pérdida de peso', 'Signos neurológicos', 'Uveítis'],
    diagnosis: {
      clinicalExam: 'Fiebre, mialgias, neurológicos.',
      labTests: ['Serología IgG/IgM', 'PCR', 'Oocistos en heces'],
      imaging: ['MRI craneal si neurológicos'],
      differentialDiagnosis: ['FIP', 'FeLV/FIV']
    },
    treatment: {
      firstLine: ['Clindamicina 12.5-25 mg/kg PO q12h por 2-4 semanas', 'Ponamicina'],
      secondLine: ['Prednisona si uveítis'],
      emergency: 'Encefalitis: antibióticos IV.',
      duration: '2-4 semanas'
    },
    prevention: ['Cocinar carne', 'Limpiar arenero diariamente', 'Lavarse las manos'],
    prognosis: 'good',
    is_zoonotic: true,
    references: ['Dubey JP. Toxoplasmosis in Cats. 4th ed.']
  },
  {
    name: 'Rinotraqueítis Felina',
    scientific_name: 'Feline Herpesvirus-1 (FHV-1)',
    species: 'cat',
    category: 'infectious',
    severity: 'moderate',
    description: 'Infección viral respiratoria causada por herpesvirus.',
    key_signs: ['Estornudos', 'Secreción nasal profusa', 'Conjuntivitis severa', 'Queratitis dendrítica'],
    diagnosis: {
      clinicalExam: 'Conjuntivitis, queratitis, úlceras nasales.',
      labTests: ['PCR en hisopo', 'Citología: células multinucleadas'],
      imaging: [],
      differentialDiagnosis: ['Calicivirus', 'Chlamydia']
    },
    treatment: {
      firstLine: ['Famciclovir 90 mg/kg PO q8-12h', 'Gotas oculares: Cidofovir', 'Nebulización'],
      secondLine: ['L-lisina', 'Interferón'],
      emergency: 'Úlceras corneales profundas: oftalmólogo urgente.',
      duration: 'Signos agudos: 7-14 días'
    },
    prevention: ['Vacunación', 'Higiene en guarderías', 'Reducción de estrés'],
    prognosis: 'good',
    is_zoonotic: false,
    references: ['Thiry E. Feline Herpesvirus. 4th ed.']
  }
];

// ─────────────────────────────────────────────────────────
// Seed Function
// ─────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@vetcloud.local',
      password: 'Admin123!',
    }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data?.access_token || '';
}

async function createDisease(disease: DiseaseData, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/diseases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(disease),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`  ✗ ${disease.name}: ${error}`);
      return false;
    }

    console.log(`  ✓ ${disease.name}`);
    return true;
  } catch (error: any) {
    console.error(`  ✗ ${disease.name}: ${error.message}`);
    return false;
  }
}

async function seed() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   VetCloud Disease Seed Script           ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  console.log('🔐 Authenticating with Directus...');
  let token: string;
  try {
    token = await getToken();
    console.log('✓ Authentication successful');
  } catch (error: any) {
    console.error(`✗ Authentication failed: ${error.message}`);
    console.error('');
    console.error('Make sure Directus is running:');
    console.error('  cd docker && docker compose up -d');
    process.exit(1);
  }

  console.log('');
  console.log('🐕 Seeding dog diseases...');
  let dogCount = 0;
  for (const disease of DOG_DISEASES) {
    if (await createDisease(disease, token)) dogCount++;
  }

  console.log('');
  console.log('🐱 Seeding cat diseases...');
  let catCount = 0;
  for (const disease of CAT_DISEASES) {
    if (await createDisease(disease, token)) catCount++;
  }

  console.log('');
  console.log('════════════════════════════════════════════');
  console.log(`✓ Seed complete!`);
  console.log(`  - Dog diseases: ${dogCount}/${DOG_DISEASES.length}`);
  console.log(`  - Cat diseases: ${catCount}/${CAT_DISEASES.length}`);
  console.log(`  - Total: ${dogCount + catCount}/${DOG_DISEASES.length + CAT_DISEASES.length}`);
  console.log('════════════════════════════════════════════');
}

seed().catch(console.error);
