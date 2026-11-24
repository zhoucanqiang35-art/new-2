(()=>{
'use strict';
const picker=document.getElementById('language-picker');if(!picker)return;
const buttons=[...picker.querySelectorAll('[data-language]')];
const supported=new Map(buttons.map(b=>[b.dataset.language,{name:b.querySelector('span').textContent,dir:b.dataset.direction}]));
const originals=new WeakMap(),attributes=new WeakMap(),linkOriginals=new WeakMap(),cache=new Map([['en',{}]]);
const normalize=s=>s.replace(/\s+/g,' ').trim();let language='en',dictionary={},productTerms=null,productCore=null,switchId=0,scheduled=false;const productCache=new Map();let corePromise;
const status=document.getElementById('language-status');
const excluded=node=>node.parentElement?.closest('script,style,noscript,code,pre,[data-i18n-ignore],.brand,.footer-brand,[data-product-title],[data-price-usd]');
function text(value){
 const source=normalize(value);if(!source||language==='en')return value;
 let result=dictionary[source];
 const t=s=>dictionary[s]||s;
 if(!result){
  let m;
  if((m=source.match(/^(From )?(\$[\d.,]+ USD)$/)))result=(m[1]?t('From')+' ':'')+m[2];
  else if((m=source.match(/^([\d,]+) (products in source catalog|products on this page|product-detail|indexed catalog images|products|visual matches from the full product catalog\.)(.*)$/)))result=m[1]+' '+t(m[2])+(m[3]?(m[3].trim().startsWith('·')?' · '+text(m[3].replace(/^\s*·\s*/,'')):text(m[3])):'');
  else if((m=source.match(/^([\d,]+) results · Page (\d+) of (\d+)$/)))result=m[1]+' '+t('results')+' · '+t('Page')+' '+m[2]+' '+t('of')+' '+m[3];
  else if((m=source.match(/^Page (\d+) · (Main-site snapshot|Live from the main catalog)(.*)$/)))result=t('Page')+' '+m[1]+' · '+t(m[2])+m[3];
  else if((m=source.match(/^Results for (.+)$/)))result=t('Results for')+' '+m[1];
  else if((m=source.match(/^(Show product photo|View QC photo|Open main-site QC photo|Photo) (\d+)$/)))result=t(m[1])+' '+m[2];
  else if((m=source.match(/^Main-site QC source · Weidian ID (.+)$/)))result=t('Main-site QC source · Weidian ID')+' '+m[1];
  else if((m=source.match(/^← Browse (.+) products$/)))result='← '+t('Browse')+' '+t(m[1])+' '+t('products');
  else if((m=source.match(/^More (.+) →$/)))result=t('More')+' '+t(m[1])+' →';
  else if((m=source.match(/^USFANS SPREADSHEET \/ (.+)$/)))result=t('USFANS SPREADSHEET /')+' '+t(m[1]);
  else if((m=source.match(/^Copy this product link: (.+)$/)))result=t('Copy this product link:')+' '+m[1];
  else if(source.startsWith(' / ')||source.startsWith('/ '))result='/ '+text(source.slice(2));
  else if(source.includes(' · '))result=source.split(' · ').map(s=>text(s)).join(' · ');
  else if(source.endsWith(' →'))result=text(source.slice(0,-2))+' →';
 }
 if(!result)return value;
 return (value.match(/^\s*/)?.[0]||'')+result+(value.match(/\s*$/)?.[0]||'');
}
function applyTree(root=document){
 observer.disconnect();
 try{
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode())){if(excluded(node))continue;const current=node.nodeValue;if(!originals.has(node))originals.set(node,current);const translated=text(originals.get(node));if(current!==translated)node.nodeValue=translated;}
 for(const el of root.querySelectorAll('[placeholder],[aria-label],[title],meta[name="description"]')){
  if(el.closest('[data-i18n-ignore]'))continue;
  let map=attributes.get(el);if(!map){map={};attributes.set(el,map);}
  for(const attr of ['placeholder','aria-label','title',...(el.matches('meta[name="description"]')?['content']:[])]){
   if(!el.hasAttribute(attr))continue;if(!(attr in map))map[attr]=el.getAttribute(attr);const translated=text(map[attr]);if(el.getAttribute(attr)!==translated)el.setAttribute(attr,translated);
  }
 }
 for(const el of root.querySelectorAll('[data-product-title]')){
  const original=el.dataset.originalTitle||el.textContent;el.dataset.originalTitle=original;
  const translated=language==='en'?original:productCore.translateProductTitle(original,el.dataset.productCategory,language,productTerms);
  if(el.textContent!==translated)el.textContent=translated;
  el.title=original;el.dataset.localizedLanguage=language;
  const card=el.closest('.listing-card');if(card){const img=card.querySelector('img');if(img&&img.alt!==translated)img.alt=translated;}
  if(el.tagName==='H1'){const img=document.getElementById('product-main-image');if(img)img.alt=translated;document.title=translated+' | USFans Findsheet';}
 }
 document.getElementById('language-toggle').setAttribute('aria-label',dictionary.Language||'Language');
 for(const a of document.querySelectorAll('a[href]')){
  const raw=linkOriginals.get(a)??a.getAttribute('href');if(!linkOriginals.has(a))linkOriginals.set(a,raw);
  if(!raw||raw.startsWith('#'))continue;
  let u;try{u=new URL(raw,location.href)}catch{continue}
  if(u.origin!==location.origin)continue;
  if(language==='en')u.searchParams.delete('lang');else u.searchParams.set('lang',language);
  u.searchParams.delete('currency');a.setAttribute('href',u.pathname+u.search+u.hash);
 }
 for(const form of document.querySelectorAll('form[method=get],form:not([method])')){
  if(new URL(form.action,location.href).origin!==location.origin)continue;
  let input=form.querySelector('input[name="lang"]');if(!input){input=document.createElement('input');input.type='hidden';input.name='lang';form.append(input)}input.value=language;
 }
 }finally{observer.observe(document.body,{subtree:true,childList:true,characterData:true});}
}
const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;applyTree()})});
async function setLanguage(code,{remember=true,updateUrl=true}={}){
 if(code==='zh-TW')code='zh-CN';if(!supported.has(code))return false;const id=++switchId;picker.setAttribute('aria-busy','true');status.textContent='';
 try{
  let next=cache.get(code);if(!next){const r=await fetch('/i18n/'+encodeURIComponent(code)+'.json?v=home-faq-1');if(!r.ok)throw Error('Missing language');next=await r.json();if(!next||typeof next!=='object'||!next.Spreadsheet)throw Error('Invalid language');cache.set(code,next)}
  let nextTerms=null,nextCore=null;
  if(code!=='en'){
   if(!corePromise)corePromise=import('/product-title-core.js?v=product-names-2');
   let termsPromise=productCache.get(code);
   if(!termsPromise){termsPromise=fetch('/i18n/products/'+encodeURIComponent(code)+'.json?v=product-names-2').then(r=>{if(!r.ok)throw Error('Missing product language');return r.json()}).then(d=>{if(!d['t-shirt']||!d.footwear)throw Error('Invalid product language');return d}).catch(e=>{productCache.delete(code);throw e});productCache.set(code,termsPromise);}
   [nextTerms,nextCore]=await Promise.all([termsPromise,corePromise]);
  }
  if(id!==switchId)return false;
  productTerms=nextTerms;productCore=nextCore;dictionary=next;language=code;document.documentElement.lang=code;document.documentElement.dir=supported.get(code).dir;document.getElementById('current-language').textContent=supported.get(code).name;document.getElementById('language-panel-label').textContent=next.Language||'Language';
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===code)));
  applyTree();if(remember)try{localStorage.setItem('usfans-language',code)}catch{}
  if(updateUrl){const url=new URL(location.href);url.searchParams.set('lang',code);url.searchParams.delete('currency');history.replaceState(null,'',url)}
  const returnFocus=picker.open&&picker.contains(document.activeElement);picker.open=false;if(returnFocus)document.getElementById('language-toggle').focus({preventScroll:true});document.dispatchEvent(new CustomEvent('site-language-changed',{detail:{language:code}}));return true;
 }catch(error){if(id===switchId){status.textContent=dictionary['Unable to load this language. Please try again.']||'Unable to load this language. Please try again.';picker.open=true;}return false;}
 finally{if(id===switchId){picker.removeAttribute('aria-busy');delete document.documentElement.dataset.localePending}}
}
buttons.forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.language)));
document.addEventListener('click',e=>{if(!picker.contains(e.target))picker.open=false});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&picker.open){picker.open=false;document.getElementById('language-toggle').focus()}});
window.addEventListener('popstate',()=>{const code=new URL(location.href).searchParams.get('lang')||'en';setLanguage(code,{updateUrl:false})});
window.siteI18n={setLanguage,translate:text,get language(){return language},get supportedLanguages(){return [...supported.keys()]}};
let initial=new URL(location.href).searchParams.get('lang');if(initial==='zh-TW')initial='zh-CN';setLanguage(supported.has(initial)?initial:'en');
})();
