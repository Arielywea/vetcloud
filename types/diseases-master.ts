export type DiseaseCategory =
  | 'infectious'
  | 'parasitic'
  | 'degenerative'
  | 'oncological'
  | 'nutritional'
  | 'autoimmune'
  | 'traumatic'
  | 'congenital'
  | 'respiratory'
  | 'gastrointestinal'
  | 'dermatological'
  | 'ocular'
  | 'dental'
  | 'endocrine'
  | 'cardiovascular'
  | 'neurological'
  | 'musculoskeletal'
  | 'renal'
  | 'reproductive'
  | 'toxic'
  | 'urological'
  | 'hematologic';

export type DiseaseSpecies = 'dog' | 'cat' | 'both';
export type DiseaseSeverity = 'mild' | 'moderate' | 'severe' | 'critical';
export type DiseasePrognosis = 'excellent' | 'good' | 'guarded' | 'poor' | 'grave';
export type LifeStage = 'puppy' | 'kitten' | 'adult' | 'senior' | 'all';

export interface KeySign {
  sign: string;
  description: string;
  severity: 'mild' | 'moderate' | 'high';
  image?: string;
  clinical_significance?: string;
}

export interface DiagnosticTest {
  test: string;
  description: string;
  sensitivity?: string;
  specificity?: string;
  availability_chile?: string;
  interpretation?: string;
  key_findings?: string;
}

export interface ImagingStudy {
  study: string;
  findings: string;
}

export interface DifferentialDiagnosis {
  disease: string;
  differentiating: string;
}

export interface Diagnosis {
  clinical_examination: string;
  lab_tests: DiagnosticTest[];
  imaging: ImagingStudy[];
  differential_diagnosis: DifferentialDiagnosis[];
}

export interface TreatmentIntervention {
  intervention: string;
  details: string;
  justification: string;
  evidence?: string;
}

export interface EmergencyProtocol {
  presentation: string;
  protocol: string[];
}

export interface Treatment {
  first_line: TreatmentIntervention[];
  second_line: TreatmentIntervention[];
  emergency: EmergencyProtocol;
  duration: string;
  notes: string;
}

export interface PreventionMeasure {
  measure: string;
  details: string;
  justification: string;
  evidence?: string;
}

export interface ChileanCosts {
  diagnosis: Record<string, string>;
  treatment: Record<string, string>;
  emergency: Record<string, string>;
  prevention?: Record<string, string>;
  source: string;
}

export interface Reference {
  type: 'textbook' | 'journal_article' | 'institutional' | 'web_resource';
  citation: string;
  relevance: string;
}

export interface ChileanEpidemiology {
  prevalence: string;
  peak_season: string;
  high_risk_groups: string[];
  endemic_status: string;
  economic_impact?: string;
}

export interface PrognosisJustification {
  classification: DiseasePrognosis;
  justification: string;
  evidence_source: string;
}

export interface DiseaseMaster {
  id: string;
  name: string;
  scientific_name: string;
  species: DiseaseSpecies;
  category: DiseaseCategory;
  severity: DiseaseSeverity;
  is_zoonotic: boolean;
  prognosis: PrognosisJustification;
  prevalence_rank_dogs: number | null;
  prevalence_rank_cats: number | null;
  life_stage: LifeStage;
  chilean_epidemiology: ChileanEpidemiology;
  description: string;
  pathophysiology: string;
  key_signs: KeySign[];
  diagnosis: Diagnosis;
  treatment: Treatment;
  prevention: PreventionMeasure[];
  chilean_costs: ChileanCosts;
  references: Reference[];
  photo_url?: string;
}
