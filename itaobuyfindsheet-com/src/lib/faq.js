export const faqSections = [
  {
    id: 'spreadsheet',
    title: 'Spreadsheet, finds and search',
    questions: [
      ['What is the iTaoBuy Spreadsheet?', 'It is an independent Findspreadsheet catalog for browsing Weidian product links before using iTaoBuy. Each listing has an item ID, a route to the seller listing, and a Buy on iTaoBuy button.'],
      ['Is this the official iTaoBuy website?', 'Findspreadsheet publishes this catalog. iTaoBuy handles registration, orders, warehouse services and payment on its own website. Use the official site for account or order support.'],
      ['How do I find iTaoBuy shoes, hoodies or accessories?', 'Open the matching category or search the spreadsheet by product name. If you already have a Weidian product ID, enter it directly to find that specific item.'],
      ['Can I search using a photo?', 'Yes. Choose a JPEG, PNG or WebP image up to 12 MB on the Image Search page. The browser compares it with the preview image index. Open likely matches and confirm the design and item ID before ordering.'],
      ['What if the spreadsheet does not find my product?', 'Try a shorter name, check the Weidian item ID, or use image search. If you already have the original seller URL, paste it into the official iTaoBuy search box and check whether iTaoBuy can retrieve it.'],
    ],
  },
  {
    id: 'orders',
    title: 'Product links and iTaoBuy orders',
    questions: [
      ['How do I buy a Weidian product through iTaoBuy?', 'Open a Findspreadsheet product, select Buy on iTaoBuy, and verify the original listing, style, size and quantity on iTaoBuy. Sign in before proceeding with the official order.'],
      ['Can I copy the original Weidian product link?', 'Yes. Use Copy product link on the product page. The Product links menu next to the language selector also provides the original Weidian listing and the matching Findspreadsheet page.'],
      ['Why does a product have no style or size selector here?', 'This preview shows seller specifications when source data is available. On the iTaoBuy listing, review the live seller options, stock, and measurements for the actual item.'],
      ['Can I order from marketplaces other than Weidian?', 'The catalog focuses on Weidian products. The official iTaoBuy home page describes support for additional Chinese marketplaces. Paste the original marketplace link there to check your specific listing.'],
      ['I opened an item and the seller price or options changed. Which do I use?', 'Use the live iTaoBuy order page to confirm the selected SKU, current price, quantity, availability and any charges before paying. Catalog snapshots and seller options can change.'],
    ],
  },
  {
    id: 'qc',
    title: 'QC photos and warehouse inspection',
    questions: [
      ['What are QC photos?', 'QC photos are reference inspection images taken after an item reaches a warehouse. Use the exact item ID to identify the listing, then check whether the pictured variant matches what you intend to order.'],
      ['How do I find Weidian QC photos before ordering?', 'Open the product detail or paste its original Weidian link into the QC finder. This preview includes verified examples, including item 7321418559 with 12 warehouse photos.'],
      ['How are warehouse QC and seller photos different?', 'Seller photos show how a seller presents the listing. Warehouse QC shows an actual unit checked by the service that captured the photo. Inspect the colorway, labels, stitching, sole, print and packaging when visible.'],
      ['What does “no QC photos” mean?', 'It means the checked data set has no reference photos for that item. Other preview listings may show an unchecked status. For your actual order, review the photos available in your own iTaoBuy account.'],
      ['Can I ask about a problem found in warehouse photos?', 'Check the affected order and iTaoBuy’s current after-sales options. Note the item ID, SKU and what the photo shows. Eligibility and deadlines depend on the seller and current iTaoBuy policy.'],
    ],
  },
  {
    id: 'prices',
    title: 'Currency, fees and payments',
    questions: [
      ['Are iTaoBuy Spreadsheet prices in US dollars?', 'USD is the default display currency. Use the currency button next to the language control to view the same reference prices in supported currencies.'],
      ['Does changing language also change the currency?', 'The controls are independent. For example, you can browse in English and display Canadian dollars, or use Chinese with prices in USD. Both choices are saved in your browser.'],
      ['How are the converted catalog prices calculated?', 'Catalog amounts are recorded in CNY. The preview estimates USD using a conversion observed on iTaoBuy product pages and uses dated European Central Bank cross-rates for other currencies. Select CNY to see the original amount. Use iTaoBuy checkout for payment.'],
      ['Does the reference price include shipping?', 'Treat the catalog price as an item reference. Check domestic delivery, any applicable service or payment charges, international shipping, and customs charges separately.'],
      ['Can I use an iTaoBuy coupon?', 'Check the offer in your official account before paying. Eligibility can depend on route, expiry, minimum spend and whether the offer covers a product order or international shipping.'],
    ],
  },
  {
    id: 'shipping',
    title: 'Freight estimates, parcels and delivery',
    questions: [
      ['How do I use the official iTaoBuy shipping calculator?', 'Open Freight Estimate on iTaoBuy, select the destination, and enter the packed weight and any required dimensions or product details. Compare available routes using the same inputs.'],
      ['What is volumetric weight?', 'Some routes account for how much space a parcel takes. Check the line’s measurement and billing rules. The final charge can differ from an estimate when a packed parcel is measured.'],
      ['Can I ship multiple items in one parcel?', 'iTaoBuy’s official buying workflow describes selecting items in the warehouse and submitting them as one parcel. Review restrictions, packaging, size limits and route eligibility before combining items.'],
      ['How long will shipping take?', 'Read the current estimate for the selected line and destination. Seller dispatch, warehouse intake, carrier timing and customs can affect the overall delivery time.'],
      ['Where do I track delivery or ask for support?', 'Use your parcel or order record in the official iTaoBuy account. If tracking stalls or a parcel has a problem, gather the order number, parcel number and tracking event before contacting iTaoBuy support.'],
    ],
  },
];
