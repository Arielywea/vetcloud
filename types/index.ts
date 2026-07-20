export type Species = 'dog' | 'cat' | 'both';

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
  | 'urological';

export type Prognosis = 'excellent' | 'good' | 'guarded' | 'poor' | 'grave';

export type Severity = 'mild' | 'moderate' | 'severe' | 'critical';

export interface DiagnosisInfo {
  clinicalExam: string;
  labTests: string[];
  imaging: string[];
  differentialDiagnosis: string[];
}

export interface TreatmentInfo {
  firstLine: string[];
  secondLine: string[];
  emergency?: string;
  duration: string;
  notes: string;
}

export interface Disease {
  id: string;
  name: string;
  scientificName: string;
  species: Species;
  category: DiseaseCategory;
  severity: Severity;
  description: string;
  pathophysiology: string;
  keySigns: string[];
  diagnosis: DiagnosisInfo;
  treatment: TreatmentInfo;
  prevention: string[];
  prognosis: Prognosis;
  isZoonotic: boolean;
  references: string[];
}

export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  birthDate: string;
  weight: number;
  color: string;
  photo: string | null;
  medicalHistory: MedicalRecord[];
  vaccinations: Vaccination[];
  allergies: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  diseaseId: string | null;
  date: string;
  veterinarian: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  notes: string;
  followUp: string | null;
}

export interface Vaccination {
  id: string;
  name: string;
  dateGiven: string;
  nextDue: string | null;
  veterinarian: string;
  batchNumber: string;
}

export interface PersonalNote {
  id: string;
  diseaseId: string | null;
  petId: string | null;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  diseaseId: string;
  addedAt: string;
  category: 'frequently_used' | 'important' | 'study' | 'emergency';
}

export type TabRoute = 'diseases' | 'pets' | 'search' | 'notes';
