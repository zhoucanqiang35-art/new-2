function gallerySelect(button){const img=document.getElementById('product-main-image');if(!img||!button)return;img.src=button.dataset.gallerySrc;document.querySelectorAll('[data-gallery-src]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));button.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});}
function openPhoto(src){let modal=document.getElementById('photo-lightbox');if(!modal){modal=document.createElement('dialog');modal.id='photo-lightbox';const close=document.createElement('button');close.textContent='Close ×';close.setAttribute('aria-label','Close photo');close.onclick=()=>modal.close();const img=document.createElement('img');img.alt='Expanded product or QC photo';modal.append(close,img);modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});document.body.append(modal);}modal.querySelector('img').src=src;modal.showModal();}
document.addEventListener('click',async event=>{const thumb=event.target.closest('[data-gallery-src]');if(thumb)gallerySelect(thumb);const arrow=event.target.closest('[data-gallery-step]');if(arrow){const buttons=[...document.querySelectorAll('[data-gallery-src]')];const index=buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true');gallerySelect(buttons[(index+Number(arrow.dataset.galleryStep)+buttons.length)%buttons.length]);}const preview=event.target.closest('[data-preview-src]');if(preview)openPhoto(preview.dataset.previewSrc);if(event.target.id==='product-main-image')openPhoto(event.target.src);const copy=event.target.closest('[data-copy-link]');if(copy){const note=document.getElementById('copy-feedback');try{await navigator.clipboard.writeText(copy.dataset.copyLink);copy.textContent='Link copied ✓';note.textContent='Product link copied to clipboard.';}catch{note.textContent='Copy this product link: '+copy.dataset.copyLink;}}});


function bindProductOptions(root, skus) {
 root.querySelectorAll('[data-variant-value]').forEach(button => {
  button.addEventListener('click', () => {
   const group = button.closest('.variant-group');
   group.querySelectorAll('button').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
   if (button.dataset.variantImage) document.getElementById('product-main-image').src = button.dataset.variantImage;
   const selected = [...root.querySelectorAll('[data-variant-value][aria-pressed="true"]')].map(option => option.dataset.variantValue);
   const matches = skus.filter(sku => selected.every(value => sku.valueIds?.includes(value)) && sku.stock !== 0);
   const prices = matches.map(sku => Number(sku.convertedDiscountPrice) > 0 ? Number(sku.convertedDiscountPrice) : Number(sku.convertedPrice)).filter(price => price > 0);
   const price = document.querySelector('.detail-price [data-price-usd]');
   if (price && prices.length) {
    price.dataset.priceUsd = String(Math.min(...prices));
    price.dataset.priceFrom = String(new Set(prices).size > 1);
    price.textContent = (new Set(prices).size > 1 ? 'From ' : '') + '$' + Math.min(...prices).toFixed(2) + ' USD';
   }
   root.querySelectorAll('.variant-group').forEach(other => {
    const otherSelections = selected.filter(value => !value.startsWith(other.dataset.property + ':'));
    other.querySelectorAll('[data-variant-value]').forEach(option => {
     option.disabled = !skus.some(sku => sku.stock !== 0 && sku.valueIds?.includes(option.dataset.variantValue) && otherSelections.every(value => sku.valueIds?.includes(value)));
    });
   });
   root.querySelector('.variant-status').textContent = matches.length ? 'Selected options previewed. Confirm this style and size on USFans before buying.' : 'This combination is currently unavailable. Choose another option.';
  });
 });
}
const skuData = document.getElementById('product-skus');
if (skuData) bindProductOptions(document.querySelector('.product-options'), JSON.parse(skuData.textContent));

async function loadPurchaseOptions() {
 if (skuData) return;
 const purchase = document.querySelector('.product-buy[data-product-purchase]');
 const match = purchase?.href.match(/^https:\/\/(?:www\.)?usfans\.com\/product\/(\d+)\/(\d+)/);
 if (!match) return;
 const note = document.querySelector('.detail-info > .variant-status');
 if (!note) return;
 note.textContent = 'Loading available styles and sizes…';
 try {
  const response = await fetch('https://usfans.com/api/goods/info?channel=' + match[1] + '&goodsId=' + match[2], {
   headers:{Language:'en',Currency:'USD'},credentials:'omit',signal:AbortSignal.timeout(12000)
  });
  if (!response.ok) throw Error('Product options unavailable');
  const payload = await response.json();
  const data = payload.data;
  if (payload.code !== 200 || !data) throw Error('Product options unavailable');
  const properties = (data.properties || []).filter(property => property.valuesList?.length);
  if (!properties.length) throw Error('Product options unavailable');
  const root = document.createElement('div'); root.className = 'product-options';
  for (const property of properties) {
   const fieldset = document.createElement('fieldset'); fieldset.className = 'variant-group'; fieldset.dataset.property = property.propId;
   const legend = document.createElement('legend'); legend.textContent = property.propNameEn || property.propName;
   const choices = document.createElement('div'); choices.className = 'variant-values';
   for (const value of property.valuesList) {
    const button = document.createElement('button'); button.type = 'button';
    button.dataset.variantValue = property.propId + ':' + value.valueId;
    button.setAttribute('aria-pressed','false'); button.title = value.valueNameEn || value.valueName;
    if (value.picUrl && /^https:\/\//.test(value.picUrl)) {
     button.dataset.variantImage = value.picUrl;
     const image = document.createElement('img'); image.src = value.picUrl; image.alt = button.title; image.loading = 'lazy'; button.append(image);
    }
    const label = document.createElement('span'); label.textContent = button.title; button.append(label); choices.append(button);
   }
   fieldset.append(legend,choices); root.append(fieldset);
  }
  const status = document.createElement('p'); status.className = 'variant-status'; status.setAttribute('aria-live','polite');
  status.textContent = 'Select options to preview. Confirm your selection on USFans.'; root.append(status); note.replaceWith(root);
  const skus = data.skuList || [];
  const amounts = skus.filter(sku => sku.stock !== 0).map(sku => Number(sku.convertedDiscountPrice) > 0 ? Number(sku.convertedDiscountPrice) : Number(sku.convertedPrice)).filter(amount => amount > 0);
  const price = document.querySelector('.detail-price [data-price-usd]');
  if (price && amounts.length) {
   const minimum = Math.min(...amounts);
   price.dataset.priceUsd = String(minimum);
   price.dataset.priceFrom = String(Math.max(...amounts) > minimum);
   price.textContent = (Math.max(...amounts) > minimum ? 'From ' : '') + '$' + minimum.toFixed(2) + ' USD';
  }
  bindProductOptions(root,skus);
 } catch {
  note.textContent = 'Choose the available style and size on the USFans purchase page.';
 }
}
loadPurchaseOptions();
