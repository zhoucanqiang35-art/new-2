const source = 'https://findspreadsheet.com/qcradar-qc.php';

function unavailable(reason) {
  return Response.json({error: 'QC source unavailable', reason}, {
    status: 503,
    headers: {'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex'},
  });
}

export async function onRequestGet({request}) {
  const id = new URL(request.url).searchParams.get('item') ?? '';
  if (!/^\d{5,18}$/.test(id)) {
    return Response.json({error: 'Invalid Weidian item ID'}, {status: 400});
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6500);
  try {
    const upstream = await fetch(source + '?item=' + id, {
      headers: {'Accept': 'application/json'},
      redirect: 'manual',
      signal: controller.signal,
    });
    if (!upstream.ok) return unavailable('source_http_' + upstream.status);
    const result = await upstream.json().catch(() => null);
    if (!result || String(result.itemId) !== id || result.platform !== 'weidian' || result.degraded
      || !Array.isArray(result.images) || !['ready', 'none', 'pending'].includes(result.status)) {
      return unavailable('source_response');
    }

    const images = result.status === 'ready' ? result.images
      .filter(({display, isVideo, mimeType}) => !isVideo && /^image\//.test(mimeType) && /^https:\/\//.test(display))
      .slice(0, 24)
      .map(({display, agentPlatform}) => ({url: display, agent: agentPlatform})) : [];
    return Response.json({status: result.status === 'ready' && !images.length ? 'none' : result.status, images}, {
      headers: {'Cache-Control': 'public, max-age=120', 'X-Robots-Tag': 'noindex'},
    });
  } catch {
    return unavailable(controller.signal.aborted ? 'source_timeout' : 'source_connection');
  } finally {
    clearTimeout(timer);
  }
}
