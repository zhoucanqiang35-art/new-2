import {productCard} from './catalog-client.mjs';
import {detailPath} from './platform.mjs';
import {savedPaths, toggleSaved} from './shopping.mjs';

export function setupSavedProducts(root) {
  const status = root.querySelector('[role=status]');
  const grid = root.querySelector('.catalog-grid');
  const saved = savedPaths();
  if (!saved.length) {
    status.textContent = 'No saved products yet.';
    return;
  }
  fetch('/catalog-data.json')
    .then((response) => response.ok ? response.json() : {items:[]})
    .catch(() => ({items:[]}))
    .then(({items}) => {
      const byPath = new Map(items.map((product) => [product.path,product]));
      for (const path of saved) {
        const item = byPath.get(path);
        const card = item ? productCard(item) : document.createElement('article');
        if (!item) {
          card.className = 'catalog-card';
          const link = document.createElement('a');
          link.href = detailPath({path});
          link.textContent = 'Open saved listing';
          card.append(link);
        }
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'button secondary';
        remove.textContent = 'Remove saved product';
        remove.addEventListener('click', () => {
          toggleSaved(path);
          card.remove();
          if (!grid.children.length) status.textContent = 'No saved products yet.';
        });
        card.append(remove);
        grid.append(card);
      }
      status.textContent = '';
    });
}
