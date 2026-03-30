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
     Config (config.js)
     ===================== */
  function applyConfig() {
    const cfg = window.SiteConfig;
    if (!cfg) return;

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

    // ── Numéro de téléphone ─────────────────────────────────────
    // Met à jour le href de tous les liens tel:
    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
      a.href = 'tel:' + cfg.phoneE164;
    });
    // Remplace le texte affiché dans les spans .cfg-phone
    document.querySelectorAll('.cfg-phone').forEach(el => {
      el.textContent = cfg.phone;
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
     Init
     ===================== */
  document.addEventListener('DOMContentLoaded', () => {
    applyConfig();
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
