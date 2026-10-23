// Fifth pass on the disease catalog (Oct 2026): a clinical review of the 83 original entries plus updates
// from the clinic's library (IRIS 2026 feline CKD, AAHA 2024 fluid therapy, iCatCare July 2025 FIP update,
// virulent systemic calicivirus, canine parvovirus monoclonal antibodies, silver nanoparticles in distemper).
// It fixes dosing errors (toceranib 30 mg/kg in cats, oclacitinib 3.6 mg/kg in cats, atenolol mg/kg vs mg/cat,
// azathioprine in cats, IV vitamin K1, SC 10% dextrose, "incompatible" transfusions...), replaces the obsolete
// "90 mL/kg/h" shock rate with AAHA 2024 boluses, removes treatments without support and updates references.
//   node scripts/fix-diseases-review-2026-10.js          → dry run: every operation must match, nothing is written
//   node scripts/fix-diseases-review-2026-10.js --apply  → applies everything in one transaction
// Operations match by the start of a list item or emergency line, so a second run reports them as already done.
require('dotenv').config({ quiet: true });
const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');

// ─── References (verified) ───
const R = {
  AAHA_FLUIDS: 'Pardo M, Spencer E, Odunayo A, et al. 2024 AAHA Fluid Therapy Guidelines for Dogs and Cats. J Am Anim Hosp Assoc. 2024;60(4):131-163.',
  VENN: 'Venn EC, Preisner K, Boscan PL, et al. Evaluation of an outpatient protocol in the treatment of canine parvoviral enteritis. J Vet Emerg Crit Care. 2017;27(1):52-65.',
  LI2026: 'Li Y, Zhang X, Wang Z, et al. Computation-driven discovery of a next-generation canine monoclonal antibody for canine parvovirus therapy. Vet Microbiol. 2026;316:110982.',
  FIP2025: 'Taylor S, Tasker S, Barker E, et al. An update on the treatment of feline infectious peritonitis. International Cat Care; July 2025.',
  IRIS2026: 'International Renal Interest Society (IRIS). Treatment recommendations for CKD in cats (2026). iris-kidney.com.',
  HTN: 'Acierno MJ, Brown S, Coleman AE, et al. ACVIM consensus statement: Guidelines for the identification, evaluation, and management of systemic hypertension in dogs and cats. J Vet Intern Med. 2018;32(6):1803-1822.',
  LEPTO: 'Sykes JE, Francey T, Schuller S, et al. Updated ACVIM consensus statement on leptospirosis in dogs. J Vet Intern Med. 2023;37(6):1966-1982.',
  ENDO: 'Bugbee A, Rucinsky R, Cazabon S, et al. 2023 AAHA Selected Endocrinopathies of Dogs and Cats Guidelines. J Am Anim Hosp Assoc. 2023;59(3).',
  PANC_CAT: 'Forman MA, Steiner JM, Armstrong PJ, et al. ACVIM consensus statement on pancreatitis in cats. J Vet Intern Med. 2021;35(2):703-723.',
  PANC_DOG: 'Mansfield CS, James FE, Steiner JM, et al. A pilot study to assess tolerability of early enteral nutrition via esophagostomy tube feeding in dogs with severe acute pancreatitis. J Vet Intern Med. 2011;25(3):419-425.',
  IVDE: 'Olby NJ, Moore SA, Brisson B, et al. ACVIM consensus statement on diagnosis and management of acute canine thoracolumbar intervertebral disc extrusion. J Vet Intern Med. 2022;36(5):1570-1596.',
  IMHA: 'Swann JW, Garden OA, Fellman CL, et al. ACVIM consensus statement on the treatment of immune-mediated hemolytic anemia in dogs. J Vet Intern Med. 2019;33(3):1141-1172.',
  CURATIVE: 'Goggs R, Blais MC, Brainard BM, et al. American College of Veterinary Emergency and Critical Care (ACVECC) Consensus on the Rational Use of Antithrombotics in Veterinary Critical Care (CURATIVE) guidelines: Small-animal. J Vet Emerg Crit Care. 2019;29(1):12-36.',
  FATCAT: 'Hogan DF, Fox PR, Jacob K, et al. Secondary prevention of cardiogenic arterial thromboembolism in the cat: the double-blind, randomized, positive-controlled feline arterial thromboembolism; clopidogrel vs. aspirin trial (FAT CAT). J Vet Cardiol. 2015;17 Suppl 1:S306-S317.',
  HCM: 'Luis Fuentes V, Abbott J, Chetboul V, et al. ACVIM consensus statement guidelines for the classification, diagnosis, and management of cardiomyopathies in cats. J Vet Intern Med. 2020;34(3):1062-1077.',
  ISFM_DM: 'Sparkes AH, Cannon M, Church D, et al. ISFM consensus guidelines on the practical management of diabetes mellitus in cats. J Feline Med Surg. 2015;17(3):235-250.',
  SGLT2: 'U.S. Food and Drug Administration. Two new drugs to treat diabetes in cats (bexagliflozin and velagliflozin). FDA Animal Health Literacy; 2023.',
  WAVD_DERM: 'Moriello KA, Coyner K, Paterson S, Mignon B. Diagnosis and treatment of dermatophytosis in dogs and cats: Clinical Consensus Guidelines of the World Association for Veterinary Dermatology. Vet Dermatol. 2017;28(3):266-e68.',
  ICADA: 'Olivry T, DeBoer DJ, Favrot C, et al. Treatment of canine atopic dermatitis: 2015 updated guidelines from the International Committee on Allergic Diseases of Animals (ICADA). BMC Vet Res. 2015;11:210.',
  FHV: 'Thomasy SM, Shull O, Outerbridge CA, et al. Oral administration of famciclovir for treatment of spontaneous ocular, respiratory, or dermatologic disease attributed to feline herpesvirus type 1: 59 cases (2006-2013). J Am Vet Med Assoc. 2016;249(5):526-538.',
  RESP: 'Lappin MR, Blondeau J, Boothe D, et al. Antimicrobial use guidelines for treatment of respiratory tract disease in dogs and cats: Antimicrobial Guidelines Working Group of the International Society for Companion Animal Infectious Diseases. J Vet Intern Med. 2017;31(2):279-294.',
  THYROID: 'Carney HC, Ward CR, Bailey SJ, et al. 2016 AAFP Guidelines for the Management of Feline Hyperthyroidism. J Feline Med Surg. 2016;18(5):400-416.',
  RETRO: 'Little S, Levy J, Hartmann K, et al. 2020 AAFP Feline Retrovirus Testing and Management Guidelines. J Feline Med Surg. 2020;22(1):5-30.',
  SUB: 'Berent AC, Weisse CW, Bagley DH, Lamb K. Use of a subcutaneous ureteral bypass device for treatment of benign ureteral obstruction in cats: 174 ureters in 134 cats (2009-2015). J Am Vet Med Assoc. 2018;253(10):1309-1327.',
  UROLITHS: 'Lulich JP, Berent AC, Adams LG, et al. ACVIM small animal consensus recommendations on the treatment and prevention of uroliths in dogs and cats. J Vet Intern Med. 2016;30(5):1564-1574.',
  DENTAL: 'Bellows J, Berg ML, Dennis S, et al. 2019 AAHA Dental Care Guidelines for Dogs and Cats. J Am Anim Hosp Assoc. 2019;55(2):49-69.',
  AHDS: 'Unterer S, Strohmeyer K, Kruse BD, Sauter-Louis C, Hartmann K. Treatment of aseptic dogs with hemorrhagic gastroenteritis with amoxicillin/clavulanic acid: a prospective blinded study. J Vet Intern Med. 2011;25(5):973-979.',
  HEAT: 'Bruchim Y, Horowitz M, Aroch I. Pathophysiology of heatstroke in dogs - revisited. Temperature (Austin). 2017;4(4):356-370.',
  DM_PHYSIO: 'Kathmann I, Cizinauskas S, Doherr MG, Steffen F, Jaggy A. Daily controlled physiotherapy increases survival time in dogs with suspected degenerative myelopathy. J Vet Intern Med. 2006;20(4):927-932.',
  AGNP: 'Gastelum-Leyva F, Pena-Jasso A, Alvarado-Vera M, et al. Evaluation of the efficacy and safety of silver nanoparticles in the treatment of non-neurological and neurological distemper in dogs: a randomized clinical trial. Viruses. 2022;14(11):2329.',
  PALMERO: 'Palmero Colado ML, Carballés Pérez V. Enfermedades infecciosas felinas. Servet; 2010.',
  ETTINGER: "Ettinger SJ, Feldman EC, Côté E, eds. Ettinger's Textbook of Veterinary Internal Medicine. 9th ed. Elsevier; 2024.",
  ESCCAP_WORMS: 'ESCCAP. Worm control in dogs and cats. ESCCAP Guideline 01. 6th ed. European Scientific Counsel Companion Animal Parasites; 2021.',
  EHRLICHIA: 'Sainz Á, Roura X, Miró G, et al. Guideline for veterinary practitioners on canine ehrlichiosis and anaplasmosis in Europe. Parasit Vectors. 2015;8:75.',
  LEISHVET: 'Solano-Gallego L, Miró G, Koutinas A, et al. LeishVet guidelines for the practical management of canine leishmaniosis. Parasit Vectors. 2011;4:86.',
};

// Old references replaced everywhere they appear (newer editions)
const REF_REPLACEMENTS = [
  [/Ettinger SJ, Feldman EC,? (?:Côté E,? )?(?:\(eds?\)|eds?\.)?\.? ?Textbook of Veterinary Internal Medicine\.? 8th ed[^;]*; ?2017\.?/i, R.ETTINGER],
];

// AAHA 2024 wording reused across entries
const BOLUS_DOG = 'bolos de cristaloide isotónico tamponado (Ringer lactato o Plasma-Lyte) de 15-20 mL/kg en 15-30 min, reevaluando la perfusión después de cada bolo (AAHA 2024)';
const BOLUS_CAT = 'bolos de cristaloide isotónico tamponado de 5-10 mL/kg en 15-30 min, reevaluando después de cada bolo (los gatos toleran mal la sobrecarga; AAHA 2024)';
const PLAN = 'luego déficit (peso en kg × % de deshidratación = litros) en 12-24 h + mantención (perros 132 × peso^0,75 mL/día; gatos 80 × peso^0,75 mL/día) + pérdidas medidas';

// ─── Patch DSL ───
const PATCHES = [];
const patch = (name, ...ops) => PATCHES.push({ name, ops });
const item = (list, prefix, text) => ({ op: 'item', list, prefix, text });          // replace (or remove with null) a list item
const line = (prefix, text) => ({ op: 'line', prefix, text });                      // replace (or remove) an emergency protocol line
const set = (path, value) => ({ op: 'set', path, value });                          // set a field
const add = (list, items) => ({ op: 'add', list, items });                          // append list items (skipped if already there)
const refs = (...keys) => ({ op: 'refs', items: keys.map((k) => R[k] || k) });      // append references
const sub = (path, find, repl) => ({ op: 'sub', path, find, repl });                // substring replace in a text field

// ── Shock and fluid rates ──
patch('Parvovirus canino',
  item('firstLine', 'Fluidoterapia IV agresiva:', `Fluidoterapia IV: Corregir la hipovolemia con ${BOLUS_DOG}; ${PLAN}. Suplementar KCl y dextrosa según potasio y glucemia.`),
  item('firstLine', 'Maropitant (Cerenia® Zoetis):', 'Maropitant (Cerenia®): 1 mg/kg SC o IV cada 24 h. Antiemético de elección.'),
  item('firstLine', 'Antibioticoterapia amplio espectro:', 'Antibióticos (siempre en cachorros neutropénicos o febriles): Ampicilina 22 mg/kg IV cada 8 h o ampicilina-sulbactam 30 mg/kg IV cada 8 h; agregar enrofloxacino 5-10 mg/kg IV cada 24 h si hay sepsis o neutropenia grave (riesgo articular en razas grandes en crecimiento: usar solo por el tiempo necesario).'),
  item('firstLine', 'Omeprazol:', 'Omeprazol: 1 mg/kg IV o VO cada 12 h si hay hematemesis o vómitos persistentes.'),
  item('firstLine', 'Nutrición enteral suave temprana:', 'Nutrición enteral temprana: Ofrecer comida desde las primeras 12-24 h; si no come, sonda nasoesofágica con dieta líquida. Acelera la recuperación de la mucosa.'),
  item('secondLine', 'Plasma fresco:', 'Plasma fresco congelado: 10-20 mL/kg IV solo si hay coagulopatía; aporta poca albúmina y no corrige la hipoalbuminemia.'),
  item('secondLine', 'Filgrastim (G-CSF):', 'Filgrastim (G-CSF): 5 µg/kg SC cada 24 h; los estudios no demostraron mejor supervivencia, reservar para neutropenia extrema.'),
  add('secondLine', [
    'Protocolo ambulatorio (Colorado State University): Cuando la hospitalización no es posible: maropitant 1 mg/kg SC cada 24 h, cristaloide SC 30 mL/kg cada 8 h y cefovecina 8 mg/kg SC en dosis única, con controles diarios de glucemia y potasio. Supervivencia aproximada de 80 % frente a 90 % con hospitalización (Venn et al., 2017).',
    'Anticuerpos monoclonales contra parvovirus: En EE. UU. existe un anticuerpo monoclonal (Elanco) con licencia condicional del USDA desde 2023, en dosis única IV al diagnóstico; no está disponible en Chile. Un anticuerpo canino de nueva generación (E9) logró 80 % de eficacia en cachorros infectados experimentalmente (Li et al., 2026); sigue en investigación.',
  ]),
  line('Bolo de Lactato Ringer 20 mL/kg IV cada 15-30 min', 'Bolos de cristaloide 15-20 mL/kg IV en 15 min, reevaluando tras cada bolo'),
  line('Dobutamina 5-10 µg/kg/min IV si hipotensión refractaria', 'Noradrenalina 0,05-1 µg/kg/min IV si la hipotensión persiste tras reponer volumen (shock séptico vasodilatado)'),
  line('Vigilancia de glucemia cada 4-6h', 'Glucemia cada 4-6 h; dextrosa al 2,5-5 % en los fluidos si baja de 70 mg/dL'),
  set('treatment.notes', 'Chile: maropitant (Cerenia®), ampicilina, cefovecina (Convenia®), test rápido de antígeno fecal (SNAP Parvo) y vacunas con CPV-2 disponibles. El anticuerpo monoclonal no está disponible.'),
  refs('AAHA_FLUIDS', 'VENN', 'LI2026'),
);

