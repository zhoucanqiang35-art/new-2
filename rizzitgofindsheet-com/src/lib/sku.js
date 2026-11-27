const origin = 'https://findspreadsheet.com';

function photoUrl(value) {
  if (typeof value !== 'string' || !/^(?:https:\/\/|\/\/|\/uploads\/)/i.test(value.trim())) return null;
  try {
    const url = new URL(value.trim(), origin);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function parseSku(payload, id) {
  if (String(payload?.weidian_id) !== id) return { groups: [], images: [] };
  const attrs = payload.specifications?.attrs;
  const groups = Array.isArray(attrs) ? attrs.slice(0, 8).flatMap((group) => {
    if (!Array.isArray(group.attr_values)) return [];
    const name = String(group.attr_title ?? '').trim();
    const options = group.attr_values.slice(0, 160).flatMap((value) => {
      const label = String(value.attr_value ?? value.name ?? '').trim();
      return label ? [{ label, image: photoUrl(value.img ?? value.image) }] : [];
    });
    return name && options.length ? [{ name, options }] : [];
  }) : [];
  const rawImages = Array.isArray(payload.images) ? payload.images : [];
  return { groups, images: [...new Set(rawImages.map(photoUrl).filter(Boolean))] };
}

export async function loadSku(id) {
  if (!/^\d{8,20}$/.test(id)) return { groups: [], images: [] };
  try {
    const cached = await fetch('/data/sku/' + id + '.json');
    if (cached.ok) return await cached.json();
  } catch { /* Continue with the public source. */ }
  const url = origin + '/api/Goods/getSkuData?weidian_id=' + id;
  const response = await fetch(url, { credentials: 'omit', signal: AbortSignal.timeout(8500) });
  if (!response.ok) throw new Error('Source options unavailable');
  return parseSku(await response.json(), id);
}
