import {isShopItem} from '../../src/lib/landing-paths.mjs';

export async function onRequestGet({params, next, request, env}) {
  if (isShopItem(params.id)) return next();
  const page = await env.ASSETS.fetch(new URL('/404.html', request.url));
  return new Response(page.ok ? page.body : 'This item is unavailable in our Weidian store catalog.', {
    status: 404,
    headers: {'Content-Type': page.ok ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex'},
  });
}
