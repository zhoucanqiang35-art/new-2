import { readJson, card } from './browser.mjs';
import { productImage } from './catalog.mjs';
import { isShopItem } from './landing-paths.mjs';

const file = document.getElementById('image-file');
const example = document.getElementById('image-example');
const preview = document.getElementById('image-preview');
const status = document.getElementById('image-status');
const results = document.getElementById('image-results');
const progress = document.getElementById('image-download-progress');
const dimensions = 8;
const channels = dimensions * dimensions * 3;
const rowBytes = 2 + channels;
const limit = 24;
let runNumber = 0;
let dataset;
let activeObjectUrl;

async function loadIndex() {
  const compressed = typeof DecompressionStream === 'function';
  const response = await fetch(compressed ? '/data/store-visual-index-v1.bin.gz' : '/data/store-visual-index-v1.bin');
  if (!response.ok || !response.body) throw new Error('The image index could not be loaded');
  const total = Number(response.headers.get('Content-Length'));
  let loaded = 0;
  const download = response.body.pipeThrough(new TransformStream({
    transform(chunk, controller) {
      loaded += chunk.byteLength;
      const mb = (loaded / 1e6).toFixed(1);
      progress.textContent = total > 0 ? mb + ' / ' + (total / 1e6).toFixed(1) + ' MB' : mb + ' MB';
      controller.enqueue(chunk);
    },
  }));
  try {
    return await new Response(compressed ? download.pipeThrough(new DecompressionStream('gzip')) : download).arrayBuffer();
  } finally {
    progress.textContent = '';
  }
}

function loadDataset() {
  dataset ??= Promise.all([
    readJson('/data/store-catalog-v1.json'),
    readJson('/data/store-visual-photos-v1.json'),
    loadIndex(),
  ]).catch((error) => { dataset = undefined; throw error; });
  return dataset;
}

function feature(image) {
  const canvas = document.createElement('canvas');
  canvas.width = dimensions;
  canvas.height = dimensions;
  const context = canvas.getContext('2d', {willReadFrequently: true});
  context.fillStyle = '#fff';
  context.fillRect(0, 0, dimensions, dimensions);
  context.drawImage(image, 0, 0, dimensions, dimensions);
  const pixels = context.getImageData(0, 0, dimensions, dimensions).data;
  return Uint8Array.from({length: channels}, (_, i) => pixels[Math.floor(i / 3) * 4 + i % 3]);
}

function match(input, buffer, catalog, totalPhotos) {
  if (buffer.byteLength !== totalPhotos * rowBytes) throw new Error('Image index length mismatch');
  const rows = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const best = new Map();
  for (let offset = 0; offset < rows.length; offset += rowBytes) {
    const product = view.getUint16(offset, true);
    if (!isShopItem(catalog[product]?.weidianId)) continue;
    let score = 0;
    for (let j = 0; j < channels; j += 1) {
      const difference = input[j] - rows[offset + 2 + j];
      score += difference * difference;
    }
    if (!best.has(product) || score < best.get(product).score) {
      best.set(product, { product, score, photo: offset / rowBytes });
    }
  }
  return [...best.values()].sort((a, b) => a.score - b.score).slice(0, limit);
}

async function search(src, sampleId = '') {
  const run = ++runNumber;
  if (src) preview.src = src;
  preview.hidden = !src;
  status.textContent = dataset ? 'Searching the saved image index…' : 'Loading the image search index…';
  results.replaceChildren();
  try {
    const [catalog, photos, buffer] = await loadDataset();
    if (run !== runNumber) return;
    status.textContent = 'Searching the saved image index…';
    let input;
    if (sampleId) {
      const index = catalog.findIndex((product) => product.weidianId === sampleId);
      const rows = new DataView(buffer);
      for (let offset = 0; offset + rowBytes <= rows.byteLength; offset += rowBytes) {
        if (rows.getUint16(offset, true) !== index) continue;
        input = new Uint8Array(buffer, offset + 2, channels);
        preview.src = photos[offset / rowBytes] || productImage(catalog[index]);
        preview.hidden = false;
        break;
      }
      if (!input) throw new Error('The example is missing from the image index');
    } else {
      const image = new Image();
      image.src = src;
      await image.decode();
      if (run !== runNumber) return;
      input = feature(image);
    }
    const valid = match(input, buffer, catalog, photos.length);
    results.replaceChildren(...valid.map(({product, photo}) => card(catalog[product], photos[photo])));
    status.textContent = valid.length + ' visually similar listings from the saved index.';
  } catch {
    if (run !== runNumber) return;
    status.textContent = 'Image search could not finish. Choose a supported image and try again.';
  }
}

function clearObjectUrl() {
  if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
  activeObjectUrl = undefined;
}
function choosePhoto(photo) {
  if (!photo) return;
  if (photo.type && !photo.type.startsWith('image/')) {
    ++runNumber;
    clearObjectUrl();
    preview.hidden = true;
    results.replaceChildren();
    status.textContent = 'Choose a supported image file.';
    return;
  }
  clearObjectUrl();
  activeObjectUrl = URL.createObjectURL(photo);
  void search(activeObjectUrl);
}
file.addEventListener('change', () => choosePhoto(file.files[0]));

const dropZone = file.closest('label');
dropZone.addEventListener('dragover', (event) => {
  if (!event.dataTransfer.types.includes('Files')) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
  dropZone.dataset.dropActive = '';
});
dropZone.addEventListener('dragleave', (event) => {
  if (!dropZone.contains(event.relatedTarget)) delete dropZone.dataset.dropActive;
});
dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  delete dropZone.dataset.dropActive;
  file.value = '';
  choosePhoto(event.dataTransfer.files[0]);
});
example.addEventListener('click', () => {
  clearObjectUrl();
  file.value = '';
  search('', '7857139190');
});
