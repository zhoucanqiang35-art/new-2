const labels = ['Home', 'Categories', 'Spreadsheet', 'Image Search', 'Buying Guide', 'FAQ', 'Website language', 'Popular finds', 'EastMallBuy FAQ', 'How to buy on EastMallBuy', 'Search'];
const translated = {
  'zh-Hans': ['首页', '分类', '电子表格', '图片搜索', '购买指南', '常见问题', '网站语言', '热门商品', 'EastMallBuy 常见问题', '如何在 EastMallBuy 购买', '搜索'],
  'zh-Hant': ['首頁', '分類', '電子表格', '圖片搜尋', '購買指南', '常見問題', '網站語言', '熱門商品', 'EastMallBuy 常見問題', '如何在 EastMallBuy 購買', '搜尋'],
  es: ['Inicio', 'Categorías', 'Hoja de cálculo', 'Búsqueda por imagen', 'Guía de compra', 'Preguntas frecuentes', 'Idioma del sitio', 'Productos populares', 'Preguntas sobre EastMallBuy', 'Cómo comprar en EastMallBuy', 'Buscar'],
  fr: ['Accueil', 'Catégories', 'Tableur', 'Recherche par image', 'Guide d’achat', 'FAQ', 'Langue du site', 'Produits populaires', 'FAQ EastMallBuy', 'Comment acheter sur EastMallBuy', 'Rechercher'],
  de: ['Startseite', 'Kategorien', 'Produkttabelle', 'Bildersuche', 'Kaufanleitung', 'Häufige Fragen', 'Sprache der Website', 'Beliebte Produkte', 'Häufige Fragen zu EastMallBuy', 'So kaufst du bei EastMallBuy', 'Suchen'],
  it: ['Home', 'Categorie', 'Foglio di calcolo', 'Ricerca per immagine', 'Guida all’acquisto', 'Domande frequenti', 'Lingua del sito', 'Prodotti popolari', 'FAQ EastMallBuy', 'Come acquistare su EastMallBuy', 'Cerca'],
  pt: ['Início', 'Categorias', 'Planilha', 'Pesquisa por imagem', 'Guia de compra', 'Perguntas frequentes', 'Idioma do site', 'Produtos populares', 'Perguntas sobre a EastMallBuy', 'Como comprar na EastMallBuy', 'Pesquisar'],
  ru: ['Главная', 'Категории', 'Таблица товаров', 'Поиск по фото', 'Руководство по покупке', 'Частые вопросы', 'Язык сайта', 'Популярные товары', 'Вопросы об EastMallBuy', 'Как покупать на EastMallBuy', 'Поиск'],
  ja: ['ホーム', 'カテゴリー', '商品リスト', '画像検索', '購入ガイド', 'よくある質問', 'サイトの言語', '人気商品', 'EastMallBuy よくある質問', 'EastMallBuy での購入方法', '検索'],
  ko: ['홈', '카테고리', '상품 목록', '이미지 검색', '구매 가이드', '자주 묻는 질문', '사이트 언어', '인기 상품', 'EastMallBuy 자주 묻는 질문', 'EastMallBuy 구매 방법', '검색'],
  ar: ['الرئيسية', 'الفئات', 'جدول المنتجات', 'البحث بالصور', 'دليل الشراء', 'الأسئلة الشائعة', 'لغة الموقع', 'المنتجات الرائجة', 'الأسئلة الشائعة عن EastMallBuy', 'كيفية الشراء عبر EastMallBuy', 'بحث'],
  tr: ['Ana sayfa', 'Kategoriler', 'Ürün tablosu', 'Görselle arama', 'Satın alma rehberi', 'Sık sorulan sorular', 'Site dili', 'Popüler ürünler', 'EastMallBuy hakkında sorular', 'EastMallBuy üzerinden nasıl alışveriş yapılır?', 'Ara'],
  pl: ['Strona główna', 'Kategorie', 'Arkusz produktów', 'Wyszukiwanie obrazem', 'Poradnik zakupowy', 'Częste pytania', 'Język witryny', 'Popularne produkty', 'Pytania o EastMallBuy', 'Jak kupować na EastMallBuy', 'Szukaj'],
  nl: ['Startpagina', 'Categorieën', 'Productoverzicht', 'Zoeken op afbeelding', 'Koopgids', 'Veelgestelde vragen', 'Taal van de site', 'Populaire producten', 'Veelgestelde vragen over EastMallBuy', 'Zo koop je via EastMallBuy', 'Zoeken'],
  sv: ['Startsida', 'Kategorier', 'Produktlista', 'Bildsökning', 'Köpguide', 'Vanliga frågor', 'Webbplatsens språk', 'Populära produkter', 'Vanliga frågor om EastMallBuy', 'Så handlar du via EastMallBuy', 'Sök'],
  da: ['Forside', 'Kategorier', 'Produktliste', 'Billedsøgning', 'Købsguide', 'Ofte stillede spørgsmål', 'Webstedets sprog', 'Populære produkter', 'Spørgsmål om EastMallBuy', 'Sådan handler du via EastMallBuy', 'Søg'],
  fi: ['Etusivu', 'Kategoriat', 'Tuoteluettelo', 'Kuvahaku', 'Osto-opas', 'Usein kysytyt kysymykset', 'Sivuston kieli', 'Suositut tuotteet', 'Kysymyksiä EastMallBuysta', 'Näin ostat EastMallBuyn kautta', 'Hae'],
  no: ['Forside', 'Kategorier', 'Produktliste', 'Bildesøk', 'Kjøpsguide', 'Vanlige spørsmål', 'Nettstedets språk', 'Populære produkter', 'Spørsmål om EastMallBuy', 'Slik handler du via EastMallBuy', 'Søk'],
  hu: ['Kezdőlap', 'Kategóriák', 'Terméktáblázat', 'Képkeresés', 'Vásárlási útmutató', 'Gyakori kérdések', 'Az oldal nyelve', 'Népszerű termékek', 'Gyakori kérdések az EastMallBuyról', 'Vásárlás az EastMallBuyon', 'Keresés'],
  ro: ['Acasă', 'Categorii', 'Tabel de produse', 'Căutare după imagine', 'Ghid de cumpărare', 'Întrebări frecvente', 'Limba site-ului', 'Produse populare', 'Întrebări despre EastMallBuy', 'Cum să cumperi prin EastMallBuy', 'Caută'],
  cs: ['Úvod', 'Kategorie', 'Přehled produktů', 'Vyhledávání podle obrázku', 'Průvodce nákupem', 'Časté dotazy', 'Jazyk webu', 'Oblíbené produkty', 'Časté dotazy k EastMallBuy', 'Jak nakupovat přes EastMallBuy', 'Hledat'],
  uk: ['Головна', 'Категорії', 'Таблиця товарів', 'Пошук за фото', 'Посібник із покупок', 'Поширені запитання', 'Мова сайту', 'Популярні товари', 'Поширені запитання про EastMallBuy', 'Як купувати через EastMallBuy', 'Пошук'],
};

