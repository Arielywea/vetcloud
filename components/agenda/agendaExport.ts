import { Platform } from 'react-native';
import { buildXlsx, saveXlsx } from '../../utils/exportCsv';
import { toLocalDateKey } from '../../utils/date';

type ViewMode = 'day' | 'week' | 'month';

import { APPOINTMENT_TYPE_LABELS as TYPE_LABELS } from '../../constants/colors';
const STATUS_LABELS: Record<string, string> = {
  programada: 'Programada', confirmada: 'Confirmada', en_espera: 'En espera', en_consulta: 'En consulta',
  completada: 'Finalizada', pendiente: 'Pendiente', cancelada: 'Cancelada', ausente: 'Ausente',
};

/** [start, end) of the period the agenda is showing, in local time. Weeks start on Monday. */
export function getVisibleRange(mode: ViewMode, date: Date): { start: Date; end: Date; label: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let end: Date;
  if (mode === 'day') {
    end = new Date(start); end.setDate(end.getDate() + 1);
  } else if (mode === 'week') {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    end = new Date(start); end.setDate(end.getDate() + 7);
  } else {
    start.setDate(1);
    end = new Date(start); end.setMonth(end.getMonth() + 1);
  }
  const fmt = (d: Date) => d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  const last = new Date(end); last.setDate(last.getDate() - 1);
  const label = mode === 'day' ? fmt(start) : mode === 'month'
    ? start.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
    : `${fmt(start)} – ${fmt(last)}`;
  return { start, end, label };
}

function rowsFor(appointments: any[], start: Date, end: Date) {
  return appointments
    .filter((a) => { const t = new Date(a.start_time); return t >= start && t < end; })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .map((a) => {
      const s = new Date(a.start_time);
      const e = a.end_time ? new Date(a.end_time) : null;
      const time = (d: Date) => d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
      return {
        date: s.toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        time: e ? `${time(s)}–${time(e)}` : time(s),
        patient: a.patient_name || '',
        tutor: a.tutorName || '',
        phone: a.tutor_phone || '',
        type: TYPE_LABELS[a.appointment_type] || a.appointment_type || '',
        status: STATUS_LABELS[a.status] || a.status || '',
        vet: a.veterinarian || '',
        notes: a.description || '',
      };
    });
}

export async function exportAgenda(appointments: any[], mode: ViewMode, date: Date) {
  const { start, end } = getVisibleRange(mode, date);
  const rows = rowsFor(appointments, start, end);
  const headers = ['Fecha', 'Hora', 'Paciente', 'Tutor', 'Teléfono', 'Tipo', 'Estado', 'Veterinario', 'Notas'];
  const data = rows.map((r) => [r.date, r.time, r.patient, r.tutor, r.phone, r.type, r.status, r.vet, r.notes]);
  await saveXlsx(await buildXlsx('Agenda', headers, data), `agenda_${toLocalDateKey(start)}`);
  return rows.length;
}

const esc = (s: string) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Opens a clean, printable list of the visible period (web). Returns false if printing isn't available. */
export function printAgenda(appointments: any[], mode: ViewMode, date: Date): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const { start, end, label } = getVisibleRange(mode, date);
  const rows = rowsFor(appointments, start, end);
  const body = rows.length
    ? rows.map((r) => `<tr><td>${esc(r.date)}</td><td>${esc(r.time)}</td><td><strong>${esc(r.patient)}</strong>${r.tutor ? `<br><small>${esc(r.tutor)}${r.phone ? ` · ${esc(r.phone)}` : ''}</small>` : ''}</td><td>${esc(r.type)}</td><td>${esc(r.status)}</td><td>${esc(r.vet)}</td><td>${esc(r.notes)}</td></tr>`).join('')
    : '<tr><td colspan="7" class="empty">Sin citas en este período</td></tr>';
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Agenda · ${esc(label)}</title>
<style>
  body{font-family:Inter,system-ui,sans-serif;color:#141C33;margin:24px}
  h1{font-family:'Cormorant Garamond',Georgia,serif;font-weight:600;font-size:26px;margin:0 0 4px}
  p{color:#4E586F;margin:0 0 16px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{text-align:left;border-bottom:2px solid #12264D;padding:6px 8px}
  td{border-bottom:1px solid #DDD5C4;padding:6px 8px;vertical-align:top}
  small{color:#4E586F}.empty{text-align:center;color:#4E586F;padding:24px}
  @media print{body{margin:12mm}}
</style></head><body>
<h1>Agenda</h1><p>${esc(label)} · ${rows.length} cita${rows.length === 1 ? '' : 's'}</p>
<table><thead><tr><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Tipo</th><th>Estado</th><th>Veterinario</th><th>Notas</th></tr></thead><tbody>${body}</tbody></table>
<script>window.onload=function(){window.print()}</script></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}
