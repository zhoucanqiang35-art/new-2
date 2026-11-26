import { readFileSync } from 'node:fs';
import { source, warehouse } from './site';

export function getListingPhotos(item) {
  const warehousePhotos = [...new Set((warehouse[item?.id] || []).map(({ image }) => image))];
  const record = item?.path.match(/-(\d+)\.html$/)?.[1];
  let archived = [];
  if (record) {
    try {
      const shard = readFileSync('public/data/listing-photos/' + Math.floor(Number(record) / 100) + '.json', 'utf8');
      archived = (JSON.parse(shard)[record] || []).map((path) => new URL(path, source).href);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const productPhotos = [...new Set([item?.image, ...(item?.images || []), ...archived].filter(Boolean))]
    .filter((url) => !warehousePhotos.includes(url));
  const sellerPhotos = productPhotos.slice(1);
  const gallery = [...new Set([...sellerPhotos, ...warehousePhotos, ...productPhotos])];
  const photoSource = sellerPhotos.length ? 'sellerLabel' : warehousePhotos.length ? 'warehouseLabel' : 'productPhotos';
  return { productPhotos, gallery, photoSource };
}
