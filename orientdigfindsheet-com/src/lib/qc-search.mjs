import { findItemId, itemLookupUrl } from './catalog.mjs';
import { showQc } from './qc.mjs';
import { warehouseSample } from './orientdig.mjs';

const form = document.querySelector('#qc-form');
const input = document.querySelector('#qc-query');
const error = document.querySelector('#qc-error');
const output = form.parentElement.querySelector('[data-qc-results]');
const actions = document.querySelector('#qc-actions');
const itemLink = document.querySelector('#qc-item');

function check() {
  const id = findItemId(input.value);
  error.hidden = Boolean(id);
  actions.hidden = !id;
  if (!id) {
    output.hidden = true;
    error.textContent = 'Enter a Weidian item ID or a supported product URL.';
    return;
  }
  const params = new URLSearchParams({ id });
  history.replaceState(null, '', '/qc/?' + params);
  itemLink.href = itemLookupUrl(id);
  showQc(id,output);
}

form.addEventListener('submit', event => {
  event.preventDefault();
  check();
});
document.querySelector('#qc-example').addEventListener('click', () => {
  input.value = warehouseSample;
  check();
});
const query = new URLSearchParams(location.search).get('id');
if (query) {
  input.value = query;
  check();
}
