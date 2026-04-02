#!/usr/bin/env node
/**
 * Écrit src/data/google-place-snapshot.json pour le site statique.
 *
 * 1) Mode exhaustif (recommandé) — Google Business Profile API v4
 *    Liste paginée de tous les avis du lieu (compte propriétaire).
 *    Variables :
 *      GOOGLE_GBP_CLIENT_ID
 *      GOOGLE_GBP_CLIENT_SECRET
 *      GOOGLE_GBP_REFRESH_TOKEN   (OAuth, scope business.manage)
 *      GOOGLE_GBP_REVIEWS_PARENT  ex. accounts/123456789/locations/987654321
 *
 * 2) Repli — Places API (New) : échantillon limité (~5 avis) + rating / total.
 *    GOOGLE_PLACES_API_KEY (+ GOOGLE_PLACES_HTTP_REFERER si clé restreinte par référent)
 *
 * googlePlaceId et siteUrl sont lus dans src/js/config.js.
 * Sans aucune config exploitable : exit 0, fichier inchangé.
 *
 * @see https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONFIG_PATH = join(ROOT, 'src', 'js', 'config.js');
const OUT_DIR = join(ROOT, 'src', 'data');
const OUT_FILE = join(OUT_DIR, 'google-place-snapshot.json');

function readConfig() {
  let configText;
  try {
    configText = readFileSync(CONFIG_PATH, 'utf8');
  } catch (e) {
    console.error('[fetch-google-place] Impossible de lire config.js:', e.message);
    process.exit(1);
  }
  const pid = configText.match(/googlePlaceId:\s*['"]([^'"]+)['"]/);
  const placeId = pid ? pid[1].trim() : '';
  if (!placeId) {
    console.error('[fetch-google-place] googlePlaceId introuvable dans config.js');
    process.exit(1);
  }
  const siteUrlMatch = configText.match(/siteUrl:\s*['"]([^'"]+)['"]/);
  const refererFromConfig = siteUrlMatch
    ? siteUrlMatch[1].replace(/\/+$/, '') + '/'
    : '';
  return { placeId, refererFromConfig, configText };
}

function writeSnapshot(snapshot) {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }
  writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
}

function gbpStarToNumber(starRating) {
  const map = {
    STAR_RATING_UNSPECIFIED: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5
  };
  return map[starRating] ?? 0;
}

function formatRelativeFr(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 45) return 'à l’instant';
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 36) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 14) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 10) return `il y a ${weeks} sem.`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Avis GBP → même forme que Places (New) pour main.js / cartes. */
function gbpReviewToPlacesShape(r) {
  const createTime = r.createTime || r.updateTime || '';
  const text = typeof r.comment === 'string' ? r.comment : '';
  const author =
    r.reviewer && r.reviewer.displayName
      ? r.reviewer.displayName
      : r.reviewer && r.reviewer.isAnonymous
        ? 'Client Google'
        : 'Client Google';
  return {
    name: r.name || '',
    rating: gbpStarToNumber(r.starRating),
    text: { text, languageCode: 'fr' },
    originalText: { text, languageCode: 'fr' },
    relativePublishTimeDescription: formatRelativeFr(createTime),
    authorAttribution: { displayName: author },
    publishTime: createTime
  };
}

function gbpEnv() {
  const clientId = (process.env.GOOGLE_GBP_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_GBP_CLIENT_SECRET || '').trim();
  const refreshToken = (process.env.GOOGLE_GBP_REFRESH_TOKEN || '').trim();
  const parent = (process.env.GOOGLE_GBP_REVIEWS_PARENT || '').trim();
  if (clientId && clientSecret && refreshToken && parent) {
    return { clientId, clientSecret, refreshToken, parent };
  }
  return null;
}

async function gbpAccessToken(env) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.clientId,
      client_secret: env.clientSecret,
      refresh_token: env.refreshToken,
      grant_type: 'refresh_token'
    })
  });
  const txt = await res.text();
  if (!res.ok) {
    throw new Error(`OAuth token ${res.status}: ${txt.slice(0, 400)}`);
  }
  const j = JSON.parse(txt);
  if (!j.access_token) throw new Error('OAuth: pas d’access_token dans la réponse');
  return j.access_token;
}

