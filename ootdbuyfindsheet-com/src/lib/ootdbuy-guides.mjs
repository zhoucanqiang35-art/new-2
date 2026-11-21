const notice = id => 'https://ootdbuy.com/notice/details?id=' + id;
export const official = {
  guide: 'https://ootdbuy.com/notice/guide',
  fees: notice('1740653781924810754'),
  returns: notice('1740656181012172801'),
  storage: notice('1740664252140720130'),
  inspection: notice('1740664942636404738'),
  charges: notice('1740661564720123906'),
  packaging: notice('1740661986205732866'),
  aftersales: notice('1772884667429093377'),
  delivery: notice('1772881180494462977'),
  tracking: notice('1772883184688103426'),
  support: notice('1743203920065433601'),
};

export const orderSteps = [
  {
    title: 'Find and open a product in the spreadsheet',
    text: 'Start with a product name, a Weidian item ID or the item link. Check the product ID on the result before opening its detail page, especially when similar listings have different sellers or variants.',
    image: 'step-0.jpg', caption: 'Findsheet spreadsheet search with the example item ID.',
    href: '/spreadsheet/?q=7866623967', action: 'Try the same search',
  },
  {
    title: 'Review the Findsheet detail and choose an agent',
    text: 'Review the seller gallery, reference price and any saved QC on the product page. Buy on Ootdbuy opens the same Weidian ID on Ootdbuy. Use Other shopping agents if you intend to place the order elsewhere.',
    image: 'step-1.jpg', caption: 'Live Findsheet product page, showing photos and the Ootdbuy button.',
    href: '/item/?id=7866623967', action: 'Open the example listing',
  },
  {
    title: 'Confirm the variant on Ootdbuy',
    text: 'On the agent’s product page, confirm that the listing matches, then choose color, size and quantity. Use the seller’s size chart rather than your usual size. Add to cart to group items or use Buy Now for a single order.',
    image: 'proof-0.jpg', caption: 'Live Ootdbuy product page for the same item.',
  },
  {
    title: 'Review the item payment',
    text: 'Review the order lines, domestic delivery and any selected services. Add purchase notes before submitting. The international parcel quote comes later, once you choose the destination, package and route.',
    image: 'item-payment.webp', official: true, caption: 'Ootdbuy’s public tutorial shows the item-order payment screen.',
    href: official.fees, action: 'Check official service and fees',
  },
  {
    title: 'Review warehouse photos before shipping',
    text: 'When the order reaches your warehouse, open your own inspection record. Compare the received variant and quantity with your order. If there is a mismatch, contact the agent before including the item in an international parcel.',
    image: 'proof-1.jpg', caption: 'Saved warehouse photos on Findsheet. Your own order photos are in your Ootdbuy account.',
    href: '/qc/?id=7321418559', action: 'See the QC example',
  },
  {
    title: 'Submit a parcel or request rehearsal packing',
    text: 'Select the stored items for shipment, enter the overseas address, and compare available lines. Rehearsal packing gives you a packed quote before choosing how to proceed. Creating a waybill can instead start with prepaid freight that is adjusted after packing.',
    image: 'parcel-rehearsal.webp', official: true, caption: 'Ootdbuy’s public tutorial shows the rehearsal packing workflow.',
    href: official.packaging, action: 'Check packaging options',
  },
  {
    title: 'Confirm freight and the final parcel details',
    text: 'Check the packed weight, dimensions, address, carrier restrictions and any extras. If there is a prepaid balance, compare it with the final amount. A shortfall can require another payment, and an excess is handled according to the checkout rules.',
    image: 'freight-final.webp', official: true, caption: 'The official tutorial shows where to check final international freight.',
    href: official.charges, action: 'Check official delivery charges',
  },
  {
    title: 'Track delivery and keep the records',
    text: 'After dispatch, open your parcel in the account and review its tracking details. Save the parcel number, shipping line and any support case. If there is damage or a missing item, keep the packaging and document what arrived.',
    image: 'receipt.webp', official: true, caption: 'The official tutorial shows the dispatched parcel and tracking area.',
    href: official.tracking, action: 'Read the official tracking instructions',
  },
];

export const handoffs = [
  {
    title: 'Your order goes to the purchasing agent',
    text: 'Your variant, quantity and notes become the purchase request. Watch the order for a stock or option change and answer any inquiry before it is purchased. Keep the original listing, the selected option and the order number together.',
    href: official.guide, action: 'Official ordering guide',
  },
  {
    title: 'The seller sends the goods to the warehouse',
    text: 'Domestic tracking and warehouse storage are separate milestones. If the tracking says delivered and the order is still missing, compare the domestic waybill and the order number before asking Ootdbuy to locate it.',
    href: official.inspection, action: 'Official receiving and inspection rules',
  },
  {
    title: 'The warehouse receives, photographs and stores the goods',
    text: 'Check quantity, visible condition, labels and the selected size or color in the order’s warehouse photos. Standard inspection has limits for fit, performance and sealed or specialist products. The policy gives a normal storage period of 90 days from received status. Check the deadline on each order because exceptional parcels follow different rules.',
    href: official.storage, action: 'Official storage rules',
  },
  {
    title: 'You release the checked items for packing',
    text: 'Select only items you are ready to ship. Before removing boxes or consolidating, consider protection, return eligibility and route restrictions. Confirm the packed measurements and final quote before authorizing dispatch.',
    href: official.packaging, action: 'Official packaging options',
  },
  {
    title: 'The parcel passes to the carrier',
    text: 'After dispatch, follow the parcel number in Ootdbuy. International and local carrier updates may appear separately. If tracking is stale or the parcel misses delivery, use the selected line’s instructions and provide the parcel number when asking for help.',
    href: official.tracking, action: 'Official tracking instructions',
  },
  {
    title: 'You check delivery and report any issue',
    text: 'Inspect the parcel upon receipt. Photograph its outer condition, shipping label and any affected contents. Keep the packaging and contact the agent promptly with the order number, parcel number and supporting evidence.',
    href: official.delivery, action: 'Official delivery guidance',
  },
];

