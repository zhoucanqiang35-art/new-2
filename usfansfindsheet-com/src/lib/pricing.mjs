export function priceFor(item,official,rate,fallback){
 const p={...fallback,...item};const known=official['3:'+p.productId];
 if(Number(known?.usdMin)>0)return {amount:Number(known.usdMin),from:Number(known.usdMax)>Number(known.usdMin),origin:'USFans USD estimate'};
 const source=Number(p.sourcePrice);return source>0&&Number(rate.cnyToUsd)>0?{amount:Math.round(source*rate.cnyToUsd*100)/100,from:false,origin:'Converted USD estimate'}:null;
}
export function dollarLabel(price){return price?(price.from?'From ':'')+'$'+price.amount.toFixed(2)+' USD':'USD price unavailable';}
