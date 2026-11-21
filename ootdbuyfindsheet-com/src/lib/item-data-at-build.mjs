import { readFileSync } from 'node:fs';
import { catalog, categoryCards } from './categories-at-build.mjs';
import { productCategory } from './settings.mjs';
import { productPhotoUrls } from './product-guide.mjs';

const galleries = JSON.parse(readFileSync('src/data/galleries.json','utf8'));
const ignored = new Set(['with','for','the','and','pack','set','collection','product']);
const words = value => [...new Set(value.toLowerCase().match(/[a-z]{3,}/g) ?? [])]
  .filter(word=>!ignored.has(word));

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

const products = catalog.map(product=>({...product,name:fullName(product),category:productCategory(product)}));
const entries = new Map();
const categoryRows = new Map();
for (const product of products) {
  const category = productCategory(product);
  const row = {product, category, terms:words(product.name + ' ' + product.sourcePath)};
  entries.set(product.weidianId,row);
  if (!categoryRows.has(category)) categoryRows.set(category,[]);
  categoryRows.get(category).push(row);
}
const postings = new Map();
for (const row of entries.values()) {
  for (const term of row.terms) {
    const key = row.category+'|'+term;
    if (!postings.has(key)) postings.set(key,[]);
    postings.get(key).push(row);
  }
}
const compact = ({product}) => {
  const {id,weidianId,name,category,price,image} = product;
  return {id,weidianId,name,category,price,image};
};
export function itemData(id) {
  const row = entries.get(id);
  if (!row) return null;
  const {product, category, terms} = row;
  const scores = new Map();
  for (const term of terms) {
    const matches = postings.get(category+'|'+term) ?? [];
    if (matches.length > 250) continue;
    for (const entry of matches) {
      if (entry === row) continue;
      scores.set(entry, (scores.get(entry) ?? 0) + 1 / Math.sqrt(matches.length));
    }
  }
  const ranked = [...scores].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([entry])=>entry);
  for (const other of categoryRows.get(category)) {
    if (ranked.length === 8) break;
    if (other !== row && !ranked.includes(other)) ranked.push(other);
  }
  return {product, photos:productPhotoUrls(product,galleries[product.id]), related:ranked.map(compact)};
}

export const featuredIds = [...new Set([
  '7866623967','7321418559',
  ...categoryCards.flatMap(({key,image})=>[
    ...(categoryRows.get(key) ?? []).filter(({product})=>image === '/media/product-'+product.id+'.webp').slice(0,1).map(({product})=>product.weidianId),
    ...[...(categoryRows.get(key) ?? [])].slice(0,1).map(({product})=>product.weidianId),
  ]),
])].filter(id=>entries.has(id));
