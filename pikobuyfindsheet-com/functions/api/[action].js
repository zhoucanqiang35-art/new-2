import {handleApi} from '../../src/lib/api.mjs';
import {catalogItemResponse} from '../../src/lib/catalog-item.mjs';

export function onRequest({request,params,env}) {
  async function loadAsset(path) {
    const asset = await env.ASSETS.fetch(new URL(path,request.url));
    if (!asset.ok) throw new Error('Catalog asset unavailable');
    return asset.json();
  }
  const loadCatalog = () => loadAsset('/catalog-data.json');
  if (params.action === 'catalogitem') return catalogItemResponse(request,loadCatalog);
  return handleApi(request,params.action,{loadCatalog,loadQc:() => loadAsset('/data/qc-snapshot.json')});
}
