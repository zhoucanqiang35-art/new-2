import { sourceUrl, type Product } from "./catalog";

// Matches the Weidian purchase selector on FindSpreadsheet (verified 2026-11-17).
const platforms = [
  ["Joyagoo", "https://joyagoo.com/product?id={item}&platform=WEIDIAN&productUrl=&productPwd=", "joyagoo.png"],
  ["Oopbuy", "https://oopbuy.com/product/weidian/{item}?inviteCode=U68CWQBN5", "oopbuy.png"],
  ["Litbuy", "https://litbuy.com/product/weidian/{item}", "litbuy.png"],
  ["LoveGoBuy", "https://www.lovegobuy.com/product?id={item}&shop_type=weidian&invite_code=161CPG", "lovegobuy.png"],
  ["Hipobuy", "https://hipobuy.com/product/weidian/{item}", "hipobuy.png"],
  ["Sugargoo", "https://www.sugargoo.com/#/home/productDetail?productLink=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D{item}&memberId=1771881989097259278", "sugargoo.png"],
  ["Kakobuy", "https://kakobuy.com/item/details?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D{item}", "kakobuy.ico"],
  ["Superbuy", "https://www.superbuy.com/en/page/buy/?nTag=Home-search&from=search-input&url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D{item}&partnercode=ES7pVI", "superbuy.png"],
  ["Loongbuy", "https://loongbuy.com/product-details?url=https://weidian.com/item.html?itemID={item}", "loongbuy.png"],
  ["USFans", "https://usfans.com/product/3/{item}", "usfans.png"],
  ["Mulebuy", "https://mulebuy.com/zh/product/?shop_type=weidian&id={item}&ref=200232406", "mulebuy.jpg"],
  ["Hoobuy", "https://hoobuy.com/product/2/{item}?utm_source=share&utm_medium=product_details&inviteCode=vXpLpmrX", "hoobuy.jpg"],
  ["Ootdbuy", "https://www.ootdbuy.com/goods/details?id={item}&channel=weidian&inviteCode=179LQ1SVA", "ootdbuy.png"],
  ["Orientdig", "https://orientdig.com/product/?shop_type=weidian&id={item}&ref=100114240", "orientdig.jpg"],
  ["Eastmallbuy", "https://eastmallbuy.com/index/weidian/itemID={item}&inviter=lianglook520", "eastmallbuy.jpg"],
  ["Ponybuy", "https://www.ponybuy.com/en-gb/goods?tracking=e6cd1dcf21&product_id={item}&platform=weidian", "ponybuy.png"],
  ["Pikobuy", "https://www.pikobuy.com/product/detail?productUrl=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D{item}", "pikobuy.png"],
  ["Lolobuy", "https://www.lolobuy.com/productDetail/1783404849631986?url=https://weidian.com/item.html?itemID={item}", "lolobuy.png"],
  ["Panglobalbuy", "https://panglobalbuy.com/#/details?type=3&offerId={item}&share_id=14918", "panglobalbuy.png"],
] as const;

const mainSiteAgent = {label: "FindSpreadsheet", logo: "", url: sourceUrl};

const mainSitePlatforms = platforms.map(([label, template, icon]) => ({
  label,
  logo: "https://findspreadsheet.com/template/pc/skin/images/platform-logos/" + icon,
  url: (product: Product) => template.replace("{item}", encodeURIComponent(product.weidianId)),
}));

export const defaultCatalogAgent = mainSitePlatforms.find(({label}) => label === "Kakobuy")!;
export const catalogAgents = [mainSiteAgent, ...mainSitePlatforms];

export function otherAgentLinks(product: Product) {
  return mainSitePlatforms.filter(agent => agent !== defaultCatalogAgent)
    .map(({label, logo, url}) => ({label, logo, url: url(product)}));
}
