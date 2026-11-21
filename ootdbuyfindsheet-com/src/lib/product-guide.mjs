import { coverUrl } from './settings.mjs';

const categoryChecks = {
  shoes: [
    'Compare the seller’s insole length with a pair you own, and confirm the size scale displayed for the selected variant.',
    'Use the side and sole views to check the shape and color. Ask the agent about the box before choosing parcel packaging.',
  ],
  'hoodies-sweaters': [
    'Compare chest width, body length and sleeve length with a similar garment, allowing for the fit you want.',
    'Look for close-ups of cuffs, hems and fastenings. Confirm the selected garment and material in the seller listing.',
  ],
  't-shirts': [
    'Compare chest width and body length against a tee that fits you. Check whether the chart uses flat measurements.',
    'Look at print position, collar and hem from different angles. Confirm fabric and fit with the seller when they are relevant.',
  ],
  jackets: [
    'Check chest and shoulder measurements with the layers you intend to wear underneath.',
    'Review the zipper, lining, cuffs and pockets in the listing photos. Compare packed dimensions before choosing a shipping line.',
  ],
  'pants-shorts': [
    'Compare flat waist, rise and inside-leg measurements with a pair you already own.',
    'Check the selected length, fastening and pocket layout. A color option can have different measurements or availability.',
  ],
  accessories: [
    'Check dimensions and the exact contents of the selected option. A photo may show several pieces together.',
    'Look for a close-up of the finish, closure or hardware, and ask the seller if a missing detail matters to you.',
  ],
  bags: [
    'Compare the external dimensions with what you need to carry. Check strap length, closure and the number of compartments.',
    'Review detail photos for the lining, stitching and hardware, then confirm whether the selected listing includes any accessories.',
  ],
  headwear: [
    'Check the circumference and whether the size is adjustable. Compare crown shape and brim style in the gallery.',
    'If you need the shape protected, check packaging options with the agent before shipping.',
  ],
  jersey: [
    'Check chest, length and the stated fit. Confirm which pieces are included and whether customization is selected separately.',
    'Review printing and badge placement in the seller photos and compare the variant in your own warehouse photos.',
  ],
  electronics: [
    'Check model, compatibility, connectors and included accessories with the seller before ordering.',
    'Ask whether the item contains batteries and whether your shipping line accepts it. A warehouse photo cannot verify performance.',
  ],
  ShortSets: [
    'Confirm which pieces come with the selected set. Compare each piece against the seller’s measurement chart.',
    'Check whether you can choose sizes separately, and review the color and included pieces in your own warehouse record.',
  ],
};
const generalChecks = [
  'Read the seller’s description for dimensions, materials, included parts and the options available for this listing.',
  'Compare the gallery views and confirm any details that affect your order before submitting it to the agent.',
];

export function productChecks(category) {
  return categoryChecks[category] ?? generalChecks;
}

export function productPhotoUrls(product, saved = []) {
  return [...new Set([coverUrl(product), ...saved.filter(url => url !== product.image)])].filter(Boolean);
}

export async function readSellerDetails(id) {
  const endpoint = new URL('/api/Goods/getSkuData', 'https://findspreadsheet.com');
  endpoint.searchParams.set('weidian_id', id);
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  const data = await response.json();
  if (String(data.weidian_id) !== id) return null;

  const text = value => typeof value === 'string' ? value.trim() : '';
  const groups = Array.isArray(data.specifications?.attrs) ? data.specifications.attrs : [];
  const options = groups.slice(0, 8).map(group => ({
    name: text(group?.attr_title),
    values: Array.isArray(group?.attr_values)
      ? [...new Set(group.attr_values.map(value => text(value?.attr_value || value?.name)).filter(Boolean))]
      : [],
  })).filter(group => group.name && group.values.length);
  const images = Array.isArray(data.images)
    ? data.images.filter(value => typeof value === 'string' && /^https:\/\//i.test(value)).slice(0, 24)
    : [];
  return {title: text(data.title), seller: text(data.shop_info?.shopName), options, images};
}
