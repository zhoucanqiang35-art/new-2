import type { APIRoute } from 'astro';
import { findItemId, origin } from '../../lib/catalog.mjs';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const rawId = url.searchParams.get('item') ?? '';
  const id = findItemId(rawId);
  if (!id || rawId !== id) return Response.json({ status: 'invalid' }, { status: 400 });

  try {
    const target = new URL('/qcradar-qc.php', origin);
    target.searchParams.set('item', id);
    const upstream = await fetch(target.href, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(11500),
      redirect: 'manual',
    });
    if (upstream.status === 429) {
      const retryAfter = upstream.headers.get('Retry-After');
      return Response.json({ status: 'unavailable' }, {
        status: 429,
        headers: { 'Cache-Control': 'no-store', 'Retry-After': retryAfter || '60' },
      });
    }
    if (!upstream.ok) throw new Error('Findspreadsheet HTTP ' + upstream.status);
    const data = await upstream.json();
    if (data.platform !== 'weidian' || String(data.itemId) !== id || data.degraded === true) {
      throw new Error(data.degraded === true ? 'Findspreadsheet returned a degraded result' : 'Findspreadsheet returned an unexpected item');
    }

    const photos = (Array.isArray(data.images) ? data.images : []).slice(0, 60).flatMap(photo => {
      if (photo?.isVideo || typeof photo?.display !== 'string') return [];
      try {
        const image = new URL(photo.display);
        if (image.protocol !== 'https:' || image.username || image.password) return [];
        return [{ url: image.href, source: typeof photo.agentPlatform === 'string' ? photo.agentPlatform.slice(0, 40) : '' }];
      } catch {
        return [];
      }
    });
    const status = photos.length ? 'ready'
      : data.status === 'none' ? 'none'
      : ['pending', 'ready'].includes(data.status) ? 'pending'
      : 'unknown';
    return Response.json({ status, photos }, {
      headers: { 'Cache-Control': status === 'pending' ? 'no-store' : 'public, max-age=120' },
    });
  } catch (error) {
    console.warn('Warehouse QC lookup:', error instanceof Error ? error.message : 'Unknown error');
    return Response.json({ status: 'unavailable' }, {
      status: 503, headers: { 'Cache-Control': 'no-store' },
    });
  }
};
