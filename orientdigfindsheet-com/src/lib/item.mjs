import { element } from './dom.mjs';
import { showQc } from './qc.mjs';

const product = document.querySelector('#product[data-weidian-id]');
if (product) {
  const main = product.querySelector('#main-image');
  const mainLink = product.querySelector('#main-photo-link');
  const mainStatus = product.querySelector('#main-photo-status');
  const optionSelector = '[data-listing-photo], [data-seller-photo]';
  const listingPhotos = [...product.querySelectorAll('[data-listing-photo]')].map(button => button.dataset.listingPhoto);
  const failedPhotos = new Set();
  function selectPhoto(url) {
    if (main.getAttribute('src') === url) return;
    mainStatus.hidden = true;
    main.src = url;
    mainLink.href = url;
    for (const option of product.querySelectorAll(optionSelector)) {
      option.setAttribute('aria-pressed', String((option.dataset.sellerPhoto ?? option.dataset.listingPhoto) === url));
    }
  }
  function recoverMainPhoto() {
    failedPhotos.add(main.getAttribute('src'));
    const fallback = listingPhotos.find(url => !failedPhotos.has(url));
    if (fallback) selectPhoto(fallback);
    else mainStatus.hidden = false;
  }
  main.addEventListener('error', recoverMainPhoto);
  if (main.complete && !main.naturalWidth) recoverMainPhoto();
  product.addEventListener('click', event => {
    const button = event.target.closest(optionSelector);
    if (button) selectPhoto(button.dataset.sellerPhoto ?? button.dataset.listingPhoto);
  });

  const optionGroups = product.querySelector('#seller-options-groups');
  const optionStatus = product.querySelector('#seller-options-status');
  async function loadOptions() {
    try {
      const response = await fetch('/api/seller-options/?' + new URLSearchParams({ id: product.dataset.weidianId }), {
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error('Seller options unavailable');
      const { groups } = await response.json();
      if (!Array.isArray(groups)) throw new Error('Seller options unavailable');
      const sections = groups.map(group => {
        const section = element('section', { className: 'seller-option-group' });
        const title = element('h3', { translate: false }, group.label);
        const grid = element('div', { className: 'purchase-photo-grid' });
        for (const option of group.options) {
          const button = element('button', { type: 'button', title: option.label, translate: false });
          button.dataset.sellerPhoto = option.image;
          button.setAttribute('aria-label', option.label);
          button.setAttribute('aria-pressed', String(main.getAttribute('src') === option.image));
          button.append(element('img', { src: option.image, alt: '', width: 58, height: 58, loading: 'eager', decoding: 'async' }));
          grid.append(button);
        }
        section.append(title, grid);
        return section;
      });
      if (optionGroups.contains(document.activeElement) || (!sections.length && optionGroups.childElementCount)) return;
      optionGroups.replaceChildren(...sections);
      optionStatus.hidden = sections.length > 0;
      if (!sections.length) optionStatus.textContent = 'Open Weidian to see the seller’s current options.';
    } catch {
      if (!optionGroups.childElementCount) optionStatus.textContent = 'Options are temporarily unavailable. Check the seller listing.';
    }
  }

  void loadOptions();

  const agents = product.querySelector('#other-agents');
  document.addEventListener('click', event => {
    if (!agents.contains(event.target)) agents.open = false;
  });
  agents.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !agents.open) return;
    agents.open = false;
    agents.querySelector('summary').focus();
  });

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
  showQc(product.dataset.weidianId, qc).then(async () => {
    const livePhotos = [...qc.querySelectorAll('[data-qc-gallery] img')];
    if (!livePhotos.length) return;
    try {
      await Promise.any(livePhotos.map(photo => photo.decode()));
      for (const section of product.querySelectorAll('#seller-reference-photos, #saved-detail-photos')) section.hidden = true;
    } catch {
      qc.querySelector('[data-qc-gallery]').replaceChildren();
      qc.querySelector('[data-qc-status]').textContent = 'Live warehouse photos could not load. Showing the available photos above.';
    }
  });
}
