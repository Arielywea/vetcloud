import { Disease, DiseaseCategory } from '../types';
import { ALL_DISEASES, PUPPY_DISEASES, KITTEN_DISEASES } from '../data';

const DISEASE_CATEGORIES: Record<DiseaseCategory, { label: string; icon: string; color: string }> = {
  infectious: { label: 'Infecciosas', icon: 'virus', color: '#E53935' },
  parasitic: { label: 'Parasitarias', icon: 'bug-outline', color: '#8E24AA' },
  degenerative: { label: 'Degenerativas', icon: 'trending-down', color: '#F57C00' },
  oncological: { label: 'Oncologicas', icon: 'alert-circle', color: '#C62828' },
  nutritional: { label: 'Nutricionales', icon: 'nutrition', color: '#43A047' },
  autoimmune: { label: 'Autoinmunes', icon: 'shield', color: '#1565C0' },
  traumatic: { label: 'Traumaticas', icon: 'bandage', color: '#6D4C41' },
  congenital: { label: 'Congenitas', icon: 'dna', color: '#00838F' },
  respiratory: { label: 'Respiratorias', icon: 'lungs', color: '#26A69A' },
  gastrointestinal: { label: 'Gastrointestinales', icon: 'stomach', color: '#7CB342' },
  dermatological: { label: 'Dermatologicas', icon: 'hand-heart', color: '#EC407A' },
  ocular: { label: 'Oculares', icon: 'eye', color: '#5C6BC0' },
  dental: { label: 'Dentales', icon: 'tooth', color: '#78909C' },
  endocrine: { label: 'Endocrinas', icon: 'flask', color: '#AB47BC' },
  cardiovascular: { label: 'Cardiovasculares', icon: 'heart-pulse', color: '#E53935' },
  neurological: { label: 'Neurologicas', icon: 'brain', color: '#7E57C2' },
  musculoskeletal: { label: 'Musculoesqueleticas', icon: 'bone', color: '#8D6E63' },
  renal: { label: 'Renales', icon: 'kidney', color: '#0097A7' },
  reproductive: { label: 'Reproductivas', icon: 'baby-carriage', color: '#EC407A' },
  toxic: { label: 'Toxicas', icon: 'skull', color: '#D32F2F' },
  urological: { label: 'Urologicas', icon: 'kidney', color: '#00838F' },
  hematologic: { label: 'Hematologicas', icon: 'droplet', color: '#C62828' },
};

function convertToDisease(raw: any): Disease {
  const species = Array.isArray(raw.species)
    ? (raw.species.length > 1 ? 'both' : raw.species[0])
    : raw.species;

  const keySigns = (raw.key_signs || []).map((s: any) => `🔴 ${s.sign}: ${s.description}`);

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
