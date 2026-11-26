import items from '../../public/data/catalog.json' with { type: 'json' };
import { latest, sampleId } from './shared.js';

export * from './shared.js';
export const catalog = items;
export const latestItems = [...catalog].sort(latest);
export const sample = catalog.find((item) => item.id === sampleId);
