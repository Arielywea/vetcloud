-- VetCloud Disease Database v2.0 - Part 1
-- 16 diseases: P1 Critical + P2 High
-- Requires pathophysiology column in diseases table

-- 1. PARVOVIRUS CANINO
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Parvovirus Canino',
'Canine Parvovirus (CPV-2)',
'dog',
'infectious',
'severe',
'Enfermedad viral altamente contagiosa y potencialmente mortal que afecta principalmente a cachorros no vacunados. Se transmite por contacto directo con heces infectadas o fómites. Incubación de 3-7 días.',
'El CPV-2 ataca las células de rápida división del organismo, principalmente las vellosidades intestinales y la médula ósea. La destrucción de las vellosidades intestinales provoca malabsorción y diarrea severa. La supresión de médula ósea causa leucopenia, facilitando sobreinfecciones bacterianas. El shock séptico es la causa principal de muerte.',
'["Vómitos hemáticos", "Diarrea acuosa/sanguinolenta fétida", "Anorexia severa", "Letargia", "Fiebre 39.5-41°C", "Deshidratación rápida", "Abdomen doloroso", "Mucosas pálidas"]',
'{"clinicalExam": "Depresión severa, deshidratación 8-12%, mucosas pálidas/azuladas, taquicardia 160-200 lpm, abdomen doloroso, temperatura rectal 39.5-41°C", "labTests": ["Hemograma: linfopenia <1000/µL, neutropenia <500/µL", "ELISA SNAP Parvo: sensibilidad 80-90%", "Bioquímica: hipoglucemia <60 mg/dL, hipoalbuminemia <2.0 g/dL", "Gasometría: acidosis metabólica"], "imaging": ["Radiografía abdominal: signo de íleo paralítico", "Ecografía: engrosamiento de pared intestinal"], "differentialDiagnosis": ["Coronavirus canino", "Gastroenteritis hemorrágica", "Parasitosis severa", "Cuerpo extraño gastrointestinal"]}',
'{"firstLine": ["Fluidoterapia: Ringer Lactato 90 mL/kg/h shock → 1.5-2x mantenimiento", "Maropitant (Cerenia®) 1-2 mg/kg SC q24h — antiemético", "Amoxicilina-ácido clavulánico (Clavamox®) 12.5 mg/kg PO/IV q12h", "Omeprazol (Losec®) 1 mg/kg IV q24h — gastroprotector", "Dextrosa 2.5-5% si glucemia <60 mg/dL"], "secondLine": ["Enrofloxacina (Baytril®) 5 mg/kg IV q24h si sobreinfección", "Metronidazol 15 mg/kg IV q12h", "Plasma fresco 10-20 mL/kg IV", "Filgastrim (Neupogen®) 2 µg/kg SC q24h — neutropenia severa"], "emergency": "Shock séptico: fluidos agresivos 90 mL/kg/h + vasopresores si refractario. Transfusión si PCV <15%.", "duration": "7-14 días hospitalización. Recuperación completa en 2-3 semanas.", "notes": "Chile: Cerenia® (Zoetis), Clavamox® (Zoetis), Baytril® (Bayer/Elanco), Nobivac Parvo-C (MSD)."}',
'["Vacunación completa según protocolo WSAVA: 3 dosis desde 6-8 semanas cada 3-4 semanas hasta 16 semanas", "Aislamiento de cachorros enfermos por 6 semanas post-infección", "Desinfección con hipoclorito de sodio 1:30", "Evitar contacto con heces de perros callejeros hasta completar vacunación"]',
'guarded',
false,
'["WSAVA Vaccination Guidelines 2024", "ACVIM Consensus Statement Canine Parvovirus 2023", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 2. MOQUILLO CANINO
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Moquillo Canino',
'Canine Distemper Virus (CDV)',
'dog',
'infectious',
'severe',
'Enfermedad viral sistémica altamente contagiosa que afecta tracto respiratorio, gastrointestinal y sistema nervioso. Transmisión por aerosoles.',
'El CDV infecta epitelio respiratorio, gastrointestinal y tejido linfoide. La viremia diseminada alcanza sistema nervioso central causando desmielinización. La inmunosupresión es severa. Las complicaciones bacterianas secundarias son la causa principal de muerte.',
'["Tos productiva", "Secreción nasal mucopurulenta", "Anorexia", "Fiebre bifásica", "Hiperqueratosis plantar/nasal", "Convulsiones", "Mioclonías", "Ataxia"]',
'{"clinicalExam": "Fiebre 39.5-41°C, descarga ocular/nasal, hiperqueratosis de almohadillas plantares, signos neurológicos, deshidratación", "labTests": ["Hemograma: linfopenia", "RT-PCR nasofaríngeo/orina", "IFA en células del epitelio respiratorio", "Serología IgM"], "imaging": ["Radiografía tórax: neumonía intersticial/alveolar"], "differentialDiagnosis": ["Influenza canina", "Adenovirus canino tipo 2", "Neumonía bacteriana", "Encefalitis por Toxoplasma"]}',
'{"firstLine": ["Fluidoterapia: Ringer Lactato 60-80 mL/kg/día IV", "Amoxicilina-ácido clavulánico (Clavamox®) 12.5 mg/kg PO q12h", "Doxiciclina (Vibramycin®) 10 mg/kg PO q12h", "Interferón omega felino (Virbagen®) 1-2 MU/kg SC q24h × 5 días", "Diazepam (Valium®) 0.5-1 mg/kg IV — convulsiones"], "secondLine": ["Levetiracetam (Keppra®) 20-30 mg/kg PO q8h", "Fenobarbital 2-4 mg/kg IV lento", "Metilprednisolona succinato (Solu-Medrol®) 10-20 mg/kg IV pulso"], "emergency": "Estatus epiléptico: Diazepam IV 0.5 mg/kg, si refractario Fenobarbital IV. Oxígeno si SpO2 <92%.", "duration": "Hospitalización 7-14 días. Signos neurológicos pueden persistir semanas.", "notes": "Chile: Clavamox® (Zoetis), Vibramycin® (Pfizer), Nobivac DHPPi+L (MSD)."}',
'["Vacunación completa DHPPi+L según protocolo WSAVA", "Aislamiento de animales enfermos", "Desinfección con amonio cuaternario o hipoclorito", "Evitar contacto con secreciones nasales/orales"]',
'guarded',
false,
'["WSAVA Vaccination Guidelines 2024", "Greene''s Infectious Diseases of the Dog and Cat 5th Ed", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 3. LEPTOSPIROSIS
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Leptospirosis',
'Leptospira interrogans',
'both',
'infectious',
'severe',
'Enfermedad zoonótica causada por espiroquetas. Transmisión por contacto con orina de roedores o agua contaminada. Endémica en zonas urbanas de Chile.',
'Las leptospiras ingresan por mucosas o piel herida. Se diseminan por bloodstream causando hepatitis infecciosa y nefritis intersticial. La lesión renal aguda es la principal causa de muerte.',
'["Fiebre alta", "Ictericia", "Poliuria/polidipsia", "Vómitos", "Dolor abdominal", "Mialgia", "Conjuntivitis", "Hemorragias subcutáneas"]',
'{"clinicalExam": "Fiebre 39.5-41°C, ictericia visible en mucosas, hepatomegalia dolorosa, mialgia severa", "labTests": ["MAT: título >1:800 diagnóstico", "ELISA IgM: positivo en fase aguda", "PCR en orina: positivo primeras 2 semanas", "Hemograma: trombocitopenia, leucocitosis", "Bioquímica: ALT/AST >500 U/L, creatinina >3.0 mg/dL"], "imaging": ["Ecografía renal: riñones增大 e hiperecogénicos"], "differentialDiagnosis": ["Hepatitis infecciosa canina", "Babesiosis", "Intoxicación hepática", "Pancreatitis aguda"]}',
'{"firstLine": ["Doxiciclina (Vibramycin®) 10 mg/kg PO q12h por 2-4 semanas", "Penicilina G cristalina 22,000-44,000 UI/kg IV q6h", "Fluidoterapia: Ringer Lactato 60-80 mL/kg/día", "Maropitant (Cerenia®) 1-2 mg/kg SC q24h", "Famotidina (Pepcid®) 0.5 mg/kg IV q12h"], "secondLine": ["Ampicilina 22 mg/kg IV q6h", "Ceftriaxona 25-50 mg/kg IV q24h", "N-acetilcisteína (Fluimucil®) 140 mg/kg IV carga", "Transfusión de plaquetas si <30,000/µL"], "emergency": "Fallo renal agudo: fluidoterapia agresiva + diálisis peritoneal si oliguria. TROMBOCITOPENIA: evitar procedimientos invasivos.", "duration": "Antibioticoterapia 2-4 semanas. Recuperación renal 2-4 semanas.", "notes": "Chile: VIBRAMYCIN® (Pfizer). ZONA ENDÉMICA: Santiago, Valparaíso, Concepción. ZOONOSIS: handlers deben usar guantes."}',
'["Vacunación Lepto anual (Nobivac L4 o Leptoguard)", "Control de roedores en predios", "Evitar contacto con agua stagnante/charcos", "Notificación obligatoria al SEREMI de Salud"]',
'guarded',
true,
'["ACVIM Consensus Statement Leptospirosis 2023", "WSAVA Vaccination Guidelines 2024", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 4. RABIA
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Rabies',
'Rabies lyssavirus',
'both',
'infectious',
'critical',
'Enfermedad zoonótica mortal causada por virus RNA. Transmisión por mordedura de animal infectado. MORTALIDAD 100% una vez que aparecen síntomas. Notificación obligatoria en Chile.',
'El virus ingresa por mordedura, viaja por nervios periféricos hasta el sistema nervioso central. Causa encefalitis aguda con destrucción neuronal. No existe tratamiento.',
'["Agresividad inusual", "Hidrofobia", "Aerofobia", "Espasmos de faringe al tragar", "Parálisis mandibular", "Salivación excesiva", "Ataxia", "Convulsiones"]',
'{"clinicalExam": "Cambios neurológicos progresivos: hiperexcitabilidad o parálisis flácida, espasmos de músculos masticadores", "labTests": ["IFA en tejido cerebral (post-mortem)", "PCR en saliva/secreción faríngea", "Negro de Seller en impronta de cerebro"], "imaging": ["No hay imagenología diagnóstica en vivo"], "differentialDiagnosis": ["Encefalitis por Moquillo", "Intoxicación", "Encefalitis autoinmune", "Neoplasia cerebral"]}',
'{"firstLine": ["NO EXISTE TRATAMIENTO. Enfermedad 100% mortal una vez sintomática.", "Eutanasia humanitaria recomendada si se confirma o sospecha fuertemente", "Cuarentena estricta 10 días si animal vacunado muerde"], "secondLine": [], "emergency": "Mordedura de animal sospechoso: lavado herida 15 min con agua y jabón. Profilaxis post-exposición en humano. Notificar a SEREMI de Salud inmediatamente.", "duration": "N/A — enfermedad fatal sin tratamiento.", "notes": "Chile: LEY 20.488 vacunación antirrábica obligatoria para perros. Laboratorio: Instituto de Salud Pública (ISP)."}',
'["Vacunación antirrábica obligatoria anual (Ley 20.488)", "Mantener vacunación al día en todos los perros", "Reportar animales sospechosos a autoridades sanitarias", "No manipular animales muertos sin EPP"]',
'grave',
true,
'["WHO Rabies Bulletin 2024", "OIE/WOAH Rabies Terrestrial Code 2023", "Ley 20.488 Chile — Vacunación antirrábica obligatoria", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 5. FIP
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Peritonitis Infecciosa Felina (FIP)',
'Feline Coronavirus (FCoV) mutado',
'cat',
'infectious',
'critical',
'Enfermedad inmunomediada causada por mutación del coronavirus felino. Forma húmeda (ascitis) o seca (granulomatosa). Antes 100% mortal, ahora curable con GS-441524.',
'El FCoV muta a FIPV dentro de macrófagos. Complejos inmunoanticuerpo-antígeno se depositan en vasos sanguíneos causando vasculitis. Esto provoca exudado proteico en cavidades (forma húmeda) o granulomas en órganos (forma seca).',
'["Fiebre persistente no respondente a antibióticos", "Ascitis (forma húmeda)", "Pérdida de peso progresiva", "Ictericia", "Uveítis", "Ataxia cerebelar (forma neurológica)"]',
'{"clinicalExam": "Fiebre 39.5-40.5°C persistente, distensión abdominal, hepatomegalia, esplenomegalia, ictericia", "labTests": ["Rivalta test: positivo", "Proteína total >7.5 g/dL con ratio A/G <0.4", "AGP >1500 µg/mL", "PCR en fluido/tierto positivo para FCoV"], "imaging": ["Ecografía: ascitis, granulomas hepáticos/renales", "Radiografía: efusión pleural"], "differentialDiagnosis": ["Linfoma", "Carcinoma", "Insuficiencia cardíaca", "Peritonitis bacteriana"]}',
'{"firstLine": ["GS-441524 4-6 mg/kg SC q24h por 84 días", "Famotidina (Pepcid®) 1 mg/kg PO q12h", "Prednisolona 1-2 mg/kg PO q24h tapering", "Fluidoterapia subcutánea si deshidratación", "Nutrición: dietas de alta densidad calórica"], "secondLine": ["GC376 (proteasa inhibitor) 5-10 mg/kg PO q12h", "Interferón omega felino 1 MU/kg SC q24h × 5 días", "Toceranib (Palladia®) 2-3 mg/kg PO q48h — granulomas refractarios"], "emergency": "Respiración dificultosa por efusión pleural: toracocentesis de emergencia. Hipoproteinemia severa: albúmina humana 1-2 mL/kg IV lento.", "duration": "GS-441524: 84 días. Curación completa en 80-90% de casos.", "notes": "Chile: GS-441524 disponible por importación. Famotidina y Prednisolona genéricos disponibles. Pronóstico DRÁSTICAMENTE mejorado desde 2019."}',
'["Aislamiento de gatitos nuevos 14 días mínimo", "Higiene estricta en criaderos", "Evitar agrupaciones grandes de gatos", "Test FCoV antes de integrar gatitos a la colonia"]',
'guarded',
false,
'["ISFM FIP Treatment Guidelines 2024", "ACVIM Feline FIP Consensus 2023", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 6. HCM
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Cardiomiopatía Hipertrófica Felina (HCM)',
'Hypertrophic Cardiomyopathy (HCM)',
'cat',
'cardiovascular',
'severe',
'Enfermedad cardíaca más común en gatos. Hipertrofia del miocardio ventricular izquierdo. Puede causar insuficiencia cardíaca congestiva y tromboembolismo aórtico.',
'La mutación del gen MYBPC3 causa hipertrofia del ventrículo izquierdo. El ventrículo pierde compliance, causando presión elevada en aurícula izquierda. La estasis sanguínea predispone a trombos (ATE).',
'["Insuficiencia cardíaca congestiva (disnea, taquipnea)", "Soplo cardíaco", "Galope S3/S4", "Crepitantes pulmonares", "Derrame pleural", "Extremidades frías (ATE)"]',
'{"clinicalExam": "Soplo sistólico grade II-IV/VI, galope S3/S4, taquipnea >40 rpm, crepitantes pulmonares", "labTests": ["NT-proBNP >200 pmol/L", "Troponina I >0.1 ng/mL", "Gasometría: hipoxemia", "Coagulograma si ATE"], "imaging": ["Ecocardiografía: grosor SIV >6mm, patrón de HCM", "Radiografía tórax: cardiomegalia, derrame pleural"], "differentialDiagnosis": ["Hipertensión sistémica", "Cardiomiopatía restrictiva", "Efusión pericárdico", "Neoplasia cardíaca"]}',
'{"firstLine": ["Furosemida (Lasix®) 1-2 mg/kg PO q12-24h", "Clopidogrel (Plavix®) 18.75 mg PO q24h — prevención ATE", "Enalapril (Renitec®) 0.5 mg/kg PO q12-24h", "Pimobendan (Vetmedin®) 0.25-0.3 mg/kg PO q12h", "Espironolactona 1-2 mg/kg PO q24h"], "secondLine": ["Atenolol 6.25-12.5 mg PO q12h", "Diltiazem 1.5-2.5 mg/kg PO q8h", "Nitroglicerina tópica 2%", "Toracocentesis — derrame pleural severo"], "emergency": "Edema pulmonar agudo: Furosemida IV 2-4 mg/kg, oxígeno, toracocentesis. ATE: Clopidogrel load + warm extremidad.", "duration": "Tratamiento de por vida. Monitoreo ecocardiográfico cada 3-6 meses.", "notes": "Chile: Furosemida, Clopidogrel, Enalapril genéricos. Pimobendan (Vetmedin® Boehringer). Ecocardiografía: clínicas especializadas."}',
'["Screening ecocardiográfico anual en razas predisuestas (Maine Coon, Ragdoll, Sphynx)", "Evitar dietas altas en sodio", "Control de peso", "Test genético MYBPC3 para razas predispuestas"]',
'guarded',
false,
'["ACVIM Feline HCM Consensus 2024", "ISFM Cardiac Guidelines 2023", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 7. ERC PERRO
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Enfermedad Renal Crónica (Perro)',
'Chronic Kidney Disease (CKD) - Canine',
'dog',
'renal',
'moderate',
'Pérdida progresiva e irreversible de función renal. IRIS staging I-IV. Más común en perros mayores (>7 años).',
'La pérdida de nefronas funcionales obliga a las nefronas restantes a hiperfiltrar. La acumulación de toxinas urémicas causa daño multiorgánico. La eritropoyetina insuficiente causa anemia.',
'["Poliuria/polidipsia", "Pérdida de peso", "Anorexia", "Vómitos", "Halitosis urémica", "Deshidratación", "Piel seca", "Anemia"]',
'{"clinicalExam": "Pérdida de peso, deshidratación, halitosis urémica, mucosas pálidas, kidneys palpable增大 o disminuidos", "labTests": ["Creatinina >1.6 mg/dL, SDMA >18 µg/dL", "BUN >35 mg/dL", "UAC: proteinuria >0.5 g/día", "Hemograma: anemia normocromica normocítica", "Gasometría: acidosis metabólica"], "imaging": ["Ecografía: riñones pequeños y fibrosados", "Radiografía: riñones simétricos"], "differentialDiagnosis": ["Nefritis intersticial", "Nefropatía amiloidea", "Pielonefritis", "Insuficiencia cardíaca congestiva"]}',
'{"firstLine": ["Dieta renal: Hills k/d, Royal Canin Renal", "Fosfato de aluminio 30-60 mg/kg PO con comidas", "Famotidina (Pepcid®) 0.5 mg/kg PO q12-24h", "Eritropoyetina humana (EPO) 100-300 UI/kg SC 3×/semana", "Fluidoterapia subcutánea 100-150 mL/q24-48h"], "secondLine": ["Telmisartán (Semintra®) 1-2 mg/kg PO q24h", "Calcitriol 2-3 ng/kg PO q24h", "Maropitant (Cerenia®) 1 mg/kg SC q24h"], "emergency": "Crisis urémica: fluidoterapia IV agresiva + bicarbonato si pH <7.2. Convulsiones: Diazepam 0.5 mg/kg IV.", "duration": "Tratamiento de por vida. Monitoreo cada 3-6 meses. Estadio I-II: pronóstico bueno.", "notes": "Chile: Hills k/d y Royal Canin Renal disponibles. EPO disponible en farmacias. Telmisartán (Semintra®) disponible."}',
'["Dieta renal desde estadio IRIS II", "Control de presión arterial anual en >7 años", "Evitar nefrotóxicos (AINE, aminoglucósidos)", "Monitoreo de creatinina/SDMA cada 6 meses >7 años"]',
'guarded',
false,
'["IRIS CKD Staging Guidelines 2024", "ACVIM Consensus Statement CKD 2023", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 8. ERC GATO
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Enfermedad Renal Crónica (Gato)',
'Chronic Kidney Disease (CKD) - Feline',
'cat',
'renal',
'moderate',
'Enfermedad más común en gatos mayores (>10 años). Pérdida progresiva de función renal. IRIS staging I-IV.',
'La enfermedad renal inicial causa inflamación y fibrosis tubulointersticial. La hipertensión sistémica secundaria causa daño retiniano y cardíaco. La anemia por falta de eritropoyetina empeora la calidad de vida.',
'["Poliuria/polidipsia", "Pérdida de peso", "Anorexia", "Vómitos", "Pelaje descuidado", "Halitosis urémica", "Úlceras orales", "Deshidratación"]',
'{"clinicalExam": "Pérdida de peso, pelaje descuidado, deshidratación, halitosis urémica, mucosas pálidas", "labTests": ["Creatinina >1.6 mg/dL, SDMA >18 µg/dL", "UAC: proteinuria >0.4", "Hemograma: anemia normocromica normocítica", "Electrolitos: hiperpotasemia si estadio avanzado", "Fosfato >4.5 mg/dL, BUN >35 mg/dL"], "imaging": ["Ecografía: riñones asimétricos, cortical irregular", "Presión arterial: sistólica >160 mmHg"], "differentialDiagnosis": ["Nefritis intersticial", "Pielonefritis", "Nefropatía amiloidea"]}',
'{"firstLine": ["Dieta renal: Hills k/d, Royal Canin Renal", "Fosfato de aluminio 30-60 mg/kg PO con comidas", "Fluidoterapia SC 100-150 mL/q24-48h", "EPO humana 100-300 UI/kg SC 3×/semana", "Famotidina 0.5 mg/kg PO q12-24h"], "secondLine": ["Telmisartán (Semintra®) 1-2 mg/kg PO q24h", "Maropitant (Cerenia®) 1 mg/kg SC q24h", "Mirtazapina 1.875 mg PO q72h"], "emergency": "Crisis urémica: fluidoterapia IV + bicarbonato. Hiperpotasemia: gluconato de calcio 10% 0.5-1 mL/kg IV lento.", "duration": "Tratamiento de por vida. Monitoreo cada 3-6 meses. Mediana supervivencia 2-3 años estadio II.", "notes": "Chile: Hills k/d y Royal Canin Renal disponibles. Mirtazapina: disponible en farmacias. EPO disponible con receta."}',
'["Dieta renal desde estadio IRIS II", "Monitoreo de creatinina/SDMA cada 6 meses >10 años", "Control de presión arterial anual", "Hidratación adecuada (fuentes de agua)"]',
'guarded',
false,
'["IRIS CKD Staging Guidelines 2024", "ISFM Renal Guidelines 2023", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 9. DIABETES
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Diabetes Mellitus Canino',
'Diabetes Mellitus - Canine',
'dog',
'endocrine',
'moderate',
'Deficiencia de insulina o resistencia a la insulina. Causa hiperglucemia persistente. Puede progresar a cetoacidosis diabética. Más común en perros >7 años, hembras no castradas.',
'Las células beta pancreáticas destruidas no producen suficiente insulina. Sin insulina, la glucosa no ingresa a las células causando hiperglucemia. La lipólisis descontrolada produce cuerpos cetónicos (cetoacidosis).',
'["Poliuria/polidipsia", "Pérdida de peso con buena ingesta", "Anorexia", "Vómitos", "Cataratas bilaterales", "Letargia", "Orina pegajosa"]',
'{"clinicalExam": "Pérdida de peso, cataratas bilaterales (50%), hepatomegalia, deshidratación, aliento con olor a acetona", "labTests": ["Glucemia en ayuno >250 mg/dL", "Glucosuria persistente", "Fructosamina >400 µmol/L", "Cetonuria en cetoacidosis"], "imaging": ["Ecografía abdominal: páncreas, excluir masas"], "differentialDiagnosis": ["Hiperglucemia estresante", "Enfermedad de Cushing", "Pancreatitis"]}',
'{"firstLine": ["Insulina NPH (Humulin N®) 0.25-0.5 UI/kg SC q12h", "Dieta: Hills w/d, Royal Canin W/S — bajo carbohidratos", "Monitoreo de glucemia en casa", "Metformina 10-25 mg/kg PO q12h"], "secondLine": ["Insulina Glargina (Lantus®) 1-2 UI/kg SC q24h", "Pimobendan (Vetmedin®) 0.25 mg/kg PO q12h", "Ursodiol (Ursacol®) 10-15 mg/kg PO q12h"], "emergency": "Cetoacidosis: fluidoterapia 0.9% NaCl 90 mL/kg/h + insulina regular IV 0.1 UI/kg carga + bicarbonato si pH <7.1.", "duration": "Tratamiento de por vida. Regulación inicial: 1-2 meses. Monitoreo de fructosamina cada 3-6 meses.", "notes": "Chile: Humulin N® (Eli Lilly), Lantus® (Sanofi) disponibles. Dietas: Hills, Royal Canin disponibles."}',
'["Castración de hembras (reduce resistencia a insulina)", "Mantener peso corporal ideal", "Dieta baja en carbohidratos", "Ejercicio regular y consistente"]',
'good',
false,
'["ACVIM Canine Diabetes Consensus 2023", "JAVMA 2024;264(3):310-320", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 10. PANCREATITIS
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Pancreatitis Canina',
'Pancreatitis - Canine',
'dog',
'gastrointestinal',
'moderate',
'Inflamación del páncreas que puede ser aguda o crónica. Más común en perros obesos, razas pequeñas.',
'La activación prematura de enzimas pancreáticas digiere el propio tejido. La respuesta inflamatoria puede causar daño a órganos distantes. La necrosis pancreática predispone a sobreinfección.',
'["Dolor abdominal", "Anorexia", "Vómitos", "Diarrea", "Letargia", "Deshidratación", "Fiebre", "Abdomen en posición de oración"]',
'{"clinicalExam": "Dolor abdominal severo, anorexia, vómitos, deshidratación, fiebre 39.5-40.5°C", "labTests": ["Spec cPL: >400 µg/L diagnóstico", "Hemograma: leucocitosis con desviación izquierda", "Bioquímica: ALT/AST elevadas, hipoglucemia"], "imaging": ["Ecografía abdominal: páncreas增大, edematoso, hiperecogénico"], "differentialDiagnosis": ["Gastroenteritis", "Enfermedad inflamatoria intestinal", "Enfermedad hepática"]}',
'{"firstLine": ["Fluidoterapia: Ringer Lactato 60-80 mL/kg/día IV", "Maropitant (Cerenia®) 1-2 mg/kg SC/IV q24h", "Omeprazol (Losec®) 1 mg/kg IV/PO q24h", "Buprenorfina (Simbadol®) 0.02-0.03 mg/kg IV/SC q6-8h", "Metronidazol 15 mg/kg IV q12h"], "secondLine": ["Gabapentina 5-10 mg/kg PO q8h", "Pentoxifilina (Trental®) 10 mg/kg PO q8-12h", "Nutrición temprana: dieta baja en grasa"], "emergency": "Shock séptico: fluidoterapia agresiva + vasopresores. Hipoglucemia: dextrosa 5-10%.", "duration": "Hospitalización 3-5 días (leve) a 7-14 días (severo). Forma crónica: manejo dietético de por vida.", "notes": "Chile: Cerenia® (Zoetis), Losec® (AstraZeneca), Simbadol® (Zoetis). Spec cPL: envío a laboratorio."}',
'["Dieta baja en grasa para predposición", "Control de peso corporal", "Evitar sobras de comida alta en grasa", "Castración en razas predisuestas"]',
'good',
false,
'["ACVIM Pancreatitis Consensus 2023", "WSAVA Gastrointestinal Guidelines 2024", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 11. GDV
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Torsión Gástrica (GDV)',
'Gastric Dilatation-Volvulus',
'dog',
'gastrointestinal',
'critical',
'Emergencia quirúrgica con mortalidad 15-33%. El estómago se dilata y gira sobre su eje, cortando suministro de sangre. Más común en razas grandes/gigantes.',
'El estómago se llena de gas y rota 180-360°. Esto comprime el vena cava caudal reduciendo retorno venoso. La isquemia gástrica causa necrosis de la pared. La arritmia cardíaca (VPCs) es causa de muerte.',
'["Estómago distendido (timpanismo)", "Intentos infructuosos de vomitar", "Babeo espumoso", "Dolor abdominal severo", "Taquicardia", "Mucosas pálidas", "Colapso"]',
'{"clinicalExam": "Abdomen distendido y timpánico, intentos de vomitar sin producir, taquicardia >180 lpm, mucosas pálidas/azuladas", "labTests": ["Hemograma: hemoconcentratción (PCV >55%)", "Bioquímica: lactato >4 mmol/L", "Gasometría: acidosis metabólica severa", "Troponina I >0.1 ng/mL"], "imaging": ["Radiografía abdomen: signo de doble burbuja"], "differentialDiagnosis": ["Simple dilatación gástrica", "Obstrucción intestinal alta", "Torazión esplénica"]}',
'{"firstLine": ["Descompresión gástrica: sonda orogástrica + liberación de gas", "Fluidoterapia: Ringer Lactato 90 mL/kg/h (shock)", "Cefazolina (Kefzol®) 22 mg/kg IV q8h", "Bicarbonato de sodio 1-2 mEq/kg IV si pH <7.1", "Lidocaína CRI 2-4 mg/kg/h — arritmias"], "secondLine": ["Insulina regular 0.25 UI/kg IV + Dextrosa 5%", "Pimobendan (Vetmedin®) 0.25 mg/kg PO q12h post-operatorio", "Maropitant (Cerenia®) 1 mg/kg SC q24h"], "emergency": "CIRUGÍA DE EMERGENCIA: gastropexia + desrotación. Pre-operatorio: descompresión + corrección acidosis.", "duration": "Hospitalización 3-5 días post-cirugía. Recuperación 2-3 semanas. Mortalidad 15-33%.", "notes": "Chile: Cirugía de emergencia 24h disponible. Cefazolina genérica. Gastropexia preventiva recomendada en razas predispuestas."}',
'["Gastropexia preventiva en razas predispuestas", "Evitar comidas grandes de una sola vez", "Ejercicio 1 hora antes/después de comer", "Alimentación fraccionada (3-4 comidas/días)"]',
'guarded',
false,
'["ACVIM GDV Consensus 2023", "JAVMA 2024;265(1):50-62", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 12. LINFOMA
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Linfoma Canino',
'Canine Lymphoma',
'dog',
'oncological',
'severe',
'Neoplasia del tejido linfático. Es el cáncer más común en perros. Formas: multicéntrica (80%), gastrointestinal, mediastínica, cutánea.',
'La transformación maligna de linfocitos causa proliferación descontrolada. Los ganglios linfáticos se infiltran y增大. La diseminación por sistema linfático alcanza hígado, bazo y médula ósea.',
'["Linfastadenopatía generalizada", "Hepatomegalia", "Esplenomegalia", "Anorexia", "Pérdida de peso", "Letargia", "Fiebre", "Vómitos/diarrea (forma GI)"]',
'{"clinicalExam": "Linfastadenopatía periférica generalizada (>2 ganglios增大), hepatomegalia, esplenomegalia", "labTests": ["Citología aspirado ganglio: linfocitos atípicos", "Hemograma: linfocitosis o linfopenia", "Flujo citométrico: fenotipaje B/T"], "imaging": ["Radiografía tórax: masa mediastínica", "Ecografía: hepatomegalia, esplenomegalia"], "differentialDiagnosis": ["Hiperplasia reactiva", "Infección viral", "Otra neoplasia"]}',
'{"firstLine": ["Prednisona 1-2 mg/kg PO q24h tapering", "Protocolo CHOP (Lomustina, Doxorubicina, Vincristina, Prednisona)", "Doxiciclina 10 mg/kg PO q12h", "Maropitant 1 mg/kg SC q24h"], "secondLine": ["Toceranib (Palladia®) 2-3 mg/kg PO q48h", "Masitinib (Masivet®) 12.5 mg/kg PO q24h", "Lomustina (CCNU) 60-90 mg/m² PO q21-28d"], "emergency": "Hipercalemia: gluconato de calcio 10% 0.5-1 mL/kg IV lento + insulina + dextrosa.", "duration": "Protocolo CHOP: 25 semanas. Mediana supervivencia 12-14 meses con quimioterapia.", "notes": "Chile: Prednisona genérica. Doxorubicina: centros oncológicos veterinarios (Santiago). Lomustina: bajo importación."}',
'["No hay prevención conocida", "Castración puede reducir riesgo", "Screening anual >7 años", "Atención a ganglios增大"]',
'guarded',
false,
'["ACVIM Canine Lymphoma Guidelines 2024", "VCOG Treatment Protocols 2023", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 13. HIPERTIROIDISMO
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Hipertiroidismo Felino',
'Feline Hyperthyroidism',
'cat',
'endocrine',
'moderate',
'Hiperproducción de hormonas tiroideas. Causa hipermetabolismo. La causa más común es adenoma de tiroides (95%). Más común en gatos >10 años.',
'El adenoma tiroideo produce T4 y T3 en exceso. Esto aumenta la tasa metabólica basal. El corazón trabaja más fuerte causando cardiomiopatía secundaria. La hipertensión sistémica es común.',
'["Pérdida de peso con buen apetito", "Hiperactividad", "Taquicardia", "Vómitos", "Diarrea", "Pelaje descuidado", "Poliuria/polidipsia", "Bocio"]',
'{"clinicalExam": "Pérdida de peso, taquicardia >240 lpm, bocio palpable, hiperactividad, pelaje descuidado", "labTests": ["T4 total >4.5 µg/dL", "Hemograma: posible eritrocitosis", "Bioquímica: ALT/AST elevadas, fosfato alcalino elevada", "Presión arterial: sistólica >160 mmHg"], "imaging": ["Ecocardiografía: cardiomiopatía hipertrófica secundaria", "Ecografía tiroidea: nódulos tiroideos"], "differentialDiagnosis": ["Enfermedad inflamatoria intestinal", "Diabetes mellitus", "Insuficiencia renal"]}',
'{"firstLine": ["Metimazol (Tapazol®) 2.5-5 mg PO q12-24h", "Dieta: Hills y/d — reducción yodo", "Atenolol 6.25-12.5 mg PO q12h — taquicardia", "Methimazole compounded transdérmico 2.5 mg oído q24h"], "secondLine": ["Yodo radiactivo (I-131): curación en 90%", "Cirugía: tiroidectomía bilateral (curación 90-95%)", "Amlodipino 0.625 mg PO q24h si hipertensión"], "emergency": "Tormenta tiroidea: Metimazol IV, propranolol IV, fluidoterapia + soporte.", "duration": "Metimazol: lifelong (si no se usa I-131). I-131: curación en 1 tratamiento.", "notes": "Chile: Metimazol (Tapazol®) disponible. Hills y/d disponible. I-131 en centros especializados (Santiago). Atenolol genérico."}',
'["No hay prevención conocida", "Screening de T4 anual en gatos >10 años", "Evitar dietas altas en yodo", "Monitoreo regular post-tratamiento"]',
'good',
false,
'["AAFP/ISFM Hyperthyroidism Guidelines 2024", "ACVIM Feline Thyroid Consensus 2023", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 14. FLUTD
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Síndrome Urológico Felino (FLUTD)',
'Feline Lower Urinary Tract Disease',
'cat',
'urological',
'severe',
'Conjunto de signos del tracto urinario inferior: disuria, estranguria, hematuria. Puede causar obstrucción urinaria (emergencia mortal).',
'La inflamación de vejiga y uretra causa irritación y obstrucción. Los cristales obstruyen la uretra. La obstrucción causa retención urinaria y falla renal aguda. La hiperpotasemia por retención es mortal.',
'["Esfuerzo urinario", "Orina en pequeñas cantidades", "Sangre en orina", "Lamido genital", "Orina fuera del arenero", "Vocalización al orinar", "Abdomen distendido (obstrucción)"]',
'{"clinicalExam": "Vejiga palpable增大 y firme (obstrucción), dolor al palpar, hematuria, taquicardia (hiperpotasemia)", "labTests": ["Análisis orina: cristales, pH, sangre", "Bioquímica: creatinina elevada, potasio >6.5 mEq/L", "Urocultivo: descartar infección", "Ecografía vejiga: cristales"], "imaging": ["Radiografía: cálculos radiopacos", "Ecografía: cálculos, tamaño de vejiga"], "differentialDiagnosis": ["Cistitis bacteriana", "Cáncer vejiga", "Cistitis intersticial"]}',
'{"firstLine": ["Desobstrucción uretral: catéter o lavado retrogrado", "Fluidoterapia: Ringer Lactato 60-80 mL/kg/día IV", "Gluconato de calcio 10% 0.5-1 mL/kg IV LENTO — hiperpotasemia", "Cystocap (N-acetilcisteína) 140 mg/kg carga luego 70 mg/kg q8h"], "secondLine": ["Metizol (metenamina) 15 mg/kg PO q12h", "Amitriptilina 1-2 mg/kg PO q24h — cistitis idiopática", "Gabapentina 5-10 mg/kg PO q8h", "Perineostomía (uretrostomía perineal) — obstrucciones recurrentes"], "emergency": "OBSTRUCCIÓN URINARIA: Desobstrucción INMEDIATA + gluconato de calcio IV + fluidoterapia. Hiperpotasemia >6.5 mEq/L es mortal.", "duration": "Hospitalización 2-3 días. Dieta urinaria de por vida. Monitoreo pH urinario cada 3 meses.", "notes": "Chile: Cystocap disponible. Dietas: Hills c/d, Royal Canin Urinary. Amitriptilina disponible."}',
'["Dieta urinaria húmeda (Hills c/d, Royal Canin Urinary)", "Fuentes de agua / fuentes para beber", "Reducir estrés (ambiente enriquecido)", "Areneros limpios y en cantidad", "Control de peso"]',
'guarded',
false,
'["AAFP/ISFM FLUTD Guidelines 2024", "ACVIM Urinary Consensus 2023", "Plumb''s Drug Handbook 11th Ed"]'
);

