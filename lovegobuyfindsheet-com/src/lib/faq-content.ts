const purchaseGuide = "https://www.lovegobuy.com/article/index?article_id=10003";
const fees = "https://www.lovegobuy.com/article/index?article_id=10019";
const estimator = "https://m.lovegobuy.com/shipping/estimation/index";
const help = "https://www.lovegobuy.com/help-center/index";
const storage = "https://lovegobuy.com/article/index?article_id=10075";

export const faqTopics = [
  {
    id: "finds",
    title: "Spreadsheet, finds and image search",
    entries: [
      {
        id: "lovegobuy-spreadsheet",
        question: "What is the LoveGoBuy spreadsheet and how do I use it?",
        answer: [
          "This LoveGoBuy spreadsheet is an independent catalog of FindSpreadsheet Weidian listings. Filter by category, search by item name or ID, and open a product to see its listing photos, estimated USD price and any available QC photos.",
          "Use the Buy on LoveGoBuy button to open the matching item on the agent. Confirm the seller, variant, stock and current price there before ordering. You can compare other agents using the same Weidian item ID.",
        ],
        links: [{label: "Browse the LoveGoBuy spreadsheet", href: "/browse/"}],
      },
      {
        id: "lovegobuy-weidian-taobao-1688",
        question: "Can LoveGoBuy buy from Weidian, Taobao, Tmall and 1688?",
        answer: [
          "LoveGoBuy’s purchase guide lists Weidian, Taobao, Tmall and 1688 as sources for link-based purchasing. Paste the seller’s original product link into LoveGoBuy, then select the size, color, quantity and any other listed options.",
          "The items indexed on this Findsheet are Weidian finds. If you already have a Taobao or 1688 product link, open it through LoveGoBuy directly and confirm that the agent retrieved the intended listing.",
        ],
        links: [{label: "Official LoveGoBuy purchase guide", href: purchaseGuide}],
      },
      {
        id: "lovegobuy-image-search",
        question: "How does LoveGoBuy image search work on this spreadsheet?",
        answer: [
          "Open Image Search and select a clear photo of one item. Crop busy backgrounds, screenshots with multiple items and large text overlays before searching. The browser compares your photo with catalog, carousel and warehouse images and ranks visually similar listings.",
          "Open likely matches and confirm the original item ID, seller photos and variant. Similarity results can include different sellers or versions of the same style.",
        ],
        links: [{label: "Open LoveGoBuy image search", href: "/image-search/"}],
      },
      {
        id: "lovegobuy-sizing",
        question: "How should I check sizes on LoveGoBuy finds?",
        answer: [
          "Compare the seller’s size chart with measurements from a similar garment you already own. Check how chest width, garment length and sleeve length were measured, and confirm whether each value is in centimeters or inches.",
          "For shoes, compare the size system and any insole or foot-length measurements offered by the seller. Use the listing photos and available QC to compare the selected variant before submitting the parcel.",
        ],
        links: [{label: "See the product buying checklist", href: "/#product-introduction"}],
      },
    ],
  },
  {
    id: "buying",
    title: "Buying, payment and USD prices",
    entries: [
      {
        id: "how-to-buy-on-lovegobuy",
        question: "How do I buy through LoveGoBuy for the first time?",
        answer: [
          "Open a Findsheet product on LoveGoBuy or paste its seller link into the agent. Select the variant and quantity, then review your order. LoveGoBuy purchases the item from the seller and receives it at its warehouse in China.",
          "Once the item arrives, review the warehouse photos and choose which items to send. Submit the parcel, select an international route and review the shipping charge. After dispatch, check the parcel record for tracking.",
        ],
        links: [{label: "View the illustrated buying guide", href: "/guide/how-to-buy/"}, {label: "Official LoveGoBuy purchase guide", href: purchaseGuide}],
      },
      {
        id: "lovegobuy-prices-usd",
        question: "What does the LoveGoBuy spreadsheet price in USD include?",
        answer: [
          "The amount on the Findsheet is an estimated item price in US dollars, calculated from the recorded seller price using a reference exchange rate.",
          "Check the agent’s current item amount and domestic delivery charge at checkout. Review international shipping and any optional packaging or other applicable charges when you submit the parcel. Those costs can vary with the route and destination.",
        ],
        links: [{label: "Official LoveGoBuy fee breakdown", href: fees}],
      },
      {
        id: "lovegobuy-payment-stages",
        question: "When do I pay the item price and international shipping?",
        answer: [
          "The item payment is part of placing the shopping order. International shipping is a separate step after warehouse arrival, when you choose which items to pack together, enter your delivery details and select a route.",
          "Review the currency and final amount on the LoveGoBuy payment screen. If the order shows an outstanding balance, check the explanation in the order and contact support with the order number if you need help.",
        ],
        links: [{label: "Official LoveGoBuy purchase guide", href: purchaseGuide}],
      },
    ],
  },
  {
    id: "warehouse",
    title: "Warehouse QC, storage and returns",
    entries: [
      {
        id: "lovegobuy-qc-photos",
        question: "Where can I find LoveGoBuy QC photos and what should I check?",
        answer: [
          "Before buying, look for available warehouse photos on the Findsheet product page or try its Weidian ID in QC Finder. After ordering, open your item in the LoveGoBuy warehouse to see the inspection photos attached to your order.",
          "Compare color, design placement, labels, stitching and any visible measurements. If an angle or measurement is missing, ask LoveGoBuy what additional inspection options are available before you submit the parcel.",
        ],
        links: [{label: "Open the QC Finder", href: "/qc/"}, {label: "Official LoveGoBuy Help Center", href: help}],
      },
      {
        id: "lovegobuy-missing-qc",
        question: "What does it mean if a spreadsheet product has no QC photos?",
        answer: [
          "The Findsheet may have no warehouse photos for that Weidian listing. In this case the detail page identifies any carousel images repeated in the QC section as listing photos. Use those images to compare the seller’s advertised variants.",
          "An earlier warehouse photo for a listing can also show a different size, color or production run. For your own item, use the photos attached to the order in your LoveGoBuy warehouse.",
        ],
        links: [{label: "Open the QC Finder", href: "/qc/"}],
      },
      {
        id: "lovegobuy-warehouse-storage",
        question: "How long can an item stay in the LoveGoBuy warehouse?",
        answer: [
          "LoveGoBuy’s storage article states a 60-day period starting when the order is marked stored. Check the deadline shown for each item in your own warehouse, especially if purchases arrive on different days.",
          "Plan the parcel around the earliest deadline. Contact LoveGoBuy in advance if a late item or an unresolved QC issue may affect your shipping date.",
        ],
        links: [{label: "Official LoveGoBuy storage policy", href: storage}],
      },
      {
        id: "lovegobuy-returns-refunds",
        question: "Can I request a return, exchange or refund after warehouse QC?",
        answer: [
          "If the warehouse photos show damage, the wrong variant or a size concern, open the order and contact LoveGoBuy before shipping it internationally. Include the item number, the issue and the relevant photos.",
          "The available resolution depends on order status, seller terms and the applicable after-sales rules. Check the deadline, possible return shipping charges and refund method in the order or with support.",
        ],
        links: [{label: "Official LoveGoBuy Help Center", href: help}],
      },
    ],
  },
  {
    id: "shipping",
    title: "Shipping calculator, consolidation and tracking",
    entries: [
      {
        id: "lovegobuy-shipping-calculator",
        question: "How do I use the LoveGoBuy shipping calculator?",
        answer: [
          "Enter the destination, item type, estimated actual weight and parcel dimensions when available. Compare the eligible routes and check any weight, size or category restrictions before choosing one.",
          "Some routes use billed weight based on actual or volumetric weight. A large box can cost more even when its contents are light. Use the packed dimensions and final route quote when submitting the parcel.",
        ],
        links: [{label: "Official LoveGoBuy shipping calculator", href: estimator}],
      },
      {
        id: "lovegobuy-parcel-consolidation",
        question: "Can I consolidate several LoveGoBuy orders into one haul?",
        answer: [
          "In the warehouse, select the stored items you want to send together and create a parcel. Compare the available routes for that combined selection, including any limits on dimensions, weight or item types.",
          "If a route is unavailable or the estimated parcel is too large, compare smaller groups of items. For bulky purchases, check whether a packing estimate or rehearsal is available before committing to a route.",
        ],
        links: [{label: "Official LoveGoBuy purchase guide", href: purchaseGuide}, {label: "Official LoveGoBuy shipping calculator", href: estimator}],
      },
      {
        id: "lovegobuy-shipping-tracking",
        question: "How long does LoveGoBuy shipping take and where do I track it?",
        answer: [
          "The delivery estimate depends on the selected route and destination. Allow separate time for the seller to send the item to the warehouse, warehouse processing and packing before international dispatch.",
          "Open Parcels in LoveGoBuy and select the dispatched parcel for its tracking number and status. Check the carrier’s updates when available, and share the parcel number with support if the status remains unclear.",
        ],
        links: [{label: "Official LoveGoBuy purchase guide", href: purchaseGuide}],
      },
      {
        id: "lovegobuy-customs",
        question: "Where do I check LoveGoBuy shipping restrictions and customs information?",
        answer: [
          "Review your route’s rules for the exact item category and destination. The LoveGoBuy shipping estimator lists common restrictions and eligible routes can differ for electronics, liquids and other special items.",
          "For import requirements, check your destination’s customs authority and the instructions shown at parcel submission. Keep the order details and use accurate item descriptions and values where a declaration is required.",
        ],
        links: [{label: "Official LoveGoBuy shipping calculator", href: estimator}, {label: "Official LoveGoBuy Help Center", href: help}],
      },
    ],
  },
];
