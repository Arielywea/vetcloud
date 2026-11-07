// Service worker de Vet Avalon: hace la app instalable y acelera la carga, sin tocar datos clínicos.
// Solo maneja (1) archivos estáticos con hash (/_expo/static, /assets, /icons): caché primero, y
// (2) la navegación: red primero, con la última página guardada si no hay conexión.
// NUNCA intercepta la API ni nada que no sea GET: los datos siempre vienen de la red.
const VERSION = 'va-v1';
const STATIC_CACHE = `static-${VERSION}`;
const PAGE_CACHE = `pages-${VERSION}`;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE && k !== PAGE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const isStatic = (url) => /^\/(_expo\/static|assets|icons)\//.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (isStatic(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(PAGE_CACHE).then((c) => c.put('/', copy)); }
          return res;
        })
        .catch(async () => (await caches.match('/')) || Response.error())
    );
  }
});
