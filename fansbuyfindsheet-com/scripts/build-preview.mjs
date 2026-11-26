import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { build } from 'esbuild';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8'
};
const assets = {};
for (const name of await readdir('dist', { recursive: true })) {
  const type = types[extname(name)];
  if (!type) continue;
  const body = await readFile(join('dist', name));
  const route = '/' + name.replace(/index\.html$/, '');
  assets[route] = { type, base64: body.toString('base64') };
}

await mkdir('dist/server', { recursive: true });
await writeFile('dist/preview-assets.js', 'export default ' + JSON.stringify(assets) + ';\n');
await build({
  entryPoints: ['scripts/preview-worker.js'],
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  outfile: 'dist/server/index.js'
});
