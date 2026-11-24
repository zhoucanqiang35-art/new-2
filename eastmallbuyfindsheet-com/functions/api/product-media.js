import verifiedItems from '../../src/lib/weidian-shop-items.json';
import {publicShopMedia} from '../../src/lib/weidian-media.mjs';

const source = 'https://findspreadsheet.com';
const qcImageHost = 'a3146e426bcaaac6c813bbc910619829.eu.r2.cloudflarestorage.com';

const store = new Set(verifiedItems);
const retryAfter = new Map();

function unavailable(reason, status = 502, wait = 0) {
  const headers = {'Cache-Control': 'no-store'};
  if (wait > 0) headers['Retry-After'] = String(wait);
  return Response.json({error: 'Product media currently unavailable', reason}, {status, headers});
}

function imageUrl(value, allowed) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value, source);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && allowed(url) ? url.href : null;
  } catch {
    return null;
  }
}

export async function onRequestGet({request, waitUntil}) {
  const {searchParams} = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');
  if (!/^\d{5,18}$/.test(id ?? '') || !['qc', 'styles'].includes(type)) {
    return Response.json({error: 'Invalid item or media type'}, {status: 400});
  }

  if (!store.has(id)) return Response.json({error: 'Item unavailable in this store'}, {status: 404});

  const cache = type === 'styles' ? globalThis.caches?.default : undefined;
  const cacheUrl = new URL('/api/product-media', request.url);
  cacheUrl.search = new URLSearchParams({type, id, version: '1'}).toString();
  const cached = await cache?.match(cacheUrl.href).catch(() => undefined);
  if (cached) return cached;

  const remaining = Math.ceil(((retryAfter.get(type) ?? 0) - Date.now()) / 1000);
  if (remaining > 0) return unavailable('source-rate-limited', 429, remaining);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let failure = 'source-connection';
  try {
    const endpoint = type === 'qc' ? source + '/qcradar-qc.php?item=' : 'https://weidian.com/item.html?itemID=';
    const response = await fetch(endpoint + id, {
      headers: {
        Accept: type === 'qc' ? 'application/json' : 'text/html',
        'User-Agent': 'EastMallBuy Findsheet (+https://eastmallbuyfindsheet.com/)',
      },
      signal: controller.signal,
    });
    if (response.status === 429) {
      const hint = response.headers.get('Retry-After');
      const seconds = hint ? Number(hint) : NaN;
      const wait = Math.max(15, Number.isFinite(seconds) ? seconds : Math.ceil((Date.parse(hint) - Date.now()) / 1000) || 60);
      retryAfter.set(type, Date.now() + wait * 1000);
      return unavailable('source-rate-limited', 429, wait);
    }
    if (!response.ok) {
      failure = 'source-http-' + response.status;
      throw new Error('Source unavailable');
    }
    failure = 'source-response';
    if (type === 'styles') {
      const media = publicShopMedia(await response.text(), id);
      const result = Response.json(media, {headers: {'Cache-Control': 'public, max-age=300, s-maxage=86400'}});
      if (cache && (media.photos.length || media.styles.length)) {
        waitUntil(cache.put(cacheUrl.href, result.clone()).catch(() => {}));
      }
      return result;
    }
    const data = await response.json();

    if (type === 'qc') {
      if (data.platform !== 'weidian' || String(data.itemId) !== id ||
          !['ready', 'pending', 'none'].includes(data.status) || !Array.isArray(data.images)) {
        throw new Error('Unexpected QC response');
      }
      const photos = [...new Set(data.images.filter((item) => !item.isVideo && item.mimeType?.startsWith('image/'))
        .map((item) => imageUrl(item.display, (url) => url.hostname === qcImageHost &&
          url.pathname.startsWith('/repsradar-img/qc/weidian-' + id + '/'))).filter(Boolean))];
      if (data.status === 'ready' && photos.length === 0) throw new Error('Missing QC image links');
      return Response.json({status: data.status, photos}, {headers: {'Cache-Control': 'no-store'}});
    }

  } catch {
    return unavailable(controller.signal.aborted ? 'source-timeout' : failure);
  } finally {
    clearTimeout(timeout);
  }
}
