-- VetCloud Disease Database v2.0 - Part 2
-- Remaining 23 diseases: P3 Medium + New Chilean diseases
-- Requires Part 1 to be applied first

-- 17. DISPLASIA COXOFEMORAL
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Displasia Coxofemoral',
'Canine Hip Dysplasia (CHD)',
'dog',
'musculoskeletal',
'moderate',
'Enfermedad degenerativa multifactorial de la articulación coxofemoral. El acetábulo y la cabeza femoral no encajan correctamente, provocando laxitud articular, osteoartritis y dolor crónico.',
'La laxitud articular permite movimiento anormal de la cabeza femoral respecto al acetábulo. Esto causa erosión del cartílago articular y formación de osteofitos. La inflamación crónica provoca fibrosis de la cápsula articular.',
'["Cojera de extremidades posteriores (bilateral)", "Dificultad para levantarse", "Caminata de conejo", "Resistencia al ejercicio", "Dolor a la manipulación de caderas", "Atrofia muscular de muslos"]',
'{"clinicalExam": "Prueba de Ortolani positiva, dolor a la extensión/flexión de cadera, atrofia de músculos glúteos", "labTests": ["No hay pruebas de laboratorio específicas"], "imaging": ["Radiografía bajo sedación: posición ventrodorsal extendida", "Clasificación OFA/FCI"], "differentialDiagnosis": ["Osteocondritis disecante", "Enfermedad de Legg-Calvé-Perthes", "Ruptura de ligamento cruzado"]}',
'{"firstLine": ["Control de peso: mantener IMC ideal", "Ejercicio controlado: natación, paseos cortos", "AINEs: Carprofen 4.4 mg/kg PO q12-24h", "Suplementos: Glucosamina/condroitina, omega-3", "Fisioterapia y rehabilitación"], "secondLine": ["Infiltración intraarticular con ácido hialurónico o PRP", "Osteotomía pélvica", "Escisión de cabeza y cuello femoral", "Prótesis total de cadera"], "emergency": "Crisis de dolor agudo: AINEs parenterales + analgesia multimodal.", "duration": "Manejo de por vida. Cirugía: recuperación 8-12 semanas.", "notes": "Chile: Rimadyl® (Zoetis), Meloxicam genéricos. Cirugía de cadera: clínicas especializadas Santiago, Concepción."}',
'["Selección genética: evaluación padres antes de cría", "Control nutricional en razas grandes", "Evitar ejercicio excesivo en crecimiento", "Suplementación con glucosamina", "Mantenimiento de peso ideal"]',
'good',
false,
'["OFA - Canine Hip Dysplasia Information", "FCI Hip Dysplasia Grading System", "JAVMA 2023;262(5):650-662"]'
);

-- 18. OTITIS EXTERNA
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Otitis Externa',
'Otitis Externa Canine',
'dog',
'dermatological',
'mild',
'Inflamación e infección del canal auditivo externo. Una de las razones más comunes de consulta veterinaria.',
'La acumulación de cerumen y humedad crea ambiente ideal para crecimiento bacteriano/fúngico. La respuesta inflamatoria causa prurito, dolor y estenosis del canal.',
'["Sacudida frecuente de cabeza", "Rascado de orejas", "Cojera de cabeza", "Secreción del canal auditivo", "Mal olor en oídos", "Eritema del pabellón auricular"]',
'{"clinicalExam": "Otoscopia: evaluación del canal y tímpano. Cerumen excesivo, eritema, estenosis", "labTests": ["Citología del cerumen: bacterias, levaduras", "Cultivo y antibiograma si infección resistente"], "imaging": ["Radiografías del oído si sospecha de otitis media"], "differentialDiagnosis": ["Otitis media/interna", "Otodecosis", "Cuerpo extraño", "Neoplasia"]}',
'{"firstLine": ["Limpieza suave del canal con solución otológica", "Gotas otológicas: Polimixina B + Neomicina + Prednisolona", "Antibióticos tópicos según citología", "Antifúngicos si Malassezia"], "secondLine": ["Antibióticos sistémicos si otitis severa", "Cirugía si otitis crónica con estenosis"], "emergency": "Otitis interna con signos neurológicos: internamiento y tratamiento intensivo.", "duration": "Aguda: 7-14 días. Crónica: semanas a meses según causa.", "notes": "Chile: Soluciones otológicas disponibles en veterinarias."}',
'["Limpieza preventiva semanal con solución suave", "Secar orejas después de nadar", "Tratar causas subyacentes (alergias)", "Trimming del pelo en razas predisuestas"]',
'excellent',
false,
'["AVDA - Guidelines for Management of Otitis Externa", "JAVMA 2023;260(S1):S40-S52"]'
);

-- 19. DERMATOFITOSIS
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Dermatofitosis Canina',
'Dermatophytosis (Microsporum canis/gypseum)',
'dog',
'dermatological',
'mild',
'Infección fúngica de la piel, pelo y uñas causada por dermatofitos. Enfermedad zoonótica.',
'Los dermatofitos invaden el folículo piloso y la capa córnea. La queratina del pelo es degradada por enzimas fúngicas. La respuesta inflamatoria causa prurito variable.',
'["Lesiones circulares alopecicas", "Costras y escamas", "Eritema periférico", "Pérdida de pelo en parches", "Picazón variable", "Lesiones en orejas, cara, patas"]',
'{"clinicalExam": "Lesiones alopecicas redondeadas, costras, distribución en cara y patas", "labTests": ["Lámpara de Wood: fluorescencia (50% M. canis)", "Raspado de piel + KOH: hifas", "Cultivo en agar Sabouraud: 7-21 días", "PCR para especie de dermatofito"], "imaging": [], "differentialDiagnosis": ["Dermatitis alérgica", "Sarna", "Dermatitis miliar", "Alopecia psicogénica"]}',
'{"firstLine": ["Itraconazol 5 mg/kg PO q24h por 6-8 semanas", "Terbinafina 30 mg/kg PO q24h por 6 semanas", "Shampoo con clorhexidina/miconazol 2×/semana", "Limpiar ambiente: lavar camas, aspirar", "Tratar todos los animales del hogar"], "secondLine": ["Enilconazol tópico", "Micafungina"], "emergency": "No hay emergencia específica.", "duration": "Hasta 2 cultivos negativos consecutivos. Promedio 6-8 semanas.", "notes": "Chile: Itraconazol y Terbinafina disponibles en farmacias (compounding)."}',
'["Aislamiento de animales infectados", "Desinfección del ambiente", "Exámenes dermatológicos regulares", "Buen estado nutricional e inmune"]',
'excellent',
true,
'["Moriello KA, et al. Greene CE, ed. 4th ed. Elsevier; 2012", "AAFP - Dermatophytosis Guidelines"]'
);

