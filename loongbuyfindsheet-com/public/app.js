const $ = s => document.querySelector(s);
const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const buy = id => 'https://loongbuy.com/product-details?' + new URLSearchParams({url:'https://weidian.com/item.html?itemID='+id});
const titles = {'shoes':'Shoes & sneakers','hoodies-sweaters':'Hoodies','t-shirts':'T-shirts','jackets':'Jackets','pants-shorts':'Pants & shorts','accessories':'Accessories','headwear':'Headwear','electronics':'Electronics','ShortSets':'Short sets','jersey':'Jerseys','other-stuff':'Other finds'};
let cached, currency, imageIndex, qcSnapshot;
async function json(url) {const r = await fetch(url); if (!r.ok) throw Error('Could not load '+url+'. Please try again.'); return r.json();}
const data = () => cached ??= json('/catalog.json').then(a => a.filter(p => /^\d+$/.test(p.weidianId)));
const getCurrency = () => currency ??= json('/currency.json');
let cnyPerUsd = 6.6642;
const usd = value => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(Number(value)/cnyPerUsd);
let category='', query='', page=1, imageIds=null;
const localizedName = product => window.siteI18n?.productName(product.id, product.name) ?? product.name;
const searchKey = text => text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
document.addEventListener('site-language-changed', () => {
 if (query) render();
});
const perPage=24, grid=$('#products'), imagePage=!!$('#image-results');
const productHref = id => window.loongbuyPilotPaths?.[id] || '/product/?id=' + encodeURIComponent(id);
const card = (p,i,match) => `<article class="product-card"><a class="product-picture" href="${productHref(p.id)}"><img loading="lazy" src="${escapeHTML(match?.url || p.image)}" alt="${escapeHTML(p.name)}" ${match ? `data-image-fallback="${escapeHTML(p.image)}"` : ''}/><span class="product-number">${String(i+1).padStart(2,'0')}</span><span class="product-arrow"><svg class="arrow-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a><div class="card-meta"><span>${escapeHTML(titles[p.category]||p.category)}</span><span>${match?.kind === 'qc' ? 'QC photos' : 'WEIDIAN'}</span></div><a class="product-name" data-product-title data-product-id="${escapeHTML(p.id)}" dir="auto" href="${productHref(p.id)}">${escapeHTML(p.name)}</a><div class="card-bottom"><strong>${usd(p.price)}</strong><a href="${escapeHTML(buy(p.weidianId))}" target="_blank" rel="noopener">Buy on LoongBuy <svg class="arrow-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div>${match ? `<a class="matched-image-link" href="${escapeHTML(match.url)}" target="_blank" rel="noopener noreferrer">View matched image ↗</a>` : ''}</article>`;
async function render() {
 if (!grid || (imagePage && !imageIds)) return;
 try {
  const [products,rate] = await Promise.all([data(),getCurrency()]); cnyPerUsd=rate.cnyPerUsd;
  const keyword = searchKey(query.trim());
  let rows = products.filter(product => {
   if (category && product.category !== category) return false;
   if (!keyword) return true;
   const categoryName = titles[product.category] || '';
   const translatedCategory = window.siteI18n?.translate(categoryName) ?? categoryName;
   const searchable = [product.name, localizedName(product), product.weidianId, product.id, categoryName, translatedCategory];
   return searchable.some(value => searchKey(value).includes(keyword));
  });
  const sort=$('#sort')?.value;
  if (imageIds) {
   const byId = new Map(rows.map(product => [product.id, product]));
   rows = imageIds.map(id => byId.get(id) ?? imagePages.get(id)).filter(Boolean);
  }
  else if(sort==='low')rows.sort((a,b)=>+a.price-+b.price);
  else if(sort==='high')rows.sort((a,b)=>+b.price-+a.price);
  else if(sort==='newest')rows.sort((a,b)=>+b.id-+a.id);
  const pages=Math.max(1,Math.ceil(rows.length/perPage));page=Math.max(1,Math.min(page,pages));
  grid.innerHTML=rows.length?rows.slice((page-1)*perPage,page*perPage).map((p,i)=>imagePage?imageResultCard(p,(page-1)*perPage+i):card(p,(page-1)*perPage+i)).join(''):'<p>No matching products. Try a different name, category or item ID.</p>';
  grid.scrollLeft = 0;
  $('#results-label').textContent=`${rows.length.toLocaleString()} ${imageIds?'visually ranked finds':rows.length===1?'find':'finds'}${category?' / '+(titles[category]||category):''}`;
  $('#pagination').innerHTML=`<button class="outline" data-page="${page-1}" ${page===1?'disabled':''}>← Previous</button><span>${page} / ${pages}</span><button class="outline" data-page="${page+1}" ${page===pages?'disabled':''}>Next →</button>`;
  document.querySelectorAll('[data-cat]').forEach(b=>{b.classList.toggle('active',b.dataset.cat===category);b.setAttribute('aria-pressed',String(b.dataset.cat===category));});
 } catch {$('#results-label').textContent='Catalog temporarily unavailable. Please try again.';}
}
if(grid) {
 grid.addEventListener('error', event => {
  const image = event.target;
  if (image instanceof HTMLImageElement && image.dataset.imageFallback) {
   const fallback = image.dataset.imageFallback;
   delete image.dataset.imageFallback;
   image.src = fallback;
  }
 }, true);
 $('#hero-search')?.addEventListener('submit',e=>{e.preventDefault();query=new FormData(e.target).get('q').trim();imageIds=null;category='';page=1;$('#catalog-query').value=query;$('.catalog-query').hidden=false;render();$('#spreadsheet').scrollIntoView();});
 document.querySelectorAll('[data-cat],[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.cat??b.dataset.category;imageIds=null;page=1;render();}));
 $('#browse-all')?.addEventListener('click',()=>{page=1;render();});
 $('#sort')?.addEventListener('change',()=>{imageIds=null;page=1;render();});
 $('#search-toggle')?.addEventListener('click',()=>{$('.catalog-query').hidden=!$('.catalog-query').hidden;if(!$('.catalog-query').hidden)$('#catalog-query').focus();});
 let timeout;
 $('#catalog-query')?.addEventListener('input',e=>{query=e.target.value;imageIds=null;page=1;clearTimeout(timeout);timeout=setTimeout(render,180);});
 $('#clear-search')?.addEventListener('click',()=>{query='';imageIds=null;$('#catalog-query').value='';page=1;render();});
 $('#pagination')?.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b){page=+b.dataset.page;render();$(imagePage?'#image-results':'#spreadsheet').scrollIntoView();}});
 if (location.pathname === '/spreadsheet/') render();
 const initialQuery = new URLSearchParams(location.search).get('q')?.trim();
 if (!imagePage && initialQuery) {
  query = initialQuery;
  $('#catalog-query').value = initialQuery;
  $('.catalog-query').hidden = false;
  render();
 }
 $('#qc-search')?.addEventListener('submit',async e=>{e.preventDefault();const value=e.target.querySelector('input').value.trim();query=value.match(/itemID=(\d+)/i)?.[1]||value;category='';imageIds=null;page=1;$('#catalog-query').value=query;await render();$('#spreadsheet').scrollIntoView();});
}
let imageRequest = 0;
let previewUrl;
const imageMatches = new Map();
const imagePages = new Map();
const imageShards = new Map();

