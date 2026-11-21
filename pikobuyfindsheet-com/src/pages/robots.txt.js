export function GET() {
  const isProduction=import.meta.env.PUBLIC_SITE_INDEXABLE==='true';
  const rules=isProduction?'User-agent: *\nAllow: /\nSitemap: https://pikobuyfindsheet.com/sitemap.xml\n':'User-agent: *\nAllow: /\n';
  return new Response(rules,{headers:{'Content-Type':'text/plain'}});
}
