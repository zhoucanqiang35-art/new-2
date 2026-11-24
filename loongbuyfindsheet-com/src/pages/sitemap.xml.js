import {catalogProducts} from '../lib/catalog-products.js';
import {sitemap,sitemapSize} from '../lib/sitemaps.js';
export function GET({site}){return sitemap(site,['/sitemap-pages.xml',...Array.from({length:Math.ceil(catalogProducts.length/sitemapSize)},(_,i)=>`/sitemap-products-${i+1}.xml`)],true);}
