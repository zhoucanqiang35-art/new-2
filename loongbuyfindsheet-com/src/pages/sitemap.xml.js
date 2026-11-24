import articles from '../articles.json';
import { pilotProducts, pilotPath } from '../lib/pilot-products.js';
import { isIndexableSite } from '../lib/seo.js';

export function GET({ site }) {
  if (!isIndexableSite(site)) return new Response(null, { status: 404 });

  const routes = [
    '/',
    '/guides/',
    '/guides/how-to-buy/',
    '/faq/',
    '/articles/',
    '/image-search/',
    '/products/',
    '/spreadsheet/',
    ...pilotProducts.map(({ id }) => pilotPath(id)),
    ...articles.map(({ slug }) => `/articles/${encodeURIComponent(slug)}/`),
  ];
  const entries = routes.map(path => `  <url><loc>${new URL(path, site).href}</loc></url>`);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n');
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
