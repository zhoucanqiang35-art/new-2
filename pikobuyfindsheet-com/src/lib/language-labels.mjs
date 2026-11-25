import {categoryGuides} from '../data/category-guides.mjs';
import localGuides from '../data/category-guide-zh.json';

const labels = ['Home', 'Categories', 'Spreadsheet', 'Image Search', 'Buying Guide', 'FAQ', 'Website language', 'Featured finds', 'Pikobuy FAQ', 'How to buy on Pikobuy', 'Search'];
const translated = {
  'zh-Hans': ['首页', '分类', '电子表格', '图片搜索', '购买指南', '常见问题', '网站语言', '热门商品', 'Pikobuy 常见问题', '如何在 Pikobuy 购买', '搜索'],
  es: ['Inicio', 'Categorías', 'Hoja de cálculo', 'Búsqueda por imagen', 'Guía de compra', 'Preguntas frecuentes', 'Idioma del sitio', 'Productos populares', 'Preguntas sobre Pikobuy', 'Cómo comprar en Pikobuy', 'Buscar'],
  fr: ['Accueil', 'Catégories', 'Tableur', 'Recherche par image', 'Guide d’achat', 'FAQ', 'Langue du site', 'Produits populaires', 'FAQ Pikobuy', 'Comment acheter sur Pikobuy', 'Rechercher'],
  de: ['Startseite', 'Kategorien', 'Produkttabelle', 'Bildersuche', 'Kaufanleitung', 'Häufige Fragen', 'Sprache der Website', 'Beliebte Produkte', 'Häufige Fragen zu Pikobuy', 'So kaufst du bei Pikobuy', 'Suchen'],
  it: ['Home', 'Categorie', 'Foglio di calcolo', 'Ricerca per immagine', 'Guida all’acquisto', 'Domande frequenti', 'Lingua del sito', 'Prodotti popolari', 'FAQ Pikobuy', 'Come acquistare su Pikobuy', 'Cerca'],
  pt: ['Início', 'Categorias', 'Planilha', 'Pesquisa por imagem', 'Guia de compra', 'Perguntas frequentes', 'Idioma do site', 'Produtos populares', 'Perguntas sobre a Pikobuy', 'Como comprar na Pikobuy', 'Pesquisar'],
  ru: ['Главная', 'Категории', 'Таблица товаров', 'Поиск по фото', 'Руководство по покупке', 'Частые вопросы', 'Язык сайта', 'Популярные товары', 'Вопросы об Pikobuy', 'Как покупать на Pikobuy', 'Поиск'],
  ja: ['ホーム', 'カテゴリー', '商品リスト', '画像検索', '購入ガイド', 'よくある質問', 'サイトの言語', '人気商品', 'Pikobuy よくある質問', 'Pikobuy での購入方法', '検索'],
  ko: ['홈', '카테고리', '상품 목록', '이미지 검색', '구매 가이드', '자주 묻는 질문', '사이트 언어', '인기 상품', 'Pikobuy 자주 묻는 질문', 'Pikobuy 구매 방법', '검색'],
  ar: ['الرئيسية', 'الفئات', 'جدول المنتجات', 'البحث بالصور', 'دليل الشراء', 'الأسئلة الشائعة', 'لغة الموقع', 'المنتجات الرائجة', 'الأسئلة الشائعة عن Pikobuy', 'كيفية الشراء عبر Pikobuy', 'بحث'],
  tr: ['Ana sayfa', 'Kategoriler', 'Ürün tablosu', 'Görselle arama', 'Satın alma rehberi', 'Sık sorulan sorular', 'Site dili', 'Popüler ürünler', 'Pikobuy hakkında sorular', 'Pikobuy üzerinden nasıl alışveriş yapılır?', 'Ara'],
  pl: ['Strona główna', 'Kategorie', 'Arkusz produktów', 'Wyszukiwanie obrazem', 'Poradnik zakupowy', 'Częste pytania', 'Język witryny', 'Popularne produkty', 'Pytania o Pikobuy', 'Jak kupować na Pikobuy', 'Szukaj'],
  nl: ['Startpagina', 'Categorieën', 'Productoverzicht', 'Zoeken op afbeelding', 'Koopgids', 'Veelgestelde vragen', 'Taal van de site', 'Populaire producten', 'Veelgestelde vragen over Pikobuy', 'Zo koop je via Pikobuy', 'Zoeken'],
  sv: ['Startsida', 'Kategorier', 'Produktlista', 'Bildsökning', 'Köpguide', 'Vanliga frågor', 'Webbplatsens språk', 'Populära produkter', 'Vanliga frågor om Pikobuy', 'Så handlar du via Pikobuy', 'Sök'],
  da: ['Forside', 'Kategorier', 'Produktliste', 'Billedsøgning', 'Købsguide', 'Ofte stillede spørgsmål', 'Webstedets sprog', 'Populære produkter', 'Spørgsmål om Pikobuy', 'Sådan handler du via Pikobuy', 'Søg'],
  fi: ['Etusivu', 'Kategoriat', 'Tuoteluettelo', 'Kuvahaku', 'Osto-opas', 'Usein kysytyt kysymykset', 'Sivuston kieli', 'Suositut tuotteet', 'Kysymyksiä Pikobuysta', 'Näin ostat Pikobuyn kautta', 'Hae'],
  no: ['Forside', 'Kategorier', 'Produktliste', 'Bildesøk', 'Kjøpsguide', 'Vanlige spørsmål', 'Nettstedets språk', 'Populære produkter', 'Spørsmål om Pikobuy', 'Slik handler du via Pikobuy', 'Søk'],
  hu: ['Kezdőlap', 'Kategóriák', 'Terméktáblázat', 'Képkeresés', 'Vásárlási útmutató', 'Gyakori kérdések', 'Az oldal nyelve', 'Népszerű termékek', 'Gyakori kérdések az Pikobuyról', 'Vásárlás az Pikobuyon', 'Keresés'],
  ro: ['Acasă', 'Categorii', 'Tabel de produse', 'Căutare după imagine', 'Ghid de cumpărare', 'Întrebări frecvente', 'Limba site-ului', 'Produse populare', 'Întrebări despre Pikobuy', 'Cum să cumperi prin Pikobuy', 'Caută'],
  cs: ['Úvod', 'Kategorie', 'Přehled produktů', 'Vyhledávání podle obrázku', 'Průvodce nákupem', 'Časté dotazy', 'Jazyk webu', 'Oblíbené produkty', 'Časté dotazy k Pikobuy', 'Jak nakupovat přes Pikobuy', 'Hledat'],
  uk: ['Головна', 'Категорії', 'Таблиця товарів', 'Пошук за фото', 'Посібник із покупок', 'Поширені запитання', 'Мова сайту', 'Популярні товари', 'Поширені запитання про Pikobuy', 'Як купувати через Pikobuy', 'Пошук'],
};

