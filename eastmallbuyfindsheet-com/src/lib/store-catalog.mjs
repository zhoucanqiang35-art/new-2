import catalog from '../../public/data/catalog.json';
import {isShopItem} from './landing-paths.mjs';

export const storeCatalog = catalog.filter((product) => isShopItem(product.weidianId));
