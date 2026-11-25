(() => {
const root=document.querySelector('[data-catalog]'); if(!root)return;
const kind=root.dataset.catalog; const params=new URLSearchParams(location.search); let data=[], page=1, n=24;
const map={'shoes':'shoes','hoodies':'hoodies-sweaters','jackets':'jackets','pants':'pants-shorts','hats':'headwear','electronics':'electronics','t-shirts':'t-shirts','sets':'ShortSets','jersey':'jersey','accessories':'accessories','other':'other-stuff'};
const labels={shoes:'Shoes',hoodies:'Hoodies & Sweaters',jackets:'Jackets',pants:'Pants & Shorts',hats:'Headwear',socks:'Socks',electronics:'Electronics',watches:'Watches',belts:'Belts',slippers:'Slippers','t-shirts':'T-Shirts',sets:'Short Sets',jersey:'Jersey',accessories:'Accessories',other:'Other'};
const usd=v=>Number.isFinite(Number(v))&&String(v).trim()!==''?'$'+(Number(v)/6.6753).toFixed(2)+' USD':'Price unavailable';
const normalizeSearch=v=>String(v??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/\s+/g,' ').trim();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const findClass=(p,k)=>{const name=p.name.toLowerCase(); if(k==='socks')return /\bsocks?\b/.test(name);if(k==='watches')return /\bwatch(?:es)?\b/.test(name);if(k==='belts')return /\bbelts?\b/.test(name);if(k==='slippers')return /\b(slippers?|slides?|sandals?)\b/.test(name);return !map[k]||p.category===map[k]};
const actionText={
 en:['Other buying agents','Copy Weidian link','Copied','Copy failed — please try again'],
 de:['Andere Einkaufsagenten','Weidian-Link kopieren','Kopiert','Kopieren fehlgeschlagen — bitte erneut versuchen'],
 fr:['Autres agents d’achat','Copier le lien Weidian','Copié','Échec de la copie — réessayez'],
 es:['Otros agentes de compra','Copiar enlace de Weidian','Copiado','No se pudo copiar; inténtalo de nuevo'],
 it:['Altri agenti d’acquisto','Copia link Weidian','Copiato','Copia non riuscita — riprova'],
 pt:['Outros agentes de compra','Copiar link Weidian','Copiado','Falha ao copiar — tente novamente'],
 nl:['Andere aankoopagenten','Weidian-link kopiëren','Gekopieerd','Kopiëren mislukt — probeer opnieuw'],
 pl:['Inni pośrednicy zakupowi','Kopiuj link Weidian','Skopiowano','Kopiowanie nie powiodło się — spróbuj ponownie'],
 sv:['Andra inköpsagenter','Kopiera Weidian-länk','Kopierad','Kopieringen misslyckades — försök igen'],
 zh:['其他代购平台','复制微店链接','已复制','复制失败，请重试']
};
Object.assign(actionText,{"fi":["Muut ostoagentit","Kopioi Weidian-linkki","Kopioitu","Kopiointi epäonnistui – yritä uudelleen"],"da":["Andre indkøbsagenter","Kopiér Weidian-link","Kopieret","Kopiering mislykkedes – prøv igen"],"nb":["Andre innkjøpsagenter","Kopier Weidian-lenke","Kopiert","Kopiering mislyktes – prøv igjen"],"cs":["Další nákupní agenti","Kopírovat odkaz Weidian","Zkopírováno","Kopírování se nezdařilo – zkuste to znovu"],"sk":["Ďalší nákupní agenti","Kopírovať odkaz Weidian","Skopírované","Kopírovanie zlyhalo – skúste to znova"],"hu":["Más vásárlási ügynökök","Weidian-hivatkozás másolása","Másolva","A másolás sikertelen – próbálja újra"],"ro":["Alți agenți de cumpărare","Copiază linkul Weidian","Copiat","Copierea a eșuat – încearcă din nou"],"el":["Άλλοι πράκτορες αγορών","Αντιγραφή συνδέσμου Weidian","Αντιγράφηκε","Η αντιγραφή απέτυχε – δοκιμάστε ξανά"],"tr":["Diğer alışveriş aracıları","Weidian bağlantısını kopyala","Kopyalandı","Kopyalama başarısız – tekrar deneyin"],"uk":["Інші агенти покупок","Копіювати посилання Weidian","Скопійовано","Не вдалося скопіювати – спробуйте ще раз"],"ar":["وكلاء شراء آخرون","نسخ رابط Weidian","تم النسخ","تعذّر النسخ، يرجى المحاولة مرة أخرى"],"ja":["その他の購入代行","Weidianリンクをコピー","コピーしました","コピーできませんでした。もう一度お試しください"],"ko":["다른 구매대행 업체","Weidian 링크 복사","복사됨","복사하지 못했습니다. 다시 시도해 주세요"],"vi":["Các đại lý mua hàng khác","Sao chép liên kết Weidian","Đã sao chép","Sao chép không thành công – vui lòng thử lại"]});
Object.assign(actionText,{ru:['Другие посредники','Скопировать ссылку Weidian','Скопировано','Не удалось скопировать'],id:['Agen pembelian lain','Salin tautan Weidian','Tersalin','Gagal menyalin']});
function otherAgentLinks(id){
 const w='https://weidian.com/item.html?itemID='+id, e=encodeURIComponent(w);
 return [
 ['Oopbuy','https://oopbuy.com/product/weidian/'+id+'?inviteCode=U68CWQBN5'],
 ['Litbuy','https://litbuy.com/product/weidian/'+id],
 ['Lovegobuy','https://www.lovegobuy.com/product?id='+id+'&shop_type=weidian&invite_code=161CPG'],
 ['Hipobuy','https://hipobuy.com/product/weidian/'+id],
 ['Sugargoo','https://www.sugargoo.com/#/home/productDetail?productLink='+e+'&memberId=1771881989097259278'],
 ['Kakobuy','https://kakobuy.com/item/details?url='+e],
 ['Superbuy','https://www.superbuy.com/en/page/buy/?nTag=Home-search&from=search-input&url='+e+'&partnercode=ES7pVI'],
 ['Loongbuy','https://loongbuy.com/product-details?url='+e],
 ['USFans','https://usfans.com/product/3/'+id],
 ['Mulebuy','https://mulebuy.com/zh/product/?shop_type=weidian&id='+id+'&ref=200232406'],
 ['Hoobuy','https://hoobuy.com/product/2/'+id+'?utm_source=share&utm_medium=product_details&inviteCode=vXpLpmrX'],
 ['Ootdbuy','https://www.ootdbuy.com/goods/details?id='+id+'&channel=weidian&inviteCode=179LQ1SVA'],
 ['Orientdig','https://orientdig.com/product/?shop_type=weidian&id='+id+'&ref=100114240'],
 ['Eastmallbuy','https://eastmallbuy.com/index/weidian/itemID='+id+'&inviter=lianglook520'],
 ['Ponybuy','https://www.ponybuy.com/en-gb/goods?tracking=e6cd1dcf21&product_id='+id+'&platform=weidian'],
 ['Pikobuy','https://www.pikobuy.com/product/detail?productUrl='+e],
 ['Lolobuy','https://www.lolobuy.com/productDetail/1783404849631986?url='+e],
 ['Panglobalbuy','https://panglobalbuy.com/#/details?type=3&offerId='+id+'&share_id=14918']
 ];
}
function setupDetailActions(){
 const container=root.querySelector('.detail-actions');if(!container)return;
 const menu=document.querySelector('.language'),summary=container.querySelector('summary'),copy=container.querySelector('[data-copy-weidian]'),status=container.querySelector('[data-copy-status]');
 const sourceLink=container.querySelector('.detail-agent-source');
 const text=()=>actionText[menu?.value]||actionText.en;
 const sync=()=>{summary.textContent=text()[0]+' ▾';copy.textContent=text()[1];sourceLink.textContent=menu?.value==='zh'?'打开微店商品原页':'Open original Weidian listing';status.textContent=''};
 menu?.addEventListener('change',sync);sync();
 copy.addEventListener('click',async()=>{
  const value=sourceLink.href;
  try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(value);else{const el=document.createElement('textarea');el.value=value;el.setAttribute('readonly','');el.style.position='fixed';el.style.opacity='0';document.body.appendChild(el);el.select();const ok=document.execCommand('copy');el.remove();if(!ok)throw Error('copy unavailable')}status.textContent=text()[2]}
  catch(e){status.textContent=text()[3]}
 });
}
const photoUrls = values => [...new Set(values.filter(value =>
 typeof value === 'string' && /^https:\/\//i.test(value)
))];

function details(p) {
 const valid = /^\d+$/.test(String(p.weidianId || ''));
 const buy = 'https://joyagoo.com/product?' + new URLSearchParams({
  id:p.weidianId, platform:'WEIDIAN', productUrl:'', productPwd:''
 });
 const listingPhotos = photoUrls([p.image, ...(p.weidianImages || []), ...(p.sourceImages || [])]);
 const qcPhotos = photoUrls(p.qcImages || []);
 const original = 'https://weidian.com/item.html?itemID=' + encodeURIComponent(p.weidianId);
 const detailPhotos = photoUrls([...(p.sourceImages || []), ...listingPhotos]);
 let activePhoto = listingPhotos[0];
 let images = listingPhotos;

 root.innerHTML = `
  <a class="detail-back" href="/catalog/">← Browse all products</a>
  <div class="detail-layout">
   <section class="detail-gallery" aria-label="Product photos">
    <div class="detail-main" hidden>
     <a target="_blank" rel="noopener noreferrer" aria-label="Open full-size photo">
      <img id="detail-photo" alt="${esc(p.name)}" fetchpriority="high">
     </a>
    </div>
    <p class="detail-empty" hidden>No product photos available.</p>
    <div class="detail-thumbs" aria-label="Product photos"></div>
   </section>
   <section class="detail-info">
    <h1>${esc(p.name)}</h1>
    <p class="detail-id">Product ID: <strong>${esc(p.weidianId)}</strong></p>
    <p class="detail-price" data-cny-price="${esc(p.price)}">${usd(p.price)}</p>
    ${valid ? `
     <a class="btn detail-buy" href="${esc(buy)}">Buy on Joyagoo ↗</a>
     <div class="detail-actions notranslate" translate="no">
      <details class="detail-agents">
       <summary>Other buying agents ▾</summary>
       <div class="detail-agents-list">${otherAgentLinks(String(p.weidianId)).map(([name,url]) =>
        `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">
         <img src="/assets/agents/${esc(name.toLowerCase())}.webp" alt="" width="24" height="24" loading="lazy">
         <span>${esc(name)}</span>
        </a>`).join('')}
        <a class="detail-agent-source" href="${esc(original)}" target="_blank" rel="noopener noreferrer">Open original Weidian listing</a>
       </div>
      </details>
      <button type="button" class="detail-copy" data-copy-weidian>Copy Weidian link</button>
      <span class="detail-copy-status" data-copy-status role="status"></span>
     </div>` : ''}
    <div class="detail-options"></div>
   </section>
  </div>
  <section class="detail-photos" hidden>
   <h2>Detail photos</h2>
   <div class="detail-photo-grid"></div>
  </section>
  <section class="detail-photos detail-qc" hidden>
   <h2>QC photos</h2>
   <p class="detail-qc-status notranslate" translate="no" role="status" hidden></p>
   <div class="detail-photo-grid"></div>
  </section>`;
 setupDetailActions();

 const photo = root.querySelector('#detail-photo');
 const thumbs = root.querySelector('.detail-thumbs');
 function showPhoto(url) {
  activePhoto = url;
  if (url) {
   photo.src = url;
   photo.parentElement.href = url;
  }
  photo.closest('.detail-main').hidden = !url;
  root.querySelector('.detail-empty').hidden = Boolean(url);
  for (const tile of thumbs.children) {
   tile.setAttribute('aria-pressed', String(tile.dataset.photo === url));
  }
 }

 function drawThumbs() {
  thumbs.hidden = images.length < 2;
  thumbs.innerHTML = images.map((url, index) => `
   <button type="button" class="detail-thumb" data-photo="${esc(url)}" aria-label="Product photo ${index + 1}">
    <img loading="lazy" src="${esc(url)}" alt="">
   </button>`).join('');
  showPhoto(activePhoto);
 }
 thumbs.addEventListener('click', event => {
  const tile = event.target.closest('[data-photo]');
  if (tile) showPhoto(tile.dataset.photo);
 });
 function drawPhotoGrid(selector, urls) {
  const section = root.querySelector(selector);
  section.hidden = urls.length === 0;
  section.querySelector('.detail-photo-grid').innerHTML = urls.map((url, index) => `
   <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">
    <img loading="lazy" src="${esc(url)}" alt="${esc(p.name)} ${index + 1}">
   </a>`).join('');
 }

 drawThumbs();
 drawPhotoGrid('.detail-photos', detailPhotos);
 drawPhotoGrid('.detail-qc', qcPhotos);
 if (!valid) return;
 if (!qcPhotos.length && /^\d{5,18}$/.test(String(p.weidianId))) {
  const section = root.querySelector('.detail-qc');
  const status = section.querySelector('.detail-qc-status');
  const language = document.querySelector('select.language');
  const messages = {
   loading: ['Checking for QC photos…', '正在查询验货图…'],
   none: ['No QC photos are available for this item.', '这个商品暂无验货图。'],
   pending: ['QC photos are being processed. Check again later.', '验货图正在处理，请稍后查看。'],
   unavailable: ['QC photos could not be checked. Try again later.', '暂时无法查询验货图，请稍后再试。']
  };
  let state = 'loading';
  function showQcStatus() {
   status.hidden = state === 'ready';
   if (status.hidden) return;
   section.hidden = false;
   status.textContent = messages[state][language?.value === 'zh' ? 1 : 0];
  }
  language?.addEventListener('change', showQcStatus);
  showQcStatus();
  fetch('/api/qc?item=' + encodeURIComponent(p.weidianId), {signal:AbortSignal.timeout(8500)})
   .then(response => {
    if (!response.ok) throw Error('QC unavailable');
    return response.json();
   })
   .then(record => {
    if (record.itemId !== String(p.weidianId) || !Array.isArray(record.images)) throw Error('QC response invalid');
    if (record.status === 'ready') {
     const images = photoUrls(record.images);
     if (!images.length) throw Error('QC images unavailable');
     drawPhotoGrid('.detail-qc', images);
     state = 'ready';
    } else {
     state = ['none', 'pending'].includes(record.status) ? record.status : 'unavailable';
    }
    showQcStatus();
   })
   .catch(() => {
    state = 'unavailable';
    showQcStatus();
   });
 }


 const endpoint = 'https://findspreadsheet.com/api/Goods/getSkuData?weidian_id=' + encodeURIComponent(p.weidianId);
 fetch(endpoint, {credentials:'omit', signal:AbortSignal.timeout(8000)})
  .then(response => {
   if (!response.ok) throw Error('Seller details unavailable');
   return response.json();
  })
  .then(seller => {
   if (String(seller.weidian_id) !== String(p.weidianId)) return;
   const sellerPhotos = photoUrls(Array.isArray(seller.images) ? seller.images : []);
   const firstPhoto = images[0];
   images = photoUrls([...sellerPhotos, ...listingPhotos]);
   if (!activePhoto || activePhoto === firstPhoto) activePhoto = images[0];
   drawThumbs();
   drawPhotoGrid('.detail-photos', photoUrls([...detailPhotos, ...sellerPhotos]));
   drawOptions(seller.specifications, p.price, showPhoto);
  })
  .catch(() => {});
}

function drawOptions(specifications, basePrice, showPhoto) {
 const attrs = Array.isArray(specifications?.attrs) ? specifications.attrs : [];
 const groups = attrs.map(group => ({
  title: String(group.attr_title || '').trim(),
  values: (Array.isArray(group.attr_values) ? group.attr_values : [])
   .filter(option => option?.attr_id != null && String(option.attr_value || '').trim())
 })).filter(group => group.title && group.values.length);
 const container = root.querySelector('.detail-options');
 const price = root.querySelector('.detail-price');
 const skus = Object.values(specifications?.skus || {}).filter(sku => sku?.attr_ids);
 const chosen = new Map();
 const priceFor = ids => skus.find(sku => {
  const skuIds = String(sku.attr_ids).split('-');
  return skuIds.length === ids.length && ids.every(id => skuIds.includes(id));
 })?.price;

 for (const [index, group] of groups.entries()) {
  const field = document.createElement('fieldset');
  const title = document.createElement('legend');
  title.textContent = /^size[.\s]*$/i.test(group.title) ? 'Size' : group.title;
  field.append(title);
  const tiles = document.createElement('div');
  tiles.className = 'detail-option-grid';
  field.append(tiles);
  for (const option of group.values) {
   const tile = document.createElement('button');
   tile.type = 'button';
   tile.setAttribute('aria-pressed', 'false');
   const image = photoUrls([option.img])[0];
   if (image) {
    const thumbnail = document.createElement('img');
    thumbnail.loading = 'lazy';
    thumbnail.alt = '';
    thumbnail.src = image;
    tile.append(thumbnail);
    tile.classList.add('detail-option-photo');
    tile.title = String(option.attr_value);
    tile.setAttribute('aria-label', tile.title);
   } else {
    tile.textContent = option.attr_value;
   }
   tile.addEventListener('click', () => {
    chosen.set(index, String(option.attr_id));
    for (const sibling of tiles.children) {
     sibling.setAttribute('aria-pressed', String(sibling === tile));
    }
    if (image) showPhoto(image);
    const amount = chosen.size === groups.length ? priceFor([...chosen.values()]) : null;
    const next = amount != null && Number(amount) > 0 ? amount : basePrice;
    price.dataset.cnyPrice = next;
    price.textContent = window.joyCurrency?.format(next) || usd(next);
   });
   tiles.append(tile);
  }
  container.append(field);
 }
}
function draw(){if(kind==='detail'){const p=data.find(x=>String(x.id)===params.get('id'));if(p)details(p);else root.innerHTML='<p>Product not found in this catalogue snapshot.</p>';return}const q=(root.querySelector('input')?.value||'').trim().toLowerCase(),sort=root.querySelector('select')?.value;let arr=data.filter(p=>p.id!=='6250'&&/^\d+$/.test(String(p.weidianId||''))&&findClass(p,kind)&&(!q||normalizeSearch(`${p.name} ${p.id} ${p.weidianId} ${p.category}`).includes(normalizeSearch(q))));if(sort==='price-low')arr.sort((a,b)=>Number(a.price)-Number(b.price));else if(sort==='price-high')arr.sort((a,b)=>Number(b.price)-Number(a.price));else arr.sort((a,b)=>Number(b.id)-Number(a.id));let total=Math.max(1,Math.ceil(arr.length/n));page=Math.min(page,total);let out=arr.slice((page-1)*n,page*n);root.querySelector('[data-status]').textContent=`${arr.length.toLocaleString()} products · page ${page} of ${total}`;root.querySelector('[data-grid]').innerHTML=out.map(p=>`<article class="catalog-card"><a href="/product/?id=${encodeURIComponent(p.id)}"><div class="catalog-image"><img loading="lazy" src="${esc(p.image)}" alt="${esc(p.name)}"></div><div class="product-info"><small>${esc(p.category)}</small><h3>${esc(p.name)}</h3><div class="product-bottom"><span data-cny-price="${esc(p.price)}">${usd(p.price)}</span><b>View details ↗</b></div></div></a></article>`).join('')||'<p>No matching products in this snapshot.</p>';root.querySelector('[data-prev]').disabled=page===1;root.querySelector('[data-next]').disabled=page>=total}
if(kind!=='detail'){root.innerHTML=`<div class="catalog-notice">FindSpreadsheet snapshot: 19 Oct 2026. Listings shown have a Weidian ID and open on Joyagoo. Displayed prices are estimates. Confirm the current price and availability on Joyagoo.</div><div class="catalog-controls"><label>Search <input type="search" placeholder="Try sneakers, hoodie, or a Weidian item ID…"></label><label>Sort <select><option value="latest">Latest ID</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div><p data-status>Loading products…</p><div class="catalog-grid" data-grid></div><div class="catalog-pages"><button data-prev>← Previous</button><button data-next>Next →</button></div>`;root.querySelector('input').value=params.get('q')||'';root.querySelector('input').addEventListener('input',()=>{page=1;draw()});root.querySelector('select').addEventListener('change',()=>{page=1;draw()});root.querySelector('[data-prev]').onclick=()=>{page--;draw();root.scrollIntoView()};root.querySelector('[data-next]').onclick=()=>{page++;draw();root.scrollIntoView()}}
fetch('/catalog.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{data=d.products;draw()}).catch(()=>root.innerHTML='<p>Unable to load the catalogue. Please try again.</p>');
})();
