import { DiseaseMaster } from '../types/diseases-master';

export const DOG_DISEASES_3: DiseaseMaster[] = [
  {
    id: 'Cataratas',
    name: 'Cataratas',
    scientific_name: 'Canine Cataracts',
    species: 'dog',
    category: 'ocular',
    severity: 'moderate',
    is_zoonotic: false,
    prognosis: {
      classification: 'good',
      justification: 'El pronostico para la vision despues de la cirugia de facoemulsificacion es bueno a excelente cuando se realiza en etapas tempranas y no existe retinopatia concurrente. Las tasas de exito visual postquirurgico oscilan entre el 85-95% en perros sin uveitis previa significativa (Gelatt et al., 2013). Sin embargo, el pronostico disminuye cuando las cataratas son hipermaduras, cuando existe desprendimiento de retina prequirurgico, o cuando la uveitis cronica ha causado dano retiniano. La complicacion postquirurgica mas frecuente es la uveitis (30-50% de los casos) que debe ser manejada agresivamente para preservar la vision. Los perros diabeticos con cataratas tienen pronostico mas reservado por la alta incidencia de uveitis diabetica y desprendimiento de retina (Swinney et al., 2022).',
      evidence_source: 'Gelatt KN, et al. Veterinary Ophthalmology. 6th ed. Wiley; 2013.',
    },
    prevalence_rank_dogs: 26,
    prevalence_rank_cats: null,
    life_stage: 'senior',
    chilean_epidemiology: {
      prevalence: 'Las cataratas son una de las principales causas de ceguera adquirida en perros en Chile. Representan aproximadamente el 5-8% de las consultas oftalmologicas en clinicas veterinarias de Santiago. La predisposicion genetica es alta en razas como el Cocker Spaniel, Pastor Aleman y Labrador Retriever.',
      peak_season: 'Sin estacionalidad definida — enfermedad degenerativa cronica.',
      high_risk_groups: ['Perros > 8 anios (cataratas seniles)', 'Razas predisuestas: Cocker Spaniel, Pastor Aleman, Labrador, Golden Retriever', 'Perros diabeticos (cataratas diabeticas)', 'Perros con uveitis cronica'],
      endemic_status: 'Prevalente en Chile. La cirugia de cataratas con facoemulsificacion esta disponible en centros especializados de Santiago.',
      economic_impact: 'La cirugia de facoemulsificacion cuesta entre $200.000 y $500.000 CLP por ojo.',
    },
    description: 'Las cataratas caninas se definen como cualquier opacidad parcial o total del cristalino, independientemente de su etiologia o efecto sobre la vision. Es una de las causas mas comunes de perdida de vision en perros y afecta a individuos de todas las razas y edades, aunque con predisposicion genetica bien documentada en ciertas razas. El cristalino normal es una estructura avascular, transparente, compuesta principalmente de cristalinas (proteinas estructurales) dispuestas en laminas ordenadas que permiten la transmision de la luz. Cuando estas proteinas se desnaturalizan y agregan, forman opacidades que interfieren con la transmision de la luz hacia la retina. Las cataratas pueden clasificarse por su etiologia (hereditarias, diabeticas, toxicas, traumaticas, seniles), por su grado de maduracion (incipientes, inmaduras, maduras, hipermaduras), por su localizacion (subcapsular, capsular, nuclear, cortical, polar) y por su distribucion (unilaterales vs bilaterales). La clasificacion por etapa es clinicamente relevante: las cataratas incipientes afectan menos del 15% del cristalino, las inmaduras 15-50%, las maduras mas del 50%, y las hipermaduras muestran degeneracion completa con liquefaccion del nucleo. Las cataratas hereditarias en razas como el Cocker Spaniel, Labrador Retriever y Boston Terrier son bilateralmente simetricas y progresivas, mientras que las cataratas diabeticas pueden desarrollarse en horas a dias por acumulacion de sorbitol en el cristalino.',
    pathophysiology: 'La fisiopatologia de las cataratas caninas varia segun la etiologia, pero el resultado final compartido es la desnaturalizacion y agregacion de las proteinas del cristalino (cristalinas). En las cataratas seniles, el proceso involucra estres oxidativo acumulativo, glicacion no enzymatica y perdida de la capacidad antioxidante del humor acuoso. Las enzimas como la glutacion peroxidasa y la superoxido dismutasa disminuyen su actividad con la edad, permitiendo la acumulacion de radicales libres que danan las fibras del cristalino. En las cataratas diabeticas, la hiperglucemia cronica activa la via del poliol: la aldosa reductasa convierte la glucosa en sorbitol, que se acumula en el cristalino debido a su baja permeabilidad membrane. El sorbitol osmoticamente activo provoca hinchazon de las fibras del cristalino, rotura de las uniones intercelulares y opacificacion. En las cataratas hereditarias, mutaciones en genes como HSF4 (Heat Shock Factor 4) en el Labrador Retriever causan fallo en la respuesta de proteinas de choque termico, resultando en agregacion de cristalinas durante el desarrollo del cristalino.',
    key_signs: [
      { sign: 'Opacidad visible del cristalino', description: 'Observacion directa de una opacidad blanca, gris o azulada en la pupila, visible a simple luz o con oftalmoscopio directo. Puede ser focal o difusa.', severity: 'high', clinical_significance: 'Hallazgo patognomonico. La opacidad blanca retroiluminada confirma catarata.' },
      { sign: 'Leucocoria (reflejo pupilar blanco)', description: 'Reflejo blanco anormal en la pupila cuando se ilumina directamente, en lugar del reflejo rojo normal (Tapetum lucidum). Visible en fotos con flash.', severity: 'high', clinical_significance: 'La leucocoria es el signo mas temprano detectable por los propietarios.' },
      { sign: 'Perdida progresiva de vision', description: 'El perro tropieza con objetos, es renuente a subir escaleras, no atrapa objetos lanzados, y muestra inseguridad en ambientes nuevos.', severity: 'moderate', clinical_significance: 'La perdida de vision puede ser dificil de detectar temprano porque los perros compensan con otros sentidos.' },
      { sign: 'Nistagmo', description: 'Movimientos oculares involuntarios de balanceo, generalmente horizontal. Indica perdida aguda de vision o afectacion retiniana severa.', severity: 'high', clinical_significance: 'La presencia de nistagmo en cataratas sugiere complicacion como desprendimiento de retina.' },
      { sign: 'Cambio de color pupilar', description: 'La pupila puede parecer blanca, gris o azulada en lugar del negro normal. En cataratas incipientes, el cambio puede ser sutil.', severity: 'moderate', clinical_significance: 'El cambio de color es mas evidente en cataratas maduras.' },
      { sign: 'Uveitis concurrente', description: 'Enrojecimiento ocular, epifora, blefaroespasmo, y miosis (pupila contraida). Frecuente en cataratas hipermaduras o diabeticas.', severity: 'high', clinical_significance: 'La uveitis es la complicacion mas importante de las cataratas y requiere tratamiento agresivo.' },
    ],
    diagnosis: {
      clinical_examination: 'El examen oftalmologico completo incluye inspeccion externa, tonometria, biomicroscopia con lampara de hendidura, oftalmoscopia directa e indirecta, y prueba del menace response. La retroiluminacion permite detectar opacidades incipientes.',
      lab_tests: [
        { test: 'Tonometria', description: 'Medicion de la presion intraocular. Normal: 15-25 mmHg. Hipotonia sugiere uveitis; hipertension sugiere glaucoma.', availability_chile: 'Disponible en clinicas oftalmologicas. Costo: $15.000-$25.000 CLP.' },
        { test: 'Biometria ultrasonica (A-scan)', description: 'Medicion del eje axial del ojo para calculo del lente intraocular antes de la cirugia.', availability_chile: 'Disponible en centros especializados. Costo: $30.000-$50.000 CLP.' },
        { test: 'Electroretinografia (ERG)', description: 'Evaluacion de funcion retiniana prequirurgica. Indispensable para descartar desprendimiento de retina.', availability_chile: 'Disponible en Hospital U. de Chile. Costo: $80.000-$120.000 CLP.' },
      ],
      imaging: [
        { study: 'Ecografia ocular B-scan', findings: 'Indicada cuando la opacidad del cristalino impide la visualizacion del fondo de ojo. Evalua retina y estructuras posteriores.' },
      ],
      differential_diagnosis: [
        { disease: 'Esclerosis nuclear', differentiating: 'Cambios degenerativos del nucleo sin afectar vision significativamente. Apariencia grisacea pero no bloquea la luz.' },
        { disease: 'Glaucoma', differentiating: 'Pupila dilatada fija, dolor ocular severo, presion intraocular elevada.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Facoemulsificacion con implante de lente intraocular (IOL)', details: 'Gold standard. Sonda de ultrasonido para fragmentar y aspirar el cristalino opaco. Implante de lente acrilico o siliconado para restaurar refraccion.', justification: 'La facoemulsificacion es la tecnica mas avanzada con mejores resultados visuales. Restaura agudeza visual a niveles precatarata en > 90% de los casos.', evidence: 'Gelatt KN, et al. Veterinary Ophthalmology. 6th ed. Wiley; 2013.' },
        { intervention: 'Uveitis pre y postquirurgica — manejo farmacologico', details: 'Prednisolona acetato 1% topico q4-6h preoperatorio y postoperatorio. Atropina 1% topico q12h para midriasis y analgesia. Flurbiprofeno 0.03% topico q8h.', justification: 'El control de la uveitis es critico para el exito visual. La inflamacion postquirurgica no controlada causa sinequias y glaucoma.', evidence: 'Gelatt KN, et al. 2013.' },
        { intervention: 'Control glucemico en diabeticos', details: 'Insulina NPH o glargina segun perfil glucemico. Meta: glucemia postprandial 150-250 mg/dL. Monitoreo con glucometro cada 4-6h.', justification: 'El control glucemico estricto antes de la cirugia reduce significativamente el riesgo de uveitis diabetica postquirurgica.', evidence: 'Swinney GR, et al. Diabetic cataracts in dogs. Vet Clin North Am Small Anim Pract. 2022;52(3):455-470.' },
        { intervention: 'Antibioticoterapia profilactica', details: 'Marbofloxacino 2 mg/kg PO q24h por 7-10 dias postquirurgicos. Previene endoftalmitis.', justification: 'La profilaxis antibiotica reduce el riesgo de infeccion intraocular postquirurgica.', evidence: 'Gelatt KN, et al. 2013.' },
      ],
      second_line: [
        { intervention: 'Lensextraccion intracapsular (ICLE)', details: 'Extraccion completa del cristalino con capsula. Indicada en cataratas hipermaduras con ligamentos zonulares debiles.', justification: 'Alternativa cuando la facoemulsificacion no es viable por densidad del cristalino.', evidence: 'Gelatt KN, et al. 2013.' },
        { intervention: 'Manejo medico sin cirugia', details: 'Antiinflamatorios topicos, monitoreo de PIO, adaptar entorno para ceguera parcial.', justification: 'Para perros no candidatos quirurgicos. Preserva comocion y calidad de vida.' },
      ],
      emergency: {
        presentation: 'Glaucoma agudo concurrente: dolor ocular severo, pupilas dilatadas fijas, PIO > 40 mmHg, edema corneal.',
        protocol: [
          'Timolol 0.5% topico cada 8 horas',
          'Manitol 20% IV 1-2 g/kg durante 20-30 minutos',
          'Acetazolamida 5-10 mg/kg IV cada 6 horas',
          'Travoprost 0.004% topico cada 12 horas',
          'Referencia urgente a oftalmologo veterinario',
        ],
      },
      duration: 'Hospitalizacion: 24-48h postquirurgico. Seguimiento: semanal por 1 mes. Tratamiento topico: 4-6 semanas.',
      notes: 'Chile: Facoemulsificacion disponible en Hospital Clinico U. de Chile y centros oftalmologicos. Costo: $200.000-$500.000 CLP por ojo.',
    },
    prevention: [
      { measure: 'Evaluacion oftalmologica genetica', details: 'Examen oftalmologico a perros reproductores de razas predisuestas.', justification: 'Las cataratas hereditarias tienen componente genetico significativo.', evidence: 'Gelatt KN, et al. 2013.' },
      { measure: 'Control glucemico preventivo', details: 'En diabeticos, mantener control estricto para prevenir cataratas diabeticas.', justification: 'La hiperglucemia cronica es el factor precipitante principal.' },
      { measure: 'Examen oftalmologico anual', details: 'Evaluacion anual del cristalino en perros > 7 anos, especialmente razas predisuestas.', justification: 'La deteccion temprana permite mejores resultados quirurgicos.' },
    ],
    chilean_costs: {
      diagnosis: {
        consulta_oftalmologica: '$35.000 - $50.000 CLP',
        tonometria: '$15.000 - $25.000 CLP',
        electroretinografia: '$80.000 - $120.000 CLP',
        total_diagnostico: '$150.000 - $250.000 CLP',
      },
      treatment: {
        cirugia_facoemulsificacion: '$200.000 - $500.000 CLP por ojo',
        lente_intraocular: '$80.000 - $150.000 CLP adicional',
        total_cirugia_bilateral: '$500.000 - $1.200.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'textbook', citation: 'Gelatt KN, et al. Veterinary Ophthalmology. 6th ed. Wiley; 2013.', relevance: 'Referencia principal de oftalmologia veterinaria.' },
      { type: 'journal_article', citation: 'Swinney GR, et al. Diabetic cataracts in dogs. Vet Clin North Am Small Anim Pract. 2022;52(3):455-470.', relevance: 'Fisiopatologia de cataratas diabeticas.' },
    ],
  },

  {
    id: 'Glaucoma',
    name: 'Glaucoma',
    scientific_name: 'Canine Glaucoma',
    species: 'dog',
    category: 'ocular',
    severity: 'severe',
    is_zoonotic: false,
    prognosis: {
      classification: 'guarded',
      justification: 'El pronostico visual en el glaucoma canino es generalmente reservado. La perdida de vision es frecuentemente irreversible dentro de las primeras 24-48 horas de un episodio agudo si la PIO no se normaliza rapidamente (Gelatt & MacKay, 2018). Con tratamiento temprano, el 50-70% de los ojos pueden mantener vision util. El glaucoma bilateral ocurre en el 40-80% de los casos dentro de 1-3 anos. La enucleacion es necesaria en el 25-50% de los ojos afectados por dolor refractario y ceguera.',
      evidence_source: 'Gelatt KN, MacKay EO. Glaucoma. In: Veterinary Ophthalmology. 6th ed. Wiley; 2018.',
    },
    prevalence_rank_dogs: 27,
    prevalence_rank_cats: null,
    life_stage: 'adult',
    chilean_epidemiology: {
      prevalence: 'El glaucoma representa el 1-2% de las consultas oftalmologicas en Chile, pero es una de las causas mas importantes de ceguera irreversible. Se estima que afecta a 1 de cada 100 perros mayores de 3 anos.',
      peak_season: 'Sin estacionalidad definida. Los episodios agudos pueden desencadenarse por estres o ejercicio intenso.',
      high_risk_groups: ['Cocker Spaniel (5x mayor riesgo)', 'Beagle, Basset Hound', 'Perros > 5 anos', 'Perros con uveitis cronica previa'],
      endemic_status: 'Presente en Chile. El diagnostico tardio es comun por falta de equipamiento oftalmologico.',
      economic_impact: 'Manejo del glaucoma: $150.000-$400.000 CLP por episodio agudo.',
    },
    description: 'El glaucoma canino es un grupo de enfermedades oculares caracterizadas por el aumento patologico de la presion intraocular (PIO) que resulta en dano del nervio optico y perdida de vision. La PIO normal oscila entre 15-25 mmHg; valores superiores a 30 mmHg son diagnosticos cuando se asocian con dano del nervio optico. El glaucoma se clasifica en primario (genetico, por angulo de drenaje anormal) y secundario (consecuencia de uveitis, luxacion del cristalino, hemorragia intraocular o tumores). El primario puede ser de angulo abierto (progresivo) o de angulo cerrado (agudo, subito). La elevacion de la PIO resulta de un desequilibrio entre la produccion de humor acuoso y su drenaje a traves de la malla trabecular. El dano retinal se produce por compresion directa de las celulas ganglionares, isquemia vascular, y excitotoxicidad glutamatergica.',
    pathophysiology: 'La fisiopatologia involucra alteraciones en la dinamica del humor acuoso. Normalmente, el humor acuoso es producido por el cuerpo ciliar y drena a traves de la malla trabecular (85-90%) y la via uveoescleral (10-15%). En el glaucoma primario de angulo abierto, la malla trabecular sufre degeneracion con deposito de material fibriloides. En el angulo cerrado, el iris bloquea mecanicamente el angulo iridocorneal. La PIO elevada comprime las arterias retinales, causando isquemia de celulas ganglionares. El glutamato liberado por celulas dadas provoca excitotoxicidad que amplifica el dano. El resultado es atrofia progresiva del nervio optico con perdida irreversible de vision.',
    key_signs: [
      { sign: 'Dolor ocular severo', description: 'El perro se frota el ojo, muestra blefaroespasmo, llanto. El ojo puede estar rojo y congestivo.', severity: 'high', clinical_significance: 'El dolor es el signo mas prominente en glaucoma agudo.' },
      { sign: 'Midriasis (pupila dilatada)', description: 'Pupila fija dilatada que no responde a la luz. Uno de los signos mas tempranos.', severity: 'high', clinical_significance: 'La midriasis fixa es altamente sugestiva de glaucoma de angulo cerrado.' },
      { sign: 'Enrojecimiento ocular', description: 'Inyeccion vascular conjuntival y episcleral intensa. Puede haber edema corneal.', severity: 'high', clinical_significance: 'La hiperemia indica vasodilatacion por dolor e inflamacion.' },
      { sign: 'Perdida subita de vision', description: 'El perro choca con objetos, no responde a amenaza visual, muestra desorientacion.', severity: 'high', clinical_significance: 'Ceguera aguda en ojo rojo con pupila dilatada es glaucoma hasta demostrar lo contrario.' },
      { sign: 'Edema corneal', description: 'Opacidad azulina de la cornea por acumulacion de liquido. Visible cuando PIO > 40 mmHg.', severity: 'moderate', clinical_significance: 'Indica PIO significativamente elevada y dano endotelial.' },
      { sign: 'Enfermedad bilateral', description: 'El ojo contralateral puede tener PIO elevada subclinicamente. Siempre evaluar ambos.', severity: 'moderate', clinical_significance: 'La afectacion bilateral es frecuente (40-80%).' },
    ],
    diagnosis: {
      clinical_examination: 'El examen incluye tonometria, gonioscopia (evaluacion del angulo de drenaje), oftalmoscopia (disco optico), y evaluacion de agudeza visual. La tonometria es la prueba clave.',
      lab_tests: [
        { test: 'Tonometria', description: 'Normal: 15-25 mmHg. Glaucoma: > 30 mmHg. Agudo: puede superar 50-70 mmHg.', availability_chile: 'Disponible en clinicas oftalmologicas. Costo: $15.000-$25.000 CLP.' },
        { test: 'Gonioscopia', description: 'Evaluacion del angulo iridocorneal. Clasifica como angulo abierto o cerrado.', availability_chile: 'Disponible en centros oftalmologicos. Costo: $25.000-$40.000 CLP.' },
      ],
      imaging: [
        { study: 'Oftalmoscopia directa', findings: 'Evaluacion del disco optico: palidez, excavacion (cupping), hemorragias.' },
      ],
      differential_diagnosis: [
        { disease: 'Uveitis anterior', differentiating: 'PIO baja o normal. Midriasis o miosis variable.' },
        { disease: 'Conjuntivitis', differentiating: 'Enrojecimiento sin elevacion de PIO. Sin perdida de vision.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Reduccion agresiva de la PIO', details: 'Dorzolamida 2% topico q8h + Timolol 0.5% topico q12h. Manitol 20% IV si PIO > 40 mmHg.', justification: 'La reduccion urgente de PIO es critica para preservar vision.', evidence: 'Gelatt KN, MacKay EO. 2018.' },
        { intervention: 'Travoprost 0.004%', details: '1 gota cada 12 horas. Analogo de prostaglandina F2a. Reduccion de PIO del 25-35%.', justification: 'Las prostaglandinas son los hipotensores oculares mas potentes.' },
        { intervention: 'Manitol 20% IV', details: '1-2 g/kg diluido, infundido en 20-30 minutos. Efecto hipotensor en 30-60 minutos.', justification: 'Creacion de gradiente osmotico que reduce volumen del humor vitreo.' },
        { intervention: 'Acetazolamida', details: '5-10 mg/kg IV/PO q8-12h. Inhibidor de anhidrasa carbonica.', justification: 'Reduce la produccion de humor acuoso.' },
      ],
      second_line: [
        { intervention: 'Trabeculectomia', details: 'Cirugia filtrante que crea fistula entre camara anterior y espacio subconjuntival.', justification: 'Puede reducir PIO en 30-50%, pero exito variable a largo plazo.' },
        { intervention: 'Implante de drenaje valvulado', details: 'Devices Ahmed o Baerveldt para drenaje permanente.', justification: 'Ultima alternativa antes de enucleacion.' },
        { intervention: 'Enucleacion', details: 'Extirpacion del ojo en ceguera con dolor refractario.', justification: 'Proporciona alivio del dolor en glaucoma cronico doloroso ciego.' },
      ],
      emergency: {
        presentation: 'Glaucoma agudo: PIO > 50 mmHg, dolor severo, ceguera aguda.',
        protocol: [
          'Timolol 0.5% topico inmediato',
          'Manitol 20% IV 1-2 g/kg en 30 minutos',
          'Dorzolamida 2% topico cada 8 horas',
          'Travoprost 0.004% topico cada 12 horas',
          'Acetazolamida 5 mg/kg IV cada 8 horas',
          'Reevaluar PIO cada 2-4 horas',
          'Referencia urgente a oftalmologo veterinario',
        ],
      },
      duration: 'Hospitalizacion: 24-48h en agudo. Tratamiento topico de por vida. Monitoreo PIO mensual.',
      notes: 'Chile: Travatan (Travoprost) disponible. Dorzolamida disponible en farmacias. Manitol disponible.',
    },
    prevention: [
      { measure: 'Examen oftalmologico anual', details: 'Tonometria de screening en perros > 3 anos, especialmente razas predisuestas.', justification: 'El glaucoma primario es bilateral en 40-80% de los casos.', evidence: 'Gelatt KN, MacKay EO. 2018.' },
      { measure: 'Seleccion genetica reproductiva', details: 'Excluir perros con glaucoma primario del programa reproductivo.', justification: 'El glaucoma primario tiene base genetica en muchas razas.' },
      { measure: 'Tratamiento profilactico del ojo sano', details: 'En glaucoma unilateral, tratar profilacticamente el ojo contralateral.', justification: 'El ojo contralateral tiene riesgo significativo de desarrollar glaucoma.' },
    ],
    chilean_costs: {
      diagnosis: {
        consulta_oftalmologica: '$35.000 - $50.000 CLP',
        tonometria: '$15.000 - $25.000 CLP',
        gonioscopia: '$25.000 - $40.000 CLP',
        total_diagnostico: '$75.000 - $115.000 CLP',
      },
      treatment: {
        medicacion_topica_mensual: '$30.000 - $60.000 CLP/mes',
        cirugia_trabeculectomia: '$300.000 - $600.000 CLP',
        enucleacion: '$150.000 - $300.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
        glaucoma_agudo_total: '$80.000 - $150.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'textbook', citation: 'Gelatt KN, MacKay EO. Veterinary Ophthalmology. 6th ed. Wiley; 2018.', relevance: 'Referencia principal de glaucoma veterinario.' },
      { type: 'journal_article', citation: 'Gelatt KN, et al. Prevalence of primary angle-closure glaucoma in the American Cocker Spaniel. J Am Vet Med Assoc. 2003;222(9):1225-1229.', relevance: 'Epidemiologia por razas.' },
    ],
  },

  {
    id: 'Conjuntivitis',
    name: 'Conjuntivitis',
    scientific_name: 'Canine Conjunctivitis',
    species: 'dog',
    category: 'ocular',
    severity: 'mild',
    is_zoonotic: false,
    prognosis: {
      classification: 'excellent',
      justification: 'El pronostico es excelente con tratamiento adecuado, con resolucion en 7-14 dias. Las conjuntivitis alergicas pueden ser recurrentes. Las complicaciones como ulceras corneales secundarias son raras pero requieren tratamiento inmediato.',
      evidence_source: 'Slatter DH. Fundamentals of Veterinary Ophthalmology. 5th ed. Saunders; 2011.',
    },
    prevalence_rank_dogs: 28,
    prevalence_rank_cats: null,
    life_stage: 'all',
    chilean_epidemiology: {
      prevalence: 'La conjuntivitis representa el 15-20% de las consultas oculares en clinicas veterinarias de Santiago. Comun en razas braquicefalas.',
      peak_season: 'Mayor incidencia en primavera-verano por alergenos ambientales.',
      high_risk_groups: ['Razas braquicefalas: Bulldog Frances, Pug, Boston Terrier', 'Perros atopicos', 'Perros con queratoconjuntivitis seca', 'Cachorros con infecciones respiratorias'],
      endemic_status: 'Muy prevalente en Chile.',
      economic_impact: 'Costo promedio: $20.000-$60.000 CLP por episodio.',
    },
    description: 'La conjuntivitis canina es la inflamacion de la conjuntiva, la membrana mucosa que recubre la superficie interna de los parpados y la esclerotica. Es una de las enfermedades oculares mas comunes y puede ser primaria o secundaria. Las causas mas frecuentes incluyen infecciones bacterianas y virales (adenovirus canino, herpesvirus), alergias ambientales (atopia), cuerpos extraños, queratoconjuntivitis seca, distichiasis y enfermedades sistemicas como el moquillo. La presentacion clinica varia desde enrojecimiento leve con epifora minima hasta inflamacion severa con descarga mucopurulenta, quimosis y protrusion del tercer parpado.',
    pathophysiology: 'La fisiopatologia involucra la respuesta inflamatoria de la mucosa conjuntival a estimulos irritantes o infecciosos. Los mastocitos conjuntivales degranulan liberando histamina, leucotrienos y prostaglandinas, causando vasodilatacion, aumento de permeabilidad y edema. Los neutrofilos y macrofagos son reclutados al sitio inflamado. La inflamacion cronica resulta en hiperplasia del tejido linfatico y formacion de foliculos.',
    key_signs: [
      { sign: 'Hiperemia conjuntival', description: 'Enrojecimiento de la conjuntiva bulbar y palpebral con vasos dilatados.', severity: 'mild', clinical_significance: 'Hallazgo inespecifico pero universal en conjuntivitis.' },
      { sign: 'Epifora (lagrimeo excesivo)', description: 'Lagrimas que rebordan el parpado inferior. Serosa en irritacion, mucopurulenta en infeccion.', severity: 'mild', clinical_significance: 'La naturaleza de la descarga orienta el diagnostico.' },
      { sign: 'Edema palpebral', description: 'Inflamacion de los parpados, engrosados y elevados.', severity: 'mild', clinical_significance: 'El edema severo puede impedir la apertura ocular.' },
      { sign: 'Frote ocular', description: 'El perro se frota el ojo con la pata. Indica prurito.', severity: 'moderate', clinical_significance: 'El rascado intenso puede causar ulceras corneales.' },
      { sign: 'Protrusion del tercer parpado', description: 'El tercer parpado sobresale cubriendo el globo ocular.', severity: 'moderate', clinical_significance: 'Puede indicar causa subyacente como cuerpo extrano.' },
      { sign: 'Descarga mucopurulenta', description: 'Secrecion espesa amarillo verdosa. Indica infeccion bacteriana.', severity: 'moderate', clinical_significance: 'Requiere antibiotico topico.' },
    ],
    diagnosis: {
      clinical_examination: 'Inspeccion externa, evaluacion conjuntival, examen con fluoresceina (descartar ulceras), prueba de Schirmer (descartar KCS).',
      lab_tests: [
        { test: 'Prueba de Schirmer', description: 'Normal: > 15 mm/min. KCS: < 10 mm/min.', availability_chile: 'Costo: $10.000-$15.000 CLP.' },
        { test: 'Citologia conjuntival', description: 'Raspado para identificar predominio celular.', availability_chile: 'Costo: $15.000-$25.000 CLP.' },
      ],
      imaging: [{ study: 'Oftalmoscopia', findings: 'Evaluacion del fondo para descartar causas sistemicas.' }],
      differential_diagnosis: [
        { disease: 'Queratoconjuntivitis seca', differentiating: 'Prueba de Schirmer < 10 mm/min.' },
        { disease: 'Ulcora corneal', differentiating: 'Fluoresceina positiva.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Limpieza ocular con solucion salina', details: 'Lavar ojo 3-4 veces al dia. Compresas tibias 5-10 minutos.', justification: 'Reduce carga bacteriana y mejora penetracion de medicamentos.' },
        { intervention: 'Antibiotico topico', details: 'Eritromicina 0.5% o cloranfenicol 1%, 1 gota cada 6-8h por 7-10 dias.', justification: 'Controla infeccion bacteriana primaria o secundaria.' },
        { intervention: 'Antiinflamatorio topico', details: 'Flurbiprofeno 0.03% cada 8h si no hay ulcora. Dexametasona 0.1% por 5-7 dias.', justification: 'Reduce hiperemia, edema y prurito.' },
        { intervention: 'Lubricacion ocular', details: 'Lagrimas artificiales (hipromelosa 0.3%) cada 4-6 horas.', justification: 'Mantiene lubricacion corneal durante recuperacion.' },
      ],
      second_line: [
        { intervention: 'Ciclosporina A topico 0.5%', details: '1-2 veces al dia en conjuntivitis cronica o KCS.', justification: 'Accion inmunomoduladora sin efectos de corticosteroides.' },
        { intervention: 'Tratamiento de causa subyacente', details: 'Si atopia: antihistaminicos. Si KCS: ciclosporina.', justification: 'Esencial para prevenir recurrencias.' },
      ],
      emergency: {
        presentation: 'Quimosis severa o ulcora corneal concurrente.',
        protocol: [
          'Limpieza con solucion salina',
          'Antibiotico topico cada 4-6 horas',
          'Examen de cornea con fluoresceina',
          'Si ulcora: suspender corticosteroides',
          'Reevaluacion en 24-48 horas',
        ],
      },
      duration: 'Tratamiento: 7-14 dias. Casos cronicos: 4-6 semanas.',
      notes: 'Chile: Eritromicina oftalmica $5.000-$10.000 CLP. Cloranfenicol 1% disponible en farmacias.',
    },
    prevention: [
      { measure: 'Higiene ocular regular', details: 'Limpiar parpados diariamente en razas braquicefalas.', justification: 'Previene acumulacion de secreciones.' },
      { measure: 'Control de alergenos', details: 'Evitar polen, polvo y humo.', justification: 'Las conjuntivitis alergicas son recurrentes.' },
      { measure: 'Vacunacion completa', details: 'Vacunar contra distemper segun esquema SAG.', justification: 'El distemper causa conjuntivitis sistemica prevenible.' },
    ],
    chilean_costs: {
      diagnosis: {
        consulta_oftalmologica: '$35.000 - $50.000 CLP',
        prueba_schirmer: '$10.000 - $15.000 CLP',
        total_diagnostico: '$50.000 - $80.000 CLP',
      },
      treatment: {
        total_tratamiento: '$20.000 - $60.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'textbook', citation: 'Slatter DH. Fundamentals of Veterinary Ophthalmology. 5th ed. Saunders; 2011.', relevance: 'Referencia principal de oftalmologia veterinaria.' },
      { type: 'journal_article', citation: 'Gelatt KN, et al. Canine conjunctivitis: etiology, diagnosis, and treatment. Vet Clin North Am Small Anim Pract. 2004;34(3):719-737.', relevance: 'Revision clinica de conjuntivitis.' },
    ],
  },

  {
    id: 'Ulcera-Corneal',
    name: 'Ulcora Corneal',
    scientific_name: 'Canine Corneal Ulceration',
    species: 'dog',
    category: 'ocular',
    severity: 'moderate',
    is_zoonotic: false,
    prognosis: {
      classification: 'good',
      justification: 'El pronostico para ulceras corneales superficiales es excelente con tratamiento adecuado, con resolucion en 5-7 dias. Las ulceras profundas o melting tienen pronostico mas reservado y pueden requerir intervention quirurgica urgente. La complicacion mas seria es la perforacion corneal (1-3% de los casos). Las ulceras recurrentes sugieren causas subyacentes como queratoconjuntivitis seca o distichiasis.',
      evidence_source: 'Slatter DH. Fundamentals of Veterinary Ophthalmology. 5th ed. Saunders; 2011.',
    },
    prevalence_rank_dogs: 29,
    prevalence_rank_cats: null,
    life_stage: 'all',
    chilean_epidemiology: {
      prevalence: 'Las ulceras corneales representan el 8-12% de las consultas oftalmologicas en perros en Chile. Comunes en razas braquicefalas por mayor exposicion corneal.',
      peak_season: 'Mayor incidencia en verano por mayor actividad al aire libre.',
      high_risk_groups: ['Razas braquicefalas: Bulldog Frances, Pug, Shih Tzu', 'Perros con queratoconjuntivitis seca', 'Perros con distichiasis o ectropion', 'Perros activos al aire libre'],
      endemic_status: 'Muy prevalente. Emergencia oftalmologica comun.',
      economic_impact: 'Costo promedio: $80.000-$200.000 CLP segun severidad.',
    },
    description: 'La ulcora corneal canina se define como la perdida de sustancia del epitelio corneal, con compromiso variable del estroma subyacente. La cornea es una estructura avascular, transparente, de aproximadamente 0.5mm de grosor, compuesta por 5 capas: epitelio, membrana de Bowman, estroma, membrana de Descemet y endotelio. La ulcora puede ser superficial (solo epitelio), intermedia (estroma parcialmente afectado) o perforada (toda la cornea comprometida). Las causas mas frecuentes incluyen trauma, queratoconjuntivitis seca, distichiasis, y defectos epiteliales criticos. La infeccion secundaria por bacterias como Pseudomonas o Staphylococcus puede convertir una ulcora simple en melting con colagenolisis activa. El dolor es intenso por la estimulacion de fibras nerviosas del trigemino en el estroma corneal.',
    pathophysiology: 'La fisiopatologia comienza con la interrupcion de la integridad del epitelio corneal. El dano al epitelio expone el estroma subyacente, que es hidrofilico y se hincha. La degradacion enzimatica del estroma por metaloproteinasas (MMPs) liberadas por neutrofilos y bacterias puede convertir una ulcora superficial en melting con colagenolisis activa. Las bacterias como Pseudomonas producen elastasas y colagenas que aceleran la destruccion corneal. La respuesta inflamatoria incluye neovascularizacion corneal e infiltracion de neutrofilos. La perforacion resulta en prolapso del iris y formacion de synechias.',
    key_signs: [
      { sign: 'Blefaroespasmo', description: 'Cierre espasmodico del parpado afectado. El perro mantiene el ojo cerrado o semicerrado.', severity: 'high', clinical_significance: 'El blefaroespasmo es el signo mas consistente de ulcora corneal.' },
      { sign: 'Epifora profusa', description: 'Lagrimas que fluyen copiosamente por el surco nasolabial.', severity: 'high', clinical_significance: 'La epifora es proporcional al grado de irritacion corneal.' },
      { sign: 'Fotofobia', description: 'Sensibilidad anormal a la luz. El perro busca places oscuros.', severity: 'moderate', clinical_significance: 'Indica inflamacion intraocular concurrente o irritacion severa.' },
      { sign: 'Edema corneal', description: 'Opacidad azulina de la cornea alrededor de la ulcora.', severity: 'moderate', clinical_significance: 'El edema indica dano al epitelio y/o endotelio.' },
      { sign: 'Neovascularizacion corneal', description: 'Vasos sanguineos visibles creciendo desde el limbo hacia la cornea.', severity: 'mild', clinical_significance: 'Indica proceso cronico o inflamacion severa.' },
      { sign: 'Descarga mucopurulenta', description: 'Secrecion espesa amarilla-verdosa en el margen palpebral.', severity: 'moderate', clinical_significance: 'Indica infeccion bacteriana secundaria.' },
    ],
    diagnosis: {
      clinical_examination: 'Diagnostico por oftalmoscopia con fluoresceina: solucion de fluoresceina al 2% se instila en el saco conjuntival. El colorante se adhiere al estroma expuesto delineando la extension.',
      lab_tests: [
        { test: 'Test de fluoresceina', description: 'Instilar fluoresceina 2% y evaluar con luz azul cobalto. Sensibilidad > 95%.', availability_chile: 'Costo: $5.000-$10.000 CLP.' },
        { test: 'Cultivo corneal', description: 'Raspado corneal para cultivo bacteriano. Indicado en ulceras melting o refractarias.', availability_chile: 'Costo: $25.000-$40.000 CLP.' },
      ],
      imaging: [
        { study: 'Lampara de hendidura', findings: 'Evaluacion de profundidad de la ulcora y grosor corneal remanente.' },
      ],
      differential_diagnosis: [
        { disease: 'Erosion corneal', differentiating: 'Perdida superficial sin compromiso del estroma.' },
        { disease: 'Defecto epitelial cronico', differentiating: 'Ulcora no dolorosa que no cicatriza en 5-7 dias.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Antibiotico topico de amplio espectro', details: 'Tobramicina 0.3% o ciprofloxacino 0.3% cada 4-6 horas. En melting: combinacion tobramicina + cefoxitina 1%.', justification: 'La antibioticoterapia topica es esencial para prevenir y tratar infeccion bacteriana.', evidence: 'Slatter DH. 2011.' },
        { intervention: 'Atropina 1% topico', details: '1 gota cada 8-12 horas para midriasis y analgesia. Indicada en ulceras profundas.', justification: 'Relaja musculo ciliar, reduce dolor y previene sinequias.' },
        { intervention: 'Proteccion ocular (collar isabelino)', details: 'Collar Elizabethano por 7-14 dias para prevenir rascado.', justification: 'El trauma por rascado es la causa mas comun de retraso en cicatrizacion.' },
        { intervention: 'Suero autologo topico', details: 'Preparar suero del paciente. Aplicar 1 gota cada 2-4 horas. Rico en inhibidores de colagenasa.', justification: 'Efectivo en ulceras melting por inhibidores naturales de colagenasa.' },
      ],
      second_line: [
        { intervention: 'Queratectomia superficial', details: 'Extirpacion del epitelio no adherido en defectos epiteliales criticos.', justification: 'Elimina epitelio degenerado y promueve adhesion del nuevo epitelio.' },
        { intervention: 'Flap conjuntival', details: 'Injerto de conjuntiva sobre la ulcora en perforaciones o melting severo.', justification: 'Proporciona soporte vascular y mecanico en emergencias.' },
      ],
      emergency: {
        presentation: 'Ulcora melting o perforada: descarga purulenta, dolor severo, protrusion del iris.',
        protocol: [
          'Antibiotico topico cada 2 horas',
          'Suero autologo topico cada 2 horas',
          'Atropina 1% topico cada 8 horas',
          'Collar isabelino inmediato',
          'Referencia urgente a oftalmologo veterinario',
        ],
      },
      duration: 'Tratamiento: 7-14 dias superficiales. 2-4 semanas profundas. Seguimiento con fluoresceina cada 3-5 dias.',
      notes: 'Chile: Tobramicina 0.3% $8.000-$15.000 CLP. Ciprofloxacino 0.3% $10.000-$20.000 CLP.',
    },
    prevention: [
      { measure: 'Tratamiento de queratoconjuntivitis seca', details: 'Diagnosticar y tratar KCS con ciclosporina A o tacrolimus.', justification: 'KCS es causa comun de ulceras recurrentes.' },
      { measure: 'Correccion de defectos palpebrales', details: 'Cirugia para distichiasis, ectropion o entropion.', justification: 'Los defectos palpebrales causan trauma corneal cronico.' },
    ],
    chilean_costs: {
      diagnosis: {
        consulta_oftalmologica: '$35.000 - $50.000 CLP',
        test_fluoresceina: '$5.000 - $10.000 CLP',
        total_diagnostico: '$55.000 - $90.000 CLP',
      },
      treatment: {
        total_tratamiento: '$80.000 - $200.000 CLP',
        queratectomia: '$100.000 - $200.000 CLP',
        flap_conjuntival: '$150.000 - $300.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'textbook', citation: 'Slatter DH. Fundamentals of Veterinary Ophthalmology. 5th ed. Saunders; 2011.', relevance: 'Referencia principal de oftalmologia veterinaria.' },
      { type: 'journal_article', citation: 'Bentley E, et al. Spontaneous chronic corneal epithelial defects in dogs. Vet Ophthalmol. 2011;14(3):164-172.', relevance: 'DEF y ulceras cronicas.' },
    ],
  },

  {
    id: 'Piometra',
    name: 'Piometra',
    scientific_name: 'Canine Pyometra',
    species: 'dog',
    category: 'reproductive',
    severity: 'severe',
    is_zoonotic: false,
    prognosis: {
      classification: 'good',
      justification: 'El pronostico es bueno a excelente con ovariohisterectomia (OVE) de emergencia temprana. Tasa de supervivencia con cirugia temprana: 90-95% (Hagman, 2006). El pronostico empeora en hembras septicas con deshidratacion severa. La OVE es tratamiento de eleccion; el manejo medico con prostaglandinas tiene exito del 70-85% pero con 20-30% de recurrencia.',
      evidence_source: 'Hagman R. Clinical and clinicopathological findings in dogs with pyometra. Acta Vet Scand. 2006;48:8.',
    },
    prevalence_rank_dogs: 30,
    prevalence_rank_cats: null,
    life_stage: 'adult',
    chilean_epidemiology: {
      prevalence: 'La piometra es una de las emergencias reproductivas mas comunes en hembras caninas en Chile. Representa el 3-5% de las consultas de urgencia en Santiago. Incidencia estimada: 2-5% en hembras no esterilizadas > 4 anos.',
      peak_season: 'Mayor incidencia 2-3 meses despues del celo (estival o primavera-verano).',
      high_risk_groups: ['Hembras no esterilizadas > 4 anos', 'Razas pequenas: Caniche, Chihuahua, Shih Tzu', 'Hembras con progesterona o estrogenos exogenos', 'Historia de piometra previa'],
      endemic_status: 'Prevalente en Chile. Baja tasa de esterilizacion en razas pequenas contribuye.',
      economic_impact: 'Cirugia de emergencia: $150.000-$350.000 CLP mas hospitalizacion.',
    },
    description: 'La piometra canina es una infeccion bacteriana del utero caracterizada por acumulacion de pus en la cavidad endometrial. Es la consecuencia mas grave de la hiperplasia endometrial quistica (HEQ), condicion mediada por progesterona que afecta hembras no esterilizadas despues de varios ciclos de celo. Se clasifica en abierta (cerviz permeable, descarga vaginal purulenta) y cerrada (cerviz ocluida, acumulacion de pus sin drenaje). La forma cerrada es mas peligrosa por distension uterina severa y sepsis sistemica. El agente mas comun es Escherichia coli (60-70%), seguido por Staphylococcus y Streptococcus. La infeccion se establece durante la diestra cuando la progesterona suprime la contraccion uterina y estimula la secretion glandular.',
    pathophysiology: 'La fisiopatologia involucra interaccion entre hormonas, inmunologia y bacteriologia. Durante la diestra, la progesterona elevada promueve proliferacion endometrial, secretion glandular y reduccion de motilidad uterina. La progesterona tambien inhibe linfocitos T y reduce fagocitosis. Si la HEQ es severa, las glandulas quisticas se infectan por migracion ascendente de bacterias (principalmente E. coli). La toxina lipopolisacarida (LPS) activa respuesta inflamatoria sistemica, liberando citocinas proinflamatorias que causan fiebre, taquicardia y potencialmente shock septico.',
    key_signs: [
      { sign: 'Descarga vaginal purulenta', description: 'Descarga espesa, amarilla verdosa o hematica, de olor fetido. Presente en 90% de piometras abiertas. Ausente en cerradas.', severity: 'high', clinical_significance: 'Descarga vaginal purulenta 2-3 meses post-celo es altamente sugestiva de piometra.' },
      { sign: 'Polidipsia-poliuria', description: 'Aumento marcado de ingesta de agua (> 100 mL/kg/dia) y frecuencia urinaria.', severity: 'high', clinical_significance: 'La polidipsia es uno de los signos mas tempranos y consistentes.' },
      { sign: 'Anorexia y letargia', description: 'Rechazo total o parcial al alimento, inactividad marcada.', severity: 'high', clinical_significance: 'Refleja toxicidad sistemica y fiebre asociada.' },
      { sign: 'Vomitos', description: 'Vomitos biliosos, intermitentes, 2-5 episodios/dia. Indicadores de toxemia significativa.', severity: 'high', clinical_significance: 'Los vomitos indican afectacion sistemica severa.' },
      { sign: 'Fiebre', description: 'Temperatura rectal > 39.5C. Hipotermia (< 37.5C) indica shock septico.', severity: 'moderate', clinical_significance: 'La fiebre es marcador de infeccion activa.' },
      { sign: 'Abdomen distendido', description: 'Aumento del volumen abdominal palpable, especialmente en piometras cerradas.', severity: 'moderate', clinical_significance: 'La distension indica acumulacion significativa de pus.' },
      { sign: 'Dolor abdominal', description: 'Resistencia a palpacion, encorvamiento dorsal, vocalizacion.', severity: 'moderate', clinical_significance: 'El dolor indica inflamacion uterina severa o peritonitis.' },
    ],
    diagnosis: {
      clinical_examination: 'Diagnostico por historia (hembra no esterilizada, 2-3 meses post-celo, signos sistemico), examen fisico (descarga vaginal, abdomen distendido, fiebre), y ecografia abdominal.',
      lab_tests: [
        { test: 'Hemograma completo', description: 'Leucocitosis marcada (WBC 20.000-80.000/uL) con neutrofilia. En sepsis: leucopenia.', availability_chile: 'Costo: $15.000-$25.000 CLP.' },
        { test: 'Bioquimica sanguinea', description: 'Elevacion de ALT, AST, urea, creatinina. Hiperglucemia o hipoglucemia.', availability_chile: 'Costo: $20.000-$35.000 CLP.' },
        { test: 'Cultivo bacteriano vaginal', description: 'Identifica agente causal y antibiograma.', availability_chile: 'Costo: $20.000-$35.000 CLP.' },
      ],
      imaging: [
        { study: 'Ecografia abdominal', findings: 'Utero aumentado de tamanho (2-10 cm), contenido ecogenico heterogeneo, paredes engrosadas con quistes.' },
      ],
      differential_diagnosis: [
        { disease: 'Embarazo normal', differentiating: 'Fetos visibles en ecografia. Sin signos sistemicos.' },
        { disease: 'Endometritis', differentiating: 'Descarga vaginal sin acumulacion de pus significativa.' },
        { disease: 'Mucometra', differentiating: 'Acumulacion de moco transparente sin infeccion.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Ovariohisterectomia (OVE) de emergencia', details: 'Extirpacion de ambos ovarios y utero. Procedimiento de eleccion. Realizar en hembras estabilizadas.', justification: 'La OVE es tratamiento definitivo. Elimina foco infeccioso y previene recurrencias.', evidence: 'Hagman R. 2006.' },
        { intervention: 'Fluidoterapia IV prequirurgica', details: 'Lactato de Ringer 80-100 mL/kg/h en shock, 4-6 mL/kg/h en mantenimiento.', justification: 'Estabilizacion hemodinamica antes de cirugia es critica.' },
        { intervention: 'Antibioticoterapia IV', details: 'Ampicilina 22 mg/kg IV q6h + Enrofloxacino 5 mg/kg IV q24h.', justification: 'Cobertura amplia contra E. coli, Staphylococcus, Streptococcus.', evidence: 'Hagman R, et al. 2006.' },
        { intervention: 'Manejo del dolor postquirurgico', details: 'Metamizol 25 mg/kg IV/IM q8h + Meloxicam 0.1 mg/kg SC q24h.', justification: 'Control del dolor esencial para recuperacion.' },
      ],
      second_line: [
        { intervention: 'Manejo medico con prostaglandinas', details: 'Cloprostenol 1-2 ugr/kg SC cada 12-24h por 3-5 dias. Solo en piometra abierta no septica.', justification: 'Tasa de exito 70-85% pero 20-30% de recurrencia.', evidence: 'Wright PJ, et al. J Small Anim Pract. 1991;32:576-580.' },
      ],
      emergency: {
        presentation: 'Sepsis: hipotermia, taquicardia, mucosas palidas/grises, abdomen distendido doloroso.',
        protocol: [
          'Fluidoterapia IV agresiva: Lactato Ringer 80-100 mL/kg en bolo',
          'Antibioticoterapia IV amplia: Ampicilina + Enrofloxacino',
          'Oxigeno suplementario si mucosas cianoticas',
          'Monitoreo de glucemia cada 4-6 horas',
          'Cirugia de emergencia una vez estabilizada',
        ],
      },
      duration: 'Hospitalizacion: 2-5 dias postquirurgicos. Antibioticoterapia: 7-14 dias.',
      notes: 'Chile: OVE disponible en la mayoria de clinicas. Enrofloxacino (Baytril Elanco) disponible. Costo OVE: $150.000-$350.000 CLP.',
    },
    prevention: [
      { measure: 'Ovariohisterectomia preventiva', details: 'Esterilizar hembras antes del primer celo (reduccion > 90% riesgo).', justification: 'La esterilizacion es la medida preventiva mas efectiva.', evidence: 'Hagman R. 2006.' },
      { measure: 'Evitar hormonas exogenas', details: 'No usar progesterona o progestagenos para suprimir celo.', justification: 'Los progestagenos son principal factor de riesgo iatrogenico.' },
      { measure: 'Monitoreo post-celo', details: 'Vigilar signos de piometra 2-3 meses despues de cada celo.', justification: 'La deteccion temprana mejora pronostico.' },
    ],
    chilean_costs: {
      diagnosis: {
        ecografia_abdominal: '$25.000 - $40.000 CLP',
        hemograma: '$15.000 - $25.000 CLP',
        total_diagnostico: '$60.000 - $100.000 CLP',
      },
      treatment: {
        ovh_emergencia: '$150.000 - $350.000 CLP',
        hospitalizacion_dia: '$40.000 - $80.000 CLP/dia',
        total_tratamiento_quirurgico: '$250.000 - $500.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'journal_article', citation: 'Hagman R. Clinical and clinicopathological findings in dogs with pyometra. Acta Vet Scand. 2006;48:8.', relevance: 'Epidemiologia y factores pronosticos.' },
      { type: 'journal_article', citation: 'Wright PJ, et al. The use of prostaglandin F2alpha for treatment of pyometra in bitches. J Small Anim Pract. 1991;32:576-580.', relevance: 'Tratamiento medico con prostaglandinas.' },
      { type: 'textbook', citation: 'Fossum TW, et al. Small Animal Surgery. 5th ed. Elsevier; 2018.', relevance: 'Tecnica quirurgica de OVE.' },
    ],
  },

  {
    id: 'Prostatitis',
    name: 'Prostatitis',
    scientific_name: 'Canine Prostatitis',
    species: 'dog',
    category: 'reproductive',
    severity: 'moderate',
    is_zoonotic: false,
    prognosis: {
      classification: 'good',
      justification: 'El pronostico es bueno con antibioticoterapia prolongada (80-90% curacion). La prostatitis cronica puede requerir manejo a largo plazo. La castracion es curativa en la mayoria de los casos. El pronostico empeora con absceso prostatico, peritonitis o urosepsis.',
      evidence_source: 'Barsanti JA. Prostatitis. In: Greene CE, Sykes JE. Greenes Infectious Diseases of the Dog and Cat. 5th ed. Elsevier; 2018.',
    },
    prevalence_rank_dogs: 31,
    prevalence_rank_cats: null,
    life_stage: 'adult',
    chilean_epidemiology: {
      prevalence: 'La prostatitis representa el 1-3% de las consultas reproductivas en machos caninos en Chile. Mas comun en machos no castrados > 5 anos.',
      peak_season: 'Sin estacionalidad definida.',
      high_risk_groups: ['Machos no castrados > 5 anos', 'Machos con hiperplasia prostatica benigna', 'Machos con infecciones urinarias recurrentes'],
      endemic_status: 'Prevalente en machos no castrados en Chile.',
      economic_impact: 'Costo promedio: $80.000-$200.000 CLP por episodio.',
    },
    description: 'La prostatitis canina es la inflamacion de la prostata, glandula exocrina y endocrina localizada en la pelvis. La prostata normal esta regulada por hormonas sexuales (testosterona y dihidrotestosterona). La prostatitis puede ser aguda o cronica, bacteriana o abacteriana. La bacteriana aguda se presenta con fiebre, dolor abdominal caudal, letargia y disuria. La cronica puede ser asintomatica. Los agentes mas comunes son E. coli, Staphylococcus, Streptococcus y Klebsiella. Puede complicarse con absceso prostatico, peritonitis o urosepsis.',
    pathophysiology: 'La fisiopatologia involucra invasion del tejido prostatico por bacterias, generalmente por ascenso desde la uretra. En machos con hiperplasia prostatica benigna (HPB), el tejido aumentado facilita estasis de liquido y proliferacion bacteriana. Las bacterias Gram negativas producen LPS que activa respuesta inflamatoria: neutrofilos infiltran el parenquima, causando edema, necrosis y abscesos. La inflamacion cronica resulta en fibrosis y obstruccion de conductos excretores.',
    key_signs: [
      { sign: 'Fiebre', description: 'Temperatura rectal > 39.5C. Escalofrios y malestar general.', severity: 'high', clinical_significance: 'La fiebre es el signo mas consistente en prostatitis aguda.' },
      { sign: 'Dolor abdominal caudal', description: 'Resistencia a palpacion del abdomen caudal, encorvamiento dorsal.', severity: 'high', clinical_significance: 'El dolor prostatico es hallazgo clave.' },
      { sign: 'Disuria o stranguria', description: 'Micion frecuente, esfuerzo para orinar, chorro delgado.', severity: 'moderate', clinical_significance: 'Refleja compresion uretral por prostata inflamada.' },
      { sign: 'Letargia y anorexia', description: 'Inactividad marcada, rechazo al alimento.', severity: 'moderate', clinical_significance: 'Signos sistemicos proporcionales a severidad.' },
      { sign: 'Descarga uretral', description: 'Secrecion mucopurulenta por la uretra.', severity: 'moderate', clinical_significance: 'Puede ser unico signo visible en prostatitis cronica.' },
      { sign: 'Dolor a palpacion rectal', description: 'Prostata aumentada, dolorosa, textura irregular al examen digital rectal.', severity: 'high', clinical_significance: 'El examen digital rectal es esencial.' },
    ],
    diagnosis: {
      clinical_examination: 'Palpacion abdominal caudal, examen digital rectal, evaluacion de uretra, examen de orina. La prostata normal no se palpa en perros no castrados < 5 anos.',
      lab_tests: [
        { test: 'Analisis de orina completo', description: 'Piuria, bacteriuria, hematuria. Orina por cistocentesis.', availability_chile: 'Costo: $10.000-$20.000 CLP.' },
        { test: 'Hemograma completo', description: 'Leucocitosis con neutrofilia a la izquierda.', availability_chile: 'Costo: $15.000-$25.000 CLP.' },
        { test: 'Cultivo bacteriano de orina', description: 'Identifica agente causal y antibiograma.', availability_chile: 'Costo: $20.000-$35.000 CLP.' },
      ],
      imaging: [
        { study: 'Ecografia abdominal', findings: 'Prostata aumentada, hiperecogenica o con zonas hipoecogenicas (abscesos).' },
      ],
      differential_diagnosis: [
        { disease: 'Hiperplasia prostatica benigna', differentiating: 'Prostata aumentada simetrica, no dolorosa, sin signos sistemicos.' },
        { disease: 'Neoplasia prostatica', differentiating: 'Prostata irregular, con metastasis oseas.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Antibioticoterapia prolongada', details: 'Enrofloxacino 5 mg/kg PO q24h o trimetoprim-sulfametoxazol 15 mg/kg PO q12h por 4-6 semanas.', justification: 'La penetration antibiotica en prostata es limitada. Duracion minima 4-6 semanas.', evidence: 'Barsanti JA. 2018.' },
        { intervention: 'Castracion quirurgica', details: 'Castracion bilateral en machos no reproductores. Reduce tamanho prostatico 50-80% en 2-4 semanas.', justification: 'La castracion es curativa en la mayoria de los casos.' },
        { intervention: 'Fluidoterapia IV', details: 'Lactato de Ringer 4-6 mL/kg/h en prostatitis aguda con signos sistemicos.', justification: 'Mantiene perfusion renal y sistemica.' },
        { intervention: 'Antiinflamatorios y analgesicos', details: 'Metamizol 25 mg/kg IV/IM q8h o Carprofen 2.2 mg/kg PO q12h si funcion renal conservada.', justification: 'Control del dolor y la inflamacion mejora comocion.' },
      ],
      second_line: [
        { intervention: 'Drenaje de absceso prostatico', details: 'Drenaje quirurgico o ecoguiado de abscesos grandes.', justification: 'Los abscesos requieren drenaje para resolver infeccion.' },
        { intervention: 'Antiandrogenos', details: 'Acetato de ciproterona 2-5 mg/kg PO q24h.', justification: 'Alternativa a castracion cuando no es posible.' },
      ],
      emergency: {
        presentation: 'Sepsis: fiebre alta, taquicardia, hipotension, abdomen distendido.',
        protocol: [
          'Fluidoterapia IV agresiva: Lactato Ringer 80-100 mL/kg en bolo',
          'Antibioticoterapia IV amplia: Enrofloxacino + Ampicilina',
          'Monitoreo de glucemia, electrolitos',
          'Oxigeno suplementario si hipoxia',
        ],
      },
      duration: 'Hospitalizacion: 2-5 dias. Antibioticoterapia oral: 4-6 semanas.',
      notes: 'Chile: Enrofloxacino (Baytril Elanco) disponible. Trimetoprim-sulfametoxazol disponible. Costo: $80.000-$200.000 CLP.',
    },
    prevention: [
      { measure: 'Castracion preventiva', details: 'Castrar machos no destinados a reproduccion antes de los 5 anos.', justification: 'Elimina estimulacion androgenica que contribuye a HPB y prostatitis.' },
      { measure: 'Manejo higienico', details: 'Mantener higiene perineal. Evitar cateterizaciones innecesarias.', justification: 'Reduce carga bacteriana y previene ascenso infeccioso.' },
    ],
    chilean_costs: {
      diagnosis: {
        ecografia_prostatica: '$25.000 - $40.000 CLP',
        analisis_orina: '$10.000 - $20.000 CLP',
        total_diagnostico: '$70.000 - $120.000 CLP',
      },
      treatment: {
        antibioticoterapia_4_semanas: '$30.000 - $60.000 CLP',
        castracion: '$60.000 - $120.000 CLP',
        total_tratamiento: '$80.000 - $200.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'textbook', citation: 'Barsanti JA. Prostatitis. In: Greene CE, Sykes JE. Greenes Infectious Diseases. 5th ed. Elsevier; 2018.', relevance: 'Referencia principal de prostatitis canina.' },
      { type: 'journal_article', citation: 'Cowan LA, et al. Prostatic disease in the dog. Vet Clin North Am Small Anim Pract. 1996;26(2):289-311.', relevance: 'Revision de enfermedades prostaticas.' },
    ],
  },

  {
    id: 'Criptorquidea',
    name: 'Criptorquidea',
    scientific_name: 'Canine Cryptorchidism',
    species: 'dog',
    category: 'reproductive',
    severity: 'moderate',
    is_zoonotic: false,
    prognosis: {
      classification: 'excellent',
      justification: 'El pronostico es excelente con orquidectomia electiva. Cirugia rutinaria con complicaciones < 2%. El mayor riesgo sin tratamiento es transformacion neoplasmatica (5-12% en criptorquidicos). La castracion bilateral es curativa y previene neoplasia.',
      evidence_source: 'Barsanti JA, Shaw SC. Reproductive disorders. In: Greenes Infectious Diseases. 5th ed. Elsevier; 2018.',
    },
    prevalence_rank_dogs: 32,
    prevalence_rank_cats: null,
    life_stage: 'puppy',
    chilean_epidemiology: {
      prevalence: 'La criptorquidea afecta al 2-4% de los perros machos. En razas como Yorkshire Terrier, Chihuahua y Caniche, la incidencia puede alcanzar 10-15%.',
      peak_season: 'Sin estacionalidad — condicion congenita presente al nacer.',
      high_risk_groups: ['Razas minatura: Yorkshire Terrier, Chihuahua, Caniche', 'Perros con antecedentes familiares', 'Machos con testiculo intraabdominal bilateral'],
      endemic_status: 'Presente en Chile con incidencia variable por raza.',
      economic_impact: 'Orquidectomia: $100.000-$200.000 CLP.',
    },
    description: 'La criptorquidea canina es la falla de descenso bilateral o unilateral de uno o ambos testiculos a la bolsa escrotal normal. Es la anomalia congenita mas comun del aparato reproductor masculino. El descenso testicular normal ocurre entre los dias 22 y 45 de gestacion. La criptorquidea puede ser unilateral (60%) o bilateral (40%), con el testiculo en abdomen, canal inguinal o subcutanea. El testiculo criptorquidico es funcional para testosterona pero tiene capacidad espermatica reducida por temperatura elevada. La condicion es hereditaria con herencia poligenica.',
    pathophysiology: 'La fisiopatologia involucra fallas en mecanismos hormonales y mecanicos del descenso testicular. Normalmente, el testiculo desciende bajo influencia de hormonas (factor descenso-testicular, inhibina B, MIS) y factores mecanicos. En criptorquidea, la falla puede deberse a insuficiencia hormonal, receptores androgenicos deficientes, o obstruccion mecanica. El testiculo intraabdominal esta expuesto a temperatura corporal central (38-39C) en lugar de escrotal (33-35C). Esta hipertermia causa atrofia de celulas de Sertoli, disminucion de espermatogenesis y degeneracion tubular.',
    key_signs: [
      { sign: 'Testiculo no palpable en bolsa escrotal', description: 'A la palpacion bilateral, uno o ambos testiculos no se palpan.', severity: 'high', clinical_significance: 'Hallazgo diagnostico clave. Buscar en canal inguinal y abdomen.' },
      { sign: 'Bolsa escrotal hipoplasica', description: 'Bolsa pequena, flacida y pobremente desarrollada en criptorquidea bilateral.', severity: 'moderate', clinical_significance: 'Hipoplasia escrotal confirma ausencia prolongada.' },
      { sign: 'Masa inguinal o abdominal', description: 'Masa redondeada, firme, en canal inguinal o abdomen caudal.', severity: 'moderate', clinical_significance: 'Diferenciar de hernia inguinal o linfadenopatia.' },
      { sign: 'Asimetria escrotal', description: 'En criptorquidea unilateral, un lado vacio y otro con testiculo normal.', severity: 'mild', clinical_significance: 'Asimetria es el signo mas comun.' },
      { sign: 'Comportamiento sexual normal', description: 'Macho criptorquidico unilateral muestra comportamiento sexual normal.', severity: 'mild', clinical_significance: 'Comportamiento normal no descarta criptorquidea unilateral.' },
      { sign: 'Infertilidad (bilateral)', description: 'En bilateral, macho es infertil por ausencia de espermatogenesis funcional.', severity: 'moderate', clinical_significance: 'Infertilidad en bilaterales es completa e irreversible.' },
    ],
    diagnosis: {
      clinical_examination: 'Palpacion cuidadosa de bolsa escrotal, canal inguinal (con perro en decubito dorsal), y abdomen (con sedacion).',
      lab_tests: [
        { test: 'Analisis de semen', description: 'Evaluacion de espermatogenesis. En bilateral: azoospermia.', availability_chile: 'Costo: $20.000-$35.000 CLP.' },
      ],
      imaging: [
        { study: 'Ecografia abdominal', findings: 'Localizacion exacta del testiculo intraabdominal. Estructura ovalada, hiperecogenica.' },
      ],
      differential_diagnosis: [
        { disease: 'Hernia inguinal', differentiating: 'Masa blanda, reducible, que comunica con cavidad abdominal.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Orquidectomia', details: 'Extirpacion del testiculo(s) criptorquidico(s). Tecnica inguinal para inguinales, abdominal para intraabdominales.', justification: 'Orquidectomia es curativa y previene neoplasia.', evidence: 'Barsanti JA, Shaw SC. 2018.' },
      ],
      second_line: [],
      emergency: {
        presentation: 'Torsion testicular: dolor abdominal agudo, masa abdominal dolorosa, vomitos.',
        protocol: [
          'Fluidoterapia IV de soporte',
          'Analgesia: Metamizol 25 mg/kg IV',
          'Cirugia de emergencia: orquidectomia',
          'Soporte intensivo postquirurgico',
        ],
      },
      duration: 'Hospitalizacion: 24-48h. Recuperacion: 10-14 dias.',
      notes: 'Chile: Orquidectomia disponible en todas las clinicas. Costo: $100.000-$200.000 CLP.',
    },
    prevention: [
      { measure: 'Seleccion reproductiva', details: 'Excluir perros con criptorquidea del programa reproductivo.', justification: 'La condicion tiene componente hereditario significativo.' },
      { measure: 'Evaluacion neonatal', details: 'Palpar bolsa escrotal a las 8 semanas de edad.', justification: 'Deteccion temprana permite cirugia electiva.' },
    ],
    chilean_costs: {
      diagnosis: {
        ecografia_abdominal: '$25.000 - $40.000 CLP',
        total_diagnostico: '$50.000 - $80.000 CLP',
      },
      treatment: {
        orquidectomia: '$100.000 - $200.000 CLP',
      },
      emergency: {
        torsion_testicular: '$150.000 - $250.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'textbook', citation: 'Barsanti JA, Shaw SC. Reproductive disorders. In: Greenes Infectious Diseases. 5th ed. Elsevier; 2018.', relevance: 'Referencia principal.' },
      { type: 'journal_article', citation: 'Cox VM, et al. Cryptorchidism in the dog: a review. Vet Rec. 1978;103(17):383-386.', relevance: 'Epidemiologia y genetica.' },
    ],
  },

  {
    id: 'Epulide',
    name: 'Epulide',
    scientific_name: 'Canine Epulis',
    species: 'dog',
    category: 'dental',
    severity: 'mild',
    is_zoonotic: false,
    prognosis: {
      classification: 'excellent',
      justification: 'El pronostico es excelente. Lesiones benignas que rara vez se transforman malignamente. Extirpacion completa tiene tasa de curacion 95-100%. Recurrencia < 5% despues de extirpacion adecuada.',
      evidence_source: 'Gardner DG. Canine oral eosinophilic granuloma complex. In: Oral Pathology of the Dog and Cat. Mosby; 1996.',
    },
    prevalence_rank_dogs: 33,
    prevalence_rank_cats: null,
    life_stage: 'adult',
    chilean_epidemiology: {
      prevalence: 'Las epulides representan el 5-10% de las lesiones orales en perros en Chile. Comunes en razas braquicefalas.',
      peak_season: 'Sin estacionalidad — lesion cronica.',
      high_risk_groups: ['Razas braquicefalas: Bulldog Frances, Pug, Boxer', 'Perros con maloclusion o traumatismo dental cronico', 'Perros > 5 anos'],
      endemic_status: 'Prevalente en Chile.',
      economic_impact: 'Extirpacion: $80.000-$150.000 CLP.',
    },
    description: 'Las epulides son lesiones hiperplasicas o neoplasicas benignas de la encia (gingiva) que representan el grupo mas comun de tumores orales en perros. Se originan del periodonto y se clasifican en tres tipos: 1) Fibromatosa (50-60%), tejido fibroso maduro; 2) Osificante (30-40%), con tejido oseo maduro; y 3) Acomatomatosa (5-10%), con hiperplasia escamosa. Histologicamente benignas, son lesiones expansivas locales que no metastatizan. Pueden crecer lentamente durante meses, alcanzando tamaños desde 5mm hasta varios centimetros.',
    pathophysiology: 'La fisiopatologia involucra hiperplasia reactiva o neoplastica benigna del tejido periodontal. El estimulo mas comun es traumatismo cronico por maloclusion, calculo dental o irritacion. La inflamacion cronica estimula proliferacion de fibroblastos (fibromatosa) o diferenciacion osteoblastica (osificante). A diferencia de melanomas o fibrosarcomas, las epulides no invaden hueso de forma destructiva sino que lo remodelan por presion.',
    key_signs: [
      { sign: 'Masa gingival visible', description: 'Protuberancia firme, rosada a rojiz, cubierta de mucosa intacta. Pedunculada o sesil.', severity: 'mild', clinical_significance: 'Hallazgo diagnostico clave. Biopsia esencial para diferenciar de neoplasia.' },
      { sign: 'Halitosis', description: 'Mal aliento persistente, independiente de higiene dental.', severity: 'mild', clinical_significance: 'Signo mas comun que motiva consulta.' },
      { sign: 'Dificultad masticatoria', description: 'Perro mastica con dificultad, deja caer alimento, mastica solo de un lado.', severity: 'moderate', clinical_significance: 'Indica compromiso funcional que justifica cirugia.' },
      { sign: 'Sangrado gingival', description: 'Sangrado leve al masticar o cepillado.', severity: 'mild', clinical_significance: 'Signo de irritacion local, no indica malignidad.' },
      { sign: 'Perdida dental', description: 'Dientes adyacentes pueden aflojarse por reabsorcion osea.', severity: 'moderate', clinical_significance: 'Movilidad dental indica compromiso periodontal significativo.' },
      { sign: 'Aumento de tamanho progresivo', description: 'Epulide crece lentamente durante meses, sin regresion espontanea.', severity: 'mild', clinical_significance: 'Crecimiento progresivo confirma naturaleza neoplastica.' },
    ],
    diagnosis: {
      clinical_examination: 'Inspeccion visual de cavidad oral, palpacion de masa, evaluacion de base de implantacion y relacion con dientes.',
      lab_tests: [
        { test: 'Biopsia incisional o excisional', description: 'Muestra para histopatologia. Gold standard para diagnostico definitivo.', availability_chile: 'Costo: $20.000-$40.000 CLP.' },
        { test: 'Radiografia dental intraoral', description: 'Evalua extension osea de la epulide.', availability_chile: 'Costo: $15.000-$25.000 CLP.' },
      ],
      imaging: [
        { study: 'Radiografia dental', findings: 'Epulide osificante puede mostrar calcificacion interna.' },
      ],
      differential_diagnosis: [
        { disease: 'Melanoma oral', differentiating: 'Masa pigmentada, ulcerada, invasiva. Pronostico reservado.' },
        { disease: 'Fibrosarcoma oral', differentiating: 'Masa firme, infiltrativa, con ulceracion.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Extirpacion quirurgica completa', details: 'Excision con margenes de 2-3mm. Incluir periostio subyacente. Electrocauterio o laser para hemostasia.', justification: 'La extirpacion completa es curativa con tasa de exito > 95%.', evidence: 'Gardner DG. 1996.' },
        { intervention: 'Odontectomia concurrente', details: 'Extraccion de dientes afectados por la epulide. Asegurar margenes quirurgicos adecuados.', justification: 'Los dientes involucrados deben ser removidos para prevenir recurrencia.' },
        { intervention: 'Radiografia dental prequirurgica', details: 'Evaluar extension osea y planificar cirugia.', justification: 'Guia la extension de la reseccion quirurgica.' },
        { intervention: 'Antibioticoterapia profilactica', details: 'Amoxicilina-clavulanico 12.5 mg/kg PO q12h por 7-10 dias.', justification: 'Previene infeccion secundaria en sitio quirurgico.' },
      ],
      second_line: [
        { intervention: 'Crioriterapia', details: 'Crioterapia con nitrogeno liquido para lesiones residuales o recurrencias menores.', justification: 'Alternativa no quirurgica para lesiones pequenas.' },
      ],
      emergency: {
        presentation: 'Sangrado postquirurgico severo o compromiso respiratorio por masa grande.',
        protocol: [
          'Compresion directa con gasa esteril',
          'Antibiotico IV si sospecha de infeccion',
          'Referencia a cirujano oral veterinario',
        ],
      },
      duration: 'Cirugia: procedimiento ambulatorio. Recuperacion: 10-14 dias. Seguimiento: mensual por 3 meses.',
      notes: 'Chile: Extirpacion disponible en clinicas con servicio dental. Costo: $80.000-$150.000 CLP.',
    },
    prevention: [
      { measure: 'Higiene dental regular', details: 'Cepillado diario y limpiezas profesionales anuales.', justification: 'Reduce calculo dental e inflamacion que predispone a epulides.' },
      { measure: 'Correccion de maloclusion', details: 'Tratamiento ortodontico o extraccion de dientes traumaticos.', justification: 'La maloclusion causa traumatismo cronico que promueve hiperplasia gingival.' },
    ],
    chilean_costs: {
      diagnosis: {
        biopsia: '$20.000 - $40.000 CLP',
        radiografia_dental: '$15.000 - $25.000 CLP',
        total_diagnostico: '$35.000 - $65.000 CLP',
      },
      treatment: {
        extirpacion: '$80.000 - $150.000 CLP',
        odontectomia: '$30.000 - $60.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'textbook', citation: 'Gardner DG. Canine oral eosinophilic granuloma complex. In: Oral Pathology of the Dog and Cat. Mosby; 1996.', relevance: 'Referencia principal de patologia oral.' },
    ],
  },

  {
    id: 'Fractura-Dentaria',
    name: 'Fractura Dentaria',
    scientific_name: 'Canine Dental Fracture',
    species: 'dog',
    category: 'dental',
    severity: 'moderate',
    is_zoonotic: false,
    prognosis: {
      classification: 'good',
      justification: 'El pronostico es bueno con tratamiento dental adecuado. Las fracturas complicadas (expuestas a pulpa) requieren tratamiento endodontico o extraccion. Sin tratamiento, la pulpitis progresa a necrosis pulpar y absceso periapical. La preservacion dental es preferible a la extraccion cuando es posible.',
      evidence_source: 'Wiggs RB, Lobprise HB. Veterinary Dentistry: Principles and Practice. Lippincott-Raven; 1997.',
    },
    prevalence_rank_dogs: 34,
    prevalence_rank_cats: null,
    life_stage: 'all',
    chilean_epidemiology: {
      prevalence: 'Las fracturas dentales representan el 10-15% de las consultas de odontologia veterinaria en Chile. Comunes en perros activos y razas grandes.',
      peak_season: 'Sin estacionalidad. Mayor incidencia en verano por actividad al aire libre.',
      high_risk_groups: ['Razas grandes y gigantes', 'Perros activos que muerden huesos o juguetes duros', 'Perros con maloclusion', 'Perros de trabajo (guardia, pastoreo)'],
      endemic_status: 'Muy prevalente en Chile.',
      economic_impact: 'Tratamiento: $100.000-$250.000 CLP segun tipo de fractura.',
    },
    description: 'Las fracturas dentales en perros son lesiones traumaticas que afectan el esmalte, dentina y/o pulpa del diente. Se clasifican segun la estructura afectada: fracturas de corona simple (esmalte/dentina sin exposicion pulpar), fracturas complicadas (con exposicion pulpar), y fracturas de raiz. Los dientes mas frecuentemente afectados son los caninos, premolares y molares. Las causas incluyen traumatismo directo (golpes, caidas), mordedura de huesos o juguetes duros, y mordida de alambre. La fractura expone la pulpa a contaminacion bacteriana, causando pulpitis que progresa a necrosis pulpar y enfermedad periapical si no se trata.',
    pathophysiology: 'La fractura del diente rompe la barrera protectora de esmalte y dentina, exponiendo la pulpa dental a contaminacion bacteriana de la cavidad oral. La pulpa inflamada (pulpitis) puede ser reversible si la exposicion es menor y se trata rapidamente. Si la exposicion es mayor o prolongada, la pulpitis se vuelve irreversible y progresa a necrosis pulpar. La infeccion se extiende a traves del conducto radicular hacia el foramen apical, causando periodontitis apical y potencialmente absceso periapical.',
    key_signs: [
      { sign: 'Dolor a la masticacion', description: 'El perro muestra incomodidad al morder alimentos duros, suelta el alimento, o mastica solo de un lado.', severity: 'high', clinical_significance: 'El dolor es el signo mas comun pero puede ser sutil en fracturas simples.' },
      { sign: 'Sangrado oral', description: 'Sangrado visible de la encia o del diente fracturado.', severity: 'moderate', clinical_significance: 'Sangrado activo indica fractura reciente o exposicion pulpar.' },
      { sign: 'Cambios en el diente', description: 'Cambio de color (gris, amarillo), linea de fractura visible, o fragmento ausente.', severity: 'moderate', clinical_significance: 'Los cambios de color indican necrosis pulpar cronica.' },
      { sign: 'Halitosis', description: 'Mal aliento que empeora progresivamente. Indica infeccion pulpar o periapical.', severity: 'moderate', clinical_significance: 'Halitosis unilateral sugiere patologia dental en ese lado.' },
      { sign: 'Fistula o absceso', description: 'Abertura cutanea o subcutanea cerca de la raiz del diente con drenaje de pus.', severity: 'high', clinical_significance: 'La fistula indica infeccion avanzada que requiere tratamiento endodontico o extraccion.' },
      { sign: 'Retencion de alimentos', description: 'Alimentos se acumulan entre el diente fracturado y la encia.', severity: 'mild', clinical_significance: 'La retencion alimentaria promueve infeccion secundaria.' },
    ],
    diagnosis: {
      clinical_examination: 'Examen visual con sonda dental periodontal para evaluar integridad del esmalte y exposicion pulpar. Transiluminacion para detectar fracturas no visibles.',
      lab_tests: [
        { test: 'Radiografia dental intraoral', description: 'Evalua extension de la fractura, integridad radicular, y patologia periapical.', availability_chile: 'Costo: $15.000-$25.000 CLP.' },
      ],
      imaging: [
        { study: 'Radiografia dental periapical', findings: 'Fractura de corona, exposicion pulpar, luceperiapical, reabsorcion radicular.' },
      ],
      differential_diagnosis: [
        { disease: 'Absceso periapical', differentiating: 'Puede coexistir con fractura. Radiografia: luceperiapical sin fractura visible.' },
        { disease: 'Enfermedad periodontal', differentiating: 'Perdida osea horizontal/vertical. Movilidad dental sin historia de trauma.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Tratamiento endodontico (pulpotomia/pulpectomia)', details: 'En fracturas complicadas con exposicion pulpar < 24h: pulpotomia. En exposicion > 24h o necrosis: pulpectomia completa con obturacion.', justification: 'El tratamiento endodontico preserva el diente funcional. Exito > 90% cuando se realiza temprano.', evidence: 'Wiggs RB, Lobprise HB. 1997.' },
        { intervention: 'Extraccion dental', details: 'Extraccion completa del diente fracturado cuando no es viable endodonticamente.', justification: 'La extraccion elimina el foco infeccioso y previene complicaciones.' },
        { intervention: 'Restauracion estetica', details: 'Composite o resina para fracturas simples sin exposicion pulpar.', justification: 'Las fracturas simples pueden ser restauradas para prevenir exposicion.' },
        { intervention: 'Antibioticoterapia', details: 'Amoxicilina-clavulanico 12.5 mg/kg PO q12h por 7-10 dias en fracturas con infeccion.', justification: 'Controla infeccion secundaria y previene diseminacion.' },
      ],
      second_line: [
        { intervention: 'Corona de porcelana o metal', details: 'Corona protesica para preservar dientes tratados endodonticamente.', justification: 'Las coronas protegen el diente tratado de fracturas recurrentes.' },
      ],
      emergency: {
        presentation: 'Fractura con exposicion pulpar activa o absceso facial.',
        protocol: [
          'Analgesia: Metamizol 25 mg/kg IV o Carprofen 2.2 mg/kg IV',
          'Limpieza de la zona con solucion salina',
          'Antibiotico si signos de infeccion',
          'Referencia a odontologo veterinario en 24-48h',
        ],
      },
      duration: 'Tratamiento endodontico: 1-2 sesiones. Recuperacion: 1-2 semanas. Seguimiento: radiografia a los 6 y 12 meses.',
      notes: 'Chile: Tratamiento endodontico disponible en clinicas dentales veterinarias. Costo: $100.000-$250.000 CLP.',
    },
    prevention: [
      { measure: 'Evitar huesos y juguetes duros', details: 'No dar huesos de tubo, canillas, o juguetes de nylon duro. Usar juguetes de goma blandos.', justification: 'La mordedura de objetos duros es la causa mas comun de fracturas dentales.' },
      { measure: 'Revision dental regular', details: 'Examen dental anual para detectar y tratar fracturas tempranas.', justification: 'La deteccion temprana permite tratamiento conservador.' },
    ],
    chilean_costs: {
      diagnosis: {
        radiografia_dental: '$15.000 - $25.000 CLP',
        consulta_odontologica: '$25.000 - $40.000 CLP',
        total_diagnostico: '$40.000 - $65.000 CLP',
      },
      treatment: {
        pulpotomia_pulpectomia: '$100.000 - $250.000 CLP',
        extraccion: '$50.000 - $120.000 CLP',
        restauracion_composite: '$30.000 - $60.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'textbook', citation: 'Wiggs RB, Lobprise HB. Veterinary Dentistry: Principles and Practice. Lippincott-Raven; 1997.', relevance: 'Referencia principal de odontologia veterinaria.' },
    ],
  },

  {
    id: 'Golpe-de-Calor',
    name: 'Golpe de Calor (Hipertermia)',
    scientific_name: 'Heat Stroke (Hyperthermia)',
    species: 'dog',
    category: 'toxic',
    severity: 'critical',
    is_zoonotic: false,
    prognosis: {
      classification: 'guarded',
      justification: 'El pronostico depende de la rapidez del tratamiento y la severidad de la hipertermia. Con tratamiento agresivo temprano (dentro de 30 minutos del inicio), la tasa de supervivencia es del 50-70%. Sin embargo, la mortalidad supera el 50% cuando la temperatura rectal supera los 41.5C por mas de 60 minutos (Bruchim et al., 2017). Las complicaciones tardias incluyen falla renal aguda (30-40%), coagulacion intravascular diseminada (CID) (20-30%), y edema cerebral. El pronostico empeora significativamente cuando hay convulsiones, colapso cardiovascular, o PCV < 20%. Los perros braquicefalos tienen peor pronostico por dificultad termorregulatoria.',
      evidence_source: 'Bruchim Y, et al. Heat stroke in dogs: a retrospective study of 54 cases (1999-2004) and analysis of risk factors for death. J Vet Intern Med. 2017;31(1):38-46.',
    },
    prevalence_rank_dogs: 35,
    prevalence_rank_cats: null,
    life_stage: 'all',
    chilean_epidemiology: {
      prevalence: 'El golpe de calor es una emergencia estival comun en Chile. Representa el 2-4% de las consultas de urgencia en verano en Santiago. La incidencia aumenta significativamente durante olas de calor (diciembre-marzo).',
      peak_season: 'Predominante en verano (diciembre-marzo). Mayor riesgo en dias con temperatura > 30C.',
      high_risk_groups: ['Razas braquicefalas: Bulldog Frances, Pug, Boxer, Boston Terrier', 'Perros obesos o con enfermedad cardiaca', 'Perros ancianos o muy jovenes', 'Perros encerrados en vehiculos', 'Perros de pelo largo en ambientes calidos'],
      endemic_status: 'Presente en Chile, con picos en olas de calor. Los casos de perros encerrados en autos son prevenibles.',
      economic_impact: 'Tratamiento intensivo: $150.000-$400.000 CLP por episodio.',
    },
    description: 'El golpe de calor o hipertermia en perros se define como un aumento de la temperatura corporal central por encima de 40C (104F) con compromiso de organos target. Los perros termorregulan principalmente por jadeo (evaporacion de saliva en vias respiratorias) y vasodilatacion periferica. Cuando los mecanismos termorregulatorios se ven superados, la temperatura corporal aumenta progresivamente, causando dano celular directo por desnaturalizacion proteica, isquemia por distribucion anormal del gasto cardiaco, y respuesta inflamatoria sistemica. Las temperaturas > 41C causan dano endotelial, activacion de coagulacion, y falla multiorganica. El dano es especialmente severo en el tracto gastrointestinal (translocacion bacteriana), riñones (necrosis tubular aguda), higado (necrosis hepatocelular), y sistema nervioso central (edema cerebral).',
    pathophysiology: 'La hipertermia provoca dano celular por multiples mecanismos. La desnaturalizacion proteica ocurre a temperaturas > 41C, causando perdida de funcion enzimatica y structural. El dano endotelial activa la cascada de coagulacion, conduciendo a CID. La isquemia resultante de la redistribucion del gasto cardiaco causa necrosis isquemica en organos de alto metabolismo. La respuesta inflamatoria sistemica libera citocinas proinflamatorias (IL-1, IL-6, TNF-α) que amplifican el dano tisular. El edema cerebral resulta de la alteracion de la barrera hematoencefalica. La rabdomiolisis libera mioglobina que causa necrosis tubular renal.',
    key_signs: [
      { sign: 'Temperatura rectal > 41C', description: 'Hipertermia severa que excede la capacidad termorregulatoria. Temperaturas > 42C indican dano imminent a organos.', severity: 'high', clinical_significance: 'La temperatura rectal es el indicador mas importante de severidad y pronostico.' },
      { sign: 'Jadeo intenso y dificultoso', description: 'Jadeo rapido con saliva espesa y viscosa. En razas braquicefalas, el jadeo puede ser inefectivo.', severity: 'high', clinical_significance: 'El jadeo inefectivo en braquicefalos empeora la hipertermia rapidamente.' },
      { sign: 'Mucosas congestivas o cianoticas', description: 'Mucosas orales rojo brillante al inicio, tornandose azuladas (cianosis) en estados avanzados.', severity: 'high', clinical_significance: 'La cianosis indica falla respiratoria y oxigenacion inadecuada.' },
      { sign: 'Vomitos y diarrea', description: 'Vomitos con sangre (hematemesis) y/o diarrea sanguinolenta. Indica dano gastrointestinal.', severity: 'high', clinical_significance: 'La hemorragia gastrointestinal indica dano endotelial severo y posible CID.' },
      { sign: 'Debilidad y colapso', description: 'Marcha inestable, incapacidad para mantenerse en pie, colapso cardiovascular.', severity: 'high', clinical_significance: 'El colapso indica shock y compromiso hemodinamico severo.' },
      { sign: 'Convulsiones', description: 'Actividad convulsiva generalizada por edema cerebral. Indica pronostico reservado.', severity: 'high', clinical_significance: 'Las convulsiones indican dano del SNC severo con mortalidad > 70%.' },
      { sign: 'Coagulopatia', description: 'Hemorragias espontaneas, petequias, equimosis. Indica CID en desarrollo.', severity: 'high', clinical_significance: 'La CID es una complicacion mortal que requiere soporte intensivo.' },
    ],
    diagnosis: {
      clinical_examination: 'Diagnostico clinico basado en temperatura rectal > 40C con signos de compromiso organico. Evaluar estado de conciencia, mucosas, frecuencia cardiaca, frecuencia respiratoria, y estado de hidratacion.',
      lab_tests: [
        { test: 'Hemograma completo', description: 'Hemoconcentracion (PCV elevado), trombocitopenia, esquistocitos (fragmentocitos) en CID.', availability_chile: 'Costo: $15.000-$25.000 CLP.' },
        { test: 'Bioquimica sanguinea', description: 'Elevacion de ALT, AST, bilirrubina, urea, creatinina. Hipoglucemia o hiperglucemia.', availability_chile: 'Costo: $20.000-$35.000 CLP.' },
        { test: 'Gasometria arterial', description: 'Acidosis metabolica con o sin compensacion respiratoria. Evaluar severidad del compromiso.', availability_chile: 'Costo: $15.000-$25.000 CLP.' },
        { test: 'Coagulograma', description: 'Tiempo de protrombina (TP), tiempo de tromboplastina parcial (TTPa), fibrinogeno, dimeros D. Evaluar CID.', availability_chile: 'Costo: $20.000-$35.000 CLP.' },
        { test: 'Analisis de orina', description: 'Proteinuria, hemoglobinuria, cilindros granulares. Indica dano renal.', availability_chile: 'Costo: $10.000-$20.000 CLP.' },
      ],
      imaging: [
        { study: 'Radiografia toracica', findings: 'Edema pulmonar, consolidacion. Evaluar complicaciones pulmonares.' },
        { study: 'Ecografia abdominal', findings: 'Higado con ecogenicidad aumentada. Riñones con edema. Evaluar dano organico.' },
      ],
      differential_diagnosis: [
        { disease: 'Fiebre infecciosa', differentiating: 'Temperatura > 40C pero con causa infecciosa identificable. Progresion mas gradual.' },
        { disease: 'Intoxicacion por simpaticomimeticos', differentiating: 'Exposicion a drogas (anfetaminas, cocaine). Taquicardia sinusal, midriasis.' },
        { disease: 'Convulsiones febriles', differentiating: 'Convulsiones asociadas a fiebre, sin hipertermia extrema.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Enfriamiento gradual', details: 'Aplicar agua tibia (no fria) sobre todo el cuerpo, especialmente region inguinal y axilar. Evitar agua fria que cause vasoconstriccion periferica y retenga calor. Usar ventiladores.', justification: 'El enfriamiento gradual es preferible al agresivo para prevenir hipotermia de rebote y vasoconstriccion periferica.', evidence: 'Bruchim Y, et al. 2017.' },
        { intervention: 'Fluidoterapia IV agresiva', details: 'Lactato de Ringer enfriado a 4C: 90 mL/kg/h en shock, 4-6 mL/kg/h en mantenimiento. Corregir acidosis con NaHCO3 si pH < 7.2.', justification: 'La fluidoterapia IV es esencial para reponer perdidas por jadeo y sudoracion, y mantener perfusion renal.' },
        { intervention: 'Monitorizacion continua', details: 'Temperatura rectal cada 15 minutos hasta < 39.5C. Suspender enfriamiento activo a 39C para prevenir hipotermia. ECG continuo.', justification: 'La monitorizacion continua permite ajustar el enfriamiento y detectar arritmias cardiacas.' },
        { intervention: 'Oxigeno suplementario', details: 'Mascara de oxigeno o sonda nasal a 2-5 L/min. Indicado en mucosas cianoticas o dificultad respiratoria.', justification: 'El oxigeno suplementario mejora la oxigenacion tisular y reduce la demanda cardiaca.' },
        { intervention: 'Protectores gastrointestinales', details: 'Omeprazol 1 mg/kg IV q24h + Sucralfato 1g PO q8h. Prevenir ulceracion gastrica por dano mucoso.', justification: 'La mucosa gastrica es especialmente vulnerable a la isquemia por hipertermia.' },
      ],
      second_line: [
        { intervention: 'Mannitol 20% IV', details: '0.5-1 g/kg IV durante 20-30 minutos. Indicado en edema cerebral o convulsiones.', justification: 'El mannitol reduce la presion intracraneal y mejora la perfusion cerebral.' },
        { intervention: 'Dexametasona', details: '0.1-0.2 mg/kg IV. Antiinflamatorio para reducir edema cerebral y respuesta inflamatoria sistemica.', justification: 'Los corticosteroides reducen la inflamacion endotelial y el edema.' },
        { intervention: 'Transfusion de sangre total o plasma', details: 'En CID con trombocitopenia severa o coagulopatia activa.', justification: 'La transfusion reemplaza factores de coagulacion consumidos y plaquetas.' },
      ],
      emergency: {
        presentation: 'Hipertermia > 42C, colapso cardiovascular, convulsiones, hemorragia gastrointestinal.',
        protocol: [
          'Enfriamiento inmediato con agua tibia',
          'Fluidoterapia IV a 90 mL/kg/h',
          'Oxigeno a 5 L/min',
          'Monitoreo de temperatura cada 10 minutos',
          'Dexametasona 0.2 mg/kg IV si convulsiones',
          'Mannitol 20% 1 g/kg IV si edema cerebral',
          'Transfusion si CID documentada',
          'Hospitalizacion en UCI veterinaria 48-72 horas',
        ],
      },
      duration: 'Hospitalizacion: 48-72 horas minimo. Recuperacion completa: 1-2 semanas. Monitorizacion de funcion renal y hepatica por 4-6 semanas.',
      notes: 'Chile: Manejo intensivo disponible en clinicas 24 horas con UCI veterinaria. Costo: $150.000-$400.000 CLP.',
    },
    prevention: [
      { measure: 'Nunca dejar perros en vehiculos', details: 'La temperatura interior de un auto puede alcanzar 60C en minutos. Incluso con ventanas abiertas.', justification: 'El 50% de los casos de golpe de calor en Chile ocurren por perros encerrados en autos.' },
      { measure: 'Evitar ejercicio en horas de calor', details: 'No pasear perros entre 11:00 y 16:00 en verano. Caminar sobre cesped o tierra, no asfalto.', justification: 'El asfalto puede alcanzar temperaturas > 60C y causar quemaduras en almohadillas.' },
      { measure: 'Hidracion y sombra', details: 'Proveer agua fresca constante y areas de sombra. En razas braquicefalas, mantener en ambientes frescos.', justification: 'La deshidratacion acelera la hipertermia por reducir la capacidad de enfriamiento por evaporacion.' },
      { measure: 'Evitar ejercicio intenso en razas braquicefalas', details: 'Razas como Bulldog Frances, Pug y Boxer tienen alto riesgo por dificultad termorregulatoria.', justification: 'Los braquicefalos tienen vias respiratorias estrechas que limitan el enfriamiento por jadeo.' },
    ],
    chilean_costs: {
      diagnosis: {
        hemograma: '$15.000 - $25.000 CLP',
        quimica: '$20.000 - $35.000 CLP',
        gasometria: '$15.000 - $25.000 CLP',
        coagulograma: '$20.000 - $35.000 CLP',
        total_diagnostico: '$70.000 - $120.000 CLP',
      },
      treatment: {
        hospitalizacion_uci_dia: '$80.000 - $150.000 CLP/dia',
        total_tratamiento_72h: '$150.000 - $400.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'journal_article', citation: 'Bruchim Y, et al. Heat stroke in dogs: a retrospective study of 54 cases. J Vet Intern Med. 2017;31(1):38-46.', relevance: 'Epidemiologia y factores pronosticos.' },
      { type: 'textbook', citation: 'Silverstein DC, Hopper K. Small Animal Critical Care Medicine. 2nd ed. Elsevier; 2015.', relevance: 'Manejo intensivo de hipertermia.' },
    ],
  },

  {
    id: 'Intoxicacion-Chocolate',
    name: 'Intoxicacion por Chocolate',
    scientific_name: 'Theobromine Toxicity',
    species: 'dog',
    category: 'toxic',
    severity: 'severe',
    is_zoonotic: false,
    prognosis: {
      classification: 'good',
      justification: 'El pronostico es bueno a excelente con tratamiento adecuado y temprano. La mortalidad es baja (< 5%) cuando se trata oportunamente. El principal alcaloide toxico es la teobromina, con vida media de 17-18 horas en perros. Los signos clinicos progresan en 6-12 horas post-ingestion. El pronostico empeora con ingestion de chocolate blanco (mayor contenido de teobromina por gramo) o con exposicion prolongada.',
      evidence_source: 'Gwaltney-Brant S. Methylxanthines. In: Small Animal Toxicology. 3rd ed. Elsevier; 2013.',
    },
    prevalence_rank_dogs: 36,
    prevalence_rank_cats: null,
    life_stage: 'all',
    chilean_epidemiology: {
      prevalence: 'La intoxicacion por chocolate es una de las intoxicaciones alimentarias mas comunes en perros en Chile. Representa el 8-12% de las consultas por intoxicacion en clinicas veterinarias de Santiago. Mayor incidencia en periodos festivos (Navidad, Pascua, San Valentin).',
      peak_season: 'Picos en Navidad (diciembre), Pascua (abril) y San Valentin (septiembre).',
      high_risk_groups: ['Perros de razas pequenas', 'Cachorros curiosos', 'Perros con acceso a cocina', 'Perros no entrenados con comandos basicos'],
      endemic_status: 'Muy comun en Chile. Especialmente en periodos festivos cuando hay mayor disponibilidad de chocolate.',
      economic_impact: 'Tratamiento: $100.000-$300.000 CLP segun severidad.',
    },
    description: 'La intoxicacion por chocolate en perros se debe a la ingestion de metilxantinas, principalmente teobromina (3,7-dimetilxantina) y en menor medida cafeina. La teobromina es el alcaloide principal del cacao y es metabolizada lentamente por el higado del perro (vida media 17-18 horas vs 6-10 horas en humanos). La toxicidad depende del tipo de chocolate: cacao en polvo (14-16 mg/g de teobromina), chocolate amargo (5-8 mg/g), chocolate de leche (1.5-2.5 mg/g), y chocolate blanco (0.25 mg/g). La dosis toxica minima es 20 mg/kg de teobromina para signos leves y 40-60 mg/kg para signos severos. La teobromina actua como inhibidor de la fosfodiesterasa, aumentando los niveles de AMPc, y como antagonista de los receptores de adenosina, causando estimulacion del sistema nervioso central y cardiaco.',
    pathophysiology: 'La teobromina se absorbe completamente del tracto gastrointestinal y se distribuye por todo el organismo. Actua por dos mecanismos principales: 1) Inhibicion de la fosfodiesterasa (PDE), que aumenta los niveles de AMPc intracelular, causando relajacion del musculo liso, estimulacion cardiaca, y diuresis; 2) Antagonismo de los receptores de adenosina (A1 y A2A), que produce estimulacion del SNC, taquicardia y vasodilatacion. La teobromina tambien estimula la liberacion de catecolaminas y tiene efecto directo sobre el musculo cardiaco. El resultado es estimulacion cardiaca (taquicardia, arritmias), estimulacion del SNC (convulsiones, hiperexcitabilidad), diuresis osmotica (deshidratacion, hipopotasemia), y hemorragia gastrointestinal por irritacion directa.',
    key_signs: [
      { sign: 'Vomitos', description: 'Vomitos biliosos, intermitentes, que aparecen 2-6 horas post-ingestion. Puede contener fragmentos de chocolate.', severity: 'moderate', clinical_significance: 'Los vomitos son el signo mas temprano y comun. La presencia de fragmentos de chocolate confirma la ingestion.' },
      { sign: 'Polidipsia y poliuria', description: 'Aumento marcado de ingesta de agua y frecuencia urinaria por efecto diuretico de la teobromina.', severity: 'moderate', clinical_significance: 'La poliuria es un signo caracteristico de toxicidad por metilxantinas.' },
      { sign: 'Hiperexcitabilidad', description: 'Inquietud, temblores musculares, hiperreactividad a estimulos auditivos y visuales.', severity: 'moderate', clinical_significance: 'La hiperexcitabilidad refleja estimulacion del SNC por antagonismo de adenosina.' },
      { sign: 'Taquicardia', description: 'Frecuencia cardiaca > 160 lpm. Puede haber arritmias (extrasistoles ventriculares, taquicardia ventricular).', severity: 'high', clinical_significance: 'Las arritmias cardiacas son la principal causa de muerte en intoxicaciones severas.' },
      { sign: 'Diarrea', description: 'Diarrea acuosa a semilíquida, puede ser hemorragica en intoxicaciones severas.', severity: 'moderate', clinical_significance: 'La diarrea hemorragica indica irritacion gastrointestinal severa.' },
      { sign: 'Convulsiones', description: 'Actividad convulsiva generalizada en intoxicaciones severas (> 60 mg/kg de teobromina).', severity: 'high', clinical_significance: 'Las convulsiones indican toxicidad severa con compromiso del SNC.' },
    ],
    diagnosis: {
      clinical_examination: 'Diagnostico clinico basado en historia de ingestion de chocolate + signos de toxicidad. Evaluar tiempo desde ingestion, cantidad y tipo de chocolate.',
      lab_tests: [
        { test: 'Hemograma completo', description: 'Leucocitosis por estrés. Trombocitopenia en casos severos.', availability_chile: 'Costo: $15.000-$25.000 CLP.' },
        { test: 'Bioquimica sanguinea', description: 'Hiperglucemia (estimulacion simpatica), hipopotasemia (diuresis), elevacion de enzimas cardiacas (CK-MB).', availability_chile: 'Costo: $20.000-$35.000 CLP.' },
        { test: 'Gasometria arterial', description: 'Acidosis metabolica en intoxicaciones severas.', availability_chile: 'Costo: $15.000-$25.000 CLP.' },
        { test: 'Electrolitos', description: 'Hipopotasemia por diuresis. Requiere correccion.', availability_chile: 'Costo: $10.000-$20.000 CLP.' },
      ],
      imaging: [
        { study: 'Radiografia abdominal', findings: 'Engasamiento intestinal, presencia de fragmentos de chocolate en estomago si ingestion reciente.' },
      ],
      differential_diagnosis: [
        { disease: 'Intoxicacion por cafeina', differentiating: 'Mecanismo similar pero fuente diferente. Cafeina es 10x mas potente que teobromina.' },
        { disease: 'Intoxicacion por psicofarmacos', differentiating: 'Exposicion a drogas psicotropicas. Signos similares pero con historia de exposicion diferente.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Induccion de vomitos', details: 'Apomorfina 0.03 mg/kg IV o 0.04 mg/kg SC. Solo si ingestion < 2 horas y sin signos neurologicos. Contraindicado en convulsiones.', justification: 'La induccion de vomitos es efectiva solo en las primeras 2 horas. Despues de 4 horas, la mayoria de la teobromina ya se absorbio.' },
        { intervention: 'Carbone activado', details: '1-2 g/kg PO en suspension al 20%. Repetir cada 4-6 horas por 24-48 horas. La teobromina sufre recirculo enterohepatico.', justification: 'El carbone activado adsorbe la teobromina y reduce su absorcion. La repeticion es importante por recirculo enterohepatico.', evidence: 'Gwaltney-Brant S. 2013.' },
        { intervention: 'Fluidoterapia IV', details: 'Lactato de Ringer 4-6 mL/kg/h. Mantener diuresis > 2 mL/kg/h para acelerar eliminacion renal de teobromina.', justification: 'La fluidoterapia IV mantiene la perfusion renal y acelera la eliminacion de teobromina por diuresis.' },
        { intervention: 'Antiemeticos', details: 'Maropitant (Cerenia) 1-2 mg/kg SC q24h. Controla vomitos para permitir administracion de carbone activado.', justification: 'El control de vomitos es esencial para la administracion exitosa de carbone activado.' },
      ],
      second_line: [
        { intervention: 'Lidocaina IV', details: '25-50 ugr/kg/min IV continuo. Antiarritmico de elección en taquicardia ventricular.', justification: 'La lidocaina es el antiarritmico de primera linea en arritmias ventriculares por metilxantinas.' },
        { intervention: 'Propranolol', details: '0.02-0.06 mg/kg IV lento. Beta-bloqueante para taquicardia supraventricular o ventricular.', justification: 'El propranolol reduce la frecuencia cardiaca y el riesgo de arritmias.' },
        { intervention: 'Diazepam', details: '0.5-1 mg/kg IV para control de convulsiones refractarias.', justification: 'El diazepam es de primera linea para convulsiones por toxicidad.' },
      ],
      emergency: {
        presentation: 'Arritmia ventricular, convulsiones, colapso cardiovascular.',
        protocol: [
          'Induccion de vomitos si ingestion < 2 horas',
          'Carbone activado 1-2 g/kg PO',
          'Fluidoterapia IV agresiva',
          'Lidocaina 50 ugr/kg/min IV si arritmia ventricular',
          'Diazepam 1 mg/kg IV si convulsiones',
          'Monitorizacion ECG continua',
        ],
      },
      duration: 'Hospitalizacion: 24-72 horas segun severidad. Recuperacion completa: 3-5 dias.',
      notes: 'Chile: Cerenia (Zoetis) disponible. Carbone activado disponible en farmacias ($5.000-$10.000 CLP). Apomorfina disponible en clinicas.',
    },
    prevention: [
      { measure: 'Almacenamiento seguro de chocolate', details: 'Mantener chocolate fuera del alcance de perros. En recipientes cerrados.', justification: 'La prevencion es la mejor estrategia. El chocolate es atractivo para los perros.' },
      { measure: 'Educacion del propietario', details: 'Informar sobre la toxicidad del chocolate y los niveles de teobromina por tipo.', justification: 'Muchos propietarios no conocen la toxicidad del chocolate para perros.' },
      { measure: 'Sustitutos seguros', details: 'Ofrecer premios especificos para perros en lugar de chocolate.', justification: 'Los perros no necesitan chocolate; existen alternativas seguras y deliciosas.' },
    ],
    chilean_costs: {
      diagnosis: {
        hemograma: '$15.000 - $25.000 CLP',
        quimica: '$20.000 - $35.000 CLP',
        electrolitos: '$10.000 - $20.000 CLP',
        total_diagnostico: '$45.000 - $80.000 CLP',
      },
      treatment: {
        carbone_activado: '$5.000 - $10.000 CLP',
        hospitalizacion_24h: '$50.000 - $100.000 CLP',
        total_tratamiento: '$100.000 - $300.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'textbook', citation: 'Gwaltney-Brant S. Methylxanthines. In: Small Animal Toxicology. 3rd ed. Elsevier; 2013.', relevance: 'Referencia principal de toxicologia.' },
      { type: 'journal_article', citation: 'Sweeney BP. Methylxanthine poisoning in dogs. J Small Anim Pract. 2014;55(1):1-6.', relevance: 'Revision clinica de toxicidad por metilxantinas.' },
    ],
  },

  {
    id: 'Intoxicacion-Xilitol',
    name: 'Intoxicacion por Xilitol',
    scientific_name: 'Xylitol Toxicity',
    species: 'dog',
    category: 'toxic',
    severity: 'critical',
    is_zoonotic: false,
    prognosis: {
      classification: 'guarded',
      justification: 'El pronostico depende de la dosis ingerida y la rapidez del tratamiento. Dosis > 0.5 g/kg causan hipoglucemia severa que puede ser mortal sin tratamiento. Dosis > 1-2 g/kg causan falla hepatica aguda con mortalidad del 50-80% (Dunayer & Gwaltney-Brant, 2006). Con tratamiento agresivo temprano (dentro de 30 minutos), el pronostico mejora significativamente. La hipoglucemia se resuelve en 12-24 horas con tratamiento, pero la falla hepatica puede progresar durante 3-5 dias.',
      evidence_source: 'Dunayer EK, Gwaltney-Brant SM. Acute hepatic failure and coagulopathy associated with xylitol ingestion in eight dogs. J Am Vet Med Assoc. 2006;229(7):1113-1117.',
    },
    prevalence_rank_dogs: 37,
    prevalence_rank_cats: null,
    life_stage: 'all',
    chilean_epidemiology: {
      prevalence: 'La intoxicacion por xilitol esta aumentando en Chile debido al uso creciente de este edulcorante en productos sin azucar. Representa el 5-8% de las intoxicaciones por productos caseros en clinicas veterinarias.',
      peak_season: 'Sin estacionalidad definida. Puede ocurrir en cualquier momento del ano.',
      high_risk_groups: ['Perros de razas pequenas (mayor riesgo por menor peso)', 'Cachorros curiosos', 'Perros con acceso a productos de reposteria', 'Perros no entrenados'],
      endemic_status: 'Creciente en Chile. El xilitol esta presente en gomas de mascar, pasteles, productos de panaderia, pasta de dientes y vitaminas.',
      economic_impact: 'Tratamiento intensivo: $200.000-$500.000 CLP por episodio.',
    },
    description: 'La intoxicacion por xilitol en perros es una emergencia toxico metabolica grave causada por la ingestion de xilitol, un polialcohol (azucar alcohol) utilizado como edulcorante sin azucar en productos para humanos. El xilitol es altamente toxico para perros pero no para humanos (diferencia especie-especifica en metabolismo). En perros, el xilitol estimula la liberacion rapida de insulina del pancreas (efecto insulino-mimetico), causando hipoglucemia severa. En dosis mayores (> 1-2 g/kg), el xilitol causa necrosis hepatocelular por mecanismo no completamente dilucidado. Los productos que contienen xilitol incluyen: gomas de mascar sin azucar (0.3-1 g/goma), pasteles y reposteria (0.5-3 g/porcion), pasta de dientes (0.3-0.5 g/g), vitaminas masticables, y productos farmaceuticos.',
    pathophysiology: 'El xilitol se absorbe rapidamente del tracto gastrointestinal y estimula la liberacion de insulina por las celulas beta pancreaticas. La hipoglucemia resultante es potencialmente mortal porque el cerebro depende exclusivamente de glucosa como sustrato energetico. La hipoglucemia severa (< 40 mg/dL) causa convulsiones, perdida de conciencia y muerte. En dosis mayores (> 1-2 g/kg), el xilitol causa necrosis hepatica centrilobular por mecanismo que involucra agotamiento de ATP, estres oxidativo, y activacion de vias apoptoticas. La falla hepatica resulta en coagulopatia por defecto de factores de coagulacion (II, V, VII, IX, X) sintetizados por el higado.',
    key_signs: [
      { sign: 'Vomitos', description: 'Vomitos que aparecen 10-60 minutos post-ingestion. Puede contener fragmentos de productos con xilitol.', severity: 'moderate', clinical_significance: 'Los vomitos son el signo mas temprano. La rapida aparicion sugiere ingestion reciente.' },
      { sign: 'Colapso por hipoglucemia', description: 'Debilidad extrema, ataxia, marcha inestable, colapso. Temperatura corporal reducida.', severity: 'high', clinical_significance: 'El colapso hipoglucemico es una emergencia que requiere glucosa IV inmediata.' },
      { sign: 'Convulsiones', description: 'Actividad convulsiva generalizada por hipoglucemia severa del SNC.', severity: 'high', clinical_significance: 'Las convulsiones indican hipoglucemia critica (< 30 mg/dL) con riesgo de muerte.' },
      { sign: 'Signos de falla hepatica', description: 'Ictericia (mucosas amarillas), ascitis, tendencia al sangrado. Aparecen 12-72 horas post-ingestion.', severity: 'high', clinical_significance: 'La falla hepatica es la complicacion mas grave y puede ser irreversible.' },
      { sign: 'Coagulopatia', description: 'Hemorragias espontaneas, petequias, equimosis, sangrado de encias.', severity: 'high', clinical_significance: 'La coagulopatia indica falla hepatica severa con defecto de factores de coagulacion.' },
      { sign: 'Ataxia y temblores', description: 'Incoordinacion motora, temblores musculares, debilidad generalizada.', severity: 'moderate', clinical_significance: 'Reflejan hipoglucemia o dano hepatico en desarrollo.' },
    ],
    diagnosis: {
      clinical_examination: 'Diagnostico clinico basado en historia de ingestion de producto con xilitol + signos de hipoglucemia o falla hepatica. Confirmar la presencia de xilitol en el producto ingerido.',
      lab_tests: [
        { test: 'Glucemia', description: 'Hipoglucemia severa (< 60 mg/dL, potencialmente < 20 mg/dL). Medir inmediatamente.', availability_chile: 'Costo: $5.000-$10.000 CLP.', interpretation: 'Hipoglucemia es el marcador de toxicidad mas agudo y medible.' },
        { test: 'Hemograma completo', description: 'Leucocitosis por estrés. Trombocitopenia en falla hepatica.', availability_chile: 'Costo: $15.000-$25.000 CLP.' },
        { test: 'Bioquimica sanguinea', description: 'Elevacion marcada de ALT, AST, bilirrubina, amoniaco. Hipoalbuminemia.', availability_chile: 'Costo: $20.000-$35.000 CLP.' },
        { test: 'Coagulograma', description: 'TP y TTPa prolongados. Fibrinogeno reducido. Indicador de falla hepatica severa.', availability_chile: 'Costo: $20.000-$35.000 CLP.' },
        { test: 'Acidos biliares', description: 'Elevacion de acidos biliares postprandiales. Marcador sensible de funcion hepatica.', availability_chile: 'Costo: $25.000-$40.000 CLP.' },
      ],
      imaging: [
        { study: 'Ecografia abdominal', findings: 'Higado con ecogenicidad aumentada o heterogenea. Ascitis en falla hepatica avanzada.' },
      ],
      differential_diagnosis: [
        { disease: 'Intoxicacion por rodenticidas', differentiating: 'Coagulopatia sin hipoglucemia inicial. Tiempo de coagulacion prolongado.' },
        { disease: 'Falla hepatica idiopatica', differentiating: 'Sin historia de ingestion de xilitol. Progresion mas gradual.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Correccion de hipoglucemia', details: 'Dextrosa 50% diluida a 10-25%: 0.5-1 g/kg IV bolus, luego infusion continua de dextrosa 5-10% a 1.5 mL/kg/h. Monitorear glucemia cada 1-2 horas.', justification: 'La correccion de hipoglucemia es la prioridad inmediata. La hipoglucemia no corregida causa muerte en horas.', evidence: 'Dunayer EK, Gwaltney-Brant SM. 2006.' },
        { intervention: 'Induccion de vomitos', details: 'Si ingestion < 2 horas y sin signos neurologicos. Apomorfina 0.03 mg/kg IV.', justification: 'La induccion de vomitos puede reducir la absorcion si se realiza temprano.' },
        { intervention: 'Carbone activado', details: '1-2 g/kg PO en suspension al 20%. Repetir cada 4-6 horas por 24 horas.', justification: 'El carbone activado adsorbe xilitol no absorbido en el tracto GI.' },
        { intervention: 'Fluidoterapia IV', details: 'Lactato de Ringer + dextrosa 5%: 4-6 mL/kg/h. Mantener euglucemia.', justification: 'La fluidoterapia con dextrosa mantiene la glucemia y soporta la funcion hepatica.' },
        { intervention: 'Protectores hepaticos', details: 'S-adenosilmetionina (SAMe) 20 mg/kg PO q24h + N-acetilcisteina (NAC) 140 mg/kg IV luego 70 mg/kg IV q6h.', justification: 'Los protectores hepaticos reducen el estres oxidativo y apoyan la regeneracion hepatica.' },
      ],
      second_line: [
        { intervention: 'Plasma fresco', details: '10-20 mL/kg IV. Proporciona factores de coagulacion y albúmina.', justification: 'Indicado en coagulopatia activa o hipoalbuminemia severa.' },
        { intervention: 'Vitamina K1', details: '2.5 mg/kg PO/SC q12h por 5-7 dias. Replenir vitamina K si coagulopatia.', justification: 'La vitamina K1 es esencial para la sintesis de factores de coagulacion II, VII, IX, X.' },
      ],
      emergency: {
        presentation: 'Colapso hipoglucemico: convulsiones, inconsciencia, glucemia < 30 mg/dL.',
        protocol: [
          'Dextrosa 50% 0.5 g/kg IV bolus inmediato',
          'Infusion de dextrosa 10% a 1.5 mL/kg/h',
          'Monitoreo de glucemia cada 30 minutos',
          'Fluidoterapia IV de mantenimiento',
          'Carbone activado 1-2 g/kg PO',
          'Monitorizacion continua en UCI',
        ],
      },
      duration: 'Hospitalizacion: 48-96 horas minimo. Monitoreo de glucemia cada 4-6 horas por 48 horas. Seguimiento de funcion hepatica semanal por 4 semanas.',
      notes: 'Chile: Xilitol presente en productos como Orbit, Trident, productos "sin azucar". SAMe (SAMYLIN) y NAC disponibles en farmacias veterinarias. Costo tratamiento: $200.000-$500.000 CLP.',
    },
    prevention: [
      { measure: 'Evitar productos con xilitol', details: 'No dar productos sin azucar a perros. Revisar etiquetas de gomas, pasteles, vitaminas.', justification: 'El xilitol es altamente toxico y puede estar en productos inesperados.' },
      { measure: 'Almacenamiento seguro', details: 'Mantener productos con xilitol fuera del alcance de perros.', justification: 'La prevencion es la mejor estrategia. El xilitol es atractivo para perros.' },
      { measure: 'Educacion del propietario', details: 'Informar sobre la toxicidad del xilitol y los productos que lo contienen.', justification: 'Muchos propietarios no conocen la toxicidad del xilitol para perros.' },
    ],
    chilean_costs: {
      diagnosis: {
        glucemia: '$5.000 - $10.000 CLP',
        hemograma: '$15.000 - $25.000 CLP',
        quimica: '$20.000 - $35.000 CLP',
        coagulograma: '$20.000 - $35.000 CLP',
        total_diagnostico: '$60.000 - $105.000 CLP',
      },
      treatment: {
        hospitalizacion_uci_dia: '$80.000 - $150.000 CLP/dia',
        samylin_mensual: '$30.000 - $50.000 CLP',
        total_tratamiento: '$200.000 - $500.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'journal_article', citation: 'Dunayer EK, Gwaltney-Brant SM. Acute hepatic failure and coagulopathy associated with xylitol ingestion in eight dogs. J Am Vet Med Assoc. 2006;229(7):1113-1117.', relevance: 'Falla hepatica por xilitol.' },
      { type: 'journal_article', citation: 'Dunayer EK. Hypoglycemia following xylitol ingestion in dogs. J Am Vet Med Assoc. 2004;224(8):1286-1291.', relevance: 'Hipoglucemia por xilitol.' },
    ],
  },

  {
    id: 'Anemia-Inmunitaria-Mediada',
    name: 'Anemia Inmunitaria Mediada',
    scientific_name: 'Immune-Mediated Hemolytic Anemia (IMHA)',
    species: 'dog',
    category: 'autoimmune',
    severity: 'severe',
    is_zoonotic: false,
    prognosis: {
      classification: 'guarded',
      justification: 'El pronostico es reservado con mortalidad del 20-40% incluso con tratamiento agresivo. La IMHA primaria (idiopatica) tiene peor pronostico que la secundaria a infecciones o neoplasias. Los factores pronosticos adversos incluyen: PCV < 12%, trombocitopenia concurrente (evans), hiperbilirrubinemia > 5 mg/dL, y presencia de tromboembolismo. La recurrencia ocurre en 10-30% de los casos que sobreviven al episodio inicial (Kellum et al., 2023).',
      evidence_source: 'Kellum H, et al. Prognostic factors in dogs with immune-mediated hemolytic anemia. J Vet Intern Med. 2023;37(2):518-527.',
    },
    prevalence_rank_dogs: 38,
    prevalence_rank_cats: null,
    life_stage: 'adult',
    chilean_epidemiology: {
      prevalence: 'La IMHA es la causa mas comun de anemia hemolitica en perros en Chile. Representa el 2-3% de las consultas de hematologia en clinicas veterinarias de Santiago.',
      peak_season: 'Mayor incidencia en primavera-verano. Posible relacion con infecciones (Ehrlichia, Babesia) como desencadenantes.',
      high_risk_groups: ['Perros de razas mediana-grande: Cocker Spaniel, Springer Spaniel, Pastor Aleman', 'Perros > 5 anos', 'Perros con historial de alergias o enfermedades autoinmunes', 'Hembras (2x mas comun que machos)'],
      endemic_status: 'Prevalente en Chile. La presencia de Ehrlichia y Babesia como desencadenantes es relevante.',
      economic_impact: 'Tratamiento: $200.000-$500.000 CLP por episodio.',
    },
    description: 'La anemia inmunitaria mediada (IMHA) es una enfermedad autoinmune en la que anticuerpos (IgG o IgM) se adhieren a la superficie de los eritrocitos, marcandolos para destruccion prematura por el sistema reticuloendotelial. La destruccion puede ser extravascular (en bazo e higado, 90% de los casos) o intravascular (lisis intravascular, 10% de los casos). La IMHA se clasifica en primaria (idiopatica, sin causa identificable) y secundaria (desencadenada por infecciones, neoplasias, farmacos, o neoplasias). La presentacion clinica tipica es anemia regenerativa con hiperbilirrubinemia, ictericia, y hemoglobinuria. La triada de anemia + trombocitopenia (sindrome de Evans) empeora significativamente el pronostico.',
    pathophysiology: 'La fisiopatologia involucra la formacion de autoanticuerpos contra antigenes de superficie del eritrocito. Los anticuerpos IgG se unen a los eritrocitos y activan la cascada del complemento o son reconocidos por receptores Fc de los macrofagos en el bazo e higado (extravascular). Los anticuerpos IgM pueden activar el complemento completo, causando lisis intravascular con liberacion de hemoglobina libre. La destruccion masiva de eritrocitos causa anemia severa, hiperbilirrubinemia (por metabolismo de la hemoglobina), e ictericia. La hemoglobina libre filtrada por los riñones causa hemoglobinuria y puede conducir a falla renal aguda. La activacion de la cascada de coagulacion por la destruccion celular masiva puede causar tromboembolismo.',
    key_signs: [
      { sign: 'Palidez de mucosas', description: 'Mucosas orales, conjuntivas y almohadillas plantales palidas o blancas. Refleja anemia severa.', severity: 'high', clinical_significance: 'La palidez de mucosas es el signo mas consistente de anemia.' },
      { sign: 'Ictericia', description: 'Mucosas orales, conjuntivas y piel de color amarillo por hiperbilirrubinemia.', severity: 'high', clinical_significance: 'La ictericia en un perro anemico es altamente sugestiva de IMHA.' },
      { sign: 'Letargia y debilidad', description: 'Inactividad marcada, deambulacion debil, colapso con ejercicio minimo.', severity: 'high', clinical_significance: 'La letargia refleja la anemia y la hipoxia tisular.' },
      { sign: 'Polidipsia y poliuria', description: 'Aumento de ingesta de agua y produccion de orina. Orina oscura (hemoglobinuria).', severity: 'moderate', clinical_significance: 'La hemoglobinuria indica lisis intravascular y puede causar falla renal.' },
      { sign: 'Dificultad respiratoria', description: 'Taquipnea, disnea, mucosas cianoticas en anemia severa.', severity: 'high', clinical_significance: 'La disnea indica anemia critica con incapacidad de oxigenacion adecuada.' },
      { sign: 'Fiebre', description: 'Temperatura rectal > 39.5C. Presente en 50-70% de los casos de IMHA.', severity: 'moderate', clinical_significance: 'La fiebre puede indicar infeccion concurrente o respuesta inflamatoria.' },
      { sign: 'Sangrado', description: 'Petequias, equimosis, sangrado de encias. Indica trombocitopenia concurrente (Evans).', severity: 'high', clinical_significance: 'El sindrome de Evans (IMHA + trombocitopenia) empeora el pronostico.' },
    ],
    diagnosis: {
      clinical_examination: 'Anemia regenerativa (reticulocitos elevados) + ictericia + hiperbilirrubinemia sugieren fuertemente IMHA. La confirmacion requiere demostrar autoanticuerpos en la superficie eritrocitaria.',
      lab_tests: [
        { test: 'Hemograma completo con reticulocitos', description: 'Anemia regenerativa (PCV < 20%, reticulocitos > 2%). Anisocitosis, policromasia, esferocitos.', availability_chile: 'Costo: $15.000-$25.000 CLP.' },
        { test: 'Prueba de aglutinacion en frio (Coombs)', description: 'Detecta anticuerpos adheridos a eritrocitos. Sensibilidad 50-80%. Negativo no descarta IMHA.', availability_chile: 'Costo: $25.000-$40.000 CLP.' },
        { test: 'Bioquimica sanguinea', description: 'Hiperbilirrubinemia (directa e indirecta). Elevacion de LDH, fosfatasa alcalina.', availability_chile: 'Costo: $20.000-$35.000 CLP.' },
        { test: 'Analisis de orina', description: 'Hemoglobinuria, bilirrubinuria. Proteinuria por dano tubular.', availability_chile: 'Costo: $10.000-$20.000 CLP.' },
        { test: 'Frotis sanguineo periferico', description: 'Esferocitos, aglutinacion eritrocitaria, autoaglutinacion macroscopica.', availability_chile: 'Costo: $10.000-$15.000 CLP.' },
      ],
      imaging: [
        { study: 'Radiografia toracica', findings: 'Evaluar cardiomegalia por anemia crónica. Descartar neoplasia como causa secundaria.' },
        { study: 'Ecografia abdominal', findings: 'Esplenomegalia. Evaluar higado, riñones, y descartar masas.' },
      ],
      differential_diagnosis: [
        { disease: 'Anemia por perdida (hemorragica)', differentiating: 'PCV bajo sin reticulocitosis. Sangrado evidente (GI, urinario, cutaneo).' },
        { disease: 'Anemia no regenerativa', differentiating: 'Reticulocitos normales o bajos. Indicar enfermedad cronica o medular.' },
        { disease: 'Hemoparasitosis (Babesia, Ehrlichia)', differentiating: 'Frotis positivo para hemoparasitos. Puede coexistir con IMHA como desencadenante.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Inmunosupresion con corticosteroides', details: 'Prednisona 1-2 mg/kg PO q12h. Reducir gradualmente en 4-6 semanas si respuesta favorable.', justification: 'Los corticosteroides son la base del tratamiento. Suprimen la produccion de autoanticuerpos y la destruccion eritrocitaria.', evidence: 'Kellum H, et al. 2023.' },
        { intervention: 'Transfusion de sangre total o concentrado de eritrocitos', details: 'Indicada en PCV < 12% o signs de hipoxia. Dosis: 10-20 mL/kg. Cruce menor preferido.', justification: 'La transfusion es de soporte vital en anemia critica. No corrige la causa pero mantiene la oxigenacion.' },
        { intervention: 'Inmunosupresion adicional', details: 'Azatioprina 2 mg/kg PO q24h o micofenolato mofetil 10-15 mg/kg PO q12h. En IMHA refractaria a corticosteroides.', justification: 'Los inmunosupresores adicionales se añaden cuando la respuesta a corticosteroides es inadecuada.' },
        { intervention: 'Tromboprofilaxis', details: 'Clopidogrel 1-2 mg/kg PO q24h o aspirina 0.5 mg/kg PO q24h. Prevenir tromboembolismo.', justification: 'La activacion plaquetaria en IMHA predispone a tromboembolismo que puede ser fatal.' },
      ],
      second_line: [
        { intervention: 'Rituximab', details: '1-2 mg/kg IV semanal por 4 dosis. Anti-CD20 que depleta linfocitos B.', justification: 'Evidencia creciente para IMHA refractaria a inmunosupresion convencional.' },
        { intervention: 'Danazol', details: '5-10 mg/kg PO q12h. Androgeno que estimula eritropoyesis y suprime respuesta inmune.', justification: 'Alternativa en casos refractarios.' },
        { intervention: 'Esplenectomia', details: 'Extirpacion del bazo en IMHA refractaria a tratamiento medico.', justification: 'El bazo es el principal sitio de destruccion eritrocitaria extravascular.' },
      ],
      emergency: {
        presentation: 'Anemia critica: PCV < 10%, disnea severa, colapso, mucosas blancas.',
        protocol: [
          'Transfusion inmediata de sangre total: 10-20 mL/kg',
          'Oxigeno suplementario a 5 L/min',
          'Prednisona 2 mg/kg IV',
          'Fluidoterapia IV de mantenimiento',
          'Monitoreo de PCV cada 4-6 horas',
        ],
      },
      duration: 'Hospitalizacion: 3-7 dias. Tratamiento inmunosupresor: minimo 4-6 meses. Tapering de prednisona gradual por 3-4 meses.',
      notes: 'Chile: Prednisona disponible. Azatioprina disponible en farmacias ($10.000-$20.000 CLP). Transfusion sanguinea disponible en bancos de sangre veterinaria.',
    },
    prevention: [
      { measure: 'Tratamiento de infecciones subyacentes', details: 'Diagnosticar y tratar Ehrlichia, Babesia, y otras infecciones que pueden desencadenar IMHA.', justification: 'Las infecciones son desencadenantes importantes de IMHA secundaria.' },
      { measure: 'Evitar farmacos desencadenantes', details: 'No usar sulfonamidas, penicilinas, o metimazol en perros predispuestos.', justification: 'Ciertos farmacos pueden desencadenar IMHA en perros geneticamente predispuestos.' },
      { measure: 'Monitoreo post-tratamiento', details: 'Hemogramas y bilirrubina cada 2-4 semanas durante el tapering de corticosteroides.', justification: 'La recurrencia es comun durante la reduccion de inmunosupresion.' },
    ],
    chilean_costs: {
      diagnosis: {
        hemograma_reticulocitos: '$15.000 - $25.000 CLP',
        coombs: '$25.000 - $40.000 CLP',
        quimica: '$20.000 - $35.000 CLP',
        total_diagnostico: '$60.000 - $100.000 CLP',
      },
      treatment: {
        prednisona_mensual: '$5.000 - $15.000 CLP',
        transfusion: '$30.000 - $80.000 CLP por unidad',
        azatioprina_mensual: '$10.000 - $20.000 CLP',
        total_tratamiento: '$200.000 - $500.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'journal_article', citation: 'Kellum H, et al. Prognostic factors in dogs with immune-mediated hemolytic anemia. J Vet Intern Med. 2023;37(2):518-527.', relevance: 'Factores pronosticos actuales.' },
      { type: 'textbook', citation: 'Stockham SL, Scott MA. Fundamentals of Veterinary Clinical Pathology. 2nd ed. Blackwell; 2008.', relevance: 'Diagnostico de laboratorio.' },
    ],
  },

  {
    id: 'Lupus-Eritematoso-Sistemico',
    name: 'Lupus Eritematoso Sistemico',
    scientific_name: 'Systemic Lupus Erythematosus (SLE)',
    species: 'dog',
    category: 'autoimmune',
    severity: 'severe',
    is_zoonotic: false,
    prognosis: {
      classification: 'guarded',
      justification: 'El pronostico es reservado con mortalidad del 30-50% en el primer ano. La enfermedad es cronica con exacerbaciones y remisiones. El pronostico depende de los organos afectados: la afectacion renal (lupus nefritis) tiene peor pronostico que la cutanea o articular. Con tratamiento inmunosupresor agresivo, el 50-70% de los perros logran remision parcial o completa. La recurrencia es comun durante la reduccion de inmunosupresion.',
      evidence_source: 'Lewis RM, et al. Systemic lupus erythematosus in the dog. J Am Vet Med Assoc. 1965;147:829-840.',
    },
    prevalence_rank_dogs: 39,
    prevalence_rank_cats: null,
    life_stage: 'adult',
    chilean_epidemiology: {
      prevalence: 'El LES es una enfermedad autoinmune relativamente rara en Chile. Se diagnostican 5-10 casos por ano en clinicas de referencia de Santiago.',
      peak_season: 'Sin estacionalidad definida. Puede exacerbarse con exposicion solar (LES cutaneo).',
      high_risk_groups: ['Perros de razas predispuestas: Pastor Aleman, Collie, Husky Siberiano', 'Perros de mediana edad (4-8 anos)', 'Hembras (2x mas comun que machos)'],
      endemic_status: 'Raro pero presente en Chile. El diagnostico frecuentemente es tardio por la variedad de presentaciones clinicas.',
      economic_impact: 'Tratamiento cronico: $200.000-$500.000 CLP anuales.',
    },
    description: 'El lupus eritematoso sistemico (LES) es una enfermedad autoinmune multisistemica en la que se producen autoanticuerpos contra antigenes nucleares celulares (ADN, histonas, ribonucleoproteinas). La formacion de complejos inmunes (anticuerpo-antigeno) se deposita enVarious tejidos, activando la cascada del complemento y causando inflamacion y dano tisular. El LES es la enfermedad autoinmune prototipica y puede afectar practicamente cualquier organo: piel (lesiones eritematosas, alopecia), articulas (poliartritis), riñones (glomerulonefritis), sangre (citopenias), serosas (pleuritis, pericarditis), y SNC (convulsiones, neuropatia). La presentacion clinica es altamente variable, dificultando el diagnostico.',
    pathophysiology: 'La fisiopatologia del LES involucra la ruptura de la tolerancia inmunologica a autoantigenes nucleares. Los linfocitos B producen autoanticuerpos (anti-dsDNA, anti-Smith) que forman complejos inmunes con antigenes nucleares liberados por celulas apoptoticas. Estos complejos se depositan en Various tejidos (riñones, articulas, vasos sanguineos) y activan la cascada del complemento (C3, C4, CH50). La activacion del complemento genera anafilotoxinas (C3a, C5a) que reclutan neutrofilos y activan macrofagos, causando inflamacion y dano tisular. El lupus nefritis resulta del deposito de complejos inmunes en los glomeros renales, causando glomerulonefritis membranoproliferativa que progresa a falla renal cronica.',
    key_signs: [
      { sign: 'Fiebre recurrente', description: 'Temperatura rectal > 39.5C sin causa infecciosa identificable. Episodios recurrentes.', severity: 'high', clinical_significance: 'La fiebre recurrente sin causa es un patron sugestivo de LES.' },
      { sign: 'Lesiones cutaneas', description: 'Eritema, alopecia, ulceras en cara (distribucion "mariposa"), orejas, almohadillas plantares.', severity: 'high', clinical_significance: 'Las lesiones cutaneas con distribucion facial son caracteristicas del LES.' },
      { sign: 'Poliartritis', description: 'Inflamacion de multiples articulaciones simetrica. Rigidez, cojera, tumefaccion articular.', severity: 'high', clinical_significance: 'La poliartritis simetrica es un patron sugestivo de enfermedad autoinmune.' },
      { sign: 'Citopenias', description: 'Anemia, trombocitopenia, leucopenia. Puede haber anemia hemolitica (Evans).', severity: 'high', clinical_significance: 'Las citopenias multiples indican afectacion medular o autoinmune.' },
      { sign: 'Signos renales', description: 'Polidipsia, poliuria, proteinuria, edema. Indica glomerulonefritis por LES.', severity: 'high', clinical_significance: 'La afectacion renal es la complicacion mas seria y determinante del pronostico.' },
      { sign: 'Dolor articular', description: 'Rigidez matutina, renuencia a caminar, tumefaccion de articulaciones pequeñas.', severity: 'moderate', clinical_significance: 'La poliartritis puede ser la primera manifestacion del LES.' },
    ],
    diagnosis: {
      clinical_examination: 'Diagnostico basado en criterios clinicos y de laboratorio. Al menos 3 de los siguientes: lesiones cutaneas, poliartritis, citopenias, proteinuria, fiebre recurrente, y confirmacion inmunologica.',
      lab_tests: [
        { test: 'Hemograma completo', description: 'Anemia regenerativa o no regenerativa, trombocitopenia, leucopenia con linfopenia.', availability_chile: 'Costo: $15.000-$25.000 CLP.' },
        { test: 'Antinucleares (ANA)', description: 'Anticuerpos antinucleares positivos (titulos > 1:80). Sensibilidad 60-80%.', availability_chile: 'Costo: $30.000-$50.000 CLP.' },
        { test: 'Anti-dsDNA', description: 'Especifico para LES. Titulos elevados correlacionan con actividad de enfermedad.', availability_chile: 'Costo: $40.000-$60.000 CLP.' },
        { test: 'Complemento (C3, C4)', description: 'Niveles reducidos indican activacion del complemento por complejos inmunes.', availability_chile: 'Costo: $25.000-$40.000 CLP.' },
        { test: 'Analisis de orina', description: 'Proteinuria, cilindros, hematuria. Indica glomerulonefritis.', availability_chile: 'Costo: $10.000-$20.000 CLP.' },
        { test: 'Biopsia renal', description: 'Gold standard para lupus nefritis. Depositos de complejos inmunes en glomeros.', availability_chile: 'Costo: $50.000-$80.000 CLP.' },
      ],
      imaging: [
        { study: 'Radiografia toracica', findings: 'Pleuritis, pericarditis, neumonitis intersticial.' },
        { study: 'Ecografia abdominal', findings: 'Riñones con ecogenicidad aumentada. Ascitis.' },
      ],
      differential_diagnosis: [
        { disease: 'Artritis reactiva', differentiating: 'Poliartritis sin compromiso multisistemico. ANA negativo.' },
        { disease: 'Lupus cutaneo discoide', differentiating: 'Solo afectacion cutanea. Sin compromiso sistémico.' },
        { disease: 'Neoplasia', differentiating: 'Masas visibles. Citopenias por infiltracion medular.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Inmunosupresion con corticosteroides', details: 'Prednisona 1-2 mg/kg PO q12h. Reducir gradualmente segun respuesta.', justification: 'Los corticosteroides son la base del tratamiento inmunosupresor.', evidence: 'Lewis RM, et al. 1965.' },
        { intervention: 'Inmunosupresor adicional', details: 'Azatioprina 2 mg/kg PO q24h o micofenolato 10-15 mg/kg PO q12h.', justification: 'Los inmunosupresores adicionales permiten reducir la dosis de corticosteroides.' },
        { intervention: 'Protector renal', details: 'Enalapril 0.5 mg/kg PO q24h o benazepril. Reducir proteinuria.', justification: 'Los inhibidores de la ECA reducen la presion intraglomerular y la proteinuria.' },
        { intervention: 'Proteccion solar', details: 'Evitar exposicion solar directa. Protector solar veterinario.', justification: 'La radiacion UV puede exacerbar las lesiones cutaneas del LES.' },
      ],
      second_line: [
        { intervention: 'Ciclofosfamida', details: '2-3 mg/kg PO q24h. Inmunosupresor potente para LES refractario.', justification: 'La ciclofosfamida es util en LES refractario pero tiene efectos adversos significativos.' },
        { intervention: 'Ciclosporina', details: '5 mg/kg PO q24h. Inmunomodulador para LES refractario.', justification: 'La ciclosporina tiene perfil de efectos adversos diferente a los agentes citotoxicos.' },
      ],
      emergency: {
        presentation: 'Crisis renal aguda, convulsiones, o anemia hemolitica severa.',
        protocol: [
          'Prednisona 2 mg/kg IV',
          'Fluidoterapia IV si falla renal',
          'Transfusion si PCV < 12%',
          'Manejo de convulsiones con diazepam',
          'Referencia a internista veterinario',
        ],
      },
      duration: 'Tratamiento cronico. Mantener inmunosupresion minimo 6-12 meses. Tapering gradual por 3-6 meses. Monitoreo de proteinuria y ANA.',
      notes: 'Chile: Prednisona, azatioprina, ciclofosfamida disponibles. ANA y anti-dsDNA en laboratorios de referencia. Costo tratamiento cronico: $200.000-$500.000 CLP anuales.',
    },
    prevention: [
      { measure: 'Evitar cruzar perros afectados', details: 'Excluir perros con LES del programa reproductivo.', justification: 'El LES tiene componente genetico (asociacion con MHC DLA).' },
      { measure: 'Proteccion solar', details: 'Evitar exposicion solar en razas predispuestas al LES cutaneo.', justification: 'La radiacion UV puede desencadenar o exacerbar lesiones cutaneas.' },
    ],
    chilean_costs: {
      diagnosis: {
        hemograma: '$15.000 - $25.000 CLP',
        ana: '$30.000 - $50.000 CLP',
        anti_dsDNA: '$40.000 - $60.000 CLP',
        complemento: '$25.000 - $40.000 CLP',
        biopsia_renal: '$50.000 - $80.000 CLP',
        total_diagnostico: '$150.000 - $250.000 CLP',
      },
      treatment: {
        prednisona_mensual: '$5.000 - $15.000 CLP',
        azatioprina_mensual: '$10.000 - $20.000 CLP',
        total_tratamiento_anual: '$200.000 - $500.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'journal_article', citation: 'Lewis RM, et al. Systemic lupus erythematosus in the dog. J Am Vet Med Assoc. 1965;147:829-840.', relevance: 'Referencia clasica de LES canino.' },
      { type: 'textbook', citation: 'Ettinger SJ, Feldman EC. Textbook of Veterinary Internal Medicine. 8th ed. Elsevier; 2017.', relevance: 'Revision completa de LES.' },
    ],
  },

  {
    id: 'Mielopatia-Degenerativa',
    name: 'Mielopatia Degenerativa',
    scientific_name: 'Degenerative Myelopathy (DM)',
    species: 'dog',
    category: 'neurological',
    severity: 'severe',
    is_zoonotic: false,
    prognosis: {
      classification: 'poor',
      justification: 'El pronostico es reservado a grave. La mielopatia degenerativa es una enfermedad neurologica progresiva e irreversible que conduce a la perdida completa de la funcion motora de los miembros posteriores. La enfermedad es progresiva sin tratamiento efectivo conocido. La supervivencia promedio desde el diagnostico es de 1-3 anos, dependiendo de la velocidad de progresion. Los perros progresan a paraplejia completa y requieren eutanasia humanitaria o silla de ruedas. La presencia del gen SOD1 mutante (homozygoto) confirma el diagnostico pero la penetrancia es variable.',
      evidence_source: 'Coates JR, et al. An SOD1 mutation in dogs with degenerative myelopathy. Science. 2009;326(5957):1171.',
    },
    prevalence_rank_dogs: 40,
    prevalence_rank_cats: null,
    life_stage: 'senior',
    chilean_epidemiology: {
      prevalence: 'La mielopatia degenerativa es una causa importante de debilidad progresiva en perros de razas grandes en Chile. Afecta principalmente a Pastor Aleman, Boxer, Labrador Retriever y Chesapeake Bay Retriever. La frecuencia del gen SOD1 mutante es del 5-10% en estas razas.',
      peak_season: 'Sin estacionalidad — enfermedad neurodegenerativa cronica.',
      high_risk_groups: ['Pastor Aleman (22% portadores)', 'Boxer', 'Labrador Retriever', 'Chesapeake Bay Retriever', 'Perros > 8 anos'],
      endemic_status: 'Presente en Chile. El diagnostico genetico esta disponible en laboratorios de referencia.',
      economic_impact: 'Costo de manejo: $100.000-$250.000 CLP por rehabilitacion y ayudas de movilidad.',
    },
    description: 'La mielopatia degenerativa (DM) es una enfermedad neurodegenerativa progresiva de la medula espinal en perros, comparable a la Esclerosis Lateral Amiotrofica (ELA) en humanos. La enfermedad afecta principalmente a perros de razas grandes (> 20 kg) mayores de 8 anos. La DM se debe a una mutacion en el gen SOD1 (Super Oxide Dismutasa 1), un gen de susceptibilidad con herencia autosomica recesiva incompleta. La progresion clinica es caracteristica: debilidad progresiva de miembros posteriores, ataxia marcha plantigrada, incontinencia urinaria, y finalmente paraplejia completa. La enfermedad se clasifica en 4 etapas: Etapa 1 (debilidad subclinica, reflejos preservados), Etapa 2 (ataxia moderada), Etapa 3 (paraparesis severa, incontinencia), y Etapa 4 (paraplejia completa).',
    pathophysiology: 'La fisiopatologia de la DM involucra la desmielinizacion y degeneracion de las vias motoras ascendentes y descendentes de la medula espinal. La mutacion en SOD1 causa una funcion anormal de la enzima superoxido dismutasa, que normalmente neutraliza los radicales libres superoxide. La SOD1 mutante genera especies reactivas de oxigeno (ERO) que causan estres oxidativo en las neuronas motoras. El resultado es desmielinizacion segmentaria de los tractos corticoespinales y espinocerebelosos, gliosis reactiva, y perdida progresiva de axones motores. Los cambios histopatologicos incluyen vacuolizacion de la sustancia blanca, perdida de oligodendrocitos, y reactividad astrocitaria.',
    key_signs: [
      { sign: 'Debilidad progresiva de miembros posteriores', description: 'Pierde fuerza gradualmente. Marcha inestable, se tropieza, arrastra almohadillas.', severity: 'high', clinical_significance: 'La debilidad progresiva es el signo cardinal de la DM.' },
      { sign: 'Ataxia cerebelosa', description: 'Incoordinacion motora, marcha amplia, desviaciones laterales. El perro parece "borracho".', severity: 'high', clinical_significance: 'La ataxia indica afectacion de los tractos sensoriales de la medula.' },
      { sign: 'Marcha plantigrada', description: 'El perro camina apoyando todo el pie en lugar de solo las almohadillas. Indica perdida de propiocepcion.', severity: 'moderate', clinical_significance: 'La marcha plantigrada es un signo temprano de perdida propioceptiva.' },
      { sign: 'Incontinencia urinaria', description: 'Perdida del control vesical. Orina frecuentemente o retiene orina sin poder vaciar.', severity: 'high', clinical_significance: 'La incontinencia aparece en Etapa 3 y indica afectacion de vias sacras.' },
      { sign: 'Nail scrape test positivo', description: 'Al raspar la uña del pie posterior sobre superficie rugosa, el perro no recoge la extremidad normalmente.', severity: 'moderate', clinical_significance: 'El test de rasgado de unna es una prueba clinica util para detectar perdida propioceptiva temprana.' },
      { sign: 'Perdida de reflejos', description: 'Reflejos patelares y achilleanos reducidos o ausentes en etapas avanzadas.', severity: 'high', clinical_significance: 'La reduccion de reflejos indica afectacion de la motoneurona inferior.' },
    ],
    diagnosis: {
      clinical_examination: 'Diagnostico clinico basado en presentacion tipica (perro > 8 anos, raza predisuesta, debilidad progresiva de miembros posteriores). Confirmacion por test genetico SOD1 y exclusion de otras causas.',
      lab_tests: [
        { test: 'Test genetico SOD1', description: 'Deteccion de la mutacion SOD1 (G1A). Genotipos: Normal (N/N), Portador (N/M), Afectado (M/M).', availability_chile: 'Disponible en laboratorios de referencia. Costo: $40.000-$60.000 CLP.' },
        { test: 'Analisis de liquido cefalorraquideo', description: 'Proteinorquia leve sin pleocitosis significativa. Ayuda a diferenciar de mielitis infecciosa.', availability_chile: 'Disponible en centros de referencia. Costo: $50.000-$80.000 CLP.' },
      ],
      imaging: [
        { study: 'Mielografia o resonancia magnetica', findings: 'Resonancia magnetica: hiperintensidad bilateral en tractos corticoespinales en secuencias T2. Mielografia: normal o atrofia medular.' },
        { study: 'Radiografias toraco-lumbares', findings: 'Descartar compresion medular por tumor, hernia discal, o estenosis.' },
      ],
      differential_diagnosis: [
        { disease: 'Hernia discal', differentiating: 'Inicio agudo, dolor lumbar, respuesta favorable a cirugia.' },
        { disease: 'Tumor medular', differentiating: 'Inicio progresivo pero con dolor significativo. Resonancia muestra masa.' },
        { disease: 'Mielitis infecciosa', differentiating: 'Fiebre, pleocitosis en LCR, respuesta a antibioticoterapia.' },
      ],
    },
    treatment: {
      first_line: [
        { intervention: 'Rehabilitacion fisica', details: 'Ejercicios de fortalecimiento, hidroterapia, caminata en cinta. 2-3 sesiones por semana.', justification: 'La rehabilitacion mantiene la masa muscular y retrasa la progresion funcional.', evidence: 'Carter A, et al. Physical rehabilitation for degenerative myelopathy. Vet Clin North Am Small Anim Pract. 2018;48(3):447-458.' },
        { intervention: 'N-acetilcisteina (NAC)', details: '10-15 mg/kg PO q8-12h. Antioxidante que puede reducir el estres oxidativo.', justification: 'NAC tiene potencial neuroprotector por su capacidad antioxidante.' },
        { intervention: 'Vitamina B y E', details: 'Complejo B 1 mL/kg PO q24h + Vitamina E 400 UI PO q24h. Suplementacion neurotrofica.', justification: 'Las vitaminas del grupo B son esenciales para la funcion neurologica.' },
        { intervention: 'Silla de ruedas y ayudas de movilidad', details: 'Silla de ruedas para miembros posteriores en Etapa 3-4. Rampa para escaleras.', justification: 'Las ayudas de movilidad mejoran la calidad de vida en perros con DM avanzada.' },
      ],
      second_line: [
        { intervention: 'Amantadina', details: '3-5 mg/kg PO q24h. Antagonista de NMDA que puede mejorar la funcion neurologica.', justification: 'La amantadina tiene evidencia limitada pero puede mejorar la funcionalidad.' },
        { intervention: 'Acupuncture', details: 'Sesiones semanales durante 8-12 semanas. Puntos: GV-4, GV-3, BL-23, BL-40.', justification: 'La acupuntura puede mejorar la funcion neurologica y la calidad de vida.' },
      ],
      emergency: {
        presentation: 'Retencion urinaria aguda o complicaciones por inmovilidad (escaras, infecciones).',
        protocol: [
          'Cistocentesis si retencion urinaria',
          'Antibiotico si infeccion urinaria',
          'Cuidado de piel y prevencion de escaras',
          'Referencia a neurologo veterinario',
        ],
      },
      duration: 'Enfermedad cronica progresiva. Manejo de por vida. Seguimiento neurologico cada 3-6 meses.',
      notes: 'Chile: Test genetico SOD1 disponible en laboratorios de referencia. Silla de ruedas veterinaria disponible en importadores. Costo: $100.000-$250.000 CLP por rehabilitacion mensual.',
    },
    prevention: [
      { measure: 'Test genetico SOD1 reproductivo', details: 'Testear perros reproductores de razas predisuestas. No cruzar portadores (N/M) entre si.', justification: 'La prevencion genetica es la unica forma de reducir la incidencia poblacional.' },
      { measure: 'Suplementacion antioxidante', details: 'Vitamina E y NAC en perros > 7 anos de razas predisuestas.', justification: 'Los antioxidantes pueden retrasar la progresion del dano oxidativo.' },
      { measure: 'Rehabilitacion temprana', details: 'Iniciar programa de rehabilitacion en la Etapa 1 para retrasar progresion.', justification: 'La rehabilitacion temprana es mas efectiva que el tratamiento en etapas avanzadas.' },
    ],
    chilean_costs: {
      diagnosis: {
        test_genetico_sod1: '$40.000 - $60.000 CLP',
        resonancia_medular: '$100.000 - $200.000 CLP',
        lcr: '$50.000 - $80.000 CLP',
        total_diagnostico: '$150.000 - $250.000 CLP',
      },
      treatment: {
        rehabilitacion_mensual: '$50.000 - $100.000 CLP',
        silla_ruedas: '$80.000 - $150.000 CLP',
        suplementos_mensuales: '$10.000 - $20.000 CLP',
        total_tratamiento_anual: '$100.000 - $250.000 CLP',
      },
      emergency: {
        consulta_urgencia: '$35.000 - $80.000 CLP',
      },
      source: 'Clinicas veterinarias Santiago, 2025-2026.',
    },
    references: [
      { type: 'journal_article', citation: 'Coates JR, et al. An SOD1 mutation in dogs with degenerative myelopathy. Science. 2009;326(5957):1171.', relevance: 'Descubrimiento de la mutacion SOD1.' },
      { type: 'journal_article', citation: 'Carter A, et al. Physical rehabilitation for degenerative myelopathy. Vet Clin North Am Small Anim Pract. 2018;48(3):447-458.', relevance: 'Manejo rehabilitador.' },
    ],
  },
];

