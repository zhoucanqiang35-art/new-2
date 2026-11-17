import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { releaseInfo } from './release-info.mjs';
import worker from '../dist/server/index.js';

const origin = 'https://usfansfindsheet.test';
const env = {
  ASSETS: {
    async fetch(request) {
      const url = new URL(request.url);
      const page = url.pathname.endsWith('/');
      const file = new URL('..' + '/dist/client' + url.pathname + (page ? 'index.html' : ''), import.meta.url);
      try {
        const body = await readFile(file);
        const type = page ? 'text/html' : 'application/json';
        return new Response(body, { headers: { 'content-type': type } });
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        return new Response('Not found', { status: 404 });
      }
    },
  },
};
const request = (path, method = 'GET') => worker.fetch(new Request(origin + path, { method }), env);

const health = await request('/api/health');
assert.equal(health.status, 200);
assert.equal(health.headers.get('cache-control'), 'no-store');
assert.deepEqual(await health.json(), { status: 'ok', ...releaseInfo() });
assert.equal((await request('/api/health', 'POST')).status, 405);

for (const [route, marker] of [['/', 'home-faq'], ['/image-search/', 'catalog-image-file'], ['/search/?q=shoes', 'Results for']]) {
  const response = await request(route);
  assert.equal(response.status, 200, route);
  assert((await response.text()).includes(marker), `${route} is missing ${marker}`);
}

const results = await (await request('/api/search?ids=5977')).json();
assert(results.products.some(product => product.id === '5977'), 'Known listing is missing');
const manifest = await (await request('/image-index.json')).json();
assert(manifest.shards.length > 0, 'Image index has no shards');
let images = 0;
for (const shard of manifest.shards) {
  const response = await request(shard.url);
  assert.equal(response.status, 200, shard.url);
  const payload = Buffer.from(await response.arrayBuffer());
  const hash = createHash('sha256').update(payload).digest('hex').slice(0, 16);
  assert(shard.url.endsWith(`-${hash}.json`), `Image shard checksum mismatch: ${shard.url}`);
  const count = JSON.parse(payload).length;
  assert.equal(count, shard.images, shard.url);
  images += count;
}
assert.equal(images, manifest.indexedImages);
console.log(`Release checks passed: homepage, search, release metadata, and ${images.toLocaleString('en-US')} indexed images in ${manifest.shards.length} shards.`);
