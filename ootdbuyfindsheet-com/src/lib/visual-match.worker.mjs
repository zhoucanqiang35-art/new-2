import { channels, chunkCount, rowBytes } from './visual-index.mjs';

const buffers = new Map();
let active;

function getChunk(index, signal) {
  if (buffers.has(index)) return Promise.resolve(buffers.get(index));
  return fetch('/data/visual/' + index + '.bin',{signal}).then(async response=>{
    if (!response.ok) throw new Error('Image index unavailable');
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength % rowBytes) throw new Error('Invalid image index');
    buffers.set(index,buffer);
    return buffer;
  });
}

function scoreChunk(input, buffer, best) {
  const rows = new Uint8Array(buffer);
  const view = new DataView(buffer);
  for (let offset=0;offset<rows.length;offset+=rowBytes) {
    const product = view.getUint16(offset,true);
    let score = 0;
    for (let channel=0;channel<channels;channel+=1) {
      const difference = input[channel] - rows[offset+2+channel];
      score += difference * difference;
    }
    if (score < (best.get(product) ?? Infinity)) best.set(product,score);
  }
}

self.onmessage = async ({data})=>{
  active?.abort();
  active = null;
  if (!data.input) return;
  const request = new AbortController();
  active = request;
  const {run,input} = data;
  const best = new Map();
  const output = ()=>[...best].sort((a,b)=>a[1]-b[1]).slice(0,24).map(([id])=>id);
  let completed = 0;
  try {
    for (let first=0;first<chunkCount;first+=2) {
      await Promise.all([first,first+1].map(async index=>{
        const chunk = await getChunk(index, request.signal);
        if (request.signal.aborted) return;
        scoreChunk(input,chunk,best);
        completed += 1;
        self.postMessage({run,completed,total:chunkCount,choices:output()});
      }));
      if (request.signal.aborted) return;
    }
  } catch {
    if (!request.signal.aborted) {
      request.abort();
      self.postMessage({run,error:true});
    }
  }
};
