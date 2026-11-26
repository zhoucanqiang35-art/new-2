import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buy, catalog, categoryNames, price, productImage, sample, selectProducts } from '../src/lib/data.js';
import worker from '../public/_worker.js';

test('main-site snapshot fits every catalog and visual index route', () => {
  assert.equal(catalog.length, 8086);
  assert.equal(new Set(catalog.map((item) => item.id)).size, catalog.length);
  for (const item of catalog) {
    assert.match(item.id, /^\d{8,15}$/);
    assert.ok(Object.hasOwn(categoryNames, item.category));
    const image = productImage(item);
    if (image.startsWith('/media/')) {
      assert.ok(readFileSync(new URL('../public' + image, import.meta.url)).length);
    } else {
      assert.match(new URL(image).hostname, /^(?:findspreadsheet\.com|[a-z.]+geilicdn\.com)$/);
    }
  }
  const index = readFileSync(new URL('../public/data/visual-index-v1.bin', import.meta.url));
  assert.equal(index.length, 37359 * 194);
  const positions = new Set();
  for (let offset = 0; offset < index.length; offset += 194) {
    const position = index.readUInt16LE(offset);
    assert.ok(position < catalog.length);
    positions.add(position);
  }
  assert.equal(positions.size, catalog.length);
});

test('maps the exact RizzitGo item ID and source', () => {
  assert.equal(buy(sample.id), 'https://rizzitgo.com/detail-page/?goodsId=7872190238&source=3');
  assert.throws(() => buy('example'), TypeError);
  assert.equal(price(sample.price), '$54.83');
  assert.equal(price(null), 'Price unavailable');
});

test('searches by term and ID, filters by category, and sorts', () => {
  assert.deepEqual(selectProducts(catalog, { query: sample.id }), [sample]);
  assert.ok(selectProducts(catalog, { query: 'sweatpants pullover' }).includes(sample));
  assert.equal(selectProducts(catalog, { query: 'unmatched-xyzxyzxyz' }).length, 0);
  const shoes = selectProducts(catalog, { category: 'shoes', sort: 'price-low' });
  assert.ok(shoes.length > 1 && shoes.every((item) => item.category === 'shoes'));
  assert.ok(shoes.every((item, index) => index === 0 || shoes[index - 1].price <= item.price));
  for (const [sort, field] of [['latest', 'date'], ['popular', 'views'], ['price-high', 'price']]) {
    const sorted = selectProducts(catalog, { sort });
    assert.ok(sorted.every((item, index) => index === 0 || sorted[index - 1][field] >= item[field]));
  }
});

test('Pages worker rejects invalid inputs and passes static requests to assets', async () => {
  const env = { ASSETS: { fetch: () => new Response('static') } };
  const request = (path, method) => worker.fetch(new Request('https://example.com' + path, { method }), env);
  assert.equal((await request('/api/qc?item=bad')).status, 400);
  assert.equal((await request('/api/gallery?path=https://elsewhere.com/thing.html')).status, 400);
  assert.equal((await request('/api/other')).status, 404);
  assert.equal((await request('/api/qc', 'POST')).status, 405);
  assert.equal(await (await request('/')).text(), 'static');
});
