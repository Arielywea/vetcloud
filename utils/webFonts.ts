import { Platform } from 'react-native';

// Web-only type setup.
// - Inter carries the whole UI (labels, data, inputs). react-native-web and
//   react-native-paper each ship their own font stack, which left the app
//   mixing Times, Roboto and the system font; the rule below overrides the
//   base text/input classes so every string renders in one family.
// - Cormorant Garamond is reserved for display titles marked with
//   data-font="display" (see components/ui/DisplayText.tsx).
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap';

const CSS = `
.css-146c3p1, .css-1jxf684, .css-11aywtz, input, textarea, button {
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif !important;
  font-feature-settings: 'cv11', 'ss01';
}
[data-font="display"][data-font], [data-font="display"] * {
  font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif !important;
  font-feature-settings: 'lnum', 'kern';
}
[data-numeric="tabular"] { font-variant-numeric: tabular-nums; }
body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
`;

export function installWebFonts() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById('vc-fonts')) return;

  const head = document.head;
  for (const origin of ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']) {
    const pre = document.createElement('link');
    pre.rel = 'preconnect';
    pre.href = origin;
    if (origin.includes('gstatic')) pre.crossOrigin = 'anonymous';
    head.appendChild(pre);
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONT_HREF;
  head.appendChild(link);

  const style = document.createElement('style');
  style.id = 'vc-fonts';
  style.textContent = CSS;
  head.appendChild(style);
}