function loadImageIndex() {
 imageIndex ??= json('/search-index.json?v=separate-purchase-qc-v1').catch(error => {
  imageIndex = null;
  throw error;
 });
 return imageIndex;
}

function readImageShard(url) {
 if (!imageShards.has(url)) {
  imageShards.set(url, json(url).catch(error => {
   imageShards.delete(url);
   throw error;
  }));
 }
 return imageShards.get(url);
}

function imageDescriptor(bitmap) {
 const canvas = document.createElement('canvas');
 canvas.width = canvas.height = 64;
 const ctx = canvas.getContext('2d', { willReadFrequently: true });
 ctx.fillStyle = '#fff';
 ctx.fillRect(0, 0, 64, 64);
 const scale = 64 / Math.max(bitmap.width, bitmap.height);
 const width = bitmap.width * scale;
 const height = bitmap.height * scale;
 ctx.drawImage(bitmap, (64 - width) / 2, (64 - height) / 2, width, height);
 const small = document.createElement('canvas');
 small.width = small.height = 8;
 const pixels = small.getContext('2d', { willReadFrequently: true });
 pixels.drawImage(canvas, 0, 0, 8, 8);
 const tone = pixels.getImageData(0, 0, 8, 8).data;
 const out = new Uint8Array(112);
 for (let i = 0; i < 64; i++) {
  const k = i * 4;
  out[i] = Math.round(.299 * tone[k] + .587 * tone[k + 1] + .114 * tone[k + 2]);
 }
 small.width = small.height = 4;
 pixels.drawImage(canvas, 0, 0, 4, 4);
 const color = pixels.getImageData(0, 0, 4, 4).data;
 for (let i = 0; i < 48; i++) out[64 + i] = color[Math.floor(i / 3) * 4 + i % 3];
 return out;
}

