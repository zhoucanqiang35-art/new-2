import type { APIRoute } from 'astro';
import catalog from '../../public/data/catalog.json';
import { articles } from '../lib/articles.mjs';
import { itemUrl } from '../lib/catalog.mjs';
import { categoryEntries } from '../lib/category-content.mjs';
import { canonicalUrl, indexable } from '../lib/seo.mjs';

export const prerender = true;

export const GET: APIRoute = () => {
  const paths = indexable ? [
    '/', '/spreadsheet/', '/categories/', '/tools/', '/articles/', '/faq/',
    '/guides/how-to-buy/', '/guides/agent/', '/guides/shipping/',
    ...categoryEntries.map(category => category.href),
    ...articles.map(article => article.href),
    ...catalog.map(entry => itemUrl(entry.weidianId)),
  ] : [];
  const entries = paths.map(path => '<url><loc>' + canonicalUrl(path) + '</loc></url>').join('\n');
  return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries + '\n</urlset>\n', { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
