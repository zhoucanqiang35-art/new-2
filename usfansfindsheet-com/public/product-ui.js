function gallerySelect(button){const img=document.getElementById('product-main-image');if(!img||!button)return;img.src=button.dataset.gallerySrc;document.querySelectorAll('[data-gallery-src]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));button.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});}
function openPhoto(src){let modal=document.getElementById('photo-lightbox');if(!modal){modal=document.createElement('dialog');modal.id='photo-lightbox';const close=document.createElement('button');close.textContent='Close ×';close.setAttribute('aria-label','Close photo');close.onclick=()=>modal.close();const img=document.createElement('img');img.alt='Expanded product or QC photo';modal.append(close,img);modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});document.body.append(modal);}modal.querySelector('img').src=src;modal.showModal();}
document.addEventListener('click',async event=>{const thumb=event.target.closest('[data-gallery-src]');if(thumb)gallerySelect(thumb);const arrow=event.target.closest('[data-gallery-step]');if(arrow){const buttons=[...document.querySelectorAll('[data-gallery-src]')];const index=buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true');gallerySelect(buttons[(index+Number(arrow.dataset.galleryStep)+buttons.length)%buttons.length]);}const preview=event.target.closest('[data-preview-src]');if(preview)openPhoto(preview.dataset.previewSrc);if(event.target.id==='product-main-image')openPhoto(event.target.src);const copy=event.target.closest('[data-copy-link]');if(copy){const note=document.getElementById('copy-feedback');try{await navigator.clipboard.writeText(copy.dataset.copyLink);copy.textContent='Link copied ✓';note.textContent='Product link copied to clipboard.';}catch{note.textContent='Copy this product link: '+copy.dataset.copyLink;}}});

const skuData = document.getElementById('product-skus');
if (skuData) {
 const skus = JSON.parse(skuData.textContent);
 document.querySelectorAll('[data-variant-value]').forEach(button => {
  button.addEventListener('click', () => {
   const group = button.closest('.variant-group');
   group.querySelectorAll('button').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
   if (button.dataset.variantImage) document.getElementById('product-main-image').src = button.dataset.variantImage;
   const selected = [...document.querySelectorAll('[data-variant-value][aria-pressed="true"]')].map(option => option.dataset.variantValue);
   const matches = skus.filter(sku => selected.every(value => sku.valueIds?.includes(value)) && sku.stock !== 0);
   const prices = matches.map(sku => Number(sku.convertedDiscountPrice) > 0 ? Number(sku.convertedDiscountPrice) : Number(sku.convertedPrice)).filter(price => price > 0);
   const price = document.querySelector('.detail-price [data-price-usd]');
   if (price && prices.length) { price.dataset.priceUsd = String(Math.min(...prices)); price.dataset.priceFrom = String(new Set(prices).size > 1); price.textContent = (new Set(prices).size > 1 ? 'From ' : '') + '$' + Math.min(...prices).toFixed(2) + ' USD'; }
   document.querySelectorAll('.variant-group').forEach(other => {
    const otherSelections = selected.filter(value => !value.startsWith(other.dataset.property + ':'));
    other.querySelectorAll('[data-variant-value]').forEach(option => { option.disabled = !skus.some(sku => sku.stock !== 0 && sku.valueIds?.includes(option.dataset.variantValue) && otherSelections.every(value => sku.valueIds?.includes(value))); });
   });
   document.querySelector('.variant-status').textContent = matches.length ? 'Selected options previewed. Confirm this style and size on USFans before buying.' : 'This combination is currently unavailable. Choose another option.';
  });
 });
}
