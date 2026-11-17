import { isIndexableSite } from "../lib/seo.mjs";

export function GET({ site }) {
  const rules = isIndexableSite(site)
    ? `User-agent: *\nAllow: /\nSitemap: ${new URL("/sitemap.xml", site).href}\n`
    : "User-agent: *\nDisallow: /\n";
  return new Response(rules, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
