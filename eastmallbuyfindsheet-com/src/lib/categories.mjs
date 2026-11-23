import {storeCatalog as catalog} from './store-catalog.mjs';
import {categories} from './catalog.mjs';

import {categoryOrder} from './landing-paths.mjs';

const counts = new Map(categoryOrder.map((key) => [key, 0]));
for (const item of catalog) {
  if (counts.has(item.category) && /^\d+$/.test(item.weidianId)) counts.set(item.category, counts.get(item.category) + 1);
}
export const categoryEntries = categoryOrder.map((key) => ({key, name: categories[key], count: counts.get(key)}));
export const listingCount = [...counts.values()].reduce((total, count) => total + count, 0);
