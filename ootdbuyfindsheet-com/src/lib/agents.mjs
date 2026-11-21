import { preference } from './currency.mjs';
import { buyUrl, mainSite } from './settings.mjs';

export const defaultAgent = 'ootdbuy';
// Purchase templates are from the Findspreadsheet product platform selector.
export const agents = [
  {
    "key": "findspreadsheet",
    "name": "Findspreadsheet",
    "template": "https://findspreadsheet.com/AllProducts/"
  },
  {
    "key": "joyagoo",
    "name": "Joyagoo",
    "template": "https://joyagoo.com/product?id={id}&platform=WEIDIAN&productUrl=&productPwd=",
    "icon": "/media/agents/joyagoo.webp"
  },
  {
    "key": "oopbuy",
    "name": "Oopbuy",
    "template": "https://oopbuy.com/product/weidian/{id}?inviteCode=U68CWQBN5",
    "icon": "/media/agents/oopbuy.webp"
  },
  {
    "key": "litbuy",
    "name": "Litbuy",
    "template": "https://litbuy.com/product/weidian/{id}",
    "icon": "/media/agents/litbuy.webp"
  },
  {
    "key": "lovegobuy",
    "name": "Lovegobuy",
    "template": "https://www.lovegobuy.com/product?id={id}&shop_type=weidian&invite_code=161CPG",
    "icon": "/media/agents/lovegobuy.webp"
  },
  {
    "key": "hipobuy",
    "name": "Hipobuy",
    "template": "https://hipobuy.com/product/weidian/{id}",
    "icon": "/media/agents/hipobuy.webp"
  },
  {
    "key": "sugargoo",
    "name": "Sugargoo",
    "template": "https://www.sugargoo.com/#/home/productDetail?productLink=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D{id}&memberId=1771881989097259278",
    "icon": "/media/agents/sugargoo.webp"
  },
  {
    "key": "kakobuy",
    "name": "KakoBuy",
    "template": "https://kakobuy.com/item/details?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D{id}",
    "icon": "/media/agents/kakobuy.webp"
  },
  {
    "key": "superbuy",
    "name": "Superbuy",
    "template": "https://www.superbuy.com/en/page/buy/?nTag=Home-search&from=search-input&url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D{id}&partnercode=ES7pVI",
    "icon": "/media/agents/superbuy.webp"
  },
  {
    "key": "loongbuy",
    "name": "Loongbuy",
    "template": "https://loongbuy.com/product-details?url=https://weidian.com/item.html?itemID={id}",
    "icon": "/media/agents/loongbuy.webp"
  },
  {
    "key": "usfans",
    "name": "USFans",
    "template": "https://usfans.com/product/3/{id}",
    "icon": "/media/agents/usfans.webp"
  },
  {
    "key": "mulebuy",
    "name": "Mulebuy",
    "template": "https://mulebuy.com/zh/product/?shop_type=weidian&id={id}&ref=200232406",
    "icon": "/media/agents/mulebuy.webp"
  },
  {
    "key": "hoobuy",
    "name": "Hoobuy",
    "template": "https://hoobuy.com/product/2/{id}?utm_source=share&utm_medium=product_details&inviteCode=vXpLpmrX",
    "icon": "/media/agents/hoobuy.webp"
  },
  {
    "key": "ootdbuy",
    "name": "Ootdbuy",
    "template": "https://www.ootdbuy.com/goods/details?id={id}&channel=weidian&inviteCode=179LQ1SVA",
    "icon": "/media/agents/ootdbuy.webp"
  },
  {
    "key": "orientdig",
    "name": "OrientDig",
    "template": "https://orientdig.com/product/?shop_type=weidian&id={id}&ref=100114240",
    "icon": "/media/agents/orientdig.webp"
  },
  {
    "key": "eastmallbuy",
    "name": "EastMallBuy",
    "template": "https://eastmallbuy.com/index/weidian/itemID={id}&inviter=lianglook520",
    "icon": "/media/agents/eastmallbuy.webp"
  },
  {
    "key": "ponybuy",
    "name": "Ponybuy",
    "template": "https://www.ponybuy.com/en-gb/goods?tracking=e6cd1dcf21&product_id={id}&platform=weidian",
    "icon": "/media/agents/ponybuy.webp"
  },
  {
    "key": "pikobuy",
    "name": "Pikobuy",
    "template": "https://www.pikobuy.com/product/detail?productUrl=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D{id}",
    "icon": "/media/agents/pikobuy.webp"
  },
  {
    "key": "lolobuy",
    "name": "LoloBuy",
    "template": "https://www.lolobuy.com/productDetail/1783404849631986?url=https://weidian.com/item.html?itemID={id}",
    "icon": "/media/agents/lolobuy.webp"
  },
  {
    "key": "panglobalbuy",
    "name": "Panglobalbuy",
    "template": "https://panglobalbuy.com/#/details?type=3&offerId={id}&share_id=14918",
    "icon": "/media/agents/panglobalbuy.webp"
  }
];
export const agentByKey = Object.fromEntries(agents.map(agent => [agent.key, agent]));
export function agentUrl(key, id, sourcePath) {
  if (key === 'findspreadsheet' && sourcePath) return new URL(sourcePath, mainSite).href;
  if (key === defaultAgent) return buyUrl(id);
  return (agentByKey[key] ?? agentByKey[defaultAgent]).template.replaceAll('{id}', encodeURIComponent(id));
}

export function currentAgent() {
  const key = preference('agent', defaultAgent);
  return Object.hasOwn(agentByKey, key) ? key : defaultAgent;
}

export function agentAction(key) {
  return key === 'findspreadsheet' ? 'View on Findspreadsheet' : 'Buy on ' + agentByKey[key].name;
}
