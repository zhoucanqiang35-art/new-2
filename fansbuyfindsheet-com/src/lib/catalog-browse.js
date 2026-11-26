import { catalogProducts } from './catalog-product.js';

const catalogProduct = ({path, name, image, price}) => ({path, name, image, price});
const orders = {
  latest: (a,b) => b.date - a.date,
  popular: (a,b) => b.views - a.views,
  'price-low': (a,b) => Number(a.price) - Number(b.price),
  'price-high': (a,b) => Number(b.price) - Number(a.price)
};
const pageSize = 24;

export function catalogResponse(parameters) {
  const query = (parameters.get('q') ?? '').trim().slice(0, 120).toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  const category = parameters.get('category');
  const sort = parameters.get('sort');
  const requestedPage = Number(parameters.get('page') ?? '1');
  const page = Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 999 ? requestedPage : 1;
  const matches = catalogProducts.filter(product => {
    if (terms.length) {
      const title = `${product.name} ${product.id}`.toLowerCase();
      return terms.every(term => title.includes(term));
    }
    return !category || product.path.startsWith('/' + category + '/');
  });
  if (Object.hasOwn(orders, sort)) matches.sort(orders[sort]);
  const products = matches.slice((page - 1) * pageSize, page * pageSize).map(catalogProduct);
  return Response.json({ products, page, hasNext: page * pageSize < matches.length, total: matches.length });
}
