(function () {
  'use strict';

  var APP_NAME = 'Clermont-nuisibles (admin)';

  function upsertMeta(name, content) {
    var el = document.querySelector('meta[name="' + name + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  // Harmonise le nom affiché (Chrome/Edge) et iOS (Add to Home Screen)
  upsertMeta('application-name', APP_NAME);
  upsertMeta('apple-mobile-web-app-title', APP_NAME);

  // Si le titre est générique, on le met au nom PWA
  if (!document.title || /^Administration\b/i.test(document.title)) {
    document.title = APP_NAME;
  }

  // Enregistrer le service worker (PWA)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();