const catalogLabels = {
  'zh-Hans': ['在 ZZ1ZZ 购买', 'ZZ1ZZ 件商品', 'ZZ1ZZ 件商品'],
  'zh-Hant': ['在 ZZ1ZZ 購買', 'ZZ1ZZ 件商品', 'ZZ1ZZ 件商品'],
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

const catalogKicker = {
  'zh-Hans': 'Findspreadsheet 商品目录', 'zh-Hant': 'Findspreadsheet 商品目錄',
  es: 'Catálogo de Findspreadsheet', fr: 'Le catalogue Findspreadsheet',
  de: 'Der Findspreadsheet-Katalog', it: 'Il catalogo Findspreadsheet',
  pt: 'Catálogo da Findspreadsheet', ru: 'Каталог Findspreadsheet',
  ja: 'Findspreadsheet カタログ', ko: 'Findspreadsheet 카탈로그',
  ar: 'كتالوج Findspreadsheet', tr: 'Findspreadsheet kataloğu',
  pl: 'Katalog Findspreadsheet', nl: 'De Findspreadsheet-catalogus',
  sv: 'Findspreadsheet-katalogen', da: 'Findspreadsheet-kataloget',
  fi: 'Findspreadsheet-tuoteluettelo', no: 'Findspreadsheet-katalogen',
  hu: 'A Findspreadsheet katalógusa', ro: 'Catalogul Findspreadsheet',
  cs: 'Katalog Findspreadsheet', uk: 'Каталог Findspreadsheet',
};

const chineseHomeActions = {
  'zh-Hans': {'Browse spreadsheet': '浏览电子表格', 'Find QC photos': '查找 QC 照片', 'Weidian listings': '微店商品', 'Find by reference photo': '按参考图搜索', 'Name, Weidian link or ID': '商品名称、微店链接或 ID', 'Check QC by ID': '按 ID 查 QC', 'View all ZZ1ZZ categories': '查看全部 ZZ1ZZ 类', 'Historical QC available': '已有历史质检照片', 'QC check pending': '正在等待质检结果', 'No saved QC record here': '本站暂无质检记录', 'View saved QC on the preview site': '前往预览站看质检照片'},
  'zh-Hant': {'Browse spreadsheet': '瀏覽電子表格', 'Find QC photos': '查找 QC 照片', 'Weidian listings': '微店商品', 'Find by reference photo': '按參考圖搜尋', 'Name, Weidian link or ID': '商品名稱、微店連結或 ID', 'Check QC by ID': '按 ID 查 QC', 'View all ZZ1ZZ categories': '查看全部 ZZ1ZZ 類', 'Historical QC available': '已有歷史驗貨照片', 'QC check pending': '正在等待驗貨結果', 'No saved QC record here': '本站暫無驗貨紀錄', 'View saved QC on the preview site': '前往預覽站看驗貨照片'},
};

export function navigationLabels(code) {
  const row = translated[code];
  if (!row) return {};
  const [purchase, listing, listings] = catalogLabels[code];
  return {
    ...Object.fromEntries(labels.map((label, index) => [label, row[index]])),
    'The Findspreadsheet catalog': catalogKicker[code],
    'Search by image': row[3],
    ...chineseHomeActions[code],
    'Buy on ZZ1ZZ': purchase,
    'ZZ1ZZ listing': listing,
    'ZZ1ZZ listings': listings,
  };
}
