import {handleApi} from './lib/api.mjs';
import {catalogItemResponse} from './lib/catalog-item.mjs';

let catalog;

export function catalogApi(request, loadAsset) {
  const action = new URL(request.url).pathname.match(/^\/api\/([a-z]+)\/?$/)?.[1];
  if (!action) return null;
  const loadCatalog = () => catalog ??= loadAsset('/catalog-data.json').then((asset) => asset.json()).catch(error=>{catalog=undefined;throw error;});
  if (action === 'catalogitem') return catalogItemResponse(request,loadCatalog);
  return handleApi(request,action,{loadCatalog,loadQc:() => loadAsset('/data/qc-snapshot.json').then((asset) => asset.json())});
}