patch('Golpe de calor (hipertermia)',
  line('Fluidoterapia IV a 90 mL/kg/h', 'Fluidoterapia IV: bolos de 15-20 mL/kg en 15 min, reevaluando la perfusión'),
  line('Dexametasona 0.2 mg/kg IV si convulsiones', null),
  line('Mannitol 20% 1 g/kg IV si edema cerebral', 'Manitol 0,5-1 g/kg IV en 20 min si se sospecha edema cerebral'),
  line('Enfriamiento inmediato con agua tibia', 'Enfriamiento inmediato con agua a temperatura ambiente y ventilador; detener a 39,5 °C'),
  item('firstLine', 'Fluidoterapia IV agresiva:', `Fluidoterapia IV: Cristaloide isotónico a temperatura ambiente (los fluidos fríos no aceleran el enfriamiento y causan vasoconstricción): ${BOLUS_DOG}; ${PLAN}. Corregir hipoglucemia y electrolitos.`),
  item('firstLine', 'Monitorización continua:', 'Monitorización continua: Temperatura rectal cada 5-10 minutos durante el enfriamiento; detenerlo a 39,5 °C para evitar la hipotermia de rebote. ECG, glucemia, lactato y coagulación seriados.'),
  item('secondLine', 'Dexametasona:', 'Corticoides: No recomendados; no mejoran el pronóstico y aumentan el riesgo de úlceras gastrointestinales e infección.'),
  refs('HEAT', 'AAHA_FLUIDS'),
);

patch('Dilatación-torsión gástrica',
  item('firstLine', 'Reanimacion agresiva:', 'Reanimación: Dos catéteres en miembros anteriores; bolos de cristaloide de 15-20 mL/kg en 15 min reevaluando tras cada uno, o solución salina hipertónica al 7,5 % 4-5 mL/kg en 5-10 min. Lactato seriado: su descenso con el tratamiento predice mejor pronóstico.'),
  refs('AAHA_FLUIDS'),
);

patch('Gastroenteritis hemorrágica',
  item('firstLine', 'Fluidoterapia IV agresiva:', `Fluidoterapia IV: Es el pilar del tratamiento: ${BOLUS_DOG}; ${PLAN}. Controlar hematocrito, proteínas y potasio.`),
  item('firstLine', 'Antibioticoterapia:', 'Antibióticos: Solo si hay signos de sepsis (fiebre, neutropenia, desviación a la izquierda, hipoglucemia, hipotensión): ampicilina 22 mg/kg IV cada 8 h. En perros sin sepsis no mejoran la evolución (Unterer et al., 2011).'),
  item('firstLine', 'Maropitant (Cerenia®):', 'Maropitant (Cerenia®): 1 mg/kg SC o IV cada 24 h. Antiemético de elección.'),
  set('treatment.notes', 'Chile: maropitant (Cerenia®) y cristaloides disponibles. Evita indicar metronidazol o amoxicilina-clavulánico de rutina: no acortan el cuadro y alteran la microbiota.'),
  refs('AHDS', 'AAHA_FLUIDS'),
);

patch('Enfermedad renal crónica canina',
  line('Fluidoterapia IV agresiva: Lactato de Ringer 90 mL/kg/día', 'Fluidoterapia IV: corregir el déficit en 12-24 h y luego ajustar al volumen de orina más pérdidas (evitar la sobrecarga)'),
  line('Maropitant 2 mg/kg SC para vómitos refractarios', 'Maropitant 1 mg/kg SC o IV cada 24 h'),
  item('firstLine', 'Fluidoterapia subcutánea:', 'Fluidoterapia subcutánea: Ringer lactato 20-30 mL/kg cada 24-72 h según hidratación (estadios 3-4). Evitar NaCl 0,9 % por vía SC (es ácido y duele).'),
  item('secondLine', 'Epoyetina humana recombinante:', 'Darbepoetina: 0,5 µg/kg SC semanal si el hematocrito es menor de 20 % con signos de anemia, con hierro dextrano 10-20 mg/kg IM; preferible a la epoetina humana por menor riesgo de anticuerpos.'),
  item('secondLine', 'Pantoprazol:', 'Protectores gástricos: No de rutina; la gastropatía urémica de perros y gatos rara vez es hiperacidez. Reservar omeprazol 1 mg/kg cada 12 h para hematemesis o melena.'),
  item('secondLine', 'Polidocanol', null),
  refs('AAHA_FLUIDS'),
);

patch('Leptospirosis canina',
  line('Doxiciclina IV 10 mg/kg inmediatamente', 'Ampicilina 20-30 mg/kg IV cada 6-8 h o penicilina G desde el primer momento (no esperar resultados); pasar a doxiciclina oral cuando no vomite'),
  item('firstLine', 'Antibioticoterapia: Doxiciclina:', 'Doxiciclina: 5 mg/kg VO o IV cada 12 h (o 10 mg/kg cada 24 h) durante 14 días. Elimina la portación renal; dar con agua o comida.'),
  item('firstLine', 'Fluidoterapia IV agresiva:', 'Fluidoterapia IV: Corregir la deshidratación en 12-24 h y luego igualar la producción de orina más pérdidas; pesar dos veces al día. Si hay oliguria, evitar la sobrecarga: la sobrehidratación empeora el pronóstico.'),
  item('firstLine', 'Ampicilina (fase inicial):', 'Ampicilina (fase inicial): 20-30 mg/kg IV cada 6-8 h mientras haya vómitos, luego doxiciclina oral.'),
  item('firstLine', 'Maropitant (Cerenia®):', 'Maropitant (Cerenia®): 1 mg/kg SC o IV cada 24 h.'),
  item('secondLine', 'Hemodiálisis:', 'Hemodiálisis: Indicada en anuria, oliguria refractaria, sobrecarga de volumen o hiperpotasemia que no responde; en centros de referencia.'),
  refs('LEPTO', 'AAHA_FLUIDS'),
);

patch('Pancreatitis canina',
  line('Maropitant 2 mg/kg IV + Ondansetrón 0.1 mg/kg IV si vómitos refractarios', 'Maropitant 1 mg/kg IV cada 24 h + ondansetrón 0,5-1 mg/kg IV cada 8-12 h si persisten los vómitos'),
  item('firstLine', 'Fluidoterapia IV agresiva:', `Fluidoterapia IV: ${BOLUS_DOG}; ${PLAN}.`),
  item('firstLine', 'Analgesia multimodal:', 'Analgesia multimodal: Metadona 0,1-0,3 mg/kg IV cada 4-6 h o buprenorfina 0,01-0,02 mg/kg IV cada 6-8 h; lidocaína en infusión 25-50 µg/kg/min y metamizol 25 mg/kg IV cada 8 h como complemento. El tramadol tiene poca eficacia en perros.'),
  item('firstLine', 'Ayuno y reintroducción dietética gradual:', 'Alimentación enteral temprana: No mantener ayunos prolongados; ofrecer dieta baja en grasa en las primeras 24-48 h con el vómito controlado, o sonda nasoesofágica si no come. Se tolera bien y mejora la recuperación (Mansfield et al., 2011).'),
  item('secondLine', 'Antibioticoterapia:', 'Antibióticos: No de rutina; solo si se sospecha necrosis infectada, absceso o sepsis.'),
  item('secondLine', 'Omeprazol:', 'Omeprazol: 1 mg/kg IV o VO cada 12 h si hay hematemesis o esofagitis.'),
  add('secondLine', ['Fuzapladib: Inhibidor de la activación de leucocitos con aprobación condicional en EE. UU. (2022) para la pancreatitis aguda canina; no está disponible en Chile.']),
  refs('PANC_DOG', 'AAHA_FLUIDS'),
);

// ── Dosing errors and contraindicated drugs ──
patch('Anemia hemolítica inmunomediada',
  line('Prednisona 2 mg/kg IV', 'Dexametasona 0,2-0,3 mg/kg IV (la prednisona no existe en presentación IV)'),
  item('firstLine', 'Inmunosupresión con corticosteroides:', 'Inmunosupresión con corticosteroides: Prednisolona 2 mg/kg/día VO (o 50-60 mg/m²/día en perros de más de 25 kg; máximo aproximado 80 mg/día). Reducir 25 % cada 2-3 semanas según el hematocrito, en 3-6 meses.'),
  item('firstLine', 'Transfusión de sangre total o concentrado de eritrocitos:', 'Transfusión: Concentrado de glóbulos rojos o sangre entera 10-20 mL/kg si el hematocrito es menor de 12-15 % o hay signos de hipoxia; tipificar (DEA 1) y hacer prueba cruzada mayor.'),
  item('firstLine', 'Inmunosupresión adicional:', 'Segundo inmunosupresor: Micofenolato 8-12 mg/kg VO cada 12 h, azatioprina 2 mg/kg VO cada 24 h o ciclosporina 5 mg/kg VO cada 12 h, en casos graves o refractarios, o para reducir el corticoide.'),
  item('firstLine', 'Tromboprofilaxis:', 'Tromboprofilaxis (en todos los perros con AHIM): Clopidogrel 1-4 mg/kg VO cada 24 h, o anticoagulante (enoxaparina 0,8-1 mg/kg SC cada 6-8 h, o rivaroxabán 0,5-1 mg/kg VO cada 24 h). La aspirina es menos eficaz.'),
  item('secondLine', 'Rituximab:', null),
  item('secondLine', 'Danazol:', null),
  add('secondLine', ['Inmunoglobulina humana IV: 0,5-1,5 g/kg en 6-12 h como rescate en casos refractarios, si está disponible; beneficio no demostrado.']),
  refs('IMHA', 'CURATIVE'),
);

patch('Mastocitoma felino',
  item('firstLine', 'Excisión quirúrgica amplia:', 'Escisión quirúrgica: En el mastocitoma cutáneo felino (en su mayoría de comportamiento benigno) suele bastar la escisión con márgenes estrechos; las formas pleomórficas o múltiples requieren evaluación oncológica.'),
  item('firstLine', 'Splenectomía (mastocitoma esplénico):', 'Esplenectomía (mastocitoma esplénico): Tratamiento de elección; prolonga mucho la supervivencia (a menudo más de un año), incluso con mastocitemia.'),
  item('firstLine', 'Quimioterapia adyuvante:', 'Quimioterapia: Prednisolona 1-2 mg/kg VO cada 24 h con reducción gradual; clorambucilo 2 mg/gato VO cada 48 h en enfermedad diseminada o de alto grado.'),
  item('secondLine', 'Toceranib (Palladia):', 'Toceranib: 2,5-2,75 mg/kg VO en días alternos o lunes, miércoles y viernes, en enfermedad no resecable o metastásica; hemograma y función renal de control.'),
  item('secondLine', 'Vinblastina:', 'Vinblastina: 2 mg/m² IV cada 1-2 semanas en enfermedad sistémica refractaria.'),
  item('secondLine', 'Aspirina:', null),
);

