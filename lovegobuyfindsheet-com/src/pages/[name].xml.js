import {readFileSync} from "node:fs";
import {indexablePaths} from "../lib/seo.mjs";
export function getStaticPaths() {
  return process.env.CF_PAGES_BRANCH === "main" ? [{params: {name:"sitemap"}}] : [];
}
export function GET({site}) {
  const products = JSON.parse(readFileSync("public/data/catalog.json", "utf8"));
  const paths = [...indexablePaths, ...products.map(product => "/product/" + encodeURIComponent(product.weidianId) + "/")];
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + paths.map(path => "  <url><loc>" + new URL(path,site).href + "</loc></url>").join("\n") + "\n</urlset>\n";
  return new Response(xml, {headers: {"Content-Type":"application/xml; charset=utf-8"}});
}
