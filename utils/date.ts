// Local-time helpers. `toISOString()` is UTC, so slicing it gives the wrong
// day/hour in Chile (UTC-3/-4): evening appointments land on "tomorrow" and
// datetime inputs default to a time 3–4 hours ahead.

const pad = (n: number) => String(n).padStart(2, '0');

export function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toLocalDateKeyFromString(dateStr: string): string {
  return toLocalDateKey(new Date(dateStr));
}

/** "YYYY-MM-DD HH:mm" in local time, for datetime text inputs. */
export function toLocalDateTimeInput(date: Date = new Date()): string {
  return `${toLocalDateKey(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Parses "YYYY-MM-DD HH:mm", "YYYY-MM-DDTHH:mm" or "DD/MM/AAAA HH:mm" as LOCAL time.
 * Returns null when the text is not a real date (e.g. 31/02).
 */
export function parseLocalDateTime(input: string): Date | null {
  const s = input.trim();
  let y: number, mo: number, d: number, h = 0, mi = 0;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?$/);
  if (m) { y = +m[1]; mo = +m[2]; d = +m[3]; h = m[4] ? +m[4] : 0; mi = m[5] ? +m[5] : 0; }
  else if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/))) {
    d = +m[1]; mo = +m[2]; y = +m[3]; h = m[4] ? +m[4] : 0; mi = m[5] ? +m[5] : 0;
  } else return null;
  const date = new Date(y, mo - 1, d, h, mi);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d || h > 23 || mi > 59) return null;
  return date;
}

/** True when the ISO/Date falls on the same local calendar day as `ref` (default: today). */
export function isSameLocalDay(value: string | Date, ref: Date = new Date()): boolean {
  return toLocalDateKey(new Date(value)) === toLocalDateKey(ref);
}

/** "DD/MM/AAAA" → "YYYY-MM-DD"; null when empty, undefined when it is not a real past-or-today date. */
export function parseDmy(input: string, { allowFuture = false } = {}): string | null | undefined {
  const s = input.trim();
  if (!s) return null;
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (!m) return undefined;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  if (d.getDate() !== +m[1] || d.getMonth() !== +m[2] - 1 || +m[3] < 1980) return undefined;
  if (!allowFuture && d > new Date()) return undefined;
  return toLocalDateKey(d);
}

/**
 * A past dose date the tutor may only know roughly: "DD/MM/AAAA" is exact; "MM/AAAA" or "AAAA" is an estimate
 * (mid-month / mid-year, never in the future). undefined when it is not a valid past date, null when empty.
 */
export function parseDoseDate(input: string): { date: string; estimated: boolean } | null | undefined {
  const s = input.trim();
  if (!s) return null;
  const exact = parseDmy(s);
  if (exact) return { date: exact, estimated: false };
  const ym = s.match(/^(\d{1,2})[\/\-.](\d{4})$/);
  const y = s.match(/^(\d{4})$/);
  if (!ym && !y) return undefined;
  const year = +(ym ? ym[2] : y![1]);
  const month = ym ? +ym[1] : 7;
  if (month < 1 || month > 12 || year < 1980) return undefined;
  let d = new Date(year, month - 1, ym ? 15 : 1);
  const now = new Date();
  if (new Date(year, month - 1, 1) > now) return undefined;
  if (d > now) d = now;
  return { date: toLocalDateKey(d), estimated: true };
}

/** "MM/AAAA" of the month that was `months` ago (for the "about N months ago" shortcuts) */
export function monthsAgoInput(months: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - months);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/** "YYYY-MM-DD" (or an ISO timestamp) → "DD/MM/AAAA" */
export function formatDmy(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
}

/** An approximate age ("about 3 years and 2 months") as a birth date, mid-month to avoid edge days */
export function birthDateFromAge(years: number, months: number): string {
  const d = new Date();
  d.setDate(15);
  d.setMonth(d.getMonth() - (years * 12 + months));
  return toLocalDateKey(d);
}

export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const date = new Date(y, m - 1 + months, d);
  return toLocalDateKey(date);
}
