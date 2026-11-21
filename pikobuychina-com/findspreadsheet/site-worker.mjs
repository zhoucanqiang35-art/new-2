import {paths, groups, binaries} from 'embedded-site';
import {catalogApi} from './worker.mjs';

const headers = {'X-Robots-Tag':'noindex, follow','Cache-Control':'no-cache'};
const types = {
  html:'text/html; charset=utf-8', js:'text/javascript; charset=utf-8', css:'text/css; charset=utf-8',
  json:'application/json; charset=utf-8', txt:'text/plain; charset=utf-8', xml:'application/xml',
  png:'image/png', webp:'image/webp', jpg:'image/jpeg', svg:'image/svg+xml', bin:'application/octet-stream',
};
const bytes = (encoded) => Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
const unpack = (encoded) => new Blob([bytes(encoded)]).stream().pipeThrough(new DecompressionStream('gzip'));
const pages = new Map();
function loadGroup(key) {
  if (!pages.has(key)) {
    if (pages.size > 4) pages.delete(pages.keys().next().value);
    const loaded = new Response(unpack(groups[key])).json().catch((error) => {
      pages.delete(key);
      throw error;
    });
    pages.set(key, loaded);
  }
  return pages.get(key);
}
async function asset(path, {status = 200, head = false} = {}) {
  const type = types[path.split('.').at(-1)] || 'application/octet-stream';
  let body = null;
  if (!head) {
    if (Object.hasOwn(binaries,path)) body = unpack(binaries[path]);
    else body = (await loadGroup(paths[path]))[path];
  }
  return new Response(body,{status, headers:{...headers,'Content-Type':type}});
}
const has = (path) => Object.hasOwn(paths,path) || Object.hasOwn(binaries,path);

export default {
  async fetch(request) {
    const api = catalogApi(request,asset);
    if (api) return api;
    if (!['GET','HEAD'].includes(request.method)) return new Response('Method Not Allowed',{status:405,headers});
    const path = new URL(request.url).pathname;
    const options = {head:request.method==='HEAD'};
    if (has(path)) return asset(path,options);
    const html = path.replace(/\/$/,'') + '/index.html';
    if (has(html)) return asset(html,options);
    return asset('/404.html',{status:404,...options});
  },
};
