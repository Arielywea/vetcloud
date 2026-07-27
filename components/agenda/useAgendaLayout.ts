import { useMemo } from 'react';
import { Appointment } from '../../services/directus';
import { toLocalDateKeyFromString } from '../../utils/date';

const HOUR_HEIGHT = 36;
const START_HOUR = 8;
const END_HOUR = 19;
const TOTAL_HOURS = END_HOUR - START_HOUR;

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

interface UseAgendaLayoutOptions {
  appointments: Appointment[];
  selectedDate: Date;
}

export default function useAgendaLayout({ appointments, selectedDate }: UseAgendaLayoutOptions) {
  const dateKey = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const weekStart = useMemo(() => {
    const d = new Date(selectedDate);
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
      .filter((a) => toLocalDateKeyFromString(a.start_time) === dateKey)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [appointments, dateKey]);

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
    nextAppointment,
    delayedAppointments,
    totalGridHeight: TOTAL_HOURS * HOUR_HEIGHT,
  };
}
