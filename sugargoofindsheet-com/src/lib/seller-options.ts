export type SellerOption={id:string;name:string;image:string};
export type SellerRecord={status:string;images:string[];groups:{name:string;values:SellerOption[]}[]};
const image=(value:unknown)=>{if(typeof value!=='string')return '';try{const url=new URL(value);return url.protocol==='https:'&&['si.geilicdn.com','img.geilicdn.com','wd.geilicdn.com'].includes(url.hostname)?url.href:''}catch{return ''}};
export function normalizeSeller(data:any,id:string):SellerRecord{
 if(String(data?.weidian_id)!==id||!Array.isArray(data.specifications?.attrs))throw Error('Seller item mismatch');
 return {status:'available',images:[...new Set<string>((Array.isArray(data.images)?data.images:[]).map(image).filter(Boolean))],groups:data.specifications.attrs.map((a:any)=>({name:String(a.attr_title||'Style').slice(0,80),values:(Array.isArray(a.attr_values)?a.attr_values:[]).map((v:any)=>({id:String(v.attr_id),name:String(v.attr_value||'').slice(0,150),image:image(v.img)}))}))};
}
export async function loadSellerOptions(id:string):Promise<SellerRecord|undefined>{
 try{const response=await fetch('https://findspreadsheet.com/api/Goods/getSkuData?weidian_id='+encodeURIComponent(id),{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Seller unavailable');return normalizeSeller(await response.json(),id)}catch{
  try{const response=await fetch(id==='7869128383'?'/seller-options/items/'+id+'.json':'/seller-options/'+id.slice(0,4)+'.json');if(!response.ok)return;const record=(await response.json())[id];if(record?.status!=='available')return;return {status:'available',images:(record.images||[]).map(image).filter(Boolean),groups:(record.groups||[]).map((g:any)=>({name:String(g.name),values:(g.values||[]).map((v:any)=>({id:String(v.id),name:String(v.name),image:image(v.image)}))}))}}catch{return}
 }
}
