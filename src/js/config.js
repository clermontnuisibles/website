window.SiteConfig = {

  /* ── Téléphone ─────────────────────────────────────────────────
     phone    : affiché sur le site (boutons, nav, pied de page…)
     phoneE164: format international pour les liens href="tel:…"  */
  phone:     '07 66 50 29 38',
  phoneE164: '+33766502938',

  /* ── E-mail ─────────────────────────────────────────────────────
     Utilisé dans les liens href="mailto:…" et le texte affiché       */
  /*   email: 'contact@clermont-nuisibles.fr',   */
  email: 'clermontnuisibles@gmaill.com',

  /* ── Identité légale ────────────────────────────────────────────
     siret        : numéro SIRET — pieds de page + mentions légales
     ownerName    : prénom et nom — mentions légales
     ownerAddress : adresse postale complète — mentions légales     */
  siret:        '100 387 190 00018',
  ownerName:    'Evan PENARANDA',
  ownerAddress: '19 Chemin de Prat, Romagnat (63540)',

  /* ── Formulaire de contact ──────────────────────────────────────
     Créez un compte gratuit sur https://formspree.io,
     récupérez votre Form ID (ex. 'xabc1234') et collez-le ici.   */
  formspreeId: 'YOUR_FORM_ID',

  /* ── Année copyright ───────────────────────────────────────────
     Mise à jour annuelle du © dans le pied de page.              */
  copyrightYear: '2026',

  /* ── URL du site ────────────────────────────────────────────────
     Sans slash final. Utilisée dans le formulaire (_next redirect). */
  siteUrl: 'https://www.clermont-nuisibles.fr',

  /* ── Google Tag Manager ─────────────────────────────────────────
     Laissez vide ('') pour désactiver GTM. */
  gtmId: 'GTM-5GP5MRJR',

  /* ── Google Analytics 4 (measurement ID) ───────────────────────
     Ex. : 'G-XXXXXXXXXX'. Laissez vide ('') pour désactiver.
     Si GA est déjà chargé via GTM uniquement, laissez vide pour éviter le double comptage. */
  googleAnalyticsId: 'G-6P3P7FJNWT',

  /* ── Note clients ────────────────────────────────────────────────
     Injectée dans le JSON-LD Schema.org (aggregateRating).
     Mettez à jour dès que vous avez de vrais avis consolidés.    */
  rating: { value: 5.0, count: 47 },

  /* ── Section "Avis clients" ────────────────────────────────────
     false → section masquée + lien de nav masqué + avis.html redirige vers l'accueil
     true  → tout est visible normalement                         */
  showReviews: true,

  /* ── Lien Google Business — page QR code (avis-google.html) ────
     Récupérez l'URL courte depuis votre fiche Google Business,
     ex. : 'https://g.page/r/XXXXXXXXXXXX/review'                */
  googleReviewUrl: 'https://g.page/r/2884236348772897971/review',

  /* ── Google Agenda — vue intégrée (page admin) ──────────────────────────────
     Récupérez l'ID depuis Google Agenda :
     Paramètres de l'agenda → « Intégrer l'agenda » → copier l'adresse
     src=XXXX dans l'URL d'intégration (souvent votre adresse Gmail).
     Ex. : 'clermontnuisibles@gmail.com'                            */
  googleCalendarId: 'clermontnuisibles@gmail.com',

  /* ── Lien de réservation Google ────────────────────────────────────
     Google Agenda → + Créer → Créneaux de réservation → Voir la page
     Copier l'URL de partage (ex. https://calendar.app.google/XXXX)
     Laisser vide (‘’) pour masquer le bouton de réservation.         */
  googleBookingUrl: 'https://calendar.app.google/W3hPKxHths3qbvYF6',

};
