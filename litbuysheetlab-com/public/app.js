if(location.pathname==='/product/' || location.pathname==='/product'){
const id=new URLSearchParams(location.search).get('id');
if(id&&/^\d+$/.test(id)) location.replace('/products/'+id+'/');
}
(async()=>{const titles={'shoes':'Shoes','hoodies-sweaters':'Hoodies','t-shirts':'T-Shirts','jackets':'Jackets','pants-shorts':'Pants & Shorts','accessories':'Accessories','headwear':'Headwear','electronics':'Electronics','ShortSets':'Short Sets','jersey':'Jersey','other-stuff':'Other Finds'};const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));try{if(!document.querySelector('#catalog')&&document.querySelector('#featured .product-card'))return;let data=await fetch('/data/products.json').then(r=>{if(!r.ok)throw Error();return r.json()});const money=p=>Number.isFinite(+p.price)&&+p.price>0?`<span class="money" data-cny="${Number(p.price)}" data-usd="${(Number(p.price)/7.26).toFixed(6)}">¥${Number(p.price).toFixed(2)} CNY</span>`:'Price unavailable';const card=p=>`<a class="product-card" href="/products/${encodeURIComponent(p.id)}/"><div class="product-image"><img loading="lazy" src="${esc(p.image)}" alt="${esc(p.name)}"><span class="card-arrow">↗</span></div><div class="card-meta"><span data-home-category="${esc(p.category)}">${esc(titles[p.category]||p.category)}</span><span>FINDS / ${esc(p.id)}</span></div><h3 data-product-title="${esc(p.id)}">${esc(p.name)}</h3><div class="card-price">${money(p)}</div><small class="price-caption" data-home-i18n="reference_price">Reference · excludes shipping</small><p data-home-i18n="details">View details</p></a>`;let feature=document.querySelector('#featured');if(feature){const groups=['shoes','hoodies-sweaters','t-shirts','jackets','pants-shorts','accessories','headwear','electronics','jersey','ShortSets','other-stuff'];const pick=groups.map(c=>data.filter(p=>p.category===c&&p.image)[3]).filter(Boolean);const seen=new Set(pick.map(p=>p.id));for(const p of data.slice(8)){if(pick.length>=12)break;if(p.image&&!seen.has(p.id)){pick.push(p);seen.add(p.id)}}feature.innerHTML=pick.map(card).join('')}const catalog=document.querySelector('#catalog');
if(catalog){
 const initial=new URLSearchParams(location.search);
 for(const name of ['q','category','min','max','sort','photos']){const el=document.querySelector('[name="'+name+'"]');if(el&&initial.has(name))el.value=initial.get(name);}
 let imageIds=[];try{imageIds=JSON.parse(sessionStorage.getItem('litbuyImageResults')||'[]');if(!Array.isArray(imageIds))imageIds=[];}catch{}
 const imageOrder=new Map(imageIds.map((id,i)=>[String(id),i]));
 const [gallery,purchase]=await Promise.all(['/data/galleries.json','/data/purchase-galleries.json'].map(url=>fetch(url).then(r=>r.ok?r.json():{}).catch(()=>({}))));
 let translatedTitles={},translatedCategories={};
 async function dictionaries(){const lang=localStorage.getItem('litbuyLang')||'en';if(lang==='en'){translatedTitles={};translatedCategories={};return;}const [rows,home]=await Promise.all([fetch('/data/titles/'+encodeURIComponent(lang)+'.json').then(r=>r.ok?r.json():{}).catch(()=>({})),fetch('/data/home-ui.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{}).catch(()=>({}))]);translatedTitles=rows;translatedCategories=home[lang]?.categoryNames||{};}
 await dictionaries();
 const form=document.querySelector('#catalog-form'),controls=document.querySelector('#catalog-controls');
 function render(page=1){
  const params=new URLSearchParams(location.search),q=document.querySelector('#query').value.trim().toLowerCase(),cat=document.querySelector('[name="category"]').value;
  const minText=document.querySelector('[name="min"]').value,maxText=document.querySelector('[name="max"]').value;
  const min=minText===''?0:Number(minText),max=maxText===''?Infinity:Number(maxText);
  const sort=document.querySelector('[name="sort"]').value,photos=document.querySelector('[name="photos"]').value;
  const invalid=!Number.isFinite(min)||min<0||Number.isNaN(max)||max<0||max<min;
  const error=document.querySelector('#filter-error');error.textContent=invalid?'Enter a valid CNY range with maximum greater than or equal to minimum.':'';
  let found=invalid?[]:data.filter(p=>(!cat||p.category===cat)&&(!q||[p.name,translatedTitles[p.id],p.category,titles[p.category],translatedCategories[p.category],p.id,p.weidianId].join(' ').toLowerCase().includes(q))&&Number(p.price)>=min&&Number(p.price)<=max&&(photos!=='gallery'||(gallery[p.id]||[]).length>0)&&(photos!=='seller'||(purchase[p.weidianId]||[]).length>0)&&(photos!=='qc'));
  if(params.get('image')==='1')found=found.filter(p=>imageOrder.has(String(p.id)));
  if(sort==='price-asc')found.sort((a,b)=>Number(a.price)-Number(b.price));
  else if(sort==='price-desc')found.sort((a,b)=>Number(b.price)-Number(a.price));
  else if(sort==='name')found.sort((a,b)=>(translatedTitles[a.id]||a.name).localeCompare(translatedTitles[b.id]||b.name));
  else if(sort==='id')found.sort((a,b)=>Number(b.id)-Number(a.id));
  else if(params.get('image')==='1')found.sort((a,b)=>imageOrder.get(String(a.id))-imageOrder.get(String(b.id)));
  const pages=Math.max(1,Math.ceil(found.length/24));page=Math.max(1,Math.min(pages,Math.floor(Number(page)||1)));
  for(const [name,value] of Object.entries({q,category:cat,min:minText,max:maxText,sort,photos})){if(value&&value!=='default'&&value!=='all')params.set(name,value);else params.delete(name);}
  if(page>1)params.set('page',String(page));else params.delete('page');
  const query=params.toString();history.replaceState(null,'','/products/'+(query?'?'+query:''));
  document.querySelector('#result-count').textContent=found.length+' '+(window.litbuyHomeText?.('result_products','products')||'products');
  const note=document.querySelector('#search-notice');note.textContent=params.get('image')==='1'?(imageIds.length?'Image similarity results. Filters and sort apply to these matches.':'No image results in this browser session. Choose an image again.'):photos==='qc'?'No independently verified warehouse QC is available in this catalog. Listing photos remain available.':'';
  catalog.innerHTML=found.length?found.slice((page-1)*24,page*24).map(card).join(''):'<p class="empty-results">'+(window.litbuyHomeText?.('no_results','No products match these filters. Try another search or clear filters.')||'No products match these filters. Try another search or clear filters.')+'</p>';
  const nav=document.querySelector('#catalog-pagination');nav.innerHTML='';
  if(pages>1){const pageUrl=n=>{const next=new URLSearchParams(params);next.set('page',n);return '/products/?'+next.toString();};nav.innerHTML=(page>1?`<a href="${esc(pageUrl(page-1))}">Previous</a>`:'')+`<span>Page ${page} / ${pages}</span>`+(page<pages?`<a href="${esc(pageUrl(page+1))}">Next</a>`:'');}
 }
 form.addEventListener('submit',e=>{e.preventDefault();render(1);});
 controls.addEventListener('change',()=>render(1));
 document.querySelector('#clear-filters').addEventListener('click',()=>{form.reset();controls.querySelectorAll('input').forEach(el=>el.value='');controls.querySelectorAll('select').forEach(el=>el.selectedIndex=0);const url=new URL(location.href);url.search='';history.replaceState(null,'',url);render(1);});
 window.addEventListener('litbuy:languagechange',async()=>{await dictionaries();render(new URLSearchParams(location.search).get('page')||1);});
 render(initial.get('page')||1);
}
}catch(e){for(const id of ['featured','catalog']){const el=document.getElementById(id);if(el)el.textContent='Products are temporarily unavailable. Please try again later.'}}})();
// Page illustrations and platform logos are searchable alongside product photos.
(()=>{if(new URL(location.href).searchParams.get('image')!=='1')return;let pages;try{pages=JSON.parse(sessionStorage.getItem('litbuyImagePageResults')||'[]');}catch{return;}if(!pages.length)return;const section=document.createElement('section');section.className='image-page-matches';const h=document.createElement('h2');h.textContent='Pages and guides matching your image';section.append(h);const grid=document.createElement('div');grid.className='page-match-grid';for(const p of pages){if(!p.href?.startsWith('/')||p.href.startsWith('//')||!p.image?.startsWith('/')||p.image.startsWith('//'))continue;const a=document.createElement('a');a.href=p.href;const image=document.createElement('img');image.src=p.image;image.alt=p.title;image.loading='lazy';const span=document.createElement('span');span.textContent=p.title;a.append(image,span);grid.append(a);}section.append(grid);document.querySelector('#catalog')?.insertAdjacentElement('beforebegin',section);})();
