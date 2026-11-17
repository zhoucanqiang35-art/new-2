import lastChecks from './qc-last-checks.js';

const qcOrigin = 'https://findspreadsheet.com';
const cacheControl = 'public, max-age=120, s-maxage=300';
let retryAfter = 0;

function json(data, status = 200, cache = 'no-store') {
 return Response.json(data, { status, headers: { 'Cache-Control': cache } });
}

function cleanPhotos(images) {
 if (!Array.isArray(images)) throw new Error('Invalid QC image list');
 const unique = new Map();
 for (const image of images) {
  if (!image || typeof image.display !== 'string' || image.isVideo ||
   (image.mimeType && !image.mimeType.startsWith('image/'))) continue;

  if (!URL.canParse(image.display, qcOrigin)) continue;
  const url = new URL(image.display, qcOrigin);
  if (url.protocol !== 'https:' || url.username || url.password || unique.has(url.href)) continue;
  unique.set(url.href, { url: url.href, label: [
   image.skuLabel, image.agentPlatform, image.takenAt,
  ].filter(value => typeof value === 'string' && value.trim()).map(value => value.trim().slice(0, 100)).join(' · ') });
 }
 return [...unique.values()];
}

function upstreamUnavailable(itemId, reason) {
 if (reason) console.warn('QC upstream unavailable', reason);
 if (Object.hasOwn(lastChecks, itemId)) {
  return json({ status: lastChecks[itemId], photos: [], lastChecked: true });
 }
 return json({ status: 'unavailable' }, 502);
}

async function queryQC(itemId) {
 if (Date.now() < retryAfter) return upstreamUnavailable(itemId);
 const url = new URL('/qcradar-qc.php', qcOrigin);
 url.searchParams.set('item', itemId);
 const controller = new AbortController();
 const timeout = setTimeout(() => controller.abort(), 8000);
 try {
  const upstream = await fetch(url, {
   headers: { Accept: 'application/json' },
   redirect: 'manual',
   signal: controller.signal,
  });
  if (upstream.status === 429) {
   const header = upstream.headers.get('Retry-After');
   const seconds = Number(header);
   const delay = header && Number.isFinite(seconds)
    ? Math.max(0, seconds) * 1000
    : (Date.parse(header) - Date.now()) || 60_000;
   retryAfter = Date.now() + Math.max(delay, 15_000);
  }
  if (!upstream.ok) return upstreamUnavailable(itemId, 'HTTP ' + upstream.status);

  const data = await upstream.json();
  if (String(data.itemId) !== itemId || data.platform !== 'weidian') {
   return upstreamUnavailable(itemId, 'Item or platform mismatch');
  }
  const photos = cleanPhotos(data.images);
  if (data.status === 'ready' && photos.length) {
   return json({ status: 'ready', photos }, 200, cacheControl);
  }
  if (data.status === 'pending' || Number(data.counts?.mirrorPending) > 0) {
   return json({ status: 'pending', photos: [] }, 200, cacheControl);
  }
  if (data.status === 'none' && !data.degraded) {
   return json({ status: 'none', photos: [] }, 200, cacheControl);
  }
  return upstreamUnavailable(itemId, 'Invalid or degraded response');
 } catch (error) {
  return upstreamUnavailable(itemId, String(error).slice(0, 200));
 } finally {
  clearTimeout(timeout);
 }
}

export default {
 async fetch(request, env) {
  const url = new URL(request.url);
  if (url.pathname !== '/api/qc') return env.ASSETS.fetch(request);
  if (request.method !== 'GET') return json({ status: 'unavailable' }, 405);
  const itemId = url.searchParams.get('item');
  if (!itemId || !/^\d{6,20}$/.test(itemId)) return json({ status: 'unavailable' }, 400);
  return queryQC(itemId);
 },
};
