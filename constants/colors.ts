// ─────────────────────────────────────────────────────────
// Light — "Saber": royal navy, antique gold, ivory vellum.
// Taken from the crest in assets/logo.png. Warm ivory surfaces
// instead of cool SaaS gray; gold is reserved for marks and
// primary actions, never small text (3.4:1 on surface).
// ─────────────────────────────────────────────────────────
export const APP_COLORS = {
  primary: '#12264D',        // interactive: links, selection, focus (14.6:1 on surface)
  primaryLight: '#2A4478',
  primaryDark: '#0A1733',
  primaryContainer: '#E4E8F1',
  onPrimary: '#FFFFFF',
  chrome: '#0B1D3A',         // sidebar, headers, hero — the crest's field
  chromeSoft: '#18305E',
  onChrome: '#F3EFE4',
  accent: '#A8842A',         // antique gold: marks, active indicators, primary buttons
  success: '#2E7D5B',
  background: '#F5F2EA',
  surface: '#FFFDF8',
  surfaceVariant: '#EEE9DD',
  text: '#141C33',
  textSecondary: '#4E586F',
  textLight: '#646B80',
  error: '#B42318',
  warning: '#B25E09',
  info: '#2F5EA8',
  border: '#DDD5C4',
  disabled: '#C9C2B2',
  cardShadow: '#1B1606',
};

// ─────────────────────────────────────────────────────────
// Dark — "Alter": black armor, crimson veins, pale gold eyes.
// Near-black surfaces with a violet undertone; gold carries
// interaction (9.4:1), crimson only marks and active states.
// ─────────────────────────────────────────────────────────
export const APP_COLORS_DARK: AppColors = {
  primary: '#D9B45B',
  primaryLight: '#E8CB86',
  primaryDark: '#A8842A',
  primaryContainer: '#2A1016',
  onPrimary: '#0A0A0F',
  chrome: '#07070B',
  chromeSoft: '#1C0A10',
  onChrome: '#ECE6D8',
  accent: '#B8323F',
  success: '#5FB98A',
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceVariant: '#1A1A24',
  text: '#ECE6D8',
  textSecondary: '#ABA5B3',
  textLight: '#8C8797',
  error: '#F0707A',
  warning: '#E3A94F',
  info: '#8FA8DB',
  border: '#2B2A36',
  disabled: '#3A3946',
  cardShadow: '#000000',
};

export type AppColors = typeof APP_COLORS;

// Saber/Alter are now the light/dark themes themselves. Kept as an empty
// registry so a stored color_palette from older versions falls back cleanly.
export const PALETTES: Record<string, { light: AppColors; dark: AppColors; label: string }> = {};

export type PaletteKey = keyof typeof PALETTES;

export const CATEGORY_COLORS: Record<string, string> = {
  infectious: '#E53935',
  parasitic: '#8E24AA',
  degenerative: '#F57C00',
  oncological: '#C62828',
  nutritional: '#43A047',
  autoimmune: '#1565C0',
  traumatic: '#6D4C41',
  congenital: '#00838F',
  respiratory: '#26A69A',
  gastrointestinal: '#7CB342',
  dermatological: '#EC407A',
  ocular: '#5C6BC0',
  dental: '#78909C',
  endocrine: '#AB47BC',
  cardiovascular: '#E53935',
  neurological: '#7E57C2',
  musculoskeletal: '#8D6E63',
  renal: '#0097A7',
  reproductive: '#EC407A',
};

export const SEVERITY_COLORS = {
  mild: '#43A047',
  moderate: '#F57C00',
  severe: '#E53935',
  critical: '#B71C1C',
};

export const SEVERITY_LABELS = {
  mild: 'Leve',
  moderate: 'Moderado',
  severe: 'Severo',
  critical: 'Crítico',
};

export const PROGNOSIS_LABELS = {
  excellent: 'Excelente',
  good: 'Bueno',
  guarded: 'Reservado',
  poor: 'Malo',
  grave: 'Grave',
};

// ─────────────────────────────────────────────────────────
// Semantic tokens — text on primary backgrounds
// ─────────────────────────────────────────────────────────
export const TEXT_ON_PRIMARY = {
  light: { default: '#FFFFFF', muted: '#FFFFFFBB', subtle: '#FFFFFF99', faint: '#FFFFFF80' },
  dark:  { default: '#0F172A', muted: '#0F172ABB', subtle: '#0F172A99', faint: '#0F172A80' },
};

/**
 * Returns the correct text-on-primary colors based on the primary color's luminance.
 * If the primary is dark → returns light text. If primary is light → returns dark text.
 */
export function getTextOnPrimary(primaryColor: string): { default: string; muted: string; subtle: string; faint: string } {
  const hex = primaryColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? TEXT_ON_PRIMARY.dark : TEXT_ON_PRIMARY.light;
}

// ─────────────────────────────────────────────────────────
// Record type colors — centralized
// ─────────────────────────────────────────────────────────
export const RECORD_TYPE_COLORS: Record<string, string> = {
  consulta: '#3B82F6',
  vacuna: '#10B981',
  cirugia: '#EF4444',
  control: '#F59E0B',
  terreno: '#8D6E63',
};



// Appointment type colors � centralized (used in agenda.tsx, HistoryTimeline)
export const APPOINTMENT_TYPE_COLORS: Record<string, string> = {
  consulta: '#3B82F6',
  vacuna: '#10B981',
  examenes: '#8B5CF6',
  cirugia: '#F59E0B',
  hospitalizacion: '#EC407A',
  control: '#06B6D4',
  terreno: '#8D6E63',
};

// ─────────────────────────────────────────────────────────
// Status colors
// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
// Appointment status colors — centralized (used in agenda components)
// ─────────────────────────────────────────────────────────
export const APPOINTMENT_STATUS_COLORS: Record<string, { color: string; label: string; dot: string }> = {
  programada:   { color: '#3B82F6', label: 'Programada',   dot: '#3B82F6' },
  confirmada:   { color: '#10B981', label: 'Confirmada',   dot: '#10B981' },
  en_espera:    { color: '#F59E0B', label: 'En espera',    dot: '#F59E0B' },
  en_consulta:  { color: '#10B981', label: 'En consulta',  dot: '#10B981' },
  completada:   { color: '#6B7280', label: 'Finalizada',   dot: '#6B7280' },
  pendiente:    { color: '#F59E0B', label: 'Pendiente',    dot: '#F59E0B' },
  cancelada:    { color: '#EF4444', label: 'Cancelada',    dot: '#EF4444' },
  ausente:      { color: '#9CA3AF', label: 'Ausente',      dot: '#9CA3AF' },
};

export const APPOINTMENT_STATUS_LIST = Object.entries(APPOINTMENT_STATUS_COLORS).map(([key, val]) => ({
  key, ...val,
}));


