import { itemLookupUrl } from './catalog.mjs';
import { help, official, warehouseSample } from './orientdig.mjs';

export const faq = [
  {
    title: 'Products and ordering',
    questions: [
      ['What is an OrientDig spreadsheet?', 'This independent Findspreadsheet catalog helps you discover saved Weidian listings and open the same product on an agent. Use the exact seller listing to check available sizes, colors, and current prices.', '/spreadsheet/', 'Search the spreadsheet'],
      ['Why does OrientDig show another price?', 'Findsheet converts saved item prices for comparison. The product price, domestic delivery charge, and payable amount can change with the seller, variant, or agent. Confirm your exact option at checkout.', '/guides/how-to-buy/', 'See the ordering walkthrough'],
      ['What if a Weidian link does not load?', 'Check the original URL and item ID first. If OrientDig cannot read a supported listing, sign in and review DIY Order. If OrientDig marks an item as restricted, check its terms or contact support before paying.', official.diy, 'Official DIY Order'],
      ['Why is my order still processing?', 'OrientDig separates review, purchase, seller dispatch, warehouse receipt and storage. A receipt status means the item arrived and may still be waiting for inspection. Open the order if it asks you to confirm information or pay a price difference.', help.statuses, 'Official order status definitions'],
    ],
  },
  {
    title: 'Warehouse QC and returns',
    questions: [
      ['Does every spreadsheet listing have QC photos?', 'Saved QC coverage varies by listing and variant. Check the exact Weidian item ID and compare the available photo with the seller listing. After buying, use the warehouse photos attached to your own order.', itemLookupUrl(warehouseSample), 'See a saved QC example'],
      ['What does regular warehouse inspection cover?', 'The agent describes its standard inspection as a visual check. Look for the ordered model or variant and visible damage. Its published inspection scope excludes power-on checks for electronics. Request extra detail or a measurement photo when needed.', help.qc, 'Official inspection scope'],
      ['What if my QC photos show the wrong item?', 'Open the order and send OrientDig the selected size or color, the listing URL, and the photo that shows the difference. Keep the item in the warehouse while the agent checks the issue with the seller.', help.returns, 'Official return and exchange terms'],
      ['Can I return an eligible item from the warehouse?', 'OrientDig documents a standard five-day request window after the item enters warehouse storage for eligible returns or exchanges. Seller policy, item condition and packaging can affect approval. Check the order promptly and review any fees before confirming.', help.returns, 'Official eligibility and deadlines'],
      ['How long can items stay in the warehouse?', 'OrientDig publishes a standard storage period of 90 days from the stored status. Check the date on each item in your account, especially if you are waiting for other orders to arrive before shipping.', help.storage, 'Official warehouse storage policy'],
    ],
  },
  {
    title: 'Parcels and delivery',
    questions: [
      ['Do I pay for the item and shipping together?', 'Budget separately for the seller order, including domestic delivery when charged, and the international parcel from the warehouse. OrientDig’s official workflow has a separate international payment step after you select a route.', help.buying, 'Official buying and shipping walkthrough'],
      ['Why is the billable weight higher than the scale weight?', 'Some routes compare the packed scale weight with a volume-based weight. If the route uses the larger figure, a bulky light box can cost more even though its scale weight is low. Check the divisor and rounding for that line.', help.weight, 'Official weight calculation'],
      ['Can I preview a parcel before submitting it?', 'OrientDig lists rehearsal packing as an optional service to pack and weigh an intended parcel. Check availability and the current fee in your account. Keep protective packaging for items that need it.', help.packing, 'Official packing services'],
      ['What if the estimator shows no route?', 'Check the destination, weight, dimensions and the applicable item restrictions. If the result is still empty, confirm eligibility with official support before placing the order or paying for the parcel.', official.estimate, 'Check the official estimator'],
      ['Does the freight estimate include duties or insurance?', 'Read the terms for the selected route to see what is included. Eligibility, possible destination charges and insurance terms depend on the route and parcel. Use the checkout quote and the applicable destination rules.', help.customs, 'Official customs guidance'],
      ['Where do I track a shipped parcel?', 'Use the parcel area in your OrientDig account and the carrier tracking number once available. If the shipment is outside the estimate, keep the parcel ID and latest tracking event so support can identify it.', help.logistics, 'Official logistics guidance'],
    ],
  },
];
