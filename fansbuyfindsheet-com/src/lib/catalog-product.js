import snapshot from '../data/preview-catalog.json';
import sourceCatalog from '../data/main-catalog.json';
import archivePaths from '../data/main-archive-paths.json';
import galleries from '../data/main-galleries.json';
import { findspreadsheet, purchase } from './fansbuy.js';

const sourceImage = path => new URL(path, findspreadsheet).href;
export const catalogProducts = sourceCatalog.map(([path, name, id, cover, price, date, views]) => ({
  path, name, id, image: sourceImage(cover), price, date, views
}));

const byPath = new Map(catalogProducts.map(product => [product.path, product]));
const archiveIdByPath = new Map(Object.entries(archivePaths).map(([id, path]) => [path, id]));

export function catalogProductAt(path) {
  return byPath.get(path);
}

export function catalogDetail(path) {
  const product = catalogProductAt(path);
  if (!product) return null;
  const { name, id, image, price } = product;
  const known = snapshot.details[path];
  const sameItem = known?.id === id;
  const gallery = (galleries[archiveIdByPath.get(path)] ?? []).map(sourceImage);
  return {
    name: sameItem ? known.name : name,
    id, buy: purchase(id), price,
    images: [...new Set([image, ...gallery, ...(sameItem ? known.images : [])])],
    source: new URL(path, findspreadsheet).href
  };
}

export function imageProductCatalog(ids) {
  return Object.fromEntries(ids.flatMap(id => {
    const product = Object.hasOwn(archivePaths, id) ? catalogProductAt(archivePaths[id]) : null;
    if (!product) return [];
    const { path, name, image, price } = product;
    return [[id, { path, name, image, price }]];
  }));
}
