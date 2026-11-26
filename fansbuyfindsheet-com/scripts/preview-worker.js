import { productDocument } from '../src/lib/product-document.js';
import assets from '../dist/preview-assets.js';
import { onRequestGet } from '../functions/api/[[route]].js';

export default {
  async fetch(request) {
    const { pathname, search, searchParams } = new URL(request.url);
    if (pathname.startsWith('/api/')) {
      if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } });
      return onRequestGet({ request });
    }
    if (!assets[pathname] && assets[pathname + '/']) return new Response(null, { status: 308, headers: { Location: pathname + '/' + search } });
    const asset = Object.hasOwn(assets, pathname) ? assets[pathname] : null;
    if (!asset) return new Response('Page not found', { status: 404 });
    const bytes = request.method === 'HEAD' ? null : Uint8Array.from(atob(asset.base64), value => value.charCodeAt(0));
    const productPage = pathname === '/product/';
    const body = productPage && bytes ? productDocument(new TextDecoder().decode(bytes), searchParams.get('path')) : bytes;
    return new Response(body, {
      headers: {
        'Content-Type': asset.type,
        'X-Robots-Tag': 'noindex, follow',
        'Cache-Control': productPage ? 'private, no-cache' : pathname.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'public, max-age=300'
      }
    });
  }
};
