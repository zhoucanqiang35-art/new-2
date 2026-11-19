export const officialGuide = 'https://www.superbuy.com/en/page/guide/shoppingagent/';
export const demo = 'https://www.superbuy.com/en/page/newguide/shoppingagent/';
export const estimate = 'https://www.superbuy.com/en/page/query/freight/';
export const tracking = 'https://www.superbuy.com/en/page/query/package/';
export const signup = 'https://www.superbuy.com/en/page/login?partnercode=8dcUtX&type=register';

export const guide = [
  ['Find the exact Weidian listing', '找到对应的微店商品', 'Search this site by name, item ID or reference photo. Open a product page and compare the gallery with the original Weidian listing. Use the ID to separate visually similar items. Open Superbuy with the product button or copy the original link into Superbuy’s product search.', '在本站按名称、商品 ID 或参考图搜索。打开详情，对比商品轮播与微店原链接。相似款用微店 ID 确认。点击购买入口，或复制微店原链接到 Superbuy 商品搜索框。', '01-select.jpg', 'Superbuy’s official example for entering a product link', officialGuide],
  ['Choose color, size and quantity', '选择颜色、尺码和数量', 'Compare the seller’s measurement chart against an item you own. Confirm color, size, version and included pieces. If Superbuy opens a manual shopping-agent form, copy the exact listing link and enter the seller’s option and quantity before checkout.', '把卖家尺码表与手头合身的商品对照，核对颜色、尺码、版本和配件。若 Superbuy 提示手动下单，填写准确的原商品链接、规格和数量，提交前再核对。', '02-options.jpg', 'Superbuy’s official product option and order screen', demo],
  ['Review the first payment', '核对第一笔费用', 'Review the current variant price and domestic delivery to the warehouse in China. International delivery is handled separately after the items arrive. Plan ahead with the official estimator, especially for bulky parcels.', '先核对所选规格的实时价格和到中国仓库的国内运费。商品入库后再处理国际运费。体积较大的包裹可先用官方估算工具做预算。', '03-payment.jpg', 'Superbuy’s official domestic order payment screen', estimate],
  ['Check your own warehouse photos', '检查自己订单的仓库照片', 'After intake, find the exact item in My Warehouse and review the inspection photos. Check the size tag, color, condition and included pieces. Raise a mismatch in the order or support thread while the item is still in the warehouse.', '入库后在 My Warehouse 找到订单并查看验货照片。检查尺码标签、颜色、外观和配件。发现不符时，在转运前通过订单或客服反馈。', '04-warehouse.jpg', 'Superbuy’s official warehouse and inspection screen', officialGuide],
  ['Build a parcel and compare routes', '合箱并比较国际路线', 'Select the ready items in My Warehouse, enter the destination, and review packing options. Compare eligible routes with packed weight and dimensions. Check restrictions for the contents and route before submitting.', '在 My Warehouse 选择已入库商品，填写目的地并确认包装选项。按包装后的重量和尺寸比较可选路线，提交前核对物品和线路限制。', '05-parcel.jpg', 'Superbuy’s official example for warehouse parcel submission', estimate],
  ['Review shipping charges and track delivery', '核对国际运费和物流', 'Review the shipping charge or deposit before confirming the parcel. After dispatch, use the parcel record or official tracking tool. If the contents differ when it arrives, keep the label and photos so support can identify the parcel.', '确认包裹前核对国际运费或预收费用。出库后在包裹记录或官方查询工具查看物流。收到后发现异常，保留面单和照片供客服核对。', '06-shipping.png', 'Superbuy’s official international shipping payment screen', tracking]
];

