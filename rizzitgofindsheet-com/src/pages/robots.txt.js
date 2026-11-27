export function GET({ site }) {
  const rules = process.env.SITE_PREVIEW === '1'
    ? 'Disallow: /\n'
    : 'Allow: /\nSitemap: ' + new URL('/sitemap.xml', site).href + '\n';
  return new Response('User-agent: *\n' + rules, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