patch('Tromboembolismo aórtico felino',
  line('Analgesia: buprenorfina 0.02 mg/kg SC + methadone 0.1 mg/kg IV', 'Analgesia: metadona 0,2-0,3 mg/kg IV o IM cada 4 h, o fentanilo 2-3 µg/kg IV y luego 2-5 µg/kg/h (no combinar con buprenorfina)'),
  item('firstLine', 'Manejo del dolor:', 'Manejo del dolor: Es una urgencia de dolor: metadona 0,2-0,3 mg/kg IV/IM cada 4 h o fentanilo en infusión; luego buprenorfina 0,02-0,03 mg/kg cada 6-8 h. Evitar la lidocaína en gatos.'),
  item('firstLine', 'Fluidoterapia IV:', 'Fluidoterapia: Evitarla si hay insuficiencia cardíaca; solo en gatos deshidratados sin congestión, con volúmenes bajos y control respiratorio.'),
  item('firstLine', 'Soporte cardíaco:', 'Insuficiencia cardíaca: Furosemida 1-2 mg/kg IV/IM si hay edema pulmonar o derrame; toracocentesis si hay derrame pleural.'),
  item('firstLine', 'Recanalización:', 'Pronóstico funcional: Alrededor de un tercio a la mitad de los gatos que sobreviven a las primeras 24-72 h recupera la función motora en 1-6 semanas, sobre todo si un solo miembro está afectado y conserva algo de motricidad.'),
  item('secondLine', 'Trombólisis (estreptoquinasa):', 'Trombólisis: No recomendada de rutina; la reperfusión causa hiperpotasemia y arritmias graves con alta mortalidad.'),
  item('secondLine', 'Clopidogrel:', 'Prevención secundaria: Clopidogrel 18,75 mg/gato VO cada 24 h de por vida; es superior a la aspirina (estudio FAT CAT). Considerar agregar rivaroxabán 2,5 mg/gato cada 24 h en gatos de alto riesgo.'),
  item('secondLine', 'Amiodarona:', 'Cardiopatía de base: Tratar según la ficha de cardiomiopatía hipertrófica (consenso ACVIM 2020).'),
  refs('FATCAT', 'CURATIVE', 'HCM'),
);

patch('Absceso felino',
  line('Fluidoterapia IV agresiva: Lactato Ringer 60-80 mL/kg/día', 'Fluidoterapia IV: bolos de 5-10 mL/kg en 15 min si hay hipoperfusión; luego déficit en 12-24 h + mantención'),
  item('firstLine', 'Antibioticoterapia sistémica:', 'Antibióticos: Amoxicilina-ácido clavulánico 12,5-20 mg/kg VO cada 12 h durante 5-7 días tras un buen drenaje; muchos abscesos drenados no necesitan más. Alternativas: clindamicina o doxiciclina.'),
);

patch('Anemia neonatal felina',
  line('Transfusión de sangre total incompatible 10-15 mL/kg IV lento (gotero)', 'Transfusión de sangre entera compatible (tipificada; gatitos tipo B nunca con sangre A) 10-15 mL/kg IV o intraósea, lenta'),
  line('Fluidoterapia IV con Lactato Ringer 60 mL/kg/día', 'Fluidos tibios según requerimiento pediátrico (aproximadamente 2,5 veces la mantención del adulto)'),
  line('Eliminación de pulgas inmediata con selamectina tópico', 'Retirar pulgas con peine y baño tibio; usar solo antiparasitarios aprobados para la edad y el peso'),
  item('firstLine', 'Eliminación inmediata de pulgas:', 'Eliminación de pulgas: Peine fino y baño tibio con secado completo; fipronil en spray está aprobado desde los 2 días de edad y la selamectina desde las 6 semanas (6 mg/kg), según etiqueta. Tratar a la madre, a los demás animales y el ambiente.'),
  item('firstLine', 'Transfusión de sangre (casos severos):', 'Transfusión (casos graves): Sangre entera compatible 10-15 mL/kg IV o intraósea, lenta, si el hematocrito es menor de 15 % o hay inestabilidad; tipificar siempre (gatitos tipo B nunca reciben sangre tipo A).'),
  item('firstLine', 'Suplementación con hierro:', 'Hierro: Hierro dextrano 10 mg/kg IM en dosis única en anemia ferropénica por pulgas, si no se transfundió.'),
  item('secondLine', 'Eritropoyetina:', null),
);

patch('Anemia regenerativa felina',
  line('Transfusión urgente de PaTC 10-15 mL/kg o sangre total 10-20 mL/kg', 'Transfusión urgente de sangre entera 10-15 mL/kg o concentrado de glóbulos rojos 5-10 mL/kg, tipificada y compatible'),
  item('firstLine', 'Transfusión de sangre:', 'Transfusión: Sangre entera o concentrado de glóbulos rojos tipificados y compatibles; vigilar reacciones transfusionales.'),
  item('firstLine', 'Tratamiento de causa subyacente:', 'Tratar la causa: Doxiciclina 10 mg/kg VO cada 24 h (o 5 mg/kg cada 12 h) durante 2-4 semanas si hay hemoplasmas; control de pulgas; retirar fármacos o tóxicos oxidantes.'),
  item('firstLine', 'Inmunosupresión (HIM):', 'Inmunosupresión (anemia inmunomediada): Prednisolona 1-2 mg/kg VO cada 12 h con reducción gradual; como segundo fármaco, clorambucilo 0,1-0,2 mg/kg VO cada 24-48 h o ciclosporina. La azatioprina está contraindicada en gatos (mielotoxicidad grave).'),
  item('firstLine', 'Fluidoterapia IV:', 'Fluidoterapia: Solo si hay deshidratación, con volúmenes moderados (la anemia grave tolera mal la sobrecarga).'),
  item('secondLine', 'Danazol:', null),
  refs('PALMERO'),
);

patch('Asma felino',
  line('Dexametasona 0.5 mg/kg IV', 'Dexametasona 0,1-0,25 mg/kg IV o IM'),
  item('firstLine', 'Corticoides sistémicos (prednisona):', 'Corticoides sistémicos: Prednisolona 1-2 mg/kg VO cada 24 h por 5-7 días y luego reducir a la dosis mínima eficaz (en gatos usar prednisolona, no prednisona).'),
);

patch('Babesiosis canina',
  set('treatment.emergency', 'PRESENTACIÓN: Anemia hemolítica grave con debilidad, taquipnea y mucosas pálidas o ictéricas.\nPROTOCOLO:\n  - Oxígeno y manipulación mínima\n  - Transfusión de sangre entera o concentrado de glóbulos rojos (tipificada y con prueba cruzada) si el hematocrito es menor de 15 % o hay hipoxia\n  - Atropina 0,02-0,04 mg/kg SC 15-30 minutos antes del imidocarb\n  - Dipropionato de imidocarb 6,6 mg/kg IM o SC\n  - Fluidoterapia moderada y control de glucemia, función renal y bilirrubina'),
  set('treatment.firstLine', [
    'Dipropionato de imidocarb (Babesia vogeli, la especie descrita en Chile): 6,6 mg/kg IM o SC, repetir a los 14 días. Premedicar con atropina para evitar signos colinérgicos (salivación, diarrea, temblores).',
    'Transfusión: Si el hematocrito es menor de 15 % o hay signos de hipoxia.',
    'Control de garrapatas: Isoxazolinas en el perro y control ambiental; descartar coinfección con Ehrlichia y Anaplasma.',
  ]),
  set('treatment.secondLine', [
    'Atovacuona + azitromicina (Babesia gibsoni, casos importados): Atovacuona 13,3 mg/kg VO cada 8 h con comida grasa + azitromicina 10 mg/kg VO cada 24 h durante 10 días.',
    'Prednisolona: 1-2 mg/kg VO cada 24 h por pocos días si hay hemólisis inmunomediada secundaria grave.',
  ]),
  refs('Solano-Gallego L, Sainz Á, Roura X, Estrada-Peña A, Miró G. A review of canine babesiosis: the European perspective. Parasit Vectors. 2016;9:336.'),
);

patch('Calicivirus felino',
  item('firstLine', 'L-lisina:', null),
  item('secondLine', 'Cidofovir tópico:', null),
  item('firstLine', 'Suporte nutricional y de fluidos:', 'Soporte nutricional y de fluidos: Fluidoterapia SC si está deshidratado; comida húmeda tibia y blanda; sonda de esofagostomía si no come más de 3 días (las úlceras orales son muy dolorosas).'),
  refs('PALMERO'),
);

patch('Cardiomiopatía hipertrófica felina (HCM)',
  line('Furosemida IV: 2-4 mg/kg bolo, luego 1-2 mg/kg/h continuo', 'Furosemida 1-2 mg/kg IV o IM, repetir cada 1-2 h según frecuencia respiratoria (o infusión 0,5-1 mg/kg/h)'),
  line('Enjarrotamiento en ambiente tranquilo', 'Ambiente tranquilo, oxígeno y manipulación mínima'),
  item('firstLine', 'Inhibidor de la ECA (Benazepril):', 'IECA (benazepril 0,25-0,5 mg/kg VO cada 24 h): Opcional en el estadio C; no hay evidencia de que retrase la progresión.'),
  item('firstLine', 'Antiagregantes plaquetarios (Clopidogrel):', 'Clopidogrel: 18,75 mg/gato VO cada 24 h en el estadio B2 con aurícula izquierda agrandada, humo espontáneo o trombo, y en todos los gatos en estadio C (consenso ACVIM 2020).'),
  item('firstLine', 'Restricción de sal:', 'Dieta: Mantener el apetito y la condición corporal; la restricción de sodio es secundaria.'),
  item('secondLine', 'Atenolol:', 'Atenolol: 6,25-12,5 mg/gato VO cada 12 h solo si hay obstrucción dinámica del tracto de salida importante o taquiarritmias; no mejora la supervivencia.'),
  add('secondLine', ['Pimobendan: 0,625-1,25 mg/gato VO cada 12 h en el estadio C sin obstrucción del tracto de salida; evidencia limitada.']),
  refs('HCM'),
);

patch('Cataratas',
  line('Manitol 20% IV 1-2 g/kg durante 20-30 minutos', 'Manitol 1-1,5 g/kg IV en 20-30 minutos (retirar el agua 30-60 minutos)'),
  line('Acetazolamida 5-10 mg/kg IV cada 6 horas', 'Dorzolamida 2 % tópica cada 8 horas'),
);

patch('Cistitis intersticial felina',
  set('treatment.emergency', 'PRESENTACIÓN: Obstrucción uretral en machos (vejiga grande y dura, esfuerzo sin orina), con riesgo de hiperpotasemia.\nPROTOCOLO:\n  - ECG y potasio; si hay hiperpotasemia: gluconato de calcio 10 % 0,5-1 mL/kg IV lento e insulina regular 0,25-0,5 U/kg IV con dextrosa\n  - Analgesia y sedación\n  - Cistocentesis descompresiva si la desobstrucción se retrasa\n  - Desobstrucción uretral con sonda y lavado retrógrado bajo sedación o anestesia\n  - Fluidoterapia según déficit y vigilancia de la diuresis posobstructiva'),
  item('secondLine', 'Amitriptilina:', 'Amitriptilina: 2,5-12,5 mg/gato VO cada 24 h por la noche, solo en casos crónicos recurrentes que no responden al manejo ambiental; evidencia limitada.'),
  item('secondLine', 'Glicosaminoglicanos orales:', 'Glicosaminoglicanos orales: Los estudios no demostraron beneficio frente a placebo.'),
  add('firstLine', ['Modificación multimodal del ambiente (MEMO): Más cajas de arena limpias, agua en varios puntos, comida húmeda, juego diario y reducción de conflictos entre gatos; es la medida con mejor respaldo para reducir recurrencias.']),
);

patch('Complejo respiratorio felino',
  line('Fluidoterapia IV con Lactato Ringer 60-80 mL/kg/día', 'Fluidoterapia IV según déficit (bolos de 5-10 mL/kg solo si hay hipoperfusión)'),
  item('firstLine', 'Antibióticos para sobreinfección bacteriana:', 'Antibióticos (solo si hay fiebre, secreción mucopurulenta o decaimiento): Doxiciclina 5 mg/kg VO cada 12 h o 10 mg/kg cada 24 h durante 7-10 días (cubre Chlamydia, Mycoplasma y Bordetella); alternativa amoxicilina-ácido clavulánico 12,5-20 mg/kg cada 12 h.'),
  item('firstLine', 'Antivirales tópicos y sistémicos:', 'Antivirales (herpesvirus): Famciclovir 90 mg/kg VO cada 8 h (Thomasy et al., 2016); cidofovir 0,5 % oftálmico cada 12 h en queratitis herpética.'),
  item('firstLine', 'Suplementación con L-lisina:', null),
  refs('FHV', 'RESP'),
);

patch('Conjuntivitis',
  sub('treatment.emergency', 'Quimosis severa o ulcora corneal concurrente', 'Quemosis grave o úlcera corneal concurrente'),
  sub('treatment.emergency', 'Si ulcora: suspender corticosteroides', 'Si hay úlcera: suspender los corticoides'),
  item('firstLine', 'Antiinflamatorio tópico:', 'Antiinflamatorio tópico: Flurbiprofeno 0,03 % cada 8 h; dexametasona 0,1 % por 5-7 días solo si la fluoresceína es negativa y la causa no es infecciosa.'),
);

patch('Dermatitis atópica canina',
  line('Dexametasona 0.1-0.2 mg/kg IV dosis única para control agudo del prurito', null),
  item('firstLine', 'Lokivetmab (Cytopoint® Zoetis):', 'Lokivetmab (Cytopoint®): 1-2 mg/kg SC cada 4-8 semanas. Anticuerpo monoclonal canino contra la IL-31.'),
  item('secondLine', 'Glucocorticoides (uso intermitente):', 'Glucocorticoides: Prednisolona o metilprednisolona 0,5-1 mg/kg VO cada 12-24 h para brotes, reduciendo en cuanto se controle el prurito (ICADA). Evitar en pioderma profunda.'),
  refs('ICADA'),
);

