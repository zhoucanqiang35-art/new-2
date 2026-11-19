import { productIntroduction } from './product-intro.mjs';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guide, faq, topics, checks } from './editorial.mjs';

// When refreshing translations, provide the approved FindSpreadsheet-derived UI-locale export.
const source = process.argv[2];
if (!source) throw Error('Pass the path to the UI locale export.');
const target = fileURLToPath(new URL('../dist/locales/', import.meta.url));
const remap = {
  'All Finds on Superbuy Spreadsheet':'All Finds on Sugargoo Spreadsheet',
  'View on Superbuy':'View on Sugargoo',
  'Register':'Register on Sugargoo',
  'Register on Superbuy':'Register on Sugargoo',
  'Superbuy spreadsheet FAQ':'Sugargoo spreadsheet FAQ',
  'How to buy with Superbuy':'How to buy on Sugargoo',
  'Official practice demo':'Watch Sugargoo’s demo',
  'Official Superbuy reference':'Sugargoo’s official tutorial',
  'Superbuy spreadsheet search guide':'Sugargoo spreadsheet, Weidian finds and image search',
  'Track a parcel':'Where do I track my parcel?',
  'Open SEO guide':'SEO',
  'Saved products':'Show saved products',
  'View all products':'Browse all',
  'Product introduction':'Product Details',
  'Seller snapshot price':'Price',
  'Before you order':'Before you buy',
  'Site directory':'Main navigation',
  'Sort by':'Sort by',
  'View on Weidian':'View on Weidian',
  'Reference listing price. Delivery and optional services are separate. Confirm the exact variant and payable amount on Superbuy.':'Reference listing price. Check the current price and options on Sugargoo.',
  'Independent guide by FindSpreadsheet. Reference prices exclude delivery and optional services. Some links are referral links.':'Reference prices exclude delivery and optional services. Some links are referral links.',
  'Historical reference QC from FindSpreadsheet. Review your own Superbuy warehouse photos before shipping.':'Historical warehouse photos may come from another agent. When none are available, the reference section displays the seller’s gallery. For a real warehouse photo example, try item 7405460467.',
  '{0} is a Weidian listing in the {1} category. The linked seller page, image gallery and Superbuy entry refer to item {2}.':'{0} is a Weidian listing in the {1} category. The linked seller page, image gallery and Superbuy entry refer to item {2}.'
};
const zh = {
  'Superbuy Spreadsheet':'Superbuy 商品表',
  'A blue dragon pilot flying a parcel delivery plane above the clouds':'蓝色小龙驾驶载有包裹的飞机穿过云层',
  'All Finds on Superbuy Spreadsheet':'Superbuy 商品表全部选品',
  'Product introduction':'商品详情介绍',
  'Register':'注册',
  'How to buy with Superbuy':'怎样用 Superbuy 购买',
  'Before you order':'下单前核对',
  'Sort by':'排序',
  'Shopping agent':'代购平台', 'Currency':'币种', 'Choose shopping agent and currency':'选择代购平台和币种',
  'Other shopping agents':'其他代购平台',
  'Open listing':'打开商品',
  'How to read a product detail page':'商品详情介绍',
  'Each result opens its own product page, where the seller gallery, listing specifications, price, warehouse photos, and agent links are tied to the same Weidian item ID.':'每件商品都有独立详情页，卖家轮播、商品规格、参考价、仓库照片和代购入口均对应同一个微店商品 ID。',
   'View on {0}':'在 {0} 查看', 'Reference rates':'参考汇率',
  'Seller specifications':'卖家规格与款式', 'Loading seller specifications…':'正在加载卖家规格…',
  'Seller specifications are currently unavailable. Check the original Weidian listing for available options.':'暂时无法获取卖家规格，请到微店原商品页查看可选项。',
  'Seller listing title':'卖家商品标题', 'Seller':'卖家', 'Seller variant price range':'卖家规格价格区间',
  'Listed variant combinations':'已列出的规格组合', 'Options':'可选项', 'Seller description':'卖家介绍',
  'The seller feed does not include separate option groups for this listing.':'卖家数据没有提供此商品的独立规格分组。',
  'Seller specifications from FindSpreadsheet. Confirm available variants and the final price with the seller or agent.':'以上规格来自 FindSpreadsheet。实际可选规格和价格以卖家或代购平台为准。',
  'Reference price':'参考价格', 'Reference price and what you pay':'参考价与实际付款',
  'The catalog price converts the saved CNY listing price into your selected currency. Variant prices, local delivery, international shipping and agent services may affect the amount you pay.':'目录将已保存的人民币商品价换算成所选币种。规格、国内运费、国际运费及代购服务均可能影响实付金额。',
  'Open the same Weidian item on another shopping agent or check its FindSpreadsheet page.':'在其他代购平台打开同一微店商品，或查看 FindSpreadsheet 的原详情页。',
  'Search by Weidian ID':'按微店 ID 搜索',
  'Open the product details':'打开商品详情',
  'Research references':'调研参考',
  'Seller snapshot price':'快照卖家价格',
  'Purchase page photos':'购买页商品图',
  'Photos from the original seller listing.':'来自卖家原商品页。',
  'Saved listing photos for this item.':'本站保存的商品图。',
  '{0} listing photos':'{0} 张商品图',
  'Open seller photo {0}':'打开第 {0} 张卖家商品图',
  'Superbuy spreadsheet search guide':'Superbuy 选品与搜索指南',
  'Find Similar Products':'以图搜商品',
  'Site directory':'站点目录',
  'Track a parcel':'查询包裹',
  'Official Superbuy reference':'Superbuy 官方说明',
  'Official practice demo':'Superbuy 官方模拟操作',
  'View all products':'浏览全部商品',
  'Open SEO guide':'查看 SEO 选品指南',
  'Read the full product guide':'展开完整商品详情指南',
  'Explore all search topics':'展开所有搜索主题',
  'Swipe for more products':'左右滑动查看更多商品',
  'Saved products':'已收藏商品',
  'Your saved products stay in this browser.':'收藏保存在当前浏览器。',
  'Independent guide by FindSpreadsheet. Reference prices exclude delivery and optional services. Some links are referral links.':'FindSpreadsheet 独立导购站。参考价不含运费和可选服务，部分链接包含推广参数。',
  'Historical reference QC from FindSpreadsheet. Review your own Superbuy warehouse photos before shipping.':'这些是 FindSpreadsheet 保存的历史 QC 参考照片。寄出前请核对本人 Superbuy 订单的仓库照片。',
  '{0} is a Weidian listing in the {1} category. The linked seller page, image gallery and Superbuy entry refer to item {2}.':'{0} 属于微店的{1}分类。卖家页、轮播图和 Superbuy 入口均对应商品编号 {2}。',
  'Reference listing price. Delivery and optional services are separate. Confirm the exact variant and payable amount on Superbuy.':'商品价仅供参考，运费和可选服务另算。请在 Superbuy 确认实际规格和应付金额。',
  'Search Weidian finds by product name, item ID or photo. Compare reference prices, open product details and follow Superbuy’s ordering and shipping steps.':'按商品名称、微店 ID 或图片找商品，比较参考价格，查看独立详情，跟随 Superbuy 下单和运送步骤。',
  'Read a product page from top to bottom: confirm the exact listing in the gallery, verify the Weidian ID and variant, compare the USD reference price, and check whether historical warehouse photos are available.':'从商品详情的轮播图确认款式、核对微店 ID 和规格、比较美元参考价，再检查是否有可用的历史仓库照片。',
  'Follow a Weidian find from this catalog to Superbuy’s official order, warehouse and shipping screens.':'从本站微店商品出发，对照 Superbuy 官方下单、仓库验货及运输页面。',
  'Answers for finding products, checking photos and placing orders with Superbuy.':'查找商品、查看图片及使用 Superbuy 下单的常见问题。',
  'Start with a product name, Weidian ID or photo. Find the right catalog category, then check warehouse QC, ordering steps or shipping costs.':'从商品名称、微店 ID 或照片入手。选好商品分类后，可查看仓库 QC、下单步骤或运费。',
  'Example English searches':'英文搜索示例',
  'Try a Weidian ID search':'试用微店 ID 搜索',
  'Open a product with QC photos':'查看带有 QC 图的商品',
  'Read the parcel and shipping steps':'查看打包与运输步骤',
  'Superbuy official buying guide':'Superbuy 官方购物指南',
  'Superbuy warehouse and inspection guide':'Superbuy 仓库与验货指南',
  'Choose a reference photo to compare against product and guide images. The file stays in your browser.':'选择参考图片，与商品图及操作图进行比较。文件只在本机浏览器处理。',
  '{0} indexed images':'{0} 张已索引图片',
  '{0} matches':'{0} 个匹配结果',
  'This public preview is marked noindex until the production domain is configured.':'这是公开预览，正式域名配置前保留 noindex 设置。'
};
for(const [title,chinese,body,bodyChinese] of [...guide,...faq,...productIntroduction]) {
  zh[title]=chinese;
  zh[body]=bodyChinese;
}
for(const {title,summary,detail} of topics) {
  for(const [english,chinese] of [title,summary,detail]) zh[english]=chinese;
}
for(const [english,chinese] of Object.values(checks)) zh[english]=chinese;

