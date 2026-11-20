export const featuredCategories = ['shoes', 'hoodies-sweaters', 'jackets'];

export const indexedProductIds = [
  '7857139190', '7872207856', '7866625981', '7873275234', '7871260262',
  '7857789312', '7872043180', '7872745692', '7853385361', '7405460467',
  '7868738327', '7869064925', '7854168601', '7869969978', '7866512819',
  '7868813833', '7403509728', '7403416956',
];

const indexedProducts = new Set(indexedProductIds);
export const indexedProductPath = (id) => '/products/' + id + '/';
export const hasProductLanding = (id) => indexedProducts.has(id);
export const categoryLanding = (key) => featuredCategories.includes(key) ? '/categories/' + key + '/' : '';
export const categoryFinds = (key) => '/spreadsheet/?category=' + encodeURIComponent(key);
