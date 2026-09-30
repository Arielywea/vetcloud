// Extracts the first per-kg dose from free-text vademecum entries such as
//   "2-4 mg/kg cada 24h (perros)"  ->  { min: 2, max: 4, unit: 'mg', everyHours: 24 }
//   "22 mcg/kg cada 24h"           ->  { min: 22, max: 22, unit: 'mcg', everyHours: 24 }
// Only the first "/kg" expression is used; body-surface doses (mg/m2) and CRIs
// (mcg/kg/min) are not parsed, so the UI must always show the source text too.

export type DoseUnit = 'mg' | 'mcg' | 'UI' | 'ml';

export interface ParsedDose {
  min: number;
  max: number;
  unit: DoseUnit;
  everyHours: number | null;
  source: string;
}

const num = (s: string) => Number(s.replace(',', '.'));

const DOSE_RE = /(\d+(?:[.,]\d+)?)(?:\s*(?:-|–|a)\s*(\d+(?:[.,]\d+)?))?\s*(mg|mcg|µg|ug|UI|U|ml)\s*\/\s*kg(?!\s*\/\s*(?:min|h))/i;
const FREQ_RE = /cada\s*(\d+)(?:\s*-\s*\d+)?\s*h/i;
const CONC_RE = /(\d+(?:[.,]\d+)?)\s*mg\s*\/\s*ml/i;

export function parseDose(text: string | null | undefined): ParsedDose | null {
  if (!text) return null;
  const m = text.match(DOSE_RE);
  if (!m) return null;
  const min = num(m[1]);
  const max = m[2] ? num(m[2]) : min;
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max < min) return null;
  const rawUnit = m[3].toLowerCase();
  const unit: DoseUnit = rawUnit === 'mg' ? 'mg' : rawUnit === 'ml' ? 'ml' : rawUnit.startsWith('u') && rawUnit !== 'ug' ? 'UI' : 'mcg';
  const f = text.match(FREQ_RE);
  return { min, max, unit, everyHours: f ? Number(f[1]) : null, source: text };
}

/** Concentration in mg/ml from a presentation like "Solución inyectable 20 mg/ml". */
export function parseConcentration(text: string | null | undefined): number | null {
  if (!text) return null;
  const m = text.match(CONC_RE);
  if (!m) return null;
  const c = num(m[1]);
  return Number.isFinite(c) && c > 0 ? c : null;
}