const common = ['Open listing','Shopping agent','Currency','Choose shopping agent and currency','Other shopping agents','View on {0}','Reference rates','Home','Spreadsheet','Product Details','Buying guide','FAQ','SEO','Language','Skip to content','Search','Search by image','Show saved products','Product name or Weidian ID','All finds','Shoes','Hoodies & sweaters','T-shirts','Jackets','Pants & shorts','Jerseys','Accessories','Headwear','Sets','Electronics','Other finds','Featured','Latest added','Price low to high','Price high to low','Previous','Next','Browse finds','Browse all','Price on listing','View details','Save product','Remove saved product','Category','Confirm the seller page, variant, measurements, quantity and payable total. Review any route restrictions and plan international shipping based on the expected packed parcel.','Check the color, silhouette, materials described by the seller, and visible markings.','Check whether the listing uses body or garment measurements.','The dollar amount is a reference estimate from the saved seller price in CNY. It helps compare listings, including when sorting the product directory by price.','Price in USD and what you pay','Size, measurements and options','USD reference price','Product identity and source','Open example product','{0} Weidian listings from FindSpreadsheet','{0} find','{0} finds','No saved products match these filters.','No matches. Try a broader search or select All finds.','Product photos','Previous photo','Next photo','Show product photo {0}','Additional listing photos could not load.','Warehouse QC photos','QC records could not load. Try again.','No warehouse photos are available in the preview for this listing.','Warehouse QC photo {0} from {1}','Weidian item #{0}','Listing photos','Weidian item ID','Related products','Open buying guide','See all FAQs','Open the official shipping estimator','Enable JavaScript to search and filter the full catalog.','Loading product…','This product could not be found in the preview.','Back to finds','Find Similar Products','Choose photo','Try an example','Show more matches','Choose an image up to 12 MB. The image stays in your browser.','Searching product photos…','Showing the {0} closest matches.','No matches found.','Could not read this photo or load the search index. Try another image.','Image index unavailable','Unable to load this language. Try again.','The catalogue could not load. Refresh to try again.'];
for(const file of readdirSync(source).filter(name=>name.endsWith('.json'))) {
  const original=JSON.parse(readFileSync(join(source,file),'utf8'));
  const locale={};
  for(const key of common) if(original[key]) locale[key]=original[key];
  for(const [key,old] of Object.entries(remap)) if(original[old] && key!=='Historical reference QC from FindSpreadsheet. Review your own Superbuy warehouse photos before shipping.') {
    locale[key]=original[old].replace(/sugargoo/gi,'Superbuy');
  }
  locale['Superbuy Spreadsheet']=original['Sugargoo Spreadsheet']?.replace(/sugargoo/gi,'Superbuy')??'Superbuy Spreadsheet';
  if(file==='zh-CN.json') Object.assign(locale,zh);
  writeFileSync(join(target,file),JSON.stringify(locale));
}