-- 15. ENFERMEDAD PERIODONTAL
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Enfermedad Periodontal',
'Periodontal Disease',
'both',
'dental',
'moderate',
'Inflamación y destrucción de tejidos de soporte dental. La enfermedad más común en perros y gatos >3 años.',
'La placa bacteriana se acumula en la línea gingival. La respuesta inmune causa inflamación. La inflamación crónica destruye el ligamento periodontal y el hueso alveolar. Las bolsas periodontales se profundizan.',
'["Halitosis", "Encías rojas/inflamadas", "Sangrado gingival", "Placa/tártaro visible", "Dientes flojos", "Pérdida de dientes", "Dolor al masticar"]',
'{"clinicalExam": "Halitosis, gingivitis, sangrado al sondaje, bolsas periodontales >3mm, tártaro, dientes moviles", "labTests": ["Radiografía dental: pérdida de hueso alveolar, reabsorción radicular", "Citología de bolsa: bacterias Gram+ y Gram-"], "imaging": ["Radiografía dental intraoral: estándar de oro"], "differentialDiagnosis": ["Estomatitis felina", "Fractura dental", "Neoplasia oral", "Forl felino"]}',
'{"firstLine": ["Limpieza dental profesional bajo anestesia general", "Clindamicina (Antirobe®) 10 mg/kg PO q12h por 7-10 días", "Clorhexidina 0.12% gel tópico gingival", "Carprofen (Rimadyl®) 4.4 mg/kg PO q12h post-operatorio", "Tramadol 2-5 mg/kg PO q8-12h"], "secondLine": ["Amoxicilina-ácido clavulánico 12.5 mg/kg PO q12h", "Doxiciclina 10 mg/kg PO q12h", "Extracción de dientes comprometidos", "Cirugía periodontal (injerto óseo)"], "emergency": "Absceso dental: drenaje + antibiótico IV. Celulitis facial: Amoxicilina-ácido clavulánico IV.", "duration": "Limpieza: recuperación 7-10 días. Mantenimiento: limpieza cada 6-12 meses.", "notes": "Chile: Clorhexidina 0.12% disponible. Rimadyl® (Zoetis), Antirobe® (Zoetis) disponibles."}',
'["Cepillado diario con pasta dental veterinaria", "Dietas VOHC aprobadas (Hills t/d, Royal Canin Dental)", "Limpieza dental profesional anual", "Chicles dentales aprobados"]',
'good',
false,
'["AVDC Periodontal Disease Guidelines 2024", "WSAVA Dental Guidelines 2023", "JAVMA 2023;260(S1):S40-S52"]'
);

