// Post-build step for the web export: makes dist/index.html installable (PWA).
// Expo's "single" output ignores app/+html.tsx, so the manifest link, theme colour, iOS tags and the
// service worker registration are injected here. Idempotent: running it twice changes nothing.
//   npx expo export --platform web && node scripts/inject-pwa.js
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'dist', 'index.html');
if (!fs.existsSync(file)) {
  console.error('dist/index.html no existe: corre primero `npx expo export --platform web`');
  process.exit(1);
}

let html = fs.readFileSync(file, 'utf8');
if (html.includes('rel="manifest"')) {
  console.log('PWA ya inyectada, nada que hacer');
  process.exit(0);
}

const head = [
  '<meta name="description" content="Ficha clínica veterinaria para perros y gatos, hecha en Chile" />',
  '<link rel="manifest" href="/manifest.webmanifest" />',
  '<meta name="theme-color" content="#0B1D3A" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-title" content="Vet Avalon" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
  '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />',
].join('\n    ');

const sw = "<script>if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); }); }</script>";

html = html
  .replace('<html lang="en">', '<html lang="es-CL">')
  // viewport-fit=cover lets the app use the full screen on phones with a notch
  .replace('shrink-to-fit=no"', 'shrink-to-fit=no, viewport-fit=cover"')
  .replace('</head>', `  ${head}\n  </head>`)
  .replace('</body>', `  ${sw}\n  </body>`);

if (!html.includes('rel="manifest"') || !html.includes('serviceWorker')) {
  console.error('No se pudo inyectar la PWA: la plantilla de index.html cambió');
  process.exit(1);
}
fs.writeFileSync(file, html);
console.log('PWA inyectada en dist/index.html');
