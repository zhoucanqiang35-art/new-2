import {itemId} from './platform.mjs';

export function findCatalogItem(items, id, from) {
  return (from && items.find((item) => item.path === from && (!id || item.id === id)))
    || (id && items.find((item) => item.id === id))
    || null;
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
