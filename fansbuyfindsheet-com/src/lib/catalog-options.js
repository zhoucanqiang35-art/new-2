import verifiedSku from '../data/preview-sku.json';

export function savedSellerOptions(id) {
  if (!Object.hasOwn(verifiedSku, id)) return null;
  const saved = verifiedSku[id];
  return Array.isArray(saved) ? { groups: saved, images: [] } : saved;
}
