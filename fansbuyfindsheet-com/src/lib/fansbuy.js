export const findspreadsheet = 'https://findspreadsheet.com';
export const register = 'https://fansbuy.com/register?invite=R0dfQzFaNVRCS1c=';
export const weidianId = /^[0-9]{6,20}$/;
export const productPath = /^\/[a-zA-Z0-9-]+\/[a-zA-Z0-9_%.-]+-[0-9]+\.html$/;

export function purchase(id) {
  if (!weidianId.test(id ?? '')) return null;
  return `https://fansbuy.com/item-micro-${id}.html?&url=https://weidian.com/item.html?itemID=${id}`;
}
