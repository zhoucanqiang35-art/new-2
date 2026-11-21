import {itemId,productPath} from './platform.mjs';

export function findCatalogItem(items, id, from) {
  return (from && items.find((item) => item.path === from && (!id || item.id === id)))
    || (id && items.find((item) => item.id === id))
    || null;
}

const aliases = new Map([
  ['ランバン','lanvin'], ['浪凡','lanvin'], ['耐克','nike'], ['ナイキ','nike'],
  ['阿迪达斯','adidas'], ['アディダス','adidas'], ['喬丹','jordan'], ['乔丹','jordan'],
  ['ジョーダン','jordan'], ['鞋','shoes'], ['球鞋','shoes'], ['スニーカー','shoes'],
  ['卫衣','hoodies'], ['衛衣','hoodies'], ['スウェット','hoodies'],
]);
const categoryAliases = {shoes:'shoes',hoodies:'hoodies-sweaters'};
const normalize = (text) => String(text).normalize('NFKC').toLowerCase().trim();
function withinOneEdit(a,b) {
  if (a === b) return true;
  if (Math.abs(a.length-b.length)>1) return false;
  let i=0;
  while (i<a.length && a[i]===b[i]) i++;
  if (a.length!==b.length) return a.length>b.length ? a.slice(i+1)===b.slice(i) : a.slice(i)===b.slice(i+1);
  return a.slice(i+1)===b.slice(i+1) ||
    (a[i]===b[i+1] && a[i+1]===b[i] && a.slice(i+2)===b.slice(i+2));
}

export function matchCatalogItems(items, term) {
  if (!term) return [...items];
  const id=itemId(term);
  const path=productPath(term);
  if (id || path) return items.filter((item)=>id ? item.id===id : item.path===path);
  if (/^https?:\/\//i.test(term)) return [];
  const words=normalize(term).split(/\s+/).map(word=>aliases.get(word)||word);
  const cases=(item,word,title)=>title.includes(word) || categoryAliases[word]===item.category;
  const exact=items.filter(item=>words.every(word=>cases(item,word,normalize(item.title))));
  if (exact.length || !words.some(word=>/^[a-z]{4,24}$/.test(word))) return exact;
  return items.filter(item=>{
    const title=normalize(item.title);
    const tokens=title.match(/[a-z0-9]+/g)||[];
    return words.every(word=>cases(item,word,title) ||
      (/^[a-z]{4,24}$/.test(word) && tokens.some(token=>withinOneEdit(word,token))));
  });
}

export function sortCatalog(items, order) {
  return items.sort((a,b)=>{
    if (order==='popular') return (b.views||0)-(a.views||0);
    if (order==='price-asc'||order==='price-desc') {
      if (a.price==null) return b.price==null ? 0 : 1;
      if (b.price==null) return -1;
      return order==='price-asc' ? a.price-b.price : b.price-a.price;
    }
    return (b.date||0)-(a.date||0);
  });
}

export const toCard = ({id,title,price,image,path,category,views,date}) => ({id,title,price,image,path,category,views,date});

export function relatedProducts(item, items) {
  const words = new Set(item.title.toLowerCase().match(/[a-z0-9]{4,}/g) || []);
  const candidates = items.filter((product) => product.path !== item.path &&
    (!item.id || item.id !== product.id) && product.category === item.category);
  const scored = candidates.map((product) => {
    const shared = new Set(product.title.toLowerCase().match(/[a-z0-9]{4,}/g) || []);
    const overlap = [...shared].filter((word) => words.has(word)).length;
    const nearPrice = item.price != null && product.price != null ? 1 / (1 + Math.abs(item.price - product.price) / 50) : 0;
    return {product, score: overlap * 2 + nearPrice};
  });
  scored.sort((a, b) => b.score - a.score || b.product.views - a.product.views);
  const seen = new Set();
  return scored.map(({product}) => product).filter((product) => {
    const identifier = product.id || product.path;
    if (seen.has(identifier)) return false;
    seen.add(identifier);
    return true;
  }).slice(0, 8);
}

export async function catalogItemResponse(request, loadCatalog) {
  const headers = {'Cache-Control':'no-cache','X-Robots-Tag':'noindex'};
  if (request.method !== 'GET') return Response.json({error:'Method not allowed'}, {status:405,headers});
  const params = new URL(request.url).searchParams;
  const id = itemId(params.get('id') || '');
  const from = params.get('from') || '';
  if (!id && !/^\/[\w-]+\/[\w-]+\.html$/.test(from)) {
    return Response.json({error:'Invalid item reference'}, {status:400,headers});
  }
  try {
    const product = findCatalogItem((await loadCatalog()).items, id, from);
    return Response.json({product}, {status:product ? 200 : 404,headers});
  } catch {
    return Response.json({error:'Catalog temporarily unavailable'}, {status:503,headers});
  }
}
