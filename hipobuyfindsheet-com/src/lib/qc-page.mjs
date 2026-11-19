import { productUrl } from './catalog.mjs';
import { parseId, element, qcLookup, renderQc, ui } from './browser-data.mjs';

const form = document.getElementById('qc-form');
const input = form.elements.namedItem('id');
const result = document.getElementById('qc-result');
let lastRequest = 0;

async function run() {
  const id = parseId(input.value);
  const request = ++lastRequest;
  if (!id) {
    result.replaceChildren(ui('p', 'qcInvalid'));
    return;
  }
  result.replaceChildren(ui('p', 'qcCheck'));
  try {
    const entry = await qcLookup(id);
    if (request !== lastRequest) return;
    result.replaceChildren(ui('h2', 'qcHeading', {}, id));
    renderQc(result, id, entry);
    result.append(element('div', {className: 'tool-samples'}, [
      ui('a', 'openProduct', {href: productUrl(id)}),
    ]));
  } catch {
    if (request !== lastRequest) return;
    result.replaceChildren(ui('p', 'qcError'));
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const id = parseId(input.value);
  if (id) history.replaceState(null, '', '?id=' + id);
  run();
});
const initial = new URLSearchParams(location.search).get('id');
if (initial) {
  input.value = initial;
  run();
}
