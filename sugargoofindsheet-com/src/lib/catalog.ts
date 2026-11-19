export interface Product {
  id: string;
  weidianId: string;
  name: string;
  image: string;
  sourcePath: string;
  category: string;
  price: string;
}

import referenceRates from '../../public/data/rates.json';
export const signup = 'https://www.sugargoo.com/register?memberId=3914891758646228603';
export const registration = signup;
export const upstream = 'https://findspreadsheet.com';
export const categories = [
  ['shoes', 'Shoes'], ['hoodies-sweaters', 'Hoodies & sweaters'], ['t-shirts', 'T-shirts'],
  ['jackets', 'Jackets'], ['pants-shorts', 'Pants & shorts'], ['jersey', 'Jerseys'],
  ['accessories', 'Accessories'], ['headwear', 'Headwear'], ['ShortSets', 'Sets'],
  ['electronics', 'Electronics'], ['other-stuff', 'Other finds'],
];
const labels = new Map(categories);
const currencyRates: Record<string, number> = referenceRates.rates;
export const highlighted = ['4502', '8648', '7357', '7652', '8477', '7953', '7079', '9018'];
export const featuredImage = (product: Product) => highlighted.includes(product.id) ? '/featured/' + product.id + '.webp' : product.image;

export const categoryLabel = (slug: string) => labels.get(slug) ?? 'Other finds';
export const detailsUrl = (id: string) => '/product/?id=' + encodeURIComponent(id);
export const sourceUrl = (product: Product) => new URL(product.sourcePath, upstream).href;

export function priceValue(price: string) {
  const value = Number(price);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function selectedCurrency() {
  try {
    const preferred = localStorage.getItem('sugargoo-browse-currency') ?? 'USD';
    return Object.hasOwn(currencyRates, preferred) ? preferred : 'USD';
  } catch {
    return 'USD';
  }
}

export function priceLabel(price: string, currency = selectedCurrency()) {
  const value = priceValue(price);
  if (value === null) return 'Price on listing';
  const code = Object.hasOwn(currencyRates, currency) ? currency : 'USD';
  const locale = typeof document === 'undefined' ? 'en-US' : document.documentElement.lang || 'en-US';
  return new Intl.NumberFormat(locale, {style:'currency', currency:code}).format(value * currencyRates[code]);
}

export function usdPrice(price: string) {
  const value = priceValue(price);
  return value === null ? null : value * referenceRates.rates.USD;
}

export function sellerUrl(id: string) {
  return 'https://weidian.com/item.html?itemID=' + encodeURIComponent(id);
}

export function buyUrl(id: string) {
  const params = new URLSearchParams({ productLink: sellerUrl(id), memberId: '1771881989097259278' });
  return 'https://www.sugargoo.com/products?' + params;
}

const loaded = new Map<string, Promise<unknown>>();
export function getData<T>(file: string): Promise<T> {
  if (!loaded.has(file)) {
    loaded.set(file, fetch('/data/' + file).then(response => {
      if (!response.ok) throw new Error('Unable to load ' + file);
      return response.json();
    }).catch(error => {
      loaded.delete(file);
      throw error;
    }));
  }
  return loaded.get(file) as Promise<T>;
}

export async function galleryPhotos(product: Product) {
  const key = product.weidianId.slice(0, 4);
  const records = await getData<Record<string, string[]>>('gallery-' + key + '.json');
  return [...new Set([product.image, ...(records[product.weidianId] ?? [])])];
}
