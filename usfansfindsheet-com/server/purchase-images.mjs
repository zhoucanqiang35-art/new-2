function imageUrlIsCurrent(value){
 try{const u=new URL(value);const stamp=u.searchParams.get('X-Amz-Date');const seconds=Number(u.searchParams.get('X-Amz-Expires'));if(!stamp)return true;const m=stamp.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);if(!m||!Number.isFinite(seconds)||seconds<=0)return false;return Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6])+seconds*1000>Date.now()+30000;}catch{return false;}
}
const imageUrls=values=>[...new Set((Array.isArray(values)?values:[]).filter(x=>typeof x==='string'&&/^https:\/\//i.test(x)))];
const htmlDecode=s=>String(s||'').replace(/&quot;/g,'"').replace(/&#39;|&#039;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
function descriptionPhotos(description){const decoded=htmlDecode(description);return imageUrls([...decoded.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]));}
async function purchaseApi(endpoint,params){const u=new URL('https://usfans.com/api/goods/'+endpoint);for(const [k,v]of Object.entries(params))u.searchParams.set(k,v);const r=await fetch(u,{headers:{Accept:'application/json',Language:'en',Currency:'USD'},cf:{cacheEverything:true,cacheTtl:300},signal:AbortSignal.timeout(6500)});if(!r.ok)throw Error('Purchase-page data unavailable');const data=await r.json();if(data.code!==200||!data.data)throw Error('Purchase-page data unavailable');return data.data;}
export async function purchaseImages(channel,goodsId){
 if(!/^\d+$/.test(channel)||!/^\d+$/.test(goodsId))return null;
 const snapshot=get_officialSnapshots()[channel+':'+goodsId];
 const [info,qc]=await Promise.allSettled([purchaseApi('info',{channel,goodsId}),purchaseApi('estimate-info',{goodsId})]);
 const good=info.status==='fulfilled'?info.value:null;const quality=qc.status==='fulfilled'?qc.value:null;
 if(!good&&!snapshot)return null;
 return {...(good?extractUsdPrice(good):{usdMin:snapshot?.usdMin,usdMax:snapshot?.usdMax}),properties:good?.properties||snapshot?.properties||[],skuList:good?.skuList||snapshot?.skuList||[],images:imageUrls(good?.images||snapshot?.images),descriptionImages:good?descriptionPhotos(good.description):imageUrls(snapshot?.descriptionImages),qcImages:quality?imageUrls(quality.qcImages):imageUrls(snapshot?.qcImages),qcAvailable:!!quality||!!snapshot?.qcAvailable,updated:good?new Date().toISOString():snapshot.updated,cached:!good};
}
function extractUsdPrice(info){const choices=(info?.skuList||[]).filter(s=>s.stock!==0).map(s=>Number(s.convertedDiscountPrice)>0?Number(s.convertedDiscountPrice):Number(s.convertedPrice)).filter(p=>Number.isFinite(p)&&p>0);if(!choices.length&&Number(info?.convertedPrice)>0)choices.push(Number(info.convertedPrice));return {usdMin:choices.length?Math.min(...choices):null,usdMax:choices.length?Math.max(...choices):null};}
export async function mainQcData(goodsId,limit=24){
 if(!/^\d+$/.test(goodsId||''))return null;
 let data;let cached=false;
 try{const r=await fetch('https://findspreadsheet.com/qcradar-qc.php?item='+goodsId,{headers:{Accept:'application/json'},cf:{cacheEverything:true,cacheTtl:300},signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Main QC unavailable');data=await r.json();if(String(data.itemId)!==goodsId||data.platform!=='weidian')throw Error('QC identity mismatch');}catch{data=get_mainQc()[goodsId];cached=true;}
 if(!data||String(data.itemId)!==goodsId||data.platform!=='weidian')return null;
 return {status:data.status,images:(Array.isArray(data.images)?data.images:[]).filter(i=>typeof i?.display==='string'&&/^https:\/\//.test(i.display)&&imageUrlIsCurrent(i.display)).slice(0,limit),updated:data.updatedAt,cached};
}
