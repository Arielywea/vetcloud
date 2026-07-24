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
  one_piece: {
    label: 'One Piece',
    light: {
      primary: '#E53935', primaryLight: '#FF6F61', primaryDark: '#B71C1C', primaryContainer: '#FFCDD2',
      accent: '#FFB300', success: '#43A047', background: '#FFF8E1', surface: '#FFFFFF', surfaceVariant: '#FFECB3',
      text: '#2D3748', textSecondary: '#5D4037', textLight: '#8D6E63',
      error: '#D32F2F', warning: '#FF8F00', info: '#0277BD', border: '#FFCCBC', disabled: '#D7CCC8', cardShadow: '#000000',
    },
    dark: {
      primary: '#FF5252', primaryLight: '#FF867F', primaryDark: '#C62828', primaryContainer: '#3E1A1A',
      accent: '#FFD54F', success: '#66BB6A', background: '#0D1B2A', surface: '#1B2838', surfaceVariant: '#243447',
      text: '#E0E0E0', textSecondary: '#90A4AE', textLight: '#546E7A',
      error: '#FF5252', warning: '#FFB74D', info: '#4FC3F7', border: '#37474F', disabled: '#455A64', cardShadow: '#000000',
    },
  },
  gurren: {
    label: 'Gurren Lagann',
    light: {
      primary: '#D32F2F', primaryLight: '#FF5252', primaryDark: '#B71C1C', primaryContainer: '#FFCDD2',
      accent: '#00BCD4', success: '#4CAF50', background: '#FAFAFA', surface: '#FFFFFF', surfaceVariant: '#FFEBEE',
      text: '#2D3748', textSecondary: '#424242', textLight: '#757575',
      error: '#C62828', warning: '#FF6F00', info: '#0097A7', border: '#E0E0E0', disabled: '#BDBDBD', cardShadow: '#000000',
    },
    dark: {
      primary: '#FF1744', primaryLight: '#FF616F', primaryDark: '#D50000', primaryContainer: '#3B0A0A',
      accent: '#18FFFF', success: '#69F0AE', background: '#0A0A1A', surface: '#1A1A2E', surfaceVariant: '#2A1A3E',
      text: '#ECEFF1', textSecondary: '#B0BEC5', textLight: '#607D8B',
      error: '#FF1744', warning: '#FF9100', info: '#00E5FF', border: '#263238', disabled: '#37474F', cardShadow: '#000000',
    },
  },
  slam_dunk: {
    label: 'Slam Dunk',
    light: {
      primary: '#FF6D00', primaryLight: '#FF9E40', primaryDark: '#E65100', primaryContainer: '#FFE0B2',
      accent: '#2196F3', success: '#4CAF50', background: '#FAFAFA', surface: '#FFFFFF', surfaceVariant: '#FFF3E0',
      text: '#2D3748', textSecondary: '#4E342E', textLight: '#8D6E63',
      error: '#E53935', warning: '#FF8F00', info: '#1565C0', border: '#FFCC80', disabled: '#D7CCC8', cardShadow: '#000000',
    },
    dark: {
      primary: '#FF9100', primaryLight: '#FFB74D', primaryDark: '#E65100', primaryContainer: '#3E2723',
      accent: '#64B5F6', success: '#81C784', background: '#121212', surface: '#1E1E1E', surfaceVariant: '#2C2C2C',
      text: '#EFEBE9', textSecondary: '#BCAAA4', textLight: '#795548',
      error: '#EF5350', warning: '#FFB74D', info: '#42A5F5', border: '#3E2723', disabled: '#4E342E', cardShadow: '#000000',
    },
  },
  dragon_ball: {
    label: 'Dragon Ball Z',
    light: {
      primary: '#FF8F00', primaryLight: '#FFB74D', primaryDark: '#E65100', primaryContainer: '#FFF3E0',
      accent: '#1565C0', success: '#43A047', background: '#FFFDE7', surface: '#FFFFFF', surfaceVariant: '#FFF8E1',
      text: '#2D3748', textSecondary: '#5D4037', textLight: '#8D6E63',
      error: '#E53935', warning: '#FF6F00', info: '#0D47A1', border: '#FFE0B2', disabled: '#D7CCC8', cardShadow: '#000000',
    },
    dark: {
      primary: '#FFB300', primaryLight: '#FFD54F', primaryDark: '#FF8F00', primaryContainer: '#3E2723',
      accent: '#42A5F5', success: '#66BB6A', background: '#0A0A0A', surface: '#1A1400', surfaceVariant: '#2A2000',
      text: '#FFF8E1', textSecondary: '#FFE082', textLight: '#FFA000',
      error: '#EF5350', warning: '#FFD54F', info: '#64B5F6', border: '#3E2723', disabled: '#4E342E', cardShadow: '#000000',
    },
  },
  vinland: {
    label: 'Vinland Saga',
    light: {
      primary: '#5D4037', primaryLight: '#8D6E63', primaryDark: '#3E2723', primaryContainer: '#D7CCC8',
      accent: '#00796B', success: '#43A047', background: '#EFEBE9', surface: '#FFFFFF', surfaceVariant: '#D7CCC8',
      text: '#2D3748', textSecondary: '#4E342E', textLight: '#795548',
      error: '#C62828', warning: '#E65100', info: '#00695C', border: '#BCAAA4', disabled: '#A1887F', cardShadow: '#000000',
    },
    dark: {
      primary: '#A1887F', primaryLight: '#BCAAA4', primaryDark: '#6D4C41', primaryContainer: '#2E1F1A',
      accent: '#4DB6AC', success: '#81C784', background: '#1A1410', surface: '#2A2018', surfaceVariant: '#3E3028',
      text: '#EFEBE9', textSecondary: '#BCAAA4', textLight: '#795548',
      error: '#EF5350', warning: '#FF8A65', info: '#4DB6AC', border: '#4E342E', disabled: '#5D4037', cardShadow: '#000000',
    },
  },
  eighty_six: {
    label: '86',
    light: {
      primary: '#B71C1C', primaryLight: '#E53935', primaryDark: '#7F0000', primaryContainer: '#FFCDD2',
      accent: '#455A64', success: '#43A047', background: '#FAFAFA', surface: '#FFFFFF', surfaceVariant: '#ECEFF1',
      text: '#2D3748', textSecondary: '#546E7A', textLight: '#90A4AE',
      error: '#C62828', warning: '#FF6F00', info: '#37474F', border: '#CFD8DC', disabled: '#B0BEC5', cardShadow: '#000000',
    },
    dark: {
      primary: '#FF5252', primaryLight: '#FF867F', primaryDark: '#C62828', primaryContainer: '#2A1A1A',
      accent: '#78909C', success: '#66BB6A', background: '#121212', surface: '#1E1E1E', surfaceVariant: '#2C2C2C',
      text: '#ECEFF1', textSecondary: '#B0BEC5', textLight: '#607D8B',
      error: '#FF5252', warning: '#FFB74D', info: '#90A4AE', border: '#37474F', disabled: '#455A64', cardShadow: '#000000',
    },
  },
  fate: {
    label: 'Fate Series',
    light: {
      primary: '#C6A040', primaryLight: '#E0C068', primaryDark: '#8B7020', primaryContainer: '#FFF8E1',
      accent: '#1A237E', success: '#2E7D32', background: '#FAFAFA', surface: '#FFFFFF', surfaceVariant: '#FFF8E1',
      text: '#2D3748', textSecondary: '#37474F', textLight: '#78909C',
      error: '#C62828', warning: '#E65100', info: '#1565C0', border: '#E0D8B0', disabled: '#BDBDBD', cardShadow: '#000000',
    },
    dark: {
      primary: '#D4AF37', primaryLight: '#E8CC6E', primaryDark: '#A08520', primaryContainer: '#2A2200',
      accent: '#5C6BC0', success: '#66BB6A', background: '#0D1117', surface: '#161B22', surfaceVariant: '#1C2333',
      text: '#E6EDF3', textSecondary: '#8B949E', textLight: '#484F58',
      error: '#F85149', warning: '#D29922', info: '#58A6FF', border: '#30363D', disabled: '#21262D', cardShadow: '#000000',
    },
  },
  frieren: {
    label: 'Frieren',
    light: {
      primary: '#7E57C2', primaryLight: '#B39DDB', primaryDark: '#512DA8', primaryContainer: '#EDE7F6',
      accent: '#26A69A', success: '#43A047', background: '#F3E5F5', surface: '#FFFFFF', surfaceVariant: '#E8EDF8',
      text: '#2D3748', textSecondary: '#5C6BC0', textLight: '#9FA8DA',
      error: '#E53935', warning: '#FF8F00', info: '#1976D2', border: '#D1C4E9', disabled: '#C5CAE9', cardShadow: '#000000',
    },
    dark: {
      primary: '#B39DDB', primaryLight: '#D1C4E9', primaryDark: '#7E57C2', primaryContainer: '#1A1030',
      accent: '#4DB6AC', success: '#66BB6A', background: '#0E0A1A', surface: '#1A1030', surfaceVariant: '#251A40',
      text: '#EDE7F6', textSecondary: '#B39DDB', textLight: '#7E57C2',
      error: '#EF5350', warning: '#FFB74D', info: '#64B5F6', border: '#311B92', disabled: '#4A148C', cardShadow: '#000000',
    },
  },
  pandora: {
    label: 'Pandora Hearts',
    light: {
      primary: '#880E4F', primaryLight: '#AD1457', primaryDark: '#4A0028', primaryContainer: '#FCE4EC',
      accent: '#00BCD4', success: '#43A047', background: '#FAFAFA', surface: '#FFFFFF', surfaceVariant: '#F3E5F5',
      text: '#2D3748', textSecondary: '#616161', textLight: '#9E9E9E',
      error: '#C62828', warning: '#E65100', info: '#0097A7', border: '#E0E0E0', disabled: '#BDBDBD', cardShadow: '#000000',
    },
    dark: {
      primary: '#F06292', primaryLight: '#F48FB1', primaryDark: '#C2185B', primaryContainer: '#2A0A1A',
      accent: '#4DD0E1', success: '#66BB6A', background: '#0A0A0A', surface: '#1A1A1A', surfaceVariant: '#2A1A2A',
      text: '#FCE4EC', textSecondary: '#F48FB1', textLight: '#AD1457',
      error: '#FF5252', warning: '#FFB74D', info: '#4DD0E1', border: '#3A0A2A', disabled: '#4A0A3A', cardShadow: '#000000',
    },
  },
  saber: {
    label: 'Saber / Artoria',
    light: {
      primary: '#1565C0', primaryLight: '#42A5F5', primaryDark: '#0D47A1', primaryContainer: '#E3F2FD',
      accent: '#FFD54F', success: '#43A047', background: '#F5F5F5', surface: '#FFFFFF', surfaceVariant: '#E8EAF6',
      text: '#1A1A2E', textSecondary: '#455A64', textLight: '#90A4AE',
      error: '#C62828', warning: '#FF8F00', info: '#0277BD', border: '#BBDEFB', disabled: '#B0BEC5', cardShadow: '#000000',
    },
    dark: {
      primary: '#7C4DFF', primaryLight: '#B388FF', primaryDark: '#651FFF', primaryContainer: '#1A0A3E',
      accent: '#FFD740', success: '#69F0AE', background: '#0A0A14', surface: '#12121E', surfaceVariant: '#1A1A2E',
      text: '#E8EAF6', textSecondary: '#9FA8DA', textLight: '#5C6BC0',
      error: '#FF5252', warning: '#FFB74D', info: '#448AFF', border: '#2A2A3E', disabled: '#3A3A4E', cardShadow: '#000000',
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

// ─────────────────────────────────────────────────────────
// Status colors
// ─────────────────────────────────────────────────────────
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
