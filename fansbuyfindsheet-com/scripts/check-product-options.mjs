import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import worker from '../dist/server/index.js';
import { productOptions } from '../src/lib/product-options.js';

const data = name => readFile(new URL('../src/data/' + name, import.meta.url), 'utf8').then(JSON.parse);
const catalog = await data('main-catalog.json');
const known = await data('preview-sku.json');
const catalogIds = new Set(catalog.flatMap(product => product[2] ? [product[2]] : []));
const cap = '7700252457';
const unsaved = [...catalogIds].find(id => !Object.hasOwn(known, id));
for (const id of Object.keys(known)) assert(catalogIds.has(id), id);

const requests = [];
let directResponse;
globalThis.fetch = async input => {
  const url = new URL(input, 'https://preview.local');
  requests.push(url);
  if (url.origin === 'https://preview.local') return worker.fetch(new Request(url));
  assert.equal(url.origin, 'https://findspreadsheet.com');
  if (!directResponse) throw new Error('Source unavailable');
  return Response.json(directResponse);
};

const savedCap = await productOptions(cap);
assert.deepEqual(savedCap.groups[0].options.map(option => option.label),
  Array.from({ length: 16 }, (_, index) => String(index + 1).padStart(2, '0')));
assert(savedCap.groups[0].options.every(option => option.image.startsWith('https://si.geilicdn.com/')));
assert.equal(requests.length, 1);
assert.equal(requests[0].searchParams.get('snapshot'), '1');

requests.length = 0;
directResponse = { weidian_id: unsaved, images: ['https://si.geilicdn.com/seller-photo.jpg'] };
assert.deepEqual(await productOptions(unsaved), { groups: [], images: directResponse.images });
assert.equal(requests.length, 2);
assert.equal(requests[1].searchParams.get('weidian_id'), unsaved);

requests.length = 0;
directResponse.weidian_id = cap;
assert.deepEqual(await productOptions(unsaved), { groups: [], images: [] });
assert(requests.some(url => url.pathname === '/api/sku' && !url.searchParams.has('snapshot')));
console.log(`Verified ${Object.keys(known).length} cached IDs, official cap option order, and source fallback with matching item IDs.`);
