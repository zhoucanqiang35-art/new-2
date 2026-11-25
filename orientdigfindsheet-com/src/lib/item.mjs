import { showQc } from './qc.mjs';

const product = document.querySelector('#product[data-weidian-id]');
if (product) {
  const main = product.querySelector('#main-image');
  const mainLink = product.querySelector('#main-photo-link');
  const photos = [...product.querySelectorAll('[data-listing-photo]')];
  for (const button of photos) {
    button.addEventListener('click', () => {
      const url = button.dataset.listingPhoto;
      main.src = url;
      mainLink.href = url;
      for (const option of photos) option.setAttribute('aria-pressed', String(option.dataset.listingPhoto === url));
    });
  }

  const copy = document.querySelector('#copy-product');
  const copyStatus = document.querySelector('#copy-status');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copy.dataset.copyUrl);
      copyStatus.textContent = 'Link copied';
    } catch {
      copyStatus.textContent = copy.dataset.copyUrl;
    }
    copyStatus.hidden = false;
  });

  const qc = product.querySelector('[data-qc-results]');
  showQc(product.dataset.weidianId, qc).then(() => {
    if (!qc.querySelector('[data-qc-gallery]').childElementCount) return;
    for (const section of product.querySelectorAll('#seller-reference-photos, #saved-detail-photos')) section.hidden = true;
  });
}
