/**
 * Exemple Cloudflare Worker : proxy sécurisé vers Google Places API (New).
 * La clé API reste dans les variables d'environnement du Worker (secrètes),
 * pas dans le dépôt GitHub.
 *
 * Déploiement : Workers & Pages → Create Worker → coller ce script
 * Variables :
 *   GOOGLE_PLACES_API_KEY = votre clé (secret)
 *   ALLOWED_ORIGINS = https://www.votredomaine.fr,https://votredomaine.fr
 *
 * URL du Worker (ex. https://places-proxy.xxx.workers.dev) →
 *   config.js → googlePlacesProxyUrl: 'https://places-proxy.xxx.workers.dev'
 *
 * Test : GET ?placeId=ChIJ...
 */
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return cors(new Response(null, { status: 204 }), request, env);
    }
    if (request.method !== 'GET') {
      return cors(new Response('Method Not Allowed', { status: 405 }), request, env);
    }

    const url = new URL(request.url);
    const placeId = url.searchParams.get('placeId');
    if (!placeId) {
      return cors(new Response(JSON.stringify({ error: 'Missing placeId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request, env);
    }

    const origin = request.headers.get('Origin') || '';
    const allowed = String(env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (allowed.length && !allowed.includes(origin)) {
      return cors(new Response('Forbidden', { status: 403 }), request, env);
    }

    const key = env.GOOGLE_PLACES_API_KEY;
    if (!key) {
      return cors(new Response('Server misconfigured', { status: 500 }), request, env);
    }

    const gUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    const gRes = await fetch(gUrl, {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews'
      }
    });

    const body = await gRes.text();
    return cors(
      new Response(body, {
        status: gRes.status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }),
      request,
      env
    );
  }
};

function cors(res, request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allow = allowed.includes(origin) ? origin : allowed[0] || '';
  if (allow) {
    res.headers.set('Access-Control-Allow-Origin', allow);
    res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.headers.set('Vary', 'Origin');
  }
  return res;
}
