export const productionOrigin = "https://lovegobuyfindsheet.com";
export const indexablePaths = ["/", "/browse/", "/guide/how-to-buy/", "/faq/", "/image-search/", "/qc/", "/seo/"];
export function isIndexableSite(site) { return site?.origin === productionOrigin; }
export function isIndexablePath(path) {
  return indexablePaths.includes(path) || /^\/product\/\d{5,20}\/$/.test(path);
}
