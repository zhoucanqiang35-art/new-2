const source = 'https://findspreadsheet.com';
const qcImageHost = 'a3146e426bcaaac6c813bbc910619829.eu.r2.cloudflarestorage.com';
const sellerImageHosts = new Set(['si.geilicdn.com', 'img.alicdn.com', 'gw.alicdn.com', 'findspreadsheet.com']);

let retryAfter = 0;

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

export async function onRequestGet({request}) {
  const {searchParams} = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');
  if (!/^\d{5,18}$/.test(id ?? '') || !['qc', 'styles'].includes(type)) {
    return Response.json({error: 'Invalid item or media type'}, {status: 400});
  }

  const remaining = Math.ceil((retryAfter - Date.now()) / 1000);
  if (remaining > 0) return unavailable('source-rate-limited', 429, remaining);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let failure = 'source-connection';
  try {
    const endpoint = type === 'qc' ? '/qcradar-qc.php?item=' : '/api/Goods/getSkuData?weidian_id=';
    const response = await fetch(source + endpoint + id, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'EastMallBuy Findsheet (+https://eastmallbuyfindsheet.com/)',
      },
      signal: controller.signal,
    });
    if (response.status === 429) {
      const hint = response.headers.get('Retry-After');
      const seconds = hint ? Number(hint) : NaN;
      const wait = Math.max(15, Number.isFinite(seconds) ? seconds : Math.ceil((Date.parse(hint) - Date.now()) / 1000) || 60);
      retryAfter = Date.now() + wait * 1000;
      return unavailable('source-rate-limited', 429, wait);
    }
    if (!response.ok) {
      failure = 'source-http-' + response.status;
      throw new Error('Source unavailable');
    }
    failure = 'source-response';
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

    const listing = data.data ?? data;
    if (String(listing.weidian_id) !== id) throw new Error('Unexpected SKU response');
    const groups = listing.specifications?.attrs ?? [];
    const isSize = (group) => /\b(?:size|sizing)\b|尺[码碼寸]|鞋[码碼]/i.test(group.attr_title ?? group.name ?? '');
    const sizes = [...new Set(groups.filter(isSize).flatMap((group) => (group.attr_values ?? [])
      .map((option) => String(option.attr_value ?? option.name ?? '').trim().slice(0, 60))).filter(Boolean))];
    const styles = groups.filter((group) => !isSize(group)).flatMap((group) => group.attr_values ?? [])
      .map((option) => ({
        photo: imageUrl(option.img || option.image, (url) => sellerImageHosts.has(url.hostname)),
        label: String(option.attr_value ?? option.name ?? '').trim().slice(0, 120),
      }))
      .filter(({photo}) => photo);
    return Response.json({styles, sizes}, {headers: {'Cache-Control': 'public, max-age: 300'}});
  } catch {
    return unavailable(controller.signal.aborted ? 'source-timeout' : failure);
  } finally {
    clearTimeout(timeout);
  }
}
