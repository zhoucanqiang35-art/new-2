import { spawnSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';

const gallery = await readFile('public/data/galleries.json.gz');
await writeFile('public/data/galleries.json', gunzipSync(gallery));

const production = process.argv.includes('--production');
const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
  env: { ...process.env, PUBLIC_ORIENTDIG_INDEXABLE: production ? 'true' : 'false' },
  stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

const manifestPath = 'dist/server/wrangler.json';
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
await rename('dist/server/' + manifest.main, 'dist/server/index.js');
manifest.main = 'index.js';
await writeFile(manifestPath, JSON.stringify(manifest) + '\n');
if (!production) {
  const headers = 'dist/client/_headers';
  const original = await readFile(headers, 'utf8');
  await writeFile(headers, original + '\n/*\n  X-Robots-Tag: noindex, nofollow\n');
}

await rm('dist/client/data/galleries.json.gz', { force: true });
