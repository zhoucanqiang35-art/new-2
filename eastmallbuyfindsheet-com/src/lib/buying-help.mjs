const help = 'https://www.eastmallbuy.com/index/help/info/id/';
export const helpCenter = 'https://www.eastmallbuy.com/index/help/index.html';
export const officialOrder = help + '101.html';
export const shippingEstimate = 'https://www.eastmallbuy.com/estimate';
export const officialReturns = 'https://www.eastmallbuy.com/index/information/index/information_id/8.html';

const exampleId = '7869431459';
export const buyingSteps = [
  {
    title: 'Find an item in the EastMallBuy spreadsheet',
    text: 'Open the Spreadsheet and search by product name, Weidian link or item ID. Select Search, then open the matching card. The example uses Weidian item 7869431459 from our store.',
    image: '/assets/guide/search.jpg',
    width: 1214,
    height: 563,
    caption: 'Findsheet spreadsheet with a store item ID and its matching product card.',
    arrows: [[240, 242, 144, 180], [1102, 250, 1156, 201], [435, 340, 309, 340]],
    label: 'Try the example search',
    href: '/spreadsheet/?q=' + exampleId,
  },
  {
    title: 'Open the item on EastMallBuy and review the order',
    text: 'Choose Buy on EastMallBuy to open the purchase page for a verified Weidian store item. You can also paste the original Weidian link into EastMallBuy. On the official purchase page, choose the options and quantity, review the item price and any domestic delivery charges, then use Buy Now or Add to Cart.',
    image: '/assets/guide/purchase.jpg',
    width: 666,
    height: 324,
    caption: 'Findsheet product page with the Buy on EastMallBuy button.',
    arrows: [[552, 177, 501, 238]],
    label: 'Open the example product',
    href: '/products/' + exampleId + '/',
  },
  {
    title: 'Review warehouse QC before shipping',
    text: 'The seller sends the purchase to the agent warehouse. Once your own inspection photos are available in EastMallBuy, check the size label, color, count, measurements and visible condition. Find QC checks for saved records for a store item. For photos of an order you placed, open the order in your EastMallBuy account.',
    image: '/assets/guide/qc.jpg',
    width: 850,
    height: 270,
    caption: 'Findsheet QC Finder with the item ID field and Find QC button.',
    arrows: [[146, 237, 102, 203], [565, 223, 505, 186]],
    label: 'Check QC for the example item',
    href: '/qc/?id=' + exampleId + '#qc-finder',
  },
  {
    title: 'Estimate shipping and submit your parcel',
    text: 'Use the EastMallBuy shipping calculator to compare routes. Enter the destination, weight, goods type and dimensions where required. When your items are ready in storage, select the items for the parcel in EastMallBuy, review the packed dimensions, shipping quote and delivery details, then confirm the parcel there.',
    image: '/assets/guide/shipping.jpg',
    width: 1225,
    height: 285,
    caption: 'EastMallBuy shipping calculator with destination, weight, goods type and Estimate button.',
    arrows: [[265, 65, 242, 108], [540, 66, 525, 109], [1012, 65, 987, 109], [1094, 268, 1033, 224]],
    label: 'Open the official shipping calculator',
    href: shippingEstimate,
  },
];

