import { readFileSync } from 'node:fs';
import { catalog, categoryCards } from './categories-at-build.mjs';
import { productCategory } from './settings.mjs';
import { productPhotoUrls } from './product-guide.mjs';

const galleries = JSON.parse(readFileSync('src/data/galleries.json','utf8'));
const ignored = new Set(['with','for','the','and','pack','set','collection','product']);
const words = value => [...new Set(value.toLowerCase().match(/[a-z]{3,}/g) ?? [])]
  .filter(word => !ignored.has(word));

function fullName(item) {
  if (item.name.length < 29) return item.name;
  const slug = item.sourcePath.split('/').pop()?.replace(/-\d+\.html$/,'') ?? '';
  const source = words(slug);
  const current = words(item.name);
  if (!source.length || !current.length || !source[0].startsWith(current[0])) return item.name;
  if (source.length <= current.length && !source.some(word=>word.length>3 && current.some(part=>part.length>=3 && part!==word && word.startsWith(part)))) return item.name;
  const parts = slug.split('-').filter(Boolean);
  if (parts.join(' ').length <= item.name.length + 3) return item.name;
  return parts.map(word=>word[0].toUpperCase()+word.slice(1)).join(' ');
}

const entries = new Map(catalog.map(product => [
  product.weidianId,
  {...product, name:fullName(product), category:productCategory(product)},
]));

export function itemData(id) {
  const product = entries.get(id);
  return product ? {product, photos:productPhotoUrls(product, galleries[product.id])} : null;
}

export const featuredIds = [...new Set([
  '7866623967', '7321418559',
  ...categoryCards.flatMap(({key, productId}) => [
    productId,
    catalog.find(product => productCategory(product) === key)?.weidianId,
  ]),
])].filter(id => entries.has(id));
