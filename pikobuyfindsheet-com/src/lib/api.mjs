import {itemId,mainSearch,sourceOrigin} from './platform.mjs';
import {catalogSearchTerm,rankCatalogItems} from './catalog-search.mjs';
import {lookupQc,parseProducts,parseSearchResults,parseGallery,findNextPage} from './upstream.mjs';

async function getHtml(url, timeout = 9500) {
  const response=await fetch(url,{headers:{accept:'text/html'},signal:AbortSignal.timeout(timeout)});
  if(!response.ok||!response.headers.get('content-type')?.includes('text/html')) throw new Error('Upstream was unavailable');
  const html=await response.text();
  if(!html.includes('FindsSpreadsheet')) throw new Error('Unexpected upstream response');
  return html;
}
function response(data,status=200) {
  return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
}
const unavailable = () => response({error:'FindSpreadsheet is temporarily unavailable'},503);
const supported = new Set(['qc','search','product']);
export async function handleApi(request,action,{loadCatalog,loadQc}={}) {
  if(!supported.has(action)) return response({error:'Not found'},404);
  if(request.method!=='GET') return response({error:'Method not allowed'},405);
  const params=new URL(request.url).searchParams;
  try {
    if(action==='qc') {
      const id=itemId(params.get('item')||'');
      if(!id) return response({error:'Invalid Weidian item ID'},400);
      const limit = params.get('limit');
      if (limit !== null && !/^(?:[1-9]\d?|100)$/.test(limit)) return response({error:'Invalid photo limit'},400);
      let result;
      try {
        result = await lookupQc(id);
      } catch {
        const saved = loadQc ? (await loadQc())[id] : undefined;
        if (!saved?.photos?.length) return unavailable();
        result = {status:'saved', source:'snapshot', savedAt:saved.savedAt, photos:saved.photos};
      }
      return response(limit === null ? result : {
        ...result, total: result.photos.length, photos: result.photos.slice(0, Number(limit)),
      });
    }
    if(action==='search') {
      const term=(params.get('q')||'').trim();
      if(!term||term.length>500) return response({error:'Invalid search query'},400);
      const page = Number(params.get('page') || 1);
      if(!Number.isSafeInteger(page)||page<1||page>100) return response({error:'Invalid search page'},400);
      const query=catalogSearchTerm(term);
      const snapshot=async()=>{
        if (!loadCatalog) return unavailable();
        const matches=rankCatalogItems((await loadCatalog()).items,query);
        const start=(page-1)*24;
        return response({source:'snapshot', items:matches.slice(start,start+24),
          hasNext:matches.length>start+24, total:matches.length});
      };
      if(query.path) return await snapshot();
      const url=new URL(mainSearch(query.text));
      if(page>1) url.searchParams.set('page',String(page));
      try {
        const html=await getHtml(url,3500);
        const items=parseProducts(html);
        return response({source:'live', items:items.length?items:parseSearchResults(html),hasNext:Boolean(findNextPage(html,url))});
      } catch {
        return await snapshot();
      }
    }
    const id=itemId(params.get('id')||'');
    let path=params.get('from')||'';
    if(!/^\/[\w-]+\/[\w-]+\.html$/.test(path)) {
      if(!id) return response({error:'Invalid item reference'},400);
      const results=await getHtml(mainSearch(id));
      path=parseProducts(results).find((p)=>p.id===id)?.path || parseSearchResults(results)[0]?.path;
      if(!path) return response({error:'Product unavailable'},404);
    }
    const html=await getHtml(sourceOrigin+path);
    const product=parseProducts(html).find((p)=>(!id||p.id===id)&&p.path===path);
    if(!product) return response({error:'Product unavailable'},404);
    product.gallery=parseGallery(html);
    return response({product});
  } catch {
    return unavailable();
  }
}
