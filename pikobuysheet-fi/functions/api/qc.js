const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };

export async function onRequestGet({ request }) {
  const item = new URL(request.url).searchParams.get('item') ?? '';
  if (!/^\d{1,20}$/.test(item)) {
    return Response.json({ status: 'invalid' }, { status: 400, headers });
  }

  const upstream = new URL('https://findspreadsheet.com/qcradar-qc.php');
  upstream.searchParams.set('item', item);

  try {
    const response = await fetch(upstream, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('QC upstream unavailable');

    const result = await response.json();
    if (result.degraded || result.platform !== 'weidian' || String(result.itemId) !== item) {
      throw new Error('Unexpected QC response');
    }

    if (result.status === 'none' || result.status === 'pending') {
      return Response.json({ status: result.status, images: [] }, { headers });
    }
    if (result.status !== 'ready' || !Array.isArray(result.images)) {
      throw new Error('Unexpected QC status');
    }

    const images = result.images
      .map((image) => image?.display)
      .filter((url) => typeof url === 'string' && URL.canParse(url) && new URL(url).protocol === 'https:');
    if (!images.length) throw new Error('Missing QC images');
    return Response.json({ status: 'ready', images }, { headers });
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 502, headers });
  }
}
