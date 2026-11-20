export const publicOrigin = 'https://lolobuyfindslist.com';

export const productionBuild = process.env.CF_PAGES_BRANCH === 'main';
export const indexablePaths = [
  '/',
  '/spreadsheet/',
  '/categories/',
  '/categories/shoes/',
  '/categories/hoodies-sweaters/',
  '/qc/',
  '/image-search/',
  '/guides/how-to-buy/',
  '/faq/',
];