function imageDistance(reference, encoded) {
 const packed = atob(encoded);
 let bits = 0, position = 0, gray = 0, color = 0, accumulator = 0;
 for (let i = 0; i < packed.length; i++) {
  accumulator = (accumulator << 8) | packed.charCodeAt(i);
  bits += 8;
  while (bits >= 6) {
   bits -= 6;
   const delta = Math.abs(reference[position] - (((accumulator >> bits) & 63) * 4 + 2));
   if (position < 64) gray += delta;
   else color += delta;
   position++;
  }
 }
 return position === reference.length ? gray / 64 * .55 + color / 48 * .45 : Infinity;
}

function updateCoverage(compared, total) {
 $('#image-compared').textContent = compared.toLocaleString();
 $('#image-total').textContent = total.toLocaleString();
 $('#image-coverage').hidden = false;
}

function imageResultCard(p, i) {
 if (!p.kind) return card(p, i, imageMatches.get(p.id));
 const match = imageMatches.get(p.id);
 return `<article class="product-card">
  <a class="product-picture" href="${escapeHTML(p.href)}"><img loading="lazy" src="${escapeHTML(p.image)}" alt=""/></a>
  <a class="product-name" href="${escapeHTML(p.href)}">${escapeHTML(p.title)}</a>
  <div class="card-bottom"><a href="${escapeHTML(match.url)}" target="_blank" rel="noopener noreferrer">View matched image ↗</a></div>
 </article>`;
}

async function searchImages(event) {
 const input = event.target;
 const file = input.files[0];
 if (!file) return;
 const request = ++imageRequest;
 const status = $('#image-status');
 const reset = $('#reset-image');
 status.textContent = 'Loading the full site image index…';
 input.disabled = true;
 reset.hidden = false;
 try {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) {
   throw Error('Choose a JPG, PNG or WebP image under 15 MB.');
  }
  const bitmap = await createImageBitmap(file);
  const reference = imageDescriptor(bitmap);
  bitmap.close();
  if (request !== imageRequest) return;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  const preview = $('#upload-preview');
  preview.src = previewUrl;
  preview.hidden = false;

  const manifest = await loadImageIndex();
  if (request !== imageRequest) return;
  const ranked = new Map();
  let compared = 0;
  updateCoverage(compared, manifest.count);
  for (let offset = 0; offset < manifest.shards.length; offset += 4) {
   const wave = await Promise.all(manifest.shards.slice(offset, offset + 4).map(async shard => {
    const entries = await readImageShard(shard.url);
    if (entries.length !== shard.count) throw Error('Some indexed photos could not be loaded. Please try again.');
    return entries;
   }));
   if (request !== imageRequest) return;
   status.textContent = 'Comparing indexed site images…';
   for (const entries of wave) {
    for (const [ids, vector, url, kind] of entries) {
     const score = imageDistance(reference, vector);
     if (!Number.isFinite(score)) throw Error('Some indexed photos could not be loaded. Please try again.');
     for (const id of ids) {
      if (!ranked.has(id) || score < ranked.get(id).score) ranked.set(id, { score, url, kind });
     }
    }
    compared += entries.length;
   }
   updateCoverage(compared, manifest.count);
   await new Promise(resolve => setTimeout(resolve, 0));
   if (request !== imageRequest) return;
  }
  if (compared !== manifest.count || !ranked.size) throw Error('Some indexed photos could not be loaded. Please try again.');
  imageMatches.clear();
  for (const [id, match] of ranked) imageMatches.set(id, match);
  imagePages.clear();
  for (const [id, page] of Object.entries(manifest.targets)) imagePages.set(id, { id, ...page, kind: 'page' });
  imageIds = [...ranked].sort((a, b) => a[1].score - b[1].score).map(([id]) => id);
  category = '';
  query = '';
  page = 1;
  await render();
  if (request !== imageRequest) return;
  status.textContent = 'Search complete. Results are ordered by approximate visual similarity.';
  status.dataset.comparedImages = String(compared);
  $('#image-results').scrollIntoView({ behavior: 'smooth' });
 } catch (error) {
  if (request === imageRequest) status.textContent = error.message;
 } finally {
  if (request === imageRequest) input.disabled = false;
 }
}

