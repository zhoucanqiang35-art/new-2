import {normalizeOptions} from '../../src/lib/options.js';
import ids from '../../src/data/seller-ids.js';
import snapshots from '../../src/data/options-snapshot.js';
const allowed=new Set(ids);
export async function onRequestGet({request}){
 const id=new URL(request.url).searchParams.get('item');
 if(!allowed.has(id))return Response.json({error:'Unknown catalog item'},{status:404});
 if(snapshots[id])return Response.json(snapshots[id],{headers:{'Cache-Control':'public, max-age=300, s-maxage=1800'}});
 try{const r=await fetch('https://findspreadsheet.com/api/Goods/getSkuData?weidian_id='+encodeURIComponent(id),{headers:{Accept:'application/json'},signal:AbortSignal.timeout(28000),redirect:'error'});if(!r.ok)throw Error();return Response.json(normalizeOptions(await r.json(),id),{headers:{'Cache-Control':'public, max-age=300, s-maxage=1800'}});}catch{return Response.json({error:'Seller specifications are temporarily unavailable'},{status:502,headers:{'Cache-Control':'no-store'}});}
}
