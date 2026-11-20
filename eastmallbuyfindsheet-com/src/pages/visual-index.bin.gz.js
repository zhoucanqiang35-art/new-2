import {readFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';

export function GET() {
  const index = readFileSync('public/data/visual-index.bin');
  return new Response(gzipSync(index, {level: 9}), {
    headers: {'Content-Type': 'application/gzip'},
  });
}
