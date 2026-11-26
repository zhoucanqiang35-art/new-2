import { catalog, categoryNames, categorySlug, productPath } from '../lib/data.js';

export function GET({ site }) {
  const pages = ['/', '/spreadsheet/', '/image-search/', '/qc-photos/', '/how-to-buy/', '/faq/',
    ...Object.keys(categoryNames).map((key) => '/categories/' + categorySlug(key) + '/'),
    ...catalog.map((item) => productPath(item.id))];
  const entries = pages.map((path) => '<url><loc>' + new URL(path, site).href + '</loc></url>').join('\n');
  return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries + '\n</urlset>', {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
