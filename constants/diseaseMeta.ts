// Disease catalog metadata used by the screens. Kept apart from constants/diseases.ts,
// which imports the raw seed data in data/ (~1 MB) and is only needed by scripts.

export type DiseaseCategoryKey =
  | 'infectious' | 'parasitic' | 'degenerative' | 'oncological' | 'nutritional' | 'autoimmune'
  | 'traumatic' | 'congenital' | 'respiratory' | 'gastrointestinal' | 'dermatological' | 'ocular'
  | 'dental' | 'endocrine' | 'cardiovascular' | 'neurological' | 'musculoskeletal' | 'renal'
  | 'reproductive' | 'toxic' | 'urological' | 'hematologic' | 'metabolic' | 'environmental';

/** `color` is a categorical marker (a dot next to neutral text), never a text color */
export const DISEASE_CATEGORIES: Record<DiseaseCategoryKey, { label: string; icon: string; color: string }> = {
  infectious: { label: 'Infecciosas', icon: 'virus', color: '#C0392B' },
  parasitic: { label: 'Parasitarias', icon: 'bug-outline', color: '#8E44AD' },
  degenerative: { label: 'Degenerativas', icon: 'trending-down', color: '#B9770E' },
  oncological: { label: 'Oncológicas', icon: 'alert-circle', color: '#922B21' },
  nutritional: { label: 'Nutricionales', icon: 'nutrition', color: '#3E8E5A' },
  autoimmune: { label: 'Autoinmunes', icon: 'shield', color: '#2F5EA8' },
  traumatic: { label: 'Traumáticas', icon: 'bandage', color: '#7B5E4A' },
  congenital: { label: 'Congénitas', icon: 'dna', color: '#1F7A80' },
  respiratory: { label: 'Respiratorias', icon: 'lungs', color: '#2A8C82' },
  gastrointestinal: { label: 'Gastrointestinales', icon: 'stomach', color: '#6B8E23' },
  dermatological: { label: 'Dermatológicas', icon: 'hand-heart', color: '#B03A6F' },
  ocular: { label: 'Oculares', icon: 'eye', color: '#4A55A2' },
  dental: { label: 'Dentales', icon: 'tooth', color: '#5F7480' },
  endocrine: { label: 'Endocrinas', icon: 'flask', color: '#8E4FA8' },
  cardiovascular: { label: 'Cardiovasculares', icon: 'heart-pulse', color: '#B42318' },
  neurological: { label: 'Neurológicas', icon: 'brain', color: '#6C4FA8' },
  musculoskeletal: { label: 'Musculoesqueléticas', icon: 'bone', color: '#8A6A55' },
  renal: { label: 'Renales', icon: 'kidney', color: '#1A7F8E' },
  reproductive: { label: 'Reproductivas', icon: 'baby-carriage', color: '#A3456E' },
  toxic: { label: 'Tóxicas', icon: 'skull', color: '#7F1D1D' },
  urological: { label: 'Urológicas', icon: 'kidney', color: '#226E7A' },
  hematologic: { label: 'Hematológicas', icon: 'droplet', color: '#9B2C2C' },
  metabolic: { label: 'Metabólicas', icon: 'flask', color: '#A0640F' },
  environmental: { label: 'Ambientales', icon: 'thermometer', color: '#B25E09' },
};

export function categoryLabel(key?: string | null): string {
  if (!key) return 'Sin categoría';
  return DISEASE_CATEGORIES[key as DiseaseCategoryKey]?.label || key;
}

export const SPECIES_LABELS: Record<string, string> = { dog: 'Perro', cat: 'Gato', both: 'Perro y gato' };

export const PROGNOSIS_LABELS: Record<string, string> = {
  excellent: 'Excelente',
  good: 'Bueno',
  guarded: 'Reservado',
  poor: 'Malo',
  grave: 'Grave',
  chronic: 'Crónico (manejable)',
};

export const LIFE_STAGE_LABELS: Record<string, string> = {
  puppy: 'Cachorro', kitten: 'Gatito', adult: 'Adulto', senior: 'Senior', all: 'Todas las edades',
};

/** Lowercase, accent-free text for search (so "vomitos" finds "Vómitos") */
export function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** "Vómitos proyectivos: Vómitos biliosos…" → "Vómitos proyectivos" (cards show only the sign) */
export function signTitle(sign: string): string {
  const i = sign.indexOf(':');
  return (i > 0 && i < 80 ? sign.slice(0, i) : sign).trim();
}
