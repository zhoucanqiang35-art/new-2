export const currencyCodes=['USD','CNY','EUR','GBP','CAD','AUD','PLN','DKK'];
export function convertedAmount(usd,cny,currency,data){
 const base=Number(usd),source=Number(cny),rate=Number(data?.rates?.[currency]);
 if(!(base>0&&Number.isFinite(base)&&rate>0&&Number.isFinite(rate)))return null;
 const result=source>0&&Number.isFinite(source)&&Number(data.usdPerCny)>0?source*Number(data.usdPerCny)*rate:base*rate;
 return Number.isFinite(result)?result:null;
}
export function moneyLabel(amount,currency,locale,from=false,fromLabel='From',approx=false){
 if(!(Number(amount)>0))return '';
 const formatter=new Intl.NumberFormat(locale,{style:'currency',currency,currencyDisplay:'narrowSymbol',minimumFractionDigits:2,maximumFractionDigits:2});
 const number=formatter.format(amount);const symbol=formatter.formatToParts(amount).find(p=>p.type==='currency')?.value||'';
 return (from?fromLabel+' ':'')+(approx?'≈ ':'')+number+(symbol.includes(currency)?'':' '+currency);
}