$('#image-upload')?.addEventListener('change', searchImages);
$('#reset-image')?.addEventListener('click', () => {
 imageRequest++;
 imageIds = null;
 imageMatches.clear();
 imagePages.clear();
 const input = $('#image-upload');
 input.value = '';
 input.disabled = false;
 $('#upload-preview').hidden = true;
 $('#reset-image').hidden = true;
 $('#image-coverage').hidden = true;
 if (previewUrl) URL.revokeObjectURL(previewUrl);
 previewUrl = undefined;
 grid.replaceChildren();
 $('#pagination').replaceChildren();
 $('#results-label').textContent = 'Your results will appear here';
 $('#image-status').textContent = 'Choose an image to start searching.';
 delete $('#image-status').dataset.comparedImages;
});

const galleryMarkup = product => {
 const id = escapeHTML(product.id);
 const name = escapeHTML(product.name);
 const image = escapeHTML(product.image);
 return `<section class="product-gallery" aria-label="Product listing photos">
  <div class="photo-stage" id="photo-stage" aria-label="Product listing photos" role="group" dir="ltr">
   <a class="photo-open" href="${image}" target="_blank" rel="noopener">
    <img id="active-photo" src="${image}" alt="${name}" data-product-photo="${id}" data-product-name="${name}" referrerpolicy="no-referrer" draggable="false"/>
   </a>
   <button type="button" class="photo-arrow photo-prev" aria-label="Previous photo" hidden>‹</button>
   <button type="button" class="photo-arrow photo-next" aria-label="Next photo" hidden>›</button>
   <span id="photo-count" class="photo-count" aria-live="polite" hidden></span>
  </div>
  <div id="photo-thumbnails" class="photo-thumbnails" dir="ltr" hidden></div>
  <p class="data-note">These are product photos, not verified QC photos.</p>
 </section>`;
};

function qcMarkup(product) {
 const source = 'https://findspreadsheet.com' + product.sourcePath;
 return `<section class="product-qc" aria-labelledby="product-qc-title">
  <h2 id="product-qc-title">Detail photos</h2>
  <p id="product-qc-status" role="status">Checking QC photos…</p>
  <p id="product-qc-fallback" class="data-note" hidden>Showing product listing photos for reference.</p>
  <div id="product-qc-photos" class="qc-photo-grid" hidden></div>
  <div id="product-qc-pagination" class="qc-photo-pagination" hidden>
   <button type="button" class="outline" id="qc-prev">← Previous</button>
   <span id="qc-page-count" aria-live="polite"></span>
   <button type="button" class="outline" id="qc-next">Next →</button>
  </div>
  <div class="qc-photo-links">
   <a href="${escapeHTML(source)}" target="_blank" rel="noopener noreferrer">Check QC on FindSpreadsheet ↗</a>
   <a href="/articles/loongbuy-qc-photos/">Read the QC photo guide ↗</a>
  </div>
 </section>`;
}

