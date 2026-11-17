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

const canonicalOrigin = 'https://usfansfindsheet.com';
const publicRequest = path => worker.fetch(new Request(canonicalOrigin + path), env);
const publicHome = await publicRequest('/?lang=zh-CN');
assert.equal(publicHome.headers.get('x-robots-tag'), null);
const publicHtml = await publicHome.text();
assert(publicHtml.includes('<link rel="canonical" href="' + canonicalOrigin + '/">'));
assert(!publicHtml.includes('<meta name="robots" content="noindex,nofollow"'));
assert.match((await request('/')).headers.get('x-robots-tag'), /noindex/);
assert.equal((await request('/sitemap.xml')).status, 404);

const robots = await (await publicRequest('/robots.txt')).text();
assert(robots.includes('Sitemap: ' + canonicalOrigin + '/sitemap.xml'));
assert(!robots.includes('Disallow: /'));
const xmlResponse = await publicRequest('/sitemap.xml');
assert.equal(xmlResponse.status, 200);
assert.match(xmlResponse.headers.get('content-type'), /^application\/xml/);
const xml = await xmlResponse.text();
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert(xml.startsWith('<?xml') && xml.includes('http://www.sitemaps.org/schemas/sitemap/0.9'));
assert.equal(urls.length, new Set(urls).size);
assert(urls.every(url => url.startsWith(canonicalOrigin + '/')));
assert(urls.some(url => url.includes('/product/?source=')));
assert(urls.includes(canonicalOrigin + '/guides/how-to-buy/'));
assert.equal((await publicRequest('/product/?source=%2Fshoes%2Finvalid-999999.html')).status, 404);
console.log(`SEO checks passed: ${urls.length.toLocaleString('en-US')} unique sitemap URLs, public canonical, preview noindex.`);
