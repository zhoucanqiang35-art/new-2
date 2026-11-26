import { catalog, makeCard } from './browser';

const panel = document.querySelector('[data-image-finder]');
const drop = panel.querySelector('#image-drop');
const input = panel.querySelector('#image-file');
const query = panel.querySelector('#image-query');
const thumbnail = panel.querySelector('#image-preview');
const filename = panel.querySelector('#image-name');
const results = document.querySelector('#image-results');
const status = document.querySelector('#image-status');
const retry = panel.querySelector('#image-retry');
const reset = panel.querySelector('#image-reset');
const gridSize = 8;
const maxBytes = 20 * 1024 * 1024;
const supportedMime = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
let job;
let worker;
let jobId = 0;
let lastFile;
let previewUrl;
let catalogRequest;

function clearImage() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = undefined;
  thumbnail.removeAttribute('src');
  thumbnail.hidden = true;
}

function stop() {
  job?.abort();
  job = undefined;
  results.setAttribute('aria-busy', 'false');
}

function findMatches(pixels, id, signal) {
  worker ??= new Worker(new URL('./visual-worker.js', import.meta.url), { type: 'module' });
  const currentWorker = worker;
  return new Promise((resolve, reject) => {
    function cleanup() {
      currentWorker.removeEventListener('message', receive);
      currentWorker.removeEventListener('error', fail);
      signal.removeEventListener('abort', abort);
    }
    function receive({ data }) {
      if (data.id !== id) return;
      cleanup();
      if (data.error) reject(new Error(data.error));
      else resolve(data.matches);
    }
    function fail() {
      cleanup();
      currentWorker.terminate();
      worker = undefined;
      reject(new Error('Image search could not start. Try again.'));
    }
    function abort() {
      cleanup();
      currentWorker.terminate();
      worker = undefined;
      reject(signal.reason);
    }
    signal.addEventListener('abort', abort, { once: true });
    currentWorker.addEventListener('message', receive);
    currentWorker.addEventListener('error', fail);
    currentWorker.postMessage({ pixels, id }, [pixels.buffer]);
  });
}

function getPixels(image) {
  const canvas = document.createElement('canvas');
  canvas.width = gridSize;
  canvas.height = gridSize;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Image search needs canvas support in your browser.');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, gridSize, gridSize);
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, gridSize, gridSize);
  const { data } = context.getImageData(0, 0, gridSize, gridSize);
  return Uint8Array.from({ length: gridSize * gridSize * 3 }, (_, index) => data[Math.floor(index / 3) * 4 + index % 3]);
}

function readCatalog() {
  catalogRequest ??= catalog().catch(() => {
    catalogRequest = undefined;
    throw new Error('The product catalog could not load. Try again.');
  });
  return catalogRequest;
}

async function search(file) {
  stop();
  clearImage();
  const controller = new AbortController();
  const { signal } = controller;
  job = controller;
  lastFile = file;
  query.hidden = false;
  filename.textContent = file.name || 'Clipboard image';
  reset.textContent = 'Cancel';
  retry.hidden = true;
  results.replaceChildren();
  results.setAttribute('aria-busy', 'true');
  status.textContent = 'Searching for similar products…';

  try {
    if (!file.size) throw new Error('This image is empty. Choose a different file.');
    if (file.size > maxBytes) throw new Error('Choose an image up to 20 MB.');
    if (file.type ? !supportedMime.has(file.type) : !/\.(?:jpe?g|png|webp|gif)$/i.test(file.name)) {
      throw new Error('Choose a JPG, PNG, WebP, or GIF image.');
    }
    previewUrl = URL.createObjectURL(file);
    thumbnail.src = previewUrl;
    await thumbnail.decode().catch(() => { throw new Error('This image could not be opened. Choose a different file.'); });
    signal.throwIfAborted();
    if (thumbnail.naturalWidth * thumbnail.naturalHeight > 36_000_000) {
      throw new Error('Choose an image of 36 megapixels or less.');
    }
    thumbnail.hidden = false;
    const [positions, { items }] = await Promise.all([
      findMatches(getPixels(thumbnail), ++jobId, signal),
      readCatalog(),
    ]);
    signal.throwIfAborted();
    const products = positions.map((position) => items[position]).filter(Boolean);
    results.replaceChildren(...products.map(makeCard));
    status.textContent = products.length
      ? products.length + ' visually similar products, ordered by match.'
      : 'No similar products found. Try a clearer picture.';
  } catch (error) {
    if (signal.aborted) return;
    status.textContent = error.message;
    retry.hidden = thumbnail.hidden;
  } finally {
    if (!signal.aborted) {
      job = undefined;
      results.setAttribute('aria-busy', 'false');
      reset.textContent = 'Remove';
    }
  }
}

function useFile(file) {
  if (file) void search(file);
}

input.addEventListener('change', () => {
  useFile(input.files?.[0]);
  input.value = '';
});
drop.addEventListener('dragover', (event) => {
  if (!event.dataTransfer?.types.includes('Files')) return;
  event.preventDefault();
  drop.classList.add('is-dragging');
});
drop.addEventListener('dragleave', (event) => {
  const next = event.relatedTarget;
  if (!(next instanceof Node) || !drop.contains(next)) drop.classList.remove('is-dragging');
});
drop.addEventListener('drop', (event) => {
  event.preventDefault();
  drop.classList.remove('is-dragging');
  useFile(event.dataTransfer?.files[0]);
});
document.addEventListener('paste', (event) => {
  const item = [...(event.clipboardData?.items || [])].find((entry) => entry.kind === 'file' && entry.type.startsWith('image/'));
  const file = item?.getAsFile();
  if (!file) return;
  event.preventDefault();
  useFile(file);
});
retry.addEventListener('click', () => { if (lastFile) void search(lastFile); });
reset.addEventListener('click', () => {
  const cancelled = Boolean(job);
  stop();
  clearImage();
  lastFile = undefined;
  query.hidden = true;
  results.replaceChildren();
  status.textContent = cancelled ? 'Search cancelled. Choose an image to start again.' : 'Choose an image to see similar products.';
  input.focus();
});
