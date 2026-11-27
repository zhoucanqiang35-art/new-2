export const officialGuide = 'https://rizzitgo.com/how-it-work/';
export const freight = 'https://rizzitgo.com/freight-calculator/';
export const support = 'mailto:support@rizzitgo.com';
export const guides = [
  ['find', 'Find the exact item', 'Search this spreadsheet by product name or Weidian item ID. Open a result and compare its seller photos, reference price, and item number. Use Image Search when you have a photo and no useful keywords.', 'search', 'FindSheet catalog search', '/spreadsheet/', 'Open spreadsheet'],
  ['compare', 'Compare photos and options', 'Use the thumbnails below the main photo and select any available style or size. Check warehouse photos below the listing when available. Copy the Weidian link or choose an agent from Other purchasing platforms.', 'detail', 'FindSheet product page', '/products/7872190238/', 'Open sample product'],
  ['order', 'Choose a variant on RizzitGO', 'Select Buy on RizzitGO from the product page. On RizzitGO, confirm the listing, color, size, quantity, and availability. Use Add to Bag for several items or Buy Now for a single order.', 'choose', 'RizzitGO product selection example', 'https://rizzitgo.com/detail-page/?goodsId=7872190238&source=3', 'Open RizzitGO example'],
  ['pay', 'Review checkout and payment', 'Review the item total, applicable delivery within China, and available payment methods at checkout. Save the order number. International shipping is quoted when you prepare a parcel.', 'checkout', 'RizzitGO checkout example', officialGuide, 'Open official walkthrough'],
  ['enquire', 'Follow your order', 'Open the order in RizzitGO to see its status. Use Order Enquiry if the agent asks about a variant, a price change, or an unavailable item. Include the order number and the exact choice you want confirmed.', 'warehouse', 'RizzitGO account navigation example', officialGuide, 'Open official walkthrough'],
  ['inspect', 'Inspect warehouse photos', 'Go to User Center → Warehouse in RizzitGO after your items arrive. Compare the pictured variant, label, measurements, and condition. Request an additional photo or contact the agent before submitting the parcel if you see a problem.', 'warehouse', 'RizzitGO warehouse inspection example', '/qc-photos/', 'Check public QC'],
  ['ship', 'Estimate shipping and prepare a parcel', 'Check the destination, actual weight, package dimensions, and product restrictions in the Freight Calculator. In Warehouse, select the items you want to consolidate, enter your address, choose an available route, and review the estimated deposit.', 'parcel', 'RizzitGO parcel preparation example', freight, 'Open freight calculator'],
  ['track', 'Track the parcel', 'After dispatch, open User Center → Parcels and select the parcel. Use View Tracking in the parcel details. Save the tracking number and use the carrier’s updates if you need to follow a handoff.', 'receipt', 'RizzitGO parcel list example', officialGuide, 'Open official walkthrough'],
  ['receive', 'Confirm receipt or request help', 'Compare the goods received with your order and warehouse photos. Confirm receipt in Parcels when you have checked the delivery. Use the parcel’s after-sales option if you need help with missing or damaged items.', 'receipt', 'RizzitGO receipt and after-sales example', officialGuide, 'Open official walkthrough'],
];

