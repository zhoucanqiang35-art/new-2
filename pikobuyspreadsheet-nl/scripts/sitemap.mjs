import { readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
const root = 'dist';
async function walk(dir) {
  const entries = await readdir(dir, {withFileTypes:true});
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(join(dir,e.name)) : e.name === 'index.html' ? [join(dir,e.name)] : []))).flat();
}
const pages = (await walk(root)).map(p => 'https://pikobuyspreadsheet.at/' + relative(root,p).split(sep).join('/').replace(/index\.html$/, '')).sort();
await writeFile(join(root,'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + pages.map(p => `  <url><loc>${p}</loc></url>`).join('\n') + '\n</urlset>\n');
console.log(`Sitemap contains ${pages.length} pages`);
