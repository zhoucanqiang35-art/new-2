import { categories } from './catalog.js';

export const priorityPaths = [
  '/',
  '/spreadsheet/',
  '/guides/how-to-buy/',
  '/faq/',
  '/image-search/',
  '/qc/',
  ...categories.map(({ id }) => '/categories/' + id + '/'),
];
