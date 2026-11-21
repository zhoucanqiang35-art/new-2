import { isProductionSite, siteUrl } from '../lib/seo.mjs';

export function GET() {
  const lines = ['User-agent: *','Allow: /'];
  if (isProductionSite) lines.push('Sitemap: '+siteUrl('/sitemap.xml'));
  return new Response(lines.join('\n')+'\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
