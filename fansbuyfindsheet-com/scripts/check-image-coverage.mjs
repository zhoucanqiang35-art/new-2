import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import worker from '../dist/server/index.js';
import { productPath } from '../src/lib/fansbuy.js';

const get = path => worker.fetch(new Request('https://preview.local' + path));
const json = async path => {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  return response.json();
};
const base = await json('/visual-index.json');
const extra = await json('/visual-index-extra.json');
const all = [...base.items, ...extra.items];
const catalog = JSON.parse(await readFile(new URL('../src/data/main-catalog.json', import.meta.url), 'utf8'));
const catalogPaths = new Set(catalog.map(([path]) => path));
const images = new Set(all.map(([, , , image]) => image));
for (const directory of ['agents', 'brand', 'featured', 'guide', 'qc']) {
  for (const file of await readdir(new URL('../public/' + directory, import.meta.url))) {
    assert(images.has('/' + directory + '/' + file), file + ' is absent from image search');
  }
}
for (const [path, vector, name, image, , kind] of extra.items) {
  assert.equal(Buffer.from(vector, 'base64').length, 192, path);
  assert(name && image, path);
  assert(['cover', 'gallery', 'variant', 'qc', 'site'].includes(kind), kind);
  if (kind !== 'site' && !path.startsWith('/qc-photos/?id=')) {
    assert(productPath.test(path), path);
    assert(catalogPaths.has(path), path);
  }
}
const paths = JSON.parse(await readFile(new URL('../src/data/main-archive-paths.json', import.meta.url), 'utf8'));
const id = Object.keys(paths)[0];
const { products } = await json('/api/image-products?ids=' + id);
assert.equal(products[id].path, paths[id]);
console.log(`Verified ${extra.items.length} new search records, all local site images, and archive result links.`);
