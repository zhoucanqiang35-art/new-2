import {text} from './ui-text.mjs';
import {productCard} from './catalog-client.mjs';

const blockSize = 4;
const channels = blockSize * blockSize * 3;
const rowSize = 2 + channels;
let index;

const cacheName = 'pikobuy-image-index';
async function get(path, version, cache, type = 'json') {
  const url = new URL(path, location.href);
  url.searchParams.set('version', version);
  const saved = await cache?.match(url.href).catch(() => undefined);
  const response = saved || await fetch(url);
  if (!saved && response.ok && cache) {
    const copy = response.clone();
    void cache.put(url.href, copy).catch(() => {});
  }
  if (!response.ok) throw new Error('Image index unavailable');
  return type === 'json' ? response.json() : response.arrayBuffer();
}

function feature(image) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 8;
  const context = canvas.getContext('2d', {willReadFrequently: true});
  context.fillStyle = '#fff';
  context.fillRect(0, 0, 8, 8);
  context.drawImage(image, 0, 0, 8, 8);
  const pixels = context.getImageData(0, 0, 8, 8).data;
  const descriptor = new Uint8Array(channels);
  for (let y = 0; y < blockSize; y++) {
    for (let x = 0; x < blockSize; x++) {
      const i = (y * 16 + x * 2) * 4;
      const j = (y * blockSize + x) * 3;
      for (let channel = 0; channel < 3; channel++) {
        const a = i + channel;
        descriptor[j + channel] = Math.round((pixels[a] + pixels[a + 4] + pixels[a + 32] + pixels[a + 36]) / 4) >> 3;
      }
    }
  }
  return descriptor;
}

function scorePhoto(input, descriptor, offset = 0) {
  let score = 0;
  for (let j = 0; j < channels; j++) {
    const distance = input[j] - descriptor[offset + j];
    score += distance * distance;
  }
  return score;
}

function nearest(input, rows, photos, items, qcPhotos) {
  const bytes = new Uint8Array(rows);
  const view = new DataView(rows);
  const closest = new Map();
  function consider(product, score, photo) {
    if (!closest.has(product) || score < closest.get(product).score) {
      closest.set(product, {product, score, photo});
    }
  }
  for (let offset = 0; offset < rows.byteLength; offset += rowSize) {
    const product = view.getUint16(offset, true);
    if (product < items.length) consider(product, scorePhoto(input, bytes, offset + 2), photos[offset / rowSize]);
  }
  const byId = new Map(items.flatMap((item, row) => item.id ? [[item.id, row]] : []));
  for (const {id, photo, feature} of qcPhotos) {
    const product = byId.get(id);
    if (product !== undefined) consider(product, scorePhoto(input, feature), photo);
  }
  return [...closest.values()].sort((a, b) => a.score - b.score).slice(0, 24);
}

function dataset(version,onProgress) {
  if (index) return index;
  index = (async () => {
    const cache = await globalThis.caches?.open(cacheName).catch(() => undefined);
    if (cache) {
      const keys = await cache.keys().catch(() => []);
      await Promise.all(keys.filter((key) => new URL(key.url).searchParams.get('version') !== version)
        .map((key) => cache.delete(key).catch(() => false)));
    }
    let ready=0;
    return Promise.all([
      get('/catalog-data.json', version, cache), get('/data/visual-photos.json', version, cache),
      get('/data/visual-index.bin', version, cache, 'arrayBuffer'), get('/data/qc-visual.json', version, cache),
    ].map(part=>part.then((value)=>{onProgress(++ready,4); return value;})));
  })().catch((error) => { index = undefined; throw error; });
  return index;
}

export function setupImageSearch(root) {
  const file = root.querySelector('#image-file');
  const example = root.querySelector('#image-example');
  const preview = root.querySelector('#image-preview');
  const status = root.querySelector('#image-status');
  const coverage = root.querySelector('#image-coverage');
  const results = root.querySelector('#image-results');
  let run = 0;
  let objectUrl;
  async function search(url) {
    const current = ++run;
    preview.src = url;
    preview.hidden = false;
    results.replaceChildren();
    coverage.textContent = '';
    status.textContent = text('Preparing image search…');
    try {
      const image = new Image();
      image.src = url;
      const [[{items, imageIndexKey}, manifest, rows, qcPhotos]] = await Promise.all([dataset(root.dataset.imageVersion,(ready,total)=>{
        if(current===run) status.textContent=text('Preparing image search…')+' '+ready+'/'+total;
      }), image.decode()]);
      if (current !== run) return;
      if (manifest.featureBits !== 5 || manifest.imageIndexKey !== imageIndexKey || manifest.products !== items.length || rows.byteLength !== manifest.photos.length * rowSize) {
        throw new Error('The photo index and catalog are out of sync');
      }
      const matches = nearest(feature(image), rows, manifest.photos, items, qcPhotos);
      results.replaceChildren(...matches.map(({product, photo}) => productCard(items[product], photo)));
      status.textContent = matches.length + ' visually similar listings. Check the listing and exact variant before ordering.';
      coverage.textContent = (manifest.photos.length + qcPhotos.length) + ' indexed seller and warehouse photos across ' + manifest.covered + ' of ' + manifest.products + ' public listings.';
    } catch {
      if (current === run) status.textContent = 'Image search could not finish. Choose a supported photo and try again.';
    }
  }
  function clearPreview() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = undefined;
  }
  file.addEventListener('change', () => {
    const photo = file.files[0];
    if (!photo) return;
    clearPreview();
    if (photo.size > 15 * 1024 * 1024) {
      ++run;
      results.replaceChildren();
      coverage.textContent = '';
      preview.hidden = true;
      status.textContent = 'Choose a photo smaller than 15 MB.';
      return;
    }
    objectUrl = URL.createObjectURL(photo);
    search(objectUrl);
  });
  example.addEventListener('click', () => {
    clearPreview();
    file.value = '';
    search('/assets/image-search-sample.webp');
  });
  file.disabled = false;
  example.disabled = false;
  status.textContent = 'Choose a photo to start.';
}
