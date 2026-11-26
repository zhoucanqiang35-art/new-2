import { fetchSellerOptions } from './sku.js';

function available(options) {
  return options?.groups?.length || options?.images?.length;
}

async function siteOptions(id, snapshotOnly) {
  const query = new URLSearchParams({ id });
  if (snapshotOnly) query.set('snapshot', '1');
  const response = await fetch('/api/sku?' + query, { signal: AbortSignal.timeout(7500) });
  return response.ok ? response.json() : null;
}

export async function productOptions(id) {
  // Serve verified records locally. For the rest, the source permits public
  // cross-origin reads directly from the visitor's browser.
  const saved = await siteOptions(id, true).catch(() => null);
  if (available(saved)) return saved;
  const live = await fetchSellerOptions(id).catch(() => null);
  if (live) return live;
  return await siteOptions(id, false).catch(() => null) ?? { groups: [], images: [] };
}