export const faqs = [
  ['Finding products', [
    ['What is the RizzitGo spreadsheet?', 'It is an independent Findspreadsheet catalog for finding products and comparing buying links. RizzitGO handles the account, order, warehouse, payment, and shipping after you open its site.'],
    ['How do I search by Weidian item ID?', 'Copy the digits after itemID in a Weidian link. Enter the number in the spreadsheet search or the public QC form. The ID is also visible on each product detail page.'],
    ['Can I find a product from a photo?', 'Open Image Search and upload, paste, or drop a reference picture. Similar products appear by visual match. Use the listing and its options to confirm the exact item. Your query photo is processed in your browser.'],
    ['Why are a product title or size labels still in the seller’s language?', 'The catalog preserves the merchant’s original product name and variant labels so you can match them at checkout. The site menus, shopping guides, FAQ, and interface messages switch to your selected language.'],
  ]],
  ['Orders and payment', [
    ['How do I place an order through RizzitGO?', 'Open a product and select Buy on RizzitGO. Verify the variant and price, sign in, then use Add to Bag or Buy Now on the official site. The agent buys the item from the seller after the order is placed.'],
    ['Which payment methods are available?', 'RizzitGO’s public guide lists PayPal, Google Pay, Apple Pay, Alipay, and cards. The methods shown at your checkout depend on your region and order. Use the final checkout total when confirming payment.'],
    ['Does the spreadsheet price include international shipping?', 'The spreadsheet converts the catalog item price from CNY using a dated reference rate. Domestic delivery, payment fees, international shipping, packaging services, and any applicable taxes may add to your total.'],
    ['Does changing the website language change the currency?', 'The language and currency menus are independent. Your currency selection applies to catalog estimates across the site and stays selected when you switch language. RizzitGO shows the actual payment currency at checkout.'],
    ['What if the seller is out of stock or changes the price?', 'Open the item order and use Order Enquiry to ask the agent about the change. Confirm any replacement style, size, or revised total before agreeing to it.'],
    ['Can I cancel or return an item?', 'Open the item order and check which after-sales actions are available. Eligibility depends on the seller, order stage, warehouse status, and the applicable return deadline. Ask through the order before submitting the item in an international parcel.'],
  ]],
  ['Warehouse and QC', [
    ['Where are my own warehouse photos?', 'Sign in to RizzitGO and open User Center → Warehouse after the item arrives. Your order’s warehouse record has the available inspection photos and item information.'],
    ['How do seller photos and warehouse QC differ?', 'Seller photos show the listing. Warehouse QC photos record an actual inspection, sometimes for another order of the same product. Review your own warehouse record for the exact item that arrived.'],
    ['What should I inspect in QC photos?', 'Compare the variant and size label, count the pieces, and look for visible damage or mismatched details. Ask for a close-up or measurements through the order when the available views leave an important question open.'],
    ['What if a public QC lookup has no photos?', 'You can still review the seller’s listing photos. Public QC depends on what Findspreadsheet can retrieve for that ID. A temporary lookup problem is displayed with a retry option.'],
    ['How long can RizzitGO store my products?', 'The official walkthrough currently describes 60 days of free item storage and the option to buy an extension in Warehouse. Check the deadline displayed against each stored item.'],
    ['Can I combine orders into one shipment?', 'When the items are available in Warehouse, select the ones you want in the same parcel. Compare the new chargeable weight and route restrictions before paying the parcel deposit.'],
    ['Can I request additional photos or packaging services?', 'The official guide lists examples such as additional photography, box removal, and package reinforcement. Check Warehouse or parcel checkout to see which services are offered for the item or shipment.'],
  ]],
  ['Shipping and after-sales', [
    ['How do I check shipping before ordering?', 'Open the RizzitGO Freight Calculator and enter your destination and estimated package details. Use those route quotes for planning. The warehouse measures the finished parcel before the final charge is confirmed.'],
    ['What is chargeable weight?', 'A route can bill by actual weight, volumetric weight based on dimensions, or a route-specific rule. Compare the billing mode and minimum weight in the freight quote. A large light package can still cost more than expected.'],
    ['Why does the final shipping cost differ from the deposit?', 'The deposit uses an estimate. The final fee reflects the measured parcel, the route and any applicable service charges. The official guide says a refundable difference is credited to the RizzitGO account after dispatch.'],
    ['Can I ship an item with batteries or other restrictions?', 'Enter the actual item type in the freight calculator and check the routes offered for that destination. Restrictions and requirements vary by route. Confirm eligibility with RizzitGO before purchasing if you cannot identify an eligible route.'],
    ['How do I track a shipment?', 'Open the parcel in User Center → Parcels and select View Tracking in Parcel Details. International updates can pause during carrier, customs, or last-mile handoffs. Keep the parcel number when contacting support.'],
    ['What should I do about damage, missing items, or a delayed parcel?', 'Use the relevant parcel’s after-sales option and attach the details requested by RizzitGO. Keep the parcel number, carrier updates, packaging, and photos of the delivered contents. Check the time limit shown for your specific parcel.'],
    ['Where can I get official support?', 'Use Order Enquiry for item orders and the parcel after-sales action for a shipment. Official RizzitGO support can also be reached through its help links or at support@rizzitgo.com.'],
  ]],
];
