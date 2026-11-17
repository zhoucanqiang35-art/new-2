(()=>{
'use strict';
const picker=document.getElementById('language-picker');if(!picker)return;
const $=s=>document.querySelector(s),buttons=[...picker.querySelectorAll('[data-language]')];
const supported=new Map(buttons.map(b=>[b.dataset.language,{name:b.querySelector('span').textContent,dir:b.dataset.direction,note:b.dataset.translationNote}]));
const originalText=new WeakMap(),originalAttrs=new WeakMap(),originalLinks=new WeakMap(),cache=new Map(),productCache=new Map();
const normalize=s=>String(s??'').replace(/\s+/g,' ').trim();let language='en',dictionary={},productNames={},photoLabel='listing photo',revision=0,scheduled=false;
const t=source=>dictionary[normalize(source)]||source;
function translate(value){
 if(language==='en')return value;
 const key=normalize(value);if(!key)return value;let fixed,m;
 if((m=key.match(/^(.+) · (\d+) MIN READ$/)))fixed=t(m[1])+' · '+m[2]+' '+t('MIN READ');
 else if((m=key.match(/^(\d+) min read$/)))fixed=m[1]+' '+t('min read');
 else if(/[↗→]$/.test(key)&&key.length>1)fixed=translate(key.slice(0,-1).trim())+' '+key.slice(-1);
 else if(/^[←↥▦⌕]\s/.test(key))fixed=key[0]+' '+translate(key.slice(1).trim());
 else if(key.includes('1 USD = 6.6642 CNY'))fixed=(key.startsWith('Preview catalog')?t('Historical FindSpreadsheet catalog · Prices and availability may have changed.')+' ':'')+t('Reference conversion')+' · 1 USD = 6.6642 CNY · 2026-11-16. '+t('Confirm current pricing, options and availability on LoongBuy.');
 let next=fixed??dictionary[key];
 if(!next){
  let m;
  if((m=key.match(/^(QC photo|Photo) (\d+)$/)))next=t(m[1])+' '+m[2];
  else if((m=key.match(/^([\d,]+) (visually ranked finds|finds|find)(.*)$/)))next=m[1]+' '+t(m[2])+m[3].replace(/^( \/ )(.+)$/,(_, separator, category)=>separator+t(category));
  else if((m=key.match(/^(\d+) (articles to explore|article to explore|questions|question)$/)))next=m[1]+' '+t(m[2]);
  else if((m=key.match(/^(\d+) MIN READ$/)))next=m[1]+' '+t('MIN READ');
  else if((m=key.match(/^(\d+) min read$/)))next=m[1]+' '+t('min read');
  else if((m=key.match(/^Weidian item ID (\d+)$/)))next=t('Weidian item ID')+' '+m[1];
  else if((m=key.match(/^(.+) \/ FIND (\d+)$/)))next=t(m[1])+' / '+t('FIND')+' '+m[2];
  else if((m=key.match(/^Reference conversion · 1 USD = ([\d.]+) CNY · (.+)\.$/)))next=t('Reference conversion')+' · 1 USD = '+m[1]+' CNY · '+m[2]+'.';
  else if((m=key.match(/^(.+) · (\d+) MIN READ$/)))next=t(m[1])+' · '+m[2]+' '+t('MIN READ');
  else if(key.startsWith('Could not load '))next=t('Content could not be loaded. Please try again.');
  else if(key.includes(' · '))next=key.split(' · ').map(part=>translate(part)).join(' · ');
  else if(/[↗→]$/.test(key))next=translate(key.slice(0,-1).trim())+' '+key.slice(-1);
  else if(/^[←↥]/.test(key))next=key[0]+' '+translate(key.slice(1).trim());
 }
 if(!next)return value;
 return (String(value).match(/^\s*/)?.[0]||'')+next+(String(value).match(/\s*$/)?.[0]||'');
}
const excluded=n=>n.parentElement?.closest('script,style,noscript,code,pre,[data-i18n-ignore],[data-product-title],.product-number,.brand');
function apply(){
 observer.disconnect();
 try{
  const walker=document.createTreeWalker(document,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())){if(excluded(node))continue;if(!originalText.has(node))originalText.set(node,node.nodeValue);const next=translate(originalText.get(node));if(next!==node.nodeValue)node.nodeValue=next;}
  for(const el of document.querySelectorAll('[placeholder],[aria-label],[title],.walk-step img[alt],meta[name="description"],meta[property="og:title"],meta[property="og:description"]')){
   if(el.closest('[data-i18n-ignore],[data-product-title]'))continue;
   let attrs=originalAttrs.get(el);if(!attrs){attrs={};originalAttrs.set(el,attrs);}
   for(const attr of ['placeholder','aria-label','title','alt',...(el.matches('meta')?['content']:[])]){
    if(!el.hasAttribute(attr))continue;if(!(attr in attrs))attrs[attr]=el.getAttribute(attr);const value=translate(attrs[attr]);if(el.getAttribute(attr)!==value)el.setAttribute(attr,value);
   }
  }
  for (const el of document.querySelectorAll('[data-product-title]')) {
   const original = el.dataset.originalTitle ?? el.textContent;
   el.dataset.originalTitle = original;
   const name = productName(el.dataset.productId, original);
   if (el.textContent !== name) el.textContent = name;
   el.title = original;
   el.dataset.localizedLanguage = language;

   const cardImage = el.closest('.product-card')?.querySelector('img');
   if (cardImage) cardImage.alt = name;
   if (el.tagName === 'H1') {
    const title = name + ' | LoongBuy Findsheet';
    if (document.title !== title) document.title = title;

   }
  }
  for (const image of document.querySelectorAll('img[data-product-photo]')) {
   image.alt = productName(image.dataset.productPhoto, image.dataset.productName) + ' · ' + photoLabel;
  }
  for(const a of document.querySelectorAll('a[href]')){
   const raw=originalLinks.get(a)??a.getAttribute('href');if(!originalLinks.has(a))originalLinks.set(a,raw);
   if(!raw||raw.startsWith('#'))continue;let u;try{u=new URL(raw,location.href);}catch{continue;}
   if(u.origin!==location.origin||/\.(jpg|jpeg|webp|png|svg|ico|json)$/i.test(u.pathname))continue;
   if(language==='en')u.searchParams.delete('lang');else u.searchParams.set('lang',language);
   const href=u.pathname+u.search+u.hash;if(a.getAttribute('href')!==href)a.setAttribute('href',href);
  }
  $('#language-toggle').setAttribute('aria-label',dictionary.Language||'Language');$('#language-panel-label').textContent=dictionary.Language||'Language';
 }finally{observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});}
}
function productName(id, fallback) {
 return Object.hasOwn(productNames, id) ? productNames[id] : fallback;
}
const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();});});
async function read(url){const r=await fetch(url);if(!r.ok)throw Error('Language pack unavailable');return r.json();}
async function setLanguage(code,{remember=true,updateUrl=true}={}){
 if(!supported.has(code))return false;const id=++revision;picker.setAttribute('aria-busy','true');$('#language-status').textContent='';
 try{
  if (!cache.has(code)) {
   cache.set(code, read('/i18n/' + encodeURIComponent(code) + '.json?v=mobile-qc-v1')
    .catch(error => { cache.delete(code); throw error; }));
  }
  if (!productCache.has(code)) {
   productCache.set(code, read('/i18n/catalog/' + encodeURIComponent(code) + '.json?v=all-products-v1')
    .catch(error => { productCache.delete(code); throw error; }));
  }
  const [nextDictionary, nextCatalog] = await Promise.all([cache.get(code), productCache.get(code)]);
  if (id !== revision) return false;
  dictionary = nextDictionary;
  language = code;
  productNames = nextCatalog.names;
  photoLabel = nextCatalog.photoLabel;
  document.documentElement.lang=code;document.documentElement.dir=supported.get(code).dir;$('#current-language').textContent=supported.get(code).name;$('#language-note').textContent=supported.get(code).note;
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===code)));apply();
  if(remember)try{localStorage.setItem('loongbuy-language',code);}catch{}
  if(updateUrl){const u=new URL(location.href);if(code==='en')u.searchParams.delete('lang');else u.searchParams.set('lang',code);history.replaceState(null,'',u);}
  picker.open=false;document.dispatchEvent(new CustomEvent('site-language-changed',{detail:{language:code}}));return true;
 }catch{
  if(id===revision){$('#language-status').textContent=translate('Unable to load this language. Please try again.');picker.open=true;}
  return false;
 }finally{if(id===revision)picker.removeAttribute('aria-busy');}
}
buttons.forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.language)));
document.addEventListener('click',e=>{if(!picker.contains(e.target))picker.open=false;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&picker.open){picker.open=false;$('#language-toggle').focus();}});
window.addEventListener('popstate',()=>setLanguage(new URL(location.href).searchParams.get('lang')||'en',{updateUrl:false}));
window.siteI18n={setLanguage,translate,apply,productName,get language(){return language;},get supportedLanguages(){return [...supported.keys()];}};
let initial=new URL(location.href).searchParams.get('lang');if(!supported.has(initial))try{initial=localStorage.getItem('loongbuy-language');}catch{}
setLanguage(supported.has(initial)?initial:'en');
})();
