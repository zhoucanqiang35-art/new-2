import { savedIds } from './shopping-data.mjs';
import { card, readJson, ui } from './browser-data.mjs';

const status = document.getElementById('saved-message');
const results = document.getElementById('saved-results');

try {
  const catalog = await readJson('/data/catalog.json');
  const lookup = new Map(catalog.map((item) => [item.weidianId, item]));
  function render() {
    const products = [...savedIds()].reverse().map((id) => lookup.get(id)).filter(Boolean);
    status.replaceChildren(products.length ? ui('span', 'found', {}, products.length) : ui('span', 'noSaved'));
    results.replaceChildren(...products.map((item) => card(item)));
  }
  render();
  document.addEventListener('hipobuy:saved', render);
} catch {
  status.replaceChildren(ui('span', 'catalogError'));
}
