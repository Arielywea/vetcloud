import { useMemo } from 'react';
import { Appointment } from '../../services/directus';

const HOUR_HEIGHT_WEB = 36;
const HOUR_HEIGHT_MOBILE = 28;
const START_HOUR = 8;
const END_HOUR = 19;
const TOTAL_HOURS = END_HOUR - START_HOUR;

function toLocalDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface PositionedAppointment {
  appointment: Appointment & { petPhoto?: string | null; petSpecies?: string; petBreed?: string };
  top: number;
  height: number;
  column: number;
  totalColumns: number;
  dayIndex: number;
}

function getDurationMinutes(appt: Appointment): number {
  if (appt.end_time) {
    return (new Date(appt.end_time).getTime() - new Date(appt.start_time).getTime()) / 60000;
  }
  return 45;
}

function getHourFromTime(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getHours() + d.getMinutes() / 60;
}

function getMinuteFromTime(dateStr: string): number {
  return new Date(dateStr).getMinutes();
}

function getDayIndex(dateStr: string, weekStart: Date): number {
  const d = new Date(dateStr);
  const diff = (d.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24);
  return Math.round(diff);
}

export function useAgendaLayout(
  appointments: Appointment[],
  selectedDate: string,
  view: 'day' | 'week' | 'month',
  isMobile: boolean
) {
  const hourHeight = isMobile ? HOUR_HEIGHT_MOBILE : HOUR_HEIGHT_WEB;
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  const weekStart = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00');
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [selectedDate]);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [weekStart]);

  const dayAppointments = useMemo(() => {
    return appointments
      .filter((a) => toLocalDateKey(a.start_time) === selectedDate)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [appointments, selectedDate]);

  const weekAppointments = useMemo(() => {
    const filtered = appointments.filter((a) => {
      const d = new Date(a.start_time);
      return d >= weekStart && d <= weekEnd;
    });

    const positioned: PositionedAppointment[] = [];

    const byDay: Record<number, Appointment[]> = {};
    filtered.forEach((appt) => {
      const dayIdx = getDayIndex(appt.start_time, weekStart);
      if (!byDay[dayIdx]) byDay[dayIdx] = [];
      byDay[dayIdx].push(appt);
    });

    Object.entries(byDay).forEach(([dayStr, dayAppts]) => {
      const dayIdx = parseInt(dayStr);
      const sorted = dayAppts.sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

      const columns: Appointment[][] = [];
      sorted.forEach((appt) => {
        const startMin = getMinuteFromTime(appt.start_time);
        const duration = getDurationMinutes(appt);
        const endMin = startMin + duration;

        let placed = false;
        for (let col = 0; col < columns.length; col++) {
          const lastInCol = columns[col][columns[col].length - 1];
          const lastEnd = getMinuteFromTime(lastInCol.start_time) + getDurationMinutes(lastInCol);
          if (startMin >= lastEnd) {
            columns[col].push(appt);
            placed = true;
            break;
          }
        }
        if (!placed) {
          columns.push([appt]);
        }
      });

      const totalColumns = columns.length;
      sorted.forEach((appt) => {
        const startHour = getHourFromTime(appt.start_time);
        const duration = getDurationMinutes(appt);
        const relativeHour = startHour - START_HOUR;
        const top = relativeHour * hourHeight + (getMinuteFromTime(appt.start_time) / 60) * hourHeight;
        const height = (duration / 60) * hourHeight;

        let column = 0;
        for (let col = 0; col < columns.length; col++) {
          if (columns[col].includes(appt)) {
            column = col;
            break;
          }
        }

        positioned.push({
          appointment: appt as any,
          top,
          height,
          column,
          totalColumns,
          dayIndex: dayIdx,
        });
      });
    });

    return positioned;
  }, [appointments, weekStart, weekEnd, hourHeight]);

  const monthDots = useMemo(() => {
    const dots: Record<string, { color: string }[]> = {};
    appointments.forEach((appt) => {
      const dateKey = toLocalDateKey(appt.start_time);
      const color = getTypeColor(appt.appointment_type);
      if (!dots[dateKey]) dots[dateKey] = [];
      dots[dateKey].push({ color });
    });
    return dots;
  }, [appointments]);

  const daySummary = useMemo(() => {
    const summary = {
      programadas: dayAppointments.filter((a) => a.status === 'programada').length,
      confirmadas: dayAppointments.filter((a) => a.status === 'confirmada').length,
      en_espera: dayAppointments.filter((a) => a.status === 'en_espera').length,
      en_consulta: dayAppointments.filter((a) => a.status === 'en_consulta').length,
      completadas: dayAppointments.filter((a) => a.status === 'completada').length,
      canceladas: dayAppointments.filter((a) => a.status === 'cancelada').length,
      ausentes: dayAppointments.filter((a) => a.status === 'ausente').length,
      total: dayAppointments.length,
    };
    return summary;
  }, [dayAppointments]);

  const nextAppointment = useMemo(() => {
    const now = new Date();
    return dayAppointments.find(
      (a) => new Date(a.start_time) > now && a.status !== 'completada' && a.status !== 'cancelada'
    );
  }, [dayAppointments]);

  const delayedAppointments = useMemo(() => {
    const now = new Date();
    return dayAppointments.filter(
      (a) =>
        new Date(a.start_time) < now &&
        a.status !== 'completada' &&
        a.status !== 'cancelada' &&
        a.status !== 'ausente'
    );
  }, [dayAppointments]);

  return {
    hours,
    hourHeight,
    weekStart,
    weekEnd,
    dayAppointments,
    weekAppointments,
    monthDots,
    daySummary,
    nextAppointment,
    delayedAppointments,
    START_HOUR,
    END_HOUR,
    TOTAL_HOURS,
    totalGridHeight: TOTAL_HOURS * hourHeight,
  };
}

function getTypeColor(type: string): string {
  const map: Record<string, string> = {
    consulta: '#3B82F6',
    vacuna: '#10B981',
    examenes: '#8B5CF6',
    cirugia: '#F59E0B',
    hospitalizacion: '#EC407A',
    control: '#06B6D4',
    terreno: '#8D6E63',
  };
  return map[type] || '#3B82F6';
}
