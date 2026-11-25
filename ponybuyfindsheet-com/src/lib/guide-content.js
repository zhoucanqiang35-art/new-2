export const officialGuide = 'https://www.ponybuy.com/beginner-guide';
export const officialEstimate = 'https://www.ponybuy.com/estimation';
export const officialReturns = 'https://www.ponybuy.com/help-center/category/93?questionId=1564';
export const sampleDetail = '/product/weidian-7871821866/';

export const guideChinese = {};
function copy(english, chinese) {
  guideChinese[english] = chinese;
  return english;
}

export const shoppingSteps = [
  { title: 'Find an item', text: 'Search by name, listing ID or marketplace link.', href: '/spreadsheet/' },
  { title: copy('Choose options and order', '选款并下单'), text: copy('Check the seller, size and color before checkout.', '结账前确认卖家、尺码和颜色。'), href: '/guides/how-to-buy/' },
  { title: copy('Review warehouse photos', '查看仓库验货照片'), text: copy('Check the item before submitting it for shipping.', '提交国际发货前检查到仓商品。'), href: '/guides/warehouse-qc/' },
  { title: 'Plan shipping', text: 'Review the parcel details and costs before you pay.', href: '/guides/shipping/' },
];

export const faqGroups = [
  {
    title: copy('Finding and ordering products', '找货与下单'),
    items: [
      {
        question: 'What is the PonyBuy Spreadsheet?',
        answer: copy('Findsheet is a catalog maintained by Findspreadsheet. Search by product name, Weidian ID or seller link. The product page shows seller photos, available options and a reference price. PonyBuy handles ordering, warehouse inspection and shipping after you open its product page.', 'Findsheet 是 Findspreadsheet 维护的商品目录。可以按名称、微店商品编号或卖家链接找货。详情页显示卖家图片、可选款式和参考价。打开 PonyBuy 商品页后，由 PonyBuy 处理下单、仓库验货和发货。'),
        link: ['Browse the spreadsheet', '/spreadsheet/'],
      },
      {
        question: 'How do I order an item through PonyBuy?',
        answer: copy('Open the item on Findsheet and verify the listing ID, style and size. Select “Open PonyBuy listing,” sign in on PonyBuy and check the live options and quantity again. At checkout, review the item total, domestic delivery and any optional services before confirming payment.', '先在 Findsheet 打开详情，核对商品编号、款式和尺码。点击「在 PonyBuy 上购买」，在 PonyBuy 登录并重新确认实时款式、尺码和数量。付款前核对商品总价、中国境内运费和所选增值服务。'),
        link: [copy('See the illustrated buying guide', '查看图文下单指南'), '/guides/how-to-buy/'],
      },
      {
        question: 'Can I search with a Weidian link?',
        answer: copy('Yes. Paste the original Weidian product link or enter the numeric listing ID, such as 7871821866. If the listing is outside the catalog, open the full Findspreadsheet catalog from the empty result or paste the original link into PonyBuy and verify the imported listing.', '可以。粘贴微店原始商品链接，或输入商品编号，例如 7871821866。如果目录里没有这件商品，可从空结果页进入 Findspreadsheet 完整目录，也可把原始链接粘贴到 PonyBuy 并核对导入结果。'),
      },
      {
        question: 'Can I search with a product photo?',
        answer: copy('Yes. Upload a clear product photo or choose “Search with this photo” from a listing. The search compares images from this catalog inside your browser. Check the title, options and original seller page before deciding whether a similar-looking result matches.', '可以。上传清晰商品图，或在详情页点击「用此照片搜索」。搜索会在浏览器中比对本站商品图。找到相似图片后，再核对商品名称、款式和原卖家页面。'),
        link: ['Image search', '/image-search/'],
      },
      {
        question: copy('Can I use another buying platform?', '可以用其他代购平台吗？'),
        answer: copy('Open “Other buying platforms” on the product page and choose a platform by its name and logo. Each link points to that platform’s version of the same seller listing. Compare stock, fees, shipping routes and after-sales terms on the platform you select.', '在详情页展开「其他代购平台」，按名称和 Logo 选择。每个入口对应同一卖家商品在该代购平台的页面。库存、费用、配送线路和售后规则以你选择的平台为准。'),
      },
    ],
  },
  {
    title: copy('Warehouse, fees and delivery', '仓库、费用与配送'),
    items: [
      {
        question: 'Does the displayed price include shipping?',
        answer: copy('The price on Findsheet is a currency conversion of the seller’s item price. The first PonyBuy payment can include the item and seller-to-warehouse delivery. After warehouse arrival, PonyBuy quotes international shipping for the packed parcel. Optional packaging, insurance and applicable import charges can increase the total.', 'Findsheet 的标价是卖家商品原价的币种换算。首次在 PonyBuy 付款可能包含货款和卖家发往仓库的境内运费。到仓后，PonyBuy 会按打包后的包裹报价国际运费。额外包装、保险及适用的进口费用可能增加总开支。'),
        link: [copy('Estimate shipping costs', '估算运费'), '/guides/shipping/'],
      },
      {
        question: copy('Where can I see quality-check photos?', '在哪里看仓库验货照片？'),
        answer: copy('After inspection, open the item in PonyBuy’s User Center → Warehouse. Compare the warehouse photos with the order details and inspect the size tag, color and obvious defects. The images on Findsheet show the seller listing. Use the warehouse photos to check the exact item received.', '验货完成后，在 PonyBuy 的用户中心进入 Warehouse 仓库，打开对应商品。对照订单核对尺码标签、颜色和明显瑕疵。Findsheet 上的商品图片来自卖家详情，仓库照片对应实际到仓商品。'),
        link: [copy('Read the warehouse photo guide', '查看仓库验货图文指南'), '/guides/warehouse-qc/'],
      },
      {
        question: copy('What if my item arrives damaged or in the wrong size?', '到仓后发现破损或尺码不对怎么办？'),
        answer: copy('Keep the item in the warehouse and contact PonyBuy through the order or after-sales service. Provide the order number and identify the relevant photo. Check the current return or exchange window, seller eligibility and any domestic return fee before you submit the parcel.', '先把商品留在仓库，通过订单咨询或售后联系 PonyBuy。提供订单编号，并指出能看到问题的照片。提交国际包裹前核对退换时限、卖家是否支持退换，以及可能产生的境内退货运费。'),
        link: [copy('Check PonyBuy’s returns policy', '查看 PonyBuy 退换政策'), officialReturns],
      },
      {
        question: copy('Can I combine orders into one parcel?', '可以把多笔订单合成一个包裹吗？'),
        answer: copy('Once the items are available in Warehouse, select the ones you want to ship together and start a parcel. Review the packed size, destination, route limits and any paid packaging options. If an item restricts the route you want, compare shipping it separately before you pay.', '等商品在 Warehouse 仓库显示可发货后，勾选想合包的商品并发起包裹。核对包装尺寸、目的地、线路限制和付费包装选项。如果个别商品限制了想用的路线，可先比较拆包运输的方案。'),
      },
      {
        question: copy('Where do I track international delivery?', '在哪里查国际物流？'),
        answer: copy('After dispatch, open User Center → Parcels on PonyBuy. Open the parcel to see its status and tracking information. Keep the parcel number and delivery photos if you need to ask PonyBuy about a delay, damage or a missing item.', '发出后，在 PonyBuy 用户中心打开 Parcels 包裹页，点进包裹看状态和物流单号。如遇延误、破损或少件，保留包裹编号和收货照片，方便联系 PonyBuy。'),
        link: [copy('See the parcel and tracking guide', '查看发货与物流指南'), '/guides/parcel-tracking/'],
      },
    ],
  },
];

