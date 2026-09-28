// ─────────────────────────────────────────────────────────
// VetCloud Design System — Tokens
// ─────────────────────────────────────────────────────────

// Spacing (4px grid)
export const SPACING = {
  '2xs': 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

// Border Radius — Cards use 16-20px (lg=18), buttons 10px (md), badges pill (full)
export const RADIUS = {
  none: 0,
  sm: 8,
  md: 10,
  lg: 18,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// Typography
export const TYPOGRAPHY = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  sizes: {
    xs: 11,
    sm: 13,
    md: 14,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    regular: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.6,
    relaxed: 1.8,
  },
  tracking: {
    tight: -0.01,
    normal: 0,
    wide: 0.02,
    wider: 0.06,
  },
} as const;

// Shadows — soft, warm-ink, low opacity. Elevation is declared once
// (shadow OR border), never a hard drop shadow under a bordered card.
const INK = '#1B1606';
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: INK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: INK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: INK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: INK,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 28,
    elevation: 8,
  },
  xl: {
    shadowColor: INK,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.14,
    shadowRadius: 40,
    elevation: 12,
  },
} as const;

// Animation durations (ms)
export const ANIMATION = {
  fast: 120,
  normal: 180,
  slow: 220,
  slower: 250,
} as const;

// Z-index layers
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
  tooltip: 700,
} as const;

// Breakpoints (for responsive design)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Overlay colors for modals and overlays
export const OVERLAY = {
  light: 'rgba(0, 0, 0, 0.4)',
  dark: 'rgba(0, 0, 0, 0.6)',
} as const;

// Chart palette for reportes (ordered for visual distinction)
export const CHART_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC407A', // pink
  '#06B6D4', // cyan
  '#8D6E63', // brown
] as const;

// Alpha helper — returns rgba string from hex + opacity
export function alpha(hex: string, opacity: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