patch('Dermatitis atópica felina',
  line('Corticoide de corta duración: Dexametasona 0.5 mg/kg SC dosis única', 'Prednisolona 1-2 mg/kg VO cada 24 h por pocos días si el prurito impide la curación, una vez controlada la infección'),
  sub('treatment.emergency', 'erisipela, celulitis, pioderma extensa', 'celulitis o pioderma extensa'),
  item('firstLine', 'Corticoterapia (prednisona):', 'Corticoides: Prednisolona 1-2 mg/kg VO cada 24 h por 7-14 días y luego reducir a días alternos (en gatos, prednisolona y no prednisona).'),
  item('secondLine', 'Oclacitinib (Apoquel):', 'Oclacitinib (uso fuera de etiqueta en gatos): 1 mg/kg VO cada 12 h por 14 días y luego cada 24 h; controlar hemograma.'),
);

patch('Dermatofitosis canina',
  set('treatment.emergency', 'PRESENTACIÓN: Dermatofitosis diseminada en perros inmunodeprimidos o con querion extenso.\nPROTOCOLO:\n  - Aislamiento y uso de guantes (zoonosis)\n  - Tratamiento sistémico y tópico combinados desde el inicio\n  - Buscar la causa de la inmunodepresión\n  - Limpieza ambiental'),
  set('treatment.firstLine', [
    'Terapia tópica (siempre): Champú de miconazol 2 % + clorhexidina 2 % dos veces por semana, o enjuagues de cal sulfurada 2-4 % si están disponibles. Reduce el contagio al ambiente.',
    'Itraconazol: 5 mg/kg VO cada 24 h, en pulsos de una semana sí y una no, con comida.',
    'Terbinafina: 30-40 mg/kg VO cada 24 h como alternativa.',
    'Limpieza ambiental: Aspirar y limpiar con detergente; desinfectar con hipoclorito de sodio 1:100. Lavar la ropa de cama con agua caliente.',
  ]),
  set('treatment.secondLine', ['Rapado localizado de lesiones: Con tijera o máquina, sin irritar la piel, en perros de pelo largo.']),
  set('treatment.duration', 'Hasta obtener 2 cultivos micológicos negativos con 2-4 semanas de diferencia (habitualmente 6-10 semanas).'),
  refs('WAVD_DERM'),
);

patch('Dermatofitosis felina',
  item('firstLine', 'Itraconazol:', 'Itraconazol: 5 mg/kg VO cada 24 h en pulsos de una semana sí y una no. Tratamiento sistémico de elección (WAVD).'),
  item('firstLine', 'Baño con miconazol-clorhexidina:', 'Terapia tópica: Champú de miconazol 2 % + clorhexidina 2 % dos veces por semana, dejando actuar 10 minutos, o enjuagues de cal sulfurada si están disponibles.'),
  item('firstLine', 'Limpieza ambiental exhaustiva:', 'Limpieza ambiental: Aspirar a diario, limpiar con detergente y desinfectar con hipoclorito de sodio 1:100 (concentraciones mayores no son más eficaces y dañan superficies). Lavar textiles con agua caliente.'),
  item('secondLine', 'Griseofulvina:', 'Griseofulvina: 25-50 mg/kg VO cada 12-24 h con comida grasa; evitar en gatitos, gatas gestantes y gatos FIV positivos (mielotoxicidad, teratogenia).'),
  item('secondLine', 'Vacuna antifúngica:', null),
  refs('WAVD_DERM'),
);

patch('Diabetes mellitus felina',
  line('Fluidoterapia IV agresiva: Lactato Ringer 60-80 mL/kg/día', 'Fluidoterapia IV: corregir el déficit en 12-24 h con cristaloide isotónico (bolos de 5-10 mL/kg solo si hay hipoperfusión)'),
  line('Insulina regular: 0.25 UI/kg IV bolo, luego 0.1-0.2 UI/kg/h IV continuo', 'Insulina regular en infusión 1,1 U/kg/día diluida en 250 mL de NaCl 0,9 %, tras 4-6 h de fluidos (o protocolo IM: 0,2 U/kg y luego 0,1 U/kg cada hora)'),
  item('firstLine', 'Insulina (Protamina zinc o Glargina):', 'Insulina: Glargina o PZI, 1 U/gato SC cada 12 h (o 0,25-0,5 U/kg según la glucemia), con ajustes de 0,5-1 U cada 5-7 días según curvas o sensor continuo. Buscar la remisión con control estricto en los primeros meses.'),
  item('firstLine', 'Control de peso:', 'Control de peso: Si es obeso, bajar 1-2 % del peso por semana; reajustar la insulina cuando cambie la ingesta o el peso.'),
  item('secondLine', 'Metformina:', 'Inhibidores SGLT2 (bexagliflozina, velagliflozina): Aprobados en EE. UU. (2022-2023) en dosis oral única diaria para gatos recién diagnosticados, sin tratamiento previo con insulina, sin cetosis y sin enfermedad concurrente no controlada; riesgo de cetoacidosis euglucémica, por lo que se controlan cetonas al inicio. Verifica disponibilidad en Chile.'),
  item('secondLine', 'Pioglitazona:', null),
  refs('ISFM_DM', 'SGLT2'),
);

patch('Displasia coxofemoral',
  item('firstLine', 'Suplementación nutracéutica:', 'Ácidos grasos omega 3: EPA y DHA 50-100 mg/kg/día; evidencia moderada. La glucosamina y la condroitina tienen evidencia débil.'),
  item('secondLine', 'Prótesis total de cadera (THR):', 'Prótesis total de cadera: Estándar de oro para displasia grave con dolor refractario; en centros especializados.'),
  add('firstLine', ['Bedinvetmab o grapiprant: Alternativas al AINE en perros con osteoartritis secundaria (ver la ficha de osteoartritis canina).']),
);

patch('Ehrlichiosis canina',
  set('treatment.emergency', 'PRESENTACIÓN: Pancitopenia o trombocitopenia grave con hemorragias.\nPROTOCOLO:\n  - Transfusión de sangre entera fresca si el hematocrito es menor de 15 % o hay hemorragia activa\n  - Doxiciclina IV 5 mg/kg cada 12 h si no tolera la vía oral\n  - Evitar inyecciones IM, punción yugular y cistocentesis\n  - Prednisolona 1-2 mg/kg por pocos días si hay trombocitopenia inmunomediada grave'),
  set('treatment.firstLine', [
    'Doxiciclina: 10 mg/kg VO cada 24 h (o 5 mg/kg cada 12 h) durante 28 días. Mejoría clínica en 24-48 h y del recuento de plaquetas en 1-2 semanas.',
    'Transfusión: Si el hematocrito es menor de 15 % o hay hemorragia activa.',
    'Control de garrapatas: Isoxazolinas en todos los perros de la casa y control ambiental.',
  ]),
  set('treatment.secondLine', [
    'Prednisolona: 1-2 mg/kg VO cada 24 h durante 3-7 días si hay trombocitopenia o poliartritis inmunomediada grave, junto con la doxiciclina.',
    'Fase crónica con médula hipoplásica: Pronóstico reservado; soporte transfusional y control de infecciones.',
  ]),
  refs('EHRLICHIA'),
);

patch('Enfermedad del disco intervertebral',
  set('treatment.emergency', 'PRESENTACIÓN: Paraparesia o paraplejía aguda, con o sin dolor profundo.\nPROTOCOLO:\n  - Examen neurológico completo y registro de la sensibilidad profunda\n  - Analgesia: metadona 0,2-0,3 mg/kg IV o IM cada 4-6 h\n  - Manipular con tabla rígida; reposo en jaula\n  - Derivar a resonancia o tomografía y cirugía en las primeras 24-48 h en perros sin marcha (urgente si no hay dolor profundo)\n  - No dar corticoides en dosis altas (succinato de metilprednisolona): no mejoran el pronóstico y aumentan las complicaciones'),
  set('treatment.firstLine', [
    'Cirugía descompresiva (hemilaminectomía): Recomendada en perros sin marcha o con dolor que no se controla; recuperan la marcha más del 90 % con dolor profundo conservado y alrededor del 50-60 % sin él.',
    'Analgesia multimodal: Opioide al inicio, luego AINE (meloxicam 0,1 mg/kg VO cada 24 h) y gabapentina 10 mg/kg VO cada 8 h.',
    'Manejo de la vejiga: Vaciamiento manual o sondaje cada 6-8 h en perros que no orinan voluntariamente; urocultivo si se prolonga.',
    'Rehabilitación: Desde los primeros días tras la cirugía o durante el manejo conservador (movilización pasiva, estimulación de la marcha, hidroterapia).',
  ]),
  set('treatment.secondLine', [
    'Manejo conservador: Reposo en jaula 4 semanas, analgesia y rehabilitación en perros con marcha conservada; recurrencias en un porcentaje relevante.',
    'Fenestración profiláctica de discos vecinos: Reduce la recurrencia en razas condrodistróficas; decisión del cirujano.',
  ]),
  refs('IVDE'),
);

patch('Enfermedad periodontal',
  line('Analgesia: Metamizol 25 mg/kg IM + Tramadol 2-4 mg/kg PO q12h', 'Analgesia: AINE (meloxicam 0,1-0,2 mg/kg) + metamizol 25 mg/kg IM; opioide si el dolor es intenso'),
  item('firstLine', 'Antibioticoterapia post-limpieza:', 'Antibióticos: No se indican de rutina tras la limpieza ni las extracciones; solo ante celulitis, osteomielitis o compromiso sistémico (AAHA 2019).'),
  refs('DENTAL'),
);

patch('Enfermedad periodontal felina',
  item('firstLine', 'Antibioticoterapia perioperatoria:', 'Antibióticos: No de rutina; solo ante infección grave, osteomielitis o compromiso sistémico (AAHA 2019).'),
  refs('DENTAL'),
);

patch('Enfermedad renal crónica felina',
  line('Fluidoterapia IV agresiva: Lactato Ringer 60-80 mL/kg/día', 'Fluidoterapia IV: corregir el déficit en 12-24 h y luego ajustar a orina + pérdidas, vigilando sobrecarga (frecuencia respiratoria, peso)'),
  line('Omeprazol 1 mg/kg IV', 'Omeprazol 1 mg/kg IV cada 12 h solo si hay hematemesis o melena'),
  set('treatment.firstLine', [
    'Estadificar y tratar lo tratable (IRIS 2026): Suspender nefrotóxicos, corregir causas prerrenales y posrenales, descartar pielonefritis y obstrucción ureteral, y medir presión arterial y UP/C en todos los estadios.',
    'Dieta clínica renal: Desde el estadio 2 (antes de que aparezca la inapetencia). Objetivo de fósforo: 2,7-4,5 mg/dL en el estadio 2, menor de 5,0 mg/dL en el estadio 3 y menor de 6,0 mg/dL en el estadio 4. FGF23 mayor de 400 pg/mL con fósforo normal también indica restringir. Si el calcio total supera 12 mg/dL, cambiar a una dieta menos restringida en fósforo.',
    'Quelantes de fósforo: Hidróxido de aluminio 30-100 mg/kg/día o carbonato de lantano 30-90 mg/kg/día con las comidas, si la dieta sola no alcanza el objetivo.',
    'Hipertensión (presión sistólica persistente mayor de 160 mmHg o daño de órgano diana): Amlodipino 0,125-0,25 mg/kg VO cada 24 h (duplicar a 0,25-0,5 mg/kg si no basta) o telmisartán 2 mg/kg VO cada 24 h; combinar ambos si es necesario. No iniciarlos en gatos deshidratados. Evitar presión sistólica menor de 120 mmHg.',
    'Proteinuria (UP/C mayor de 0,4): Telmisartán 1 mg/kg VO cada 24 h o benazepril 0,5-1 mg/kg cada 24 h, con dieta renal; UP/C 0,2-0,4 se vigila de cerca.',
    'Hidratación: Agua fresca siempre y comida húmeda; fluidos SC (Ringer lactato 20-30 mL/kg cada 24-72 h) en estadios avanzados con deshidratación recurrente.',
  ]),
  set('treatment.secondLine', [
    'Anemia: Darbepoetina 1 µg/kg SC semanal si el hematocrito es menor de 20 % con signos, hasta un hematocrito de 25 %, y luego espaciar; suplementar hierro. Menor riesgo de anticuerpos que la epoetina humana.',
    'Potasio: Gluconato de potasio 1-2 mEq/kg/día VO si el potasio es menor de 3,5 mEq/L.',
    'Apetito y náuseas: Mirtazapina transdérmica 2 mg/gato en la oreja cada 24 h o capromorelina; maropitant 1 mg/kg cada 24 h si hay náuseas.',
    'Tromboprofilaxis (proteinuria con hipoalbuminemia): Clopidogrel 10-18,75 mg/gato/día.',
    'Sin beneficio demostrado: Células madre mesenquimales y adsorbentes de toxinas urémicas (AST-120) no han demostrado mejorar la evolución.',
  ]),
  refs('IRIS2026', 'HTN'),
);