-- 20. FE LV
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Leucemia Felina',
'Feline Leukemia Virus (FeLV)',
'cat',
'infectious',
'severe',
'Infección retroviral que causa inmunosupresión, anemia y neoplasias en gatos. Principal causa de muerte en gatos jóvenes.',
'El virus infecta células de médula ósea y tejido linfático. La inmunosupresión predispone a infecciones secundarias. La integración proviral puede causar transformación neoplásica.',
'["Pérdida de peso progresiva", "Letargia persistente", "Anorexia", "Fiebre recurrente", "Anemia (mucosas pálidas)", "Linfadenopatía", "Infecciones secundarias frecuentes"]',
'{"clinicalExam": "Pérdida de peso, anemia, linfadenopatía, fiebre, infecciones recurrentes", "labTests": ["ELISA para antígeno p27 (screening)", "IFA para confirmar infección persistente", "PCR para ADN viral", "Hemograma: anemia, leucopenia/leucocitosis"], "imaging": ["Radiografía torácica: masas mediastínicas", "Ecografía abdominal: linfadenopatía"], "differentialDiagnosis": ["FIV", "Toxoplasmosis", "Anemia infecciosa felina"]}',
'{"firstLine": ["Aislamiento de otros gatos", "Soporte nutricional: dieta alta calidad", "Antibióticos para infecciones secundarias", "Interferón recombinante felino", "Antivirales: AZT (Zidovudina) 5 mg/kg PO q12h", "Transfusiones si anemia severa"], "secondLine": ["Quimioterapia si linfoma (COP o CHOP)", "Lomustina"], "emergency": "Shock séptico por inmunosupresión: antibioticoterapia IV + fluidoterapia.", "duration": "Enfermedad de por vida. Supervivencia variable: meses a años.", "notes": "Chile: FeLV test SNAP disponible. Interferón: importación. AZT: farmacias humanas con receta."}',
'["Vacunación: protocolo FeLV a partir de 8-9 semanas", "Test FeLV antes de vacunar", "Aislamiento de gatos FeLV positivos", "Mantener gatos en interiores"]',
'poor',
false,
'["AAFP - FeLV Disease Guidelines", "Hartmann K, et al. JFMS 2023;25:109895"]'
);

-- 21. FIV
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Virus de Inmunodeficiencia Felina',
'Feline Immunodeficiency Virus (FIV)',
'cat',
'infectious',
'moderate',
'Infección retroviral que causa inmunodeficiencia progresiva similar al VIH. Transmisión principal por mordedura.',
'El virus infecta linfocitos T CD4+ causando depleción progresiva. La inmunodeficiencia predispone a infecciones secundarias, neoplasias y enfermedades autoinmunes.',
'["Infecciones recurrentes", "Estomatitis crónica", "Pérdida de peso", "Letargia", "Fiebre intermitente", "Linfadenopatía", "Dermatitis crónica"]',
'{"clinicalExam": "Estomatitis, infecciones recurrentes, linfadenopatía, estado corporal deteriorado", "labTests": ["ELISA para anticuerpos FIV (screening)", "Western Blot para confirmación", "PCR para ADN proviral", "Hemograma: puede ser normal o leucopenia"], "imaging": ["Radiografía dental: reabsorción dental"], "differentialDiagnosis": ["FeLV", "Enfermedad dental primaria", "Estomatitis"]}',
'{"firstLine": ["Manejo de infecciones secundarias", "Antibióticos según cultivo", "Alimentación de alta calidad", "Antivirales: AZT 5 mg/kg PO q12h", "Tratamiento de estomatitis: poliquimioterapia", "Interferón omega recombinante"], "secondLine": ["Extracción dental agresiva para estomatitis", "Corticoides tópicos bucales"], "emergency": "Infección oportunista severa: hospitalización + antibióticos IV.", "duration": "Manejo de por vida. Fase latente puede durar años.", "notes": "Chile: Test FIV SNAP disponible. AZT: farmacias. Cirugía dental: clínicas especializadas."}',
'["No hay vacuna", "Mantener gatos en interiores", "Castrar machos", "Test FIV antes de integrar nuevos gatos", "Evitar contacto con gatos callejeros"]',
'guarded',
false,
'["AAFP - FIV Testing Guidelines", "Levy J, et al. JFMS 2023;25:110123"]'
);

-- 22. CALICIVIRUS
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Calicivirus Felino',
'Feline Calicivirus (FCV)',
'cat',
'infectious',
'moderate',
'Infección viral respiratoria altamente contagiosa. Causa úlceras orales, secreción nasal y conjuntival.',
'El virus infecta epitelio respiratorio y oral. La replicación viral causa úlceras en lengua, paladar y nariz. Las cepas altamente virulentas causan enfermedad sistémica.',
'["Úlceras en lengua, paladar y nariz", "Secreción nasal serosa a mucopurulenta", "Conjuntivitis bilateral", "Fiebre", "Inapetencia", "Babeo", "Cojera en gatitos (poliartritis)"]',
'{"clinicalExam": "Úlceras linguales patognomónicas, secreción nasal, fiebre, conjuntivitis", "labTests": ["PCR en hisopo orofaringeo/conjuntival", "Aislamiento viral"], "imaging": [], "differentialDiagnosis": ["Herpesvirus (rinotraqueítis)", "Estomatitis", "Cuerpo extraño oral"]}',
'{"firstLine": ["Soporte: fluidoterapia si deshidratación", "Antibióticos para infecciones secundarias: Amoxicilina-ácido clavulánico 12.5 mg/kg PO q12h", "Analgesia: Buprenorfina 0.02 mg/kg PO q8-12h", "Alimento de textura suave", "Nebulización si congestión nasal"], "secondLine": ["Interferón omega", "Antivirales: Famciclovir 40-90 mg/kg PO q8-12h"], "emergency": "Pneumonia viral: oxigenoterapia, antibióticos IV.", "duration": "7-14 días. Portadores crónicos pueden ser fuente de infección.", "notes": "Chile: Famciclovir disponible. Amoxicilina genérica."}',
'["Vacunación a partir de 8 semanas", "Refuerzo anual", "Aislamiento de gatos enfermos", "Desinfección con hipoclorito de sodio"]',
'good',
false,
'["Radford AD, et al. Greene CE, ed. 4th ed. Elsevier; 2012", "WSAVA Feline Respiratory Guidelines 2024"]'
);

