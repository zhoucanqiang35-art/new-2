import { readFileSync } from 'node:fs';
import { chunkCount, rowBytes } from '../../../lib/visual-index.mjs';

export function getStaticPaths() {
  return Array.from({length:chunkCount},(_,index)=>({params:{chunk:String(index)}}));
}
const data = readFileSync('src/data/visual-index.bin');
if (data.length % rowBytes) throw new Error('Visual index contains an incomplete row');
const rows = data.length / rowBytes;

export function GET({params:{chunk}}) {
  const i = Number(chunk);
  const first = Math.floor(i * rows / chunkCount) * rowBytes;
  const last = Math.floor((i+1) * rows / chunkCount) * rowBytes;
  return new Response(new Uint8Array(data.subarray(first,last)),{headers:{'Content-Type':'application/octet-stream'}});
}
