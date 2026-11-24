import {isIndexableSite} from './seo.js';
export const sitemapSize = 2000;
const escapeXML = value => String(value).replace(/[<>&"']/g, char=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[char]));
export function sitemap(site, paths, index=false){
 if(!isIndexableSite(site))return new Response(null,{status:404});
 const root=index?'sitemapindex':'urlset',tag=index?'sitemap':'url';
 return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<${root} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path=>`<${tag}><loc>${escapeXML(new URL(path,site).href)}</loc></${tag}>`).join('\n')}\n</${root}>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