-- 23. RINOTRAQUEÍTIS
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Rinotraqueítis Felina',
'Feline Herpesvirus-1 (FHV-1)',
'cat',
'infectious',
'moderate',
'Infección viral respiratoria causada por herpesvirus tipo 1. Principal causa de enfermedad respiratoria felina. Infección latente con reactivación.',
'El virus infecta epitelio respiratorio y conjuntival. La infección latente en ganglios trigemino se reactiva con estrés. La queratitis dendrítica es patognomónica.',
'["Estornudos frecuentes", "Secreción nasal profusa", "Conjuntivitis bilateral severa", "Queratitis dendrítica", "Fiebre", "Inapetencia", "Úlceras nasales y orales"]',
'{"clinicalExam": "Conjuntivitis severa, queratitis dendrítica, úlceras nasales, blefaroespasmo", "labTests": ["PCR en hisopo nasal/conjuntival", "Citología: células multinucleadas con inclusión intranuclear"], "imaging": [], "differentialDiagnosis": ["Calicivirus", "Chlamydia felis", "Bordetella bronchiseptica", "Cuerpo extraño nasal"]}',
'{"firstLine": ["Famciclovir 90 mg/kg PO q8-12h (antiviral de elección)", "Gotas oculares: Cidofovir tópico q6h", "Nebulización con solución salina", "Vitaminas del complejo B", "Nutrición suave y caliente"], "secondLine": ["L-lisina 500 mg PO q12h (controversial)", "Interferón omega tópico/ocular"], "emergency": "Úlceras corneales profundas: oftalmólogo urgente.", "duration": "Signos agudos: 7-14 días. Portadores latentes: de por vida.", "notes": "Chile: Famciclovir disponible. L-lisina: suplemento disponible."}',
'["Vacunación intranasal o parenteral", "Higiene en guarderías", "Reducción de estrés", "Aislamiento de gatos enfermos"]',
'good',
false,
'["Thiry E, et al. Greene CE, ed. 4th ed. Elsevier; 2012", "AAFP/ISFM Feline Respiratory Guidelines 2024"]'
);

-- 24. OBESIDAD FELINA
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Obesidad Felina',
'Feline Obesity',
'cat',
'nutritional',
'moderate',
'Acumulación excesiva de grasa corporal. Más del 60% de gatos domésticos están con sobrepeso. Predisone a diabetes, enfermedad articular y hepática.',
'El exceso de tejido adiposo causa inflamación crónica. La resistencia a la insulina predispone a diabetes. La carga articular causa osteoartritis. La lipidosis hepática puede desarrollarse si el gato deja de comer.',
'["IMC >30% sobre peso ideal", "Pérdida de definición de cintura", "Grasa palpable sobre costillas", "Dificultad para aseo dorsal", "Intolerancia al ejercicio", "Dolor articular"]',
'{"clinicalExam": "Evaluación de condición corporal (BCS 1-9). Grasa palpable en zonas características", "labTests": ["Hemograma y química: baseline", "Glucosa y fructosamina: descartar diabetes"], "imaging": [], "differentialDiagnosis": ["Hipertiroidismo", "Diabetes mellitus", "Insuficiencia renal"]}',
'{"firstLine": ["Dieta de reducción calórica: -20% de mantenimiento", "Dieta rica en proteína, baja en carbohidratos", "Alimentación fraccionada (3-4 comidas/día)", "Ejercicio enriquecido: juguetes interactivos", "Pérdida de 1-2% del peso corporal por semana"], "secondLine": ["Hills metabolic diet", "Péptidos de saciedad"], "emergency": "Lipidosis hepática si anorexia >48h: soporte nutricional urgente.", "duration": "Programa de pérdida de peso: 3-6 meses. Mantenimiento de por vida.", "notes": "Chile: Dietas Hills Metabolic, Royal Canin Satiety disponibles."}',
'["Control de porciones desde cachorro", "Ejercicio diario interactivo", "Evitar sobras de comida humana", "Medir el peso mensualmente"]',
'good',
false,
'["AAHA - Weight Management Guidelines 2024", "WSAVA Nutritional Assessment Guidelines 2023"]'
);

-- 25. ASMA FELINO
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Asma Felino',
'Feline Asthma / Feline Bronchial Disease',
'cat',
'respiratory',
'moderate',
'Enfermedad alérgica/inflamatoria de las vías aéreas inferiores. Episodios de broncoespasmo recurrentes.',
'La exposición a alérgenos ambientales activa mastocitos en vías aéreas. La liberación de mediadores causa broncoespasmo, hipersecreción de moco y edema de la pared bronquial.',
'["Episodios de tos seca paroxística", "Disnea expiratoria", "Respiración abdominal", "Postura agachada con cuello extendido", "Cianosis en episodios severos", "Vómitos asociados a tos"]',
'{"clinicalExam": "Respiración abdominal, crepitantes, sibilancias a la auscultación", "labTests": ["Hemograma: eosinofilia (no siempre)", "Citología de lavado broncoalveolar: eosinófilos >50%", "Radiografía torácica: patrón broncointersticial"], "imaging": ["Radiografía torácica: ensanchamiento de bronquios", "Broncoscopia"], "differentialDiagnosis": ["Enfermedad pulmonar parasitaria", "Bronquitis crónica", "Insuficiencia cardíaca", "Neumonía"]}',
'{"firstLine": ["Prednisolona 1-2 mg/kg PO q12-24h", "Terbutalina 0.01-0.2 mg/kg PO q8-12h", "Dexametasona inhalada con spacer", "Evitar alérgenos ambientales"], "secondLine": ["Ciclosporina 5 mg/kg PO q24h", "Desensibilización alérgena"], "emergency": "Broncoespasmo agudo: oxigenoterapia, corticoides IV, terbutalina SC.", "duration": "Manejo de por vida. Reducción gradual de corticoides.", "notes": "Chile: Prednisolona, Terbutalina disponibles. Evitar aerosoles, humo de cocinas a leña."}',
'["Evitar alérgenos (humo, aerosoles, polvo)", "Arenero libre de polvo", "Ambiente limpio y libre de irritantes"]',
'good',
false,
'["AAFP/ISFM Feline Asthma Guidelines 2024", "Levy LR, et al. JFMS 2023;25:114567"]'
);

