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

// Shadows (neumorphism — maximum depth)
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.30,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 12,
  },
} as const;

// Animation durations (ms)
export const ANIMATION = {
  fast: 150,
  normal: 200,
  slow: 250,
  slower: 350,
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
