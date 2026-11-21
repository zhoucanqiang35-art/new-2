import { categoryCards } from '../lib/categories-at-build.mjs';
import { featuredIds } from '../lib/item-data-at-build.mjs';
import { publicRoutes, categoryPath, productPath, siteUrl } from '../lib/seo.mjs';

export function GET() {
  const paths = [...publicRoutes,...categoryCards.map(({key})=>categoryPath(key)),...featuredIds.map(productPath)];
  return new Response('<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + paths.map(path=>'<url><loc>'+siteUrl(path)+'</loc></url>').join('\n')+'\n</urlset>\n',
    {headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
