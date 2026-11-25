const source = 'https://findspreadsheet.com/qcradar-qc.php';
const statuses = new Set(['ready', 'none', 'pending']);

function reply(data, status, cache = 'no-store', retryAfter) {
  const headers = {'Cache-Control': cache, 'X-Robots-Tag': 'noindex'};
  if (retryAfter) headers['Retry-After'] = retryAfter;
  return Response.json(data, {
    status,
    headers,
  });
}

async function savedQc(assets, url, id) {
  try {
    const response = await assets.fetch(new URL('/data/qc-snapshot.json', url));
    if (!response.ok) return null;
    const records = await response.json();
    const files = records[id];
    if (!Array.isArray(files)) return null;
    const images = files
      .filter(file => typeof file === 'string' && /^[a-f\d]{20}\.webp$/.test(file))
      .slice(0, 24)
      .map(file => new URL('/assets/qc-cache/' + file, url).href);
    return images.length ? {itemId: id, status: 'ready', source: 'snapshot', images} : null;
  } catch {
    return null;
  }
}

export async function onRequestGet({request, env}) {
  const url = new URL(request.url);
  const id = url.searchParams.get('item') ?? '';
  if (!/^\d{5,18}$/.test(id)) return reply({error: 'Invalid Weidian item ID'}, 400);

  async function unavailable(status = 503, retryAfter) {
    const snapshot = await savedQc(env?.ASSETS, url, id);
    return snapshot
      ? reply(snapshot, 200, 'public, max-age=120')
      : reply({error: 'QC source unavailable'}, status, 'no-store', retryAfter);
  }

  try {
    const upstream = await fetch(source + '?item=' + id, {
      headers: {Accept: 'application/json'},
      redirect: 'error',
      signal: AbortSignal.timeout(6500),
    });
    if (upstream.status === 429) return unavailable(429, upstream.headers.get('Retry-After') || '60');
    const record = upstream.ok ? await upstream.json() : null;
    if (!record || record.degraded || record.platform !== 'weidian' || String(record.itemId) !== id
      || !statuses.has(record.status) || !Array.isArray(record.images)) {
      return unavailable();
    }

    const images = new Set();
    if (record.status === 'ready') {
      for (const photo of record.images) {
        if (!photo || photo.isVideo || !/^image\//i.test(photo.mimeType ?? '') || typeof photo.display !== 'string') continue;
        const url = URL.parse(photo.display);
        if (url?.protocol === 'https:' && !url.username && !url.password) images.add(url.href);
        if (images.size === 24) break;
      }
    }
    if (record.status === 'ready' && !images.size) return unavailable();
    return reply({itemId: id, status: record.status, images: [...images]}, 200, 'public, max-age=120');
  } catch {
    return unavailable();
  }
}
