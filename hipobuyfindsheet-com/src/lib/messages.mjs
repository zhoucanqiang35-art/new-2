export const languages = [
  ['en', 'English'], ['zh-CN', '简体中文'], ['es', 'Español'], ['fr', 'Français'],
  ['de', 'Deutsch'], ['pt', 'Português'], ['it', 'Italiano'], ['nl', 'Nederlands'],
  ['sv', 'Svenska'], ['pl', 'Polski'], ['ro', 'Română'], ['tr', 'Türkçe'],
  ['ru', 'Русский'], ['uk', 'Українська'], ['ja', '日本語'], ['ko', '한국어'],
  ['vi', 'Tiếng Việt'], ['th', 'ไทย'], ['id', 'Bahasa Indonesia'], ['ms', 'Bahasa Melayu'],
  ['hi', 'हिन्दी'], ['ar', 'العربية'], ['he', 'עברית'],
];

import english from '../../public/locales/en.json';

export function format(template, args) {
  return template.replace(/\{(\d+)\}/g, (original, index) => args[index] ?? original);
}

export function copy(key, ...args) {
  return format(english[key] ?? key, args);
}

export function message(key, ...args) {
  return {
    'data-i18n': key,
    'data-i18n-args': args.length ? JSON.stringify(args) : undefined,
  };
}
