import {readFile, writeFile} from 'node:fs/promises';

const catalogPath = new URL('../src/data/catalog.json', import.meta.url);
const [catalog, manifest, index] = await Promise.all([
  readFile(catalogPath, 'utf8').then(JSON.parse),
  readFile(new URL('../public/data/visual-photos.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../public/data/visual-index.bin', import.meta.url)),
]);
if (manifest.products !== catalog.items.length || index.length !== manifest.photos.length * 50) {
  throw new Error('The catalog and image index must be from the same snapshot');
}
const photosByRow = catalog.items.map((item) => new Set([item.image, ...(item.gallery || [])]));
for (const [indexNumber, photo] of manifest.photos.entries()) {
  if (photo.startsWith('/uploads/')) photosByRow[index.readUInt16LE(indexNumber * 50)].add(photo);
}
for (const [row, product] of catalog.items.entries()) product.gallery = [...photosByRow[row]];
await writeFile(catalogPath, JSON.stringify(catalog));
const counts = photosByRow.filter((photos) => photos.size > 1).length;
console.log(`${counts} listings with more than one listing image out of ${catalog.items.length}`);
