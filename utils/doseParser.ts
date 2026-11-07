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

// ── Options for the calculator: every dose and every presentation the vademecum text names ──

export interface DoseOption {
  key: string;
  label: string;
  min: number;
  max: number;
  unit: DoseUnit;
}

const ROUTE_RE = /^\s*\(?\s*(EV|IV|IM|SC|VO|IO|intubaci[oó]n|refuerzo|inducci[oó]n|mantenci[oó]n)\b/i;
const unitOf = (raw: string): DoseUnit => {
  const u = raw.toLowerCase();
  return u === 'mg' ? 'mg' : u === 'ml' ? 'ml' : u.startsWith('u') && u !== 'ug' ? 'UI' : 'mcg';
};

/** Every "/kg" dose in the reference text ("1-5 mcg/kg EV / 5-10 mcg/kg IM" → two options), plus the structured mg/kg columns */
export function doseOptions(text: string | null | undefined, structured?: { min: number | null; max: number | null }): DoseOption[] {
  const out: DoseOption[] = [];
  const seen = new Set<string>();
  const add = (o: DoseOption) => { if (!seen.has(o.key)) { seen.add(o.key); out.push(o); } };
  if (text) {
    for (const m of text.matchAll(new RegExp(DOSE_RE.source, 'gi'))) {
      const min = num(m[1]);
      const max = m[2] ? num(m[2]) : min;
      if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max < min) continue;
      const unit = unitOf(m[3]);
      const route = text.slice((m.index || 0) + m[0].length).match(ROUTE_RE);
      const range = `${String(min).replace('.', ',')}${max !== min ? `–${String(max).replace('.', ',')}` : ''} ${unit}/kg`;
      add({ key: `${min}-${max}-${unit}-${route ? route[1].toLowerCase() : ''}`, label: route ? `${range} ${route[1]}` : range, min, max, unit });
    }
  }
  const sMin = structured?.min, sMax = structured?.max ?? structured?.min;
  if (sMin && sMax && sMax >= sMin) add({ key: `${sMin}-${sMax}-mg-`, label: `${String(sMin).replace('.', ',')}${sMax !== sMin ? `–${String(sMax).replace('.', ',')}` : ''} mg/kg`, min: sMin, max: sMax, unit: 'mg' });
  return out;
}

export type PresentationForm = 'liquid' | 'tablet';
export type PresentationUnit = 'mg' | 'mcg' | 'UI';

export interface PresentationOption {
  key: string;
  label: string;
  form: PresentationForm;
  /** Per ml (liquid) or per tablet */
  amount: number;
  unit: PresentationUnit;
}

const presUnit = (raw: string): PresentationUnit => {
  const u = raw.toLowerCase();
  return u === 'mg' ? 'mg' : u.startsWith('u') && u !== 'ug' ? 'UI' : 'mcg';
};
const fmtN = (n: number) => String(Math.round(n * 1000) / 1000).replace('.', ',');

/** Concentrations and tablet strengths in a presentation ("Comprimidos 10-25-50 mg / solución 10 mg/ml", "0,3 %") */
export function presentationOptions(text: string | null | undefined, concentrationMgMl?: number | null): PresentationOption[] {
  const out: PresentationOption[] = [];
  const seen = new Set<string>();
  const add = (form: PresentationForm, amount: number, unit: PresentationUnit, label?: string) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const key = `${form}-${amount}-${unit}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ key, form, amount, unit, label: label || (form === 'liquid' ? `${fmtN(amount)} ${unit}/ml` : `Comprimido ${fmtN(amount)} ${unit}`) });
  };
  if (text) {
    for (const m of text.matchAll(/(\d+(?:[.,]\d+)?)\s*(mg|mcg|µg|ug|UI|U)\s*\/\s*ml/gi)) add('liquid', num(m[1]), presUnit(m[2]));
    for (const m of text.matchAll(/(\d+(?:[.,]\d+)?)\s*%/g)) add('liquid', num(m[1]) * 10, 'mg', `${fmtN(num(m[1]))} % (${fmtN(num(m[1]) * 10)} mg/ml)`);
    const TAB_RE = /(comprimidos?|tabletas?|c[aá]psulas?|grageas?)(?:\s+[a-záéíóúñ]+)?\s+((?:\d+(?:[.,]\d+)?\s*(?:-|,|y|\/)\s*)*\d+(?:[.,]\d+)?)\s*(mg|mcg|µg|ug)(?!\s*\/\s*ml)/gi;
    for (const m of text.matchAll(TAB_RE)) {
      for (const n of m[2].split(/\s*(?:-|,|y|\/)\s*/)) add('tablet', num(n), presUnit(m[3]));
    }
  }
  if (concentrationMgMl) add('liquid', Number(concentrationMgMl), 'mg');
  return out;
}

/** Converts an amount between dose units; null when they cannot be compared (UI vs mg) */
export function convertAmount(value: number, from: DoseUnit | PresentationUnit, to: PresentationUnit): number | null {
  if (from === to) return value;
  if (from === 'mg' && to === 'mcg') return value * 1000;
  if (from === 'mcg' && to === 'mg') return value / 1000;
  return null;
}

/** "2", "2,5", "2-4", "2 a 4" → range per kg; null when it is not a number */
export function parseDoseInput(input: string): { min: number; max: number } | null {
  const m = input.trim().match(/^(\d+(?:[.,]\d+)?)(?:\s*(?:-|–|a)\s*(\d+(?:[.,]\d+)?))?$/i);
  if (!m) return null;
  const min = num(m[1]);
  const max = m[2] ? num(m[2]) : min;
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max < min) return null;
  return { min, max };
}

/** Tablets rounded to a quarter ("1 ½", "¾"), the way they can be split */
export function tabletsText(n: number): string {
  const q = Math.round(n * 4) / 4;
  if (q === 0) return 'menos de ¼';
  const whole = Math.floor(q);
  const frac = ({ 0.25: '¼', 0.5: '½', 0.75: '¾' } as Record<number, string>)[q - whole] || '';
  return [whole ? String(whole) : '', frac].filter(Boolean).join(' ');
}
