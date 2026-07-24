// ---------------------------------------------------------
// VetCloud Icon System — Royal Veterinary Icons
// Gold accents + Navy authority + Artoria DNA
// ---------------------------------------------------------

// Icon scale — consistent sizing across the app
export const ICON_SIZES = {
  xxs: 10,    // Inline status dots
  xs: 12,     // Timeline dots, badges
  sm: 14,     // Info pills, field labels
  md: 18,     // Action buttons, nav items
  lg: 24,     // Section headers
  xl: 32,     // Empty states
  '2xl': 48,  // Hero/featured icons
} as const;

// Semantic icon colors — themed, not hardcoded
export const ICON_COLORS = {
  gold: '#C9A227',
  goldLight: '#C9A22730',
  goldMedium: '#C9A22760',
  navy: '#0B1D3A',
  navyLight: '#1E3A5F',
  success: '#10B981',
  error: '#EF4444',
  warning: '#E8930A',
  info: '#3B82F6',
  muted: '#8896A8',
  white: '#FFFFFF',
} as const;

// Record type icon config — themed with gold accent
export const RECORD_TYPE_CONFIG: Record<string, {
  icon: string;
  color: string;
  bgColor: string;
  label: string;
}> = {
  consulta: {
    icon: 'stethoscope',
    color: '#3B82F6',
    bgColor: '#3B82F615',
    label: 'Consulta',
  },
  vacuna: {
    icon: 'needle',
    color: '#10B981',
    bgColor: '#10B98115',
    label: 'Vacuna',
  },
  cirugia: {
    icon: 'scissors-cutting',
    color: '#EF4444',
    bgColor: '#EF444415',
    label: 'Cirugía',
  },
  control: {
    icon: 'clipboard-check',
    color: '#F59E0B',
    bgColor: '#F59E0B15',
    label: 'Control',
  },
};

// Pet species icon config
export const SPECIES_CONFIG: Record<string, { icon: string; label: string }> = {
  dog: { icon: 'dog', label: 'Canino' },
  cat: { icon: 'cat', label: 'Felino' },
};

// Action icon config — gold for primary actions
export const ACTION_CONFIG = {
  edit: { icon: 'pencil', color: '#C9A227' },
  call: { icon: 'phone', color: '#10B981' },
  email: { icon: 'email-outline', color: '#3B82F6' },
  delete: { icon: 'trash-2', color: '#EF4444' },
  view: { icon: 'eye', color: '#0B1D3A' },
  send: { icon: 'send', color: '#C9A227' },
  save: { icon: 'content-save', color: '#C9A227' },
} as const;

// Health status icon config
export const HEALTH_STATUS = {
  active: { icon: 'shield-check', color: '#10B981', label: 'Activo' },
  inactive: { icon: 'shield-off', color: '#8896A8', label: 'Inactivo' },
  critical: { icon: 'alert-circle', color: '#EF4444', label: 'Crítico' },
} as const;