patch('Envenenamiento por rodenticidas',
  set('treatment.emergency', 'PRESENTACIÓN: Hemorragia activa con tiempos de coagulación prolongados.\nPROTOCOLO:\n  - Plasma fresco congelado 10-20 mL/kg IV (corrige la coagulopatía en horas) o sangre entera fresca si hay anemia\n  - Vitamina K1 2,5-5 mg/kg SC (nunca IV: riesgo de anafilaxia), luego VO con comida grasa\n  - Oxígeno y toracocentesis si hay hemotórax con disnea\n  - TP a las 12-24 h'),
  set('treatment.firstLine', [
    'Ingestión reciente sin signos (menos de 2-4 h): Inducir el vómito y dar carbón activado 1-2 g/kg. Luego vitamina K1 profiláctica o medir el TP a las 48-72 h y tratar solo si se prolonga.',
    'Vitamina K1: 2,5-5 mg/kg VO al día con comida grasa, dividida en 2 tomas: 1-2 semanas para anticoagulantes de 1.ª generación y 4 semanas para los de 2.ª generación (brodifacoum, bromadiolona). Medir el TP 48-72 h después de la última dosis.',
    'Transfusión: Si el hematocrito es menor de 15-20 % o hay hemorragia activa.',
  ]),
  set('treatment.secondLine', ['Plasma fresco congelado: 10-20 mL/kg IV cuando hay hemorragia, mientras actúa la vitamina K1 (tarda 6-12 h).']),
);

patch('FLUTD (síndrome urológico felino)',
  set('treatment.emergency', 'PRESENTACIÓN: Obstrucción uretral completa: anorexia, vómitos, letargia, vejiga distendida y dolorosa, hiperpotasemia (bradicardia, ECG anormal), colapso.\nPROTOCOLO:\n  - ECG y potasio; hiperpotasemia: gluconato de calcio 10 % 0,5-1 mL/kg IV lento e insulina regular 0,25-0,5 U/kg IV con dextrosa\n  - Fluidoterapia IV: bolos de 5-10 mL/kg si hay hipoperfusión, luego déficit en 12-24 h\n  - Cistocentesis descompresiva si la desobstrucción se retrasa\n  - Desobstrucción uretral con sonda (tipo Tomcat) bajo sedación o anestesia\n  - Vigilar la diuresis posobstructiva y ajustar los fluidos a la orina producida'),
  item('firstLine', 'Fluidoterapia para desobstrucción ureteral:', 'Fluidoterapia en la obstrucción uretral: Déficit en 12-24 h más el volumen de orina producido (la diuresis posobstructiva puede ser muy alta). Hiperpotasemia: gluconato de calcio 10 % 0,5-1 mL/kg IV lento, insulina regular 0,25-0,5 U/kg IV + dextrosa 1-2 g por unidad.'),
  item('firstLine', 'Desobstrucción ureteral:', 'Desobstrucción uretral: Sonda uretral bajo sedación o anestesia, lavado retrógrado suave con suero tibio; dejar una sonda permanente 24-48 h si el chorro no es bueno.'),
  refs('UROLITHS'),
);

patch('Glaucoma',
  line('Manitol 20% IV 1-2 g/kg en 30 minutos', 'Manitol 1-1,5 g/kg IV en 20-30 minutos (retirar el agua 30-60 minutos)'),
  line('Acetazolamida 5 mg/kg IV cada 8 horas', null),
  item('firstLine', 'Travoprost 0.004%:', 'Prostaglandinas (latanoprost 0,005 % o travoprost 0,004 %): 1 gota cada 12 h; reducen la presión en horas en el glaucoma primario canino. Contraindicadas en luxación anterior del cristalino y uveítis.'),
  item('firstLine', 'Manitol 20% IV:', 'Manitol: 1-1,5 g/kg IV en 20-30 minutos en crisis agudas, retirando el agua 30-60 minutos.'),
  item('firstLine', 'Acetazolamida:', null),
);

patch('Glomerulonefritis felina',
  line('Albúmina humana 1-2 mL/kg IV si hipoalbuminemia severa', 'Evitar la albúmina humana en gatos (reacciones graves); plasma o coloides solo si hay hipotensión'),
  item('firstLine', 'Benacepril (inhibidor de ECA):', 'Bloqueo del SRAA: Telmisartán 1 mg/kg VO cada 24 h o benazepril 0,5-1 mg/kg cada 24 h. No iniciar en gatos deshidratados.'),
  item('firstLine', 'Manejo de la proteinuria:', 'Manejo de la proteinuria: UP/C cada 1-3 meses; objetivo: reducirla al menos un 50 % o por debajo de 0,4. Clopidogrel 10-18,75 mg/gato/día si hay hipoalbuminemia.'),
  item('secondLine', 'Prednisolona (GN autoinmune):', 'Prednisolona: 1-2 mg/kg VO cada 12 h con reducción gradual, solo si la biopsia confirma un componente inmunomediado.'),
  refs('IRIS2026'),
);

patch('Hiperadrenocorticismo (síndrome de Cushing)',
  set('treatment.emergency', 'PRESENTACIÓN: Hipoadrenocorticismo iatrogénico por trilostano o mitotano (decaimiento, vómitos, anorexia, hiponatremia o hiperpotasemia) o tromboembolismo pulmonar.\nPROTOCOLO:\n  - Suspender el trilostano o el mitotano\n  - Dexametasona 0,1-0,2 mg/kg IV o hidrocortisona en infusión 0,5-0,625 mg/kg/h\n  - Fluidoterapia con NaCl 0,9 % y corrección de la hiperpotasemia\n  - Si hay tromboembolismo: oxígeno y anticoagulación según CURATIVE'),
  set('treatment.firstLine', [
    'Trilostano: Iniciar con aproximadamente 1 mg/kg VO cada 12 h con comida (dosis bajas, AAHA 2023); ajustar en pasos de 25-50 % tras el primer mes.',
    'Controles: A los 10-14 días, a las 4 semanas y luego cada 3 meses: signos clínicos (sed, apetito), electrolitos y cortisol antes de la dosis o 2-4 h después, según el laboratorio. Suspender si hay decaimiento, vómitos o anorexia.',
  ]),
  set('treatment.secondLine', [
    'Mitotano: 25-50 mg/kg/día VO dividido en fase de inducción, con control estrecho; reservado para quien conoce su manejo.',
    'Cirugía: Adrenalectomía en tumores adrenales sin invasión vascular extensa; hipofisectomía en centros especializados.',
  ]),
  refs('ENDO'),
);

patch('Hipertensión sistémica felina',
  item('firstLine', 'Amlodipino:', 'Amlodipino: 0,125-0,25 mg/kg VO cada 24 h; si no basta, 0,25-0,5 mg/kg cada 24 h (IRIS 2026). Objetivo: presión sistólica menor de 160 mmHg sin bajar de 120.'),
  item('firstLine', 'Benacepril (IECA):', 'Telmisartán: 2 mg/kg VO cada 24 h como alternativa de primera línea o combinado con amlodipino si uno solo no controla la presión; no subir de 2 mg/kg. No iniciar en gatos deshidratados.'),
  item('secondLine', 'Telmisartán:', 'Benazepril: 0,5-1 mg/kg VO cada 24 h si hay proteinuria (UP/C mayor de 0,4); efecto antihipertensivo modesto.'),
  item('secondLine', 'Atenolol:', 'Atenolol: 6,25 mg/gato VO cada 12-24 h solo para taquicardia por hipertiroidismo o cardiopatía, no como antihipertensivo único.'),
  refs('IRIS2026', 'HTN'),
);

patch('Hipertiroidismo felino',
  line('Metimazol 5 mg IV o PO', 'Metimazol 2,5 mg/gato VO o transdérmico (no existe presentación IV)'),
  line('Atenolol 6.25 mg PO', 'Atenolol 6,25 mg/gato VO; esmolol 0,05-0,1 mg/kg IV si la taquicardia es grave'),
  item('firstLine', 'Metimazol (Tapazole):', 'Metimazol: 1,25-2,5 mg/gato VO o transdérmico cada 12 h; controlar T4, creatinina y hemograma a las 2-4 semanas y ajustar de a 1,25-2,5 mg/día. Vigilar que el control del hipertiroidismo no desenmascare enfermedad renal.'),
  item('firstLine', 'Tiroidectomía bilateral:', 'Tiroidectomía: Unilateral o bilateral con preservación de paratiroides; eutiroidismo previo con metimazol y control de calcio posoperatorio (riesgo de hipocalcemia).'),
  item('secondLine', 'Timolol:', null),
  refs('THYROID'),
);

patch('Hipoglucemia neonatal canina',
  line('Dextrosa 50% 0.5-1 mL/kg IV lenta (diluida 1:1 con solución salina) inmediatamente', 'Dextrosa al 10-12,5 % 2-4 mL/kg IV o intraósea, lenta (la dextrosa al 50 % es demasiado hiperosmolar para un neonato)'),
  line('Si no es posible acceso IV: Dextrosa 10% 5 mL/kg SC o glucosa por via rectal', 'Sin acceso vascular: jarabe de glucosa o miel en la mucosa oral (nunca dextrosa concentrada SC: causa necrosis de la piel)'),
  item('firstLine', 'Corrección inmediata de glucosa:', 'Corrección de la glucemia: Dextrosa al 10-12,5 % 2-4 mL/kg IV o intraósea, lenta, y luego infusión de dextrosa al 5 % en los fluidos. Nunca dextrosa concentrada por vía SC.'),
  item('secondLine', 'Corticosteroides:', null),
  item('secondLine', 'Glucagón:', 'Hipoglucemia refractaria: Buscar la causa (sepsis, hipotermia, shunt portosistémico, enfermedad de almacenamiento de glucógeno) y mantener la infusión de dextrosa.'),
);

patch('Hipotiroidismo canino',
  set('treatment.emergency', 'PRESENTACIÓN: Coma mixedematoso (muy raro): estupor, hipotermia, bradicardia, hipoventilación.\nPROTOCOLO:\n  - Levotiroxina IV 5 µg/kg cada 12 h (o VO por sonda si no hay presentación IV)\n  - Calentamiento pasivo gradual (no calentamiento agresivo)\n  - Soporte ventilatorio y fluidos con cautela\n  - Hidrocortisona si se sospecha insuficiencia adrenal concurrente'),
  set('treatment.firstLine', [
    'Levotiroxina: 20 µg/kg VO cada 24 h (máximo 0,8 mg) o 10 µg/kg cada 12 h, idealmente en ayunas y siempre de la misma forma. En perros con cardiopatía, iniciar con 25-50 % de la dosis.',
    'Control: T4 total 4-6 h después de la dosis a las 4-8 semanas; objetivo en el rango normal alto o algo por encima. La mejoría de la letargia se ve en 1-2 semanas y la de la piel en 1-3 meses.',
  ]),
  refs('ENDO'),
);

patch('Influenza canina',
  item('firstLine', 'Antitusigenos:', 'Antitusivos: Butorfanol 0,5-1 mg/kg VO cada 6-12 h para tos seca intensa; no usarlos si hay neumonía o tos productiva.'),
  refs('RESP'),
);

patch('Intoxicación por chocolate',
  sub('treatment.emergency', 'Lidocaina 50 ugr/kg/min IV si arritmia ventricular', 'Lidocaína 2 mg/kg IV en bolo y luego 25-50 µg/kg/min si hay taquicardia ventricular'),
  item('firstLine', 'Fluidoterapia IV:', 'Fluidoterapia IV: Cristaloide a 1,5-2 veces la mantención y paseos o sondaje urinario frecuentes: la teobromina se reabsorbe desde la vejiga.'),
);

patch('Intoxicación por xilitol',
  line('Carbone activado 1-2 g/kg PO', null),
  item('firstLine', 'Carbone activado:', null),
  item('firstLine', 'Induccion de vómitos:', 'Inducción del vómito: Solo si la ingestión es reciente, el perro está asintomático y la glucemia es normal (el vómito puede precipitar la hipoglucemia); dar después una comida pequeña. El carbón activado no adsorbe bien el xilitol y no se recomienda.'),
);

patch('Leishmaniasis canina',
  item('firstLine', 'Glucantime:', 'Antimoniato de meglumina: 75-100 mg/kg SC cada 24 h durante 28 días, junto con alopurinol (LeishVet). Controlar función renal.'),
  item('secondLine', 'Anfotericina B:', null),
  item('secondLine', 'Miltefosina:', 'Miltefosina: 2 mg/kg VO cada 24 h con comida durante 28 días, junto con alopurinol; alternativa al antimoniato.'),
  refs('LEISHVET'),
);

