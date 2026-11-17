export const productionOrigin = "https://lovegobuyfindsheet.com";

export const indexablePaths = [
  "/",
  "/browse/",
  "/guide/how-to-buy/",
  "/faq/",
  "/image-search/",
  "/qc/",
  "/seo/",
];

export function isIndexableSite(site) {
  return site?.origin === productionOrigin;
}
