export const languages = {
  en: 'English', 'zh-Hans': '简体中文', es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano',
  'pt-BR': 'Português', ja: '日本語', ko: '한국어', nl: 'Nederlands', pl: 'Polski', tr: 'Türkçe',
  id: 'Bahasa Indonesia', ms: 'Bahasa Melayu', th: 'ไทย', hi: 'हिन्दी', sv: 'Svenska',
  da: 'Dansk', nb: 'Norsk', cs: 'Čeština', hu: 'Magyar', ro: 'Română',
};

const numbers = /\d+(?:[.,]\d+)*/g;
export const normalize = (text) => text.trim().replace(/\s+/g, ' ');
export function copyKey(text) {
  let index = 0;
  return normalize(text).replace(numbers, () => '[V' + index++ + ']');
}
export function translateCopy(text, dictionary) {
  const translation = dictionary[copyKey(text)];
  if (!translation) return text;
  const values = normalize(text).match(numbers) || [];
  return (text.match(/^\s*/)?.[0] || '') + translation.replace(/\[V(\d+)\]/g, (_, index) => values[index] || '')
    + (text.match(/\s*$/)?.[0] || '');
}
