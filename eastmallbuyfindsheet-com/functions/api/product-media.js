const source = 'https://findspreadsheet.com';
const qcImageHost = 'a3146e426bcaaac6c813bbc910619829.eu.r2.cloudflarestorage.com';
const sellerImageHosts = new Set(['si.geilicdn.com', 'img.alicdn.com', 'gw.alicdn.com', 'findspreadsheet.com']);

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

  try {
    const endpoint = type === 'qc' ? '/qcradar-qc.php?item=' : '/api/Goods/getSkuData?weidian_id=';
    const response = await fetch(source + endpoint + id, {
      headers: {Accept: 'application/json'},
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Source unavailable');
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
    const styles = (listing.specifications?.attrs ?? []).flatMap((group) => group.attr_values ?? [])
      .map((option) => ({
        photo: imageUrl(option.img || option.image, (url) => sellerImageHosts.has(url.hostname)),
        label: String(option.attr_value || option.name || '').trim().slice(0, 120),
      }))
      .filter(({photo}) => photo);
    return Response.json({styles}, {headers: {'Cache-Control': 'public, max-age=300'}});
  } catch {
    return Response.json({error: 'Product media currently unavailable'}, {
      status: 502,
      headers: {'Cache-Control': 'no-store'},
    });
  }
}
