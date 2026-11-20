import {registrationUrl, productUrl, purchaseUrl} from './catalog.mjs';

export const officialOrder = 'https://www.lolobuy.com/';
const sheet = '/spreadsheet/';
const sample = productUrl('7321418559');
const qc = '/qc/?id=7321418559#qc-finder';
const image = '/image-search/';

export const steps = [
  {title: 'Find a Weidian listing', text: 'Search the spreadsheet by name, item ID or Weidian link. Compare the gallery, stated options and reference price.', href: sheet, label: 'Open the spreadsheet'},
  {title: 'Open the item in LoloBuy', text: 'Choose Buy on LoloBuy and compare the supplier, item ID, size, colour and current price before submitting the order. Create a LoloBuy account if needed.', href: registrationUrl, label: 'Join LoloBuy'},
  {title: 'Review warehouse photos', text: 'When your order arrives at the warehouse, check the inspection photos in your LoloBuy account. Look at visible details such as the size label, colour, stitching and packaging.', href: qc, label: 'See a saved QC example'},
  {title: 'Submit your parcel', text: 'Select your warehouse items, compare the available routes and charges for your address, then follow LoloBuy’s parcel and tracking instructions.', href: officialOrder, label: 'Visit the LoloBuy website'},
];

export const faqGroups = [
  {title: 'Find products', entries: [
    ['What is the LoloBuy spreadsheet?', 'It is a FindSpreadsheet directory of Weidian listings with seller photos, reference prices and purchase links that open on LoloBuy.', sheet, 'Browse listings'],
    ['Can I search with a product link or photo?', 'Paste a Weidian link or an item ID into the directory. To search visually, upload a cropped reference photo. The preview compares it against the saved catalog image index in your browser.', image, 'Try image search'],
    ['Where do the products and prices come from?', 'The preview uses a saved FindSpreadsheet catalog. USD amounts are currency estimates for the item. Verify its current price, availability and options before ordering.', sheet, 'See the directory'],
  ]},
  {title: 'Order and check QC', entries: [
    ['How do I order from the spreadsheet?', 'Open a product and choose Buy on LoloBuy. Review the matching listing and choose the size, colour and quantity on the official site before placing an order.', sample, 'Open a sample listing'],
    ['What are QC photos?', 'QC photos are warehouse inspection images. Saved examples are matched by Weidian item ID. For your own item or variant, review the photos in your LoloBuy account.', qc, 'See an example'],
    ['What if a product has no saved QC photos?', 'Compare the seller gallery, or check the current listing on FindSpreadsheet. Once your own order arrives, use the warehouse inspection photos from that order.', '/qc/', 'Look up QC'],
  ]},
  {title: 'Ship a parcel', entries: [
    ['How much does LoloBuy shipping cost?', 'The route and the parcel’s destination, weight and dimensions affect the quote. Check the available routes and the current total on LoloBuy before paying.', officialOrder, 'Check LoloBuy'],
    ['Can I consolidate several items?', 'When eligible items arrive at the warehouse, LoloBuy lets you select them for a combined parcel. Check the route restrictions and charges for your shipment.', officialOrder, 'Visit LoloBuy'],
    ['How long does LoloBuy shipping take?', 'Allow time for seller delivery and warehouse processing, then check the estimate for your chosen international route. Follow the tracking information shown for the parcel.', '/guides/how-to-buy/', 'Read the buying guide'],
  ]},
];

export const freightUrl = 'https://www.lolobuy.com/estimate';
export const officialBuyingGuide = 'https://www.lolobuy.com/doc?code=1242296499766165';
const officialHelpCenter = 'https://www.lolobuy.com/helpCenter/7430420101201988';