async function loadProductQC(itemId, gallery) {
 const status = $('#product-qc-status');
 const grid = $('#product-qc-photos');
 const notes = {
  ready: 'Warehouse inspection photos from FindSpreadsheet.',
  none: 'No QC photos are available for this item yet.',
  pending: 'QC photos are still being checked for this item.',
  unavailable: 'QC photos could not be checked. Please try again later.',
 };
 grid.hidden = true;
 let data;
 try {
  qcSnapshot ??= json('/qc-snapshot.json?v=separate-purchase-qc-v1').catch(() => ({}));
  const snapshot = await qcSnapshot;
  const saved = snapshot[itemId];
  data = saved?.length
   ? { status: 'ready', photos: saved, lastChecked: true }
   : await json('/api/qc?item=' + encodeURIComponent(itemId));
 } catch {
  data = { status: 'unavailable' };
 }
 const measurements = data.photos?.length && data.photos.every(photo => photo.measurement);
 const note = measurements
  ? 'Measurement photos from FindSpreadsheet.'
  : notes[data.status] || notes.unavailable;
 status.textContent = data.lastChecked && !measurements ? 'Last available check · ' + note : note;
 if (data.status === 'ready' && data.photos?.length) {
  mountQCGallery(grid, data.photos);
  return;
 }
 const photos = await gallery;
 if (photos.length) {
  $('#product-qc-fallback').hidden = false;
  mountQCGallery(grid, photos.map(url => ({ url })), true);
 }
}

function mountQCGallery(grid, photos, listingFallback = false) {
 const pageSize = 24;
 const totalPages = Math.ceil(photos.length / pageSize);
 const pager = $('#product-qc-pagination');
 const previous = $('#qc-prev');
 const next = $('#qc-next');
 const count = $('#qc-page-count');
 let current = 1;

 function renderPage() {
  const offset = (current - 1) * pageSize;
  grid.innerHTML = photos.slice(offset, offset + pageSize).map(({ url, label, source }, index) => `<a href="${escapeHTML(url)}"
   target="_blank" rel="noopener noreferrer" class="qc-photo-card"
   aria-label="${listingFallback ? 'Photo' : 'QC photo'} ${offset + index + 1}">
    <img src="${escapeHTML(listingFallback ? listingThumbnail(url) : url)}" alt="" loading="lazy" referrerpolicy="no-referrer"/>
    ${source || label ? `<span data-i18n-ignore>${escapeHTML([source, label].filter(Boolean).join(' · '))}</span>` : ''}
  </a>`).join('');
  grid.scrollLeft = 0;
  count.textContent = `${current} / ${totalPages}`;
  previous.disabled = current === 1;
  next.disabled = current === totalPages;
 }

 function goToPage(page) {
  if (page < 1 || page > totalPages) return;
  current = page;
  renderPage();
  $('#product-qc-title').scrollIntoView({ block: 'start' });
 }

 previous.addEventListener('click', () => goToPage(current - 1));
 next.addEventListener('click', () => goToPage(current + 1));
 grid.hidden = false;
 pager.hidden = totalPages < 2;
 renderPage();
}

function listingPhotos(product, extraPhotos = []) {
 const candidates = product.purchaseGallery && extraPhotos.length ? extraPhotos : [product.image, ...extraPhotos];
 return [...new Set(candidates.filter(url => {
  try { return new URL(url).protocol === 'https:'; } catch { return false; }
 }))];
}

function listingThumbnail(url) {
 const thumbnail = new URL(url);
 if (thumbnail.hostname.endsWith('.geilicdn.com') && !thumbnail.search) {
  thumbnail.searchParams.set('w', '200');
 }
 return thumbnail.href;
}

