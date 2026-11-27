import { readdirSync, readFileSync } from 'node:fs';
import supplements from '../data/seller-photo-supplements.json' with { type: 'json' };
import { productImage, source } from './shared.js';

const albumDir = 'public/data/listing-photos/';
const skuDir = 'public/data/sku/';
const skuImages = new Map(readdirSync(skuDir).filter((name) => name.endsWith('.json')).map((name) => [
  name.slice(0, -5), JSON.parse(readFileSync(skuDir + name, 'utf8')).images,
]));
const shards = new Map();

function archivedPhotos(item) {
  const record = item.path.match(/-(\d+)\.html$/)?.[1];
  if (!record) return [];
  const shard = Math.floor(Number(record) / 100);
  if (!shards.has(shard)) {
    try {
      shards.set(shard, JSON.parse(readFileSync(albumDir + shard + '.json', 'utf8')));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      shards.set(shard, {});
    }
  }
  return shards.get(shard)[record] || [];
}

export function listingPhotos(item) {
  const urls = [productImage(item), ...archivedPhotos(item), ...(supplements[item.id] || []), ...(skuImages.get(item.id) || [])];
  const photos = new Map();
  for (const value of urls) {
    if (typeof value !== 'string' || !value) continue;
    const url = new URL(value, source);
    if (url.protocol !== 'https:' || url.username || url.password) continue;
    if (!photos.has(url.href)) photos.set(url.href, value.startsWith('/media/') ? value : url.href);
  }
  return [...photos.values()];
}
