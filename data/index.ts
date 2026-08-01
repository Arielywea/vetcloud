import { DiseaseMaster } from '../types/diseases-master';
import { DOG_DISEASES_1 } from './dog-diseases-1';
import { DOG_DISEASES_2 } from './dog-diseases-2';
import { DOG_DISEASES_3 } from './dog-diseases-3';
import { CAT_DISEASES_1 } from './cat-diseases-1';
import { CAT_DISEASES_2 } from './cat-diseases-2';
import { PUPPY_DISEASES } from './puppy-diseases';
import { KITTEN_DISEASES } from './kitten-diseases';

export { PUPPY_DISEASES, KITTEN_DISEASES };

export const ALL_DOG_DISEASES: DiseaseMaster[] = [
  ...DOG_DISEASES_1,
  ...DOG_DISEASES_2,
  ...DOG_DISEASES_3,
];

export const ALL_CAT_DISEASES: DiseaseMaster[] = [
  ...CAT_DISEASES_1,
  ...CAT_DISEASES_2,
];

export const ALL_DISEASES: DiseaseMaster[] = [
  ...ALL_DOG_DISEASES,
  ...ALL_CAT_DISEASES,
  ...PUPPY_DISEASES,
  ...KITTEN_DISEASES,
];

export function getDiseaseById(id: string): DiseaseMaster | undefined {
  return ALL_DISEASES.find((d) => d.id === id);
}

export function getDiseasesBySpecies(species: 'dog' | 'cat' | 'both'): DiseaseMaster[] {
  return ALL_DISEASES.filter(
    (d) => d.species === species || d.species === 'both'
  );
}

export function getDiseasesByCategory(category: string): DiseaseMaster[] {
  return ALL_DISEASES.filter((d) => d.category === category);
}

export function getZoonoticDiseases(): DiseaseMaster[] {
  return ALL_DISEASES.filter((d) => d.is_zoonotic);
}

export function getDiseasesByLifeStage(stage: string): DiseaseMaster[] {
  return ALL_DISEASES.filter(
    (d) => d.life_stage === stage || d.life_stage === 'all'
  );
}
