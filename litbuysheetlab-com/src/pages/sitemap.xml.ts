import {products,categoryNames,productUrl} from '../lib/catalog.js';
export const prerender=true;
export function GET(){
 const paths=['/','/products/','/categories/','/guide/','/faq/','/about/','/contact/','/privacy/','/disclosure/',...Object.keys(categoryNames).map(c=>'/categories/'+c+'/'),...products.map(productUrl)];
 const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
 return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+paths.map(path=>'<url><loc>'+escape('https://litbuysheetlab.com'+path)+'</loc></url>').join('\n')+'\n</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
