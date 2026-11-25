import {savedPaths, toggleSaved} from './shopping.mjs';

export function saveButton(path) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'product-save';
  button.dataset.savePath = path;
  button.textContent = 'Save product';
  button.setAttribute('aria-pressed', String(savedPaths().includes(path)));
  return button;
}

export function enableSaving() {
  const status = document.createElement('p');
  status.className = 'sr';
  status.setAttribute('role', 'status');
  document.body.append(status);

  function refresh() {
    const saved = new Set(savedPaths());
    for (const button of document.querySelectorAll('button[data-save-path]')) {
      button.setAttribute('aria-pressed', String(saved.has(button.dataset.savePath)));
    }
  }

  document.addEventListener('click', ({target}) => {
    const button = target instanceof Element && target.closest('button[data-save-path]');
    if (!button) return;
    try {
      toggleSaved(button.dataset.savePath);
      const saved = savedPaths().includes(button.dataset.savePath);
      status.textContent = saved ? 'Product saved.' : 'Product removed from saved products.';
      refresh();
      window.dispatchEvent(new Event('saved-products-change'));
    } catch {
      status.textContent = 'Saved products are unavailable in this browser.';
    }
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== 'pikobuy-saved' && event.key !== null) return;
    refresh();
    window.dispatchEvent(new Event('saved-products-change'));
  });
  refresh();
}
