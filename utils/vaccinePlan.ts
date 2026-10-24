// Base vaccination plan (WSAVA 2024, adapted to what Chilean clinics stock) and how a pet stands
// against it. The intervals only propose the next date; the vet can always change it.
import type { PetSpecies, Vaccination, VaccinationKind, VaccinePlanItem } from '../services/directus';
import { addMonths } from './date';

export interface PlanItem {
  item: VaccinePlanItem;
  label: string;
  /** Months to the next dose once the primary series is done */
  months: number;
  note?: string;
}

export const VACCINE_PLAN: Record<'dog' | 'cat', PlanItem[]> = {
  dog: [
    { item: 'octuple_sextuple', label: 'Óctuple / Séxtuple', months: 12, note: 'Cachorro: cada 3-4 semanas hasta las 16 semanas o más; refuerzo a los 6-12 meses' },
    { item: 'kc', label: 'KC (tos de las perreras)', months: 12 },
    { item: 'antirrabica', label: 'Antirrábica', months: 12, note: 'Anual, práctica habitual en Chile' },
  ],
  cat: [
    { item: 'triple_felina', label: 'Triple felina', months: 12, note: 'Gatito: serie hasta las 16 semanas; luego según riesgo (1-3 años)' },
    { item: 'leucemia_felina', label: 'Leucemia felina', months: 12, note: 'Gatos con salida al exterior y FeLV negativos' },
    { item: 'antirrabica', label: 'Antirrábica', months: 12, note: 'Anual, práctica habitual en Chile' },
  ],
};

export const DEWORMING: Array<{ kind: Exclude<VaccinationKind, 'vacuna'>; label: string; months: number }> = [
  { kind: 'desparasitacion_interna', label: 'Desparasitación interna', months: 3 },
  { kind: 'desparasitacion_externa', label: 'Desparasitación externa', months: 1 },
];

export const PLAN_LABEL: Record<string, string> = {
  octuple_sextuple: 'Óctuple / Séxtuple', kc: 'KC', antirrabica: 'Antirrábica',
  triple_felina: 'Triple felina', leucemia_felina: 'Leucemia felina', otra: 'Otra vacuna',
};

export function planFor(species: PetSpecies): PlanItem[] {
  return species === 'dog' || species === 'cat' ? VACCINE_PLAN[species] : [];
}

/** Proposed next date for a dose applied on `applied` (YYYY-MM-DD) */
export function proposeNextDue(kind: VaccinationKind, planItem: VaccinePlanItem | null, applied: string, species: PetSpecies): string {
  if (kind !== 'vacuna') return addMonths(applied, DEWORMING.find((d) => d.kind === kind)?.months ?? 3);
  const months = planFor(species).find((p) => p.item === planItem)?.months ?? 12;
  return addMonths(applied, months);
}

export type DoseState = 'none' | 'ok' | 'soon' | 'overdue';

export interface DoseStatus {
  state: DoseState;
  last: Vaccination | null;
  /** YYYY-MM-DD */
  due: string | null;
}

const day = (v: string | null | undefined) => (v ? String(v).slice(0, 10) : null);

/** Where the pet stands for one plan item (or one kind of deworming): last dose and when the next is due */
export function doseStatus(vaccinations: Vaccination[], match: (v: Vaccination) => boolean, fallbackMonths = 12): DoseStatus {
  const doses = vaccinations.filter(match).sort((a, b) => String(b.applied_at).localeCompare(String(a.applied_at)));
  const last = doses[0] || null;
  if (!last) return { state: 'none', last: null, due: null };
  const due = day(last.next_due_at) || addMonths(day(last.applied_at)!, fallbackMonths);
  const today = new Date().toISOString().slice(0, 10);
  const soon = addMonths(today, 1);
  return { state: due < today ? 'overdue' : due <= soon ? 'soon' : 'ok', last, due };
}

export function formatDay(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  const d = day(iso);
  if (!d) return '';
  const [y, m, dd] = d.split('-').map(Number);
  return new Date(y, m - 1, dd).toLocaleDateString('es-CL', opts);
}
