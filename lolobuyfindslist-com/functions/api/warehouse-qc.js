const source = 'https://findspreadsheet.com/qcradar-qc.php';
const supportedStatuses = new Set(['ready', 'none', 'pending']);

function reply(data, status, cacheControl = 'no-store') {
  return Response.json(data, {
    status,
    headers: {'Cache-Control': cacheControl, 'X-Robots-Tag': 'noindex'},
  });
}

export async function onRequestGet({request}) {
  const id = new URL(request.url).searchParams.get('item') ?? '';
  if (!/^\d{5,18}$/.test(id)) return reply({error: 'Invalid Weidian item ID'}, 400);

  try {
    const upstream = await fetch(source + '?item=' + id, {
      headers: {Accept: 'application/json'},
      redirect: 'manual',
      signal: AbortSignal.timeout(6500),
    });
    const record = upstream.ok ? await upstream.json() : null;
    if (!record || record.degraded || record.platform !== 'weidian' || String(record.itemId) !== id
      || !supportedStatuses.has(record.status) || !Array.isArray(record.images)) {
      return reply({error: 'Warehouse QC temporarily unavailable'}, 503);
    }

    const seen = new Set();
    const images = [];
    if (record.status === 'ready') {
      for (const photo of record.images) {
        if (!photo || photo.isVideo || !/^image\//i.test(photo.mimeType ?? '') || typeof photo.display !== 'string') continue;
        const url = URL.parse(photo.display);
        if (url?.protocol !== 'https:' || url.username || url.password || seen.has(url.href)) continue;
        seen.add(url.href);
        images.push({url: url.href, agent: typeof photo.agentPlatform === 'string' ? photo.agentPlatform : ''});
        if (images.length === 24) break;
      }
    }
    const status = record.status === 'ready' && !images.length ? 'none' : record.status;
    return reply({itemId: id, status, images}, 200, 'public, max-age=120');
  } catch {
    return reply({error: 'Warehouse QC temporarily unavailable'}, 503);
  }
}
