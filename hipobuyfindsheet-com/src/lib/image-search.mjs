import { readJson, card, ui } from './browser-data.mjs';

const file = document.getElementById('image-file');
const preview = document.getElementById('image-preview');
const status = document.getElementById('image-status');
const results = document.getElementById('image-results');
const dimensions = 8;
const channels = dimensions * dimensions * 3;
const rowBytes = 2 + channels;
const limit = 36;
let runNumber = 0;
let dataset;
let activeObjectUrl;

function loadDataset() {
  dataset ??= Promise.all([
    readJson('/data/catalog.json'),
    readJson('/data/visual-photos.json'),
    readJson('/data/qc.json'),
    readJson('/data/qc-featured.json'),
    fetch('/data/visual-index.bin').then((response) => {
      if (!response.ok) throw new Error('The image index could not be loaded');
      return response.arrayBuffer();
    }),
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

function isQcPhoto(url, qcUrls) {
  return qcUrls.has(url) || url?.startsWith('/qc-media/');
}

function match(input, buffer, totalProducts, photos, qcUrls) {
  const totalPhotos = photos.length;
  if (buffer.byteLength !== totalPhotos * rowBytes) throw new Error('Image index length mismatch');
  const rows = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const best = new Map();
  for (let offset = 0; offset < rows.length; offset += rowBytes) {
    const product = view.getUint16(offset, true);
    const photo = offset / rowBytes;
    if (product >= totalProducts || isQcPhoto(photos[photo], qcUrls)) continue;
    let score = 0;
    for (let j = 0; j < channels; j += 1) {
      const difference = input[j] - rows[offset + 2 + j];
      score += difference * difference;
    }
    if (!best.has(product) || score < best.get(product).score) {
      best.set(product, {product, score, photo});
    }
  }
  return [...best.values()].sort((a, b) => a.score - b.score).slice(0, limit);
}

async function search(src) {
  const run = ++runNumber;
  preview.src = src;
  preview.hidden = false;
  status.replaceChildren(ui('span', 'imageMatching'));
  results.replaceChildren();
  try {
    const image = new Image();
    image.src = src;
    const [[catalog, photos, qc, qcFeatured, buffer]] = await Promise.all([loadDataset(), image.decode()]);
    if (run !== runNumber) return;
    const qcUrls = new Set([...Object.values(qc), ...Object.values(qcFeatured)]
      .flatMap((entry) => entry.images?.map(({url}) => url) ?? []));
    const findings = match(feature(image), buffer, catalog.length, photos, qcUrls);
    results.replaceChildren(...findings.map(({product, photo}) => card(catalog[product], photos[photo])));
    status.replaceChildren(ui('span', 'imageMatches', {}, findings.length, photos.filter((url) => !isQcPhoto(url, qcUrls)).length.toLocaleString('en')));
  } catch {
    if (run !== runNumber) return;
    status.replaceChildren(ui('span', 'imageError'));
  }
}

function clearObjectUrl() {
  if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
  activeObjectUrl = undefined;
}
file.addEventListener('change', () => {
  if (!file.files.length) return;
  clearObjectUrl();
  activeObjectUrl = URL.createObjectURL(file.files[0]);
  search(activeObjectUrl);
});
