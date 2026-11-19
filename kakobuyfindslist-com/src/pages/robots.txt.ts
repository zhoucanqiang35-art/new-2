export function GET() {
  const body = process.env.CF_PAGES === "1" ? "User-agent: *\nAllow: /\nSitemap: https://kakobuyfindslist.com/sitemap.xml\n" : "User-agent: *\nDisallow: /\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
