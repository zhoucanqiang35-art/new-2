const icons = {
  search:'<circle cx="10.5" cy="10.5" r="6.2"/><path d="m15 15 4.5 4.5"/>',
  heart:'<path d="M20.7 8.5c0 4.5-8.7 9.2-8.7 9.2S3.3 13 3.3 8.5c0-4.2 5.3-5.8 8.7-2 3.4-3.8 8.7-2.2 8.7 2Z"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m4 17 5-5 3 3 3-4 5 6"/><circle cx="8" cy="8.5" r="1"/>',
  chevron:'<path d="m6 9 6 6 6-6"/>',
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3.5 12h17"/>'
};
const $ = id => document.getElementById(id);
const fetches = new Map();
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const params = new URLSearchParams(location.search);
const navForm=document.querySelector('.search-form');
const queryInput=navForm.querySelector('input');
const localeKey='superbuy-findsheet-language';
const saveKey='superbuy-findsheet-saved';
const agentKey='superbuy-findsheet-agent';
const currencyKey='superbuy-findsheet-currency';
const readStore=(key,fallback)=>{try{return localStorage.getItem(key) ?? fallback;}catch{return fallback;}};
const writeStore=(key,value)=>{try{localStorage.setItem(key,value);}catch{/* storage can be disabled */}};
const sitePage=document.body.dataset.page;
const catalogueRoot=document.querySelector('[data-catalog]');
const normalize=value=>String(value??'').normalize('NFKC').toLocaleLowerCase().trim();
const countFormat=value=>new Intl.NumberFormat(language).format(value);
let language='en';
let words={};
let names={};
let meta;
let records=[];
let agentChoice='superbuy';
let currency='USD';
let saved=new Set();
let localeRequest=0;
let rerender=()=>{};
let renderVisual=()=>{};
const mobileHome=window.matchMedia('(max-width: 670px)');
const compactSections=[...document.querySelectorAll('[data-home-compact]')];
function openContentAnchor() {
  const target=$(location.hash.slice(1));
  target?.querySelector('details')?.setAttribute('open','');
}
function updateHomeSections() {
  compactSections.forEach(section=>{section.open=!mobileHome.matches;});
  openContentAnchor();
}
updateHomeSections();
mobileHome.addEventListener('change',updateHomeSections);
window.addEventListener('hashchange',openContentAnchor);

try {
  const value=JSON.parse(readStore(saveKey,'[]'));
  if(Array.isArray(value)) saved=new Set(value.filter(id=>/^\d+$/.test(id)));
} catch {/* invalid legacy storage */}

function get(path) {
  if(!fetches.has(path)) fetches.set(path,fetch(path).then(response=>{
    if(!response.ok)throw Error(path);
    return response.json();
  }).catch(error=>{fetches.delete(path);throw error;}));
  return fetches.get(path);
}
function tr(key,...values) {
  return (words[key]??key).replace(/\{(\d+)\}/g,(_,index)=>values[index]??'');
}
function text(key) { return `<span data-i18n="${esc(key)}">${esc(tr(key))}</span>`; }
function localize(root=document) {
  root.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=tr(el.dataset.i18n);});
  root.querySelectorAll('[data-placeholder]').forEach(el=>{el.placeholder=tr(el.dataset.placeholder);});
  root.querySelectorAll('[data-label]').forEach(el=>{el.setAttribute('aria-label',tr(el.dataset.label));});
  root.querySelectorAll('[data-icon]:empty').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});
  root.querySelectorAll('[data-listing-total]').forEach(el=>{el.textContent=tr('{0} Weidian listings from FindSpreadsheet',countFormat(Number(el.dataset.listingTotal.replaceAll(',',''))));});
  root.querySelectorAll('[data-alt]').forEach(el=>{el.alt=tr(el.dataset.alt);});
}
async function setLanguage(selected,remember=false) {
  const request=++localeRequest;
  const picker=$('language');
  const code=[...picker.options].some(o=>o.value===selected)?selected:'en';
  try {
    const [nextWords,nextNames]=code==='en'?[{},{}]:await Promise.all([
      get('/locales/'+code+'.json'),
      catalogueRoot||sitePage==='product'||sitePage==='image'?get('/product-locales/'+code+'.json'):{}
    ]);
    if(request!==localeRequest)return;
    words=nextWords;
    names=nextNames;
    document.documentElement.lang=language=code;
    document.documentElement.dir=['ar','he'].includes(code)?'rtl':'ltr';
    picker.value=code;
    if(remember)writeStore(localeKey,code);
    localize();
    updateShoppingPreferences();
    rerender();
    renderVisual();
  } catch {
    if(request===localeRequest){picker.value=language;picker.setCustomValidity(tr('Unable to load this language. Try again.'));picker.reportValidity();picker.setCustomValidity('');}
  }
}
$('language').value='en';
$('language').addEventListener('change',event=>void setLanguage(event.target.value,true));
localize();
const preferredLanguage=readStore(localeKey,'en');
if(preferredLanguage!=='en')void setLanguage(preferredLanguage);