patch('Leucemia felina (FeLV)',
  line('Eritropoyetina 100 UI/kg SC si anemia regenerativa', 'Buscar hemoplasmas y otras causas tratables de la anemia'),
  item('firstLine', 'Interferón omega felino:', 'Interferón omega felino: 1 MU/kg SC cada 24 h durante 5 días consecutivos, en 3 ciclos (días 0, 14 y 60); puede mejorar los signos clínicos, sin efecto demostrado sobre la viremia.'),
  item('secondLine', 'Zidovudina (AZT):', 'Zidovudina (AZT): 5 mg/kg VO o SC cada 12 h en gatos con estomatitis o signos neurológicos; controlar hemograma (anemia no regenerativa). Evidencia limitada.'),
  refs('RETRO'),
);

patch('Leucemia linfocítica felina',
  line('Transfusión de PaTC si Hct < 15%', 'Transfusión de concentrado de glóbulos rojos o sangre entera compatible si el hematocrito es menor de 15 %'),
  item('firstLine', 'Protocolo de quimioterapia (COP):', 'Leucemia linfocítica crónica (la forma habitual): Clorambucilo 2 mg/gato VO cada 48-72 h + prednisolona 1-2 mg/kg VO cada 24 h; suele controlarse por meses a años.'),
  item('firstLine', 'Transfusiones si necesario:', 'Transfusiones: Concentrado de glóbulos rojos o sangre entera compatible si el hematocrito es menor de 15 %; plaquetas si hay hemorragia por trombocitopenia.'),
  item('secondLine', 'Protocolo CHOP:', 'Leucemia aguda o de alto grado: Protocolo COP (ciclofosfamida 300 mg/m² VO cada 3 semanas, vincristina 0,75 mg/m² IV semanal por 4 semanas y luego cada 3 semanas, prednisolona 2 mg/kg/día) o CHOP, con oncólogo; pronóstico grave.'),
  item('secondLine', 'Toceranib (Palladia):', null),
);

patch('Linfoma canino',
  set('treatment.emergency', 'PRESENTACIÓN: Hipercalcemia grave (poliuria, debilidad, arritmias) o dificultad respiratoria por linfadenomegalia o derrame.\nPROTOCOLO:\n  - Tomar las muestras diagnósticas (citología o biopsia, inmunofenotipo) ANTES del corticoide: la prednisolona puede impedir el diagnóstico y generar resistencia\n  - NaCl 0,9 % IV para corregir la deshidratación y favorecer la calciuresis\n  - Furosemida 1-2 mg/kg IV solo después de rehidratar\n  - Pamidronato 1-2 mg/kg IV en 2 h si persiste la hipercalcemia\n  - Oxígeno y toracocentesis si hay derrame'),
  set('treatment.firstLine', [
    'Protocolo CHOP (de elección en linfoma B multicéntrico): Ciclofosfamida, doxorrubicina, vincristina y prednisolona en 19-25 semanas; remisión en 80-90 % y supervivencia media de 10-14 meses.',
    'Prednisolona sola (paliativa): 1-2 mg/kg/día con reducción; supervivencia de 1-2 meses y puede reducir la respuesta a una quimioterapia posterior. Explicarlo al tutor antes de empezar.',
  ]),
  set('treatment.secondLine', [
    'Protocolos de rescate: Lomustina, MOPP, L-asparaginasa o rabacfosadina (aprobada en EE. UU., disponibilidad limitada) en recaídas tras CHOP.',
    'Linfoma T: Peor respuesta a CHOP; considerar protocolos con lomustina (LOPP) con oncólogo.',
  ]),
);

patch('Linfoma gastrointestinal felino',
  item('firstLine', 'Clorambucil + Prednisolona (bajo grado):', 'Linfoma de células pequeñas (bajo grado): Clorambucilo 2 mg/gato VO cada 48 h (o 15-20 mg/m² cada 2 semanas) + prednisolona 1-2 mg/kg VO cada 24 h con reducción gradual; remisión en la mayoría, con supervivencia de años.'),
  item('secondLine', 'Toceranib (Palladia):', null),
);

patch('Lipidosis hepática felina',
  item('firstLine', 'Alimentación nutricional agresiva:', 'Alimentación por sonda (pilar del tratamiento): Sonda de esofagostomía o nasoesofágica; comenzar con 25-33 % del requerimiento en reposo (RER = 70 × peso^0,75 kcal/día) y llegar al 100 % en 3-4 días, controlando fósforo, potasio y magnesio (síndrome de realimentación).'),
  item('firstLine', 'Antiéméticos:', 'Antieméticos y apetito: Maropitant 1 mg/kg SC o IV cada 24 h; ondansetrón 0,5-1 mg/kg IV cada 8-12 h; mirtazapina transdérmica 2 mg/gato cada 24 h cuando empiece a comer.'),
  item('firstLine', 'Fluidoterapia IV:', 'Fluidoterapia IV: Cristaloide isotónico sin lactato ni dextrosa en exceso, con potasio y fosfato según electrolitos; corregir el déficit en 12-24 h.'),
  item('secondLine', 'Manejo de encefalopatía hepática:', 'Encefalopatía hepática: Lactulosa 0,5 mL/kg VO cada 8 h; metronidazol 7,5 mg/kg VO cada 12 h (dosis reducida por la disfunción hepática).'),
  item('secondLine', 'Vitamina K1:', 'Vitamina K1: 0,5-1,5 mg/kg SC cada 12 h por 3 dosis antes de colocar la sonda o de cualquier punción (la coagulopatía es frecuente).'),
);

patch('Lupus eritematoso sistémico',
  line('Prednisona 2 mg/kg IV', 'Dexametasona 0,2-0,3 mg/kg IV'),
);

patch('Luxación patelar',
  set('treatment.firstLine', [
    'Cirugía: Indicada en luxaciones de grado II o mayor con cojera, y en cachorros con grado III-IV. Combina trocleoplastia (en cuña o en bloque), transposición de la tuberosidad tibial e imbricación o liberación de tejidos blandos según el caso. Más del 90 % recupera una función buena.',
    'Control de peso y ejercicio: Mantener la condición corporal ideal y ejercicio regular sin saltos.',
    'Analgesia: AINE (meloxicam 0,1 mg/kg VO cada 24 h) en los episodios de cojera y en el posoperatorio.',
  ]),
  set('treatment.secondLine', ['Manejo conservador: Grado I o II sin cojera: control de peso, fisioterapia y controles periódicos.']),
  refs('Perry KL, Déjardin LM. Canine medial patellar luxation. J Small Anim Pract. 2021;62(5):315-335.'),
);

patch('Mielopatía degenerativa',
  item('firstLine', 'N-acetilcisteina (NAC):', null),
  item('firstLine', 'Vitamina B y E:', null),
  item('firstLine', 'Rehabilitación física:', 'Fisioterapia intensiva diaria: Es la única medida que demostró prolongar la marcha y la supervivencia (Kathmann et al., 2006): ejercicios activos, hidroterapia y marcha asistida.'),
  item('secondLine', 'Amantadina:', 'Sin beneficio demostrado: N-acetilcisteína, ácido aminocaproico, vitaminas y amantadina no han mostrado frenar la progresión.'),
  item('secondLine', 'Acupuncture:', 'Acupuntura: Puede usarse como complemento para el bienestar; evidencia limitada.'),
  refs('DM_PHYSIO'),
);

patch('Moquillo canino',
  line('Amoxicilina-clavulánico IV 22 mg/kg + Enrofloxacino 5 mg/kg IV', 'Ampicilina-sulbactam 30 mg/kg IV cada 8 h (evitar fluoroquinolonas en cachorros en crecimiento)'),
  item('firstLine', 'Antibióticos de amplio espectro:', 'Antibióticos para la bronconeumonía secundaria: Doxiciclina 5 mg/kg VO cada 12 h (cubre Bordetella y Mycoplasma) o amoxicilina-ácido clavulánico 12,5-25 mg/kg cada 12 h. Evitar fluoroquinolonas en cachorros en crecimiento.'),
  item('firstLine', 'Inmunoterapia:', 'Interferón omega: 1-2,5 MU/kg SC cada 24 h por 3-5 días en la fase aguda; evidencia limitada.'),
  item('secondLine', 'Acupuntura y medicina complementaria:', 'Nanopartículas de plata (evidencia emergente): Un ensayo clínico aleatorizado en México (207 perros) mostró mayor supervivencia con nanopartículas de plata al 3 % por vía oral y nasal junto al soporte (84,6 % frente a 15,2 % en la forma no neurológica). Es un solo estudio; aún no forma parte de las guías. Verifica la disponibilidad y el registro del producto en Chile.'),
  refs('AGNP'),
);

patch('Neumonía por aspiración',
  set('treatment.emergency', 'PRESENTACIÓN: Dificultad respiratoria grave tras vómito, regurgitación o anestesia.\nPROTOCOLO:\n  - Oxígeno de inmediato (jaula, cánulas nasales o máscara)\n  - Acceso venoso y fluidos para mantener la perfusión sin sobrecargar\n  - Ampicilina-sulbactam 30 mg/kg IV cada 8 h; agregar enrofloxacino 10 mg/kg IV cada 24 h si hay sepsis\n  - Radiografía torácica cuando esté estable\n  - Ventilación mecánica si la hipoxemia no se corrige con oxígeno'),
  set('treatment.firstLine', [
    'Antibióticos: Ampicilina-sulbactam 30 mg/kg IV cada 8 h, o amoxicilina-ácido clavulánico; agregar una fluoroquinolona si hay sepsis. Ajustar al cultivo del lavado traqueal. Duración de 7-10 días en casos sin complicaciones (ISCAID 2017).',
    'Oxígeno y fisioterapia respiratoria: Oxígeno si la SpO2 es menor de 95 %; nebulización con suero y coupage cada 4-6 h.',
    'Tratar la causa: Megaesófago, parálisis laríngea, síndrome braquicefálico, vómitos (maropitant 1 mg/kg cada 24 h) o recuperación anestésica.',
  ]),
  set('treatment.secondLine', [
    'Lavado traqueal o broncoalveolar: Para citología y cultivo en casos graves o sin respuesta.',
    'Neumonitis química sin infección: Una aspiración reciente sin fiebre ni signos sistémicos puede no requerir antibiótico; vigilar 24-48 h.',
  ]),
  refs('RESP'),
);

patch('Obstrucción intestinal felina',
  line('Fluidoterapia IV de choque: Lactato Ringer 80-100 mL/kg en primera hora', 'Fluidoterapia IV: bolos de 5-10 mL/kg en 15 min, reevaluando tras cada bolo'),
  item('firstLine', 'Resucitación preoperatoria:', `Resucitación preoperatoria: ${BOLUS_CAT}; corregir déficit y electrolitos antes de anestesiar.`),
  item('firstLine', 'Manejo del dolor:', 'Manejo del dolor: Metadona 0,2-0,3 mg/kg IV o buprenorfina 0,02-0,03 mg/kg IV cada 6-8 h; meloxicam solo cuando esté normovolémico y con función renal normal. Evitar la lidocaína en gatos.'),
  refs('AAHA_FLUIDS'),
);

patch('Otitis externa',
  item('secondLine', 'Cirugía ablativa (ab canal):', 'Ablación total del conducto auditivo con osteotomía lateral de la bulla (TECA-LBO): En otitis crónica con estenosis o calcificación irreversible del conducto.'),
);

patch('Pancreatitis felina',
  line('Fluidoterapia IV agresiva: Lactato Ringer 80-100 mL/kg en primera hora', 'Fluidoterapia IV: bolos de 5-10 mL/kg en 15 min si hay hipoperfusión, reevaluando'),
  line('Analgesia IV: buprenorfina + lidocaina CRI', 'Analgesia IV: buprenorfina 0,02-0,03 mg/kg cada 6-8 h o metadona 0,2-0,3 mg/kg cada 4-6 h'),
  item('firstLine', 'Fluidoterapia IV:', `Fluidoterapia IV: ${BOLUS_CAT}; ${PLAN}.`),
  item('firstLine', 'Manejo del dolor:', 'Manejo del dolor: Buprenorfina 0,02-0,03 mg/kg IV o transmucosa cada 6-8 h; asumir que todo gato con pancreatitis tiene dolor aunque no lo demuestre.'),
  item('firstLine', 'Nutrición enteral temprana:', 'Nutrición enteral temprana: En las primeras 24-48 h; sonda nasoesofágica o de esofagostomía si no come (evita la lipidosis hepática). Mirtazapina o capromorelina como estimulantes del apetito.'),
  item('firstLine', 'Antieméticos:', 'Antieméticos: Maropitant 1 mg/kg SC o IV cada 24 h; ondansetrón 0,5-1 mg/kg IV cada 8-12 h si persisten las náuseas.'),
  refs('PANC_CAT', 'AAHA_FLUIDS'),
);

