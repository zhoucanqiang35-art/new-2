let exchangeCache = null;
const supportedCurrencies=['USD','CNY','EUR','GBP','CAD','AUD','PLN','DKK'];
export function normalizeExchangeRates(rows,checkedAt=new Date().toISOString()){
 if(!Array.isArray(rows))throw Error('Exchange rates unavailable');
 const usd=rows.find(r=>r.currencyCode==='USD');const usdPerCny=Number(usd?.exchangeRate);
 if(!(usdPerCny>0&&usdPerCny<10))throw Error('Invalid USD reference rate');
 const rates={USD:1},updated={USD:String(usd.updateTime||'')};
 for(const code of supportedCurrencies){const entry=rows.find(r=>r.currencyCode===code);const value=Number(entry?.exchangeRate);if(!(value>0&&Number.isFinite(value)))throw Error('Missing rate '+code);rates[code]=value/usdPerCny;updated[code]=[String(usd.updateTime||''),String(entry.updateTime||'')].sort().at(-1);}
 rates.USD=1;
 return {base:'USD',rates,usdPerCny,updated,checkedAt,source:'USFans',sourceUrl:'https://usfans.com/api/config/aggregation'};
}
export async function exchangeRates(force = false) {
 if (!force && exchangeCache && Date.now() - exchangeCache.fetchedAt < 3600000) return exchangeCache.value;
 try {
  const response = await fetch('https://open.er-api.com/v6/latest/USD', {headers:{Accept:'application/json'},cf:{cacheEverything:true,cacheTtl:3600},signal:AbortSignal.timeout(4500)});
  if (!response.ok) throw Error('Exchange rates unavailable');
  const result = await response.json();
  if (result.result !== 'success' || result.rates?.USD !== 1) throw Error('Invalid exchange rates');
  const value = {base:'USD',rates:result.rates,usdPerCny:1/result.rates.CNY,checkedAt:result.time_last_update_utc,source:'ExchangeRate-API',sourceUrl:'https://open.er-api.com/v6/latest/USD',status:'live'};
  exchangeCache = {fetchedAt:Date.now(),value};
  return value;
 } catch {
  return {...(exchangeCache?.value || exchangeRateSnapshot),status:'saved'};
 }
}
