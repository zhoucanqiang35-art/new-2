export async function onRequestGet({ request }) {
  const id = new URL(request.url).searchParams.get('item') || '';
  if (!/^\d{5,20}$/.test(id)) return Response.json({ status: 'invalid' }, { status: 400 });
  try {
    const upstream = await fetch('https://findspreadsheet.com/qcradar-qc.php?item=' + encodeURIComponent(id), { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(12000) });
    if (!upstream.ok) throw new Error('upstream');
    const data = await upstream.json();
    if (String(data.itemId) !== id || !Array.isArray(data.images)) throw new Error('invalid response');
    const images = data.images.slice(0, 24).flatMap(image => {
      try {
        const url = new URL(image.display, 'https://findspreadsheet.com');
        if (url.protocol !== 'https:') return [];
        return [{ display: url.href, skuLabel: String(image.skuLabel || '').slice(0, 200), isVideo: Boolean(image.isVideo || String(image.mimeType || '').startsWith('video/')) }];
      } catch { return []; }
    });
    const status = data.status === 'ready' && images.length ? 'ready' : data.status === 'none' ? 'none' : data.status === 'pending' || Number(data.counts?.mirrorPending) > 0 ? 'pending' : 'unavailable';
    return Response.json({ status, images }, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } });
  } catch {
    return Response.json({ status: 'unavailable', images: [] }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
