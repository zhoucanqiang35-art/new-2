import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const worker = 'dist/client/_worker.js';
await cp('dist/server', worker, {
  recursive: true,
  filter: path => !path.endsWith('.map') && !path.endsWith('/wrangler.json'),
});
for (const entry of await readdir(worker, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !/\.m?js$/.test(entry.name)) continue;
  const file = join(entry.parentPath, entry.name);
  const code = await readFile(file, 'utf8');
  const stripped = code.replace(/^\/\/# sourceMappingURL=.*$/gm, '');
  if (stripped !== code) await writeFile(file, stripped);
}
await writeFile('dist/client/_routes.json', JSON.stringify({
  version: 1,
  include: ['/products/*', '/item', '/item/*', '/api/qc', '/api/qc/*'],
  exclude: [],
}) + '\n');

// The Astro adapter writes a redirect for Workers CLI commands. Pages uses the root Pages config.
await rm('.wrangler/deploy/config.json', { force: true });