async function fetchAllGbpReviews(accessToken, parent) {
  const base = `https://mybusiness.googleapis.com/v4/${parent}/reviews`;
  const collected = [];
  let pageToken = '';
  let averageRating = null;
  let totalReviewCount = null;

  for (;;) {
    const u = new URL(base);
    u.searchParams.set('pageSize', '50');
    u.searchParams.set('orderBy', 'updateTime desc');
    if (pageToken) u.searchParams.set('pageToken', pageToken);

    const res = await fetch(u.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const txt = await res.text();
    if (!res.ok) {
      throw new Error(`GBP list ${res.status}: ${txt.slice(0, 500)}`);
    }
    const j = JSON.parse(txt);
    if (j.averageRating != null) averageRating = Number(j.averageRating);
    if (j.totalReviewCount != null) totalReviewCount = Number(j.totalReviewCount);
    const chunk = Array.isArray(j.reviews) ? j.reviews : [];
    collected.push(...chunk);
    pageToken = j.nextPageToken || '';
    if (!pageToken) break;
  }

  return {
    reviews: collected.map(gbpReviewToPlacesShape),
    averageRating,
    totalReviewCount
  };
}

async function runGoogleBusinessProfile(placeId, env) {
  console.log('[fetch-google-place] Mode Google Business Profile (liste complète paginée)…');
  const accessToken = await gbpAccessToken(env);
  const { reviews, averageRating, totalReviewCount } = await fetchAllGbpReviews(
    accessToken,
    env.parent
  );

  const rating =
    averageRating != null && !Number.isNaN(averageRating)
      ? averageRating
      : reviews.length
        ? reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length
        : null;
  const count =
    totalReviewCount != null && totalReviewCount > 0
      ? totalReviewCount
      : reviews.length;

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    placeId,
    rating: rating != null ? Math.round(rating * 10) / 10 : null,
    userRatingCount: count,
    reviews,
    reviewsSource: 'google_business_profile'
  };

  writeSnapshot(snapshot);
  console.log(
    '[fetch-google-place] GBP — écrit',
    OUT_FILE,
    '—',
    snapshot.reviews.length,
    'avis synchronisés, note',
    snapshot.rating,
    ', total fiche',
    snapshot.userRatingCount
  );
}

async function runPlacesApi(placeId, refererFromConfig) {
  const key = (process.env.GOOGLE_PLACES_API_KEY || '').trim();
  if (!key) {
    console.warn('[fetch-google-place] GOOGLE_PLACES_API_KEY absent — snapshot inchangé.');
    process.exit(0);
  }

  const referer =
    (process.env.GOOGLE_PLACES_HTTP_REFERER || '').trim() || refererFromConfig;

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const headers = {
    'X-Goog-Api-Key': key,
    'X-Goog-FieldMask': 'rating,userRatingCount,reviews'
  };
  if (referer) headers.Referer = referer;

  const res = await fetch(url, { headers });
  const bodyText = await res.text();
  if (!res.ok) {
    console.error('[fetch-google-place] Places HTTP', res.status, bodyText.slice(0, 500));
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
    reviews: Array.isArray(body.reviews) ? body.reviews : [],
    reviewsSource: 'places_api'
  };

  writeSnapshot(snapshot);
  console.log(
    '[fetch-google-place] Places API — écrit',
    OUT_FILE,
    '— note',
    snapshot.rating,
    ',',
    snapshot.userRatingCount,
    'avis (total fiche),',
    snapshot.reviews.length,
    'avis dans l’échantillon (~5 max)'
  );
}

const { placeId, refererFromConfig } = readConfig();
const gbp = gbpEnv();

if (gbp) {
  try {
    await runGoogleBusinessProfile(placeId, gbp);
  } catch (e) {
    console.error('[fetch-google-place]', e.message || e);
    const key = (process.env.GOOGLE_PLACES_API_KEY || '').trim();
    if (key) {
      console.warn('[fetch-google-place] Repli sur Places API…');
      await runPlacesApi(placeId, refererFromConfig);
    } else {
      process.exit(1);
    }
  }
} else {
  await runPlacesApi(placeId, refererFromConfig);
}