const screen = (image, caption, marks = []) => ({ src: image.startsWith('/') ? image : '/media/guides/' + image, caption, marks });
const official = (label = copy('PonyBuy official beginner guide', 'PonyBuy 官方新手指南')) => ({ label, href: officialGuide });

export const guides = [
  {
    slug: 'how-to-buy',
    title: copy('How to buy through PonyBuy', '如何在 PonyBuy 下单'),
    description: copy('Start with a Findsheet listing, confirm the seller options and place the item order on PonyBuy.', '从 Findsheet 找到商品，核对卖家选项后在 PonyBuy 下单。'),
    source: official(),
    sections: [
      { title: 'Find an item', text: copy('Search Findsheet by name, Weidian ID or seller URL. Try 7871821866 and open the matching result to inspect its seller photos.', '用商品名称、微店编号或卖家链接搜索 Findsheet。可输入 7871821866，打开对应结果查看卖家图片。'), link: ['Browse the spreadsheet', '/spreadsheet/?q=7871821866'] },
      { title: copy('Open the matching PonyBuy listing', '打开对应 PonyBuy 商品页'), text: copy('Compare the item ID, reference price and variant options. Use the PonyBuy button for the same Weidian listing, or copy the seller URL if you need to import it manually.', '核对商品编号、参考价和款式。点击 PonyBuy 按钮进入同一微店商品的代购页，也可复制原链接后手动导入。'), link: [copy('Open the Findsheet example', '打开 Findsheet 实际示例'), sampleDetail],
        figure: screen('findsheet-item.webp', copy('Findsheet product page. ① Open PonyBuy listing. ② Copy the original seller link.', 'Findsheet 商品详情页。① 打开 PonyBuy 商品。② 复制卖家原始链接。'), [[1,53,73],[2,79,88]]) },
      { title: copy('Confirm the live variant and quantity', '确认实时款式、尺码和数量'), text: copy('On PonyBuy, choose the actual color, size and quantity offered by the seller. Recheck the live item total and domestic delivery before you select the available checkout option.', '在 PonyBuy 重新选择卖家实时提供的颜色、尺码和数量。使用购物车或立即购买前，核对实时货款和境内运费。'),
        figure: screen('pony-order.webp', copy('PonyBuy official example. ① Color options. The red outline marks Buy Now and Add to Cart.', 'PonyBuy 官方实操图。① 颜色选项。红框标出了立即购买和加入购物车。'), [[1,37,27]]) },
      { title: copy('Review and pay for the item order', '核对后支付商品订单'), text: copy('At checkout, confirm the item, seller delivery charge and any optional service before paying. Follow order updates until PonyBuy receives the item at its warehouse.', '在结账页核对商品、卖家境内运费和所选增值服务后再付款。随后可查看订单进度，等商品抵达 PonyBuy 仓库。'),
        figure: screen('pony-pay.webp', copy('PonyBuy official checkout example showing the order summary and payment controls.', 'PonyBuy 官方结账图，展示订单总额和支付区域。'), [[1,87,94]]) },
    ],
    next: { label: copy('Review warehouse photos', '查看仓库验货指南'), href: '/guides/warehouse-qc/' },
  },
  {
    slug: 'seller-options',
    title: copy('How to check a seller listing and its options', '如何核对商品链接、尺码和款式'),
    description: copy('Match the listing ID, compare variants and open the same item in your preferred agent.', '核对商品编号、比较款式，并在所选代购平台打开同一商品。'),
    sections: [
      { title: copy('Match the seller and listing ID', '核对卖家和商品编号'), text: copy('Open the original seller listing from the platform menu. Compare the listing ID, seller photos and variant labels with the Findsheet product page.', '在代购平台菜单打开卖家原始页面，对照 Findsheet 的商品编号、卖家图片和款式名称。'), link: [copy('Open the Findsheet example', '打开 Findsheet 实际示例'), sampleDetail] },
      { title: copy('Compare size and style before paying', '付款前比较尺码和款式'), text: copy('If the seller provides a size chart, compare its measurements with an item you already own. After opening PonyBuy or another platform, verify the selected variant and current price again. Findsheet selections help you compare options on this page.', '如果卖家提供尺码表，可用手头合身衣物的实际尺寸对照。打开 PonyBuy 或其他平台后，再核对所选款式与实时价格。Findsheet 的选项用于在本站比较。'), figure: screen('findsheet-options.webp', copy('Findsheet product page with the seller’s style and size options marked.', 'Findsheet 商品详情，标出了卖家提供的款式和尺码选项。'), [[1,12,5],[2,13,84]]) },
    ],
    next: { label: copy('Read the buying guide', '查看下单指南'), href: '/guides/how-to-buy/' },
  },
  {
    slug: 'image-search',
    title: 'How to find a product by image',
    description: 'Use a photo to find similar items, then compare the seller listing and options.',
    sections: [
      { title: 'Start with a clear product photo', text: 'Crop out browser menus and unrelated objects when possible. A photo that shows the full product usually helps.' },
      { title: 'Upload a product image', text: copy('Choose an image on Findsheet or open image search with an existing product photo. Select Search matches to compare it with catalog photos.', '在 Findsheet 选择图片，也可以用现有商品图打开搜图页。点击搜索匹配商品，和目录照片比对。'), figure: screen('findsheet-image.webp', copy('Findsheet image search. ① Choose the product photo. ② Load the sample image.', 'Findsheet 图片搜索。① 选择商品照片。② 加载示例图片。'), [[1,41,64],[2,38,91]]) },
      { title: 'Compare the results', text: 'Review the product title, pictures and seller listing before selecting a match. Similar-looking results may have different colors or versions.' },
    ],
    next: { label: 'Open image search', href: '/image-search/' },
  },
  {
    slug: 'warehouse-qc',
    title: copy('How to review warehouse QC photos', '如何看仓库 QC 验货图'),
    description: copy('Find the inspection photos in PonyBuy and check the item before international shipping.', '在 PonyBuy 找到仓库验货照片，国际发货前核对实际商品。'),
    source: official(),
    sections: [
      { title: copy('Find the item in Warehouse', '在 Warehouse 仓库中找到商品'), text: copy('After PonyBuy has received and inspected the item, open User Center and choose Warehouse. Find the item using your order details and open its inspection photos.', 'PonyBuy 收货并完成验货后，进入用户中心的 Warehouse 仓库，用订单信息找到商品，再打开验货照片。'), figure: screen('pony-warehouse.webp', copy('PonyBuy User Center navigation. ① Open Warehouse to find the inspected item.', 'PonyBuy 用户中心导航。① 进入 Warehouse 仓库查看已验货商品。'), [[1,24,63]]) },
      { title: copy('Inspect the item and its labels', '检查商品与标签'), text: copy('Compare the warehouse photos with the seller page. Check the color, condition, visible measurements and size tags. If a detail is missing, check with PonyBuy before you ship.', '把仓库照片与卖家页面对照。重点查看颜色、外观、可见尺寸和尺码标。如照片缺少某处细节，发货前向 PonyBuy 核实。'), figure: screen('/media/qc-7321418559-1.webp', copy('Findspreadsheet warehouse photo example. Use your own PonyBuy order photos to inspect the item you received.', 'Findspreadsheet 仓库实拍示例。请以你自己 PonyBuy 订单里的验货图核对到仓商品。')) },
      { title: copy('Report a mismatch before submitting a parcel', '发现问题时先联系售后'), text: copy('Use the order enquiry or after-sales entry to explain the issue and identify the relevant photo. Confirm available return or exchange options and deadlines before international dispatch.', '通过订单咨询或售后入口描述问题，并注明对应的验货照片。国际发出前确认可用的退换选项和处理时限。'), link: [copy('Check PonyBuy’s returns policy', '查看 PonyBuy 退换政策'), officialReturns] },
    ],
    next: { label: copy('Estimate shipping costs', '估算运费'), href: '/guides/shipping/' },
  },
  {
    slug: 'shipping',
    title: 'How to estimate shipping costs',
    description: 'Review the order total, parcel dimensions and shipping quote in PonyBuy.',
    source: { label: copy('PonyBuy official shipping estimator', 'PonyBuy 官方运费估算器'), href: officialEstimate },
    sections: [
      { title: 'Check the item and seller delivery costs', text: 'The listing price covers the item shown. Review any delivery charge from the seller to the warehouse and any services you select in PonyBuy.' },
      { title: copy('Enter the destination and parcel measurements', '填写目的地和包裹信息'), text: copy('In PonyBuy’s Shipping Fee Estimation, choose the destination, enter the weight in grams and add the item category and parcel dimensions when available. Select Inquire to see eligible routes and estimates.', '在 PonyBuy 的 Shipping Fee Estimation 里选择目的地，重量按克填写，已知时补充商品类别和包裹长宽高。点击 Inquire 查看可用线路和估算价。'), link: [copy('Open the official estimator', '打开官方运费估算器'), officialEstimate],
        figure: screen('pony-estimation.webp', copy('PonyBuy estimator. ① Destination. ② Weight in grams. ③ Parcel dimensions. ④ Inquire.', 'PonyBuy 运费估算器。① 目的地。② 重量（克）。③ 包裹长宽高。④ 查询。'), [[1,10,32],[2,60,32],[3,64,54],[4,42,84]]) },
      { title: 'Check the current total before paying', text: copy('Compare route restrictions, transit estimates, packaging and any applicable import charges. PonyBuy’s final parcel amount reflects the packed weight and dimensions and the route selected at submission.', '比较路线限制、运输时效、包装和适用的进口费用。提交时的最终包裹金额取决于打包后的重量、尺寸和你选的线路。') },
    ],
    next: { label: copy('See the parcel and tracking guide', '查看发货与物流指南'), href: '/guides/parcel-tracking/' },
  },
  {
    slug: 'parcel-tracking',
    title: copy('How to consolidate, ship and track a parcel', '如何合包、发货和查物流'),
    description: copy('Submit stored items for delivery and follow the tracking updates in PonyBuy.', '选择已入库商品提交发货，并在 PonyBuy 查看物流更新。'),
    source: official(),
    sections: [
      { title: copy('Select items for the parcel', '勾选要发货的商品'), text: copy('In Warehouse, select the inspected items you want to ship together. Review the destination, available shipping lines and any packaging or insurance you choose before submitting.', '在 Warehouse 仓库勾选要一起发出的已验货商品。提交前核对目的地、可用物流线路以及所选包装或保险。') },
      { title: copy('Review the shipping payment', '核对国际运费付款'), text: copy('Check the displayed shipping deposit, parcel details and extra charges before payment. Keep the parcel reference so you can find it later in User Center.', '付款前核对预收运费、包裹信息和额外费用。保存包裹编号，方便之后在用户中心找到它。'), figure: screen('pony-parcel.webp', copy('PonyBuy official parcel example showing the international shipping payment step.', 'PonyBuy 官方发货图，展示国际运费付款步骤。'), [[1,75,89]]) },
      { title: copy('Track the parcel after dispatch', '发出后查询国际物流'), text: copy('Open User Center → Parcels. Select the parcel to see its status and tracking details. If delivery stalls or there is an issue on arrival, use the parcel record when contacting PonyBuy support.', '进入用户中心的 Parcels 包裹页面，打开对应包裹查看状态和物流信息。如果物流长时间停滞，或收货时发现问题，可用包裹记录联系 PonyBuy 客服。'), figure: screen('pony-track.webp', copy('PonyBuy official Parcels example. The tracking controls appear on the parcel record.', 'PonyBuy 官方包裹页面示例。物流查询入口在包裹记录中。')) },
    ],
    next: { label: 'All guides', href: '/guides/' },
  },
];

copy('Try searching', '试试搜索');
copy('Open full-size screenshot', '打开大图');
copy('Shopping and delivery', '购物与配送');
copy('From choosing an item to tracking a parcel, follow the steps for your order.', '从选货到查物流，按当前购物进度查看对应步骤。');

copy('Choose by name', '按名称选择');
copy('Select an option', '请选择');

copy('Try “Graphic T-Shirt” or an item ID', '试搜“Graphic T-Shirt”或商品编号');
copy('Search 2,255 indexed product photos, including gallery and style photos.', '可搜索已收录的 2,255 张商品图，包括详情图和款式图。');

copy('Search by product name, marketplace listing ID or source link across the Findspreadsheet catalog.', '可按商品名称、商品编号或原商品链接搜索 Findspreadsheet 商品目录。');
copy('Loading catalog…', '正在加载商品目录…');
copy('Loading product…', '正在加载商品…');
copy('The full catalog could not be loaded. Reload the page to try again.', '商品目录暂时加载失败，请刷新页面重试。');
copy('This product is not in the catalog.', '商品目录中没有此商品。');

copy('Show all matches', '显示所有匹配商品');
copy('Show paged results', '分页显示');

copy('Product photo is temporarily unavailable.', '商品图片暂时无法加载。');
