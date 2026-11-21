import { readFileSync } from 'node:fs';
import { categories, coverUrl, productCategory, categoryUrl } from './settings.mjs';

export const catalog = JSON.parse(readFileSync('public/data/catalog.json', 'utf8'));
const picks = {
  'shoes': '4501',
  'hoodies-sweaters': '7358',
  't-shirts': '7352',
  'jackets': '8352',
  'pants-shorts': '8650',
  'accessories': '8384',
  'bags': '7979',
  'headwear': '8939',
  'jersey': '7653',
  'electronics': '8704',
  'ShortSets': '8395',
  'other-stuff': '5661',
};
const descriptions = {
  shoes: 'Browse trainers, running shoes and other footwear. Check the seller measurements and sizing chart before ordering.',
  'hoodies-sweaters': 'Compare zip hoodies, pullovers, crewnecks and knitwear. Check garment measurements, material and fit.',
  't-shirts': 'Browse graphic tees, training tops and everyday basics. Compare cuts, fabric and seller photos.',
  jackets: 'Explore shells, denim and heavier outerwear. Check sizing and consider packed weight before shipping.',
  'pants-shorts': 'Find trousers, shorts and other bottoms. Compare waist, rise and length with a pair you already own.',
  accessories: 'Browse small additions such as socks, belts and eyewear. Check measurements and what the listing includes.',
  bags: 'Explore backpacks, crossbody bags and handbags. Check dimensions, compartments and strap length.',
  headwear: 'Compare caps, beanies and other headwear. Look for circumference and adjustment details.',
  jersey: 'Browse jerseys and training kits. Confirm which pieces, printing and sizes are included.',
  electronics: 'Compare electronic accessories and devices. Check compatibility and the carrier terms for items with batteries.',
  ShortSets: 'Browse matching outfits and sportswear sets. Confirm each included piece and its measurements.',
  'other-stuff': 'Explore finds that fall outside the main clothing and footwear categories. Review the listing for materials and contents.',
};

export const categoryCards = Object.entries(categories).map(([key, name]) => {
  const products = catalog.filter(row => productCategory(row) === key);
  const photo = products.find(row => row.id === picks[key] && Number(row.price) > 0)
    ?? products.find(row => row.image && Number(row.price) > 0);
  return { key, name, description: descriptions[key], count: products.length, href: categoryUrl(key), image: coverUrl(photo), price: photo.price };
});