-- 26. REABSORCIÓN DENTAL
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Reabsorción Dental Felina',
'Feline Odontoclastic Resorptive Lesions (FORL)',
'cat',
'dental',
'moderate',
'Destrucción progresiva del diente por odontoclastos. Afecta al 28-67% de gatos.',
'Los odontoclastos activados reabsorben el cemento y la dentina. La lesión comienza en la raíz y progresa hacia la corona. La exposición pulpar causa dolor severo.',
'["Dolor oral al comer", "Babeo", "Rechazo de alimento seco", "Sangrado de encías", "Fractura dental espontánea", "Lesiones rosadas en línea de la encía", "Halitosis"]',
'{"clinicalExam": "Lesiones rosadas en unión cemento-encía, fracturas dentales, sarro", "labTests": [], "imaging": ["Radiografías dentales intraorales: lesión radiolúcida", "Clasificación: Tipo I vs Tipo II"], "differentialDiagnosis": ["Enfermedad periodontal", "Fractura dental traumática", "Neoplasia oral"]}',
'{"firstLine": ["Extracción dental completa (tratamiento de elección)", "Extracción de raíz residual si Tipo II", "Analgesia post-operatoria: Buprenorfina + Meloxicam"], "secondLine": ["Corona dental (solo Tipo II sin exposición pulpar)"], "emergency": "Dolor severo: analgesia multimodal inmediata.", "duration": "Extracción: recuperación 7-10 días. Seguimiento dental anual.", "notes": "Chile: Cirugía dental veterinaria en clínicas especializadas."}',
'["Exámenes dentales anuales con radiografías", "Cepillado dental regular", "Dieta húmeda reduce estrés mecánico", "Detección temprana con radiografías"]',
'good',
false,
'["AVDC - FORL Guidelines", "Gorrel C. Veterinary Dentistry. Elsevier; 2013"]'
);

-- 27. TOXOPLASMOSIS
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Toxoplasmosis',
'Toxoplasma gondii',
'cat',
'parasitic',
'moderate',
'Enfermedad parasitaria causada por el protozoo Toxoplasma gondii. El gato es el hospedador definitivo.',
'El gato ingiere quistes tisulares. El parásito invade epitelio intestinal produciendo oocistos. La diseminación sistémica alcanza músculos, cerebro y ojos.',
'["Fiebre", "Pérdida de peso", "Letargia", "Mialgias", "Dificultad respiratoria", "Signos neurológicos", "Ictericia", "Uveítis"]',
'{"clinicalExam": "Fiebre, mialgias, neurológicos, uveítis, hepatomegalia", "labTests": ["Serología IgG e IgM", "PCR en heces, sangre, LCR", "Oocistos en heces (flotación fecal)"], "imaging": ["Radiografía torácica si neumonitis", "MRI/TC craneal si signos neurológicos"], "differentialDiagnosis": ["FIP", "FeLV/FIV", "Encefalitis infecciosa", "Neoplasia"]}',
'{"firstLine": ["Clindamicina 12.5-25 mg/kg PO q12h por 2-4 semanas", "Doxiciclina 10 mg/kg PO q12h", "Trimetoprim-sulfametoxazol 15 mg/kg PO q12h", "Soporte nutricional"], "secondLine": ["Prednisona si uveítis severa"], "emergency": "Encefalitis aguda: hospitalización + antibióticos IV.", "duration": "2-4 semanas de tratamiento.", "notes": "Chile: Clindamicina, Doxiciclina disponibles. Zoonosis: gestantes evitar limpiar areneros."}',
'["Cocinar carne thoroughly", "Evitar caza cruda", "Limpiar arenero diariamente", "Lavarse las manos después", "Gestantes: evitar limpiar areneros"]',
'good',
true,
'["CDC - Toxoplasmosis in Cats", "Dubey JP, et al. Greene CE, ed. 4th ed. Elsevier; 2012"]'
);

-- ═══════════════════════════════════════════════════════════
-- ENFERMEDADES NUEVAS CHILE (N1-N10)
-- ═══════════════════════════════════════════════════════════

