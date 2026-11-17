import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';

// Astro pre-renders all pages; the Worker only handles the QC endpoint.
await rm('dist/server', { recursive: true, force: true });
await mkdir('dist/server', { recursive: true });
await copyFile('worker/index.js', 'dist/server/index.js');
await copyFile('worker/qc-last-checks.js', 'dist/server/qc-last-checks.js');
await writeFile('dist/server/wrangler.json', JSON.stringify({
 name: 'loongbuy-finds-preview',
 main: './index.js',
 compatibility_date: '2026-10-01',
 assets: { directory: '../client', binding: 'ASSETS' },
}, null, 2) + '\n');
