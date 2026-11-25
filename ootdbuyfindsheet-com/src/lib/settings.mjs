export const mainSite = 'https://findspreadsheet.com';
export const register = 'https://ootdbuy.com/register?inviteCode=PY4OUQ9A1';
export const sampleQc = '7321418559';

export const categories = {
  shoes: 'Sneakers', 'hoodies-sweaters': 'Hoodies & knitwear', 't-shirts': 'T-shirts',
  jackets: 'Jackets', 'pants-shorts': 'Pants & shorts', accessories: 'Accessories', bags: 'Bags',
  headwear: 'Headwear', jersey: 'Jerseys', electronics: 'Electronics', ShortSets: 'Sets',
  'other-stuff': 'Other finds',
};
const cachedCovers = new Set(['4501','4515','5661','5985','6250','7046','7352','7358','7653','7979','7980','8179','8352','8381','8384','8395','8397','8573','8650','8652','8661','8704','8710','8779','8790','8939','8944','9018']);
export const coverUrl = (product) => cachedCovers.has(product.id) ? '/media/product-' + product.id + '.webp' : product.image;

export function productCategory(product) {
  if (product.category === 'accessories' && /\b(?:bags?|handbags?|backpacks?|purses?|totes?|satchels?)\b/i.test(product.name + ' ' + product.sourcePath)) return 'bags';
  return product.category;
}

export const itemUrl = (id) => '/item/?id=' + encodeURIComponent(id);
export const itemShard = id => id.slice(-3);
export const categoryUrl = (category) => '/spreadsheet/?' + new URLSearchParams({ category });
export const buyUrl = (id) => 'https://ootdbuy.com/goods/details?' + new URLSearchParams({
  id, channel: 'weidian', inviteCode: '179LQ1SVA',
});
export { priceLabel } from './currency.mjs';
export function findItemId(text) {
  const value = text.trim();
  if (/^\d{5,20}$/.test(value)) return value;
  try {
    const link = new URL(/^https?:\/\//i.test(value) ? value : 'https://' + value);
    const host = link.hostname.replace(/^www\./, '');
    let id;
    if (host === 'weidian.com') id = link.searchParams.get('itemID');
    if (host === 'ootdbuy.com' && link.pathname.replace(/\/$/, '') === '/goods/details' &&
        link.searchParams.get('channel') === 'weidian') id = link.searchParams.get('id');
    return /^\d{5,20}$/.test(id ?? '') ? id : '';
  } catch {
    return '';
  }
}