function mountPhotoCarousel(photos) {
 if (!photos.length) return;

 const stage = $('#photo-stage');
 const image = $('#active-photo');
 const open = stage.querySelector('.photo-open');
 const previous = stage.querySelector('.photo-prev');
 const next = stage.querySelector('.photo-next');
 const counter = $('#photo-count');
 const thumbnails = $('#photo-thumbnails');
 let index = 0;
 let start;
 let swipeAt = -Infinity;
 const controller = { showExternal(url) { image.src=open.href=url; counter.textContent='Selected style'; buttons.forEach(button=>button.setAttribute('aria-pressed','false')); } };

 thumbnails.innerHTML = photos.map((url, number) => `<button type="button" class="photo-thumbnail"
   aria-label="Photo ${number + 1}" aria-pressed="false" data-photo-index="${number}">
   <img src="${escapeHTML(listingThumbnail(url))}" loading="lazy" alt="" referrerpolicy="no-referrer" draggable="false"/>
  </button>`).join('');
 const buttons = [...thumbnails.querySelectorAll('button')];

 function show(position, keepVisible = true) {
  index = (position + photos.length) % photos.length;
  image.src = open.href = photos[index];
  counter.textContent = `${index + 1} / ${photos.length}`;
  buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  if (keepVisible) {
   const active = buttons[index];
   const left = active.offsetLeft;
   const right = left + active.offsetWidth;
   if(active.offsetTop < thumbnails.scrollTop) thumbnails.scrollTop=active.offsetTop;
   if(active.offsetTop+active.offsetHeight > thumbnails.scrollTop+thumbnails.clientHeight) thumbnails.scrollTop=active.offsetTop+active.offsetHeight-thumbnails.clientHeight;
  }
 }

 counter.hidden = thumbnails.hidden = false;
 show(0, false);
 if (photos.length === 1) return controller;

 previous.addEventListener('click', () => show(index - 1));
 next.addEventListener('click', () => show(index + 1));
 stage.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  show(index + (event.key === 'ArrowLeft' ? -1 : 1));
 });
 thumbnails.addEventListener('click', event => {
  const button = event.target.closest('[data-photo-index]');
  if (button) show(Number(button.dataset.photoIndex));
 });
 stage.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' && event.target === image) start = [event.clientX, event.clientY];
 });
 stage.addEventListener('pointercancel', () => { start = undefined; });
 stage.addEventListener('pointerup', event => {
  if (!start) return;
  const dx = event.clientX - start[0];
  const dy = event.clientY - start[1];
  start = undefined;
  if (Math.abs(dx) < 35 || Math.abs(dx) < Math.abs(dy)) return;
  swipeAt = performance.now();
  show(index + (dx < 0 ? 1 : -1));
 });
 open.addEventListener('click', event => {
  if (performance.now() - swipeAt < 400) event.preventDefault();
 });

 previous.hidden = next.hidden = false;
 return controller;
}

function relatedProducts(product, products) {
 const terms = name => new Set(name.toLowerCase().match(/[a-z]{3,}/g) || []);
 const nameTerms = terms(product.name);
 const rank = products
  .filter(candidate => candidate.category === product.category && candidate.weidianId !== product.weidianId)
  .map(candidate => ({
   candidate,
   keywords: [...terms(candidate.name)].filter(term => nameTerms.has(term)).length,
   priceDifference: Math.abs(Number(product.price) - Number(candidate.price)),
  }))
  .sort((a, b) => b.keywords - a.keywords || a.priceDifference - b.priceDifference);
 const seenIds = new Set([product.weidianId]);
 const seenImages = new Set([product.image]);
 const matches = [];
 for (const { candidate } of rank) {
  if (seenIds.has(candidate.weidianId) || seenImages.has(candidate.image)) continue;
  matches.push(candidate);
  seenIds.add(candidate.weidianId);
  seenImages.add(candidate.image);
  if (matches.length === 8) break;
 }
 return matches;
}