export const illustratedSteps = [
  {
    title: 'Find the listing and open it in LoloBuy',
    text: 'Enter a product name, Weidian item ID or seller link in our spreadsheet and choose Apply filters. Open a result, compare its seller photos and choose Buy on LoloBuy. You can also paste a seller link into the official LoloBuy homepage.',
    image: 'site-spreadsheet-search.webp',
    caption: 'Our spreadsheet after searching for Weidian item 7321418559. Open the matching card to reach the purchase link.',
    href: sheet, label: 'Search the spreadsheet',
  },
  {
    title: 'Confirm your option before paying',
    text: 'On the LoloBuy product page, check the loaded seller item, size, colour and quantity. Compare the current item price and any domestic freight. If the page shows a zero price, an empty option list or a mismatched item, try the original seller link before continuing.',
    image: 'official-order.webp',
    caption: 'LoloBuy product page with the selected item, available options and price.',
    source: purchaseUrl('7321418559'), href: sample, label: 'Open a sample listing',
  },
  {
    title: 'Pay for the order and check warehouse intake',
    text: 'The LoloBuy product screen separates the item payment from international freight. Review the order total, including the seller’s domestic shipping charge, before paying. After payment, follow the order in your account until the seller ships and the warehouse receives it. Keep the order number so support can distinguish a seller delay from warehouse processing.',
    image: 'official-payment.webp',
    caption: 'LoloBuy product screen showing item payment, warehouse intake and international freight as separate stages.',
    source: purchaseUrl('7321418559'), href: officialOrder, label: 'Open LoloBuy',
  },
  {
    title: 'Inspect your warehouse QC photos',
    text: 'Once the item arrives, open My LoloBuy → My Warehouse to check your inspection photos. Compare the variant, size label, colour and visible condition against your order. Use the order’s after-sales options for any discrepancy before submitting your parcel.',
    image: '/qc-media/7321418559-1.webp',
    caption: 'Saved warehouse QC example for Weidian item 7321418559. Your own photos appear in your LoloBuy account.',
    source: officialBuyingGuide, href: qc, label: 'Try warehouse QC lookup',
  },
  {
    title: 'Resolve QC issues before shipping',
    text: 'If the warehouse photos show a wrong variant, missing piece or damage, save the relevant photo and order number. Ask LoloBuy support or use the available after-sales option for that order. Check the deadline, eligibility and any fee before requesting a return or exchange. If a detail is unclear, specify the exact angle or measurement you need.',
    image: 'official-after-sales.webp',
    caption: 'LoloBuy’s public Help Center. Sign in and select the affected order to ask about returns or refunds.',
    source: officialHelpCenter, href: '/qc/', label: 'See the inspection checklist',
  },
  {
    title: 'Estimate your international freight',
    text: 'Open Freight estimate on LoloBuy. Choose the destination and enter weight in grams. Add packed dimensions in centimetres and the product category when available, then select Query. Compare available routes, including weight rules and product restrictions. Use the warehouse’s final packed figures to check the payable amount.',
    image: 'official-freight.webp',
    caption: 'LoloBuy Shipping Fee Estimation form with destination, weight and parcel dimensions.',
    source: freightUrl, href: freightUrl, label: 'Open the freight estimator',
  },
  {
    title: 'Combine eligible items and submit a parcel',
    text: 'In My Warehouse, select the inspected items you want to ship together and choose Submit for Delivery. Check storage deadlines, the recipient’s address, parcel contents and packing options. Review the route, terms and estimated freight deposit, then check the final charge after packing.',
    image: 'official-parcel.webp',
    caption: 'LoloBuy’s public tutorial covers warehouse item selection, parcel submission and the estimated freight deposit.',
    source: officialBuyingGuide, href: officialOrder, label: 'Open LoloBuy',
  },
  {
    title: 'Track your parcel',
    text: 'After dispatch, open My LoloBuy → Parcels for the carrier and tracking number. If delivery is delayed, compare the parcel status in LoloBuy with the carrier’s updates.',
    image: 'official-tracking.webp',
    caption: 'LoloBuy’s public tutorial shows where to track a parcel in your account.',
    source: officialBuyingGuide, href: officialOrder, label: 'Open LoloBuy',
  },
  {
    title: 'Inspect your delivery and confirm receipt',
    text: 'Check the contents and condition when the parcel arrives. If everything matches your order, confirm receipt in My LoloBuy → Parcels. For missing or damaged goods, keep the packaging, shipping label and photos, then check your route’s claim procedure and deadline.',
    image: 'official-receipt.webp',
    caption: 'LoloBuy’s public tutorial shows where to confirm receipt or request after-sales help.',
    source: officialBuyingGuide, href: '/faq/', label: 'Read the LoloBuy FAQ',
  },
];

