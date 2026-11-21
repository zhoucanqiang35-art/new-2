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
    const withProtocol = (link) => /^(?:(?:www|m)\.)?(?:weidian|pikobuy)\.com\//i.test(link) ? 'https://' + link : link;
    let parsed = new URL(withProtocol(value));
    if (['pikobuy.com','www.pikobuy.com'].includes(parsed.hostname)) parsed = new URL(withProtocol(parsed.searchParams.get('productUrl') || ''));
    const id = parsed.searchParams.get('itemID') || '';
    return ['weidian.com','www.weidian.com','m.weidian.com'].includes(parsed.hostname) && ['https:','http:'].includes(parsed.protocol) && /^\d{6,16}$/.test(id) ? id : '';
  } catch {return '';}
}
export function mainSearch(query) {
  const url = new URL('/search.html', sourceOrigin);
  url.searchParams.set('channelid', '2');
  url.searchParams.set('keywords', query);
  return url.href;
}
