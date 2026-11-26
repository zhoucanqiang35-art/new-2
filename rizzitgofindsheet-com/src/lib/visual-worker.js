// Findspreadsheet snapshot. Each row is a little-endian catalog position
// followed by the RGB pixels from an 8 × 8 thumbnail.
const gridSize = 8;
const channels = gridSize * gridSize * 3;
const rowBytes = Uint16Array.BYTES_PER_ELEMENT + channels;
let indexRequest;

function loadIndex() {
  indexRequest ??= fetch('/data/visual-index-v1.bin').then(async (response) => {
    if (!response.ok) throw new Error('Image index unavailable');
    const buffer = await response.arrayBuffer();
    if (!buffer.byteLength || buffer.byteLength % rowBytes) {
      throw new Error('Invalid image index');
    }
    return { bytes: new Uint8Array(buffer), rows: new DataView(buffer) };
  }).catch((error) => {
    indexRequest = undefined;
    throw error;
  });
  return indexRequest;
}

function closestMatches(input, { bytes, rows }) {
  const best = new Map();
  for (let offset = 0; offset < bytes.length; offset += rowBytes) {
    const product = rows.getUint16(offset, true);
    let distance = 0;
    for (let channel = 0; channel < channels; channel += 1) {
      const delta = input[channel] - bytes[offset + 2 + channel];
      distance += delta * delta;
    }
    if (!best.has(product) || distance < best.get(product)) best.set(product, distance);
  }
  return [...best].sort((a, b) => a[1] - b[1]).slice(0, 24).map(([product]) => product);
}

self.addEventListener('message', async ({ data }) => {
  try {
    const index = await loadIndex();
    const matches = closestMatches(data.pixels, index);
    self.postMessage({ id: data.id, matches });
  } catch {
    self.postMessage({ id: data.id, error: 'The photo index could not load. Try again.' });
  }
});
