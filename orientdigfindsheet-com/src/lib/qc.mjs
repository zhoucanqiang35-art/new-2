import { element, readJson } from './dom.mjs';

let records;
const latestQuery = new WeakMap();

async function liveQc(id) {
  const response = await fetch('/api/qc/?' + new URLSearchParams({ item: id }), {
    signal: AbortSignal.timeout(13000),
  });
  if (!response.ok) throw new Error('Live QC unavailable');
  return response.json();
}

export function savedQcLabel(count, status) {
  if (count) return count + ' saved photos';
  if (status === 'none') return 'No photos in saved lookup';
  if (status === 'pending') return 'Saved lookup was pending';
  return 'QC not checked here';
}

export function loadQc() {
  records ??= readJson('/data/qc.json').catch(error=>{records=undefined;throw error;});
  return records;
}

export async function showQc(id, root) {
  const query = Symbol();
  latestQuery.set(root,query);
  const status = root.querySelector('[data-qc-status]');
  const gallery = root.querySelector('[data-qc-gallery]');
  root.hidden = false;
  gallery.replaceChildren();
  const preview = root.closest('[data-compare-qc]')?.querySelector('[data-qc-preview]');
  if (preview) preview.hidden = true;
  status.textContent = 'Checking warehouse QC…';
  try {
    let data;
    let saved = false;
    try {
      data = await liveQc(id);
    } catch {
      data = (await loadQc())[id];
      saved = true;
    }
    if (query !== latestQuery.get(root)) return;
    if (data?.photos?.length) {
      status.textContent = saved
        ? 'Live QC is unavailable. Showing saved warehouse photos.'
        : data.photos.length + ' warehouse photos from the main site.';
      const previewImage = preview?.querySelector('img');
      const source = preview?.querySelector('[data-qc-source]');
      const photos = root.dataset.qcLimit ? data.photos.slice(0,Number(root.dataset.qcLimit)) : data.photos;
      function selectPhoto(photo,index) {
        previewImage.src = photo.url;
        previewImage.alt = 'Warehouse QC photo '+(index+1);
        source.textContent = photo.source ? 'Warehouse source: '+photo.source : '';
      }
      if (previewImage) {
        preview.hidden = false;
        selectPhoto(photos[0],0);
      }
      for (const [index,photo] of photos.entries()) {
        if (previewImage) {
          const button = element('button',{type:'button',className:'qc-thumbnail'});
          button.setAttribute('aria-label','Show warehouse photo '+(index+1));
          button.setAttribute('aria-pressed',String(index===0));
          button.append(element('img',{src:photo.url,alt:'',loading:'lazy'}));
          button.addEventListener('click',()=>{
            selectPhoto(photo,index);
            gallery.querySelector('[aria-pressed="true"]')?.setAttribute('aria-pressed','false');
            button.setAttribute('aria-pressed','true');
          });
          gallery.append(button);
          continue;
        }
        const link = element('a',{href:photo.url,target:'_blank',rel:'noopener'});
        link.append(element('img',{src:photo.url,alt:'Warehouse QC photo '+(index+1),loading:'lazy'}));
        if (photo.source) link.append(element('span',{},'Warehouse source: '+photo.source));
        gallery.append(link);
      }
      return;
    }
    if (saved) {
      status.textContent = data?.status === 'none'
        ? 'Live QC is unavailable. The saved lookup found no photos.'
        : 'Live QC is unavailable. Please try again.';
    } else if (data?.status === 'none') status.textContent = 'The main site checked this item and found no QC photos.';
    else if (data?.status === 'pending') status.textContent = 'The main site has no confirmed QC result yet. Try again later.';
    else status.textContent = 'The main site returned no QC record for this item.';
  } catch {
    if (query === latestQuery.get(root)) status.textContent = 'Live QC is unavailable. Please try again.';
  }
}
