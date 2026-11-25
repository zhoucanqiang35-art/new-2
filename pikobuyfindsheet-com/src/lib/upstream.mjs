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
  if (String(data.itemId) !== id || !Array.isArray(data.images)) {
    throw new Error('Unexpected QC response from FindSpreadsheet');
  }
  const seen = new Set();
  const photos = data.images.flatMap((entry) => {
    if (entry?.isVideo || typeof entry?.display !== 'string') return [];
    const image = URL.parse(entry.display);
    if (image?.protocol !== 'https:' || image.username || image.password) return [];
    const key = entry.mediaId ?? image.origin + image.pathname;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{
      url: image.href,
      label: typeof entry.skuLabel === 'string' ? entry.skuLabel : '',
      agent: typeof entry.agentPlatform === 'string' ? entry.agentPlatform : '',
    }];
  });
  return {status: data.degraded && !photos.length ? 'pending' : data.status, photos};
}


export async function lookupProductOptions(id) {
  const url = new URL('/api/Goods/getSkuData', sourceOrigin);
  url.searchParams.set('weidian_id', id);
  const response = await fetch(url, {headers:{accept:'application/json'}, signal:AbortSignal.timeout(4500)});
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Seller options are unavailable');
  const data = await response.json();
  if (String(data.weidian_id) !== id || typeof data.title !== 'string') return null;

  function photo(value) {
    if (typeof value !== 'string' || !value) return '';
    const image = URL.parse(value, sourceOrigin);
    if (image?.protocol === 'https:' && (image.origin === sourceOrigin || image.hostname.endsWith('.geilicdn.com'))) {
      return image.href;
    }
    return '';
  }

  const photos = [...new Set((Array.isArray(data.images) ? data.images : []).slice(0, 80).map(photo).filter(Boolean))];
  const attributes = Array.isArray(data.specifications?.attrs) ? data.specifications.attrs : [];
  const groups = attributes.slice(0, 6).flatMap((attribute) => {
    if (typeof attribute.attr_title !== 'string' || !Array.isArray(attribute.attr_values)) return [];
    const name = attribute.attr_title.trim().slice(0, 80);
    const values = attribute.attr_values.slice(0, 180).flatMap((value) => {
      const label = value.attr_value ?? value.name;
      const id = String(value.attr_id ?? value.id ?? '');
      return typeof label === 'string' && label.trim() ? [{id:/^\d+$/.test(id) ? id : '', label:label.trim().slice(0, 160), image:photo(value.img ?? value.image)}] : [];
    });
    return name && values.length ? [{name, values}] : [];
  });
  const variants = Object.values(data.specifications?.skus ?? {}).slice(0, 10000).flatMap((sku) => {
    const ids = String(sku?.attr_ids ?? '').split('-');
    const price = Number(sku?.price);
    return ids.length === groups.length && ids.every(id => /^\d+$/.test(id)) &&
      Number.isFinite(price) && price > 0 ? [{key:ids.sort().join('-'), price}] : [];
  });
  const price = Number(data.price);
  return {title:data.title.trim(), price:data.price != null && Number.isFinite(price) && price >= 0 ? price : null, photos, groups, variants};
}