patch('Panleucopenia felina',
  line('Fluidoterapia IV de choque: Lactato Ringer 20-30 mL/kg en bolo, repetir según respuesta', 'Fluidoterapia IV: bolos de 5-10 mL/kg en 15 min, reevaluando tras cada bolo'),
  line('Omeprazol 1 mg/kg IV q24h', 'Omeprazol 1 mg/kg IV cada 12 h si hay hematemesis'),
  item('firstLine', 'Fluidoterapia IV agresiva:', `Fluidoterapia IV: ${BOLUS_CAT}; ${PLAN}. Agregar dextrosa al 2,5-5 % y potasio según controles.`),
  item('secondLine', 'G-CSF (factor estimulante de colonias de granulocitos):', 'Filgrastim: No demostró beneficio en la panleucopenia felina y no se recomienda.'),
  item('secondLine', 'Transfusión de sangre total:', 'Transfusión de sangre entera compatible: 10-15 mL/kg IV (tipificada) si hay anemia grave o hemorragia activa.'),
);

patch('Parásitos intestinales en cachorros',
  item('firstLine', 'Pirantel pamoato:', 'Pamoato de pirantel: 5-10 mg/kg VO desde las 2 semanas de edad, cada 2 semanas hasta 2 semanas después del destete y luego mensual hasta los 6 meses. Eficaz contra Toxocara y anquilostomas; no actúa sobre Trichuris ni cestodos.'),
  item('firstLine', 'Fenbendazol:', 'Fenbendazol: 50 mg/kg VO cada 24 h por 3-5 días. Eficaz contra Toxocara, anquilostomas, Trichuris, Taenia y Giardia.'),
  item('secondLine', 'Ivermectina:', null),
  item('secondLine', 'Moxidectina:', 'Milbemicina oxima + praziquantel: Desde las 2 semanas de edad y 0,5 kg, según etiqueta; amplio espectro mensual.'),
  refs('ESCCAP_WORMS'),
);

patch('Parásitos intestinales en gatitos',
  line('Transfusión de sangre total incompatible 10-15 mL/kg IV lento', 'Transfusión de sangre entera compatible (tipificada) 10-15 mL/kg IV o intraósea, lenta'),
  line('Fluidoterapia IV con Lactato Ringer 60-80 mL/kg/día', 'Fluidos tibios según requerimiento pediátrico y déficit'),
  line('Suplementación con hierro: hierro dextrano 10-50 mg IM (solo si no hay transfusión)', 'Hierro dextrano 10 mg/kg IM en dosis única si no se transfundió'),
  item('firstLine', 'Desparasitación de amplio espectro:', 'Desparasitación: Milbemicina oxima + praziquantel según etiqueta (desde 6 semanas y 0,5 kg) o pirantel desde las 3 semanas; fenbendazol 50 mg/kg cada 24 h por 5 días para Giardia; toltrazuril o ponazuril (50 mg/kg VO en dosis única) para Cystoisospora.'),
  item('firstLine', 'Tratamiento de la anemia:', 'Tratamiento de la anemia: Transfusión de sangre entera compatible 10-15 mL/kg si el hematocrito es menor de 15 % o hay inestabilidad; hierro dextrano 10 mg/kg IM si no se transfundió.'),
  item('secondLine', 'Ronidazol para Tritrichomonas:', 'Ronidazol (Tritrichomonas foetus): 30 mg/kg VO cada 24 h durante 14 días; dosis mayores o cada 12 h causan neurotoxicidad. Manipular con guantes.'),
  refs('ESCCAP_WORMS'),
);

patch('Peritonitis bacteriana felina',
  line('Fluidoterapia IV de choque: cristaloides 80-100 mL/kg en primera hora', 'Fluidoterapia IV: bolos de 5-10 mL/kg en 15 min, reevaluando tras cada bolo'),
  line('Soporte vasopressor: dopamina 5-15 µg/kg/min CRI', 'Vasopresor si persiste la hipotensión tras reponer volumen: noradrenalina 0,05-1 µg/kg/min'),
  item('firstLine', 'Resucitación preoperatoria agresiva:', `Resucitación preoperatoria: ${BOLUS_CAT}; transfusión si el hematocrito es menor de 20 %.`),
  item('firstLine', 'Manejo del dolor:', 'Manejo del dolor: Metadona 0,2-0,3 mg/kg IV cada 4-6 h o fentanilo en infusión 2-5 µg/kg/h; ketamina en infusión 2-10 µg/kg/min como complemento. Evitar la lidocaína en gatos.'),
  refs('AAHA_FLUIDS'),
);

patch('Peritonitis infecciosa felina (FIP)',
  item('secondLine', 'Antivirales (GS-441524, remdesivir, molnupiravir):', 'Antivirales (si se obtienen de forma legal y con calidad garantizada): En Chile no tienen registro en el SAG para uso veterinario. Donde están disponibles, cambiaron el pronóstico a más de 85-90 % de supervivencia (iCatCare, julio 2025). GS-441524 oral: 15 mg/kg/día (formas efusiva o seca sin signos oculares ni neurológicos), 20 mg/kg/día (forma ocular) y 10 mg/kg cada 12 h (forma neurológica), en ayunas, durante 84 días (42 días en gatos con efusión que responden rápido y normalizan sus parámetros). Remdesivir IV 15-20 mg/kg cada 24 h solo en gatos que no pueden tragar, pasando luego a la vía oral. Pesar al gato cada semana y subir la dosis si aumenta de peso. No se recomiendan productos del mercado negro de contenido desconocido.'),
  refs('FIP2025'),
);

patch('Piometra',
  line('Fluidoterapia IV agresiva: Lactato Ringer 80-100 mL/kg en bolo', 'Fluidoterapia IV: bolos de 15-20 mL/kg (perra) o 5-10 mL/kg (gata) en 15 min, reevaluando'),
  item('firstLine', 'Fluidoterapia IV prequirúrgica:', `Fluidoterapia IV prequirúrgica: ${BOLUS_DOG}; ${PLAN}.`),
  item('secondLine', 'Manejo medico con prostaglandinas:', 'Tratamiento médico (piometra abierta, perra estable, joven y de valor reproductivo): Aglepristona 10 mg/kg SC los días 1, 2 y 8 (y 15 si persiste), combinada con cloprostenol 1 µg/kg SC cada 24-48 h; si está disponible. Alta tasa de recidiva en el celo siguiente.'),
  refs('AAHA_FLUIDS'),
);

patch('Pododermatitis felina',
  item('firstLine', 'Antibioticoterapia sistémica:', 'Doxiciclina (pododermatitis plasmocítica): 10 mg/kg VO cada 24 h durante 8-10 semanas; responde alrededor de la mitad de los gatos. Para infecciones secundarias: cefalexina 22-30 mg/kg cada 12 h o clindamicina 11 mg/kg cada 24 h.'),
  item('firstLine', 'Inmunosupresión (casos autoinmunes):', 'Inmunosupresión (si no responde a doxiciclina o en pénfigo): Prednisolona 2-4 mg/kg/día VO con reducción gradual; clorambucilo o ciclosporina como ahorradores. La azatioprina está contraindicada en gatos.'),
);

patch('Prostatitis',
  line('Fluidoterapia IV agresiva: Lactato Ringer 80-100 mL/kg en bolo', 'Fluidoterapia IV: bolos de 15-20 mL/kg en 15 min, reevaluando'),
  item('firstLine', 'Antibioticoterapia prolongada:', 'Antibióticos según cultivo (orina o líquido prostático): Enrofloxacino 10 mg/kg VO cada 24 h o trimetoprim-sulfametoxazol 15 mg/kg VO cada 12 h, durante 4 semanas (ISCAID 2019); penetran bien la próstata.'),
  item('firstLine', 'Castración quirúrgica:', 'Castración: En machos no reproductores; reduce el tamaño prostático en semanas y las recurrencias.'),
  item('secondLine', 'Antiandrogenos:', 'Antiandrógenos (reproductores): Osaterona 0,25-0,5 mg/kg VO cada 24 h durante 7 días o implante de deslorelina; reducen la hiperplasia sin castrar.'),
  refs('Weese JS, Blondeau J, Boothe D, et al. International Society for Companion Animal Infectious Diseases (ISCAID) guidelines for the diagnosis and management of bacterial urinary tract infections in dogs and cats. Vet J. 2019;247:8-25.'),
);

patch('Reabsorción dental felina (FORL)',
  item('firstLine', 'Coronoectomía (tipo 2):', 'Amputación de la corona (tipo 2, con reemplazo radicular confirmado en radiografía y sin periodontitis ni endodontitis): Retirar la corona por debajo del margen gingival y suturar la encía; no se sella con composite.'),
  item('firstLine', 'Antibioticoterapia perioperatoria:', 'Antibióticos: No de rutina tras las extracciones; solo ante infección o compromiso sistémico.'),
  item('secondLine', 'Radioterapia para FORL refractaria:', null),
  refs('DENTAL'),
);

patch('Rinotraqueítis felina',
  line('Famciclovir 90 mg/kg PO q12h', 'Famciclovir 90 mg/kg VO cada 8 h'),
  item('firstLine', 'Famciclovir:', 'Famciclovir: 90 mg/kg VO cada 8 h durante 14-21 días (Thomasy et al., 2016). Antiviral de elección para herpesvirus felino.'),
  item('firstLine', 'Vitaminas y suplementación:', null),
  refs('FHV', 'RESP'),
);

patch('Ruptura de ligamento cruzado',
  item('firstLine', 'Control del dolor postquirúrgico:', 'Control del dolor posquirúrgico: Meloxicam 0,1 mg/kg VO cada 24 h durante 2-4 semanas + gabapentina 10 mg/kg VO cada 8-12 h por 1-2 semanas (el tramadol tiene poca eficacia en perros). Frío local 15-20 min cada 4-6 h las primeras 48 h.'),
  item('secondLine', 'Fasciotroplastia biceps-semitendinosa (TT):', 'Sutura fabelo-tibial lateral (extracapsular): Técnica para perros de menos de 15 kg; menos resultados a largo plazo en perros grandes y activos.'),
);

patch('Tos de las perreras',
  item('firstLine', 'Antibioticoterapia:', 'Antibióticos solo si hay fiebre, decaimiento, inapetencia o neumonía (ISCAID 2017): Doxiciclina 5 mg/kg VO cada 12 h o 10 mg/kg cada 24 h durante 7-10 días. La mayoría de los casos sin complicaciones se resuelve sin antibiótico en 1-2 semanas.'),
  item('firstLine', 'Antitusigenos:', 'Antitusivos: Butorfanol 0,5-1 mg/kg VO cada 6-12 h o codeína para tos seca intensa que impide el descanso; nunca si hay neumonía.'),
  refs('RESP'),
);

patch('Toxoplasmosis felina',
  line('Fluidoterapia IV con Lactato Ringer 60-80 mL/kg/día', 'Fluidoterapia IV según déficit (bolos de 5-10 mL/kg solo si hay hipoperfusión)'),
  sub('treatment.emergency', 'phenobarbital 5 mg/kg IV', 'fenobarbital 3-4 mg/kg IV'),
  item('firstLine', 'Clindamicina:', 'Clindamicina: 10-12,5 mg/kg VO cada 12 h durante 4 semanas. Fármaco de elección para toxoplasmosis clínica felina.'),
  item('firstLine', 'Doxiciclina:', 'Doxiciclina: 5-10 mg/kg VO cada 12 h durante 4 semanas como alternativa.'),
);

patch('Trauma torácico felino',
  line('Drenaje pleural de emergencia: catéter 14G en 7° espacio intercostal', 'Toracocentesis de emergencia con aguja mariposa 21-23G o catéter 20-22G en el 7.º-9.º espacio intercostal'),
  line('Fluidoterapia IV de choque: Lactato Ringer 80-100 mL/kg en primera hora', 'Fluidoterapia IV: bolos de 5-10 mL/kg en 15 min, reevaluando (las contusiones pulmonares empeoran con la sobrecarga)'),
  item('firstLine', 'Drenaje pleural urgente:', 'Drenaje pleural urgente: Aguja mariposa 21-23G o catéter 20-22G con llave de tres vías; tubo de tórax si el neumotórax se reproduce.'),
  item('firstLine', 'Fluidoterapia IV y resucitación:', `Fluidoterapia IV: ${BOLUS_CAT}; transfusión si el hematocrito es menor de 20 %.`),
  item('firstLine', 'Analgesia multimodal:', 'Analgesia: Metadona 0,2-0,3 mg/kg IV o buprenorfina 0,02-0,03 mg/kg IV cada 6-8 h; bloqueo de nervios intercostales en fracturas costales. Evitar AINE hasta estabilizar y la lidocaína en gatos.'),
  refs('AAHA_FLUIDS'),
);

patch('Trauma torácico',
  set('treatment.emergency', 'PRESENTACIÓN: Dificultad respiratoria o shock tras un trauma.\nPROTOCOLO:\n  - Oxígeno de inmediato y manipulación mínima\n  - Ecografía TFAST: toracocentesis si hay neumotórax o hemotórax con disnea\n  - Bolos de cristaloide 15-20 mL/kg en 15 min, reevaluando (cautela: las contusiones empeoran con la sobrecarga)\n  - Analgesia con opioides (metadona 0,2-0,3 mg/kg IV)\n  - ECG seriado 24-48 h (arritmias por contusión miocárdica)'),
  set('treatment.firstLine', [
    'Drenaje torácico: Toracocentesis para neumotórax o hemotórax con compromiso respiratorio; tubo de tórax si hay que drenar repetidamente.',
    'Oxígeno: Suplementario si la SpO2 es menor de 95 %; las contusiones pulmonares empeoran en las primeras 24 h.',
    'Analgesia: Opioides y bloqueos intercostales en fracturas costales.',
  ]),
  set('treatment.secondLine', [
    'Toracotomía: Hemorragia que no se controla, neumotórax que no se resuelve con drenaje o lesiones de pared complejas.',
    'Ventilación mecánica: Si la hipoxemia o la hipoventilación no se corrigen con oxígeno.',
  ]),
  refs('AAHA_FLUIDS'),
);

