import {setupCatalog} from './lib/catalog-client.mjs';
import {setupImageSearch} from './lib/image-search.mjs';
import {setupDetail} from './lib/product-detail.mjs';
import {enableProductImageFallback} from './lib/product-images.mjs';
import {showQc} from './lib/qc-client.mjs';
import {setupShoppingMenu, setupCurrencyDisplay} from './lib/shopping-menu.mjs';
import {setupSavedProducts} from './lib/saved-products.mjs';

enableProductImageFallback();
setupCurrencyDisplay();
for (const menu of document.querySelectorAll('[data-shopping-menu]')) setupShoppingMenu(menu);
const saved = document.querySelector('[data-saved-list]');
if (saved) setupSavedProducts(saved);
if (document.querySelector('#catalog')) setupCatalog();
if (document.querySelector('#find-detail')) setupDetail();
for (const root of document.querySelectorAll('[data-image-lookup]')) setupImageSearch(root);
const qc = document.querySelector('[data-qc-lookup]');
if (qc) {
  const form = qc.querySelector('form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void showQc(form.elements.item.value, qc);
  });
  const item = new URLSearchParams(window.location.search).get('item');
  if (item) {
    form.elements.item.value = item;
    void showQc(item, qc);
  }
}
