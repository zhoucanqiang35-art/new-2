const entities = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };

function unescapeHtml(value) {
  return value.replace(/&(#\d+|#x[\da-f]+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
    if (!code.startsWith('#')) return entities[code.toLowerCase()] ?? entity;
    const hex = code[1].toLowerCase() === 'x';
    const point = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
    return point <= 0x10ffff ? String.fromCodePoint(point) : entity;
  });
}

export function sellerImageOptions(attributes) {
  if (!Array.isArray(attributes)) return [];
  return attributes.slice(0, 8).flatMap(attribute => {
    if (typeof attribute?.attr_title !== 'string' || !Array.isArray(attribute.attr_values)) return [];
    const label = attribute.attr_title.trim().slice(0, 80);
    const options = attribute.attr_values.slice(0, 200).flatMap(value => {
      const name = value?.attr_value ?? value?.name;
      const rawImage = value?.img ?? value?.image;
      if (typeof name !== 'string' || !name.trim() || typeof rawImage !== 'string' || !rawImage.trim()) return [];
      const image = URL.parse(rawImage, 'https://weidian.com');
      if (!image || image.protocol !== 'https:' || image.username || image.password ||
          !(image.hostname === 'geilicdn.com' || image.hostname.endsWith('.geilicdn.com'))) return [];
      return [{ label: name.trim().slice(0, 160), image: image.href }];
    });
    return label && options.length ? [{ label, options }] : [];
  });
}

export function parseWeidianOptions(html, id) {
  const tag = html.match(/<script\b[^>]*\bid=["']__rocker-render-inject__["'][^>]*>/i)?.[0];
  const value = tag?.match(/\bdata-obj=(["'])(.*?)\1/s)?.[2];
  if (!value) throw new Error('Seller listing data was missing');
  const listing = JSON.parse(unescapeHtml(value)).result?.default_model;
  if (String(listing?.item_info?.item_id) !== id || !Array.isArray(listing.sku_properties?.attr_list)) {
    throw new Error('Seller returned an unexpected listing');
  }
  return sellerImageOptions(listing.sku_properties.attr_list);
}
