export { formatMoney as formatPrice } from './currency.js';
import featured from '../data/featured.json';

export const registrationUrl = 'https://itaobuy.allapp.link/db7krg90b4mnp0vmfdv0';
export const { categories, highlights, total, qcCount } = featured;
export const number = new Intl.NumberFormat('en-US');
export const sourceUrl = (product) => 'https://weidian.com/item.html?' + new URLSearchParams({ itemID: product.id });
export const buyUrl = (product) => 'https://www.itaobuy.com/product-detail?' + new URLSearchParams({ url: sourceUrl(product) });
export const productPath = (product) => '/products/' + product.id + '/';
