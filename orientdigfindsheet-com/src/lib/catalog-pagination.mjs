export const catalogPageSize = 24;

export function categoryPageUrl(category, page = 1) {
  const path = '/categories/' + category.toLowerCase() + '/';
  return page > 1 ? path + 'page/' + page + '/' : path;
}
