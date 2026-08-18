const CACHE_NAME = 'rifat-portfolio-v34.9';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css?v=34.9',
  './script.js?v=34.9',
  './proof-flow-layer.js?v=34.9',
  './startup-recovery.js?v=34.9',
  './Rifat-MD-Resume.pdf',
  './header-mr-logo.png',
  './stack-constellation.webp',
  './favicon.svg',
  './site.webmanifest',
  './robots.txt',
  './sitemap.xml',
  './project-mri-vault-relatable.webp',
  './project-deepseek-telegram-relatable.webp',
  './project-portfolio-relatable.webp',
  './rifat-profile-original.jpg',
  './rifat-social-share-banner.jpg',
  './rifat-social-share-banner.png',
  './feed.xml',
  './content-releases.json',
  './resume.html',
  './ai-feature-map-v24.md',
  './contact-qr.png'
];

const cacheResponse = async (request, response) => {
  if (response && response.ok) {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
  }
  return response;
};

const fetchWithTimeout = async (request, ms = 4500) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(CORE_ASSETS.map(asset => cache.add(asset))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  const isNavigation = request.mode === 'navigate' || request.destination === 'document';
  const isCodeOrStyle = ['script', 'style', 'manifest'].includes(request.destination);

  if (isNavigation) {
    event.respondWith((async () => {
      const cached = await caches.match(request) || await caches.match('./index.html');
      try {
        return await cacheResponse(request, await fetchWithTimeout(request, 4500));
      } catch {
        return cached || new Response('<!doctype html><title>Rifat Portfolio</title><p>Preview is temporarily unavailable. Please refresh.</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  if (isCodeOrStyle) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        return await cacheResponse(request, await fetchWithTimeout(request, 4500));
      } catch {
        return new Response('', { status: 503, statusText: 'Asset temporarily unavailable' });
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => cacheResponse(request, response)))
      .catch(() => caches.match('./index.html'))
  );
});
