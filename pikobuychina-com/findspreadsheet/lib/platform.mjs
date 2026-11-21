export const sourceOrigin = 'https://findspreadsheet.com';
export const registerUrl = 'https://www.pikobuy.com/register?invitedCode=KPNJVF&inviteUserId=1109716';
export const categories = [
  ['shoes', 'Shoes', 'Sneakers, boots & more', 'shoe'],
  ['hoodies-sweaters', 'Hoodies', 'Sweats & knitwear', 'hoodie'],
  ['t-shirts', 'T-shirts', 'Graphic tees & basics', 'shirt'],
  ['jackets', 'Jackets', 'Outerwear & layers', 'jacket'],
  ['pants-shorts', 'Pants & shorts', 'Denim, cargos & more', 'pants'],
  ['headwear', 'Headwear', 'Caps & beanies', 'hat'],
  ['accessories', 'Accessories', 'Bags, jewelry & extras', 'bag'],
  ['jersey', 'Jerseys', 'Football & teamwear', 'jersey'],
  ['electronics', 'Electronics', 'Audio & tech accessories', 'tech'],
  ['other-stuff', 'Other finds', 'Explore the rest', 'box'],
  ['ShortSets', 'Short sets', 'Matching tops & shorts', 'shirt'],
];
export const categoryName = (slug) => categories.find(([key]) => key.toLowerCase() === slug?.toLowerCase())?.[1] || 'Finds';
export const sourceItem = (id) => new URL('/item.html?itemID=' + id, 'https://weidian.com').href;
export function buyUrl(id) {
  const url = new URL('/product/detail', 'https://www.pikobuy.com');
  url.searchParams.set('productUrl', sourceItem(id));
  return url.href;
}
export function itemId(input) {
  const value = input.trim();
  if (/^\d{6,16}$/.test(value)) return value;
  try {
    let parsed = new URL(value);
    if (['pikobuy.com','www.pikobuy.com'].includes(parsed.hostname)) parsed = new URL(parsed.searchParams.get('productUrl') || '');
    const id = parsed.searchParams.get('itemID') || '';
    return ['weidian.com','www.weidian.com'].includes(parsed.hostname) && /^\d{6,16}$/.test(id) ? id : '';
  } catch {return '';}
}
export function productPath(input) {
  try {
    const url = new URL(input.trim(), sourceOrigin);
    if (url.protocol !== 'https:' || !['findspreadsheet.com','www.findspreadsheet.com'].includes(url.hostname)) return '';
    return /^\/[\w-]+\/[\w-]+\.html$/.test(url.pathname) ? url.pathname : '';
  } catch { return ''; }
}

export function mainSearch(query) {
  const url = new URL('/search.html', sourceOrigin);
  url.searchParams.set('channelid', '2');
  url.searchParams.set('keywords', query);
  return url.href;
}

export function localizedPath(path) {
  return (document.documentElement.dataset.localeBase || '') + path;
}

export function detailPath(product) {
  const {id,path} = product;
  const params = new URLSearchParams();
  if (id) params.set('id',id);
  if (path) params.set('from',path);
  return localizedPath('/finds/product') + '?' + params;
}

export function catalogCategoryPath(category) {
  const routes = {'hoodies-sweaters':'sweatshirts', jersey:'jerseys', ShortSets:'short-sets', 'other-stuff':'other-items'};
  return localizedPath('/categories/' + (routes[category] || category));
}
