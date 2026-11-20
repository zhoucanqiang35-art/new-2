import {productionBuild, publicOrigin} from '../lib/production-seo.mjs';

export function GET() {
  const body = productionBuild
    ? `User-agent: *\nAllow: /\nSitemap: ${publicOrigin}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
}