export const faq = [
  ['What is the Superbuy spreadsheet?', '什么是 Superbuy 商品表？', 'It is a searchable index of Weidian products from a saved FindSpreadsheet export. It provides item IDs, seller photos, reference prices and Superbuy links. The seller listing and Superbuy checkout show the current information.', '这是基于 FindSpreadsheet 快照的微店商品目录，提供商品 ID、卖家图片、参考价格及 Superbuy 入口。实时信息以原商品页和 Superbuy 结算页为准。'],
  ['How do I find an exact Weidian item?', '怎么找到准确的微店商品？', 'Paste the numeric item ID, original Weidian URL or a Superbuy URL containing the original listing. For names, use a few specific product terms and narrow the results by category.', '粘贴数字商品 ID、微店原链接或包含微店链接的 Superbuy 地址。按名称查找时，输入具体名称并结合分类缩小结果。'],
  ['Can I search for a product using a photo?', '可以用图片找商品吗？', 'Open Search by image next to the text search and choose a clear photo or cropped screenshot. The browser compares listing covers, gallery photos, saved QC photos and the site’s guide and brand images. Confirm the item ID because close visual matches can be different listings.', '点击搜索框旁的搜图入口，选择清晰图片或裁剪后的截图。浏览器会比较商品封面、轮播、已有 QC、操作图和标志。相似图可能属于不同商品，请核对商品 ID。'],
  ['Are listing photos and warehouse QC the same?', '商品图和仓库 QC 图一样吗？', 'Seller photos present a listing. Warehouse QC shows a unit that an agent received. Saved reference QC can come from earlier orders and agents. For your own parcel, use the inspection photos in your Superbuy account.', '卖家图展示商品款式，仓库 QC 展示代购实际收到的某件商品。参考 QC 可能来自历史订单或不同代购。自己的包裹以本人 Superbuy 订单照片为准。'],
  ['What if an item has no reference QC?', '没有参考 QC 怎么办？', 'The product page labels saved QC when available and shows an empty state otherwise. Use listing images for design comparison and wait for your own warehouse photos before forwarding.', '详情页有已保存的 QC 时单独显示，暂无时明确提示。可以用卖家图对比款式，发货前仍应查看自己的仓库验货照片。'],
  ['Does the USD price include shipping?', '美元价格含运费吗？', 'The displayed USD amount is converted from a saved CNY listing price. Verify the selected variant and domestic delivery at checkout. International freight, packing and other services can change the total.', '页面美元价由快照中的人民币商品价换算。所选规格与国内运费以结算时为准。国际运费、包装及服务费用会影响总价。'],
  ['How do I choose a size?', '怎么选尺码？', 'Read the seller’s chart for the exact variant. Tops: compare chest, shoulder and length. Pants: compare waist, rise and inseam. Shoes: check the seller’s size scale and foot-length guidance.', '看对应规格的卖家尺码表。上衣比胸围、肩宽和衣长；裤子比腰围、裆长和内长；鞋类核对尺码体系与建议脚长。'],
  ['Can I ship multiple orders together?', '多个订单可以一起寄吗？', 'When items are ready in My Warehouse, select the ones you want to send together. Compare packing options, route eligibility, actual and dimensional weight, and total cost before submitting.', '商品入库后，在 My Warehouse 选择需要一起寄出的订单，比较打包选项、路线、实重和体积重及总费用后提交。'],
  ['What if the Superbuy product link cannot load?', 'Superbuy 商品链接打不开怎么办？', 'Open the original Weidian listing first. If it is still available, copy it into Superbuy’s official search field. Follow the manual shopping-agent process if offered. If the listing is unavailable, search the catalog for another item.', '先打开微店原链接。原商品仍可访问时，将链接复制到 Superbuy 官网搜索框，按页面提示手动下单。链接失效时可回本站查找其他商品。'],
  ['Where do I check delivery and a problem with my order?', '怎么查物流和反馈订单问题？', 'Use the parcel record or official tracking tool after dispatch. For a variant, missing part or visible damage, contact support through the relevant order and include the parcel or order number and clear photos.', '发出后在包裹详情或官方查询工具看物流。颜色尺码不符、缺件或损坏时，从相关订单联系客服并提供订单号或包裹号及清晰照片。'],
  ['Is this an official Superbuy store?', '这是 Superbuy 官方商店吗？', 'Superbuy Findsheet is an independent product directory. Registration, orders, payments and official support take place on Superbuy. This site may receive referral credit when you use sponsored links.', 'Superbuy Findsheet 是独立商品目录。注册、下单、付款和官方客服由 Superbuy 提供。通过推广链接使用服务时，本站可能获得推广收益。']
];

