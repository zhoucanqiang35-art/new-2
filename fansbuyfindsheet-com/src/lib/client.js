import { setCopy, setCopyAttribute } from './page-copy.js';

export function element(tag, text = '', className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

export async function getData(path, params) {
  const response = await fetch(path + '?' + new URLSearchParams(params));
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('The FindSpreadsheet connection is unavailable. Please try again.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The requested results were unavailable.');
  return data;
}

export async function displayQc(id, status, gallery, onMediaError, { cached, eager = false } = {}) {
  gallery.replaceChildren();
  if (!eager) setCopy(status, 'Checking FindSpreadsheet for warehouse photos…');
  const { status: result, images, previewSnapshot } = cached ?? await getData('/api/qc', { id });
  if (result !== 'ready' || !images.length) {
    setCopy(status, result === 'pending' ? 'QC photos are still being prepared.' : 'FindSpreadsheet has no QC photos available for this item.');
    return;
  }
  setCopy(status, previewSnapshot ? 'QC media from FindSpreadsheet · preview sample' : 'QC media from FindSpreadsheet');
  for (const photo of images) {
    const media = element(photo.video ? 'video' : 'img');
    let tile = media;
    if (photo.video) {
      media.controls = true;
      media.preload = 'metadata';
    } else {
      setCopyAttribute(media, 'alt', photo.label || 'Warehouse inspection photo');
      media.loading = eager ? 'eager' : 'lazy';
      if (eager) media.fetchPriority = 'low';
      const link = element('a');
      link.href = photo.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.append(media);
      tile = link;
    }
    media.addEventListener('error', () => {
      tile.remove();
      if (!gallery.children.length) {
        setCopy(status, 'FindSpreadsheet returned QC media, but none of the files could be loaded.');
        onMediaError?.();
      }
    }, { once: true });
    gallery.append(tile);
    media.src = photo.url;
  }
}
