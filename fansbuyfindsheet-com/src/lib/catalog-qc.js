import archivedQc from '../data/archive-qc.json';
import catalogQc from '../data/catalog-qc.json';
import verifiedQc from '../data/preview-qc.json';

export function savedQc(id) {
  if (Object.hasOwn(verifiedQc, id)) return { ...verifiedQc[id], previewSnapshot: true };
  if (Object.hasOwn(archivedQc, id)) return { ...archivedQc[id], previewSnapshot: true };
  return Object.hasOwn(catalogQc, id) ? catalogQc[id] : null;
}
