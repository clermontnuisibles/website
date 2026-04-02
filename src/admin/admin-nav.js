(function () {
  'use strict';

  var SECTIONS = [
    {
      title: 'Principal',
      items: [
        { href: 'index.html', label: 'Tableau de bord', icon: '⌂' }
      ]
    },
    {
      title: 'Communication & avis',
      items: [
        { href: 'avis-google.html', label: 'Avis Google', icon: '⭐' },
        { href: 'vcard.html', label: 'Carte de visite', icon: '📇' },
        { href: 'agenda.html', label: 'Agenda', icon: '📅' },
        { href: 'modeles-messages.html', label: 'Modèles de messages', icon: '📨' },
        { href: 'rappel-plages.html', label: 'Rappel (plages)', icon: '📞' }
      ]
    },
    {
      title: 'Interventions & ventes',
      items: [
        { href: 'rapport.html', label: 'Rapport d’intervention', icon: '📋' },
        { href: 'devis.html', label: 'Devis', icon: '💶' },
        { href: 'calculateur-dosage.html', label: 'Calculateur de dosage', icon: '🧮' }
      ]
    },
    {
      title: 'Suivi & conformité',
      items: [
        { href: 'suivi-clients.html', label: 'Carnet clients', icon: '👥' },
        { href: 'stock-biocides.html', label: 'Stock biocides', icon: '🧪' },
        { href: 'registre-traitements.html', label: 'Registre traitements', icon: '📖' },
        { href: 'alertes-certifications.html', label: 'Alertes certifications', icon: '🔔' }
      ]
    },
    {
      title: 'Données',
      items: [
        { href: 'sauvegarde.html', label: 'Sauvegarde', icon: '💾' }
      ]
    }
  ];

  var PAGE_TITLES = {
    'index.html': 'Accueil',
    'avis-google.html': 'Avis Google',
    'vcard.html': 'Carte de visite',
    'agenda.html': 'Agenda',
    'modeles-messages.html': 'Modèles de messages',
    'rappel-plages.html': 'Rappel (plages)',
    'rapport.html': 'Rapport d’intervention',
    'devis.html': 'Devis',
    'calculateur-dosage.html': 'Calculateur de dosage',
    'suivi-clients.html': 'Carnet clients',
    'stock-biocides.html': 'Stock biocides',
    'registre-traitements.html': 'Registre des traitements',
    'alertes-certifications.html': 'Alertes certifications',
    'sauvegarde.html': 'Sauvegarde'
  };

  function currentFile() {
    var seg = (location.pathname || '').replace(/\/$/, '').split('/').pop();
    if (!seg || seg === 'admin') return 'index.html';
    return seg;
  }

  function topbarPageLabel(active) {
    return PAGE_TITLES[active] || 'Page';
  }

  function buildNavHtml(active) {
    var html = ''
      + '<div class="admin-sidebar-head">'
      + '<a class="admin-sidebar-brand" href="index.html">'
      + '<img src="../images/logo-icon.svg" width="40" height="40" alt="">'
      + '<span class="admin-sidebar-brand-text"><strong>Clermont Nuisibles</strong>'
      + '<span>Administration</span></span>'
      + '</a></div>'
      + '<nav class="admin-sidebar-nav" aria-label="Navigation administration">';

    SECTIONS.forEach(function (sec) {
      html += '<div class="admin-nav-section">';
      html += '<div class="admin-nav-section-title">' + sec.title + '</div>';
      html += '<ul class="admin-nav-list">';
      sec.items.forEach(function (item) {
        var isActive = item.href === active;
        html += '<li><a href="' + item.href + '" class="admin-nav-link'
          + (isActive ? ' is-active' : '') + '"'
          + (isActive ? ' aria-current="page"' : '') + '>';
        html += '<span class="admin-nav-ico" aria-hidden="true">' + item.icon + '</span>';
        html += '<span class="admin-nav-txt">' + item.label + '</span></a></li>';
      });
      html += '</ul></div>';
    });

    html += '</nav>';
    html += '<div class="admin-sidebar-foot">';
    html += '<a class="admin-nav-external" href="../index.html">↗ Site public</a>';
    html += '</div>';
    return html;
  }

  function inject() {
    var active = currentFile();
    document.body.classList.add('admin-nav-ready');
    if (active === 'index.html') document.body.classList.add('admin-page-home');

    var overlay = document.createElement('div');
    overlay.className = 'admin-drawer-overlay';

    var sidebar = document.createElement('aside');
    sidebar.className = 'admin-sidebar';
    sidebar.id = 'admin-sidebar';
    sidebar.setAttribute('aria-label', 'Menu');
    sidebar.innerHTML = buildNavHtml(active);

    var topbar = document.createElement('header');
    topbar.className = 'admin-topbar';
    var pageLbl = topbarPageLabel(active);
    topbar.innerHTML = ''
      + '<button type="button" class="admin-nav-toggle" aria-expanded="false" '
      + 'aria-controls="admin-sidebar" aria-label="Ouvrir ou fermer le menu">'
      + '<span class="admin-nav-toggle-bar"></span>'
      + '<span class="admin-nav-toggle-bar"></span>'
      + '<span class="admin-nav-toggle-bar"></span>'
      + '</button>'
      + '<nav class="admin-topbar-crumb" aria-label="Fil d\'Ariane">'
      + '<a class="admin-crumb-root" href="index.html">Admin</a>'
      + '<span class="admin-crumb-sep" aria-hidden="true">/</span>'
      + '<span class="admin-crumb-current">' + pageLbl + '</span>'
      + '</nav>'
      + '<a class="admin-topbar-public" href="../index.html">'
      + '<span class="admin-topbar-public-icon" aria-hidden="true">↗</span> Site public</a>';

    document.body.insertBefore(overlay, document.body.firstChild);
    document.body.insertBefore(sidebar, document.body.firstChild);
    document.body.insertBefore(topbar, document.body.firstChild);

    var toggle = topbar.querySelector('.admin-nav-toggle');
    var mq = window.matchMedia('(min-width: 900px)');

    function closeDrawer() {
      document.body.classList.remove('admin-drawer-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function openDrawer() {
      document.body.classList.add('admin-drawer-open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function onToggle() {
      if (document.body.classList.contains('admin-drawer-open')) closeDrawer();
      else openDrawer();
    }

    toggle.addEventListener('click', onToggle);
    overlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('admin-drawer-open')) {
        closeDrawer();
      }
    });

    mq.addEventListener('change', function () {
      if (mq.matches) closeDrawer();
    });

    sidebar.addEventListener('click', function (e) {
      if (e.target.closest('a') && !mq.matches) closeDrawer();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
