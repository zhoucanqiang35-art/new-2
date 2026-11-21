import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';

const run = promisify(execFile);
const filename = 'public/data/qc.json';
const catalog = JSON.parse(await readFile('public/data/catalog.json', 'utf8'));
const saved = JSON.parse(await readFile(filename, 'utf8'));
const ids = [...new Set(process.argv.slice(2))];
if (!ids.length || ids.some(id => !/^\d{5,20}$/.test(id) || !catalog.some(item => item.weidianId === id))) {
  throw new Error('Supply one or more Weidian IDs from the catalog.');
}

const media = 'public/media/live-qc';
await mkdir(media, { recursive: true });

async function get(url) {
  const { stdout } = await run('curl', ['-fLsS', '--max-time', '18', url], {
    encoding: 'buffer', maxBuffer: 8 * 1024 * 1024,
  });
  return stdout;
}

for (const id of ids) {
  try {
    const url = 'https://findspreadsheet.com/qcradar-qc.php?item=' + id;
    const data = JSON.parse((await get(url)).toString());
    if (data.platform !== 'weidian' || String(data.itemId) !== id || data.degraded === true) continue;
    if (data.status === 'ready' && saved[id]?.status !== 'ready') {
      const photos = [];
      for (const entry of (data.images ?? []).filter(image => !image.isVideo).slice(0, 12)) {
        if (typeof entry.mediaId !== 'string' || !/^[a-z0-9-]{1,80}$/i.test(entry.mediaId)) continue;
        const image = new URL(entry.display);
        if (image.protocol !== 'https:' || image.username || image.password) continue;
        const ext = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }[entry.mimeType];
        if (!ext) continue;
        const basename = id + '-' + entry.mediaId + '.' + ext;
        await writeFile(media + '/' + basename, await get(image.href));
        photos.push({ url: '/media/live-qc/' + basename, source: entry.agentPlatform ?? '' });
      }
      if (photos.length) saved[id] = { status: 'ready', photos };
    } else if (data.status === 'none' && saved[id]?.status !== 'ready') {
      saved[id] = { status: 'none', photos: [] };
    } else if (data.status === 'pending' && !saved[id]) {
      saved[id] = { status: 'pending', photos: [] };
    }
    console.log(id, data.status, saved[id]?.photos.length ?? 0);
  } catch {
    console.warn(id, 'refresh unavailable');
  }
}

const staging = filename + '.tmp';
await writeFile(staging, JSON.stringify(saved) + '\n');
await rename(staging, filename);
