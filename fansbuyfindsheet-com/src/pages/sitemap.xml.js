import catalog from '../data/main-catalog.json';
import { productPath } from '../lib/fansbuy.js';

const origin = 'https://fansbuyfindsheet.com';
const pages = ['/', '/spreadsheet/', '/image-search/', '/how-to-buy/', '/faq/', '/qc-photos/'];

export const prerender = true;

export function GET() {
  const urls = new Set(pages.map(path => new URL(path, origin).href));
  for (const [path] of catalog) {
    if (!productPath.test(path)) continue;
    const url = new URL('/product/', origin);
    url.searchParams.set('path', path);
    urls.add(url.href);
  }
  const entries = [...urls].map(url => '  <url><loc>' + url.replaceAll('&', '&amp;') + '</loc></url>');
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...entries, '</urlset>', ''].join('\n');
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
