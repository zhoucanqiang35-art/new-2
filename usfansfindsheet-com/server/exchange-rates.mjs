const supportedCurrencies=['USD','CNY','EUR','GBP','CAD','AUD','PLN','DKK'];
let exchangeCache=null;
export function normalizeExchangeRates(rows,checkedAt=new Date().toISOString()){
 if(!Array.isArray(rows))throw Error('Exchange rates unavailable');
 const usd=rows.find(r=>r.currencyCode==='USD');const usdPerCny=Number(usd?.exchangeRate);
 if(!(usdPerCny>0&&usdPerCny<10))throw Error('Invalid USD reference rate');
 const rates={USD:1},updated={USD:String(usd.updateTime||'')};
 for(const code of supportedCurrencies){const entry=rows.find(r=>r.currencyCode===code);const value=Number(entry?.exchangeRate);if(!(value>0&&Number.isFinite(value)))throw Error('Missing rate '+code);rates[code]=value/usdPerCny;updated[code]=[String(usd.updateTime||''),String(entry.updateTime||'')].sort().at(-1);}
 rates.USD=1;
 return {base:'USD',rates,usdPerCny,updated,checkedAt,source:'USFans',sourceUrl:'https://usfans.com/api/config/aggregation'};
}
export async function exchangeRates(force=false){
 if(!force&&exchangeCache&&Date.now()-exchangeCache.fetchedAt<3600000)return exchangeCache.value;
 try{
  const r=await fetch('https://usfans.com/api/config/aggregation',{headers:{Accept:'application/json',Language:'en',Currency:'USD'},cf:{cacheEverything:true,cacheTtl:force?0:3600},signal:AbortSignal.timeout(4500)});
  if(!r.ok)throw Error('Exchange rate source unavailable');const json=await r.json();if(json.code!==200)throw Error('Exchange rate source unavailable');
  const value={...normalizeExchangeRates(json.data?.exchangeRateList),status:'live'};exchangeCache={fetchedAt:Date.now(),value};return value;
 }catch{
  const saved=exchangeCache?.value||exchangeRateSnapshot;
  if(!saved?.rates?.USD||!saved?.usdPerCny)throw Error('No saved exchange rates');
  return {...saved,status:'saved'};
 }
}
