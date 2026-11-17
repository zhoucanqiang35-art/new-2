import fs from 'node:fs';import path from 'node:path';import {gzipSync} from 'node:zlib';
import { releaseInfo } from './release-info.mjs';
const cloudflare = process.argv.includes("--cloudflare");
const files={};function walk(dir){for(const x of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,x.name);if(x.isDirectory())walk(p);else {const relative=p.slice(5);const key=relative.endsWith('index.html')?'/'+relative.slice(0,-10):'/'+relative;const compress=key.startsWith('/image-index/');files[key]={body:(compress?gzipSync(fs.readFileSync(p)):fs.readFileSync(p)).toString('base64'),...(compress?{encoding:'gzip'}:{}),type:p.endsWith('.html')?'text/html; charset=utf-8':p.endsWith('.png')?'image/png':p.endsWith('.webp')?'image/webp':p.endsWith('.jpg')||p.endsWith('.jpeg')?'image/jpeg':p.endsWith('.css')?'text/css':p.endsWith('.js')?'application/javascript':p.endsWith('.json')?'application/json':'text/plain'};}}}if (!cloudflare) walk('dist');
const source=fs.readFileSync('src/lib/pricing.mjs','utf8').replaceAll('export ','')+'\n'+fs.readFileSync('server/purchase-images.mjs','utf8').replaceAll('export ','')+'\n'+fs.readFileSync('server/catalog.mjs','utf8').replaceAll('export ','')+'\n'+fs.readFileSync('server/search.mjs','utf8').replaceAll('export ','')+'\n'+fs.readFileSync('server/exchange-rates.mjs','utf8').replaceAll('export ','');const cats=fs.readFileSync('src/all-categories.json','utf8');
const snapshot=fs.readFileSync('data/catalog-snapshot.json','utf8');
const details=fs.readFileSync('data/product-details.json','utf8');
const officialSnapshots=fs.readFileSync('data/usfans-purchase-images.json','utf8');
const mainQc=fs.readFileSync('data/main-qc-snapshot.json','utf8');
const rate=fs.readFileSync('data/usd-rate.json','utf8');
const exchangeSnapshot=fs.readFileSync('data/exchange-rates.json','utf8');
// Leave catalog parsing and individual asset decoding until a request needs them.
const data = {mainQc, officialSnapshots, details, snapshot};
const datasets = Object.entries(data)
  .map(([name, json]) => 'const get_' + name + ' = lazyJson(' + JSON.stringify(json) + ');')
  .join('\n');
