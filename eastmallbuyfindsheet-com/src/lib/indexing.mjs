import {categoryLanding, featuredCategories, indexedProductIds, indexedProductPath} from './landing-paths.mjs';

export const siteOrigin = 'https://eastmallbuyfindsheet.com';

export const indexablePaths = [
  '/',
  '/spreadsheet/',
  '/guides/how-to-buy/',
  '/categories/',
  '/faq/',
  '/image-search/',
  '/qc/',
  ...featuredCategories.map(categoryLanding),
  ...indexedProductIds.map(indexedProductPath),
];