(async()=>{
 const root=$('#product-detail');if(!root)return;
 try {
  const [products,rate]=await Promise.all([data(),getCurrency()]);cnyPerUsd=rate.cnyPerUsd;
  const id = root.dataset.productId || new URLSearchParams(location.search).get('id');
  const p = products.find(x => x.id === id);
  if (!p && root.dataset.productId) return;
  if(!p){root.innerHTML='<div class="section"><h1>Product not found</h1><a href="/#spreadsheet">Back to the spreadsheet →</a></div>';return;}
  document.title=p.name+' | LoongBuy Findsheet';
  root.innerHTML=`<div class="detail-layout"><div class="product-media">${galleryMarkup(p)}</div><div class="detail-info"><p class="eyebrow">${escapeHTML(titles[p.category]||p.category)}</p><h1 data-product-title data-product-id="${escapeHTML(p.id)}" dir="auto">${escapeHTML(p.name)}</h1><p>Product ID ${escapeHTML(p.weidianId)}</p><p class="detail-price" id="detail-price">${usd(p.price)} USD</p><div class="detail-links"><a class="button" target="_blank" rel="noopener" href="${escapeHTML(buy(p.weidianId))}">Buy on LoongBuy</a><button class="outline" id="other-platforms">Other purchasing platforms</button><button class="outline" id="copy-product">Copy product link</button></div><section id="product-variants" aria-label="Product options"><p id="variant-status" role="status">Loading styles and sizes…</p><div id="variant-groups"></div></section><p class="data-note">Choose options here to preview this product. Confirm your final selection, price and availability on LoongBuy.</p><p class="data-note">Reference conversion · 1 USD = ${rate.cnyPerUsd} CNY · ${escapeHTML(rate.asOf)}.</p></div>${qcMarkup(p)}</div><dialog id="platform-dialog" aria-labelledby="platform-title"><button class="dialog-close" aria-label="Close platform selector">×</button><h2 id="platform-title">Other purchasing platforms</h2><div class="platform-list" id="platform-list"></div><p class="data-note">Open the same item with your preferred agent. Links may include referral parameters.</p></dialog>`;
  $('#copy-product').addEventListener('click',async()=>{
   const button=$('#copy-product');
   const original='https://weidian.com/item.html?itemID='+p.weidianId;
   try { await navigator.clipboard.writeText(original); button.textContent='Link copied'; }
   catch { button.textContent='Copy this link'; let input=$('#copy-product-fallback'); if(!input){input=document.createElement('input');input.id='copy-product-fallback';input.readOnly=true;input.setAttribute('aria-label','Product link');button.after(input);}input.value=original;input.select(); }
  });
  const dialog=$('#platform-dialog');
  $('#other-platforms').addEventListener('click',async()=>{
   dialog.showModal();$('#platform-list').textContent='Loading platforms…';
   try{const platforms=await json('/platforms.json');$('#platform-list').innerHTML=platforms.map(a=>`<a href="${escapeHTML(a.url.replaceAll('{productId}',p.weidianId))}" target="_blank" rel="nofollow noopener noreferrer"><img src="${escapeHTML(a.image)}" alt="" loading="lazy"/><span>${escapeHTML(a.name)}</span></a>`).join('');}
   catch{$('#platform-list').innerHTML=`<a href="https://findspreadsheet.com${escapeHTML(p.sourcePath)}" target="_blank" rel="noopener">Open platforms on FindSpreadsheet ↗</a>`;}
  });
  $('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  const skuData = fetchProductOptions(p.weidianId);
  skuData.catch(()=>{});
  const gallery = json('/galleries.json?v=separate-purchase-qc-v1').catch(() => ({}))
   .then(async galleries => {
    const sku=await skuData.catch(()=>null);
    const purchasePhotos=sku?.images?.map(safeProductPhoto).filter(Boolean);
    return purchasePhotos?.length ? [...new Set(purchasePhotos)] : listingPhotos(p,galleries[p.id]);
   });
  void loadProductQC(p.weidianId, gallery);
  const carouselReady = gallery.then(photos => mountPhotoCarousel(photos));
  void loadProductVariants(p, carouselReady, skuData);
  await carouselReady;
 }catch{if (root.dataset.productId) return;root.innerHTML='<p class="section">Product data is temporarily unavailable. Please try again.</p>';}
})();

function safeProductPhoto(value) {
 try { const url=new URL(value); return url.protocol==='https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
async function fetchProductOptions(item) {
 const endpoints=[
  'https://findspreadsheet.com/api/Goods/getSkuData?weidian_id='+encodeURIComponent(item),
  '/api/sku?item='+encodeURIComponent(item)
 ];
 for(const endpoint of endpoints) {
  try {
   const response=await fetch(endpoint,{signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error('Options unavailable');
   const data=await response.json();
   if(String(data.weidian_id??data.item)!==String(item)||!Array.isArray(data.specifications?.attrs))throw Error('Invalid options');
   return data;
  }catch{}
 }
 throw Error('Options unavailable');
}
async function loadProductVariants(product, carouselReady, skuData) {
 const status=$('#variant-status');
 try {
  const data=await skuData;
  const attrs=data.specifications?.attrs?.filter(attr=>Array.isArray(attr.attr_values)&&attr.attr_values.length);
  if(!attrs?.length) {status.textContent='No style or size options are listed. Check availability on LoongBuy.';return;}
  const groups=$('#variant-groups');
  const selected=new Map();
  const skus=Object.values(data.specifications.skus || {}).filter(sku=>typeof sku.attr_ids==='string');
  const skuIds=sku=>String(sku.attr_ids).split('-');
  groups.innerHTML=attrs.map((attr,group)=>{
   const withImages=attr.attr_values.some(value=>safeProductPhoto(value.img||value.image));
   const label=withImages?'Style':(/size|尺码|尺寸/i.test(attr.attr_title)?'Size':attr.attr_title||'Options');
   return `<div class="variant-group"><div class="variant-heading"><h2>${escapeHTML(label)}</h2><span class="variant-selection" id="variant-selection-${group}" dir="auto"></span></div><div class="variant-options ${withImages?'':'variant-text-options'}" role="group" aria-label="${escapeHTML(label)}">${attr.attr_values.map((value,index)=>{
    const name=value.attr_value||value.name||String(index+1);
    const image=safeProductPhoto(value.img||value.image);
    return `<button type="button" class="variant-option" data-variant-group="${group}" data-variant-index="${index}" aria-pressed="false" aria-label="${escapeHTML(name)}" title="${escapeHTML(name)}">${image?`<img src="${escapeHTML(listingThumbnail(image))}" alt="${escapeHTML(name)}" loading="lazy" referrerpolicy="no-referrer"/>`:escapeHTML(name)}</button>`;
   }).join('')}</div></div>`;
  }).join('');
  status.textContent='';
  groups.addEventListener('click',async event=>{
   const button=event.target.closest('[data-variant-group]');if(!button||button.disabled)return;
   const group=Number(button.dataset.variantGroup), value=attrs[group].attr_values[Number(button.dataset.variantIndex)];
   const id=String(value.attr_id??value.id??''); selected.set(group,id);
   $('#variant-selection-'+group).textContent=value.attr_value||value.name||'';
   groups.querySelectorAll(`[data-variant-group="${group}"]`).forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
   const photo=safeProductPhoto(value.img||value.image);
   if(photo)(await carouselReady)?.showExternal(photo);
   // Disable combinations only when the upstream provides actual inventory records.
   groups.querySelectorAll('[data-variant-group]').forEach(option=>{
    const g=Number(option.dataset.variantGroup),v=attrs[g].attr_values[Number(option.dataset.variantIndex)],optionId=String(v.attr_id??v.id??'');
    if(!skus.length||!optionId)return;
    const constraints=[...selected].filter(([key])=>key!==g).map(([,v])=>v).concat(optionId);
    const matches=skus.filter(sku=>constraints.every(id=>skuIds(sku).includes(id)));
    option.disabled=matches.length===0||matches.every(sku=>sku.stock!=null && Number(sku.stock)<=0);
   });
   if(selected.size===attrs.length){
    const match=skus.find(sku=>[...selected.values()].every(id=>skuIds(sku).includes(id)));
    if(match && Number.isFinite(Number(match.price))) $('#detail-price').textContent=usd(match.price)+' USD';
   }
  });
 } catch {
  status.innerHTML='Style and size information is temporarily unavailable. <a href="'+escapeHTML(buy(product.weidianId))+'" target="_blank" rel="noopener">View options on LoongBuy</a>.';
 }
}
