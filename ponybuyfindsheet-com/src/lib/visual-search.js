export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_PIXELS = 36_000_000;
const BORDER_PROBE_SIZE = 96;
let loadedIndex;

function searchError(code, message) {
  return Object.assign(new Error(message), { code });
}

async function openImage(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { image: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      // The image element supports some formats that ImageBitmap cannot decode.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { image, width: image.naturalWidth, height: image.naturalHeight, release: () => URL.revokeObjectURL(url) };
  } catch {
    URL.revokeObjectURL(url);
    throw searchError('decode-failed', 'This image could not be opened. Try a JPEG, PNG or WebP.');
  }
}

function drawImage(image, area, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.imageSmoothingQuality = 'high';
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, width, height);
  return context.getImageData(0, 0, width, height).data;
}

function trimBorder(image, area) {
  const scale = Math.min(1, BORDER_PROBE_SIZE / Math.max(area.width, area.height));
  const width = Math.round(area.width * scale);
  const height = Math.round(area.height * scale);
  if (width < 12 || height < 12) return null;
  const data = drawImage(image, area, width, height);
  const first = data.subarray(0, 3);

  function matchesBorder(x, y) {
    const start = (y * width + x) * 4;
    return Math.abs(data[start] - first[0]) + Math.abs(data[start + 1] - first[1])
      + Math.abs(data[start + 2] - first[2]) < 54;
  }

  if (![[width - 1, 0], [0, height - 1], [width - 1, height - 1]].every(([x, y]) => matchesBorder(x, y))) {
    return null;
  }

  function isBorderLine(length, point) {
    let matching = 0;
    for (let index = 0; index < length; index += 1) {
      if (matchesBorder(...point(index))) matching += 1;
    }
    return matching / length >= 0.97;
  }

  let left = 0;
  let right = width - 1;
  let top = 0;
  let bottom = height - 1;
  while (left < width / 4 && isBorderLine(height, (y) => [left, y])) left += 1;
  while (right > width * 0.75 && isBorderLine(height, (y) => [right, y])) right -= 1;
  while (top < height / 4 && isBorderLine(width, (x) => [x, top])) top += 1;
  while (bottom > height * 0.75 && isBorderLine(width, (x) => [x, bottom])) bottom -= 1;
  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;

  if (cropWidth * cropHeight > width * height * 0.9) return null;
  return {
    x: left * area.width / width,
    y: top * area.height / height,
    width: cropWidth * area.width / width,
    height: cropHeight * area.height / height,
  };
}

function describe(grid, size, channels) {
  const luminance = new Float32Array(size * size);
  const colors = new Float32Array(size * size * 2);
  for (let cell = 0; cell < luminance.length; cell += 1) {
    const [red, green, blue] = grid.subarray(cell * channels, cell * channels + 3);
    luminance[cell] = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
    colors[cell * 2] = (red - green) / 255;
    colors[cell * 2 + 1] = (blue - green) / 255;
  }

  const mean = luminance.reduce((sum, value) => sum + value, 0) / luminance.length;
  const variance = luminance.reduce((sum, value) => sum + (value - mean) ** 2, 0) / luminance.length;
  const spread = Math.max(0.12, Math.sqrt(variance));
  const pattern = luminance.map((value) => (value - mean) / spread);
  return { luminance, colors, pattern };
}

function distance(query, indexed, size) {
  let brightness = 0;
  let chroma = 0;
  let structure = 0;
  let edges = 0;
  const count = size * size;

  for (let cell = 0; cell < count; cell += 1) {
    brightness += Math.abs(query.luminance[cell] - indexed.luminance[cell]);
    chroma += Math.abs(query.colors[cell * 2] - indexed.colors[cell * 2]);
    chroma += Math.abs(query.colors[cell * 2 + 1] - indexed.colors[cell * 2 + 1]);
    const difference = query.pattern[cell] - indexed.pattern[cell];
    structure += Math.min(3, Math.abs(difference));
    if (cell % size < size - 1) edges += Math.abs(difference - query.pattern[cell + 1] + indexed.pattern[cell + 1]);
    if (cell < count - size) edges += Math.abs(difference - query.pattern[cell + size] + indexed.pattern[cell + size]);
  }

  return (brightness * 0.44 + chroma * 0.20 + structure * 0.18 + edges * 0.08) / count;
}

async function getIndex() {
  if (!loadedIndex) {
    loadedIndex = import('../data/image-index.json').then(({ default: index }) => ({
      size: index.size,
      entries: index.entries.map(([id, url, bytes]) => {
        const rgb = Uint8Array.from(atob(bytes), (character) => character.charCodeAt(0));
        return { id, url, descriptor: describe(rgb, index.size, 3) };
      }),
    })).catch(() => {
      loadedIndex = null;
      throw searchError('index-unavailable', 'The image index could not load. Please try again.');
    });
  }

  return loadedIndex;
}

function rankIndex(entries, size, original, crops, limit, reference) {
  const best = new Map();

  for (const entry of entries) {
    let loss = distance(original, entry.descriptor, size);
    for (const cropped of crops) {
      loss = Math.min(loss, distance(cropped, entry.descriptor, size) + 0.018);
    }
    const previous = best.get(entry.id);
    if (!previous || loss < previous.loss || entry === reference) {
      best.set(entry.id, { id: entry.id, url: entry.url, loss });
    }
  }

  return [...best.values()]
    .sort((first, second) => first.loss - second.loss || Number(second.id === reference?.id) - Number(first.id === reference?.id))
    .slice(0, limit)
    .map(({ id, url, loss }) => ({ id, url, score: Math.exp(-3.4 * loss) }));
}

export async function searchByItem(id, { limit = 12, photo = '' } = {}) {
  const { entries, size } = await getIndex();
  const photos = entries.filter((entry) => entry.id === String(id));
  const reference = photos.find((entry) => entry.url === photo) ?? photos[0];
  if (!reference) {
    throw searchError('item-unavailable', 'The product photo is unavailable for image search.');
  }

  return rankIndex(entries, size, reference.descriptor, [], limit, reference);
}

/**
 * Rank product photos in the preview catalog. The uploaded image stays in this browser.
 * Scores represent relative visual similarity on a 0–1 scale.
 */
export async function searchByImage(file, { limit = 12 } = {}) {
  if (!(file instanceof Blob) || !file.size || (file.type && !file.type.startsWith('image/'))) {
    throw searchError('invalid-type', 'Choose a supported image file.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw searchError('file-too-large', 'Choose an image no larger than 15 MB.');
  }

  const { image, width, height, release } = await openImage(file);
  try {
    if (!width || !height || width * height > MAX_PIXELS) {
      throw searchError('pixel-limit', 'Choose an image smaller than 36 megapixels.');
    }
    const { entries, size } = await getIndex();
    const area = { x: 0, y: 0, width, height };
    const trimmed = trimBorder(image, area);
    const original = describe(drawImage(image, area, size, size), size, 4);
    // A screenshot margin can merge with a listing photo's own white background.
    // Compare a looser crop too, so some of the listing background can remain.
    const crops = trimmed ? [0.7, 1].map((amount) => {
      const crop = {
        x: trimmed.x * amount,
        y: trimmed.y * amount,
        width: width - (width - trimmed.width) * amount,
        height: height - (height - trimmed.height) * amount,
      };
      return describe(drawImage(image, crop, size, size), size, 4);
    }) : [];
    return rankIndex(entries, size, original, crops, limit);
  } finally {
    release();
  }
}
