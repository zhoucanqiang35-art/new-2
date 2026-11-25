export function GET({ site }) {
  const production = site?.hostname === 'ponybuyfindsheet.com';
  const lines = ['User-agent: *', 'Allow: /'];
  if (production) lines.push('Sitemap: ' + new URL('/sitemap.xml', site).href);
  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
