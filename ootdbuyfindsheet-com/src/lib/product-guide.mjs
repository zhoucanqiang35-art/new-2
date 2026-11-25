import { coverUrl } from './settings.mjs';

export function productPhotoUrls(product, saved = []) {
  return [...new Set([coverUrl(product), ...saved.filter(url => url !== product.image)])].filter(Boolean);
}

export async function readSellerDetails(id) {
  const endpoint = new URL('/api/Goods/getSkuData', 'https://findspreadsheet.com');
  endpoint.searchParams.set('weidian_id', id);
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  const data = await response.json();
  if (String(data.weidian_id) !== id) return null;

  const text = value => typeof value === 'string' ? value.trim() : '';
  const imageUrl = value => /^https:\/\//i.test(text(value)) ? text(value) : '';
  const groups = Array.isArray(data.specifications?.attrs) ? data.specifications.attrs : [];
  const options = groups.slice(0, 8).flatMap(group => {
    const name = text(group?.attr_title);
    if (!name || !Array.isArray(group.attr_values)) return [];
    const values = new Map();
    for (const value of group.attr_values) {
      const label = text(value?.attr_value || value?.name);
      if (!label) continue;
      const image = imageUrl(value.img);
      if (!values.has(label) || image) values.set(label, {label, image});
    }
    return values.size ? [{name, values:[...values.values()]}] : [];
  });
  const images = Array.isArray(data.images) ? data.images.map(imageUrl).filter(Boolean).slice(0, 24) : [];
  return {options, images};
}
