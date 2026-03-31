// Service Worker – Clermont Nuisibles Admin
// Stratégie : Cache-first pour les assets statiques, Network-only pour les APIs externes.
var CACHE_NAME = 'cn-admin-v2';

var PRECACHE_URLS = [
  // Pages admin
  '/admin/',
  '/admin/index.html',
  '/admin/agenda.html',
  '/admin/alertes-certifications.html',
  '/admin/avis-google.html',
  '/admin/calculateur-dosage.html',
  '/admin/devis.html',
  '/admin/modeles-messages.html',
  '/admin/rapport.html',
  '/admin/registre-traitements.html',
  '/admin/sauvegarde.html',
  '/admin/stock-biocides.html',
  '/admin/suivi-clients.html',
  '/admin/vcard.html',
  // Assets
  '/fonts/inter.css',
  '/js/config.js',
  '/js/qrcode.min.js',
  '/images/logo-icon.svg',
  '/admin/icons/icon-192.png',
  '/admin/icons/icon-512.png',
  '/admin/manifest.json',
  '/admin/admin-shell.css',
  '/admin/admin-nav.js',
  '/admin/pwa.js'
];

// Domaines externes — jamais mis en cache (OAuth, Google APIs…)
var NETWORK_ONLY_ORIGINS = [
  'accounts.google.com',
  'googleapis.com',
  'gstatic.com',
  'calendar.google.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

/* ── Install : pré-cache ── */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // addAll s'arrête sur la première erreur — on utilise une boucle tolérante.
      return Promise.all(
        PRECACHE_URLS.map(function(url) {
          return cache.add(url).catch(function() {
            console.warn('[SW] Impossible de mettre en cache :', url);
          });
        })
      );
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* ── Activate : purge des anciens caches ── */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* ── Fetch ── */
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // 1. Non-GET → réseau uniquement
  if (event.request.method !== 'GET') return;

  // 2. Origines externes → réseau uniquement (Google Drive, OAuth, Calendar…)
  var isExternal = NETWORK_ONLY_ORIGINS.some(function(origin) {
    return url.hostname === origin || url.hostname.endsWith('.' + origin);
  });
  if (isExternal || url.origin !== self.location.origin) return;

  // 3. Même origine → Cache-first, fallback réseau
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;

      return fetch(event.request).then(function(response) {
        // Mettre en cache uniquement les réponses valides
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function() {
        // Hors ligne et pas en cache → page de fallback
        if (url.pathname.startsWith('/admin/') && url.pathname.endsWith('.html')) {
          return caches.match('/admin/index.html');
        }
        return new Response('Hors ligne', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      });
    })
  );
});
