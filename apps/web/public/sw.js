/* Service worker sederhana untuk PWA — cache aset statis, network-first untuk halaman. */
const CACHE_NAME = 'ssb-garuda-v1';
const STATIC_ASSETS = ['/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Jangan cache endpoint API/auth/GraphQL — data harus selalu segar
  if (
    url.pathname.startsWith('/graphql') ||
    url.pathname.startsWith('/v1/auth') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next/data')
  ) {
    return;
  }

  // Aset statis/_next: cache-first
  if (url.pathname.startsWith('/_next/static') || STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
            return res;
          }),
      ),
    );
    return;
  }

  // Halaman: network-first dengan fallback cache (offline)
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('/'))),
  );
});
