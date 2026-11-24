export const registrationUrl = 'https://hipobuy.com/register?inviteCode=C6D50RQOY';
export const sourceOrigin = 'https://findspreadsheet.com';
export const purchaseUrl = (id) => 'https://hipobuy.com/product/weidian/' + id;
export const productUrl = (id) => '/product/?id=' + id;

export const categories = {
  shoes: 'Shoes',
  ShortSets: 'Short Sets',
  't-shirts': 'T-Shirts',
  'hoodies-sweaters': 'Hoodies & Sweaters',
  jackets: 'Jackets',
  'pants-shorts': 'Pants & Shorts',
  headwear: 'Headwear',
  accessories: 'Accessories',
  jersey: 'Jerseys',
  electronics: 'Electronics',
  bags: 'Bags',
  'other-stuff': 'Other Finds',
};
export function categoryLabel(category) {
  return categories[category] ?? category.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const howTo = [
  ['Find a listing', 'Search the spreadsheet by product name or Weidian item ID. Open a product to review its reference price and seller photos.'],
  ['Check the photos', 'Look for tagged historical QC photos on the product page. Compare visible details and measurements before ordering.'],
  ['Open Hipobuy', 'Choose Buy on Hipobuy and review the live listing, available variants and final quoted price. Create or sign in to your account there.'],
  ['Check your warehouse order', 'After the item reaches the warehouse, review the photos for your own order and check the available return options.'],
  ['Choose international shipping', 'Use the available routes and quotes in your Hipobuy account. The total depends on destination, parcel weight, dimensions and route.'],
];

export const faq = [
  ['What is a Hipobuy spreadsheet?', 'A searchable catalog of listings you can open on the Hipobuy buying agent. This preview displays the Findspreadsheet Weidian catalog.'],
  ['Can I search by a Weidian product ID?', 'Yes. Enter the numeric item ID or paste a Weidian or Hipobuy item link in the search box.'],
  ['Are these photos from my order?', 'Product photos come from the catalog. Historical QC references show examples from earlier warehouse checks. Review your own photos in your Hipobuy account before arranging shipment.'],
  ['Is the listed price the amount I will pay?', 'Prices are Findspreadsheet references in CNY. Confirm the current item price, agent charges and shipping on Hipobuy.'],
  ['How does image search work?', 'Choose a photo and the browser compares its visual features with the saved Findspreadsheet image index. Your file stays in your browser. Similar colors and shapes can produce unrelated matches.'],
  ['Is this the Hipobuy official website?', 'This is an independent catalog from Findspreadsheet. Account registration and purchases take place at hipobuy.com.'],
];
