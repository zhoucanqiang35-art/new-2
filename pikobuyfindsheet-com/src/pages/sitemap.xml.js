import {articles} from '../data/articles.mjs';
import {categories} from '../lib/platform.mjs';

export function GET() {
  const isProduction=import.meta.env.PUBLIC_SITE_INDEXABLE==='true';
  if(!isProduction) return new Response('Sitemap is enabled for the production domain.',{headers:{'X-Robots-Tag':'noindex','Content-Type':'text/plain'}});
  const paths=['/','/spreadsheet/','/categories/','/qc/','/guides/','/guides/how-to-buy/','/guides/shipping/','/guides/returns/','/guides/forwarding/','/faq/'];
  paths.push(...articles.map(({slug}) => '/articles/' + slug + '/'));
  paths.push(...categories.map(([slug]) => '/categories/' + slug + '/'));
  const xml='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map((path)=>'<url><loc>https://pikobuyfindsheet.com'+path+'</loc></url>').join('')+'</urlset>';
  return new Response(xml,{headers:{'Content-Type':'application/xml'}});
}
