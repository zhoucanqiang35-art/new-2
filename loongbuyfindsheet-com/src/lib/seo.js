export const productionOrigin = 'https://loongbuyfindsheet.com';
export const previewOrigin = 'https://loongbuy-finds-preview.zhoucanqiang35.chatgpt.site';

export function isIndexableSite(site) {
  return site?.origin === productionOrigin;
}
