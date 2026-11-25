const source = 'https://findspreadsheet.com/qcradar-qc.php';
const statuses = new Set(['ready', 'none', 'pending']);

function reply(data, status, cache = 'no-store') {
  return Response.json(data, {
    status,
    headers: {'Cache-Control': cache, 'X-Robots-Tag': 'noindex'},
  });
}

export async function onRequestGet({request}) {
  const id = new URL(request.url).searchParams.get('item') ?? '';
  if (!/^\d{5,18}$/.test(id)) return reply({error: 'Invalid Weidian item ID'}, 400);

  try {
    const upstream = await fetch(source + '?item=' + id, {
      headers: {Accept: 'application/json'},
      redirect: 'error',
      signal: AbortSignal.timeout(6500),
    });
    const record = upstream.ok ? await upstream.json() : null;
    if (!record || record.degraded || record.platform !== 'weidian' || String(record.itemId) !== id
      || !statuses.has(record.status) || !Array.isArray(record.images)) {
      return reply({error: 'QC source unavailable'}, 503);
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
    if (record.status === 'ready' && !images.size) return reply({error: 'QC images unavailable'}, 503);
    return reply({itemId: id, status: record.status, images: [...images]}, 200, 'public, max-age=120');
  } catch {
    return reply({error: 'QC source unavailable'}, 503);
  }
}
