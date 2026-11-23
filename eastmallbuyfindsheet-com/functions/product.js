import {parseId} from '../src/lib/catalog.mjs';
import {isShopItem} from '../src/lib/landing-paths.mjs';

export async function onRequestGet({request, env, next}) {
  const url = new URL(request.url);
  const raw = url.searchParams.get('id');
  if (raw === null) return next();
  const id = parseId(raw);
  if (isShopItem(id)) return Response.redirect(new URL('/products/' + id + '/', url), 301);

  const page = await env.ASSETS.fetch(new URL('/404.html', url));
  if (!page.ok) return new Response('This item is unavailable in our Weidian store catalog.', {
    status: 404,
    headers: {'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex'},
  });
  const headers = new Headers(page.headers);
  headers.set('X-Robots-Tag', 'noindex');
  return new Response(page.body, {status: 404, headers});
}
