import { getListingItems } from '../lib/catalog-build';
import { categories } from '../lib/site';

export function GET({ site }) {
  const paths = [
    '/',
    '/spreadsheet/',
    '/categories/',
    '/image-search/',
    '/guides/how-to-buy/',
    '/faq/',
    '/qc/',
    ...categories.map(({ slug }) => '/categories/' + slug + '/'),
    ...getListingItems().map(({ id }) => '/products/' + encodeURIComponent(id) + '/'),
  ];

  const urls = paths.map((path) => '<url><loc>' + new URL(path, site).href + '</loc></url>');
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('\n');

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
