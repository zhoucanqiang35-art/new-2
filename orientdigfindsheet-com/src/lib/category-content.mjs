import { categories } from './catalog.mjs';

export const categoryContent = {
  shoes: 'Browse footwear from the Weidian catalog. Compare the seller’s size chart, sole profile, and photos of the exact colorway before choosing a pair.',
  'hoodies-sweaters': 'Browse fleece, knits, and pullovers. Compare chest width, body length, and sleeve length with a garment you already own.',
  't-shirts': 'Find short-sleeved tops and graphic tees. Check the seller’s measurements and look for close-up photos of the print and neckline.',
  jackets: 'Browse outerwear across the catalog. Review the lining and closures and leave room in your measurements for layering.',
  'pants-shorts': 'Browse trousers, joggers, and shorts. Compare waist, inseam, and rise in the seller’s size chart before picking a size.',
  accessories: 'Explore bags, small carry items, and other accessories. Compare measurements, materials, and photos of the hardware on the original listing.',
  headwear: 'Browse caps, hats, and other headwear. Check circumference and closure type, especially when only one size is listed.',
  jersey: 'Explore jersey listings and use the exact team, season, or colorway to narrow your search. Review the name set and sizing on the seller page.',
  electronics: 'Browse electronics listings. Verify the exact model, included accessories, plug type, and any battery shipping restrictions before ordering.',
  ShortSets: 'Browse matching sets. Confirm which pieces the listing includes and check the size chart for each garment.',
  'other-stuff': 'Browse items outside the main clothing and accessory categories. Open the original listing to confirm dimensions, materials, and included pieces.',
};

export const categoryUrl = key => '/categories/' + key.toLowerCase() + '/';

export const categoryEntries = Object.entries(categories).map(([key, title]) => ({
  key, title, href: categoryUrl(key), intro: categoryContent[key],
}));