function updateSaved() {
  $('saved-count').textContent=countFormat(saved.size);
  document.querySelectorAll('[data-save]').forEach(el=>{
    const active=saved.has(el.dataset.save);
    const key=active?'Remove saved product':'Save product';
    el.setAttribute('aria-pressed',String(active));
    el.setAttribute('aria-label',tr(key));
    if(el.querySelector('[data-save-text]')) el.querySelector('[data-save-text]').textContent=tr(key);
  });
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-save]');
  if(!button)return;
  const id=button.dataset.save;
  if(!saved.delete(id)) saved.add(id);
  writeStore(saveKey,JSON.stringify([...saved]));
  updateSaved();
  if(sitePage==='saved')rerender();
});
updateSaved();

function detailLink(id) { return '/product/?id='+encodeURIComponent(id); }
function sellerLink(id) { return 'https://weidian.com/item.html?itemID='+encodeURIComponent(id); }
function buy(id) {
  return 'https://www.superbuy.com/en/page/buy/?'+new URLSearchParams({nTag:'Home-search',from:'search-input',url:sellerLink(id),partnercode:'ES7pVI'});
}
function idFrom(value) {
  const query=value.trim();
  if(/^\d{5,}$/.test(query))return query;
  try {
    const url=new URL(query);
    if(['weidian.com','www.weidian.com'].includes(url.hostname))return url.searchParams.get('itemID')??'';
    if(['superbuy.com','www.superbuy.com'].includes(url.hostname)) return idFrom(url.searchParams.get('url')??'');
    if(['findspreadsheet.com','www.findspreadsheet.com'].includes(url.hostname)||url.origin===location.origin)return url.searchParams.get('id')??'';
  } catch {/* ordinary text */}
  return '';
}
function label(cat) {return meta.categories.find(([key])=>key===cat)?.[1]??'Other finds';}
function name(p) {return names[p.weidianId]||p.name;}
function cover(p) { return meta.local.includes(p.id)?'/featured/'+p.id+'.webp':p.image; }
function moneyAmount(amount, code=currency) {
  return new Intl.NumberFormat(language,{style:'currency',currency:code,currencyDisplay:code==='USD'?'narrowSymbol':'symbol'}).format(amount*meta.rates[code]);
}
function money(p) {
  const amount=Number(p.price);
  return Number.isFinite(amount)&&amount>0?moneyAmount(amount):tr('Price on listing');
}
function sourcePage(p) { return new URL(p.sourcePath,'https://findspreadsheet.com').href; }
function agentUrl(agent,product) {
  if(agent.id==='findspreadsheet')return sourcePage(product);
  return agent.template.replace('{productId}',encodeURIComponent(product.weidianId));
}
function preferredAgentLink(product) {
  const agent=meta.agents.find(item=>item.id===agentChoice);
  return `<a class="btn primary" href="${esc(agentUrl(agent,product))}" target="_blank" rel="${agent.id==='findspreadsheet'?'noopener':'sponsored noopener'}">${esc(tr('View on {0}',agent.name))}</a>`;
}
function updateShoppingPreferences() {
  if(!meta)return;
  const agent=meta.agents.find(item=>item.id===agentChoice);
  $('current-agent').textContent=agent.name;
  $('current-agent-logo').src=agent.logo;
  $('current-currency').textContent=currency;
  $('currency-source').textContent=tr('Reference rates')+' · '+meta.ratesDate;
  document.querySelectorAll('[data-agent]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.agent===agentChoice)));
  document.querySelectorAll('[data-currency]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.currency===currency)));
}
function setupShoppingPreferences() {
  const menu=$('shopping-options');
  const summary=menu.querySelector('summary');
  const initialAgent=readStore(agentKey,'superbuy');
  const initialCurrency=readStore(currencyKey,'USD');
  if(meta.agents.some(agent=>agent.id===initialAgent))agentChoice=initialAgent;
  if(Object.hasOwn(meta.rates,initialCurrency))currency=initialCurrency;
  updateShoppingPreferences();
  menu.addEventListener('click',event=>{
    const button=event.target.closest('[data-agent],[data-currency]');
    if(!button)return;
    if(button.dataset.agent){agentChoice=button.dataset.agent;writeStore(agentKey,agentChoice);}
    if(button.dataset.currency){currency=button.dataset.currency;writeStore(currencyKey,currency);}
    updateShoppingPreferences();
    rerender();
    renderVisual();
  });
  menu.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menu.open){
      event.preventDefault();
      menu.open=false;
      summary.focus();
    }
  });
  document.addEventListener('pointerdown',event=>{if(menu.open&&!menu.contains(event.target))menu.open=false;});
}
function agentDestination(product, selected) {
  const agent=meta.agents.find(item=>item.id===selected);
  return agent
    ? `<a class="btn outline" href="${esc(agentUrl(agent,product))}" target="_blank" rel="${agent.id==='findspreadsheet'?'noopener':'sponsored noopener'}">${text('Open listing')}</a>`
    : `<button type="button" class="btn outline" disabled>${text('Open listing')}</button>`;
}
function agentPicker(product, selected) {
  const options=meta.agents.filter(agent=>agent.id!=='superbuy').map(agent=>
    `<option value="${esc(agent.id)}"${agent.id===selected?' selected':''}>${esc(agent.name)}</option>`
  ).join('');
  return `<div class="detail-agent-picker" id="other-agents">
    <label class="language"><select id="detail-agent" aria-label="${esc(tr('Other shopping agents'))}">
      <option value="" disabled${selected?'':' selected'}>${esc(tr('Other shopping agents'))}</option>${options}
    </select></label>
    <span id="agent-destination">${agentDestination(product,selected)}</span>
  </div>`;
}
function link(url,label,sponsored=false) {
  return `<a class="btn ${sponsored?'primary':'outline'}" href="${esc(url)}" target="_blank" rel="${sponsored?'sponsored noopener':'noopener'}">${text(label)}</a>`;
}
function card(p,photo=cover(p)) {
  const title=esc(name(p)), href=detailLink(p.weidianId);
  return `<article class="card" data-rendered-product="${p.weidianId}"><div class="card-media">
    <a href="${href}"><img src="${esc(photo)}" width="320" height="320" alt="${title}" loading="lazy"></a>
    <button type="button" class="save" data-save="${p.weidianId}" aria-pressed="false">${icon('heart')}</button></div>
    <div class="card-info"><p>${esc(tr(label(p.category)))}</p><h3><a href="${href}">${title}</a></h3><strong class="price">${esc(money(p))}</strong>
    <div class="card-actions"><a class="btn outline" href="${href}">${text('View details')}</a>${preferredAgentLink(p)}</div></div></article>`;
}
function applyImageFallback(root) {
  root.querySelectorAll('img').forEach(img=>{
    img.addEventListener('error',()=>{
      if(img.dataset.loadFailed)return;
      img.dataset.loadFailed='true';
      img.src='/assets/image-unavailable.svg';
    });
  });
}

