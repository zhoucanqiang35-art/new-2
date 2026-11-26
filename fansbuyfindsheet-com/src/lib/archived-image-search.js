const source = 'https://raw.githubusercontent.com/zhoucanqiang35-art/new-2/main/loongbuyfindsheet-com/public';

export function archiveDescriptor(bitmap) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, 64, 64);
  const scale = 64 / Math.max(bitmap.width, bitmap.height);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  context.drawImage(bitmap, (64 - width) / 2, (64 - height) / 2, width, height);
  const small = document.createElement('canvas');
  const pixels = small.getContext('2d', {willReadFrequently:true});
  small.width = small.height = 8;
  pixels.drawImage(canvas, 0, 0, 8, 8);
  const gray = pixels.getImageData(0,0,8,8).data;
  const descriptor = new Uint8Array(112);
  for (let i = 0; i < 64; i++) {
    const offset = i * 4;
    descriptor[i] = Math.round(.299 * gray[offset] + .587 * gray[offset + 1] + .114 * gray[offset + 2]);
  }
  small.width = small.height = 4;
  pixels.drawImage(canvas, 0, 0, 4, 4);
  const color = pixels.getImageData(0,0,4,4).data;
  for (let i = 0; i < 48; i++) descriptor[64 + i] = color[Math.floor(i / 3) * 4 + i % 3];
  return descriptor;
}

function archiveDistance(reference, encoded) {
  const packed = atob(encoded);
  let bits = 0;
  let position = 0;
  let gray = 0;
  let color = 0;
  let accumulator = 0;
  for (let i = 0; i < packed.length; i++) {
    accumulator = (accumulator << 8) | packed.charCodeAt(i);
    bits += 8;
    while (bits >= 6) {
      bits -= 6;
      const delta = Math.abs(reference[position] - (((accumulator >> bits) & 63) * 4 + 2));
      if (position < 64) gray += delta;
      else color += delta;
      position++;
    }
  }
  return position === reference.length ? gray / 64 * .55 + color / 48 * .45 : Infinity;
}

let manifest;
export async function searchArchive(descriptor, best, isCurrent) {
  manifest ??= fetch('/main-image-shards.json').then(r => {
    if (!r.ok) throw new Error('Image catalog index unavailable');
    return r.json();
  }).catch(error => { manifest = null; throw error; });
  const { shards, targets } = await manifest;
  const activeIds = new Set(targets);
  let compared = 0;
  let failures = 0;
  for (let offset = 0; offset < shards.length && isCurrent(); offset += 4) {
    const results = await Promise.allSettled(shards.slice(offset, offset + 4).map(async shard => {
      const response = await fetch(shard.url, {signal:AbortSignal.timeout(11000)});
      if (!response.ok) throw new Error('Image index segment unavailable');
      const records = await response.json();
      if (!Array.isArray(records) || records.length !== shard.count) throw new Error('Incomplete image index segment');
      return records;
    }));
    if (!isCurrent()) break;
    for (const result of results) {
      if (result.status !== 'fulfilled') {
        failures++;
        continue;
      }
      for (const [ids, vector, url, kind] of result.value) {
        if (!['product','qc'].includes(kind)) continue;
        const active = ids.filter(id => activeIds.has(id));
        if (!active.length) continue;
        const score = archiveDistance(descriptor,vector);
        if (!Number.isFinite(score)) continue;
        compared++;
        const image = url.startsWith('/assets/qc-cache/') ? source + url : url;
        for (const id of active) {
          if (score >= (best.get(id)?.score ?? Infinity)) continue;
          best.set(id,{id,score,image,kind:kind === 'qc' ? kind : 'gallery'});
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve,0));
  }
  return {compared, failures};
}
