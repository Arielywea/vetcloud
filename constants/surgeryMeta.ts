import { SurgeryCategory } from '../services/directus';

// Order of the groups in the Cirugías list: the most frequent work of a small-animal clinic first
export const SURGERY_CATEGORIES: { key: SurgeryCategory; label: string }[] = [
  { key: 'reproductiva', label: 'Reproductiva' },
  { key: 'digestiva', label: 'Digestiva' },
  { key: 'hepatoesplenica', label: 'Hígado y bazo' },
  { key: 'urinaria', label: 'Urinaria' },
  { key: 'piel', label: 'Piel y tejidos blandos' },
  { key: 'perineal', label: 'Perineal' },
  { key: 'oftalmica', label: 'Oftálmica' },
  { key: 'toracica', label: 'Torácica' },
  { key: 'ortopedica', label: 'Ortopédica' },
];

export const surgeryCategoryLabel = (key: string | null | undefined) =>
  SURGERY_CATEGORIES.find((c) => c.key === key)?.label || 'Otras';

export const CONTAMINATION_LABELS: Record<string, string> = {
  limpia: 'Limpia',
  'limpia-contaminada': 'Limpia-contaminada',
  contaminada: 'Contaminada',
  sucia: 'Sucia',
};

export const SPECIES_SHORT: Record<string, string> = { perro: 'Perro', gato: 'Gato' };

export const RECENT_SURGERIES_KEY = 'vetcloud_recent_surgeries';

export function readRecentSurgeries(): number[] {
  try { return JSON.parse(globalThis.localStorage?.getItem(RECENT_SURGERIES_KEY) || '[]'); } catch { return []; }
}

export function pushRecentSurgery(id: number) {
  try {
    globalThis.localStorage?.setItem(RECENT_SURGERIES_KEY, JSON.stringify([id, ...readRecentSurgeries().filter((x) => x !== id)].slice(0, 6)));
  } catch { /* storage blocked */ }
}
