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
function setupDetailActions(p){
 const container=root.querySelector('.detail-actions');if(!container)return;
 const menu=document.querySelector('.language'),summary=container.querySelector('summary'),copy=container.querySelector('[data-copy-weidian]'),status=container.querySelector('[data-copy-status]');
 const text=()=>actionText[menu?.value]||actionText.en;
 const sync=()=>{summary.textContent=text()[0]+' ▾';copy.textContent=text()[1];status.textContent=''};
 menu?.addEventListener('change',sync);sync();
 copy.addEventListener('click',async()=>{
  const value='https://weidian.com/item.html?itemID='+p.weidianId;
  try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(value);else{const el=document.createElement('textarea');el.value=value;el.setAttribute('readonly','');el.style.position='fixed';el.style.opacity='0';document.body.appendChild(el);el.select();const ok=document.execCommand('copy');el.remove();if(!ok)throw Error('copy unavailable')}status.textContent=text()[2]}
  catch(e){status.textContent=text()[3]}
 });
}
function details(p){
 const valid=/^\d+$/.test(String(p.weidianId||''));
 const buy='https://joyagoo.com/product?'+new URLSearchParams({id:p.weidianId,platform:'WEIDIAN',productUrl:'',productPwd:''});
 let images=[...new Set([p.image,...(p.sourceImages||[]),...(p.weidianImages||[])].filter(x=>/^https:\/\//.test(x)))];
 const related=data.filter(x=>x.id!==p.id&&x.category===p.category&&/^\d+$/.test(String(x.weidianId||''))&&x.image).slice(0,4);
 root.innerHTML=`<a class="detail-back" href="/catalog/">← Browse all products</a><div class="detail-layout"><section class="detail-gallery"><div class="detail-main"><img id="detail-photo" src="${esc(images[0]||'')}" alt="${esc(p.name)}"></div><div class="detail-thumbs" aria-label="Product photos"></div><h2>QC photos</h2><p>QC photos are not available in this catalogue. Check your own order on Joyagoo.</p></section><section class="detail-info"><p class="eyebrow">JOYAGOO SPREADSHEET</p><h1>${esc(p.name)}</h1><p>Product ID: <strong>${esc(p.weidianId)}</strong></p><p class="detail-price" data-cny-price="${esc(p.price)}">${usd(p.price)}</p>${valid?`<a class="btn detail-buy" href="${esc(buy)}">Buy on Joyagoo ↗</a><div class="detail-actions notranslate" translate="no"><details class="detail-agents"><summary>Other buying agents ▾</summary><div class="detail-agents-list">${otherAgentLinks(String(p.weidianId)).map(([name,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} ↗</a>`).join('')}</div></details><button type="button" class="detail-copy" data-copy-weidian>Copy Weidian link</button><span class="detail-copy-status" data-copy-status role="status" aria-live="polite"></span></div>`:''}<h2>Product photos</h2><p class="detail-status">Loading product photos…</p></section></div><section class="detail-weidian"><h2>Weidian product photos</h2><div class="detail-weidian-grid"></div><p class="detail-weidian-status">Loading product photos…</p></section><section class="detail-related"><h2>Related products</h2><div class="detail-related-grid">${related.map(x=>`<a class="detail-related-card" href="/product/?id=${encodeURIComponent(x.id)}"><img loading="lazy" src="${esc(x.image)}" alt="${esc(x.name)}"><strong>${esc(x.name)}</strong><span data-cny-price="${esc(x.price)}">${usd(x.price)}</span></a>`).join('')}</div></section>`;
 setupDetailActions(p);
 const thumb=root.querySelector('.detail-thumbs'),photo=root.querySelector('#detail-photo'),status=root.querySelector('.detail-status');
 function drawImages(){thumb.innerHTML=images.map((src,i)=>`<button type="button" class="detail-thumb" aria-label="Product photo ${i+1}"><img loading="lazy" src="${esc(src)}" alt=""></button>`).join('');thumb.querySelectorAll('button').forEach((b,i)=>b.addEventListener('click',()=>{photo.src=images[i];thumb.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active')}));thumb.querySelector('button')?.classList.add('active')}
 drawImages();fetch('https://findspreadsheet.com/api/Goods/getSkuData?weidian_id='+encodeURIComponent(p.weidianId),{credentials:'omit'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{if(String(d.weidian_id)!==String(p.weidianId)||!Array.isArray(d.images))throw Error();const weidian=[...new Set(d.images.filter(x=>typeof x==='string'&&/^https:\/\//.test(x)))];images=[...new Set([...images,...weidian])];drawImages();root.querySelector('.detail-weidian-grid').innerHTML=weidian.map((src,i)=>`<img loading="lazy" src="${esc(src)}" alt="${esc(p.name)} ${i+1}">`).join('');root.querySelector('.detail-weidian-status').textContent=weidian.length?'':'Product images from the catalogue. Additional photos are currently unavailable.';status.textContent='Product images from FindSpreadsheet. Check the exact item and options before buying.'}).catch(()=>{status.textContent='Product images from the catalogue. Additional photos are currently unavailable.';root.querySelector('.detail-weidian-status').textContent='Product images from the catalogue. Additional photos are currently unavailable.'});
}
function draw(){if(kind==='detail'){const p=data.find(x=>String(x.id)===params.get('id'));if(p)details(p);else root.innerHTML='<p>Product not found in this catalogue snapshot.</p>';return}const q=(root.querySelector('input')?.value||'').trim().toLowerCase(),sort=root.querySelector('select')?.value;let arr=data.filter(p=>p.id!=='6250'&&/^\d+$/.test(String(p.weidianId||''))&&findClass(p,kind)&&(!q||normalizeSearch(`${p.name} ${p.id} ${p.weidianId} ${p.category}`).includes(normalizeSearch(q))));if(sort==='price-low')arr.sort((a,b)=>Number(a.price)-Number(b.price));else if(sort==='price-high')arr.sort((a,b)=>Number(b.price)-Number(a.price));else arr.sort((a,b)=>Number(b.id)-Number(a.id));let total=Math.max(1,Math.ceil(arr.length/n));page=Math.min(page,total);let out=arr.slice((page-1)*n,page*n);root.querySelector('[data-status]').textContent=`${arr.length.toLocaleString()} products · page ${page} of ${total}`;root.querySelector('[data-grid]').innerHTML=out.map(p=>`<article class="catalog-card"><a href="/product/?id=${encodeURIComponent(p.id)}"><div class="catalog-image"><img loading="lazy" src="${esc(p.image)}" alt="${esc(p.name)}"></div><div class="product-info"><small>${esc(p.category)}</small><h3>${esc(p.name)}</h3><div class="product-bottom"><span data-cny-price="${esc(p.price)}">${usd(p.price)}</span><b>View details ↗</b></div></div></a></article>`).join('')||'<p>No matching products in this snapshot.</p>';root.querySelector('[data-prev]').disabled=page===1;root.querySelector('[data-next]').disabled=page>=total}
if(kind!=='detail'){root.innerHTML=`<div class="catalog-notice">FindSpreadsheet snapshot: 19 Oct 2026. Listings shown have a Weidian ID and open on Joyagoo. USD prices are estimates converted from the snapshot at 1 USD = 6.6753 CNY (6 Nov 2026); confirm the current price and availability on Joyagoo. QC photos are not included.</div><div class="catalog-controls"><label>Search <input type="search" placeholder="Product, category or item ID"></label><label>Sort <select><option value="latest">Latest ID</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div><p data-status>Loading products…</p><div class="catalog-grid" data-grid></div><div class="catalog-pages"><button data-prev>← Previous</button><button data-next>Next →</button></div>`;root.querySelector('input').addEventListener('input',()=>{page=1;draw()});root.querySelector('select').addEventListener('change',()=>{page=1;draw()});root.querySelector('[data-prev]').onclick=()=>{page--;draw();root.scrollIntoView()};root.querySelector('[data-next]').onclick=()=>{page++;draw();root.scrollIntoView()}}
fetch('/catalog.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{data=d.products;draw()}).catch(()=>root.innerHTML='<p>Unable to load the catalogue. Please try again.</p>');
})();
