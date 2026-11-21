import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile, writeFile} from 'node:fs/promises';
import {sourceOrigin} from '../src/lib/platform.mjs';
import {parseProducts, parseSearchResults, findNextPage} from '../src/lib/upstream.mjs';

const curl = promisify(execFile);
const catalog = new URL('../src/data/catalog.json', import.meta.url);
const previous = JSON.parse(await readFile(catalog, 'utf8'));
const pages = new Map();
function pageUrl(number) {
  return sourceOrigin + '/AllProducts/' + (number === 1 ? '' : 'list_42_' + number + '/');
}
async function readPage(number) {
  if (pages.has(number)) return pages.get(number);
  const url = pageUrl(number);
  const pending = (async () => {
    const {stdout} = await curl('curl', ['-LsS', '--max-time', '24', '--retry', '2', '--retry-delay', '1', '-w', '\n%{http_code}\t%{url_effective}', url], {maxBuffer: 3e6});
    const split = stdout.lastIndexOf('\n');
    const [status, effective] = stdout.slice(split + 1).split('\t');
    if (status === '404' || (status === '200' && effective === pageUrl(1) && number !== 1)) return null;
    if (status !== '200' || effective !== url) throw new Error('Unexpected response for page ' + number + ': ' + status);
    const html = stdout.slice(0, split);
    const known = parseProducts(html);
    const all = new Map([...parseSearchResults(html), ...known].map((item) => [item.path, item]));
    if (!all.size) return null;
    return {items: [...all.values()], next: findNextPage(html, url)};
  })();
  pages.set(number, pending);
  return pending;
}
let low = 1;
let high = 2;
while (await readPage(high)) {
  low = high;
  high *= 2;
  if (high > 1024) throw new Error('Could not identify the end of the public catalog');
}
while (high - low > 1) {
  const middle = Math.floor((high + low) / 2);
  if (await readPage(middle)) low = middle;
  else high = middle;
}
if ((await readPage(low))?.next) throw new Error('Last page still links to another catalog page');
let next = 1;
const ordered = new Array(low);
await Promise.all(Array.from({length: 6}, async () => {
  while (next <= low) {
    const index = next++;
    const page = await readPage(index);
    if (!page || (index < low && page.next !== pageUrl(index + 1))) {
      throw new Error('Missing page or unexpected pagination at ' + index);
    }
    ordered[index - 1] = page.items;
  }
}));
const oldByPath = new Map(previous.items.map((item) => [item.path, item]));
const items = [...new Map(ordered.flat().map((item) => [item.path, item])).values()].map((item) => {
  const gallery = oldByPath.get(item.path)?.gallery;
  return gallery?.length ? {...item, gallery} : item;
});
if (items.length < previous.items.length) throw new Error('The source directory shrank unexpectedly');
const featured = previous.featured.filter((id) => items.some((item) => item.id === id));
await writeFile(catalog, JSON.stringify({source: sourceOrigin, pages: low, items, featured}));
console.log(items.length + ' unique public listings across ' + low + ' pages');
