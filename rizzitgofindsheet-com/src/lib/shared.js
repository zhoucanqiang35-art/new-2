import exchange from '../data/exchange-rates.json' with { type: 'json' };
import imageOverrides from './image-overrides.json' with { type: 'json' };

export const source = 'https://findspreadsheet.com';
export const join = 'https://rizzitgo.com/?rno=129A77';
export const sampleId = '7872190238';
export const categoryNames = {
  shoes: 'Shoes', 'hoodies-sweaters': 'Hoodies & sweaters', 't-shirts': 'T-shirts',
  jackets: 'Jackets', 'pants-shorts': 'Pants & shorts', accessories: 'Accessories',
  headwear: 'Headwear', jersey: 'Jerseys', ShortSets: 'Short sets',
  electronics: 'Electronics', 'other-stuff': 'Other finds',
};
export const categorySlug = (key) => key === 'ShortSets' ? 'short-sets' : key;
export const productImage = (item) => imageOverrides[item.image] || item.image;
export const productPath = (id) => '/products/' + id + '/';
// 25 Nov 2026 ECB euro reference rates. The catalog stores seller prices in CNY.
export const rateDate = '25 Nov 2026';
export const currencies = Object.keys(exchange.rates);
const formatters = new Map();
export function price(yuan, currency = 'USD', language = 'en') {
  if (!Number.isFinite(yuan) || yuan <= 0 || !Object.hasOwn(exchange.rates, currency)) return 'Price unavailable';
  const key = language + ':' + currency;
  if (!formatters.has(key)) formatters.set(key, new Intl.NumberFormat(language === 'en' ? 'en-US' : language, {
    style: 'currency', currency, currencyDisplay: currency === 'USD' ? 'symbol' : 'code',
  }));
  return formatters.get(key).format(yuan * exchange.rates[currency] / exchange.rates.CNY);
}
export function buy(id) {
  if (!/^\d{8,15}$/.test(id)) throw new TypeError('Invalid Weidian product ID');
  return 'https://rizzitgo.com/detail-page/?goodsId=' + id + '&source=3';
}
export const latest = (a, b) => b.date - a.date;
export const formats = {
  latest,
  popular: (a, b) => b.views - a.views || latest(a, b),
  'price-low': (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity) || latest(a, b),
  'price-high': (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity) || latest(a, b),
};
export function selectProducts(products, { query = '', sort = 'latest', category = '' } = {}) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return products.filter((item) => {
    if (category && item.category !== category) return false;
    const haystack = (item.name + ' ' + item.id + ' ' + item.path.replaceAll('-', ' ')).toLowerCase();
    return words.every((word) => haystack.includes(word));
  }).sort(Object.hasOwn(formats, sort) ? formats[sort] : latest);
}
