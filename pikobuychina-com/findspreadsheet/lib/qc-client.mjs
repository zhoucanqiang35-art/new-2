import {text} from './ui-text.mjs';
import {itemId, mainSearch, sourceOrigin} from './platform.mjs';

let snapshots;
function loadSnapshots() {
  snapshots ??= fetch('/data/qc-snapshot.json')
    .then((response) => response.ok ? response.json() : {})
    .catch(() => { snapshots = undefined; return {}; });
  return snapshots;
}

function renderPhotos(photos, grid) {
  const links = photos.map((photo, index) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const image = document.createElement('img');
    image.referrerPolicy = 'no-referrer';
    image.src = photo.url;
    image.alt = text('Warehouse QC photo') + ' ' + (index + 1) + (photo.label ? ' · ' + photo.label : '');
    image.loading = 'lazy';
    link.append(image);
    if (photo.agent || photo.label) {
      const caption = document.createElement('span');
      caption.className = 'qc-photo-agent';
      caption.textContent = [photo.agent, photo.label].filter(Boolean).join(' · ');
      caption.translate = false;
      link.append(caption);
    }
    return link;
  });
  grid.replaceChildren(...links);
}

function addSource(status, id, productPath) {
  const link = document.createElement('a');
  link.className = 'text-link';
  link.href = productPath && /^\/[\w-]+\/[\w-]+\.html$/.test(productPath)
    ? sourceOrigin + productPath + '#qcPhotosStatus' : mainSearch(id);
  link.textContent = text('View on FindSpreadsheet');
  status.append(' ', link);
  return link;
}

function showDate(status, label, date) {
  if (!date) return;
  const time = document.createElement('time');
  time.dateTime = date;
  time.textContent = new Intl.DateTimeFormat(document.documentElement.lang, {dateStyle:'medium', timeZone:'UTC'}).format(new Date(date));
  status.append(' · ', label, ' ', time);
}

export async function showQc(input, root, limit, productPath) {
  const id = itemId(input);
  const status = root.querySelector('[role=status]');
  const grid = root.querySelector('.product-grid');
  const sequence = Number(root.dataset.request || 0) + 1;
  root.dataset.request = sequence;
  const isCurrent = () => Number(root.dataset.request) === sequence;
  grid.replaceChildren();
  if (!id) {
    status.textContent = text('Enter a valid Weidian item ID or product link.');
    return;
  }
  status.textContent = text('Checking QC photos…');
  const query = new URLSearchParams({item: id});
  if (limit) query.set('limit', String(limit));
  const liveRequest = fetch('/api/qc?' + query, {cache:'no-store', signal:AbortSignal.timeout(5500)})
    .then((response) => response.ok ? response.json() : null)
    .catch(() => null);
  const pathRequest = productPath ? Promise.resolve(productPath)
    : fetch('/api/catalogitem?id=' + id, {signal:AbortSignal.timeout(3500)})
      .then((response) => response.ok ? response.json() : null)
      .then((data) => data?.product?.path).catch(() => undefined);
  const entry = (await loadSnapshots())[id];
  const snapshot = (entry?.photos || []).slice(0, limit ?? Infinity);
  if (!isCurrent()) return;
  const setSource = () => {
    const link = addSource(status, id, productPath);
    void pathRequest.then((path) => {
      if (isCurrent() && path && /^\/[\w-]+\/[\w-]+\.html$/.test(path)) {
        link.href = sourceOrigin + path + '#qcPhotosStatus';
      }
    });
  };
  const showSnapshot = (photos, savedAt) => {
    renderPhotos(photos, grid);
    status.textContent = text('QC photos: {count}', {count:photos.length});
    showDate(status, text('Saved on'), savedAt);
    setSource();
  };
  if (snapshot.length && !limit) showSnapshot(snapshot, entry.savedAt);
  const live = await liveRequest;
  if (!isCurrent()) return;
  if (live?.source === 'snapshot' && live.photos?.length) {
    if (limit || !snapshot.length) showSnapshot(live.photos.slice(0, limit ?? Infinity), live.savedAt);
  } else if (live?.photos?.length) {
    const photos = live.photos.slice(0, limit ?? Infinity);
    renderPhotos(photos, grid);
    status.textContent = text('QC photos: {count}', {count:live.total > photos.length ? photos.length+'/'+live.total : photos.length});
    showDate(status, text('Checked on'), new Date().toISOString().slice(0, 10));
    setSource();
  } else if (snapshot.length) {
    if (limit) showSnapshot(snapshot, entry.savedAt);
  } else {
    status.textContent = live && live.status!=='pending' ? text('No QC photos found.')
      : text('QC photos are temporarily unavailable.');
    if (live) showDate(status, text('Checked on'), new Date().toISOString().slice(0, 10));
    setSource();
  }
}
