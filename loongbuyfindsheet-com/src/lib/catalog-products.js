import catalog from '../../public/catalog.json';
import featured from '../featured.json';
const preferred = new Set(featured.map(item => item.id));
const valid = catalog.filter(item => /^\d+$/.test(String(item.id)) && /^\d{6,20}$/.test(String(item.weidianId)) && item.name && item.image && item.sourcePath?.startsWith('/') && Number.isFinite(Number(item.price)) && Number(item.price) > 0);
const byWeidian = new Map();
for (const item of valid) {
 const previous = byWeidian.get(item.weidianId);
 if (!previous || preferred.has(item.id)) byWeidian.set(item.weidianId, item);
}
export const catalogProducts = [...byWeidian.values()];
export const productAliases = Object.fromEntries(valid.filter(item => byWeidian.get(item.weidianId).id !== item.id).map(item => [item.id, byWeidian.get(item.weidianId).id]));
export const productPath = id => `/products/${productAliases[id] || id}/`;
export const browsePageSize = 100;
export const browsePageCount = Math.ceil(catalogProducts.length / browsePageSize);
export const categoryLabels = {'shoes':'Shoes & sneakers','hoodies-sweaters':'Hoodies & sweaters','t-shirts':'T-shirts','jackets':'Jackets','pants-shorts':'Pants & shorts','accessories':'Accessories','headwear':'Headwear','electronics':'Electronics','ShortSets':'Short sets','jersey':'Jerseys','other-stuff':'Other finds'};
