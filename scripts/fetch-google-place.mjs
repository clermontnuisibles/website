#!/usr/bin/env node
/**
 * Récupère rating, userRatingCount et avis (échantillon API, max ~5) via Places API (New)
 * et écrit src/data/google-place-snapshot.json pour le déploiement statique.
 *
 * Variables d'environnement :
 *   GOOGLE_PLACES_API_KEY (obligatoire pour exécuter l'appel)
 *
 * Le placeId est lu dans src/js/config.js (googlePlaceId).
 *
 * Sans clé : le script se termine avec le code 0 sans modifier le fichier (CI).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONFIG_PATH = join(ROOT, 'src', 'js', 'config.js');
const OUT_DIR = join(ROOT, 'src', 'data');
const OUT_FILE = join(OUT_DIR, 'google-place-snapshot.json');

const key = (process.env.GOOGLE_PLACES_API_KEY || '').trim();
if (!key) {
  console.warn('[fetch-google-place] GOOGLE_PLACES_API_KEY absent — snapshot inchangé.');
  process.exit(0);
}

let configText;
try {
  configText = readFileSync(CONFIG_PATH, 'utf8');
} catch (e) {
  console.error('[fetch-google-place] Impossible de lire config.js:', e.message);
  process.exit(1);
}

const m = configText.match(/googlePlaceId:\s*['"]([^'"]+)['"]/);
const placeId = m ? m[1].trim() : '';
if (!placeId) {
  console.error('[fetch-google-place] googlePlaceId introuvable dans config.js');
  process.exit(1);
}

const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
const res = await fetch(url, {
  headers: {
    'X-Goog-Api-Key': key,
    'X-Goog-FieldMask': 'rating,userRatingCount,reviews'
  }
});

const bodyText = await res.text();
if (!res.ok) {
  console.error('[fetch-google-place] HTTP', res.status, bodyText.slice(0, 500));
  process.exit(1);
}

let body;
try {
  body = JSON.parse(bodyText);
} catch (e) {
  console.error('[fetch-google-place] JSON invalide:', e.message);
  process.exit(1);
}

const snapshot = {
  fetchedAt: new Date().toISOString(),
  placeId,
  rating: body.rating != null ? Number(body.rating) : null,
  userRatingCount: body.userRatingCount != null ? Number(body.userRatingCount) : null,
  reviews: Array.isArray(body.reviews) ? body.reviews : []
};

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
console.log(
  '[fetch-google-place] Écrit',
  OUT_FILE,
  '— note',
  snapshot.rating,
  ',',
  snapshot.userRatingCount,
  'avis (total fiche),',
  snapshot.reviews.length,
  'avis dans l’échantillon API'
);
