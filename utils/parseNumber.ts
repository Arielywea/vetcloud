/**
 * Parses numbers the way they are typed in Chile.
 *   "4,5"     -> 4.5    (decimal comma)
 *   "15.000"  -> 15000  (thousands dot)
 *   "1.250,5" -> 1250.5
 *   "4.5"     -> 4.5    (a single dot followed by 1–2 digits is a decimal)
 * Returns null for empty input and NaN for anything that isn't a number,
 * so callers can tell "not filled in" from "invalid".
 */
export function parseLocaleNumber(
  input: string | number | null | undefined,
  { thousands = true }: { thousands?: boolean } = {},
): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') return Number.isFinite(input) ? input : NaN;
  let s = String(input).trim().replace(/\s/g, '');
  if (!s) return null;

  const hasComma = s.includes(',');
  const dots = (s.match(/\./g) || []).length;
  if (!thousands) {
    // Measurements (kg, °C, lpm): a dot or comma is always the decimal mark, so "2.500" kg is 2.5
    if (dots + (hasComma ? 1 : 0) > 1) return NaN;
    s = s.replace(',', '.');
  } else if (hasComma) {
    // Comma is the decimal separator; every dot is a thousands separator
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (dots > 1 || /^\d{1,3}\.\d{3}$/.test(s)) {
    // "15.000" or "1.250.000": dots are thousands separators
    s = s.replace(/\./g, '');
  }
  if (!/^-?\d+(\.\d+)?$/.test(s)) return NaN;
  return Number(s);
}

/**
 * Measurement with a range (weight, temperature, rates): dot or comma is the decimal mark.
 * Returns null (empty) or NaN (invalid/out of range).
 */
export function parseNumberInRange(input: string | number | null | undefined, min: number, max: number): number | null {
  const n = parseLocaleNumber(input, { thousands: false });
  if (n === null || Number.isNaN(n)) return n;
  return n < min || n > max ? NaN : n;
}

/** Money in CLP: whole pesos, thousands dots allowed ("15.000" -> 15000). */
export function parseCLP(input: string | null | undefined): number | null {
  const n = parseLocaleNumber(input);
  if (n === null || Number.isNaN(n)) return n;
  return Math.round(n);
}
