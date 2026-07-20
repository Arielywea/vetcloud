// ─────────────────────────────────────────────────────────
// Light Theme (Paz — purple + beige background)
// ─────────────────────────────────────────────────────────
export const APP_COLORS = {
  primary: '#6741D9',
  primaryLight: '#845EF7',
  primaryDark: '#4C1D95',
  primaryContainer: '#EDE9FE',
  accent: '#00C853',
  success: '#00C853',
  background: '#F5F0EB',
  surface: '#FFFFFF',
  surfaceVariant: '#E8EDF2',
  text: '#1A1D21',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  error: '#E53935',
  warning: '#F57C00',
  info: '#1976D2',
  border: '#E0E4EA',
  disabled: '#C4C8CF',
  cardShadow: '#000000',
};

// ─────────────────────────────────────────────────────────
// Dark Theme (Ariel — NERV Operations Console aesthetic)
// Adapted from nerv-ui SKILL.md design tokens
// ─────────────────────────────────────────────────────────
export const APP_COLORS_DARK = {
  primary: '#FF9830',
  primaryLight: '#FFCC50',
  primaryDark: '#C87020',
  primaryContainer: '#2A2018',
  accent: '#50FF50',
  success: '#50FF50',
  background: '#000000',
  surface: '#0C0C0A',
  surfaceVariant: '#1A1A18',
  text: '#D8D8D0',
  textSecondary: '#888880',
  textLight: '#585850',
  error: '#FF3030',
  warning: '#FFCC50',
  info: '#20F0FF',
  border: '#2A2A28',
  disabled: '#444440',
  cardShadow: '#000000',
};

export type AppColors = typeof APP_COLORS;

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
