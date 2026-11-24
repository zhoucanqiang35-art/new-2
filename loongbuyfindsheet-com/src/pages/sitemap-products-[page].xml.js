import {catalogProducts,productPath} from '../lib/catalog-products.js';
import {sitemap,sitemapSize} from '../lib/sitemaps.js';
export function getStaticPaths(){return Array.from({length:Math.ceil(catalogProducts.length/sitemapSize)},(_,i)=>({params:{page:String(i+1)},props:{page:i+1}}));}
export function GET({site,props}){return sitemap(site,catalogProducts.slice((props.page-1)*sitemapSize,props.page*sitemapSize).map(p=>productPath(p.id)));}
