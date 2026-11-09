// Estrato: guarda la app en el dispositivo para usarla sin conexión.
// Autor: Renato Efrén González Zúñiga
const CACHE = 'estrato-v1';
const ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icono-180.png', 'icono-192.png', 'icono-512.png', 'icono-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Primero intenta la red (para recibir actualizaciones); sin conexión usa la copia guardada
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copia));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
