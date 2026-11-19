import { priceLabel } from './catalog';

function updatePrices() {
  for (const element of document.querySelectorAll<HTMLElement>('[data-price-cny]')) {
    const formatted = priceLabel(element.dataset.priceCny ?? '');
    if (element.textContent !== formatted) element.textContent = formatted;
  }
}

document.addEventListener('catalog-currency-changed', updatePrices);
document.addEventListener('catalog-language-changed', updatePrices);
window.addEventListener('storage', event => {
  if (event.key === 'sugargoo-browse-currency') updatePrices();
});
updatePrices();
