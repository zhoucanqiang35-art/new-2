import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

const hash = createHash('sha256');
for (const path of ['src/data/catalog.json', 'public/data/visual-photos.json',
  'public/data/visual-index.bin', 'public/data/qc-visual.json']) {
  hash.update(readFileSync(path));
}
export const imageIndexVersion = hash.digest('hex').slice(0, 20);
