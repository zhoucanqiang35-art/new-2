import { card, readJson } from './dom.mjs';

const file = document.querySelector('#image-file');
const example = document.querySelector('#image-example');
const preview = document.querySelector('#image-preview');
const status = document.querySelector('#image-status');
const results = document.querySelector('#image-results');
const size = 8;
const channels = size * size * 3;
const rowBytes = 2 + channels;
let latest = 0;
let dataset;
let objectUrl;

function loadDataset() {
  dataset ??= Promise.all([
    readJson('/data/catalog.json'),
    fetch('/data/visual-index.bin').then(response=>{
      if (!response.ok) throw new Error('Index unavailable');
      return response.arrayBuffer();
    }),
  ]).catch(error=>{dataset=undefined;throw error;});
  return dataset;
}

function feature(image) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d',{willReadFrequently:true});
  context.fillStyle = '#fff';
  context.fillRect(0,0,size,size);
  context.drawImage(image,0,0,size,size);
  const pixels = context.getImageData(0,0,size,size).data;
  return Uint8Array.from({length:channels},(_,index)=>pixels[Math.floor(index/3)*4+index%3]);
}

function match(input, buffer, productCount) {
  if (buffer.byteLength % rowBytes !== 0) throw new Error('Invalid image index');
  const rows = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const best = new Map();
  for (let offset=0;offset<rows.length;offset+=rowBytes) {
    const product = view.getUint16(offset,true);
    if (product >= productCount) continue;
    let score = 0;
    for (let index=0;index<channels;index+=1) {
      const difference = input[index] - rows[offset+2+index];
      score += difference * difference;
    }
    if (!best.has(product) || score < best.get(product)) best.set(product,score);
  }
  return [...best].sort((first,second)=>first[1]-second[1]).slice(0,24).map(([product])=>product);
}

async function search(src) {
  const run = ++latest;
  preview.hidden = false;
  preview.src = src;
  status.textContent = 'Searching the saved image index…';
  results.replaceChildren();
  try {
    const image = new Image();
    image.src = src;
    const [[catalog,buffer]] = await Promise.all([loadDataset(),image.decode()]);
    if (run !== latest) return;
    const choices = match(feature(image),buffer,catalog.length);
    results.replaceChildren(...choices.map(index=>card(catalog[index])));
    status.textContent = choices.length + ' visually similar listings from the saved index.';
  } catch {
    if (run === latest) status.textContent = 'Image search could not finish. Try a different photo or reload the page.';
  }
}

function clearUpload() {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = undefined;
}

file.addEventListener('change',()=>{
  const selected = file.files[0];
  if (!selected) return;
  clearUpload();
  if (selected.size > 20*1024*1024) {
    latest += 1;
    preview.hidden = true;
    preview.removeAttribute('src');
    results.replaceChildren();
    status.textContent = 'Choose a photo smaller than 20 MB.';
    return;
  }
  objectUrl = URL.createObjectURL(selected);
  search(objectUrl);
});

example.addEventListener('click',()=>{
  clearUpload();
  file.value = '';
  search('/media/product-5985.webp');
});
