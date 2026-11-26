import { readFileSync } from 'node:fs';
import { items } from './site';

export function getListingItems() {
  const catalog = JSON.parse(readFileSync('public/data/catalog.json', 'utf8'));
  const detailItems = new Map(catalog.map((product) => [product.id, product]));
  for (const item of Object.values(items)) {
    detailItems.set(item.id, { ...detailItems.get(item.id), ...item });
  }
  return [...detailItems.values()];
}
