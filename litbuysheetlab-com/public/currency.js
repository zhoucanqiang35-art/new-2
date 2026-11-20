(()=>{
 const sel=document.getElementById('currency');if(!sel)return;
 const supported=new Set([...sel.options].map(o=>o.value));
 const read=key=>{try{return localStorage.getItem(key);}catch{return null;}};
 const write=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
 const saved=read('litbuyCurrency');sel.value=supported.has(saved)?saved:'USD';
 let rates=null,rateDate='',cached=false;
 try{const data=JSON.parse(read('litbuyRates')||'null');if(data?.rates?.CNY>0&&data.date){rates=data.rates;rateDate=data.date;cached=true;}}catch{}
 const t=(key,fallback)=>window.litbuyHomeText?.(key,fallback)||fallback;
 function update(){
  const currency=sel.value;
  document.querySelectorAll('.money').forEach(el=>{
   const cny=Number(el.dataset.cny || Number(el.dataset.usd)*7.26);if(!Number.isFinite(cny))return;
   const available=currency==='CNY'||rates?.CNY>0&&(currency==='USD'||rates[currency]>0);
   const target=available?currency:'CNY';
   const amount=target==='CNY'?cny:cny/rates.CNY*(target==='USD'?1:rates[target]);
   const text=new Intl.NumberFormat('en-US',{style:'currency',currency:target,minimumFractionDigits:2,maximumFractionDigits:2}).format(amount)+' '+target;
   if(el.textContent!==text)el.textContent=text;
   el.title=t('price_warning','Archived reference, not a live Litbuy quote. Excludes delivery, fees and taxes.');
  });
  const message=rateDate?(cached?t('cached_rate','Cached exchange rate'):t('rate_date','Exchange rate reference'))+': '+rateDate:t('rate_unavailable','Exchange rate unavailable; original CNY prices shown.');
  document.querySelectorAll('.rate-status').forEach(el=>{if(el.textContent!==message)el.textContent=message;});
 }
 async function load(){try{const r=await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP,CAD,AUD,JPY,CNY');if(!r.ok)throw Error();const data=await r.json();if(!(data.rates?.CNY>0)||!/^\d{4}-\d{2}-\d{2}$/.test(data.date))throw Error();rates={USD:1,...data.rates};rateDate=data.date;cached=false;write('litbuyRates',JSON.stringify({rates,date:rateDate}));}catch{}update();}
 sel.addEventListener('change',()=>{write('litbuyCurrency',sel.value);update();});
 window.addEventListener('litbuy:languagechange',update);
 new MutationObserver(update).observe(document.body,{childList:true,subtree:true});
 update();load();
})();
