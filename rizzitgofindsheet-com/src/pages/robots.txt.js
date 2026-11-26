export function GET({ site }) {
  return new Response('User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ' + new URL('/sitemap.xml', site).href + '\n');
}