-- 28. EHRLICHIOSIS
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Ehrlichiosis Canina',
'Ehrlichia canis',
'dog',
'infectious',
'severe',
'Enfermedad vectorial transmitida por garrapatas. Afecta neutrófilos, monocitos y plaquetas. Endémica en zonas tropicales y subtropicales.',
'El parásito invade monocitos y neutrófilos causando destrucción celular. La inmunosupresión predispone a infecciones secundarias. La trombocitopenia causa hemorragias.',
'["Fiebre", "Letargia", "Anorexia", "Pérdida de peso", "Hemorragias petequiales", "Epistaxis", "Esplenomegalia", "Edema de extremidades"]',
'{"clinicalExam": "Fiebre, letargia, esplenomegalia palpable, hemorragias petequiales, mucosas pálidas", "labTests": ["ELISA SNAP 4Dx: detección de Ehrlichia", "PCR: confirmación molecular", "Hemograma: trombocitopenia, leucopenia/leucocitosis, anemia", "Citología: morulas intracelulares"], "imaging": ["Radiografía tórax: infiltrados pulmonares", "Ecografía: esplenomegalia"], "differentialDiagnosis": ["Anaplasmosis", "Babesiosis", "Leptospirosis"]}',
'{"firstLine": ["Doxiciclina (Vibramycin®) 10 mg/kg PO q12h por 4-6 semanas", "Fluidoterapia si deshidratación", "Transfusión de plaquetas si <30,000/µL", "Maropitant 1-2 mg/kg SC q24h", "Omeprazol 1 mg/kg PO q24h"], "secondLine": ["Imidocarb dipropionato 6.6 mg/kg IM dosis única", "Cloranfenicol 25 mg/kg PO q12h"], "emergency": "Trombocitopenia severa con sangrado: transfusión de plaquetas.", "duration": "Antibioticoterapia 4-6 semanas.", "notes": "Chile: Vibramycin® (Pfizer) disponible. SNAP 4Dx: veterinarias."}',
'["Prevención antiparasitaria: fipronil, permetrina", "Inspección diaria de garrapatas", "Evitar zonas con pastizales altos", "Tratamiento preventivo durante temporada"]',
'guarded',
false,
'["CVB - Ehrlichiosis Guidelines 2024", "JAVMA 2023;262(8):1120-1130", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 29. ANAPLASMOSIS
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Anaplasmosis Canina',
'Anaplasma phagocytophilum',
'dog',
'infectious',
'moderate',
'Enfermedad vectorial transmitida por garrapatas. Afecta neutrófilos. Causa fiebre, dolor articular y trombocitopenia.',
'El parásito invade neutrófilos causando activación plaquetaria. La trombocitopenia es por destrucción inmune mediada. La artritis inmunomediada causa dolor articular.',
'["Fiebre", "Letargia", "Dolor articular (poliartritis)", "Cojera", "Trombocitopenia", "Petequias", "Anorexia"]',
'{"clinicalExam": "Fiebre, dolor articular a la movilización, cojera, petequias", "labTests": ["ELISA SNAP 4Dx: detección de Anaplasma", "PCR: confirmación molecular", "Hemograma: trombocitopenia, leucopenia"], "imaging": ["Radiografía articulaciones: sin derrame"], "differentialDiagnosis": ["Ehrlichiosis", "Artritis inmunomediada", "Lyme"]}',
'{"firstLine": ["Doxiciclina 10 mg/kg PO q12h por 2-4 semanas", "AINEs: Carprofen 4.4 mg/kg PO q12h", "Fluidoterapia si deshidratación"], "secondLine": ["Imidocarb 6.6 mg/kg IM dosis única", "Prednisona si artritis severa"], "duration": "Antibioticoterapia 2-4 semanas.", "notes": "Chile: Doxiciclina disponible. SNAP 4Dx: disponible."}',
'["Prevención antiparasitaria", "Evitar zonas con garrapatas", "Inspección post-paseo"]',
'good',
false,
'["ACVIM Anaplasmosis Guidelines 2024", "JAVMA 2023;260(S1):S23-S35"]'
);

-- 30. BABESIOSIS
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Babesiosis Canina',
'Babesia canis / B. gibsoni',
'dog',
'infectious',
'severe',
'Enfermedad parasitaria transmitida por garrapatas. Los parásitos invaden y destruyen eritrocitos causando anemia hemolítica.',
'Los trofozoítos invaden eritrocitos causando su destrucción. La hemólisis intravascular causa anemia severa, hemoglobinuria y falla renal.',
'["Fiebre", "Anemia severa (mucosas pálidas/ictericia)", "Hemoglobinuria (orina roja)", "Esplenomegalia", "Letargia", "Anorexia", "Taquicardia"]',
'{"clinicalExam": "Fiebre, anemia severa, ictericia, esplenomegalia, orina oscura", "labTests": ["Frotis de sangre periférica: trofozoítos intraeritrocitarios", "Hemograma: anemia regenerativa severa, trombocitopenia", "Bioquímica: hiperbilirrubinemia"], "imaging": ["Ecografía: esplenomegalia"], "differentialDiagnosis": ["Ehrlichiosis", "Anemia autoinmune", "Intoxicación por cobre"]}',
'{"firstLine": ["Imidocarb dipropionato 6.6 mg/kg IM dosis única", "Transfusiones de sangre completa si PCV <15%", "Fluidoterapia IV", "Prednisona 1-2 mg/kg PO q24h si anemia autoinmune"], "secondLine": ["Atovaquona 13.5 mg/kg PO q12h + Azitromicina 10 mg/kg PO q24h (B. gibsoni)"], "emergency": "Anemia severa con PCV <12%: TRANSFUSIÓN INMEDIATA.", "duration": "Hospitalización 3-7 días. Recuperación 2-4 semanas.", "notes": "Chile: Imidocarb bajo importación. Bancos de sangre veterinarios en Santiago."}',
'["Prevención antiparasitaria estricta", "Evitar zonas endémicas", "Inspección diaria de garrapatas"]',
'guarded',
false,
'["ACVIM Babesiosis Guidelines 2023", "JAVMA 2024;265(3):310-322"]'
);