const catalogLabels = {
  'zh-Hans': ['在 ZZ1ZZ 购买', 'ZZ1ZZ 件商品', 'ZZ1ZZ 件商品'],
  es: ['Comprar en ZZ1ZZ', 'ZZ1ZZ producto', 'ZZ1ZZ productos'],
  fr: ['Acheter sur ZZ1ZZ', 'ZZ1ZZ produit', 'ZZ1ZZ produits'],
  de: ['Bei ZZ1ZZ kaufen', 'ZZ1ZZ Produkt', 'ZZ1ZZ Produkte'],
  it: ['Acquista su ZZ1ZZ', 'ZZ1ZZ prodotto', 'ZZ1ZZ prodotti'],
  pt: ['Comprar na ZZ1ZZ', 'ZZ1ZZ produto', 'ZZ1ZZ produtos'],
  ru: ['Купить на ZZ1ZZ', 'ZZ1ZZ товар', 'Товаров: ZZ1ZZ'],
  ja: ['ZZ1ZZ で購入', 'ZZ1ZZ 件の商品', 'ZZ1ZZ 件の商品'],
  ko: ['ZZ1ZZ에서 구매', '상품 ZZ1ZZ개', '상품 ZZ1ZZ개'],
  ar: ['شراء عبر ZZ1ZZ', 'ZZ1ZZ منتج', 'عدد المنتجات: ZZ1ZZ'],
  tr: ['ZZ1ZZ üzerinden satın al', 'ZZ1ZZ ürün', 'ZZ1ZZ ürün'],
  pl: ['Kup w ZZ1ZZ', 'ZZ1ZZ produkt', 'Liczba produktów: ZZ1ZZ'],
  nl: ['Kopen via ZZ1ZZ', 'ZZ1ZZ product', 'ZZ1ZZ producten'],
  sv: ['Köp via ZZ1ZZ', 'ZZ1ZZ produkt', 'ZZ1ZZ produkter'],
  da: ['Køb via ZZ1ZZ', 'ZZ1ZZ produkt', 'ZZ1ZZ produkter'],
  fi: ['Osta palvelussa ZZ1ZZ', 'ZZ1ZZ tuote', 'ZZ1ZZ tuotetta'],
  no: ['Kjøp via ZZ1ZZ', 'ZZ1ZZ produkt', 'ZZ1ZZ produkter'],
  hu: ['Vásárlás itt: ZZ1ZZ', 'ZZ1ZZ termék', 'ZZ1ZZ termék'],
  ro: ['Cumpără prin ZZ1ZZ', 'ZZ1ZZ produs', 'ZZ1ZZ produse'],
  cs: ['Koupit přes ZZ1ZZ', 'ZZ1ZZ produkt', 'Počet produktů: ZZ1ZZ'],
  uk: ['Купити через ZZ1ZZ', 'ZZ1ZZ товар', 'Товарів: ZZ1ZZ'],
};

