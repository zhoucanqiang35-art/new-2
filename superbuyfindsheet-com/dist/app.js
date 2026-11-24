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
let currency='USD';
let saved=new Set();
let localeRequest=0;
let rerender=()=>{};
let renderVisual=()=>{};

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
function closePicker(menu, restoreFocus=false) {
  menu.open=false;
  if(restoreFocus)menu.querySelector('summary').focus();
}

document.addEventListener('toggle',event=>{
  const menu=event.target;
  if(!menu.matches('[data-picker][open]'))return;
  document.querySelectorAll('[data-picker][open]').forEach(other=>{
    if(other!==menu)closePicker(other);
  });
},true);
document.addEventListener('pointerdown',event=>{
  document.querySelectorAll('[data-picker][open]').forEach(menu=>{
    if(!menu.contains(event.target))closePicker(menu);
  });
});
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const menu=event.target.closest('[data-picker][open]');
  if(menu){event.preventDefault();closePicker(menu,true);}
});

const languageMenu=$('language-options');
const languageChoices=[...languageMenu.querySelectorAll('[data-language]')];
const languageStatus=$('language-status');
async function setLanguage(selected,remember=false) {
  const request=++localeRequest;
  const choice=languageChoices.find(button=>button.dataset.language===selected)??languageChoices[0];
  const code=choice.dataset.language;
  languageStatus.hidden=true;
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
    $('current-language').textContent=choice.textContent;
    languageChoices.forEach(button=>button.setAttribute('aria-pressed',String(button===choice)));
    if(remember)writeStore(localeKey,code);
    localize();
    updateCurrencyPreference();
    rerender();
    renderVisual();
    updateSaved();
    if(remember&&languageMenu.open)closePicker(languageMenu,languageMenu.contains(document.activeElement));
  } catch {
    if(request===localeRequest){
      languageStatus.textContent=tr('Unable to load this language. Try again.');
      languageStatus.hidden=false;
    }
  }
}
languageMenu.addEventListener('click',event=>{
  const button=event.target.closest('[data-language]');
  if(button)void setLanguage(button.dataset.language,true);
});
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
function moneyAmount(amount, code='USD') {
  return new Intl.NumberFormat(language,{style:'currency',currency:code,currencyDisplay:code==='USD'?'narrowSymbol':'symbol'}).format(amount*meta.rates[code]);
}
function money(p) {
  const amount=Number(p.price);
  return Number.isFinite(amount)&&amount>0?moneyAmount(amount):tr('Price on listing');
}
function convertedPrice(amount) {
  return currency!=='USD'&&Number.isFinite(amount)&&amount>0
    ? `<span class="price-conversion">≈ ${esc(moneyAmount(amount,currency))} ${currency}</span>`
    : '';
}
function sourcePage(p) { return new URL(p.sourcePath,'https://findspreadsheet.com').href; }
function agentUrl(agent,product) {
  if(agent.id==='findspreadsheet')return sourcePage(product);
  return agent.template.replace('{productId}',encodeURIComponent(product.weidianId));
}
function updateCurrencyPreference() {
  if(!meta)return;
  $('current-currency').textContent=currency;
  $('currency-source').textContent=tr('Reference rates')+' · '+meta.ratesDate;
  document.querySelectorAll('[data-currency]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.currency===currency)));
}
function setupCurrencyPreference() {
  const initialCurrency=readStore(currencyKey,'USD');
  if(Object.hasOwn(meta.rates,initialCurrency))currency=initialCurrency;
  updateCurrencyPreference();
  const picker=$('currency-options');
  picker.addEventListener('click',event=>{
    const button=event.target.closest('[data-currency]');
    if(!button)return;
    currency=button.dataset.currency;
    writeStore(currencyKey,currency);
    closePicker(picker,true);
    updateCurrencyPreference();
    rerender();
    renderVisual();
  });
}
function agentPicker(product) {
  const options=meta.agents.filter(agent=>agent.id!=='superbuy').map(agent=>
    `<a href="${esc(agentUrl(agent,product))}" target="_blank" rel="${agent.id==='findspreadsheet'?'noopener':'sponsored noopener'}">
      <img src="${esc(agent.logo)}" width="20" height="20" alt="" loading="lazy"><span>${esc(agent.name)}</span></a>`).join('');
  return `<details class="choice-menu detail-agent-picker" data-picker>
    <summary>${text('Other shopping agents')}<span data-icon="chevron" aria-hidden="true">${icon('chevron')}</span></summary>
    <div class="choice-panel"><div class="choice-grid">${options}</div></div></details>`;
}
function link(url,label,sponsored=false) {
  return `<a class="btn ${sponsored?'primary':'outline'}" href="${esc(url)}" target="_blank" rel="${sponsored?'sponsored noopener':'noopener'}">${text(label)}</a>`;
}
function card(p,photo=cover(p)) {
  const title=esc(name(p)), href=detailLink(p.weidianId);
  return `<article class="card" data-rendered-product="${p.weidianId}"><div class="card-media">
    <a href="${href}"><img src="${esc(photo)}" width="320" height="320" alt="${title}" loading="lazy"></a>
    <button type="button" class="save" data-save="${p.weidianId}" aria-pressed="false">${icon('heart')}</button></div>
    <div class="card-info"><p>${esc(tr(label(p.category)))}</p><h3><a href="${href}">${title}</a></h3><strong class="price">${esc(money(p))}</strong>${convertedPrice(Number(p.price))}
    <div class="card-actions"><a class="btn outline" href="${href}">${text('View details')}</a>${link(buy(p.weidianId),'View on Superbuy',true)}</div></div></article>`;
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
function listingImageUrls(values) {
  return Array.isArray(values)?values.filter(url=>typeof url==='string'&&url.startsWith('https://')):[];
}

function variantGroups(specifications) {
  const attrs=specifications?.specifications?.attrs;
  if(!Array.isArray(attrs))return [];
  return attrs.map(group=>({
    title:group.attr_title||tr('Options'),
    options:(Array.isArray(group.attr_values)?group.attr_values:[]).flatMap(value=>{
      const label=value?.attr_value||value?.name;
      if(typeof label!=='string'||!label.trim())return [];
      const [photo]=listingImageUrls([value.img]);
      return [{label,photo}];
    })
  })).filter(group=>group.options.length);
}

async function setupProduct() {
  const id=idFrom(params.get('id')??'');
  const product=records.find(p=>p.weidianId===id)||records.find(p=>p.id===id);
  const view=$('product-view');
  if(!product){
    view.innerHTML=`<h1>${text('Product Details')}</h1><p class="empty">${text('This product could not be found.')}</p><a class="btn outline" href="/products/">${text('Back to finds')}</a>`;
    return;
  }

  const coverPhoto=cover(product);
  let selected=coverPhoto;
  let gallery=[];
  let qc=[];
  let sellerPhotos=[];
  let groups=[];
  let optionsLoading=true;
  const chosenOptions=new Map();

  function galleryImages() {
    return [...new Set([coverPhoto,...sellerPhotos,product.image,...gallery])].filter(Boolean);
  }

  function updatePhoto() {
    const link=view.querySelector('.detail-media a');
    const img=link.querySelector('img');
    if(img.getAttribute('src')!==selected){
      delete img.dataset.loadFailed;
      img.src=selected;
    }
    link.href=selected;
    view.querySelectorAll('[data-photo]').forEach(button=>{
      const active=button.dataset.photo===selected;
      button.setAttribute('aria-pressed',String(active));
    });
  }

  function renderGallery() {
    const images=galleryImages();
    const thumbnails=view.querySelector('.thumbnails');
    thumbnails.hidden=images.length<2;
    thumbnails.innerHTML=images.map((url,index)=>
      `<button type="button" data-photo="${esc(url)}" aria-pressed="${url===selected}" aria-label="${esc(tr('Show product photo {0}',index+1))}"><img src="${esc(url)}" width="64" height="64" loading="lazy" referrerpolicy="no-referrer" alt=""></button>`).join('');
    applyImageFallback(thumbnails);
  }

  function renderOptions() {
    const panel=$('listing-options');
    panel.innerHTML=groups.map(({title,options},group)=>
      `<fieldset class="option-group"><legend>${esc(title)}</legend>
      <div class="variant-list${options.some(option=>option.photo)?' variant-photos':''}">${options.map(({label,photo},index)=>
        `<button type="button" data-variant-group="${group}" data-variant-option="${index}" aria-pressed="${chosenOptions.get(group)===index}" aria-label="${esc(label)}" title="${esc(label)}">${photo?`<img src="${esc(photo)}" width="68" height="68" loading="lazy" referrerpolicy="no-referrer" alt="">`:esc(label)}</button>`).join('')}
      </div></fieldset>`).join('');
    if(!groups.length)panel.innerHTML=`<p class="status" role="status">${text(optionsLoading?'Loading seller specifications…':'Check the seller listing for available options.')}</p>`;
    applyImageFallback(panel);
  }

  function renderDetailPhotos() {
    const panel=$('detail-photos');
    const images=[...new Set((qc.length?qc:galleryImages()).filter(url=>url!==coverPhoto))];
    panel.hidden=images.length===0;
    panel.innerHTML=`<div class="section-head"><h2>${text('Detail photos')}</h2><span>${countFormat(images.length)}</span></div>
      <div class="qc-grid">${images.map((url,index)=>
        `<a href="${esc(url)}" target="_blank" rel="noopener"><img src="${esc(url)}" width="180" height="180" loading="lazy" referrerpolicy="no-referrer" alt="${esc(tr('Show product photo {0}',index+1))}"></a>`).join('')}</div>`;
    applyImageFallback(panel);
  }

  function render() {
    const title=esc(name(product));
    $('product-crumb').textContent=name(product);
    document.title=name(product)+' | Superbuy Findsheet';
    view.innerHTML=`<div class="detail-grid">
      <section class="detail-panel product-gallery" aria-label="${esc(tr('Product photos'))}">
        <div class="detail-media"><a href="${esc(selected)}" target="_blank" rel="noopener"><img src="${esc(selected)}" alt="${title}" width="580" height="580" fetchpriority="high" referrerpolicy="no-referrer"></a></div>
        <div class="thumbnails"></div>
      </section>
      <section class="detail-panel detail-info">
        <h1>${title}</h1><p class="product-id">${esc(tr('Weidian item #{0}',product.weidianId))}</p>
        <div class="product-price"><strong class="detail-price">${esc(money(product))}</strong>${Number(product.price)>0?' <span>USD</span>':''}${convertedPrice(Number(product.price))}</div>
        <div class="detail-actions">${link(buy(product.weidianId),'View on Superbuy',true)}
          <div class="detail-secondary-actions">${agentPicker(product)}
            <button class="btn outline" type="button" data-copy-product>${text('Copy product link')}</button>
          </div></div>
        <p id="copy-status" role="status" class="status" hidden></p>
        <div id="listing-options"></div>
      </section>
    </div><section class="home-section detail-photos" id="detail-photos" hidden></section>`;
    applyImageFallback(view.querySelector('.detail-media'));
    renderGallery();
    renderOptions();
    renderDetailPhotos();
  }

  view.addEventListener('click',async event=>{
    const button=event.target.closest('[data-photo],[data-variant-option],[data-copy-product]');
    if(!button)return;
    if(button.hasAttribute('data-copy-product')){
      const status=$('copy-status');
      status.hidden=false;
      try {
        await navigator.clipboard.writeText(sellerLink(product.weidianId));
        status.textContent=tr('Product link copied.');
      } catch {
        status.innerHTML=`<a class="text-link" href="${esc(sellerLink(product.weidianId))}" target="_blank" rel="noopener">${text('View on Weidian')}</a>`;
      }
      return;
    }
    if(button.hasAttribute('data-photo')){
      selected=button.dataset.photo;
    } else {
      const group=Number(button.dataset.variantGroup);
      const index=Number(button.dataset.variantOption);
      chosenOptions.set(group,index);
      button.closest('.variant-list').querySelectorAll('button').forEach(option=>{
        option.setAttribute('aria-pressed',String(option===button));
      });
      selected=groups[group].options[index].photo||selected;
    }
    updatePhoto();
  });

  rerender=render;
  render();
  void get('/data/gallery-'+product.weidianId.slice(0,4)+'.json').then(data=>{
    gallery=listingImageUrls(data[product.weidianId]);
    renderGallery();
    renderDetailPhotos();
  }).catch(()=>{});
  void get('/data/qc-featured.json').then(data=>{
    qc=(data[product.weidianId]?.images??[]).map(photo=>photo.url).filter(Boolean);
    renderDetailPhotos();
  }).catch(()=>{});
  void listingSpecs(product.weidianId).then(data=>{
    const item=data.raw_data?.result?.default_model?.item_info;
    sellerPhotos=listingImageUrls(item?.imgs);
    if(!sellerPhotos.length)sellerPhotos=listingImageUrls(data.images);
    groups=variantGroups(data);
    renderGallery();
    renderDetailPhotos();
  }).catch(()=>{}).finally(()=>{
    optionsLoading=false;
    renderOptions();
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
  setupCurrencyPreference();
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
