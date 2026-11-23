import {hasProductLanding, indexedProductPath} from './landing-paths.mjs';
export const sourceOrigin = 'https://findspreadsheet.com';
export const registrationUrl = 'https://www.eastmallbuy.com/web/#/register?inviter=bretosparvinyf78';
export const productUrl = (id) => hasProductLanding(id) ? indexedProductPath(id) : '/product/?id=' + encodeURIComponent(id);
export const originalUrl = (id) => 'https://weidian.com/item.html?itemID=' + encodeURIComponent(id);
export const purchaseUrl = (id) => 'https://www.eastmallbuy.com/web/#/item/index?tp=taobao&tid=&searchlang=en&url=' + encodeURIComponent(originalUrl(id)) + '&inviter=zhoucanqiang35';

export const categories = {
  shoes: 'Shoes', 'hoodies-sweaters': 'Hoodies & Sweaters', jackets: 'Jackets', 't-shirts': 'T-Shirts',
  'pants-shorts': 'Pants & Shorts', headwear: 'Headwear', accessories: 'Accessories', ShortSets: 'Short Sets',
  jersey: 'Jerseys', electronics: 'Electronics', 'other-stuff': 'Other Finds',
};
export const categoryLabel = (key) => categories[key] ?? 'Other Finds';
export const productImage = (product) => product.image;
export const officialLogo = 'https://cdn.eastmallbuy.com/img/20261113/ee025dd93561ffc214b528de006615c9.png';
export const officialFavicon = 'https://www.eastmallbuy.com/web/favicon.jpg';

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
