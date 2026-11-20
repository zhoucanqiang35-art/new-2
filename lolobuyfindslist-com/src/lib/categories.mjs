import catalog from '../../public/data/catalog.json';
import {categories} from './catalog.mjs';

export const categoryOrder = ['shoes', 'hoodies-sweaters', 't-shirts', 'jackets', 'pants-shorts', 'headwear',
  'ShortSets', 'jersey', 'accessories', 'electronics', 'other-stuff'];
const counts = new Map(categoryOrder.map((key) => [key, 0]));
for (const item of catalog) {
  if (counts.has(item.category) && /^\d+$/.test(item.weidianId)) counts.set(item.category, counts.get(item.category) + 1);
}
export const categoryEntries = categoryOrder.map((key) => ({key, name: categories[key], count: counts.get(key)}));
export const listingCount = [...counts.values()].reduce((total, count) => total + count, 0);
