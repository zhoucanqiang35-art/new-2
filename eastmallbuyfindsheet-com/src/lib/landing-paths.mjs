import verifiedShopItems from './weidian-shop-items.json';

const categorySlugs = {
  shoes: 'shoes', 'hoodies-sweaters': 'hoodies-sweaters', 't-shirts': 't-shirts',
  jackets: 'jackets', 'pants-shorts': 'pants-shorts', headwear: 'headwear',
  ShortSets: 'short-sets', jersey: 'jersey', accessories: 'accessories',
  electronics: 'electronics', 'other-stuff': 'other-stuff',
};
export const categoryOrder = Object.keys(categorySlugs);
const shopItems = new Set(verifiedShopItems);
export const isShopItem = (id) => shopItems.has(id);

export const indexedProductIds = verifiedShopItems;
export const indexedProductPath = (id) => '/products/' + id + '/';
export const hasProductLanding = (id) => isShopItem(id);
export const categorySlug = (key) => Object.hasOwn(categorySlugs, key) ? categorySlugs[key] : '';
export const categoryLanding = (key) => categorySlug(key) ? '/categories/' + categorySlug(key) + '/' : '';
export const categoryFinds = (key) => '/spreadsheet/?category=' + encodeURIComponent(key);
