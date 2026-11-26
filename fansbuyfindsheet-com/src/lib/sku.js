import { findspreadsheet, weidianId } from './fansbuy.js';

function sellerImage(value) {
  if (typeof value !== 'string' || !/^(?:https?:)?\/\//i.test(value.trim())) return null;
  try {
    const url = new URL(value.trim(), findspreadsheet);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function skuGroups(payload, id) {
  if (String(payload?.weidian_id) !== id) return [];
  const attrs = payload.specifications?.attrs;
  if (!Array.isArray(attrs)) return [];
  return attrs.slice(0, 8).flatMap(group => {
    if (!Array.isArray(group.attr_values)) return [];
    const name = String(group.attr_title ?? '').trim();
    const options = group.attr_values.slice(0, 160).flatMap(value => {
      const label = String(value.attr_value ?? value.name ?? '').trim();
      return label ? [{ label, image: sellerImage(value.img ?? value.image) }] : [];
    });
    return name && options.length ? [{ name, options }] : [];
  });
}

export function sellerOptions(payload, id) {
  if (String(payload?.weidian_id) !== id) return null;
  const groups = skuGroups(payload, id);
  const images = !groups.some(group => group.options.some(option => option.image))
    && Array.isArray(payload.images)
    ? [...new Set(payload.images.slice(0, 24).map(sellerImage).filter(Boolean))]
    : [];
  return { groups, images };
}

export async function fetchSellerOptions(id) {
  if (!weidianId.test(id ?? '')) return null;
  const url = new URL('/api/Goods/getSkuData', findspreadsheet);
  url.searchParams.set('weidian_id', id);
  const response = await fetch(url, {
    credentials: 'omit',
    signal: AbortSignal.timeout(6500),
    headers: { Accept: 'application/json' }
  });
  if (!response.ok || !response.headers.get('content-type')?.includes('json')) return null;
  return sellerOptions(await response.json(), id);
}