-- 16. DERMATITIS ATÓPICA
INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list) VALUES (
'Dermatitis Atópica Canina',
'Canine Atopic Dermatitis (CAD)',
'dog',
'dermatological',
'moderate',
'Enfermedad inflamatoria alérgica de la piel. Predispuesta genéticamente. Reacción a alérgenos ambientales (polvo, ácaros, pólenes).',
'La barrera cutánea defectuosa permite entrada de alérgenos. Los mastocitos liberan histamina e IL-31 causando prurito. La respuesta Th2 dominante perpetúa la inflamación. La sobreinfección bacteriana/fúngica empeora los signos.',
'["Prurito intenso (cara, patas, axilas, ingles)", "Eritema", "Excoriaciones", "Liquenificación", "Hiperpigmentación", "Otitis externa recurrente", "Dermatitis podal"]',
'{"clinicalExam": "Prurito >5/10, distribución facial/patas/axilas/ingles, eritema, excoriaciones, liquenificación", "labTests": ["Citología cutánea: sobreinfección bacteriana/fúngica", "Swab cutáneo: Staphylococcus pseudintermedius", "Trichograma: descartar ácaros", "Serología alérgena (IgE)"], "imaging": [], "differentialDiagnosis": ["Dermatitis alérgica a pulgas", "Dermatofitosis", "Sarna demodécica", "Dermatitis por contacto"]}',
'{"firstLine": ["Oclacitinib (Apoquel®) 0.4-0.6 mg/kg PO q12h × 14 días luego q24h", "Prednisona 0.5-1 mg/kg PO q24h tapering", "Cetirizina 5-10 mg PO q12-24h", "Baños terapéuticos con clorhexidina/miconazol", "Cefalexina 22 mg/kg PO q12h si sobreinfección"], "secondLine": ["Ciclosporina (Atopica®) 5 mg/kg PO q24h", "Lokivetmab (Cytopoint®) 0.4-1.0 mg/kg SC q4-8w", "Suplementación omega-3"], "emergency": "Dermatitis aguda severa: Prednisona 1-2 mg/kg PO + antibiótico + collar isabelino.", "duration": "Tratamiento de por vida. Apoquel: respuesta 24-48h. Cytopoint: 1-3 días.", "notes": "Chile: Apoquel® (Zoetis), Cytopoint® (Zoetis), Atopica® (Zoetis) disponibles. Dietas: Hill derma, Royal Canin Skin Support."}',
'["Control de pulgas estricto", "Baños terapéuticos semanales", "Suplementación omega-3", "Control de ambiente (antialérgicos de cama)"]',
'guarded',
false,
'["ISCM Consensus CAD 2024", "ACVIM Atopic Dermatitis Guidelines 2023", "Plumb''s Drug Handbook 11th Ed"]'
);