export const qcChecks = [
  {title: 'Check the option and quantity', text: 'Compare the product type, colourway, size label and visible unit count with the seller listing and your selected option. Photograph or note the discrepancy when contacting support.'},
  {title: 'Look for obvious condition issues', text: 'Use multiple angles to check for stains, tears, cracks, bent hardware and crushed packing. Lighting and compression can distort colour and hide fine damage.'},
  {title: 'Ask for specific evidence', text: 'If your order offers an extra inspection option, request the exact angle, label or measurement you need. Check its fee, timing and the after-sales deadline in your account.'},
  {title: 'Separate appearance from function', text: 'A still image can show visible details at the time it was taken. It cannot establish fit, hidden materials, electronics performance or authenticity.'},
];

export const productQcChecks = [
  ['Shoes', 'Compare the size tags and the left and right pair. Look at sole edges, stitch lines and heel alignment. For fit, ask whether an insole measurement is available.'],
  ['Clothing', 'Check the size and care label, print placement, seams and zipper or button alignment. Compare flat garment measurements to the seller size chart when they are available.'],
  ['Bags and accessories', 'Inspect visible hardware, straps, closures and corners, and confirm that expected pieces are present. A closed zipper photo alone does not show that the zipper works.'],
  ['Electronics', 'Check the model label, included accessories and visible damage. Ask what functional checks the warehouse offers if power or connectivity matters.'],
];

faqGroups[0].entries.push(
  ['Why does the product page show zero or no options?', 'The agent may not have loaded the seller listing or its variants. Compare the Weidian ID, open the original listing and try pasting its URL on LoloBuy. If the current option and price cannot be confirmed, contact LoloBuy support before paying.', officialOrder, 'Open LoloBuy'],
  ['Do the spreadsheet prices include shipping?', 'The displayed currency conversion estimates the item price from the saved listing. The live agent checkout may add domestic freight or payment fees. International parcel shipping is quoted separately using the packed parcel and route.', freightUrl, 'Estimate shipping'],
  ['Can I save a find or use another shopping agent?', 'Use Save find on the product page to keep a shortlist on this device. The agent menu on the listing or spreadsheet lets you see whether another shopping agent supports that seller link.', '/saved/', 'Open saved finds'],
);
faqGroups[1].entries.push(
  ['Where do I see my own LoloBuy QC photos?', 'After warehouse intake, open the relevant order in your LoloBuy account and check its inspection photos and status. The QC lookup here shows saved examples by Weidian ID. A saved example can come from a different order or variant.', '/qc/', 'Open the QC finder'],
  ['How many QC photos are included? Can I request more?', 'The official homepage says warehouse inspection photos are provided. The number, additional photo options and any charges depend on the current service shown for your order. Ask for specific evidence such as the size label or an insole measurement.', '/qc/', 'See the inspection checklist'],
  ['What should I do if QC shows the wrong item or damage?', 'Keep the inspection images and order details. Check the after-sales or support options and deadline for the item before parcel submission. Describe the exact discrepancy and ask which remedies are available and whether fees apply.', '/guides/how-to-buy/', 'Read the warehouse step'],
  ['Do QC photos prove authenticity or that electronics work?', 'Photos document visible condition, size labels, packaging and other details shown. They cannot verify authenticity, internal components or ongoing function. Ask support about any extra functional checks you need.', '/qc/', 'Read the limits of photo QC'],
);
faqGroups[2].entries.push(
  ['How do I use the LoloBuy freight estimator?', 'Select the destination and enter packed weight in grams. Add centimetre dimensions and an eligible product category if available. Query available routes, then compare the final quote once the warehouse has weighed and measured your parcel.', freightUrl, 'Open the freight estimator'],
  ['What is volumetric weight?', 'Some shipping routes bill by the space a parcel occupies when that exceeds its scale weight. The conversion rule and minimum charge depend on the route. Compare current route details using the packed dimensions.', freightUrl, 'Check available routes'],
  ['How long can I keep items in the warehouse?', 'Check the storage deadline displayed for each item in your LoloBuy account. Confirm when storage starts and any extension fee before the deadline, especially when consolidating orders that arrived on different dates.', officialOrder, 'Open LoloBuy'],
  ['What should I check if tracking has not updated?', 'Check whether the order is still moving to the warehouse or an international parcel already has a tracking number. For a submitted parcel, compare the agent’s parcel status and the carrier status. If it exceeds the estimate, contact support with the parcel ID.', '/guides/how-to-buy/', 'Read the parcel guide'],
);
