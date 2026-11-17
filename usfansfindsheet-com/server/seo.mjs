const siteOrigin = 'https://usfansfindsheet.com';
const publicHosts = new Set(['usfansfindsheet.com', 'www.usfansfindsheet.com']);
const editorialRoutes = [
  '/', '/spreadsheet/', '/categories/', '/guides/how-to-buy/',
  '/faq/', '/qc/', '/image-search/', '/seo/',
];

function isPublicSite(url) {
  return publicHosts.has(url.hostname);
}

function indexRoutes(categoryList) {
  return [...editorialRoutes, ...categoryList.map(category => '/categories/' + category.slug + '/')];
}

const productSourcePattern = /^\/[\w-]+\/[\w-]+-\d+\.html$/;
let productSources;
function productSeoPath(source) {
  if (!source) return null;
  let url;
  try { url = new URL(source, 'https://findspreadsheet.com'); } catch { return null; }
  if (url.origin !== 'https://findspreadsheet.com' || !productSourcePattern.test(url.pathname)) return null;
  productSources ??= new Set(Object.values(getProductIndex()).map(product => product.source));
  return productSources.has(url.pathname) ? '/product/?source=' + encodeURIComponent(url.pathname) : null;
}

function withCanonical(html, canonical) {
  return html.replace(/<meta name="robots" content="noindex,nofollow"\s*\/?>/,
    '<link rel="canonical" href="' + esc(canonical) + '">');
}

function pageCanonical(url) {
  if (!isPublicSite(url)) return null;
  if (url.pathname === '/product/') {
    const path = productSeoPath(url.searchParams.get('source'));
    return path ? siteOrigin + path : null;
  }
  if (!indexRoutes(categories).includes(url.pathname)) return null;
  const listing = url.pathname === '/spreadsheet/' || url.pathname.startsWith('/categories/') && url.pathname !== '/categories/';
  const page = Number(url.searchParams.get('page') ?? 1);
  const query = listing && Number.isSafeInteger(page) && page > 1 ? '?page=' + page : '';
  return siteOrigin + url.pathname + query;
}

function crawlerResponse(request, url) {
  if (url.pathname !== '/robots.txt' && url.pathname !== '/sitemap.xml') return null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { allow: 'GET, HEAD' } });
  }
  const isPublic = isPublicSite(url);
  const headers = { 'cache-control': 'public, max-age=300' };
  if (url.pathname === '/robots.txt') {
    headers['content-type'] = 'text/plain; charset=utf-8';
    const body = isPublic
      ? 'User-agent: *\nDisallow:\nSitemap: ' + siteOrigin + '/sitemap.xml\n'
      : 'User-agent: *\nDisallow: /\n';
    return new Response(request.method === 'HEAD' ? null : body, { headers });
  }
  if (!isPublic) {
    return new Response(null, { status: 404, headers: { 'x-robots-tag': 'noindex, nofollow' } });
  }
  return null;
}

export function sitemapBody(categoryList, products) {
  const productPaths = products.filter(product => productSourcePattern.test(product.source))
    .map(product => '/product/?source=' + encodeURIComponent(product.source));
  const urls = [...new Set([...indexRoutes(categoryList), ...productPaths])];
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map(path => '  <url><loc>' + siteOrigin + path.replaceAll('&', '&amp;') + '</loc></url>').join('\n')
    + '\n</urlset>\n';
}


function addProductionIntegrations(html) {
  return html.replace('<!--PRODUCTION-INTEGRATIONS-->',
    '<meta name="msvalidate.01" content="E34A6C20A8A058592D1DC4B20523F6CB">' +
    '<script src="/usfans-analytics.js" defer></script>');
}
