import { parseNumberInRange } from './parseNumber';

// Plausible ranges for dogs and cats; values outside are almost certainly typos.
export const VITAL_RANGES = {
  weight: { min: 0.05, max: 150, label: 'Peso', unit: 'kg' },
  temperature: { min: 30, max: 45, label: 'Temperatura', unit: '°C' },
  heart_rate: { min: 20, max: 350, label: 'Frecuencia cardíaca', unit: 'lpm' },
  respiratory_rate: { min: 4, max: 150, label: 'Frecuencia respiratoria', unit: 'rpm' },
  spo2: { min: 50, max: 100, label: 'SpO₂', unit: '%' },
} as const;

export type VitalKey = keyof typeof VITAL_RANGES;

/**
 * Parses the numeric vitals typed by the user (decimal comma accepted).
 * Empty fields are omitted; the first invalid field returns an error message.
 */
export function parseVitals(input: Partial<Record<VitalKey, string>>): { values: Partial<Record<VitalKey, number>>; error: string | null } {
  const values: Partial<Record<VitalKey, number>> = {};
  for (const key of Object.keys(input) as VitalKey[]) {
    const raw = input[key];
    if (raw === undefined || String(raw).trim() === '') continue;
    const r = VITAL_RANGES[key];
    const n = parseNumberInRange(raw, r.min, r.max);
    if (n === null) continue;
    if (Number.isNaN(n)) {
      return { values, error: `${r.label}: ingresa un valor entre ${String(r.min).replace('.', ',')} y ${r.max} ${r.unit}` };
    }
    values[key] = key === 'heart_rate' || key === 'respiratory_rate' || key === 'spo2' ? Math.round(n) : n;
  }
  return { values, error: null };
}
