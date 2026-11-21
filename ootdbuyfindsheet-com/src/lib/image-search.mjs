import { card, readJson } from './dom.mjs';
import { side, channels, chunkCount } from './visual-index.mjs';

const file = document.querySelector('#image-file');
const example = document.querySelector('#image-example');
const preview = document.querySelector('#image-preview');
const status = document.querySelector('#image-status');
const results = document.querySelector('#image-results');
const progress = document.querySelector('#image-progress');
const controls = document.querySelector('#image-controls');
const zoom = document.querySelector('#image-crop');
const applyCrop = document.querySelector('#apply-crop');
const worker = new Worker(new URL('./visual-match.worker.mjs',import.meta.url),{type:'module'});
let latest = 0;
let catalogPromise;
let objectUrl;
let source;

function getCatalog() {
  catalogPromise ??= readJson('/data/catalog.json').catch(error=>{catalogPromise=undefined;throw error;});
  return catalogPromise;
}

function feature(image, scale) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = side;
  const context = canvas.getContext('2d',{willReadFrequently:true});
  context.fillStyle = '#fff';
  context.fillRect(0,0,side,side);
  const width = image.naturalWidth / scale;
  const height = image.naturalHeight / scale;
  context.drawImage(image,(image.naturalWidth-width)/2,(image.naturalHeight-height)/2,width,height,0,0,side,side);
  const pixels = context.getImageData(0,0,side,side).data;
  return Uint8Array.from({length:channels},(_,index)=>pixels[Math.floor(index/3)*4+index%3]);
}

function fail() {
  progress.hidden = true;
  status.textContent = 'Image search could not finish. Try a different photo or reload the page.';
}

worker.addEventListener('error',fail);
worker.addEventListener('message',async ({data})=>{
  if (data.run !== latest) return;
  if (data.error) return fail();
  progress.value = data.completed;
  try {
    const catalog = await getCatalog();
    if (data.run !== latest) return;
    const finished = data.completed === data.total;
    if (finished || data.completed === 2) {
      results.replaceChildren(...data.choices.filter(index=>catalog[index]).map(index=>card(catalog[index])));
    }
    status.textContent = finished
      ? results.childElementCount + ' visually similar listings from the saved index.'
      : 'Searching the saved image index…';
    progress.hidden = finished;
  } catch { if (data.run === latest) fail(); }
});

async function search() {
  const run = ++latest;
  worker.postMessage({run});
  progress.max = chunkCount;
  progress.value = 0;
  progress.hidden = false;
  status.textContent = 'Searching the saved image index…';
  results.replaceChildren();
  applyCrop.disabled = true;
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    if (run !== latest) return;
    const input = feature(image,Number(zoom.value));
    worker.postMessage({run,input},[input.buffer]);
  } catch { if (run === latest) fail(); }
  finally { if (run === latest) applyCrop.disabled = false; }
}

function updateFrame() {
  preview.style.transform = 'scale(' + zoom.value + ')';
}
function loadPhoto(url) {
  source = url;
  zoom.value = '1';
  updateFrame();
  preview.src = url;
  controls.hidden = false;
  void search();
}
function clearUpload() {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = undefined;
}

file.addEventListener('change',()=>{
  const selected = file.files[0];
  if (!selected) return;
  clearUpload();
  if (selected.size > 20*1024*1024 || (selected.type && !/^image\/(jpeg|png|webp)$/i.test(selected.type))) {
    worker.postMessage({run:++latest});
    source = undefined;
    controls.hidden = progress.hidden = true;
    preview.removeAttribute('src');
    results.replaceChildren();
    status.textContent = 'Choose a JPG, PNG or WebP photo smaller than 20 MB.';
    return;
  }
  objectUrl = URL.createObjectURL(selected);
  loadPhoto(objectUrl);
});
example.addEventListener('click',()=>{
  clearUpload();
  file.value = '';
  loadPhoto('/media/product-5985.webp');
});
zoom.addEventListener('input',updateFrame);
applyCrop.addEventListener('click',()=>{if(source) void search();});
