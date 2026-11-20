export const sourceOrigin = 'https://findspreadsheet.com';
export const registrationUrl = 'https://www.lolobuy.com/index?inviteCode=199df';
export const productUrl = (id) => '/product/?id=' + encodeURIComponent(id);
export const originalUrl = (id) => 'https://weidian.com/item.html?itemID=' + encodeURIComponent(id);
export const purchaseUrl = (id) => {
  const url = new URL('https://www.lolobuy.com/productDetail/1783404849631986');
  url.searchParams.set('url', originalUrl(id));
  return url.href;
};

export const categories = {
  shoes: 'Shoes', 'hoodies-sweaters': 'Hoodies & Sweaters', jackets: 'Jackets', 't-shirts': 'T-Shirts',
  'pants-shorts': 'Pants & Shorts', headwear: 'Headwear', accessories: 'Accessories', ShortSets: 'Short Sets',
  jersey: 'Jerseys', electronics: 'Electronics', 'other-stuff': 'Other Finds',
};
export const categoryLabel = (key) => categories[key] ?? 'Other Finds';
export const featuredIds = ['5954', '8608', '6818', '7357', '8768', '8891', '8313', '7637', '4491', '7079', '7352', '8334', '8477', '8940', '7091', '7653', '6250', '5841', '8510', '8397', '7656', '8702', '8661', '8944', '8779', '8352', '7046', '9018', '8648', '5985'];
export const productImage = (product) => featuredIds.includes(product.id) ? '/assets/product-' + product.id + '.webp' : product.image;

export function parseId(input) {
  const value = input.trim();
  if (/^\d{5,18}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (/^(?:www\.)?lolobuy\.com$/i.test(url.hostname) && url.pathname.startsWith('/productDetail/')) {
      return weidianId(new URL(url.searchParams.get('url') ?? ''));
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