patch('Ureterolitiasis felina',
  line('Fluidoterapia IV de choque', 'Fluidoterapia IV moderada según déficit, vigilando la sobrecarga (oliguria)'),
  item('firstLine', 'Fluidoterapia IV preoperatoria:', 'Manejo médico inicial (24-72 h): Fluidos moderados, analgesia y tratamiento de la hiperpotasemia; solo una minoría de cálculos avanza a la vejiga. No prolongar si no hay mejoría.'),
  item('secondLine', 'Litotripsia:', 'Bypass ureteral subcutáneo (SUB): Hoy es el tratamiento más usado para la obstrucción ureteral felina por cálculos o estenosis, con menor mortalidad que la cirugía ureteral tradicional (Berent et al., 2018); en centros especializados.'),
  refs('SUB', 'UROLITHS'),
);

patch('Virus de inmunodeficiencia felina (FIV)',
  item('firstLine', 'Interferón omega felino:', 'Interferón omega felino: 1 MU/kg SC cada 24 h durante 5 días en 3 ciclos (días 0, 14 y 60), o 10.000 U/gato VO diarias; puede mejorar signos clínicos.'),
  item('firstLine', 'Monitoreo regular:', 'Monitoreo regular: Hemograma, bioquímica y urianálisis cada 6-12 meses; examen físico y peso cada 6 meses. Vacunar según riesgo y mantener el control de parásitos.'),
  item('secondLine', 'Inmunomoduladores (Pentoxifilina):', null),
  refs('RETRO'),
);

patch('Épulis',
  item('firstLine', 'Extirpación quirúrgica completa:', 'Cirugía según el tipo (confirmar con biopsia): Fibroma odontogénico periférico: escisión local con el ligamento periodontal y extracción del diente involucrado. Épulis acantomatoso (ameloblastoma acantomatoso canino): mandibulectomía o maxilectomía parcial con márgenes de 1 cm incluyendo hueso; curativa con márgenes completos.'),
  item('firstLine', 'Antibioticoterapia profiláctica:', 'Antibióticos: No de rutina tras la cirugía oral.'),
  item('secondLine', 'Crioriterapia:', 'Radioterapia: Alternativa eficaz para el épulis acantomatoso no resecable.'),
);

patch('Úlcera corneal',
  set('treatment.emergency', 'PRESENTACIÓN: Úlcera con licuefacción (melting) o perforada: secreción purulenta, dolor intenso, prolapso de iris.\nPROTOCOLO:\n  - Antibiótico tópico cada 1-2 h (fluoroquinolona o cefazolina fortificada)\n  - Anticolagenasas cada 2 h: suero autólogo, EDTA o N-acetilcisteína tópicos\n  - Atropina 1 % tópica cada 12-24 h\n  - Collar isabelino inmediato\n  - Derivación urgente a oftalmología veterinaria (injerto conjuntival)'),
  item('firstLine', 'Antibiótico tópico de amplio espectro:', 'Antibiótico tópico: Tobramicina 0,3 % u ofloxacino 0,3 % cada 4-6 h en úlceras superficiales; en úlceras con licuefacción, cada 1-2 h, idealmente según citología y cultivo.'),
  item('firstLine', 'Protección ocular (collar isabelino):', 'Collar isabelino: Durante todo el tratamiento, para evitar el rascado.'),
  item('secondLine', 'Flap conjuntival:', 'Injerto conjuntival: En úlceras profundas, descemetoceles o perforaciones.'),
);

// The entry had no treatment at all
patch('Nefrolitiasis felina',
  set('treatment.emergency', 'PRESENTACIÓN: Un nefrolito que migra al uréter y lo obstruye (dolor, vómitos, azotemia aguda, hiperpotasemia).\nPROTOCOLO:\n  - Ver la ficha de ureterolitiasis felina\n  - Ecografía para confirmar hidronefrosis y dilatación ureteral\n  - Potasio y ECG; tratar la hiperpotasemia\n  - Analgesia con opioides y fluidos moderados\n  - Derivar para descompresión (SUB o nefrostomía) si no hay mejoría en 24-72 h'),
  set('treatment.firstLine', [
    'Nefrolitos que no obstruyen: Vigilancia con ecografía o radiografía cada 3-6 meses, junto con el manejo de la enfermedad renal crónica según IRIS. La mayoría son de oxalato de calcio, que no se disuelve.',
    'Nefrolitos de estruvita (radiopacos, orina alcalina, infección por bacterias productoras de ureasa): Dieta de disolución y antibiótico según urocultivo durante toda la disolución.',
    'Prevención: Comida húmeda y más agua para mantener la orina diluida (densidad urinaria menor de 1.030 en gatos); dieta según el tipo de cálculo; urocultivo si hay signos.',
  ]),
  set('treatment.secondLine', [
    'Cirugía (nefrotomía o pielolitotomía): Solo si el cálculo obstruye la pelvis renal, causa infección recurrente o dolor; la nefrotomía reduce la función del riñón operado.',
    'Litotricia: Poco eficaz para los cálculos de oxalato de calcio felinos; disponible en pocos centros.',
  ]),
  set('treatment.duration', 'Vigilancia de por vida con imagen cada 3-6 meses y controles renales según el estadio IRIS.'),
  set('treatment.notes', 'Chile: dietas urinarias y renales disponibles en clínicas veterinarias; la colocación de SUB se realiza en centros de referencia.'),
  refs('UROLITHS', 'IRIS2026'),
);

// ─── Updates from the clinic's library to newer entries ───
patch('Calicivirosis sistémica virulenta felina',
  add('key_signs', [
    'Engrosamiento de los pabellones auriculares: Signo precoz descrito en los brotes.',
    'Dolor articular y cojera.',
  ]),
  add('diagnosis.differentialDiagnosis', [
    'Intoxicación por desinfectantes de amonio cuaternario o fenoles: Úlceras orales y cutáneas tras exposición.',
    'Viruela felina (cowpox), hemoplasmosis, pénfigo y pododermatitis plasmocítica.',
  ]),
  sub('description', 'La mortalidad en los brotes descritos es de alrededor del 33-67%.', 'La incubación es de 1-5 días y la mortalidad en los brotes descritos llega a alrededor del 67 %.'),
  refs('PALMERO'),
);

const SPLIT = (path) => path.split('.');
function getList(row, list) {
  const parts = SPLIT(list);
  if (parts.length === 2) return row[parts[0]]?.[parts[1]];
  if (list === 'firstLine' || list === 'secondLine') return row.treatment?.[list];
  return row[list];
}
function setList(row, list, value) {
  const parts = SPLIT(list);
  if (parts.length === 2) { row[parts[0]] = { ...(row[parts[0]] || {}), [parts[1]]: value }; return; }
  if (list === 'firstLine' || list === 'secondLine') { row.treatment = { ...(row.treatment || {}), [list]: value }; return; }
  row[list] = value;
}
function getPath(row, path) { const p = SPLIT(path); return p.length === 2 ? row[p[0]]?.[p[1]] : row[p[0]]; }
function setPath(row, path, value) { const p = SPLIT(path); if (p.length === 2) row[p[0]] = { ...(row[p[0]] || {}), [p[1]]: value }; else row[p[0]] = value; }
const norm = (s) => s.replace(/\s+/g, ' ').trim();

function applyOps(row, ops, log) {
  let changed = false;
  for (const o of ops) {
    if (o.op === 'item') {
      const list = getList(row, o.list) || [];
      const i = list.findIndex((x) => norm(x).startsWith(norm(o.prefix)));
      const done = o.text === null ? i < 0 : list.includes(o.text);
      if (i < 0 && !done) throw new Error(`no encontré el ítem "${o.prefix}" en ${o.list}`);
      if (i < 0 || (o.text !== null && list[i] === o.text)) continue;
      const next = [...list];
      if (o.text === null) next.splice(i, 1); else next[i] = o.text;
      setList(row, o.list, next);
      changed = true; log.push(`${o.text === null ? '−' : '~'} ${o.list}: ${o.prefix}`);
    } else if (o.op === 'line') {
      const text = row.treatment?.emergency || '';
      const lines = text.split('\n');
      const i = lines.findIndex((l) => norm(l.replace(/^\s*[-•]\s*/, '')).startsWith(norm(o.prefix)));
      if (i < 0) {
        if (o.text === null || text.includes(o.text)) continue;
        throw new Error(`no encontré la línea de urgencia "${o.prefix}"`);
      }
      // The new line may start with the same words as the old one: already applied
      if (o.text !== null && norm(lines[i].replace(/^\s*[-•]\s*/, '')) === norm(o.text)) continue;
      if (o.text === null) lines.splice(i, 1); else lines[i] = `  - ${o.text}`;
      row.treatment = { ...(row.treatment || {}), emergency: lines.join('\n') };
      changed = true; log.push(`${o.text === null ? '−' : '~'} urgencia: ${o.prefix}`);
    } else if (o.op === 'set') {
      if (JSON.stringify(getPath(row, o.path)) === JSON.stringify(o.value)) continue;
      setPath(row, o.path, o.value);
      changed = true; log.push(`= ${o.path}`);
    } else if (o.op === 'add') {
      const list = getList(row, o.list) || [];
      const missing = o.items.filter((x) => !list.includes(x));
      if (!missing.length) continue;
      setList(row, o.list, [...list, ...missing]);
      changed = true; log.push(`+ ${o.list}: ${missing.length}`);
    } else if (o.op === 'sub') {
      const v = getPath(row, o.path) || '';
      if (v.includes(o.repl) && !v.includes(o.find)) continue;
      if (!v.includes(o.find)) throw new Error(`no encontré el texto "${o.find.slice(0, 50)}" en ${o.path}`);
      setPath(row, o.path, v.replace(o.find, o.repl));
      changed = true; log.push(`~ ${o.path}`);
    } else if (o.op === 'refs') {
      const list = row.references_list || [];
      const missing = o.items.filter((x) => !list.includes(x));
      if (!missing.length) continue;
      row.references_list = [...list, ...missing];
      changed = true; log.push(`+ referencias: ${missing.length}`);
    }
  }
  return changed;
}

module.exports = { PATCHES, R };

if (require.main === module) {
  (async () => {
    const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await c.connect();
    await c.query('BEGIN');
    let failures = 0;
    let updated = 0;
    try {
      // Newer editions in every entry's references
      const all = await c.query('SELECT id, name, references_list FROM diseases');
      let refUpdates = 0;
      for (const row of all.rows) {
        const list = row.references_list || [];
        const next = [...new Set(list.map((ref) => REF_REPLACEMENTS.reduce((r, [re, to]) => r.replace(re, to), ref)))];
        if (JSON.stringify(next) !== JSON.stringify(list)) {
          await c.query('UPDATE diseases SET references_list = $1 WHERE id = $2', [JSON.stringify(next), row.id]);
          refUpdates++;
        }
      }
      console.log(`Referencias con edición nueva: ${refUpdates} fichas`);

      for (const { name, ops } of PATCHES) {
        const r = await c.query('SELECT id, name, description, key_signs, diagnosis, treatment, prevention, references_list FROM diseases WHERE name = $1 AND organization_id IS NULL', [name]);
        if (r.rowCount !== 1) { console.log(`✗ ${name}: ${r.rowCount} filas globales`); failures++; continue; }
        const row = r.rows[0];
        const log = [];
        try {
          if (!applyOps(row, ops, log)) { console.log(`= ${name}: ya aplicado`); continue; }
        } catch (e) {
          console.log(`✗ ${name}: ${e.message}`); failures++; continue;
        }
        await c.query(
          'UPDATE diseases SET description = $1, key_signs = $2, diagnosis = $3, treatment = $4, prevention = $5, references_list = $6 WHERE id = $7',
          [row.description, JSON.stringify(row.key_signs), JSON.stringify(row.diagnosis), JSON.stringify(row.treatment), JSON.stringify(row.prevention), JSON.stringify(row.references_list), row.id],
        );
        updated++;
        console.log(`✓ ${name} (${log.length} cambios)`);
      }
      if (failures) throw new Error(`${failures} fichas con operaciones que no coinciden`);
      console.log(`\n${updated} fichas actualizadas.`);
      if (APPLY) { await c.query('COMMIT'); console.log('APLICADO.'); }
      else { await c.query('ROLLBACK'); console.log('Prueba en seco: no se escribió nada. Usa --apply para aplicar.'); }
    } catch (e) {
      await c.query('ROLLBACK');
      console.error('ERROR (revertido):', e.message);
      process.exitCode = 1;
    } finally {
      await c.end();
    }
  })();
}
