import records from '../data/catalog.json';
import productOptions from '../data/product-options.json';
import agentLinks from '../data/agent-links.json';

export const catalog = records;
export const platformGuide = 'https://findspreadsheet.com/ponybuy/';
export const mainCatalog = 'https://findspreadsheet.com/AllProducts/';
export const ponySignup = 'https://m.ponybuy.com/?inviteCode=34341bc49a';
export const ponySample = purchaseUrl({ source: 'weidian', id: '7871821866' });

const orderedCategories = ['shoes', 't-shirts', 'jackets', 'hoodies', 'hoodies-sweaters', 'accessories', 'jersey', 'electronics'];

export const categories = [...new Map(records.map((item) => [item.categorySlug, item.category])).entries()]
  .sort(([first], [second]) => {
    const rank = (name) => orderedCategories.includes(name) ? orderedCategories.indexOf(name) : orderedCategories.length;
    return rank(first) - rank(second) || first.localeCompare(second);
  });

export function productPath(item) {
  return '/product/' + item.source + '-' + item.id + '/';
}

const emptyProduct = { gallery: [], groups: [] };

export function getProductData(item) {
  return productOptions[item.id] ?? emptyProduct;
}

export function getAgentLinks(item) {
  return agentLinks[item.id] ?? [];
}

export function purchaseUrl(item) {
  if (item.source !== 'weidian') return undefined;
  const params = new URLSearchParams({ id: item.id, platform_id: '3' });
  return 'https://m.ponybuy.com/pages/products/details?' + params;
}
