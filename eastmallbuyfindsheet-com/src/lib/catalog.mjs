export const publicAsset = (path) => 'https://eastmallbuyfindsheet-preview.zhoucanqiang35.chatgpt.site' + path;
export const sourceOrigin = 'https://findspreadsheet.com';
export const registrationUrl = 'https://www.eastmallbuy.com/web/#/register?inviter=bretosparvinyf78';
export const productUrl = (id) => '/product/?id=' + encodeURIComponent(id);
export const originalUrl = (id) => 'https://weidian.com/item.html?itemID=' + encodeURIComponent(id);
export const purchaseUrl = (id) => 'https://www.eastmallbuy.com/web/#/item/index?tp=taobao&tid=&searchlang=en&url=' + encodeURIComponent(originalUrl(id)) + '&inviter=zhoucanqiang35';

export const categories = {
  shoes: 'Shoes', 'hoodies-sweaters': 'Hoodies & Sweaters', jackets: 'Jackets', 't-shirts': 'T-Shirts',
  'pants-shorts': 'Pants & Shorts', headwear: 'Headwear', accessories: 'Accessories', ShortSets: 'Short Sets',
  jersey: 'Jerseys', electronics: 'Electronics', 'other-stuff': 'Other Finds',
};
export const categoryLabel = (key) => categories[key] ?? 'Other Finds';
export const featuredIds = ['5954', '8608', '6818', '7357', '8768', '8891', '8313', '7637', '4491', '7079', '7352', '8334', '8477', '8940', '7091', '7653', '6250', '5841', '8510', '8397', '7656', '8702', '8661', '8944', '8779', '8352', '7046', '9018', '8648', '5985', '8179', '8765', '8676', '8984'];
export const productImage = (product) => featuredIds.includes(product.id) ? publicAsset('/assets/product-' + product.id + '.webp') : product.image;

export function parseId(input) {
  const value = input.trim();
  if (/^\d{5,18}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (/^(?:www\.)?eastmallbuy\.com$/i.test(url.hostname)) {
      const [route, query] = url.hash.split('?');
      if (route !== '#/item/index') return '';
      const nested = new URL(new URLSearchParams(query).get('url') ?? '');
      return weidianId(nested);
    }
    return weidianId(url);
  } catch {
    return '';
  }
}
function weidianId(url) {
  const id = url.searchParams.get('itemID') ?? '';
  return /^(?:www\.)?weidian\.com$/i.test(url.hostname) && /^\d{5,18}$/.test(id) ? id : '';
}
