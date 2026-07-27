// ─────────────────────────────────────────────────────────
// Light Theme — VetCloud Premium SaaS
// Navy + Gold + Cool White
// ─────────────────────────────────────────────────────────
export const APP_COLORS = {
  primary: '#0B1D3A',
  primaryLight: '#1E3A5F',
  primaryDark: '#06132B',
  primaryContainer: '#E8F0FE',
  accent: '#C9A227',
  success: '#10B981',
  background: '#F7F8FB',
  surface: '#FFFFFF',
  surfaceVariant: '#EEF1F6',
  text: '#1A2332',
  textSecondary: '#5A6B80',
  textLight: '#8896A8',
  error: '#EF4444',
  warning: '#E8930A',
  info: '#3B82F6',
  border: '#DDE3EC',
  disabled: '#CBD5E1',
  cardShadow: '#0F172A',
};

// ─────────────────────────────────────────────────────────
// Dark Theme — VetCloud Premium SaaS Dark
// Deep navy + gold accent on dark surfaces
// ─────────────────────────────────────────────────────────
export const APP_COLORS_DARK = {
  primary: '#4A90D9',
  primaryLight: '#6BA5E7',
  primaryDark: '#0E3A73',
  primaryContainer: '#0F1D32',
  accent: '#D4AF37',
  success: '#34D399',
  background: '#0B1120',
  surface: '#111827',
  surfaceVariant: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textLight: '#475569',
  error: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',
  border: '#1E293B',
  disabled: '#334155',
      cardShadow: '#0F172A',
};

export type AppColors = typeof APP_COLORS;

// ─────────────────────────────────────────────────────────
// Anime Palettes — each with light + dark variants
// ─────────────────────────────────────────────────────────
export const PALETTES: Record<string, { light: AppColors; dark: AppColors; label: string }> = {
  artoria_alter: {
    label: 'Artoria Alter',
    light: {
      primary: '#6D1220', primaryLight: '#9B1B30', primaryDark: '#4A0D15', primaryContainer: '#F5E0E4',
      accent: '#B8941F', success: '#43A047', background: '#F0EDE8', surface: '#FFFFFF', surfaceVariant: '#E8E4DE',
      text: '#1A1B2E', textSecondary: '#5A5E70', textLight: '#8B90A0',
      error: '#C62828', warning: '#E65100', info: '#5C6BC0', border: '#D0CCC5', disabled: '#B0AAA0', cardShadow: '#000000',
    },
    dark: {
      primary: '#9B1B30', primaryLight: '#C42847', primaryDark: '#6D1220', primaryContainer: '#2A0F1A',
      accent: '#C9A227', success: '#66BB6A', background: '#0B0C14', surface: '#12131F', surfaceVariant: '#1A1B2E',
      text: '#C5CAD6', textSecondary: '#9BA1B0', textLight: '#6B7186',
      error: '#EF5350', warning: '#FFB74D', info: '#7986CB', border: '#252638', disabled: '#3A3B4E', cardShadow: '#000000',
    },
  },
};

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

// ─────────────────────────────────────────────────────────
// Reminder type colors
// ─────────────────────────────────────────────────────────
export const REMINDER_TYPE_COLORS: Record<string, string> = {
  vacuna: '#10B981',
  desparasitacion: '#F59E0B',
  cita: '#3B82F6',
  post_operatorio: '#EF4444',
  control: '#8B5CF6',
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

export const STATUS_COLORS = {
  pending:  { bg: '#FFF3E0', text: '#E65100' },
  sent:     { bg: '#E8F5E9', text: '#2E7D32' },
  cancelled: { bg: '#FFEBEE', text: '#C62828' },
  success:  { bg: '#E8F5E9', text: '#43A047' },
  error:    { bg: '#FFEBEE', text: '#E53935' },
  internado: { bg: '#E3F2FD', text: '#1565C0' },
  cirugia:  { bg: '#FFEBEE', text: '#C62828' },
  recuperacion: { bg: '#FFF3E0', text: '#E65100' },
  alta:     { bg: '#E8F5E9', text: '#2E7D32' },
};
