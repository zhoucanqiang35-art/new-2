const source = 'https://findspreadsheet.com';
const idPattern = /^\d{8,15}$/;
const detailPath = /^\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\.html$/;

async function upstream(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(7000),
    headers: { Accept: url.includes('qcradar-qc.php') ? 'application/json' : 'text/html' },
  });
  if (!response.ok) throw new Error('Findspreadsheet returned HTTP ' + response.status);
  return response;
}

function secureImage(value) {
  try {
    const url = new URL(value, source);
    return typeof value === 'string' && value && url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

async function qc(item) {
  const data = await (await upstream(source + '/qcradar-qc.php?item=' + item)).json();
  const images = Array.isArray(data.images) ? data.images.slice(0, 24).flatMap((photo) => {
    const display = secureImage(photo.display);
    if (!display) return [];
    return [{ display, thumbnail: secureImage(photo.thumb || photo.thumbnail) || display,
      video: Boolean(photo.isVideo || photo.mimeType?.startsWith('video/')) }];
  }) : [];
  return { status: data.degraded && !images.length ? 'pending' : data.status, images };
}

async function gallery(path) {
  const html = await (await upstream(source + path)).text();
  const region = html.split('class="thumbnail-container"')[1]?.split('<!-- Right side product info -->')[0] || '';
  return { images: [...new Set([...region.matchAll(/data-src="((?:\/uploads\/|https:\/\/)[^"]+)"/g)]
    .map((match) => secureImage(match[1])).filter(Boolean))].slice(0, 24) };
}


async function snapshot(request, env, path) {
  const response = await env.ASSETS.fetch(new URL(path, request.url).href);
  if (!response.ok) return {};
  return response.json();
}

async function previewGallery(request, env, path) {
  const record = path.match(/-(\d+)\.html$/)?.[1];
  if (record) {
    const shard = Math.floor(Number(record) / 100);
    const groups = await snapshot(request, env, '/data/listing-photos/' + shard + '.json');
    if (Array.isArray(groups[record]) && groups[record].length) {
      return { images: groups[record].map(secureImage).filter(Boolean).slice(0, 24) };
    }
  }
  return gallery(path);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (request.method !== 'GET') return Response.json({ error: 'Use GET' }, { status: 405, headers: { Allow: 'GET' } });
    try {
      if (url.pathname === '/api/qc') {
        const id = url.searchParams.get('item') || '';
        if (!idPattern.test(id)) return Response.json({ error: 'Invalid Weidian ID' }, { status: 400 });
        const cache = await snapshot(request, env, '/data/qc-preview.json');
        return Response.json(cache[id] || await qc(id), { headers: { 'Cache-Control': 'public, max-age=120' } });
      }
      if (url.pathname === '/api/gallery') {
        const path = url.searchParams.get('path') || '';
        if (!detailPath.test(path)) return Response.json({ error: 'Invalid product path' }, { status: 400 });
        return Response.json(await previewGallery(request, env, path), { headers: { 'Cache-Control': 'public, max-age=900' } });
      }
      return Response.json({ error: 'Unknown endpoint' }, { status: 404 });
    } catch (error) {
      console.warn('Findspreadsheet request failed', url.pathname, error.message);
      return Response.json({ error: 'Findspreadsheet is temporarily unavailable' }, { status: 502 });
    }
  },
};
