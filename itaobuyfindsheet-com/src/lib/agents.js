const links = [
  ['Joyagoo', 'https://joyagoo.com/product?id={id}&platform=WEIDIAN&productUrl=&productPwd='],
  ['Oopbuy', 'https://oopbuy.com/product/weidian/{id}?inviteCode=U68CWQBN5'],
  ['Litbuy', 'https://litbuy.com/product/weidian/{id}'],
  ['LoveGoBuy', 'https://www.lovegobuy.com/product?id={id}&shop_type=weidian&invite_code=161CPG'],
  ['HipoBuy', 'https://hipobuy.com/product/weidian/{id}'],
  ['Sugargoo', 'https://www.sugargoo.com/#/home/productDetail?productLink={encoded}&memberId=1771881989097259278'],
  ['KakoBuy', 'https://kakobuy.com/item/details?url={encoded}'],
  ['SuperBuy', 'https://www.superbuy.com/en/page/buy/?nTag=Home-search&from=search-input&url={encoded}&partnercode=ES7pVI'],
  ['Loongbuy', 'https://loongbuy.com/product-details?url={raw}'],
  ['USFans', 'https://usfans.com/product/3/{id}'],
  ['Mulebuy', 'https://mulebuy.com/zh/product/?shop_type=weidian&id={id}&ref=200232406'],
  ['Hoobuy', 'https://hoobuy.com/product/2/{id}?utm_source=share&utm_medium=product_details&inviteCode=vXpLpmrX'],
  ['Ootdbuy', 'https://www.ootdbuy.com/goods/details?id={id}&channel=weidian&inviteCode=179LQ1SVA'],
  ['Orientdig', 'https://orientdig.com/product/?shop_type=weidian&id={id}&ref=100114240'],
  ['Eastmallbuy', 'https://eastmallbuy.com/index/weidian/itemID={id}&inviter=lianglook520'],
  ['PonyBuy', 'https://www.ponybuy.com/en-gb/goods?tracking=e6cd1dcf21&product_id={id}&platform=weidian'],
  ['Pikobuy', 'https://www.pikobuy.com/product/detail?productUrl={encoded}'],
  ['LoLoBuy', 'https://www.lolobuy.com/productDetail/1783404849631986?url={raw}'],
  ['Panglobalbuy', 'https://panglobalbuy.com/#/details?type=3&offerId={id}&share_id=14918'],
];

export function alternativeAgents(id) {
  const original = 'https://weidian.com/item.html?itemID=' + id;
  return links.map(([name, template]) => ({
    name,
    logo: '/agent-logos/' + name.toLowerCase() + '.webp',
    url: template.replace('{id}', id).replace('{raw}', original).replace('{encoded}', encodeURIComponent(original)),
  }));
}
