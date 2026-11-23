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

const establishedProductIds = [
  '7857139190', '7872207856', '7866625981', '7873275234', '7871260262',
  '7857789312', '7872043180', '7872745692', '7853385361', '7405460467',
  '7868738327', '7869064925', '7854168601', '7869969978', '7866512819',
  '7868813833', '7403509728', '7403416956',
];

const indexedProducts = new Set([...establishedProductIds, ...verifiedShopItems]);
export const indexedProductIds = [...indexedProducts];
export const indexedProductPath = (id) => '/products/' + id + '/';
export const hasProductLanding = (id) => indexedProducts.has(id);
export const categorySlug = (key) => Object.hasOwn(categorySlugs, key) ? categorySlugs[key] : '';
export const categoryLanding = (key) => categorySlug(key) ? '/categories/' + categorySlug(key) + '/' : '';
export const categoryFinds = (key) => '/spreadsheet/?category=' + encodeURIComponent(key);
