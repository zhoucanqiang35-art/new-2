import { writeFile } from 'node:fs/promises';

await writeFile('dist/client/_routes.json', JSON.stringify({
  version: 1,
  include: ['/api/qc'],
  exclude: [],
}, null, 2) + '\n');
