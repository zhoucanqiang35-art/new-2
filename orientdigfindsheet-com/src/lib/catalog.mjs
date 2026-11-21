export { priceLabel } from './currency.mjs';
export const origin = 'https://findspreadsheet.com';
export const register = 'https://orientdig.com/register?ref=100249252';
export const buyUrl = (id) => 'https://orientdig.com/product/?' + new URLSearchParams({shop_type:'weidian', id, ref:'100114240'});
export const itemUrl = (id) => '/products/' + encodeURIComponent(id) + '/';
export const itemLookupUrl = (id) => '/item/?id=' + encodeURIComponent(id);
export const categories = {
  shoes:'Shoes', 'hoodies-sweaters':'Hoodies & sweaters', 't-shirts':'T-shirts', jackets:'Jackets',
  'pants-shorts':'Pants & shorts', accessories:'Accessories', headwear:'Headwear', jersey:'Jerseys',
  electronics:'Electronics', ShortSets:'Sets', 'other-stuff':'Other finds',
};

export function findItemId(text) {
  const value = text.trim();
  if (/^\d{5,20}$/.test(value)) return value;
  try {
    const url = new URL(value.startsWith('http') ? value : 'https://' + value);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    const host = url.hostname.replace(/^www\./, '');
    const id = host === 'weidian.com' ? url.searchParams.get('itemID') :
      host === 'orientdig.com' && url.pathname.replace(/\/$/, '') === '/product' && url.searchParams.get('shop_type') === 'weidian' ?
        url.searchParams.get('id') : '';
    return /^\d{5,20}$/.test(id ?? '') ? id : '';
  } catch { return ''; }
}
