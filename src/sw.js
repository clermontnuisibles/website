// Service Worker — site public (CSS, JS hors config, SVG)
// Complète le Cache-Control court imposé par GitHub Pages : ressources servies
// depuis le cache navigateur après la 1re visite, avec mise à jour en arrière-plan.
// Incrémentez CACHE_STATIC (ex. v2) pour forcer une réinitialisation du cache statique.
var CACHE_STATIC = 'cn-public-static-v1';

function isStaticAssetUrl(url) {
  var p = url.pathname;
  if (p.startsWith('/admin/')) return false;
  if (p === '/sw.js') return false;
  if (p === '/js/config.js' || p.endsWith('/js/config.js')) return false;
  return /\.(css|js|svg)$/i.test(p);
}

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) {
            return k.startsWith('cn-public-static-') && k !== CACHE_STATIC;
          })
          .map(function (k) {
            return caches.delete(k);
          })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (!isStaticAssetUrl(url)) return;

  event.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (response) {
        if (
          response &&
          response.status === 200 &&
          response.type === 'basic'
        ) {
          var copy = response.clone();
          caches.open(CACHE_STATIC).then(function (cache) {
            cache.put(req, copy);
          });
        }
        return response;
      });

      if (cached) {
        network.catch(function () {});
        return cached;
      }
      return network.catch(function () {
        return cached;
      });
    })
  );
});
