const panel = document.querySelector('[data-qc]');
const form = panel.querySelector('form');
const status = panel.querySelector('[data-qc-status]');
const results = panel.querySelector('[data-qc-results]');
const retry = panel.querySelector('[data-qc-retry]');
let activeRequest;
let currentItem;

function photoLink(photo, index) {
  const link = document.createElement('a');
  link.href = photo.display;
  link.target = '_blank';
  link.rel = 'noopener';
  if (photo.video) {
    link.textContent = 'Open warehouse video ' + (index + 1);
  } else {
    const image = document.createElement('img');
    image.src = photo.thumbnail;
    image.alt = 'Warehouse inspection photo ' + (index + 1);
    image.loading = index < 4 ? 'eager' : 'lazy';
    link.append(image);
  }
  return link;
}

async function lookup(id) {
  activeRequest?.abort();
  const controller = new AbortController();
  activeRequest = controller;
  currentItem = id;
  retry.hidden = true;
  results.replaceChildren();
  status.textContent = 'Checking Findspreadsheet for warehouse QC…';
  try {
    const response = await fetch('/api/qc?item=' + encodeURIComponent(id), { signal: controller.signal });
    if (!response.ok) throw new Error('QC lookup failed');
    const data = await response.json();
    controller.signal.throwIfAborted();
    if (data.status === 'ready' && data.images.length) {
      results.replaceChildren(...data.images.map(photoLink));
      status.textContent = data.images.length + ' warehouse QC records from Findspreadsheet.';
    } else if (data.status === 'none') {
      status.textContent = 'Findspreadsheet has no warehouse QC photos for this item at the moment.';
    } else {
      status.textContent = 'Warehouse QC for this item is still being checked. Try again later.';
      retry.hidden = false;
    }
  } catch {
    if (controller.signal.aborted) return;
    status.textContent = 'Could not load QC photos. Please try again.';
    retry.hidden = false;
  }
}

retry.addEventListener('click', () => void lookup(currentItem));
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  void lookup(form.elements.namedItem('item').value.trim());
});
if (panel.dataset.item) void lookup(panel.dataset.item);