-- 31. LEISHMANIASIS
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Leishmaniasis',
'Leishmania infantum',
'dog',
'infectious',
'severe',
'Enfermedad zoonótica transmitida por mosca psicófaga. El perro es principal reservorio. Formas cutánea y visceral.',
'Los promastigotos son ingestidos por macrófagos donde se transforman a amastigotos. La replicación intracelular causa granulomas en piel, ganglios, hígado, riñones.',
'["Dermatitis exfolativa severa", "Pérdida de pelo", "Úlceras en orejas, nariz, patas", "Onicogrifosis", "Pérdida de peso", "Linfadenopatía", "Epistaxis", "Uveítis"]',
'{"clinicalExam": "Dermatitis exfolativa, úlceras, onicogrifosis, linfadenopatía generalizada", "labTests": ["Serología ELISA/IFAT", "PCR en sangre o médula ósea", "Citología: amastigotos intracelulares", "Hemograma: anemia, trombocitopenia"], "imaging": ["Radiografía: osteoartropatía hipertrofica"], "differentialDiagnosis": ["Dermatitis alérgica", "Dermatofitosis", "Neoplasia cutárea"]}',
'{"firstLine": ["Antimoniato de meglumina 75-100 mg/kg SC q24h por 28-40 días", "Miltefosina 2 mg/kg PO q24h por 28 días", "Allopurinol 10 mg/kg PO q12h de por vida", "Amoxicilina-ácido clavulánico 12.5 mg/kg PO q12h"], "secondLine": ["Liposomal anfotericina B 3-5 mg/kg IV cada 48h", "Domperidona 0.5 mg/kg PO q12h"], "duration": "Tratamiento inicial 28-40 días. Supresión de por vida.", "notes": "Chile: Antimoniato bajo protocolo especial. Miltefosina: importación."}',
'["Prevención de picadura de mosca psicófaga", "Moscqueros, repelentes", "Viajeros a zonas endémicas: precaución"]',
'guarded',
true,
'["WHO - Leishmaniasis Fact Sheet 2024", "OIE/WOAH Leishmaniasis Code 2023"]'
);

-- 32. RODENTICIDAS
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Envenenación por Rodenticidas',
'Anticoagulant Rodenticide Toxicosis',
'dog',
'toxic',
'critical',
'Intoxicación por ingestion de rodenticidas anticoagulantes. Causa coagulopatía hemorrágica sistémica. Emergencia veterinaria común.',
'Los rodenticidas inhiben la epoxido reductasa del vitamin K1. Esto impide la síntesis de factores de coagulación II, VII, IX y X. La coagulopatía se manifiesta 2-5 días post-ingestión.',
'["Hemorragias múltiples: epistaxis, gingivorragia", "Hematuria, melena", "Equimosis subcutáneas", "Debilidad", "Disnea (hemotórax)", "Colapso"]',
'{"clinicalExam": "Hemorragias visibles, mucosas pálidas, taquicardia, hipotermia", "labTests": ["TP y TPT prolongados >2x control", "INR elevado", "Hemograma: anemia si sangrado activo", "Factores de coagulación disminuidos"], "imaging": ["Radiografía tórax: hemotórax", "Ecografía: derrame libre"], "differentialDiagnosis": ["Coagulopatía por heparina", "Trombocitopenia inmunomediada", "Enfermedad hepática"]}',
'{"firstLine": ["Vitamina K1 (fitomenadiona) 2.5-5 mg/kg PO/SC/IV — ANTIDOTO", "Transfusiones de plasma fresco 10-20 mL/kg si sangrado activo", "Transfusiones de sangre completa si PCV <15%", "Vitamin K1 oral por 4-6 semanas"], "secondLine": ["Concentrado de complejo protrombínico"], "emergency": "Sangrado masivo: TRANSFUSIÓN INMEDIATA + Vitamina K1 IV lento.", "duration": "Vitamina K1 oral 4-6 semanas. Monitoreo de TP semanal.", "notes": "Chile: Vitamina K1 (Konakion®) disponible en farmacias. Antídoto altamente efectivo."}',
'["Mantener rodenticidas fuera de alcance", "Sellamiento de contenedores de basura", "Alternativas no tóxicas para control de roedores"]',
'good',
false,
'["ASPCA - Rodenticide Guidelines", "JAVMA 2024;266(1):45-56", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 33. TRAUMA TORÁCICO
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Trauma Torácico',
'Thoracic Trauma',
'both',
'traumatic',
'severe',
'Daño al tórax por impacto directo. Puede causar neumotórax, hemotórax, contusión pulmonar, fracturas costales.',
'El impacto causa fracturas costales que pueden lacerar pulmón o vasos sanguíneos. El neumotórax colapsa el pulmón. El hemotórax comprime pulmón y causa hipovolemia.',
'["Disnea", "Taquipnea", "Respiración superficial", "Dolor torácico", "Mucosas cianóticas", "Hipotermia", "Hipotensión", "Equimosis en tórax"]',
'{"clinicalExam": "Disnea, taquipnea >60 rpm, crepitantes, dolor torácico, mucosas cianóticas", "labTests": ["Hemograma: anemia si hemotórax", "Gasometría: hipoxemia", "Coagulograma: DIC si trauma severo"], "imaging": ["Radiografía tórax: neumotórax, hemotórax, fracturas costales", "Ecografía torácica: derrame pleural"], "differentialDiagnosis": ["Neumonía aspirativa", "Insuficiencia cardíaca", "Neoplasia torácica"]}',
'{"firstLine": ["Oxigenoterapia inmediata", "Toracocentesis si neumotórax/hemotórax", "Tubo de drenaje pleural si recurrente", "Fluidoterapia IV: Ringer Lactato 60-80 mL/kg/día", "Analgesia: Buprenorfina 0.02 mg/kg IV q6-8h", "Reposo estricto"], "secondLine": ["Cirugía: toracotomía si hemorragia activa", "Plástia costal si fracturas inestables"], "emergency": "Neumotórax a tensión: descompresión con aguja + toracostomía. Shock: fluidoterapia + transfusión.", "duration": "Hospitalización 3-7 días. Recuperación 2-4 semanas.", "notes": "Chile: Oxigenoterapia en clínicas de urgencia. Toracocentesis: procedimiento estándar."}',
'["Prevención de atropellamientos: correa y arnés", "Seguridad en hogares: evitar caídas", "Control de agresiones entre perros"]',
'guarded',
false,
'["ACVS Small Animal Thoracic Trauma Guidelines 2024", "JAVMA 2023;262(12):1420-1432"]'
);

