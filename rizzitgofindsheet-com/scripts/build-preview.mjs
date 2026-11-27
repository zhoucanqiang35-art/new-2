import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';

const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, SITE_PREVIEW: '1', SITE_URL: 'https://rizzitgofindsheet-preview.zhoucanqiang35.chatgpt.site' },
});
if (result.status !== 0) process.exit(result.status || 1);

const outputs = readdirSync('dist');
mkdirSync('dist/client');
mkdirSync('dist/server');
for (const name of outputs) {
  if (name === '_worker.js') renameSync('dist/' + name, 'dist/server/index.js');
  else if (name === '_routes.json') rmSync('dist/' + name);
  else renameSync('dist/' + name, 'dist/client/' + name);
}
writeFileSync('dist/server/wrangler.json', JSON.stringify({
  main: './index.js',
  compatibility_date: '2026-11-26',
  assets: { directory: '../client', binding: 'ASSETS', not_found_handling: '404-page', run_worker_first: ['/api/*'] },
}, null, 2) + '\n');
