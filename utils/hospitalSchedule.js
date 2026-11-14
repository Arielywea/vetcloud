// Server-side twin of utils/hospitalSheet.ts: the scheduled times of a hospital treatment, for the
// late-sheet notice and the discharge summary. The server runs in UTC, so fixed hours of the day are
// read in the clinic's time zone (Chile's offsets are whole hours, so local hours start on UTC hours).
const TIME_ZONE = process.env.CLINIC_TIMEZONE || 'America/Santiago';
const HOUR_MS = 3600000;
/** Same tolerance as the sheet: a time becomes late half an hour after it */
const DUE_WINDOW_MS = 30 * 60000;

const hourFormat = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, hour: 'numeric', hourCycle: 'h23' });
const localHour = (ms) => Number(hourFormat.format(new Date(ms))) % 24;

/** Scheduled times (ms) of one treatment inside [from, to), stopping at its suspension */
function scheduledTimes(t, from, to) {
  const start = new Date(t.start_at).getTime();
  const end = Math.min(to, t.discontinued_at ? new Date(t.discontinued_at).getTime() : Infinity);
  const times = [];
  if (Array.isArray(t.day_hours) && t.day_hours.length) {
    const hours = new Set(t.day_hours.map(Number));
    for (let ms = Math.ceil(Math.max(from, start) / HOUR_MS) * HOUR_MS; ms < end; ms += HOUR_MS) {
      if (hours.has(localHour(ms))) times.push(ms);
    }
    return times;
  }
  if (!t.frequency_hours) return start >= from && start < end ? [start] : [];
  const step = t.frequency_hours * HOUR_MS;
  for (let k = Math.max(0, Math.ceil((from - start) / step)); start + k * step < end; k++) times.push(start + k * step);
  return times;
}

/** Times with nothing recorded that are more than half an hour past, between `from` and `now` */
function lateTimes(treatments, tasks, from, now) {
  const recorded = new Set(tasks.map((task) => `${task.treatment_id}:${new Date(task.scheduled_for).getTime()}`));
  const late = [];
  for (const t of treatments) {
    for (const ms of scheduledTimes(t, from, now - DUE_WINDOW_MS)) {
      if (!recorded.has(`${t.id}:${ms}`)) late.push({ treatment: t, at: ms });
    }
  }
  return late.sort((a, b) => a.at - b.at);
}

function clockText(ms) {
  return new Date(ms).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE });
}

module.exports = { TIME_ZONE, scheduledTimes, lateTimes, clockText };
