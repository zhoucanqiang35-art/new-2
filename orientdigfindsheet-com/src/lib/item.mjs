import { element } from './dom.mjs';
import { showQc } from './qc.mjs';

const payload = document.querySelector('#product-data');
if (payload) {
  const { product, gallery } = JSON.parse(payload.textContent);
  const main = document.querySelector('#main-image');
  const thumbs = document.querySelector('#thumbnails');
  const agentDialog = document.querySelector('#agent-dialog');
  document.querySelector('#other-agents').addEventListener('click', () => agentDialog.showModal());
  showQc(product.weidianId, document.querySelector('[data-qc-results]'));

  const images = [...new Set([product.image, ...gallery])];
  if (images.length > 1) for (const [index, url] of images.entries()) {
    const button = element('button', { type: 'button' });
    button.setAttribute('aria-label', 'Show product photo ' + (index + 1));
    button.setAttribute('aria-pressed', String(index === 0));
    button.append(element('img', { src: url, alt: '', width: 51, height: 51, loading: 'lazy' }));
    button.addEventListener('click', () => {
      main.src = url;
      thumbs.querySelector('[aria-pressed="true"]')?.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-pressed', 'true');
    });
    thumbs.append(button);
  }
}