const chineseLabels = {
  'zh-Hans': {
    'Pikobuy spreadsheet catalog': 'Pikobuy 商品目录',
    'Pikobuy Spreadsheet Catalog | Search Product Finds': 'Pikobuy 商品目录 | 搜索商品',
    'Pikobuy Spreadsheet | Finds, Product Links & QC Photos': 'Pikobuy 电子表格 | 商品链接和 QC 照片',
    'Browse the FindSpreadsheet public catalog. Search by name, Weidian ID, product link or photo.': '浏览 FindSpreadsheet 公开商品目录，按商品名称、微店 ID、链接或图片搜索。',
    'Browse spreadsheet': '浏览电子表格', 'Browse by category': '按分类浏览',
    'Sort by': '排序', 'Category': '分类', 'All categories': '全部分类', 'Guides': '指南', 'Shipping': '运费',
    'QC Photos': 'QC 验货图', 'Other shopping agents': '其他代购平台', 'Product ID': '商品编号', 'Detail photos': '商品细节图', 'Browse all products': '浏览全部商品', 'Search products': '搜索商品', 'Join Pikobuy': '注册 Pikobuy',
    'Product name, item ID or link': '商品名称、编号或链接',
    'Shopping agent': '代购平台', 'Shopping agent and currency': '代购平台和币种',
    'Currency': '币种', 'Saved products': '收藏商品',
    'Choose a product photo': '选择商品图片', 'What to check before ordering': '下单前要检查什么',
    'How to estimate shipping': '如何估算运费', 'How to find and review QC photos': '如何查找和核对 QC 照片',
    'Search by Weidian ID in the QC finder': '用微店商品编号查询 QC 照片',
    'ZZ1ZZ results in the synced FindSpreadsheet catalog.': '已同步的 FindSpreadsheet 目录中有 ZZ1ZZ 件商品。',
    'ZZ1ZZ result in the synced FindSpreadsheet catalog.': '已同步的 FindSpreadsheet 目录中有 ZZ1ZZ 件商品。',
  },

};