export const topics = [
  {
    title: ['Superbuy spreadsheet and Weidian finds', 'Superbuy 商品表与微店选品'],
    summary: ['Browse Weidian listings with seller photos, reference prices and direct links to each product page.', '浏览带有卖家照片、参考价格及独立详情页入口的微店商品。'],
    detail: ['Start with the full catalog and filter by product type. Compare listings with the original Weidian page to confirm the seller, item ID and available variants before opening Superbuy.', '从完整目录按商品类型筛选。打开 Superbuy 前，先和微店原页面核对卖家、商品 ID 及可选款式。'],
    queries: ['superbuy spreadsheet', 'superbuy finds', 'weidian spreadsheet'],
    links: [['/spreadsheet/', 'Browse finds']]
  },
  {
    title: ['Find a Weidian product by ID or link', '通过微店 ID 或链接查找商品'],
    summary: ['Paste a Weidian item ID, original listing URL or a Superbuy link that contains the Weidian URL.', '粘贴微店商品 ID、微店原链接，或包含微店原链接的 Superbuy 地址。'],
    detail: ['For a Weidian URL, copy the number after itemID or paste the whole link. Try item 7405460467 to see how the catalog connects the result to its product page and seller link.', '在微店链接中复制 itemID 后的数字，或直接粘贴整条链接。试搜 7405460467，查看结果如何关联商品详情和卖家链接。'],
    queries: ['weidian item id search', 'superbuy weidian link search', 'find weidian product by url'],
    links: [['/spreadsheet/?q=7405460467', 'Try a Weidian ID search']]
  },
  {
    title: ['Superbuy shoes spreadsheet', 'Superbuy 鞋类商品表'],
    summary: ['Find Weidian sneakers and running shoes, then compare colorways and reference prices.', '浏览微店运动鞋和跑鞋，比较配色与参考价格。'],
    detail: ['Check the seller’s size chart and recommended foot length for the exact colorway. Open the gallery to compare the outsole, stitching and size tags where shown.', '查看对应配色的卖家尺码表与建议脚长。打开轮播图，查看已有的鞋底、缝线及尺码标签照片。'],
    queries: ['superbuy shoes spreadsheet', 'superbuy sneaker finds', 'weidian running shoes'],
    links: [['/spreadsheet/?category=shoes', 'Shoes']]
  },
  {
    title: ['Superbuy hoodies, jackets and cargo pants', 'Superbuy 卫衣、外套与工装裤'],
    summary: ['Compare hoodies, jackets and pants by category, seller measurements and available options.', '分类比较卫衣、外套和裤装，核对卖家尺寸与可选规格。'],
    detail: ['Compare chest width and length for tops, and waist, rise and inseam for pants. Use measurements from a garment you already own to judge the fit.', '上衣核对胸宽和衣长，裤装核对腰围、前裆与内长。用自己已有的合身衣物尺寸做对照。'],
    queries: ['superbuy hoodie spreadsheet', 'superbuy jacket finds', 'weidian cargo pants'],
    links: [['/spreadsheet/?category=hoodies-sweaters', 'Hoodies & sweaters'], ['/spreadsheet/?category=jackets', 'Jackets'], ['/spreadsheet/?category=pants-shorts', 'Pants & shorts']]
  },
  {
    title: ['Superbuy football jerseys', 'Superbuy 足球球衣'],
    summary: ['Browse Weidian jersey listings and compare team designs, size charts and name or number options.', '浏览微店球衣，比较球队款式、尺码表及印字印号选项。'],
    detail: ['Check the exact season and home or away design in the seller photos. Where both player and fan versions are listed, compare their measurements and included customization options.', '通过卖家图确认赛季及主客场款式。若同时提供球员版与球迷版，比较两者的尺码和可选定制项。'],
    queries: ['superbuy jersey spreadsheet', 'superbuy football jersey finds', 'weidian football jerseys'],
    links: [['/spreadsheet/?category=jersey', 'Jerseys']]
  },
  {
    title: ['Superbuy image search for similar products', 'Superbuy 图片搜索与相似商品'],
    summary: ['Upload a product photo or cropped screenshot to find visually similar results in the site’s image index.', '上传商品照片或裁剪后的截图，从本站图片索引查找相似结果。'],
    detail: ['Crop out unrelated backgrounds when possible. The browser compares your image with indexed seller photos, saved QC photos and other site images. Check the matching product’s item ID and variant to verify the result.', '尽量裁掉无关背景。浏览器会与已索引的卖家图、已保存的 QC 图及本站其他图片比较。找到相似商品后，请核对商品 ID 与规格。'],
    queries: ['superbuy image search', 'weidian reverse image search', 'find weidian products by photo'],
    links: [['/image-search/', 'Search by image']]
  },
  {
    title: ['Superbuy QC and warehouse photos', 'Superbuy QC 与仓库验货照片'],
    summary: ['See how seller images and saved warehouse QC photos are labeled on a product page.', '在商品详情页查看卖家图和已保存的仓库 QC 图分别如何标注。'],
    detail: ['Saved QC photos are historical references when available. On your own Superbuy order, check the warehouse photos for the size tag, color, condition and included pieces before submitting international delivery.', '可用的历史 QC 图供参考。提交国际转运前，请查看本人 Superbuy 订单的仓库照片，核对尺码标签、颜色、外观与配件。'],
    queries: ['superbuy qc photos', 'superbuy warehouse photos', 'weidian qc photos'],
    links: [['/product/?id=7405460467', 'Open a product with QC photos']]
  },
  {
    title: ['How to buy from Weidian with Superbuy', '如何用 Superbuy 购买微店商品'],
    summary: ['Follow the illustrated guide from the Weidian listing to order submission, warehouse inspection and parcel delivery.', '按图解从微店商品页走到提交订单、仓库验货及包裹寄送。'],
    detail: ['Open the Weidian listing through the product’s Superbuy button and verify the variant and quantity. Review the order, inspect the item once it reaches the warehouse and choose an eligible shipping route for the parcel.', '通过商品的 Superbuy 按钮打开对应链接，核对款式与数量。确认订单，入库后验货，再为包裹选择适用的寄送线路。'],
    queries: ['how to buy from weidian with superbuy', 'how to order on superbuy', 'superbuy weidian buying guide'],
    links: [['/guide/', 'Buying guide']]
  },
  {
    title: ['Superbuy shipping calculator and order costs', 'Superbuy 运费计算器与订单费用'],
    summary: ['Compare the catalog’s reference item price with domestic delivery and international shipping charges.', '分别核对目录商品参考价、中国境内运费及国际运费。'],
    detail: ['Use the official Superbuy calculator with your destination, packed weight and dimensions. Compare eligible routes and check which services are included before confirming the parcel.', '在 Superbuy 官方运费计算器填写目的地、包装后重量与尺寸。比较适用路线和包含的服务，再确认发货。'],
    queries: ['superbuy shipping calculator', 'superbuy international shipping cost', 'superbuy parcel shipping estimate'],
    links: [[estimate, 'Open the official shipping estimator'], ['/guide/#step-05', 'Read the parcel and shipping steps']]
  }
];

