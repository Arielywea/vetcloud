import { Disease, DiseaseCategory } from '../types';
import { ALL_DISEASES, PUPPY_DISEASES, KITTEN_DISEASES } from '../data';
import { DISEASE_CATEGORIES as META_CATEGORIES } from './diseaseMeta';

// Labels live in constants/diseaseMeta.ts (shared with the app screens, which must not import ../data)
const DISEASE_CATEGORIES = META_CATEGORIES as Record<string, { label: string; icon: string; color: string }>;

function convertToDisease(raw: any): Disease {
  const species = Array.isArray(raw.species)
    ? (raw.species.length > 1 ? 'both' : raw.species[0])
    : raw.species;

  const keySigns = (raw.key_signs || []).map((s: any) => `${s.sign}: ${s.description}`);

  const diagnosis = {
    clinicalExam: raw.diagnosis?.clinical_examination || '',
    labTests: (raw.diagnosis?.lab_tests || []).map((t: any) => `${t.test}: ${t.description}`),
    imaging: (raw.diagnosis?.imaging || []).map((i: any) => `${i.study}: ${i.findings}`),
    differentialDiagnosis: (raw.diagnosis?.differential_diagnosis || []).map((d: any) => `${d.disease}: ${d.differentiating}`),
  };

  const treatment = {
    firstLine: (raw.treatment?.first_line || []).map((t: any) => `${t.intervention}: ${t.details}`),
    secondLine: (raw.treatment?.second_line || []).map((t: any) => `${t.intervention}: ${t.details}`),
    emergency: raw.treatment?.emergency
      ? `PRESENTACIÓN: ${raw.treatment.emergency.presentation}\nPROTOCOLO:\n${(raw.treatment.emergency.protocol || []).map((p: string) => `  - ${p}`).join('\n')}`
      : '',
    duration: raw.treatment?.duration || '',
    notes: raw.treatment?.notes || '',
  };

  const prevention = (raw.prevention || []).map((p: any) => `${p.measure}: ${p.details}`);

  const prognosis = (raw.prognosis?.classification || 'guarded') as any;

  const references = (raw.references || []).map((r: any) => r.citation || r);

  return {
    id: raw.id,
    name: raw.name,
    scientificName: raw.scientific_name || raw.name,
    species,
    category: raw.category as DiseaseCategory,
    severity: raw.severity as any,
    description: raw.description,
    pathophysiology: raw.pathophysiology || '',
    keySigns,
    diagnosis,
    treatment,
    prevention,
    prognosis,
    isZoonotic: raw.is_zoonotic || false,
    references,
    photoUrl: raw.photo_url || null,
  };
}

const DOG_DISEASES: Disease[] = ALL_DISEASES
  .filter((d: any) => d.species === 'dog' || (Array.isArray(d.species) && d.species.includes('dog')))
  .map(convertToDisease);

const CAT_DISEASES: Disease[] = ALL_DISEASES
  .filter((d: any) => d.species === 'cat' || (Array.isArray(d.species) && d.species.includes('cat')))
  .map(convertToDisease);

const ALL_DISEASES_FOR_APP: Disease[] = ALL_DISEASES.map(convertToDisease);

const PUPPY_DISEASES_FOR_APP: Disease[] = PUPPY_DISEASES.map(convertToDisease);
const KITTEN_DISEASES_FOR_APP: Disease[] = KITTEN_DISEASES.map(convertToDisease);

const SPECIES_INFO = {
  dog: { label: 'Perro', icon: 'dog', emoji: '🐕', color: '#2196F3' },
  cat: { label: 'Gato', icon: 'cat', emoji: '🐱', color: '#9C27B0' },
  both: { label: 'Ambos', icon: 'paw', emoji: '🐾', color: '#607D8B' },
};

export { DOG_DISEASES, CAT_DISEASES, ALL_DISEASES_FOR_APP, PUPPY_DISEASES_FOR_APP, KITTEN_DISEASES_FOR_APP, DISEASE_CATEGORIES, SPECIES_INFO };