const assets = {};
const chunks = [];
let offset = 0;
for (const [route, {body, ...metadata}] of Object.entries(files)) {
  assets[route] = {...metadata, start: offset, end: offset + body.length};
  chunks.push(body);
  offset += body.length;
}
const code = `function lazyJson(json) {
  let parsed;
  return () => {
    if (parsed === undefined) {
      parsed = JSON.parse(json);
      json = '';
    }
    return parsed;
  };
}
${datasets}
const exchangeRateSnapshot = ${exchangeSnapshot};
const usdRate = ${rate};
let productIndex;
function getProductIndex() {
  return productIndex ??= Object.fromEntries(
    Object.values(get_snapshot().pages).flatMap(page => page.products.map(product => [product.id, product]))
  );
}
${source}
const assetData = ${JSON.stringify(chunks.join(''))};
const assets = ${JSON.stringify(assets)};
const categories = ${cats};
const release = ${JSON.stringify(releaseInfo())};
export default {async fetch(request, env){const u=new URL(request.url);let route=u.pathname;
if (route === '/api/health') {
  const headers = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' };
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { ...headers, allow: 'GET' } });
  return Response.json({ status: 'ok', ...release }, { headers });
}
if(route==='/api/qc-image'){const item=getProductIndex()[u.searchParams.get('product')];const wanted=u.searchParams.get('path')||'';if(!item||wanted.length>1024||!wanted.startsWith('/')||wanted.includes('..'))return new Response('Invalid image reference',{status:400});let image;try{const qc=await mainQcData(item.productId,10000);image=qc?.images.find(i=>new URL(i.display).pathname===wanted)?.display}catch{}if(!image)return new Response('The QC image source is temporarily unavailable. Open the product page to check current photos.',{status:404,headers:{'cache-control':'no-store'}});return new Response(null,{status:302,headers:{location:image,'cache-control':'public, max-age=120'}})}if(route==='/api/exchange-rates'){if(request.method!=='GET')return new Response('Method not allowed',{status:405});try{return Response.json(await exchangeRates(u.searchParams.get('refresh')==='1'),{headers:{'cache-control':u.searchParams.has('refresh')?'no-store':'public, max-age=300'}})}catch{return Response.json({base:'USD',rates:{USD:1},status:'unavailable'},{status:503})}}if(route==='/api/search'){if(request.method!=='GET')return new Response('Method not allowed',{status:405});return Response.json(searchApi(u),{headers:{'cache-control':'public, max-age=60'}})}if(!route.includes('.')&&!route.endsWith('/'))return Response.redirect(u.origin+route+'/'+u.search,301);let asset=assets[route];let body;
if (${cloudflare}) {
  const template = await env.ASSETS.fetch(request);
  const headers = new Headers(template.headers);
  headers.set('x-robots-tag', 'noindex, nofollow');
  if (route === '/image-index.json') headers.set('cache-control', 'public, max-age=60');
  if (route.startsWith('/image-index/')) headers.set('cache-control', 'public, max-age=31536000, immutable');
  const type = headers.get('content-type') || '';
  if (!template.ok || !type.startsWith('text/html')) return new Response(template.body, {status:template.status, headers});
  asset = {type};
  body = await template.text();
} else {
  if(!asset)return new Response('Page not found',{status:404});
  body=Uint8Array.from(atob(assetData.slice(asset.start,asset.end)),c=>c.charCodeAt(0));
}
if(asset.encoding==='gzip'){const json=new Blob([body]).stream().pipeThrough(new DecompressionStream('gzip'));return new Response(json,{headers:{'content-type':asset.type,'cache-control':'public, max-age=31536000, immutable','x-robots-tag':'noindex, nofollow'}})}if(asset.type.startsWith('text/html')){if(typeof body!=='string')body=new TextDecoder().decode(body);if(body.includes('<!--SEARCH-->')){const page=Math.max(1,Math.floor(Number(u.searchParams.get('page')||1))||1);body=body.replace('<!--SEARCH-->',renderSearch(u.searchParams.get('q')||'',page));body=body.replace('id="global-search"','id="global-search" value="'+esc((u.searchParams.get('q')||'').slice(0,200))+'"');}const marker=body.match(/<!--CATALOG:([\\w-]+)-->/);if(marker){const page=Number(u.searchParams.get('page')||1);if(!Number.isSafeInteger(page)||page<1||page>1000)return new Response('Invalid page',{status:400});try{body=body.replace(marker[0],await renderCatalog(marker[1],page,categories))}catch{body=body.replace(marker[0],failure)}}if(body.includes('<!--PRODUCT-->')){try{const productHtml=await renderProduct(u.searchParams.get('source')||'',categories);body=body.replace('<!--PRODUCT-->',productHtml);const productTitle=productHtml.match(new RegExp('<h1[^>]*>([^<]*)</h1>'))?.[1];if(productTitle)body=body.replace(body.slice(body.indexOf('<title>'),body.indexOf('</title>')+8),'<title>'+productTitle+' | USFans Findsheet</title>')}catch{body=body.replace('<!--PRODUCT-->',failure)}}}return new Response(body,{headers:{'content-type':asset.type,'cache-control':asset.type.startsWith('text/html')?'public, max-age=0, must-revalidate':route==='/image-index.json'?'public, max-age=60':'public, max-age=86400','x-robots-tag':'noindex, nofollow'}})}};`;
if (cloudflare) {
  fs.renameSync('dist', 'dist-public-tmp');
  fs.mkdirSync('dist');
  fs.renameSync('dist-public-tmp', 'dist/client');
} else {
  fs.rmSync('dist',{recursive:true});
}
fs.mkdirSync('dist/server',{recursive:true});fs.writeFileSync('dist/server/index.js',code);console.log(cloudflare ? 'Cloudflare Worker and static assets built.' : 'Embedded Astro pages and live catalog Worker built.');
