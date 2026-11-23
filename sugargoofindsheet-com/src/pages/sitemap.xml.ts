import featuredProductIds from '../lib/featured-products.json';

export function GET() {
  const routes = ['/', '/browse/', '/qc/', '/image-search/', '/guide/', '/faq/', '/seo/',
    ...featuredProductIds.map(id => `/products/${id}/`)];
  const entries = routes.map(route => `  <url><loc>https://sugargoofindsheet.com${route}</loc></url>`);
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...entries, '</urlset>'].join('\n');
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
