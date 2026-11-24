(()=>{
 const thumbs=[...document.querySelectorAll('.source-thumbs button')],main=document.querySelector('#slide-image');
 let current=0;
 function show(index){if(!thumbs.length)return;current=(index+thumbs.length)%thumbs.length;main.src=thumbs[current].querySelector('img').src;thumbs.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));thumbs[current].scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'});}
 document.querySelector('.source-prev')?.addEventListener('click',()=>show(current-1));
 document.querySelector('.source-next')?.addEventListener('click',()=>show(current+1));
 thumbs.forEach((b,i)=>b.addEventListener('click',()=>show(i)));
 document.querySelectorAll('[data-preview-image]').forEach(button=>button.addEventListener('click',()=>{main.src=button.dataset.previewImage;const index=thumbs.findIndex(b=>b.querySelector('img').src===main.src);if(index>=0)current=index;document.querySelectorAll('[data-preview-image]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));thumbs.forEach(b=>b.setAttribute('aria-pressed',String(b.querySelector('img').src===main.src)));}));
 const copy=document.querySelector('#copy-weidian');
 copy?.addEventListener('click',async()=>{const status=document.querySelector('.copy-status');try{await navigator.clipboard.writeText(copy.dataset.url);status.textContent=window.litbuyText?.('Weidian link copied.')||'Weidian link copied.';}catch{status.textContent=copy.dataset.url;}});
})();
