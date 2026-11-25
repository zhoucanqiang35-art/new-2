import type { APIRoute } from 'astro';
import catalog from '../../../public/data/catalog.json';
import { origin } from '../../lib/catalog.mjs';
import { parseWeidianOptions, sellerImageOptions } from '../../lib/seller-options.mjs';
import snapshots from '../../data/seller-options.json';

export const prerender = false;
const itemIds = new Set(catalog.map(entry => entry.weidianId));
const saved = new Map(Object.entries(snapshots));
const responseHeaders = { 'X-Robots-Tag': 'noindex' };

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id') ?? '';
  if (!itemIds.has(id)) {
    return Response.json({ status: 'invalid' }, { status: 404, headers: responseHeaders });
  }

  try {
    const target = new URL('https://weidian.com/item.html');
    target.searchParams.set('itemID', id);
    const response = await fetch(target, {
      headers: { Accept: 'text/html' },
      signal: AbortSignal.timeout(3200),
      redirect: 'manual',
    });
    if (!response.ok) throw new Error('Seller listing unavailable');
    const groups = parseWeidianOptions(await response.text(), id);
    return Response.json({ status: 'live', groups }, {
      headers: { ...responseHeaders, 'Cache-Control': 'public, max-age=300, s-maxage=900' },
    });
  } catch {
    try {
      const target = new URL('/api/Goods/getSkuData', origin);
      target.searchParams.set('weidian_id', id);
      const response = await fetch(target, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(2600),
        redirect: 'manual',
      });
      if (!response.ok) throw new Error('Catalog options unavailable');
      const data = await response.json();
      if (String(data.weidian_id) !== id || !Array.isArray(data.specifications?.attrs)) {
        throw new Error('Catalog returned an unexpected listing');
      }
      const groups = sellerImageOptions(data.specifications.attrs);
      return Response.json({ status: 'live', groups }, {
        headers: { ...responseHeaders, 'Cache-Control': 'public, max-age=300, s-maxage=900' },
      });
    } catch {
      const groups = saved.get(id);
      return Response.json({ status: groups ? 'saved' : 'unavailable', groups: groups ?? [] }, {
        status: groups ? 200 : 503,
        headers: { ...responseHeaders, 'Cache-Control': 'no-store' },
      });
    }
  }
};
