const titles = {
  size: ['Size', 'size'],
  color: ['Color', 'color'],
  colors: ['Color', 'color'],
  colour: ['Color', 'color'],
  colours: ['Color', 'color'],
  style: ['Style', 'style'],
  model: ['Style', 'style'],
};

export function variantTitle(title) {
  return titles[title.toLowerCase()] ?? [title, undefined];
}

export function sortVariantGroups(groups) {
  const order = (group) => Number(variantTitle(group.title)[1] === 'size');
  return [...groups].sort((a, b) => order(a) - order(b));
}

export function readVariantGroups(payload, requestedId) {
  const attributes = payload?.specifications?.attrs;
  if (String(payload?.weidian_id) !== requestedId || !Array.isArray(attributes)) return [];

  const groups = [];
  for (const attribute of attributes) {
    const title = String(attribute?.attr_title ?? '').trim();
    if (!title || !Array.isArray(attribute?.attr_values)) continue;

    const options = [];
    for (const value of attribute.attr_values) {
      const label = String(value?.attr_value ?? '').trim();
      if (!label) continue;
      const raw = typeof value.img === 'string' ? value.img.trim() : '';
      const image = raw.startsWith('//') ? 'https:' + raw : raw;
      options.push(image.startsWith('https://') ? { label, image } : { label });
    }
    if (options.length) groups.push({ title, options });
  }
  return sortVariantGroups(groups);
}

function sellerImages(payload, requestedId) {
  if (String(payload?.weidian_id) !== requestedId || !Array.isArray(payload.images)) return [];
  return [...new Set(payload.images.filter((image) => typeof image === 'string').map((image) => {
    const url = image.trim();
    return url.startsWith('//') ? 'https:' + url : url;
  }).filter((image) => image.startsWith('https://')))];
}

export async function fetchSellerProduct(id) {
  const endpoint = new URL('https://findspreadsheet.com/api/Goods/getSkuData');
  endpoint.searchParams.set('weidian_id', id);
  const response = await fetch(endpoint, { credentials: 'omit', signal: AbortSignal.timeout(9000) });
  if (!response.ok) throw new Error('Seller product data unavailable');
  const payload = await response.json();
  return { images: sellerImages(payload, id), options: readVariantGroups(payload, id) };
}