function setupCatalog() {
  const size=sitePage==='home'?8:24;
  const featured=new Map(meta.spotlight.map((id,index)=>[id,index]));
  const keys=new Set(meta.categories.map(([key])=>key));
  let category=keys.has(params.get('category'))?params.get('category'):'';
  let sort=['new','asc','desc'].includes(params.get('sort'))?params.get('sort'):'featured';
  let page=Math.max(1,Number.parseInt(params.get('page')||'1',10)||1);
  let query=params.get('q')??'';
  const onlySaved=sitePage==='saved';
  $('sort').value=sort;
  queryInput.value=query;

  function render() {
    const exact=idFrom(query);
    const terms=normalize(query).split(/\s+/).filter(Boolean);
    const matching=records.filter(p=>{
      if(onlySaved&&!saved.has(p.weidianId)||category&&p.category!==category)return false;
      if(exact)return p.weidianId===exact||p.id===exact;
      return terms.every(term=>normalize(p.name+' '+name(p)+' '+p.weidianId+' '+tr(label(p.category))).includes(term));
    });
    if(sort==='featured') matching.sort((a,b)=>(featured.get(a.id)??Infinity)-(featured.get(b.id)??Infinity));
    if(sort==='asc'||sort==='desc') matching.sort((a,b)=>{
      const av=Number(a.price)>0?Number(a.price):null,bv=Number(b.price)>0?Number(b.price):null;
      if(av===null||bv===null)return av===bv?0:av===null?1:-1;
      return sort==='asc'?av-bv:bv-av;
    });
    const pages=Math.max(1,Math.ceil(matching.length/size));
    page=Math.min(page,pages);
    const list=$('catalog-results');
    list.innerHTML=matching.slice((page-1)*size,page*size).map(p=>card(p)).join('')||
      `<p class="empty">${text(onlySaved?'No saved products match these filters.':'No matches. Try a broader search or select All finds.')}</p>`;
    $('catalog-status').textContent=tr(matching.length===1?'{0} find':'{0} finds',countFormat(matching.length));
    $('catalog-pages').hidden=pages===1;
    $('page-status').textContent=`${countFormat(page)} / ${countFormat(pages)}`;
    $('catalog-pages').querySelector('[data-page-step="-1"]').disabled=page===1;
    $('catalog-pages').querySelector('[data-page-step="1"]').disabled=page>=pages;
    catalogueRoot.querySelectorAll('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===category)));
    applyImageFallback(list);
    updateSaved();
  }
  function updateUrl() {
    const url=new URL(location.href);
    for(const [k,v] of [['category',category],['sort',sort==='featured'?'':sort],['q',query],['page',page===1?'':page]]) {
      if(v)url.searchParams.set(k,v);else url.searchParams.delete(k);
    }
    history.replaceState(null,'',url);
    render();
  }
  catalogueRoot.addEventListener('click',event=>{
    const filter=event.target.closest('[data-category]');
    const pageButton=event.target.closest('[data-page-step]');
    if(filter){category=filter.dataset.category;page=1;updateUrl();}
    if(pageButton){page+=Number(pageButton.dataset.pageStep);updateUrl(); if(sitePage!=='home')catalogueRoot.scrollIntoView({block:'start'});}
  });
  $('sort').addEventListener('change',()=>{sort=$('sort').value;page=1;updateUrl();});
  rerender=render;
  render();
}

async function listingSpecs(id) {
  const url=new URL('/api/Goods/getSkuData','https://findspreadsheet.com');
  url.searchParams.set('weidian_id',id);
  const response=await fetch(url,{signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('FindSpreadsheet SKU request');
  const data=await response.json();
  if(String(data.weidian_id)!==id)throw Error('Mismatched item ID');
  return data;
}
function sellerSpecifications(data) {
  if(data===undefined)return `<p role="status">${text('Loading seller specifications…')}</p>`;
  if(!data)return `<p>${text('Seller specifications are currently unavailable. Check the original Weidian listing for available options.')}</p>`;
  const item=data.raw_data?.result?.default_model?.item_info;
  const attrs=Array.isArray(data.specifications?.attrs)?data.specifications.attrs:[];
  const sku=Object.values(data.specifications?.skus??{}).filter(row=>row&&typeof row==='object');
  const prices=sku.map(row=>Number(row.price)).filter(value=>Number.isFinite(value)&&value>0);
  const low=Math.min(...prices),high=Math.max(...prices);
  const seller=data.shop_info?.shopName;
  const description=typeof item?.itemShareDesc==='string'?item.itemShareDesc.trim():'';
  const facts=[
    ['Seller listing title',data.title],
    ['Seller',seller],
    ['Seller variant price range',prices.length?(low===high?moneyAmount(low):moneyAmount(low)+' – '+moneyAmount(high)):''],
    ['Listed variant combinations',sku.length?countFormat(sku.length):'']
  ].filter(([,value])=>typeof value==='string'&&value.trim());
  const options=attrs.map(group=>{
    const values=(Array.isArray(group?.attr_values)?group.attr_values:[]).map(value=>value?.attr_value||value?.name).filter(value=>typeof value==='string'&&value.trim());
    if(!values.length)return '';
    return `<section class="option-group"><h3>${esc(group.attr_title||tr('Options'))}</h3><ul class="option-values">${[...new Set(values)].map(value=>`<li>${esc(value)}</li>`).join('')}</ul></section>`;
  }).join('');
  return `${facts.length?`<dl class="facts seller-facts">${facts.map(([key,value])=>`<div><dt>${text(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`:''}
    ${description&&description!==data.title?`<p class="seller-description"><strong>${text('Seller description')}</strong> <span lang="zh-CN">${esc(description)}</span></p>`:''}
    ${options||`<p>${text('The seller feed does not include separate option groups for this listing.')}</p>`}
    <p class="status">${text('Seller specifications from FindSpreadsheet. Confirm available variants and the final price with the seller or agent.')}</p>`;
}

function originalListingPhotos(data) {
  const sellerImages=data?.raw_data?.result?.default_model?.item_info?.imgs;
  const urls=Array.isArray(sellerImages)&&sellerImages.length?sellerImages:data?.images;
  return Array.isArray(urls)?[...new Set(urls.filter(url=>typeof url==='string'&&url.startsWith('https://')))]:[];
}

function purchasePhotoGallery(data, fallback, product) {
  const original=originalListingPhotos(data);
  const images=original.length?original:fallback;
  const label=original.length?'Photos from the original seller listing.':'Saved listing photos for this item.';
  return `<p class="status">${text(label)} · ${esc(tr('{0} listing photos',countFormat(images.length)))}</p>
    <div class="purchase-photo-track" tabindex="0" role="region" aria-label="${esc(tr('Purchase page photos'))}">
      ${images.map((url,index)=>`<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(tr('Open seller photo {0}',countFormat(index+1)))}">
        <img src="${esc(url)}" width="150" height="150" loading="lazy" referrerpolicy="no-referrer" alt="${esc(name(product))}"></a>`).join('')}
    </div>`;
}

async function setupProduct() {
  const id=idFrom(params.get('id')??'');
  const product=records.find(p=>p.weidianId===id)||records.find(p=>p.id===id);
  const view=$('product-view');
  if(!product){view.innerHTML=`<h1>${text('Product Details')}</h1><p class="empty">${text('This product could not be found in the preview.')}</p><a class="btn outline" href="/products/">${text('Back to finds')}</a>`;return;}
  const skuRequest=listingSpecs(product.weidianId).catch(()=>null);
  const [galleryResult,qcResult]=await Promise.allSettled([get('/data/gallery-'+product.weidianId.slice(0,4)+'.json'),get('/data/qc-featured.json')]);
  const listingSnapshot=[...new Set([product.image,...(galleryResult.value?.[product.weidianId]??[])])].filter(Boolean);
  const images=[...new Set([cover(product),...listingSnapshot])].filter(Boolean);
  const qc=qcResult.value?.[product.weidianId]?.images??[];
  const related=records.filter(p=>p.category===product.category&&p.weidianId!==product.weidianId).slice(0,4);
  let selected=0;
  let selectedAgent='';
  let specifications;
  function render() {
    const title=esc(name(product));
    const category=label(product.category);
    const check=meta.checks[product.category]?.[0]??meta.checks['other-stuff'][0];
    $('product-crumb').textContent=name(product);
    document.title=name(product)+' | Superbuy Findsheet';
    view.innerHTML=`<div class="detail-grid"><section class="detail-panel" aria-label="${esc(tr('Product photos'))}">
      <div class="detail-media"><a href="${esc(images[selected])}" target="_blank" rel="noopener"><img src="${esc(images[selected])}" alt="${title}" width="580" height="580"></a></div>
      <div class="photo-tools">${images.length>1?`<button class="btn outline" data-photo-step="-1">${text('Previous photo')}</button>`:''}<span>${countFormat(selected+1)} / ${countFormat(images.length)}</span>${images.length>1?`<button class="btn outline" data-photo-step="1">${text('Next photo')}</button>`:''}</div>
      <div class="thumbnails">${images.map((url,index)=>`<button type="button" data-photo="${index}" aria-pressed="${index===selected}" aria-label="${esc(tr('Show product photo {0}',index+1))}"><img src="${esc(url)}" width="62" height="62" loading="lazy" alt=""></button>`).join('')}</div>
      ${galleryResult.status==='rejected'?`<p>${text('Additional listing photos could not load.')}</p>`:''}</section>
      <div class="detail-side"><section class="detail-panel detail-info"><p class="category-label">${esc(tr(category))}</p><h1>${title}</h1>
      <strong class="detail-price">${esc(money(product))}</strong><p>${text('Reference price')} (${esc(currency)}) · ${esc(tr('Weidian item #{0}',product.weidianId))}</p>
      <div class="detail-actions">${link(buy(product.weidianId),'View on Superbuy',true)}${link(sellerLink(product.weidianId),'View on Weidian')}
      ${agentPicker(product,selectedAgent)}
      <button class="btn outline" type="button" data-save="${product.weidianId}">${icon('heart')} <span data-save-text></span></button></div>
      <dl class="facts"><div><dt>${text('Category')}</dt><dd>${esc(tr(category))}</dd></div><div><dt>${text('Weidian item ID')}</dt><dd>${product.weidianId}</dd></div>
      <div><dt>${text('Seller snapshot price')}</dt><dd>${Number(product.price)>0?'¥'+esc(product.price):esc(tr('Price on listing'))}</dd></div><div><dt>${text('Listing photos')}</dt><dd>${countFormat(images.length)}</dd></div></dl>
      <p>${text('Reference listing price. Delivery and optional services are separate. Confirm the exact variant and payable amount on Superbuy.')}</p></section>
      <section class="detail-panel purchase-photo-panel" aria-labelledby="purchase-photos-title">
        <h2 id="purchase-photos-title">${text('Purchase page photos')}</h2>
        <div id="purchase-photos">${purchasePhotoGallery(specifications,listingSnapshot,product)}</div>
      </section></div></div>
      <section class="home-section" aria-labelledby="seller-spec-title"><h2 id="seller-spec-title">${text('Seller specifications')}</h2><div class="detail-panel seller-specifications" id="seller-specifications">${sellerSpecifications(specifications)}</div></section>
      <section class="home-section"><h2>${text('Product introduction')}</h2><div class="detail-articles"><article><h3>${text('Product identity and source')}</h3><p>${esc(tr('{0} is a Weidian listing in the {1} category. The linked seller page, image gallery and Superbuy entry refer to item {2}.',name(product),tr(category),product.weidianId))}</p><p>${text('Check the color, silhouette, materials described by the seller, and visible markings.')}</p></article>
      <article><h3>${text('Size, measurements and options')}</h3><p>${esc(tr(check))}</p><p>${text('Check whether the listing uses body or garment measurements.')}</p></article>
      <article><h3>${text('Reference price and what you pay')}</h3><p>${text('The catalog price converts the saved CNY listing price into your selected currency. Variant prices, local delivery, international shipping and agent services may affect the amount you pay.')}</p></article>
      <article><h3>${text('Before you order')}</h3><p>${text('Confirm the seller page, variant, measurements, quantity and payable total. Review any route restrictions and plan international shipping based on the expected packed parcel.')}</p><a class="text-link" href="/guide/">${text('Open buying guide')}</a></article></div></section>
      <section class="home-section"><h2>${text('Warehouse QC photos')}</h2><p>${qc.length?text('Historical reference QC from FindSpreadsheet. Review your own Superbuy warehouse photos before shipping.'):text('No warehouse photos are available in the preview for this listing.')}</p>
      ${qcResult.status==='rejected'?`<p>${text('QC records could not load. Try again.')}</p>`:''}
      <div class="qc-grid">${qc.map(({url,agent},index)=>`<figure><a href="${esc(url)}" target="_blank" rel="noopener"><img src="${esc(url)}" width="180" height="180" loading="lazy" alt="${esc(tr('Warehouse QC photo {0} from {1}',index+1,agent))}"></a><figcaption>${esc(agent||'FindSpreadsheet')}</figcaption></figure>`).join('')}</div>
      </section><section class="home-section"><h2>${text('Related products')}</h2><div class="card-grid">${related.map(p=>card(p)).join('')}</div></section>`;
    applyImageFallback(view);
    updateSaved();
  }
  view.addEventListener('change',event=>{
    if(event.target.id!=='detail-agent')return;
    selectedAgent=event.target.value;
    $('agent-destination').innerHTML=agentDestination(product,selectedAgent);
  });
  view.addEventListener('click',event=>{
    const button=event.target.closest('[data-photo],[data-photo-step]');
    if(!button)return;
    selected=button.hasAttribute('data-photo')?Number(button.dataset.photo):(selected+Number(button.dataset.photoStep)+images.length)%images.length;
    const selector=button.hasAttribute('data-photo')?`[data-photo="${selected}"]`:`[data-photo-step="${button.dataset.photoStep}"]`;
    render();
    view.querySelector(selector)?.focus();
  });
  rerender=render;
  render();
  void skuRequest.then(data=>{
    specifications=data;
    $('seller-specifications').innerHTML=sellerSpecifications(specifications);
    if(originalListingPhotos(specifications).length){
      const photos=$('purchase-photos');
      photos.innerHTML=purchasePhotoGallery(specifications,listingSnapshot,product);
      applyImageFallback(photos);
    }
  });
}

async function fingerprint(blob) {
  const bitmap=await createImageBitmap(blob);
  try {
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=8;
    const context=canvas.getContext('2d',{willReadFrequently:true});
    context.fillStyle='#fff';
    context.fillRect(0,0,8,8);
    context.drawImage(bitmap,0,0,8,8);
    return context.getImageData(0,0,8,8).data.filter((_,i)=>i%4!==3);
  } finally {bitmap.close();}
}
function setupVisual() {
  const input=$('image-file'), sample=$('try-image'), status=$('image-status');
  const output=$('image-results'), more=$('image-more');
  let index, previewUrl, shown=0, hits=[], statusKey='', statusCount=0;
  const catalogById=new Map(records.map(p=>[p.weidianId,p]));
  const distance=(a,b,offset=0)=>{let sum=0;for(let i=0;i<192;i++)sum+=Math.abs(a[i]-b[offset+i]);return sum;};
  function setStatus(key,count=0){statusKey=key;statusCount=count;status.textContent=tr(key,countFormat(count));}
  function genericCard(hit) {
    return `<article class="card"><div class="card-media"><a href="${esc(hit.href)}"><img src="${esc(hit.src)}" alt="${esc(tr(hit.title))}" loading="lazy"></a></div><div class="card-info"><h2><a href="${esc(hit.href)}">${esc(tr(hit.title))}</a></h2></div></article>`;
  }
  function draw() {
    output.innerHTML=hits.slice(0,shown).map(hit=>hit.product?card(hit.product,hit.src):genericCard(hit)).join('');
    more.hidden=shown>=hits.length;
    applyImageFallback(output);
    updateSaved();
  }
  renderVisual=()=>{draw();setStatus(statusKey,statusCount);showTotal();};
  more.addEventListener('click',()=>{shown+=24;draw();});
  const extra=get('/data/extra-visual.json');
  let imageTotal=0;
  function showTotal(){if(imageTotal)document.querySelector('[data-visual-total]').textContent=tr('{0} indexed images',countFormat(imageTotal));}
  extra.then(data=>{
    imageTotal=meta.indexedImages+data.length;
    showTotal();
  }).catch(()=>{});
  async function getIndex() {
    const [urls,response,extended]=await Promise.all([
      get('/data/visual-photos.json'),fetch('/data/visual-index.bin'),extra
    ]);
    if(!response.ok)throw Error('image index');
    const buffer=await response.arrayBuffer();
    if(buffer.byteLength!==urls.length*194)throw Error('image index length');
    return {urls, bytes:new Uint8Array(buffer), view:new DataView(buffer),extended};
  }
  async function search(file) {
    if(!file.size||(file.type&&!file.type.startsWith('image/'))||file.size>12*1024**2){
      setStatus('Choose an image up to 12 MB. The image stays in your browser.');return;
    }
    if(previewUrl)URL.revokeObjectURL(previewUrl);
    previewUrl=URL.createObjectURL(file);
    const preview=$('image-preview');
    preview.querySelector('img').src=previewUrl;
    preview.querySelector('figcaption').textContent=file.name??'';
    preview.hidden=false;
    hits=[];shown=0;draw();
    input.disabled=sample.disabled=true;
    setStatus('Searching product photos…');
    try {
      index??=getIndex().catch(error=>{index=undefined;throw error;});
      const [{urls,bytes,view,extended},rgb]=await Promise.all([index,fingerprint(file)]);
      const best=new Map();
      function score(key,hit,value){
        if(value<(best.get(key)?.score??Infinity))best.set(key,{...hit,score:value});
      }
      for(let row=0;row<urls.length;row++){
        const offset=row*194, product=records[view.getUint16(offset,true)];
        if(product)score(product.weidianId,{product,src:urls[row]},distance(rgb,bytes,offset+2));
      }
      for(const image of extended){
        const product=catalogById.get(image.id);
        score(product?.weidianId??image.src,{product,src:image.src,href:image.href,title:image.title},distance(rgb,image.rgb));
      }
      hits=[...best.values()].sort((a,b)=>a.score-b.score).slice(0,120);
      shown=24;draw();
      setStatus(hits.length?'Showing the {0} closest matches.':'No matches found.',hits.length);
    } catch {setStatus('Could not read this photo or load the search index. Try another image.');}
    finally {input.disabled=sample.disabled=false;}
  }
  input.addEventListener('change',()=>{
    const file=input.files?.[0];
    input.value='';
    if(file)void search(file);
  });
  sample.addEventListener('click',async()=>{
    sample.disabled=true;
    try {
      const r=await fetch('/featured/7953.webp');
      if(!r.ok)throw Error('sample');
      await search(new File([await r.blob()],'Crossbody bag.webp',{type:'image/webp'}));
    } catch {setStatus('Could not read this photo or load the search index. Try another image.');}
    finally {sample.disabled=false;}
  });

  const keyword=params.get('q')?.trim();
  if(keyword) {
    extra.then(data=>{
      const query=normalize(keyword);
      const id=idFrom(keyword);
      hits=records.filter(p=>id?p.weidianId===id:normalize(p.name+' '+name(p)).includes(query))
        .slice(0,120).map(product=>({product,src:cover(product)}));
      hits.push(...data.filter(image=>!image.id&&normalize(image.title).includes(query)));
      shown=24;draw();setStatus(hits.length?'{0} matches':'No matches found.',hits.length);
    }).catch(()=>setStatus('Image index unavailable'));
  }
}

const siteMetadata=get('/data/site-meta.json').then(data=>{
  meta=data;
  setupShoppingPreferences();
});
if(catalogueRoot||sitePage==='product'||sitePage==='image') {
  Promise.all([siteMetadata,get('/data/catalog.json')]).then(async ([,products])=>{
    records=products;
    if(catalogueRoot)setupCatalog();
    if(sitePage==='product')await setupProduct();
    if(sitePage==='image')setupVisual();
  }).catch(()=>{
    const target=$('catalog-status')||$('product-view')||$('image-status');
    if(target)target.textContent=tr('The catalogue could not load. Refresh to try again.');
  });
} else {
  siteMetadata.catch(()=>{$('currency-source').textContent=tr('Unable to load');});
}
