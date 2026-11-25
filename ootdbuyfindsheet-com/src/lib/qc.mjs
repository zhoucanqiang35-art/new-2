import { element, readJson } from './dom.mjs';

let savedQc;
const latestLookup = new WeakMap();

function addPhoto(gallery, photo, index, label) {
  const link = element('a', { href: photo.url, target: '_blank', rel: 'noopener noreferrer' });
  const image = element('img', { src: photo.url, alt: label + ' ' + (index + 1), loading: 'lazy' });
  image.referrerPolicy = 'no-referrer';
  link.append(image);
  if (photo.source) {
    const label = element('span', {}, photo.source);
    label.translate = false;
    link.append(label);
  }
  gallery.append(link);
}

export async function renderQc(id, root, mode = 'lookup', fallback) {
  const request = {};
  latestLookup.set(root, request);
  const heading = root.querySelector('[data-qc-heading]');
  const status = root.querySelector('[data-qc-status]');
  const gallery = root.querySelector('[data-qc-gallery]');
  const refresh = root.querySelector('[data-qc-refresh]');
  savedQc ??= readJson('/data/qc.json').catch(() => {
    savedQc = undefined;
    return null;
  });
  const records = await savedQc;
  if (latestLookup.get(root) !== request) return;

  const saved = records?.[id];
  const photos = saved?.photos ?? [];
  const hasSaved = photos.length > 0;
  const savedLabel = saved?.savedAt
    ? 'Saved Findspreadsheet warehouse photos · ' + saved.savedAt
    : 'Saved Findspreadsheet warehouse photos.';
  const showPhotos = (photos, isQc) => {
    if (heading) heading.textContent = isQc ? 'Warehouse QC' : 'Product photos';
    gallery.replaceChildren();
    const label = isQc ? 'Warehouse QC photo' : 'Product photo';
    photos.forEach((photo, index) => addPhoto(gallery, photo, index, label));
  };
  showPhotos(hasSaved ? photos : (fallback ?? []).map(url => ({url})), hasSaved);
  refresh.disabled = false;
  refresh.hidden = !hasSaved && !fallback;
  refresh.textContent = hasSaved ? 'Check for newer photos' : 'Check QC';
  refresh.onclick = () => void renderQc(id, root, 'live', fallback);
  if (mode === 'preview') return;
  status.hidden = false;
  if (mode !== 'live' && hasSaved) {
    status.textContent = savedLabel;
    return;
  }

  refresh.disabled = true;
  let limited = false;
  status.textContent = hasSaved
    ? savedLabel + ' Checking for updates…'
    : 'Checking Findspreadsheet for warehouse photos…';
  try {
    const endpoint = new URL(import.meta.env.PUBLIC_QC_ENDPOINT || 'https://ootdbuyfindsheet-qc.zhoucanqiang35.chatgpt.site/qc');
    endpoint.searchParams.set('id', id);
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(11000) });
    limited = response.status === 429;
    if (!response.ok) throw new Error('QC unavailable');
    const entry = await response.json();
    if (latestLookup.get(root) !== request) return;
    if (entry.status === 'none' || entry.status === 'pending') {
      const message = entry.status === 'none'
        ? 'Findspreadsheet returned no current warehouse photos for this item.'
        : 'Warehouse photos are being processed. Check again later.';
      status.textContent = hasSaved ? savedLabel + ' ' + message : message;
      return;
    }
    if (entry.status !== 'ready' || !entry.photos?.length) throw new Error('Unexpected QC result');
    status.textContent = 'Warehouse photos found on Findspreadsheet.';
    showPhotos(entry.photos, true);
  } catch {
    if (latestLookup.get(root) !== request) return;
    const message = limited
      ? 'Findspreadsheet is limiting live QC requests. Please try again later.'
      : 'The live QC lookup failed. Please try again.';
    status.textContent = hasSaved ? savedLabel + ' ' + message : message;
  } finally {
    if (latestLookup.get(root) === request) refresh.disabled = false;
  }
}
