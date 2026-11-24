const weidianShopIds = new Set(['1696846451', '1823310451', '1789121139']);
const imageHosts = new Set(['si.geilicdn.com', 'img.geilicdn.com']);
const sizeField = /\b(?:size|sizing)\b|尺[码碼寸]|鞋[码碼]/i;

function imageUrl(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value, 'https://weidian.com/');
    if (url.protocol !== 'https:' || !imageHosts.has(url.hostname) || url.username || url.password || url.port) return null;
    return url.href;
  } catch {
    return null;
  }
}

function attributeText(value) {
  const named = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"};
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (reference, code) => {
    if (code[0] !== '#') return named[code.toLowerCase()] ?? reference;
    const point = code[1].toLowerCase() === 'x' ? Number.parseInt(code.slice(2), 16) : Number(code.slice(1));
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : reference;
  });
}

export function publicShopMedia(html, id) {
  const tag = html.match(/<script\b[^>]*\bid=["']__rocker-render-inject__["'][^>]*>/i)?.[0];
  const value = tag?.match(/\bdata-obj=(["'])(.*?)\1/s)?.[2];
  if (!value) throw new Error('Missing public item data');
  const data = JSON.parse(attributeText(value)).result?.default_model;
  const item = data?.item_info;
  if (String(item?.item_id) !== id || !weidianShopIds.has(String(item?.shop_id))) {
    throw new Error('Item or store does not match');
  }

  const groups = data.sku_properties?.attr_list ?? [];
  const sizes = [...new Set(groups.filter((group) => sizeField.test(group.attr_title)).flatMap((group) =>
    (group.attr_values ?? []).map((option) => String(option.attr_value ?? '').trim().slice(0, 60))
  ).filter(Boolean))];
  const styles = groups.filter((group) => !sizeField.test(group.attr_title)).flatMap((group) => group.attr_values ?? [])
    .map((option) => ({photo: imageUrl(option.img), label: String(option.attr_value ?? '').trim().slice(0, 120)}))
    .filter(({photo}) => photo);
  const photos = (item.imgs ?? []).map((photo) => imageUrl(typeof photo === 'string' ? photo : photo?.url)).filter(Boolean);
  return {styles, sizes, photos};
}
