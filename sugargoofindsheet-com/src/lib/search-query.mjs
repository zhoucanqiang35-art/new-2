export function itemFromInput(input) {
 const value=String(input).normalize('NFKC').trim();
 if(/^\d{5,20}$/.test(value))return value;
 try{
  let url=new URL(/^https?:\/\//i.test(value)?value:'https://'+value);
  if(['sugargoo.com','www.sugargoo.com'].includes(url.hostname)){
   const route=new URL(url.hash?url.hash.slice(1):url.pathname+url.search,url.origin);
   url=new URL(route.searchParams.get('productLink')||'');
  }
  if(!['https:','http:'].includes(url.protocol)||!(url.hostname==='weidian.com'||url.hostname.endsWith('.weidian.com')))return null;
  const id=url.searchParams.get('itemID')??url.searchParams.get('itemId');
  return id&&/^\d{5,20}$/.test(id)?id:null;
 }catch{return null;}
}
export const searchText=value=>String(value).normalize('NFKC').toLowerCase().replace(/[\p{P}\p{S}]+/gu,' ').replace(/\s+/g,' ').trim();
export const searchTerms=value=>searchText(itemFromInput(value)||value).split(' ').filter(Boolean);