export const faqGroups = [
  {
    title: 'Spreadsheet and shopping',
    entries: [
      ['What is the EastMallBuy spreadsheet?', 'It is a searchable Findspreadsheet directory for finding products you can open through EastMallBuy. Browse by category, search by product name or paste a Weidian link. Each detail page brings together the original listing, seller photos, a reference price and the shopping-agent link. Registration, checkout and account support take place on the shopping platform.', '/spreadsheet/', 'Browse the spreadsheet'],
      ['How do I use a Weidian link on EastMallBuy?', 'Use the original item link or select Buy on EastMallBuy on a verified Weidian store listing. If a listing opens with multiple options, check the exact sizing chart, color and quantity before you submit it. The independent directory preview currently indexes Weidian listings. Other marketplace links can be checked directly with EastMallBuy.', officialOrder, 'Official ordering guide'],
      ['How do I find a product from a photo?', 'Open Image Search and choose a clear image of one item for the best comparison. The Findsheet preview compares its saved image index in your browser. Open likely matches and compare their seller photos, measurements and source links. You can also search with a product name or item ID if the image returns similar-looking alternatives.', '/image-search/', 'Try Image Search'],
      ['How do I change the shopping agent or currency?', 'Open the Spreadsheet and use the selector in its header. Currency changes displayed estimates. On a product page, use Other shopping agents to open that item with a different agent. The preview uses a saved exchange-rate snapshot. Review the final amount, domestic delivery and agent charges at checkout.', '/spreadsheet/', 'Open the spreadsheet'],
    ],
  },
  {
    title: 'QC and warehouse',
    entries: [
      ['Where can I find EastMallBuy QC photos before buying?', 'Open QC Finder and enter the Weidian link or item ID. When a saved record includes historical warehouse photos, the result links to that gallery. EastMallBuy may also show previous QC on its product page. Compare the exact size, variant, finish and condition in the photos and review the inspection photos of your own order before arranging shipment.', '/qc/#qc-finder', 'Open QC Finder'],
      ['Why are my EastMallBuy warehouse QC photos missing?', 'For a newly stored order, EastMallBuy says the warehouse may still be uploading photos. Check the order status and allow time for the images to appear. If the order view still lacks photos, contact EastMallBuy with the order number. An empty result in the Findsheet preview means the saved directory has no matching photo record.', help + '98.html', 'Official help for missing QC photos'],
      ['What should I check in warehouse photos?', 'Verify the variant and quantity first. Then inspect visible stitching, closures, labels and any areas that are easy to misread in seller photos. If fit matters, compare a measured warehouse photo against the seller chart and a garment that fits. Contact the agent before parcel submission if an inspection shows a clear mismatch.', help + '94.html', 'Official guidance on QC before buying'],
      ['How do I check my EastMallBuy order or warehouse storage status?', 'Look up the order inside your EastMallBuy account and compare its status with the order-status help page. Check your warehouse inventory for items that have arrived. Before combining purchases in one parcel, verify the dates and storage terms shown for your own orders.', help + '103.html', 'Official order status guide'],
    ],
  },
  {
    title: 'Shipping, tracking and after-sales',
    entries: [
      ['How much does EastMallBuy shipping cost?', 'Use the official shipping calculator with the destination, weight, goods type and parcel dimensions. Compare route restrictions, weight bands, estimated time and charge details. Warehouse packing and the route’s weight calculation can affect the final amount, so use the actual parcel quote when deciding.', shippingEstimate, 'Official EastMallBuy shipping calculator'],
      ['What is volumetric weight on EastMallBuy?', 'A light but bulky parcel can be billed based on its dimensions. EastMallBuy explains volumetric weight on its shipping calculator, alongside minimum billable weight and extra weight bands. Review the calculation and limits for the route you are considering, using the final packed length, width and height.', shippingEstimate, 'Read the calculator FAQ'],
      ['How can I track an EastMallBuy parcel?', 'Open the parcel record in your EastMallBuy account. Use the tracking number and carrier shown for that route. If tracking is still blank or a status is unclear, compare it with the Help Center guidance and contact EastMallBuy with the parcel reference when needed.', helpCenter, 'EastMallBuy tracking help'],
      ['Can I request an EastMallBuy return or refund after QC?', 'If warehouse photos show an issue, contact EastMallBuy before forwarding the item. Include the order number, the selected option and photos that show the difference. Check the return policy for the seller’s eligibility, fees and deadlines and wait for the agent’s confirmation before making a decision.', officialReturns, 'Official refund and return policy'],
      ['Where do I check an EastMallBuy coupon or discount code?', 'Check the official account or Help Center for current offers. Review the expiry, route or order restrictions and minimum spend, then apply the code in the relevant checkout screen. Confirm that the discount appears in the total before paying.', helpCenter, 'EastMallBuy Help Center'],
    ],
  },
];
