const source = 'https://findspreadsheet.com/qcradar-qc.php';

export async function onRequestGet({request}) {
  const id = new URL(request.url).searchParams.get('item') ?? '';
  if (!/^\d{5,18}$/.test(id)) {
    return Response.json({error: 'Invalid Weidian item ID'}, {status: 400});
  }

  try {
    const upstream = await fetch(source + '?item=' + id, {
      redirect: 'manual',
      signal: AbortSignal.timeout(6500),
    });
    if (!upstream.ok) throw new Error('QC source unavailable');
    const result = await upstream.json();
    if (result.itemId !== id || result.platform !== 'weidian' || result.degraded || !Array.isArray(result.images)
      || !['ready', 'none', 'pending'].includes(result.status)) {
      throw new Error('Invalid QC response');
    }

    const images = result.status === 'ready' ? result.images
      .filter(({display, isVideo, mimeType}) => !isVideo && /^image\//.test(mimeType) && /^https:\/\//.test(display))
      .slice(0, 24)
      .map(({display, agentPlatform}) => ({url: display, agent: agentPlatform})) : [];
    return Response.json({status: result.status === 'ready' && !images.length ? 'none' : result.status, images}, {
      headers: {'Cache-Control': 'public, max-age=120', 'X-Robots-Tag': 'noindex'},
    });
  } catch {
    return Response.json({error: 'QC source unavailable'}, {status: 502});
  }
}
