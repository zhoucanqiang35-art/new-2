import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { expandCatalogTitle, translateProductTitle } from '../public/product-title-core.js';

const root = new URL('../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const languages = await read('src/languages.json');
const products = (await read('public/catalog.json')).filter(product => /^\d+$/.test(product.weidianId));
const ids = new Set(products.map(product => product.id));
if (ids.size !== products.length) throw new Error('Product IDs must be unique');

const directory = new URL('public/i18n/catalog/', root);
await mkdir(directory, { recursive: true });
const expanded = products.map(product => ({ ...product, title: expandCatalogTitle(product) }));

for (const { code } of languages) {
  const terms = await read(`public/i18n/products/${code}.json`);
  const names = Object.fromEntries(expanded.map(({ id, title, category }) => [
    id, translateProductTitle(title, category, code, terms),
  ]));
  if (Object.values(names).some(name => !name)) throw new Error(`Empty product name in ${code}`);
  await writeFile(new URL(`${code}.json`, directory), JSON.stringify({ names, photoLabel: terms['listing photo'] ?? 'listing photo' })+'\n');
}
console.log(`${products.length} products × ${languages.length} languages. ${expanded.filter(p => p.title.length > p.name.length).length} titles expanded from source URLs.`);
