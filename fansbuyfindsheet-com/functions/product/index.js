import { productDocument } from '../../src/lib/product-document.js';

export async function onRequestGet({ request, next }) {
  const path = new URL(request.url).searchParams.get('path');
  const response = await next();
  if (!response.ok || !path || !response.headers.get('content-type')?.includes('text/html')) return response;

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('etag');
  headers.set('cache-control', 'private, no-cache');
  return new Response(productDocument(html, path), { status: response.status, headers });
}