export const faqs = [
  ['Where should I start if I only have an item link?', 'Paste a Weidian or Ootdbuy Weidian product link into the spreadsheet search. You can also search the numeric Weidian item ID. Confirm the ID and compare the photos before moving to the agent.', '/spreadsheet/', 'Open the spreadsheet'],
  ['Why is the price on Ootdbuy different from Findsheet?', 'Findsheet shows a converted reference price from the saved seller listing. The agent may show a current variant price, domestic delivery and an exchange rate or fees. Review the actual order total before paying.', official.fees, 'Official service and fees'],
  ['What do I pay when I place the item order?', 'Review the product amount, domestic delivery to the warehouse and any selected services on the order screen. International parcel charges are worked out separately after packing and route selection.', official.fees, 'Official fee breakdown'],
  ['How can I confirm a size or color before paying?', 'Compare the seller’s chart against a similar garment you already own. Keep a screenshot of the variant you selected, and use the order notes or inquiry to ask about a measurement or option if available.', official.guide, 'Official ordering guide'],
  ['What if the seller runs out of my selected option?', 'Check the status and any message from the purchasing agent. Use the order inquiry to clarify whether you want a replacement option or would prefer cancellation. Avoid accepting an alternate size or color without reviewing it.', official.aftersales, 'Official after-sales instructions'],
  ['What is the difference between saved QC and my order photos?', 'Saved QC is a reference from a prior inspection associated with the item ID. Your agent’s warehouse record shows the item received for your specific order. Use your own photos when deciding whether to ship or request help.', '/qc/', 'Open saved QC lookup'],
  ['What does a normal warehouse inspection cover?', 'The published inspection policy describes checking visible details such as quantity, color and size. It lists limitations for color differences, fit, function and specialist or sealed products. Ask about extra checks before submitting a parcel.', official.inspection, 'Official inspection policy'],
  ['What should I do if the warehouse photos show a mismatch?', 'Pause the parcel submission. In the order record, provide the item number, your chosen option and a clear photo of the mismatch. Ask about additional inspection or after-sales options while the item is still in the warehouse.', official.aftersales, 'Official after-sales instructions'],
  ['How long can I leave items in the warehouse?', 'Ootdbuy’s storage page describes a normal 90-day period from received status and separate rules for abnormal or unmatched parcels. Check the status and expiry shown in your account, especially if you are waiting to consolidate orders.', official.storage, 'Official storage rules'],
  ['Can I ship products from different orders together?', 'Select eligible stored items together when creating your parcel. The available lines may change when you add a restricted item. Compare the cost, package size and handling requirements before submitting.', official.guide, 'Official parcel submission guide'],
  ['When is rehearsal packing useful?', 'Use rehearsal when you need packed dimensions and weight before choosing how to ship. Confirm the rehearsal charge and current rules in the agent’s interface. Keep in mind that changing the parcel contents can change the final quote.', official.guide, 'Official rehearsal instructions'],
  ['Why did the freight quote change after packing?', 'A packed parcel may differ from the initial weight or size estimate. Check the carrier’s billing basis and the final measurement in the account. The agent’s tutorial describes settling a difference against prepaid freight.', official.charges, 'Official delivery charges'],
  ['Can I ship batteries, liquids or oversized items?', 'Available routes depend on the destination, commodity and parcel measurements. Confirm the route’s restrictions for the actual items in the parcel before paying. Splitting a shipment may be necessary if products qualify for different lines.', official.delivery, 'Official delivery guidance'],
  ['Can I remove the original box or request extra protection?', 'Check the packaging choices for your order before confirming the parcel. Removing a box can change volume and protection, and may affect return eligibility. Check current costs and whether the seller requires the original packaging.', official.packaging, 'Official packaging information'],
  ['Can I cancel or return an item?', 'Options depend on the order status, seller eligibility and the condition of the item. Open the order’s after-sales action as soon as possible. Confirm the deadline, return shipping cost and refund method before approving a return.', official.returns, 'Official returns and refunds policy'],
  ['Where can I track a parcel or report damage?', 'Open the parcel list in your Ootdbuy account and choose the tracking details. For damage or missing contents, keep the packaging, photograph the parcel and contact the agent with the parcel and order numbers.', official.tracking, 'Official parcel tracking guide'],
];
