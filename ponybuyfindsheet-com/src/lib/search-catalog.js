import records from '../data/search-catalog.json';

export const sourceSite = 'https://findspreadsheet.com';

export { listingPhotoUrl as catalogPhotoUrl } from './listing-photos.js';

const categoryLabels = {
  shoes: 'Shoes',
  't-shirts': 'T-Shirts',
  jackets: 'Jackets',
  hoodies: 'Hoodies',
  'hoodies-sweaters': 'Hoodies & Sweaters',
  'pants-shorts': 'Pants & Shorts',
  ShortSets: 'Short Sets',
  headwear: 'Headwear',
  accessories: 'Accessories',
  jersey: 'Jerseys',
  electronics: 'Electronics',
  'other-stuff': 'Other Stuff',
};

const categoryKeywords = {
  shoes: 'footwear 鞋 鞋子',
  't-shirts': 'tee shirt tshirt 短袖 T恤',
  jackets: 'outerwear 外套 夹克',
  hoodies: 'hoodie 卫衣',
  'hoodies-sweaters': 'hoodie sweater 卫衣 毛衣',
  'pants-shorts': 'pants shorts 裤子',
  ShortSets: 'shorts set 套装',
  headwear: 'hat cap 帽子',
  accessories: 'accessory 配件',
  jersey: 'jersey 球衣',
  electronics: 'electronic 电子',
};

export function categoryName(slug) {
  return categoryLabels[slug] || slug.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const aliases = new Map(Object.entries({
  tees: 'tshirt', tee: 'tshirt', tshirts: 'tshirt', shirts: 'shirt',
  socks: 'sock', hoodies: 'hoodie', jackets: 'jacket', sneakers: 'sneaker',
  trainers: 'sneaker', trainer: 'sneaker', jeans: 'jean', hats: 'hat', caps: 'cap', jerseys: 'jersey',
  袜子: 'sock', 袜: 'sock', 球鞋: 'sneaker', 运动鞋: 'sneaker',
  短袖: 'tshirt', 卫衣: 'hoodie', 外套: 'jacket', 球衣: 'jersey',
}));

function words(value) {
  return value.normalize('NFKD').toLowerCase().replace(/\p{M}/gu, '')
    .replace(/\bt[\s-]+shirts?\b/g, 'tshirt')
    .match(/[\p{L}\p{N}]+/gu)?.map((term) => aliases.get(term) || term) ?? [];
}

function linkKey(value) {
  const cleaned = value.trim();
  if (!/^https?:\/\//i.test(cleaned) && !cleaned.startsWith('/')) return null;
  try {
    const url = new URL(cleaned, sourceSite);
    if (url.hostname === 'findspreadsheet.com' || url.hostname === 'www.findspreadsheet.com') {
      if (url.pathname.endsWith('.html')) return { id: url.pathname, key: 'path' };
    }
    const preview = url.pathname.match(/\/product\/weidian-(\d+)\/?$/)?.[1];
    const routes = url.pathname.match(/\/(?:weidian|products?\/3)\/(\d+)(?:\/|$)/i)?.[1];
    if (preview || routes) return { id: preview || routes, key: 'marketId' };
    for (const params of [url.searchParams, new URLSearchParams(url.hash.split('?')[1] || '')]) {
      for (const [key, id] of params) {
        if (/^(itemid|offerid|product_id|id)$/i.test(key) && /^\d{8,20}$/.test(id)) return { id, key: 'marketId' };
      }
    }
  } catch {
    return null;
  }
  return null;
}

export const searchProducts = records.filter(([, , , , photo]) => photo).map(([id, marketId, title, path, photo, price, views, date]) => {
  const category = path.split('/')[1];
  const categoryLabel = categoryName(category);
  const titleTerms = words(title + ' ' + path.split('/').at(-1).replace(/-\d+\.html$/, ''));
  const terms = [...titleTerms, ...words(categoryLabel + ' ' + (categoryKeywords[category] || ''))];
  return { id, marketId, title, path, photo, price, views, date, category, categoryLabel, terms, titleTerms };
});

export function buildMatcher(query) {
  const link = linkKey(query);
  if (link) return (item) => item[link.key] === link.id;
  if (/^\d+$/.test(query)) return (item) => item.marketId === query || item.id === query
    || (query.length < 8 && item.titleTerms.includes(query));
  const terms = words(query);
  if (!terms.length) return () => !query;
  return (item) => terms.every((term) => item.terms.some((word) => word.startsWith(term)));
}
