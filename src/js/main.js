/* =======================================
   CLERMONT NUISIBLES — JavaScript principal
   ======================================= */

(function () {
  'use strict';

  /* ---- Utilitaires ---- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

  /* =====================
     Cookies (CNIL)
     ===================== */
  const COOKIE_KEY = 'cn_consent';

  function getCookie(name) {
    return document.cookie.split(';').some(c => c.trim().startsWith(name + '='));
  }

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  }

  function initCookieBanner() {
    if (getCookie(COOKIE_KEY)) return;
    const banner = $('#cookie-banner');
    if (!banner) return;
    banner.classList.add('show');

    $('#cookie-accept')?.addEventListener('click', () => {
      setCookie(COOKIE_KEY, 'accepted', 365);
      banner.classList.remove('show');
    });

    $('#cookie-refuse')?.addEventListener('click', () => {
      setCookie(COOKIE_KEY, 'refused', 365);
      banner.classList.remove('show');
    });
  }

  /* =====================
     Menu mobile
     ===================== */
  function initMobileMenu() {
    const toggle = $('#nav-toggle');
    const links  = $('#nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const isOpen = links.classList.contains('open');
      links.classList.toggle('open');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    // Fermer au clic à l'extérieur
    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Fermer au clic sur un lien
    $$('.nav-link', links).forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* =====================
     Lien actif dans la nav
     ===================== */
  function initActiveNav() {
    const filename = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav-link').forEach(link => {
      const linkFile = (link.getAttribute('href') || '').split('/').pop() || 'index.html';
      if (linkFile === filename || (filename === '' && linkFile === 'index.html')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* =====================
     Effet header au scroll
     ===================== */
  function initHeaderScroll() {
    const header = $('#header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* =====================
     Formulaire de contact
     ===================== */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      // On laisse Formspree gérer la soumission — on valide seulement le RGPD
      const rgpd = $('#rgpd', form);
      if (rgpd && !rgpd.checked) {
        e.preventDefault();
        rgpd.focus();
        const msg = document.createElement('p');
        msg.style.cssText = 'color:#DC2626;font-size:.85rem;margin-top:.5rem;';
        msg.textContent = 'Vous devez accepter la politique de confidentialité pour envoyer votre message.';
        if (!form.querySelector('.rgpd-error')) {
          msg.className = 'rgpd-error';
          rgpd.closest('.form-rgpd').after(msg);
          setTimeout(() => msg.remove(), 4000);
        }
        return;
      }

      // Highlight champs vides requis
      let valid = true;
      $$('[required]', form).forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#DC2626';
          field.addEventListener('input', () => (field.style.borderColor = ''), { once: true });
          valid = false;
        }
      });
      if (!valid) { e.preventDefault(); return; }
    });
  }

  /* =====================
     Accordion FAQ
     ===================== */
  function initFaq() {
    $$('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const answer  = btn.nextElementSibling;
        const isOpen  = answer.classList.contains('open');

        // Fermer les autres
        $$('.faq-answer.open').forEach(a => {
          a.classList.remove('open');
          a.previousElementSibling.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          answer.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* =====================
     Défilement fluide ancres
     ===================== */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* =====================
     Compteur animé (stats)
     ===================== */
  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const sign  = el.dataset.sign || '';
        let current = 0;
        const step  = Math.ceil(target / 60);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current + sign;
          if (current >= target) clearInterval(timer);
        }, 20);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => obs.observe(el));
  }

  /* =====================
     Avis Google (API Places — données dynamiques)
     ===================== */
  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function starsFromRating(rating) {
    const r = Math.round(Number(rating) || 0);
    const n = Math.max(0, Math.min(5, r));
    return `${'★'.repeat(n)}${'☆'.repeat(5 - n)}`;
  }

  function initialsFromName(name) {
    const s = String(name || '?').trim();
    if (!s) return '?';
    const parts = s.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return s[0].toUpperCase();
  }

  function isUsablePlaceSnapshot(d) {
    if (!d || typeof d !== 'object') return false;
    if (d.rating != null && !Number.isNaN(Number(d.rating))) return true;
    if (d.userRatingCount != null && Number(d.userRatingCount) > 0) return true;
    if (Array.isArray(d.reviews) && d.reviews.length > 0) return true;
    return false;
  }

  async function tryLoadPlaceSnapshot(snapshotUrl) {
    const u = (snapshotUrl && String(snapshotUrl).trim()) || '';
    if (!u) return null;
    try {
      const res = await fetch(u, { credentials: 'omit', cache: 'default' });
      if (!res.ok) return null;
      const data = await res.json();
      return isUsablePlaceSnapshot(data) ? data : null;
    } catch (_) {
      return null;
    }
  }

  async function fetchGooglePlaceDetails(placeId, apiKey, proxyBaseUrl) {
    const proxy = (proxyBaseUrl && String(proxyBaseUrl).trim()) || '';
    if (proxy) {
      const u = new URL(proxy, window.location.href);
      u.searchParams.set('placeId', placeId);
      const res = await fetch(u.toString(), { credentials: 'omit' });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || res.statusText);
      }
      return res.json();
    }
    const key = (apiKey && String(apiKey).trim()) || '';
    if (!key) throw new Error('Missing API key or proxy URL');
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    const res = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews'
      }
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(errBody || res.statusText);
    }
    return res.json();
  }

  function truncateExcerpt(text, maxLen) {
    const t = String(text || '').trim();
    if (!maxLen || maxLen <= 0 || t.length <= maxLen) return t;
    return t.slice(0, maxLen).trim().replace(/\s+\S*$/, '') + '…';
  }

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  /** Avis avec note supérieure ou égale à 4 étoiles (4 ★, 4,5 ★, 5 ★…). */
  function filterReviewsAtLeastFourStars(reviews) {
    return (reviews || []).filter(r => {
      const x = Number(r.rating);
      return !Number.isNaN(x) && x >= 4;
    });
  }

  function buildReviewCardEl(review, excerptMaxLen) {
    const rating = review.rating != null ? Number(review.rating) : 0;
    let text = review.text && review.text.text ? review.text.text : '';
    if (excerptMaxLen) text = truncateExcerpt(text, excerptMaxLen);
    const author =
      review.authorAttribution && review.authorAttribution.displayName
        ? review.authorAttribution.displayName
        : 'Client Google';
    const when = review.relativePublishTimeDescription || '';
    const article = document.createElement('article');
    article.className = 'review-card';
    article.innerHTML = `
      <div class="review-stars" aria-label="${rating} étoiles sur 5">${starsFromRating(rating)}</div>
      <p class="review-text">« ${escapeHtml(text)} »</p>
      <div class="review-author">
        <div class="review-avatar" aria-hidden="true">${escapeHtml(initialsFromName(author))}</div>
        <div>
          <div class="review-name">${escapeHtml(author)}</div>
          <div class="review-date">${escapeHtml(when)}</div>
        </div>
      </div>`;
    return article;
  }

  /**
   * Répartition par étoiles à partir du tableau `reviews` affiché.
   * places_api : échantillon limité (~5). google_business_profile : liste synchronisée côté CI.
   */
  function updateRatingDistributionBars(reviews, userRatingCount, reviewsSource) {
    const stars = [5, 4, 3, 2, 1];
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    (reviews || []).forEach(r => {
      const x = Number(r.rating);
      if (Number.isNaN(x)) return;
      const b = Math.min(5, Math.max(1, Math.round(x)));
      counts[b]++;
    });
    const n = (reviews || []).length;
    stars.forEach(star => {
      const pct = n ? Math.round((100 * counts[star]) / n) : 0;
      const fill = document.getElementById('gr-dist-fill-' + star);
      const lab = document.getElementById('gr-dist-pct-' + star);
      if (fill) fill.style.width = pct + '%';
      if (lab) lab.textContent = pct + '%';
    });
    const hint = document.getElementById('gr-dist-hint');
    if (hint) {
      hint.hidden = false;
      if (n > 0) {
        if (reviewsSource === 'google_business_profile') {
          const extra =
            userRatingCount != null && userRatingCount > n
              ? ` (${userRatingCount} avis au total sur la fiche ; ${n} dans ce fichier).`
              : '';
          hint.textContent =
            'Répartition calculée sur les ' + n + ' avis synchronisés (Google Business Profile).' + extra;
        } else {
          const total =
            userRatingCount != null && userRatingCount > n
              ? ` Les ${userRatingCount} avis au total ne sont pas tous listés ici.`
              : '';
          hint.textContent =
            'Pourcentages calculés sur les ' +
            n +
            ' avis récents renvoyés par Google (maximum ~5 par requête Places), et non sur la répartition complète de la fiche.' +
            total +
            ' Détail sur Google Maps.';
        }
      } else {
        hint.textContent =
          'Aucun avis avec note dans les données chargées. Ouvrez la fiche Google pour la répartition complète.';
      }
    }
  }

  function updateJsonLdAggregateRating(ratingValue, reviewCount) {
    const el = document.getElementById('json-ld-business');
    if (!el || ratingValue == null) return;
    try {
      const data = JSON.parse(el.textContent);
      data.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: Number(ratingValue),
        reviewCount: Number(reviewCount) || 0,
        bestRating: 5,
        worstRating: 1
      };
      el.textContent = JSON.stringify(data, null, 4);
    } catch (_) { /* ignore */ }
  }

  const HOME_REVIEWS_COUNT = 6;
  const HOME_REVIEW_EXCERPT_MAX = 220;

  function renderReviewsInto(container, reviews, max, excerptMaxLen) {
    container.innerHTML = '';
    const list = (reviews || []).slice(0, max);
    if (!list.length) {
      const p = document.createElement('p');
      p.className = 'u-text-muted u-text-sm';
      p.style.cssText = 'grid-column:1/-1;text-align:center;padding:2rem;';
      p.textContent =
        'Aucun avis récent avec texte disponible via Google pour le moment.';
      container.appendChild(p);
      return;
    }
    list.forEach(r => container.appendChild(buildReviewCardEl(r, excerptMaxLen)));
  }

  /** Accueil : 5 extraits aléatoires parmi les avis ≥ 4 ★. */
  function renderHomeGoogleReviews(container, allReviews) {
    const pool = filterReviewsAtLeastFourStars(allReviews);
    if (!pool.length) {
      container.innerHTML =
        '<p class="u-text-muted u-text-sm" style="grid-column:1/-1;text-align:center;padding:2rem;">' +
        'Aucun avis avec une note d’au moins 4 étoiles parmi les avis récents renvoyés par Google.' +
        '</p>';
      return;
    }
    const picked = shuffleArray(pool).slice(0, HOME_REVIEWS_COUNT);
    renderReviewsInto(container, picked, HOME_REVIEWS_COUNT, HOME_REVIEW_EXCERPT_MAX);
  }

  async function initGoogleReviews() {
    const cfg = window.SiteConfig;
    if (!cfg || !cfg.showReviews) return;

    const placeId = (cfg.googlePlaceId && String(cfg.googlePlaceId).trim()) || '';
    const proxyUrl = (cfg.googlePlacesProxyUrl && String(cfg.googlePlacesProxyUrl).trim()) || '';
    const apiKey = (cfg.googlePlacesApiKey && String(cfg.googlePlacesApiKey).trim()) || '';
    const snapshotUrl = (cfg.googlePlacesSnapshotUrl && String(cfg.googlePlacesSnapshotUrl).trim()) || '';
    const canFetchApi = Boolean(placeId && (proxyUrl || apiKey));
    const canTrySnapshot = Boolean(snapshotUrl);

    if (!canTrySnapshot && !canFetchApi) return;

    const sectionAvis = document.getElementById('avis');
    if (sectionAvis && sectionAvis.hidden) return;

    const homeEl = document.getElementById('google-reviews-home');
    const gridEl = document.getElementById('google-reviews-grid');
    if (!homeEl && !gridEl) return;

    const homeFallback = homeEl ? homeEl.innerHTML : '';
    const gridFallback = gridEl ? gridEl.innerHTML : '';

    const loadingHtml =
      '<p class="u-text-muted u-text-sm google-reviews-loading" style="grid-column:1/-1;text-align:center;padding:2rem;">Chargement des avis Google…</p>';
    if (homeEl) homeEl.innerHTML = loadingHtml;
    if (gridEl) gridEl.innerHTML = loadingHtml;

    const scoreBox = document.getElementById('gr-score-box');
    if (scoreBox && document.documentElement.classList.contains('gr-places-pending')) {
      scoreBox.setAttribute('aria-busy', 'true');
    }

    let data = null;
    if (canTrySnapshot) {
      data = await tryLoadPlaceSnapshot(snapshotUrl);
    }
    if (!data && canFetchApi) {
      try {
        data = await fetchGooglePlaceDetails(placeId, apiKey, proxyUrl);
      } catch (_) {
        if (homeEl) homeEl.innerHTML = homeFallback;
        if (gridEl) gridEl.innerHTML = gridFallback;
        document.documentElement.classList.remove('gr-places-pending');
        if (scoreBox) scoreBox.setAttribute('aria-busy', 'false');
        return;
      }
    }
    if (!data) {
      if (homeEl) homeEl.innerHTML = homeFallback;
      if (gridEl) gridEl.innerHTML = gridFallback;
      document.documentElement.classList.remove('gr-places-pending');
      if (scoreBox) scoreBox.setAttribute('aria-busy', 'false');
      return;
    }

    document.documentElement.classList.remove('gr-places-pending');
    if (scoreBox) scoreBox.setAttribute('aria-busy', 'false');

    const reviews = Array.isArray(data.reviews) ? data.reviews : [];
    const rating = data.rating != null ? Number(data.rating) : null;
    const count = data.userRatingCount != null ? Number(data.userRatingCount) : null;
    const reviewsSource =
      data.reviewsSource === 'google_business_profile' ? 'google_business_profile' : 'places_api';

    const grScore = document.getElementById('gr-score');
    const grStars = document.getElementById('gr-stars');
    const grSubtitle = document.getElementById('gr-subtitle');
    const grDist = document.getElementById('gr-distribution');
    const grStaticNote = document.getElementById('gr-static-note');
    const grGoogleNote = document.getElementById('gr-google-note');
    const grGoogleLink = document.getElementById('gr-google-link');

    if (grScore && rating != null) {
      const label = rating.toLocaleString('fr-FR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      });
      grScore.textContent = label;
      grScore.setAttribute('aria-label', `${label} sur 5`);
    }
    if (grStars && rating != null) {
      grStars.textContent = starsFromRating(Math.round(rating));
    }
    if (grSubtitle && count != null) {
      grSubtitle.textContent = `Basée sur ${count} avis Google`;
    }
    if (grDist) {
      grDist.hidden = false;
      updateRatingDistributionBars(reviews, count, reviewsSource);
    }
    if (grStaticNote) grStaticNote.hidden = true;
    if (grGoogleNote && grGoogleLink && cfg.googleReviewUrl) {
      grGoogleLink.href = cfg.googleReviewUrl;
      grGoogleNote.hidden = false;
    }

    if (homeEl) renderHomeGoogleReviews(homeEl, reviews);
    if (gridEl) renderReviewsInto(gridEl, reviews, reviews.length, null);

    if (rating != null && count != null) {
      updateJsonLdAggregateRating(rating, count);
    }
  }

  /* =====================
     Config (config.js)
     ===================== */
  function applyConfig() {
    const cfg = window.SiteConfig;
    if (!cfg) return;

    // ── Google Tag Manager (injecté via config) ──────────────────
    if (cfg.gtmId && typeof cfg.gtmId === 'string') {
      const gtmId = cfg.gtmId.trim();
      if (gtmId && !document.getElementById('gtm-script')) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

        const s = document.createElement('script');
        s.id = 'gtm-script';
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(gtmId);

        // Insérer le plus tôt possible dans le <head>
        (document.head || document.documentElement).appendChild(s);

        // Iframe noscript "équivalent" (utile notamment si un outil vérifie sa présence)
        if (!document.getElementById('gtm-noscript')) {
          const ns = document.createElement('noscript');
          ns.id = 'gtm-noscript';
          ns.innerHTML =
            '<iframe src="https://www.googletagmanager.com/ns.html?id=' +
            gtmId +
            '" height="0" width="0" style="display:none;visibility:hidden"></iframe>';
          document.body.insertBefore(ns, document.body.firstChild);
        }
      }
    }

    // ── Google Analytics 4 (gtag) ────────────────────────────────
    if (cfg.googleAnalyticsId && typeof cfg.googleAnalyticsId === 'string') {
      const gaId = cfg.googleAnalyticsId.trim();
      if (gaId && !document.getElementById('ga4-gtag-script')) {
        window.dataLayer = window.dataLayer || [];
        if (typeof window.gtag !== 'function') {
          window.gtag = function () { window.dataLayer.push(arguments); };
        }
        window.gtag('js', new Date());
        window.gtag('config', gaId);

        const g = document.createElement('script');
        g.id = 'ga4-gtag-script';
        g.async = true;
        g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
        (document.head || document.documentElement).appendChild(g);
      }
    }

    // ── JSON-LD Schema.org (index.html) ──────────────────────────
    const jsonLdScript = document.getElementById('json-ld-business');
    if (jsonLdScript) {
      try {
        const data = JSON.parse(jsonLdScript.textContent);
        if (cfg.phoneE164) data.telephone = cfg.phoneE164;
        if (cfg.email)     data.email     = cfg.email;
        if (cfg.siteUrl)   data.url        = cfg.siteUrl;
        if (cfg.rating) {
          data.aggregateRating = {
            '@type': 'AggregateRating',
            'ratingValue': cfg.rating.value,
            'reviewCount': cfg.rating.count,
            'bestRating': 5,
            'worstRating': 1
          };
        }
        jsonLdScript.textContent = JSON.stringify(data, null, 4);
      } catch (_) { /* JSON malformé — on ne plante pas */ }
    }

    // ── JSON-LD Personne (a-propos.html) ─────────────────────────
    const jsonLdAbout = document.getElementById('json-ld-about');
    if (jsonLdAbout) {
      try {
        const data = JSON.parse(jsonLdAbout.textContent);
        if (cfg.ownerName) data.name = cfg.ownerName;
        if (cfg.siteUrl)   data.worksFor.url = cfg.siteUrl;
        jsonLdAbout.textContent = JSON.stringify(data, null, 4);
      } catch (_) { }
    }

    // ── Balise canonical ─────────────────────────────────────────
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink && cfg.siteUrl) {
      try {
        const path = new URL(canonicalLink.href).pathname;
        canonicalLink.href = cfg.siteUrl + path;
      } catch (_) { }
    }

    // ── Open Graph (og:url, og:image) ────────────────────────────
    if (cfg.siteUrl) {
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) {
        try {
          const canonicalPath = canonicalLink ? new URL(canonicalLink.href).pathname : window.location.pathname;
          ogUrl.setAttribute('content', cfg.siteUrl + canonicalPath);
        } catch (_) {
          ogUrl.setAttribute('content', cfg.siteUrl + window.location.pathname);
        }
      }

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && !ogImage.getAttribute('content')) {
        ogImage.setAttribute('content', cfg.siteUrl + '/images/og-image.svg');
      }

      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage && !twitterImage.getAttribute('content')) {
        twitterImage.setAttribute('content', cfg.siteUrl + '/images/og-image.svg');
      }
    }

    // ── Numéro de téléphone ─────────────────────────────────────
    // Met à jour le href de tous les liens tel:
    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
      a.href = 'tel:' + cfg.phoneE164;
    });
    // Remplace le texte affiché dans les spans .cfg-phone
    document.querySelectorAll('.cfg-phone').forEach(el => {
      el.textContent = cfg.phone;
    });

    // ── Réservation Google (prise de RDV) ─────────────────────────
    const bookingUrl = (cfg.googleBookingUrl && String(cfg.googleBookingUrl).trim()) || '';
    document.querySelectorAll('a.cfg-booking').forEach(a => {
      if (bookingUrl) {
        a.href = bookingUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      } else {
        const span = document.createElement('span');
        const cls = (a.getAttribute('class') || '').replace(/\bcfg-booking\b/g, '').replace(/\s+/g, ' ').trim();
        if (cls) span.setAttribute('class', cls);
        while (a.firstChild) span.appendChild(a.firstChild);
        a.parentNode.replaceChild(span, a);
      }
    });

    // ── Adresse e-mail ────────────────────────────────────────────
    // Met à jour le href de tous les liens mailto:
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      a.href = 'mailto:' + cfg.email;
    });
    // Remplace le texte affiché dans les spans .cfg-email
    document.querySelectorAll('.cfg-email').forEach(el => {
      el.textContent = cfg.email;
    });

    // ── Identité légale ───────────────────────────────────────────
    if (cfg.siret) {
      document.querySelectorAll('.cfg-siret').forEach(el => {
        el.textContent = cfg.siret;
      });
    }
    if (cfg.ownerName) {
      document.querySelectorAll('.cfg-owner-name').forEach(el => {
        el.textContent = cfg.ownerName;
      });
    }
    if (cfg.ownerAddress) {
      document.querySelectorAll('.cfg-owner-address').forEach(el => {
        el.textContent = cfg.ownerAddress;
      });
    }
    if (cfg.copyrightYear) {
      document.querySelectorAll('.cfg-year').forEach(el => {
        el.textContent = cfg.copyrightYear;
      });
    }

    // ── Formulaire de contact (Formspree) ─────────────────────────
    const contactForm = document.getElementById('contact-form');
    if (contactForm && cfg.formspreeId && cfg.formspreeId !== 'YOUR_FORM_ID') {
      contactForm.action = 'https://formspree.io/f/' + cfg.formspreeId;
    }
    // Redirect après envoi
    if (cfg.siteUrl) {
      const nextInput = contactForm && contactForm.querySelector('input[name="_next"]');
      if (nextInput) {
        nextInput.value = cfg.siteUrl + '/contact.html?sent=1';
      }
    }

    // ── Section Avis clients ────────────────────────────────────
    if (!cfg.showReviews) {
      // Cache la section #avis sur index.html
      const sectionAvis = document.getElementById('avis');
      if (sectionAvis) sectionAvis.hidden = true;

      // Cache les liens de navigation et de pied de page vers avis.html
      document.querySelectorAll('a[href="avis.html"]').forEach(a => {
        const li = a.closest('li');
        (li || a).hidden = true;
      });

      // Sur avis.html : redirige vers l'accueil
      if (window.location.pathname.endsWith('avis.html')) {
        window.location.replace('index.html');
      }
    }
  }

  /* =====================
     Service worker (cache prolongé CSS / JS / SVG — voir /sw.js)
     ===================== */
  function initPublicServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if ((window.location.pathname || '').includes('/admin/')) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  /* =====================
     Init
     ===================== */
  document.addEventListener('DOMContentLoaded', () => {
    applyConfig();
    void initGoogleReviews();
    initPublicServiceWorker();
    initCookieBanner();
    initMobileMenu();
    initActiveNav();
    initHeaderScroll();
    initContactForm();
    initFaq();
    initSmoothScroll();
    initCounters();
  });
})();
