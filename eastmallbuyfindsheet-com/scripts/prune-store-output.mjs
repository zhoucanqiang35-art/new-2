import {readFile, readdir, writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';

const input = new URL('../public/data/', import.meta.url);
const output = new URL('../dist/data/', import.meta.url);
const verified = new Set(JSON.parse(await readFile(new URL('../src/lib/weidian-shop-items.json', import.meta.url), 'utf8')));
const read = (name) => readFile(new URL(name, input));
const write = (name, data) => writeFile(new URL(name, output), data);
const catalog = JSON.parse(await read('catalog.json'));
const store = [];
const indices = new Map();
for (const [oldIndex, item] of catalog.entries()) {
  if (!verified.has(item.weidianId)) continue;
  indices.set(oldIndex, store.length);
  store.push(item);
}
if (store.length !== verified.size) throw new Error('Store listings and catalog are inconsistent');

// Each row references its product by the two-byte index in catalog.json.
const rowBytes = 194;
const inputIndex = await read('visual-index.bin');
const inputPhotos = JSON.parse(await read('visual-photos.json'));
if (inputIndex.length !== inputPhotos.length * rowBytes) throw new Error('Visual index and photo list are inconsistent');
const newIndex = Buffer.alloc(inputIndex.length);
const photos = [];
for (const [row, url] of inputPhotos.entries()) {
  const offset = row * rowBytes;
  const product = indices.get(inputIndex.readUInt16LE(offset));
  if (product === undefined) continue;
  const destination = photos.length * rowBytes;
  newIndex.writeUInt16LE(product, destination);
  inputIndex.copy(newIndex, destination + 2, offset + 2, offset + rowBytes);
  photos.push(url);
}
const index = newIndex.subarray(0, photos.length * rowBytes);
const compressed = gzipSync(index, {level: 9});
const catalogJson = JSON.stringify(store);
const photoJson = JSON.stringify(photos);
await Promise.all([
  write('catalog.json', catalogJson),
  write('visual-photos.json', photoJson),
  write('visual-index.bin', index),
  writeFile(new URL('../dist/visual-index.bin.gz', import.meta.url), compressed),
  write('store-catalog-v2.json', catalogJson),
  write('store-visual-photos-v2.json', photoJson),
  write('store-visual-index-v2.bin', index),
  write('store-visual-index-v2.bin.gz', compressed),
  ...(await readdir(input)).filter((name) => /^(gallery-\d+|qc|qc-featured|product-media-saved)\.json$/.test(name))
    .map(async (name) => {
      const items = JSON.parse(await read(name));
      await write(name, JSON.stringify(Object.fromEntries(Object.entries(items).filter(([id]) => verified.has(id)))));
    }),
]);
console.log('Published ' + store.length + ' verified store items and ' + photos.length + ' visual-search photos.');
