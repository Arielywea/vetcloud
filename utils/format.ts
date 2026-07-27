export function formatTimeRange(start: string, end: string | null): string {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date(s.getTime() + 45 * 60000);
  const fmt = (d: Date) => d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  return `${fmt(s)} - ${fmt(e)}`;
}