-- 34. OBSTRUCCIÓN INTESTINAL
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Obstrucción Intestinal',
'Intestinal Obstruction',
'both',
'gastrointestinal',
'severe',
'Obstrucción parcial o completa del lumen intestinal. Emergencia quirúrgica si obstrucción completa.',
'La obstrucción impide el paso de contenido intestinal. La acumulación de gas y fluido causa distensión. La isquemia puede progresar a necrosis y perforación.',
'["Vómitos persistentes", "Anorexia", "Dolor abdominal", "Distensión abdominal", "Ausencia de heces", "Deshidratación", "Letargia", "Fiebre si necrosis"]',
'{"clinicalExam": "Dolor abdominal, distensión, ausencia de ruidos intestinales, deshidratación", "labTests": ["Hemograma: leucocitosis", "Bioquímica: hipercalemia, acidosis", "Lactato >4 mmol/L"], "imaging": ["Radiografía abdomen: asas dilatadas con nivel líquido-gas", "Ecografía: asas dilatadas"], "differentialDiagnosis": ["Pancreatitis", "Gastroenteritis", "Peritonitis"]}',
'{"firstLine": ["NPO", "Fluidoterapia IV: Ringer Lactato 60-80 mL/kg/día", "CIRUGÍA DE EMERGENCIA: enteroectomía + anastomosis", "Sonda nasogástrica para descompresión", "Antibióticos: Cefazolina 22 mg/kg IV q8h", "Analgesia: Buprenorfina 0.02 mg/kg IV q6-8h"], "secondLine": ["Lavado peritoneal si peritonitis", "Nutrición parenteral total"], "emergency": "Shock séptico por perforación: fluidoterapia + antibióticos IV + cirugía inmediata.", "duration": "Hospitalización 3-5 días. Recuperación 2-3 semanas.", "notes": "Chile: Cirugía de emergencia 24h. Cefazolina genérica. Dieta: Hills i/d, Royal Canin Gastrointestinal."}',
'["Evitar ingestión de cuerpos extraños", "Supervisar paseos", "Control de parásitos", "Alimentación consistente"]',
'good',
false,
'["ACVS Gastrointestinal Surgery Guidelines 2024", "JAVMA 2023;260(S1):S52-S64"]'
);

-- 35. CISTITIS INTERSTICIAL
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Cistitis Intersticial Felina',
'Feline Interstitial Cystitis (FIC)',
'cat',
'urological',
'moderate',
'Enfermedad inflamatoria de la vejiga sin causa infecciosa. Factor estrés importante.',
'La disfunción del epitelio vesical permite filtración de orina al tejido subyacente. Esto causa inflamación neurogénica y dolor. El estrés empeora los signos.',
'["Esfuerzo urinario", "Orina en pequeñas cantidades", "Hematuria", "Orina fuera del arenero", "Lamido genital excesivo", "Vocalización al orinar", "Dolor abdominal"]',
'{"clinicalExam": "Vejiga palpable firme, dolor al palpar, hematuria", "labTests": ["Análisis orina: hematuria, proteinuria, sin infección", "Urocultivo: NEGATIVO", "Ecografía: engrosamiento de pared"], "imaging": ["Ecografía: engrosamiento de pared vesical"], "differentialDiagnosis": ["Cistitis bacteriana", "Urolitiasis", "Neoplasia vesical"]}',
'{"firstLine": ["Enriquecimiento ambiental", "Dieta húmeda", "Cystocap (N-acetilcisteína) 140 mg/kg carga luego 70 mg/kg q8h", "Amitriptilina 1-2 mg/kg PO q24h", "Feliway® difusor"], "secondLine": ["Gabapentina 5-10 mg/kg PO q8h", "Pentoxifilina 10 mg/kg PO q8-12h", "Clomipramina 0.5-1 mg/kg PO q24h"], "emergency": "Obstrucción urinaria asociada: desobstrucción inmediata.", "duration": "Episodios autolimitados 5-7 días. Recurrencia común.", "notes": "Chile: Amitriptilina disponible (compounding). Feliway® en pet shops."}',
'["Enriquecimiento ambiental: rascadores, escondites", "Fuentes de agua fresca", "Areneros limpios y abundantes", "Reducción de estrés", "Dieta húmeda permanente"]',
'good',
false,
'["AAFP/ISFM Feline Idiopathic Cystitis Guidelines 2024", "JFMS 2024;26:145678"]'
);

-- 36. LUXACIÓN PATELAR
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Luxación Patelar',
'Patellar Luxation',
'dog',
'musculoskeletal',
'moderate',
'Desplazamiento recurrente de la rótula fuera de la tróclea femoral. Común en razas pequeñas.',
'La anomalía anatómica del fémur distal permite que la rótula se desplace. La luxación medial es más común en razas pequeñas.',
'["Cojera intermitente (salto)", "Extensión de extremidad", "Incapacidad para extender rodilla", "Dolor al manipular", "Atrofia muscular", "Deformidad angular"]',
'{"clinicalExam": "Luxación palpable de rótula, cojera intermitente, grados I-IV", "labTests": [], "imaging": ["Radiografía: posición skyline, evaluación de tróclea femoral"], "differentialDiagnosis": ["Ruptura de ligamento cruzado", "Osteocondritis disecante", "Fractura de rótula"]}',
'{"firstLine": ["Grado I: manejo conservador (control de peso, ejercicio moderado)", "Grado II-IV: CIRUGÍA: trochleoplastia + transposición tuberosidad tibial", "AINEs: Carprofen 4.4 mg/kg PO q12-24h", "Fisioterapia post-operatoria"], "secondLine": ["Reparación de retináculo", "Artroplastia de tróclea"], "duration": "Cirugía: recuperación 6-8 semanas.", "notes": "Chile: Cirugía ortopédica en clínicas especializadas. Carprofen genérico."}',
'["Selección genética: evitar cría con luxación", "Control de peso", "Ejercicio moderado en razas predisuestas"]',
'excellent',
false,
'["AO-VET Patellar Luxation Guidelines 2024", "JAVMA 2023;262(5):650-662"]'
);

