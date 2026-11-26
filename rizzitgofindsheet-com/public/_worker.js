const source = 'https://findspreadsheet.com';
const idPattern = /^\d{8,15}$/;
const detailPath = /^\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\.html$/;

async function upstream(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(7000), redirect: 'error' });
  if (!response.ok) throw new Error('Findspreadsheet request failed');
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (request.method !== 'GET') return Response.json({ error: 'Use GET' }, { status: 405, headers: { Allow: 'GET' } });
    try {
      if (url.pathname === '/api/qc') {
        const id = url.searchParams.get('item') || '';
        if (!idPattern.test(id)) return Response.json({ error: 'Invalid Weidian ID' }, { status: 400 });
        return Response.json(await qc(id), { headers: { 'Cache-Control': 'public, max-age=120' } });
      }
      if (url.pathname === '/api/gallery') {
        const path = url.searchParams.get('path') || '';
        if (!detailPath.test(path)) return Response.json({ error: 'Invalid product path' }, { status: 400 });
        return Response.json(await gallery(path), { headers: { 'Cache-Control': 'public, max-age=900' } });
      }
      return Response.json({ error: 'Unknown endpoint' }, { status: 404 });
    } catch {
      return Response.json({ error: 'Findspreadsheet is temporarily unavailable' }, { status: 502 });
    }
  },
};
