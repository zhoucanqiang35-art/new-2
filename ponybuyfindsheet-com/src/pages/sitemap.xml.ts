import { catalog, productPath } from '../lib/catalog';
import { guides } from '../lib/guide-content';

export function GET({ site }) {
  const paths = ['/', '/spreadsheet/', '/image-search/', '/guides/',
    ...guides.map(({ slug }) => '/guides/' + slug + '/'), ...catalog.map(productPath)];
  const published = site?.hostname === 'ponybuyfindsheet.com';
  const entries = published ? paths.map((path) => '<url><loc>' + new URL(path, site).href + '</loc></url>') : [];
  return new Response('<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + entries.join('\n') + '</urlset>\n', {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