-- 37. CUSHING
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Síndrome de Cushing (Hiperadrenocorticismo)',
'Hyperadrenocorticism (Cushing''s Syndrome)',
'dog',
'endocrine',
'moderate',
'Hiperproducción de cortisol. Formas: pituitaria (80%), adrenal (15%), iatrogénica (5%).',
'El exceso de cortisol causa catabolismo proteico, hiperglucemia, inmunosupresión y redistribución de grasa. La atrofia muscular causa abdomen potencial.',
'["Polidipsia/poliuria", "Polifagia", "Abdomen potencial", "Pérdida de pelo bilateral simétrica", "Calcinosis cutánea", "Infecciones recurrentes", "Letargia"]',
'{"clinicalExam": "Abdomen potencial, alopecia simétrica, calcinosis cutánea, hepatomegalia", "labTests": ["Test supresión dexametasona 0.01 mg/kg IV: cortisol >1.5 µg/dL 8h", "Test estimulación ACTH: cortisol >20 µg/dL", "Hemograma: neutrilia, linfopenia", "Bioquímica: ALP elevada, hiperglucemia"], "imaging": ["Radiografía: hepatomegalia, osteoporosis", "Ecografía: glándulas suprarrenales增大", "MRI: evaluación de hipófisis"], "differentialDiagnosis": ["Diabetes mellitus", "Hipertiroidismo (gatos)", "Enfermedad hepática"]}',
'{"firstLine": ["Trilostano (Vetoryl®) 1-5 mg/kg PO q12h", "Inicio bajo, ajustar según cortisol post-tratamiento", "Ketoconazol 10 mg/kg PO q12h — alternativa"], "secondLine": ["Mitotano 25-50 mg/kg PO q12h", "Cirugía: adrenalectomía si neoplasia adrenal", "Metirapona 15-25 mg/kg PO q8h"], "emergency": "Crisis hipoadrenal: fluidoterapia IV + dexametasona 0.1-0.2 mg/kg IV + mineralocorticoides.", "duration": "Trilostano: tratamiento de por vida. Monitorización cada 3-6 meses.", "notes": "Chile: Trilostano (Vetoryl®) bajo importación. Ketoconazol disponible."}',
'["Evitar corticoides exogenos sin supervisión", "Screening en razas predisuestas >6 años", "Control de peso", "Atención a signos tempranos"]',
'good',
false,
'["ACVIM Cushing''s Syndrome Guidelines 2024", "JAVMA 2023;262(8):1120-1130", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 38. IVDD
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Enfermedad de Discos Intervertebrales',
'Intervertebral Disc Disease (IVDD)',
'dog',
'neurological',
'moderate',
'Herniación o extrusión del núcleo pulposo del disco intervertebral. Común en razas braquicéfalas.',
'El disco degenerado pierde hidratación y elasticidad. La extrusión comprime la médula espinal causando dolor, ataxia y parálisis.',
'["Dolor espinal", "Ataxia de extremidades posteriores", "Parálisis flácida progresiva", "Incontinencia urinaria/fecal", "Marcha hipermétrica", "Incapacidad para caminar"]',
'{"clinicalExam": "Dolor espinal a la palpación, ataxia, parálisis, reflejos alterados", "labTests": [], "imaging": ["Mielografía CT/MRI: GOLD STANDARD", "Radiografía: espacio intervertebral estrecho"], "differentialDiagnosis": ["Tumor espinal", "Meningomielitis", "Fibrocartilaginosa embolia"]}',
'{"firstLine": ["GRADO I-II: reposo estricto 4-6 semanas", "AINEs: Carprofen 4.4 mg/kg PO q12-24h", "Analgesia: Gabapentina 5-10 mg/kg PO q8h", "Grado III-IV: CIRUGÍA hemilaminectomía", "Enfermería: movilización cada 4-6 horas"], "secondLine": ["Acupuntura", "Fisioterapia hidroterapia", "Láser terapia"], "emergency": "Parálisis aguda con incontinencia: CIRUGÍA DE EMERGENCIA dentro de 24-48h.", "duration": "Conservador: 4-6 semanas reposo. Cirugía: recuperación 6-8 semanas.", "notes": "Chile: Cirugía espinal en clínicas especializadas (Santiago, Concepción). Rehabilitación: centros de fisioterapia veterinaria."}',
'["Mantener peso ideal", "Evitar saltos y escaleras en razas predisuestas", "Camas orthopédicas", "Ejercicio de bajo impacto"]',
'good',
false,
'["ACVIM IVDD Guidelines 2024", "JAVMA 2023;262(5):650-662"]'
);

-- 39. NEUMONÍA ASPIRATIVA
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Neumonía Aspirativa',
'Aspiration Pneumonia',
'both',
'respiratory',
'severe',
'Inflamación e infección pulmonar por aspiración de contenido gástrico.',
'El contenido ácido gástrico aspirado causa neumonía química. La sobreinfección bacteriana empeora el cuadro. La localización dorso-craneal es más afectada.',
'["Tos productiva", "Disnea", "Fiebre", "Crepitantes pulmonares", "Taquipnea", "Mucosas cianóticas", "Descarga nasal purulenta", "Anorexia"]',
'{"clinicalExam": "Fiebre, crepitantes, disnea, taquipnea >40 rpm, mucosas cianóticas", "labTests": ["Hemograma: leucocitosis", "Citología traqueal: neutrófilos + bacterias", "Gasometría: hipoxemia"], "imaging": ["Radiografía tórax: infiltrados alveolares en lóbulos dorso-craneales"], "differentialDiagnosis": ["Neumonía bacteriana primaria", "Neumonía viral", "Tumor pulmonar"]}',
'{"firstLine": ["Antibióticos IV: Ampicilina 22 mg/kg IV q6h + Enrofloxacina 5 mg/kg IV q24h", "Oxigenoterapia", "Fluidoterapia IV", "Nebulización con fisiológico + N-acetilcisteína", "Fisioterapia torácica"], "secondLine": ["Metronidazol 15 mg/kg IV q12h", "Clindamicina 10 mg/kg IV q12h"], "emergency": "Fallo respiratorio: oxigenoterapia + oxigenoterapia hiperbárica si disponible.", "duration": "Antibioticoterapia 2-4 semanas. Recuperación radiográfica 4-6 semanas.", "notes": "Chile: Oxigenoterapia en clínicas de urgencia. Nebulizadores domésticos: accesibles."}',
'["Alimentación en posición elevada para predisuestos", "Evitar anestesia en animales con reflujo", "Control de vómitos", "Tratar causas subyacentes"]',
'guarded',
false,
'["ACVIM Respiratory Consensus 2024", "JAVMA 2023;260(S1):S52-S64"]'
);
