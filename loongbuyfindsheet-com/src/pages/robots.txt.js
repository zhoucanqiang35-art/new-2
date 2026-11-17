import { isIndexableSite } from '../lib/seo.js';

export function GET({ site }) {
  const rules = isIndexableSite(site)
    ? `User-agent: *\nDisallow: /api/\nSitemap: ${new URL('/sitemap.xml', site).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(rules, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