const pickerLabels = {
  'zh-Hans': ['币种', '随语言切换', '上传图片', '试试运动鞋、商品编号或微店链接', '复制商品链接'],
  es: ['Moneda', 'Según el idioma', 'Subir imagen', 'Prueba con zapatillas, un ID o un enlace de Weidian', 'Copiar enlace del producto'],
  fr: ['Devise', 'Selon la langue', 'Importer une image', 'Essayez baskets, un identifiant ou un lien Weidian', 'Copier le lien du produit'],
  de: ['Währung', 'An Sprache anpassen', 'Bild hochladen', 'Sneaker, Artikel-ID oder Weidian-Link eingeben', 'Produktlink kopieren'],
  it: ['Valuta', 'Segui lingua', 'Carica immagine', 'Prova sneaker, ID articolo o link Weidian', 'Copia link del prodotto'],
  pt: ['Moeda', 'Seguir idioma', 'Enviar imagem', 'Tente tênis, ID do item ou link do Weidian', 'Copiar link do produto'],
  ru: ['Валюта', 'По языку', 'Загрузить фото', 'Попробуйте кроссовки, ID товара или ссылку Weidian', 'Копировать ссылку товара'],
  ja: ['通貨', '言語に合わせる', '画像をアップロード', 'スニーカー、商品 ID、Weidian リンクで検索', '商品リンクをコピー'],
  ko: ['통화', '언어에 맞춤', '이미지 업로드', '운동화, 상품 ID 또는 Weidian 링크로 검색', '상품 링크 복사'],
  ar: ['العملة', 'حسب اللغة', 'رفع صورة', 'جرّب أحذية رياضية أو معرّف المنتج أو رابط Weidian', 'نسخ رابط المنتج'],
  tr: ['Para birimi', 'Dile göre', 'Görsel yükle', 'Spor ayakkabı, ürün kimliği veya Weidian bağlantısı', 'Ürün bağlantısını kopyala'],
  pl: ['Waluta', 'Według języka', 'Prześlij zdjęcie', 'Wpisz trampki, ID produktu lub link Weidian', 'Kopiuj link do produktu'],
  nl: ['Valuta', 'Volg taal', 'Afbeelding uploaden', 'Probeer sneakers, artikel-ID of Weidian-link', 'Productlink kopiëren'],
  sv: ['Valuta', 'Följ språk', 'Ladda upp bild', 'Prova sneakers, artikel-ID eller Weidian-länk', 'Kopiera produktlänk'],
  da: ['Valuta', 'Følg sprog', 'Upload billede', 'Prøv sneakers, vare-id eller Weidian-link', 'Kopiér produktlink'],
  fi: ['Valuutta', 'Kielen mukaan', 'Lataa kuva', 'Kokeile tennareita, tuotetunnusta tai Weidian-linkkiä', 'Kopioi tuotelinkki'],
  no: ['Valuta', 'Følg språk', 'Last opp bilde', 'Prøv joggesko, vare-ID eller Weidian-lenke', 'Kopier produktlenke'],
  hu: ['Pénznem', 'Nyelv szerint', 'Kép feltöltése', 'Próbáld ki: sportcipő, termékazonosító vagy Weidian-link', 'Terméklink másolása'],
  ro: ['Monedă', 'După limbă', 'Încarcă imagine', 'Încearcă adidași, ID-ul produsului sau un link Weidian', 'Copiază linkul produsului'],
  cs: ['Měna', 'Podle jazyka', 'Nahrát obrázek', 'Zkuste tenisky, ID položky nebo odkaz Weidian', 'Kopírovat odkaz na produkt'],
  uk: ['Валюта', 'За мовою', 'Завантажити фото', 'Спробуйте кросівки, ID товару або посилання Weidian', 'Копіювати посилання на товар'],
};
const pickerKeys = ['Currency', 'Match language', 'Upload image', 'Try sneakers, item ID or Weidian link', 'Copy product link'];

export function navigationLabels(code) {
  const row = translated[code];
  if (!row) return {};
  const guide = localGuides[code];
  const localizedGuides = guide ? Object.fromEntries(
    Object.entries(categoryGuides).flatMap(([slug, parts]) => parts.map((text, index) => [text, guide[slug][index]]))
  ) : {};
  return {
    ...localizedGuides,
    ...Object.fromEntries(labels.map((label, index) => [label, row[index]])),
    'Search by image': row[3],
    'Copy Weidian link': pickerLabels[code][4],
    'Image search': row[3],
    'Pikobuy spreadsheet catalog': 'Pikobuy · ' + row[2],
    'Pikobuy Spreadsheet Catalog | Search Product Finds': 'Pikobuy · ' + row[2],
    'Buy on ZZ1ZZ': catalogLabels[code][0],
    ...chineseLabels[code],
    ...Object.fromEntries(pickerKeys.map((key, index) => [key, pickerLabels[code][index]])),
  };
}
