import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { load } from 'cheerio/slim';
import worker from '../dist/server/index.js';
import { findspreadsheet, purchase } from '../src/lib/fansbuy.js';

const data = path => readFile(new URL(path, import.meta.url), 'utf8').then(JSON.parse);
const catalog = await data('../src/data/main-catalog.json');
const catalogPaths = new Set(catalog.map(([path]) => path));
assert.equal(catalogPaths.size, catalog.length, 'Duplicate catalog paths');

const readHome = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const home = load(readHome);
const featuredLinks = home('.featured-card a').map((_, node) => home(node).attr('href')).get();
assert.equal(featuredLinks.length, 15, 'Homepage featured card count');
const featuredPaths = featuredLinks.map(link => new URL(link, 'https://preview.local').searchParams.get('path'));
assert.equal(new Set(featuredPaths).size, featuredPaths.length, 'Duplicate homepage cards');
const { items } = await data('../public/visual-index.json');
const searchPaths = new Set(items.map(([path]) => path).filter(path => path.endsWith('.html')));
for (const path of [...featuredPaths, ...searchPaths]) assert(catalogPaths.has(path), 'Missing detail source ' + path);

// Packaged records must still work when FindSpreadsheet is unavailable.
const requests = [];
globalThis.fetch = async url => {
  requests.push(String(url));
  throw new Error('Upstream is disabled for this check');
};
for (const [path, , id, cover, price] of catalog) {
  const url = new URL('/api/product', 'https://preview.local');
  url.searchParams.set('path', path);
  const response = await worker.fetch(new Request(url));
  assert.equal(response.status, 200, path);
  const data = await response.json();
  assert(data.name.trim(), path);
  assert.equal(data.id, id, path);
  assert.equal(data.buy, purchase(id), path);
  assert.equal(data.price, price, path);
  assert.equal(data.images[0], new URL(cover, findspreadsheet).href, path);
  assert.equal(data.source, new URL(path, findspreadsheet).href, path);
}
assert.deepEqual(requests, []);
console.log(`Validated ${catalog.length} product details, ${featuredPaths.length} homepage cards, and ${searchPaths.size} visual-search product links.`);

const embeddedPath = '/hoodies-sweaters/colorblock-zip-hoodie-and-joggers-8643.html';
const productUrl = new URL('/product/', 'https://preview.local');
productUrl.searchParams.set('path', embeddedPath);
const documentResponse = await worker.fetch(new Request(productUrl));
const document = load(await documentResponse.text());
const embedded = JSON.parse(document('#product-seed').text());
assert.equal(embedded.id, '7869189935');
assert.equal(embedded.qc.images.length, 5);
assert.equal(document('#primary-image').attr('src'), embedded.images[0]);
assert.equal(document('#primary-image').attr('fetchpriority'), 'high');
assert(document('#qc').is('[open]'));
assert.equal(documentResponse.headers.get('cache-control'), 'private, no-cache');

productUrl.searchParams.set('path', 'missing');
const fallback = load(await (await worker.fetch(new Request(productUrl))).text());
assert.equal(fallback('#product-seed').text(), 'null');
assert.equal(fallback('#primary-image').attr('src'), undefined);
assert.deepEqual(requests, []);
console.log('Product document supplies its cover and saved photos without a data request.');
