import { itemUrl } from './catalog.mjs';
import { help, official, warehouseSample } from './orientdig.mjs';

const allChinaBuy = 'https://www.allchinabuy.com/en/';
const allChinaBuyEstimate = 'https://m.allchinabuy.com/en/freightcompute/';
const hoobuyGuide = 'https://hoobuy.com/beginner-guide?stepKey=Custom1';
const hoobuyOrder = 'https://hoobuy.com/fill-buy';
const hoobuyEstimate = 'https://hoobuy.com/estimation';

export const articles = [
  {
    slug: 'orientdig-first-order',
    title: 'Your first OrientDig order',
    intro: 'Follow one Weidian listing from seller checkout to warehouse receipt. Learn when to confirm a variant, review a price change, and send a parcel.',
    sections: [
      { title: 'Keep an accurate copy of the listing', text: 'Save the seller link and exact variant before opening OrientDig. Keep the seller’s measurement chart or product options for reference. If automatic import fails, OrientDig’s DIY Order entry is available after sign-in. Check the item quote and domestic delivery separately.', links: [['/guides/how-to-buy/', 'Open the illustrated walkthrough'], [official.diy, 'Official DIY Order']] },
      { title: 'Read the order status before contacting support', text: 'A purchased order is waiting for the seller to send it. A received order is at the warehouse and may still need inspection. If the order asks you to confirm information or clear a price difference, read the reason in the order before authorizing payment.', links: [[help.statuses, 'Official order status definitions']] },
      { title: 'Review the item before selecting a parcel', text: 'When the item is stored, open its warehouse photos and check the variant against your saved listing. Resolve a wrong item or missing part before submitting an international parcel. You can group eligible items in the warehouse, subject to the packed size and route rules.', links: [[help.buying, 'Official buying and parcel steps'], ['/guides/shipping/', 'Read the shipping guide']] },
    ],
  },
  {
    slug: 'orientdig-shipping-weight-and-packing',
    title: 'OrientDig shipping weight, packing and route selection',
    intro: 'Learn which measurements to enter, how to compare volumetric weight, and when rehearsal packing can help before you pay for an international parcel.',
    sections: [
      { title: 'Start with the box you will actually send', text: 'Use the destination, total packed weight and outside box dimensions. A parcel can be heavier than the summed product weights after packaging. A bulky item can also increase the route’s billable weight even if it adds little weight on a scale.', links: [[official.estimate, 'Official shipping calculator'], [help.weight, 'Official weight calculation']] },
      { title: 'Compare eligible routes with the same inputs', text: 'Take note of each route’s item restrictions, measurement rules, tracking, expected delivery range and available coverage. Compare quotes using the same parcel details. Route availability and fees can change, so check the estimate again after you finalize packing.' },
      { title: 'Decide if rehearsal packing is worth using', text: 'OrientDig lists an optional service that packs and weighs a proposed parcel before submission. It is most useful when a change in box size could affect your route. Check the fee, and consider whether removing packaging would reduce needed protection.', links: [[help.packing, 'Official rehearsal packing details']] },
      { title: 'Check the packed shipment total', text: 'The parcel deposit is based on an estimate. Packing or carrier measurement can change the final weight and charge. Review the final billing details and follow the parcel from your account once it is dispatched.', links: [['/guides/shipping/', 'Read the full shipping guide'], [help.buying, 'Official parcel payment steps']] },
    ],
  },
  {
    slug: 'orientdig-warehouse-returns-storage',
    title: 'OrientDig warehouse storage, returns and exchanges',
    intro: 'Check the warehouse dates that matter, document a QC issue clearly, and review seller eligibility before sending the item internationally.',
    sections: [
      { title: 'Keep track of separate warehouse dates', text: 'OrientDig publishes a standard storage period of 90 days from stored status. The published standard request window for an eligible warehouse return or exchange is five days from storage. Check the dates shown on each order rather than treating the storage period as a return window.', links: [[help.storage, 'Official warehouse storage policy'], [help.returns, 'Official return terms']] },
      { title: 'Document the reason before contacting the agent', text: 'If QC shows the wrong size, color or visible damage, identify the exact order and chosen option. Send the photo that shows the issue alongside the saved listing details. Keep original labels and packaging until the agent explains what the seller requires.' },
      { title: 'Check eligibility and charges before confirming', text: 'Seller policy and item condition affect whether an item can be returned. OrientDig may need the seller’s agreement. Review applicable return shipping or service fees in the order, and keep the item out of an international parcel until the request is resolved.', links: [[help.returns, 'Official eligibility and fees'], ['/faq/', 'More warehouse answers']] },
    ],
  },
  {
    slug: 'read-warehouse-qc-photos',
    title: 'How to read warehouse QC photos',
    intro: 'Use a real OrientDig Findsheet example to check whether warehouse photos show the listing, variant, and details you care about.',
    sections: [
      { title: 'Match the exact listing', text: 'Copy the Weidian item ID from the source URL and compare it with the ID in the QC finder. Search results with similar names can point to different sellers. Open the example sweatshirt and compare the listing photo with photos saved for that same ID.', links: [[itemUrl(warehouseSample), 'Open the sweatshirt example']] },
      { title: 'Look for the details you need', text: 'Start with a full-item photo to check the color and overall shape. Use close-ups for labels, stitching, prints, and visible damage. If size matters, look for a photo with a ruler and compare the measurement with a similar item you already own. Remember that lighting can affect color.' },
      { title: 'Understand what the warehouse checks', text: 'OrientDig describes regular QC as a visual inspection. Its published scope excludes power-on testing for electronic items. If the listing requires a measurement or a close-up, ask for the specific view and check any extra-photo charge.', links: [[help.qc, 'Official inspection scope'], [help.packing, 'Official extra-photo options']] },
      { title: 'Review your own warehouse photos', text: 'A saved photo shows a previous inspection. Once your order is in the warehouse, check the photos in your own account and ask the agent about missing angles or discrepancies before submitting the parcel.', links: [['/tools/#qc', 'Search by Weidian item ID'], ['/guides/shipping/', 'Read the shipping guide']] },
    ],
  },
  {
    slug: 'orientdig-vs-allchinabuy',
    title: 'OrientDig vs AllChinaBuy',
    intro: 'Compare what to check at checkout, how to review warehouse photos, and how to request comparable shipping quotes.',
    sections: [
      { title: 'Check the same seller URL', text: 'Start with one Weidian URL and the same variant. Findsheet opens the exact Weidian listing in OrientDig. If you are also considering AllChinaBuy, paste that source URL into its search and compare the displayed variant, item price, and domestic delivery before you choose.', links: [['/spreadsheet/', 'Find a Weidian listing'], [allChinaBuy, 'Open AllChinaBuy']] },
      { title: 'Check the inspection workflow', text: 'AllChinaBuy lists inspection and photography in its service overview. Before buying on either platform, check which images are included and how to request additional angles. Review the actual warehouse photos from your order before shipping.', links: [[allChinaBuy, 'AllChinaBuy service overview'], [official.help, 'OrientDig help center']] },
      { title: 'Compare freight on the same assumptions', text: 'Enter the same destination, weight, dimensions, and item type in both estimators. Check whether the routes use actual weight or volumetric weight and what tracking and fees are included. The available lines and parcel terms matter more than the first headline quote.', links: [[official.estimate, 'OrientDig estimator'], [allChinaBuyEstimate, 'AllChinaBuy calculator']] },
    ],
  },
  {
    slug: 'orientdig-vs-hoobuy',
    title: 'OrientDig vs Hoobuy',
    intro: 'Compare manual ordering and parcel quotes using the same product link, variant, and delivery address.',
    sections: [
      { title: 'When a product does not load', text: 'OrientDig offers a DIY Order form. Hoobuy’s manual form asks for the source link, product name, specifications, unit price, and quantity. Keep the exact seller URL and variant details at hand for either order form.', links: [[official.diy, 'OrientDig DIY Order'], [hoobuyOrder, 'Hoobuy manual order']] },
      { title: 'Compare the item and domestic delivery', text: 'Hoobuy’s purchase walkthrough lists item payment and Chinese domestic delivery together. On either platform, compare the same color and size and check the amount due before the item reaches the warehouse. Confirm the seller can supply the selected variant if the listing looks unclear.', links: [[hoobuyGuide, 'Hoobuy purchase walkthrough'], ['/guides/how-to-buy/', 'OrientDig buying walkthrough']] },
      { title: 'Check the international delivery options', text: 'Start with the same destination and packed parcel on both estimators. Verify available routes, restrictions, tracking, and the total charged for the option you would actually use. Use the parcel quote in the agent account when you are ready to submit.', links: [[official.estimate, 'OrientDig estimator'], [hoobuyEstimate, 'Hoobuy estimator']] },
    ],
  },
].map(article => ({ ...article, href: '/articles/' + article.slug + '/' }));
