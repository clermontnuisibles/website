# Clermont Nuisibles — Site web

Site vitrine pour **Clermont Nuisibles**, auto-entrepreneur spécialisé en dératisation, désinsectisation et désinfection à Clermont-Ferrand (Puy-de-Dôme, 63).

## Structure du projet

```
clermont-nuisibles-public/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← Déploiement automatique GitHub Pages
├── src/                        ← Sources du site web
│   ├── css/
│   │   └── style.css           ← Styles globaux (responsive, design system)
│   ├── images/
│   │   ├── icons.svg           ← Sprite SVG (icônes UI + nuisibles)
│   │   └── logo-icon.svg       ← Logo / favicon
│   ├── js/
│   │   ├── config.js           ← ⚙️ CONFIGURATION (téléphone, e-mail, options)
│   │   └── main.js             ← JavaScript (menu, cookies, FAQ, compteurs)
│   ├── index.html              ← Page d'accueil
│   ├── services.html           ← Détail de tous les services
│   ├── tarifs.html             ← Grilles de tarifs + FAQ
│   ├── avis.html               ← Avis et témoignages clients
│   ├── a-propos.html           ← À propos / E-E-A-T (GEO)
│   ├── contact.html            ← Formulaire de contact et devis
│   ├── mentions-legales.html   ← Mentions légales (LCEN)
│   ├── politique-confidentialite.html  ← Politique RGPD
│   ├── cookies.html            ← Politique de cookies (CNIL)
│   ├── robots.txt              ← Directives pour les moteurs de recherche
│   ├── sitemap.xml             ← Plan du site pour le SEO
│   └── .nojekyll               ← Désactive le traitement Jekyll
└── docs/
    ├── base.md                 ← Cahier des charges initial
    └── obligation.md           ← Obligations légales
```

## Configuration avant mise en ligne

**Tout se passe dans `src/js/config.js`** — c'est le seul fichier à modifier pour personnaliser le template :

```js
window.SiteConfig = {
  phone:       '07 XX XX XX XX',          // numéro affiché sur le site
  phoneE164:   '+33700000000',            // format href="tel:…"
  email:       'contact@mon-domaine.fr',  // adresse e-mail

  siret:        'XXX XXX XXX XXXXX',      // SIRET — pieds de page + mentions légales
  ownerName:    '[Prénom NOM]',           // nom du gérant — mentions légales
  ownerAddress: '[Adresse complète, Clermont-Ferrand (63000)]', // adresse — mentions légales

  formspreeId: 'YOUR_FORM_ID',           // ID Formspree — action du formulaire de contact
  siteUrl:     'https://www.mon-domaine.fr', // URL de base (sans slash final)

  showReviews: false, // true = section Avis visible (mettre à true quand vous avez de vrais avis)
};
```

Les valeurs sont propagées automatiquement sur toutes les pages au chargement, y compris dans le sitemap.xml lors du déploiement.

## Déploiement

Deux workflows GitHub Actions sont disponibles selon votre hébergement.

---

### Option A — GitHub Pages + domaine personnalisé Hostinger (recommandé)

Gratuit, zéro serveur à gérer. Le site est hébergé sur GitHub Pages et le domaine `clermont-nuisibles.fr` pointe dessus via DNS.

**1. Configurer le DNS sur Hostinger (hPanel → Domaines → DNS Zone)**

Supprimer les enregistrements A existants pour `@` et `www`, puis ajouter :

| Type  | Nom  | Valeur              | TTL  |
|-------|------|---------------------|------|
| A     | @    | 185.199.108.153     | 3600 |
| A     | @    | 185.199.109.153     | 3600 |
| A     | @    | 185.199.110.153     | 3600 |
| A     | @    | 185.199.111.153     | 3600 |
| CNAME | www  | clermontnuisibles.github.io | 3600 |

**2. Activer GitHub Pages sur le dépôt**

1. **Settings → Pages → Source : GitHub Actions**
2. **Settings → Pages → Custom domain** : saisir `clermont-nuisibles.fr` → Save
3. Cocher **Enforce HTTPS** (disponible après propagation DNS, ~24 h)

Le fichier `src/CNAME` (déjà présent dans le dépôt) transmet le domaine à GitHub Pages automatiquement à chaque déploiement.

**3. Pousser sur `main`** — le workflow `.github/workflows/deploy.yml` se déclenche.

---

### Option B — Déploiement FTP vers l'hébergement Hostinger

Si vous utilisez l'hébergement mutualisé Hostinger (hPanel), le workflow `.github/workflows/deploy-hostinger.yml` dépose les fichiers via FTP à chaque push sur `main`.

**1. Récupérer les identifiants FTP sur Hostinger**

hPanel → Hébergement → **Gestionnaire de fichiers / FTP** → noter :
- Hôte FTP (ex. : `ftp.clermont-nuisibles.fr` ou IP du serveur)
- Nom d'utilisateur FTP
- Mot de passe FTP

**2. Ajouter les secrets dans GitHub**

**Settings → Secrets and variables → Actions → New repository secret** :

| Nom du secret  | Valeur                          |
|----------------|---------------------------------|
| `FTP_HOST`     | Hôte FTP Hostinger              |
| `FTP_USER`     | Nom d'utilisateur FTP           |
| `FTP_PASSWORD` | Mot de passe FTP                |

**3. Pousser sur `main`** — le workflow se déclenche et synchronise `src/` vers `public_html/`.

## Développement local

Lancer avec VS Code **Run & Debug** → `Clermont Nuisibles — Simple Browser`  
(démarre un serveur Python sur `localhost:8080` et ouvre le Simple Browser automatiquement)

Ou manuellement :
```bash
cd src
python3 -m http.server 8080
```

## Fonctionnalités

- **Design responsive** — Mobile, tablette et desktop
- **Icônes SVG** — Sprite dédié (`images/icons.svg`), sans emoji, sans dépendance externe
- **Logo / favicon SVG** — Identité visuelle dédiée
- **SEO optimisé** — Balises meta, Schema.org LocalBusiness, sitemap, robots.txt
- **RGPD conforme** — Bandeau cookies CNIL, politique de confidentialité, consentement formulaire
- **Call-to-action fort** — Bouton d'appel flottant, visible partout
- **Section Avis masquable** — Paramètre `showReviews` dans `config.js`
- **Performance** — HTML/CSS/JS pur, sans framework, chargement rapide
- **Accessibilité** — Attributs ARIA, structure sémantique, focus visible
- **FAQ accordéon** — Page tarifs avec FAQ interactive
- **Compteurs animés** — Section statistiques avec animation au scroll

## Technologies

- HTML5 sémantique
- CSS3 (custom properties, grid, flexbox)
- JavaScript vanilla (ES6+)
- GitHub Actions pour le CI/CD
- GitHub Pages pour l'hébergement
- Formspree pour le formulaire de contact (service externe gratuit)
