import { element } from './dom.mjs';
import { showQc } from './qc.mjs';

const product = document.querySelector('#product[data-weidian-id]');
if (product) {
  const main = product.querySelector('#main-image');
  const mainLink = product.querySelector('#main-photo-link');
  const optionSelector = '[data-listing-photo], [data-seller-photo]';
  product.addEventListener('click', event => {
    const button = event.target.closest(optionSelector);
    if (!button) return;
    const url = button.dataset.sellerPhoto ?? button.dataset.listingPhoto;
    main.src = url;
    mainLink.href = url;
    for (const option of product.querySelectorAll(optionSelector)) {
      option.setAttribute('aria-pressed', String((option.dataset.sellerPhoto ?? option.dataset.listingPhoto) === url));
    }
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
      if (optionGroups.contains(document.activeElement)) return;
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
  showQc(product.dataset.weidianId, qc).then(() => {
    if (!qc.querySelector('[data-qc-gallery]').childElementCount) return;
    for (const section of product.querySelectorAll('#seller-reference-photos, #saved-detail-photos')) section.hidden = true;
  });
}
