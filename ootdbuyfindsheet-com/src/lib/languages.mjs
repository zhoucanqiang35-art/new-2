export const languages = [
  ['en','English','USD'], ['zh-Hans','简体中文','CNY'],
  ['es','Español','EUR'], ['fr','Français','EUR'], ['de','Deutsch','EUR'], ['it','Italiano','EUR'],
  ['pt','Português','EUR'], ['ru','Русский','RUB'], ['ja','日本語','JPY'], ['ko','한국어','KRW'],
  ['ar','العربية','SAR'], ['tr','Türkçe','TRY'], ['pl','Polski','PLN'], ['nl','Nederlands','EUR'],
  ['sv','Svenska','SEK'], ['da','Dansk','DKK'], ['fi','Suomi','EUR'], ['no','Norsk','NOK'],
  ['hu','Magyar','HUF'], ['ro','Română','RON'], ['cs','Čeština','CZK'], ['uk','Українська','UAH'],
];
export const currencyByLanguage = Object.fromEntries(languages.map(([code, , currency]) => [code, currency]));

// Labels added by the product gallery and search controls.
export const searchHint = 'Try “hoodie”, an item ID or a Weidian link';
export const interfaceLabels = [searchHint, 'Copy product link', 'Link copied', 'Product link'];
export const interfaceTranslations = {
  'zh-Hans': ['试试「hoodie」、商品 ID 或微店链接', '复制商品链接', '链接已复制', '商品链接'],
  es: ['Prueba «hoodie», un ID de artículo o un enlace de Weidian', 'Copiar enlace del producto', 'Enlace copiado', 'Enlace del producto'],
  fr: ['Essayez « hoodie », un identifiant ou un lien Weidian', 'Copier le lien du produit', 'Lien copié', 'Lien du produit'],
  de: ['Versuche „hoodie“, eine Artikel-ID oder einen Weidian-Link', 'Produktlink kopieren', 'Link kopiert', 'Produktlink'],
  it: ['Prova «hoodie», un ID o un link Weidian', 'Copia link del prodotto', 'Link copiato', 'Link del prodotto'],
  pt: ['Tente «hoodie», um ID ou um link do Weidian', 'Copiar link do produto', 'Link copiado', 'Link do produto'],
  ru: ['Введите «hoodie», ID товара или ссылку Weidian', 'Скопировать ссылку на товар', 'Ссылка скопирована', 'Ссылка на товар'],
  ja: ['「hoodie」、商品ID、Weidianリンクで検索', '商品リンクをコピー', 'リンクをコピーしました', '商品リンク'],
  ko: ['‘hoodie’, 상품 ID 또는 Weidian 링크로 검색', '상품 링크 복사', '링크 복사됨', '상품 링크'],
  ar: ['جرّب «hoodie» أو معرّف المنتج أو رابط Weidian', 'نسخ رابط المنتج', 'تم نسخ الرابط', 'رابط المنتج'],
  tr: ['“hoodie”, ürün kimliği veya Weidian bağlantısı deneyin', 'Ürün bağlantısını kopyala', 'Bağlantı kopyalandı', 'Ürün bağlantısı'],
  pl: ['Wypróbuj „hoodie”, identyfikator produktu lub link Weidian', 'Kopiuj link do produktu', 'Skopiowano link', 'Link do produktu'],
  nl: ['Probeer ‘hoodie’, een artikel-ID of een Weidian-link', 'Productlink kopiëren', 'Link gekopieerd', 'Productlink'],
  sv: ['Prova ”hoodie”, ett artikel-ID eller en Weidian-länk', 'Kopiera produktlänk', 'Länken kopierades', 'Produktlänk'],
  da: ['Prøv ”hoodie”, et vare-id eller et Weidian-link', 'Kopiér produktlink', 'Link kopieret', 'Produktlink'],
  fi: ['Kokeile hakua ”hoodie”, tuotetunnusta tai Weidian-linkkiä', 'Kopioi tuotelinkki', 'Linkki kopioitu', 'Tuotelinkki'],
  no: ['Prøv «hoodie», en vare-ID eller en Weidian-lenke', 'Kopier produktlenke', 'Lenken er kopiert', 'Produktlenke'],
  hu: ['Próbáld a „hoodie” szót, a termékazonosítót vagy a Weidian-linket', 'Terméklink másolása', 'Link másolva', 'Terméklink'],
  ro: ['Încearcă „hoodie”, un ID de produs sau un link Weidian', 'Copiază linkul produsului', 'Link copiat', 'Linkul produsului'],
  cs: ['Zkus „hoodie“, ID produktu nebo odkaz Weidian', 'Kopírovat odkaz na produkt', 'Odkaz zkopírován', 'Odkaz na produkt'],
  uk: ['Введіть «hoodie», ID товару або посилання Weidian', 'Копіювати посилання на товар', 'Посилання скопійовано', 'Посилання на товар'],
};
