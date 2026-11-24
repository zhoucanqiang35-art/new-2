import articles from '../articles.json';
import {browsePageCount} from '../lib/catalog-products.js';
import {sitemap} from '../lib/sitemaps.js';
export function GET({site}){return sitemap(site,['/','/guides/','/guides/how-to-buy/','/faq/','/articles/','/image-search/','/products/','/spreadsheet/',...articles.map(({slug})=>`/articles/${encodeURIComponent(slug)}/`),...Array.from({length:browsePageCount},(_,i)=>`/browse/${i+1}/`)]);}