export const checks = {
  shoes: ['Confirm the seller’s size scale and foot-length chart. Compare left and right size labels, outsole shape, stitching, and box or accessories if included.', '核对卖家的尺码体系和脚长表，检查左右鞋标签、鞋底形状、缝线和随附配件。'],
  'hoodies-sweaters': ['Compare chest width, shoulder placement, sleeve length and body length. Review the hood, cuffs, hem and any embroidery or print close-ups.', '比较胸宽、肩线、袖长和衣长，检查帽子、袖口、下摆和刺绣或印花细节。'],
  't-shirts': ['Match chest width and length with a shirt you own. Check the neckline, hem, tag and exact placement of any print.', '对比已有衣物的胸宽和衣长，检查领口、下摆、标签和印花位置。'],
  jackets: ['Compare chest, shoulders, sleeve length and layering room. Review zipper, buttons, pockets, cuffs and lining in the exact variant.', '对照胸宽、肩宽、袖长与叠穿空间，检查所选规格的拉链、纽扣、口袋、袖口和内衬。'],
  'pants-shorts': ['Look for flat waist, rise, inseam and leg opening measurements. Verify the closure, pockets and cut of the exact option.', '对照平铺腰围、裆长、内长和裤口，核对所选规格的门襟、口袋与版型。'],
  jersey: ['Check whether the listing is for a player or fan cut. Verify crest placement, name and number options, and whether both front and back match the selected design.', '确认球员版或球迷版，核对队徽位置、印号选项，以及正反面是否与所选款式一致。'],
  accessories: ['Check overall dimensions, what is included, and hardware or fastening details. Ask for a clear measurement or close-up where necessary.', '确认实际尺寸、包含的部件、五金或扣具细节，必要时请客服补充尺寸或近照。'],
  headwear: ['Confirm circumference and adjustability. Compare the brim shape, seams and visible logo placement with the selected version.', '确认头围和调节范围，对比帽檐形状、缝线和标志位置。'],
  ShortSets: ['Check which pieces are included. Compare the measurement chart for each piece and confirm whether separate sizes can be selected.', '确认包含哪些单品，逐件比较尺码表，并确认能否分别选择不同尺码。'],
  electronics: ['Confirm the model, connections, power requirements and included accessories. Check applicable shipping restrictions before ordering.', '确认型号、接口、供电要求和配件，下单前核对适用的运输限制。'],
  'other-stuff': ['Compare the seller’s measurements and options with the images. Check the quantity, material description and included parts with the seller.', '将卖家尺寸和规格与图片对照，向卖家确认数量、材质说明和包含部件。']
};
