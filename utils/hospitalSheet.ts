import { HospitalTask, HospitalTreatment, HospitalTreatmentKind } from '../services/directus';

export type SlotState = 'pending' | 'due' | 'late' | 'done' | 'skipped';
export interface Slot {
  treatment: HospitalTreatment;
  at: Date;
  task: HospitalTask | null;
  state: SlotState;
}

/** A scheduled time counts as "now" from half an hour before to half an hour after; later than that it is late */
export const DUE_WINDOW_MS = 30 * 60000;
const HOUR_MS = 3600000;

export const KIND_ORDER: HospitalTreatmentKind[] = ['medicacion', 'fluidos', 'constante', 'alimentacion', 'cuidado'];
export const KIND_LABEL: Record<HospitalTreatmentKind, string> = {
  medicacion: 'Medicación', fluidos: 'Fluidos', constante: 'Constantes', alimentacion: 'Alimentación', cuidado: 'Cuidados',
};

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
export function floorToHour(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours());
}

/** Scheduled times of one treatment inside [from, to), stopping at its suspension or the discharge */
export function scheduledTimes(t: HospitalTreatment, from: Date, to: Date, sheetEnd: Date | null): Date[] {
  const start = new Date(t.start_at).getTime();
  const stops = [to.getTime(), t.discontinued_at ? new Date(t.discontinued_at).getTime() : Infinity, sheetEnd ? sheetEnd.getTime() : Infinity];
  const end = Math.min(...stops);
  if (t.day_hours?.length) {
    // Fixed hours repeat every day in local time (built with the Date constructor, so a clock change keeps 08:00 at 08:00)
    const times: Date[] = [];
    for (let d = startOfDay(from); d.getTime() < end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
      for (const h of t.day_hours) {
        const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h).getTime();
        if (at >= start && at >= from.getTime() && at < end) times.push(new Date(at));
      }
    }
    return times.sort((a, b) => a.getTime() - b.getTime());
  }
  if (!t.frequency_hours) return start >= from.getTime() && start < end ? [new Date(start)] : [];
  const step = t.frequency_hours * HOUR_MS;
  const times: Date[] = [];
  for (let k = Math.max(0, Math.ceil((from.getTime() - start) / step)); start + k * step < end; k++) times.push(new Date(start + k * step));
  return times;
}

export function slotState(at: Date, task: HospitalTask | null, now: Date): SlotState {
  if (task) return task.status;
  const diff = at.getTime() - now.getTime();
  if (diff < -DUE_WINDOW_MS) return 'late';
  return diff <= DUE_WINDOW_MS ? 'due' : 'pending';
}

/** Every slot of the sheet between two moments, with what was recorded for it */
export function buildSlots(treatments: HospitalTreatment[], tasks: HospitalTask[], from: Date, to: Date, sheetEnd: Date | null, now: Date): Slot[] {
  const byKey = new Map(tasks.map((task) => [`${task.treatment_id}:${new Date(task.scheduled_for).getTime()}`, task]));
  return treatments.flatMap((treatment) => scheduledTimes(treatment, from, to, sheetEnd).map((at) => {
    const task = byKey.get(`${treatment.id}:${at.getTime()}`) || null;
    return { treatment, at, task, state: slotState(at, task, now) };
  }));
}

export function sortTreatments(treatments: HospitalTreatment[]): HospitalTreatment[] {
  return [...treatments].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.sort_order - b.sort_order);
}

export function frequencyLabel(t: Pick<HospitalTreatment, 'frequency_hours' | 'day_hours'>): string {
  if (t.day_hours?.length) return `a las ${t.day_hours.map((h) => String(h).padStart(2, '0')).join(', ')} h`;
  return t.frequency_hours ? `cada ${t.frequency_hours} h` : 'una vez';
}
export function hourLabel(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
