import {sourceOrigin} from './platform.mjs';

function decode(value) {
  const entities = {amp:'&', quot:'"', apos:"'", lt:'<', gt:'>', nbsp:' '};
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (matched, name) => {
    if (!name.startsWith('#')) return entities[name] || matched;
    const hex = name[1].toLowerCase() === 'x';
    const code = Number.parseInt(name.slice(hex ? 2 : 1), hex ? 16 : 10);
    return code <= 0x10ffff ? String.fromCodePoint(code) : matched;
  }).trim();
}
function mainPath(value, pattern) {
  try {
    const parsed = new URL(value, sourceOrigin);
    return parsed.origin === sourceOrigin && pattern.test(parsed.pathname) ? parsed.pathname : '';
  } catch {return '';}
}
export function parseProducts(html) {
  const products = [];
  for (const match of html.matchAll(/<button\b[^>]*\bdata-cart-weidian="\d+"[^>]*>/gi)) {
    const attrs = Object.fromEntries([...match[0].matchAll(/data-cart-([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)]));
    const path = mainPath(attrs.url, /^\/[^/]+\/[^/]+\.html$/);
    const image = mainPath(attrs.image, /^\/uploads\//);
    if (!path || !image || !attrs.title || !/^\d{6,16}$/.test(attrs.weidian)) continue;
    const before = html.slice(Math.max(0, match.index - 1600), match.index);
    const views = Number([...before.matchAll(/data-fs-view-aid="\d+">\s*(\d+)/g)].at(-1)?.[1] || 0);
    const date = Number([...before.matchAll(/data-date="(\d+)"/g)].at(-1)?.[1] || 0);
    const price = /^\d+(\.\d+)?$/.test(attrs.price) ? Number(attrs.price) : null;
    const category = path.split('/')[1];
    products.push({id:attrs.weidian,title:attrs.title,price,image,path,category,views,date});
  }
  return products;
}
export function parseSearchResults(html) {
  const results = [];
  const cards = html.split(/<div class="product-card glass-card"/i).slice(1);
  for (const card of cards) {
    const match = card.match(/<a href="([^"]+)" class="product-image">\s*<img[^>]+data-src="([^"]+)"[^>]+alt="([^"]*)"/i);
    if (!match) continue;
    const path = mainPath(decode(match[1]), /^\/[^/]+\/[^/]+\.html$/);
    const image = mainPath(decode(match[2]), /^\/uploads\//);
    const title = decode(match[3]);
    if (!path || !image || !title) continue;
    const price = card.match(/class="product-price">\s*(\d+(?:\.\d+)?)\s*</)?.[1];
    const views = card.match(/class="product-views">[\s\S]{0,160}?<span(?: [^>]*)?>\s*(\d+)/)?.[1];
    const date = card.match(/data-date="(\d+)"/)?.[1];
    results.push({id:null,title,path,image,price:price ? Number(price) : null,views:Number(views||0),date:Number(date||0),category:path.split('/')[1]});
  }
  return results;
}
export function parseGallery(html) {
  const gallery = html.split('class="product-price"')[0].split('class="product-gallery"').at(-1);
  return [...new Set([...gallery.matchAll(/data-src="([^"]+)"/g)].map(([, url]) => mainPath(decode(url), /^\/uploads\//)).filter(Boolean))];
}
export function findNextPage(html, url) {
  for (const [, href] of html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>\s*Next\s*<\/a>/gi)) {
    const next = new URL(decode(href), url);
    if (next.origin === sourceOrigin) return next.href;
  }
  return null;
}
export async function lookupQc(id, request = fetch) {
  const response = await request(sourceOrigin + '/qcradar-qc.php?item=' + id, {
    headers: {accept:'application/json'},
    signal: AbortSignal.timeout(4500),
  });
  if (!response.ok) throw new Error('QC service unavailable');
  const data = await response.json();
  const photos = (Array.isArray(data.images) ? data.images : [])
    .filter((entry) => !entry.isVideo && typeof entry.display === 'string' && entry.display.startsWith('https://'))
    .map((entry) => ({url:entry.display,label:typeof entry.skuLabel === 'string' ? entry.skuLabel : ''}));
  return {status:data.status,photos};
}
