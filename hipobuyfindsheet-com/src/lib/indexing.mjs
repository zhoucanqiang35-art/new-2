const origin = 'https://hipobuyfindsheet.com';
const publicPaths = [
  '/',
  '/spreadsheet/',
  '/how-to-buy/',
  '/faq/',
  '/qc/',
  '/image-search/',
  '/seo/',
];

export const sitemapUrls = publicPaths.map((path) => new URL(path, origin).href);

export function canonicalUrl(pathname) {
  const path = pathname.endsWith('/') ? pathname : pathname + '/';
  return publicPaths.includes(path) ? new URL(path, origin).href : null;
}
