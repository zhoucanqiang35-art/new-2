export const languages = [
  ['en','EN','English'], ['de','DE','Deutsch'], ['fr','FR','Français'],
  ['es','ES','Español'], ['it','IT','Italiano'], ['nl','NL','Nederlands'],
  ['pt','PT','Português'], ['pl','PL','Polski'], ['sv','SV','Svenska'],
  ['zh-CN','简','简体中文'], ['da','DA','Dansk'], ['fi','FI','Suomi'],
  ['ru','RU','Русский'], ['uk','UK','Українська'], ['tr','TR','Türkçe'],
  ['ar','AR','العربية'], ['hi','HI','हिन्दी'], ['id','ID','Bahasa Indonesia'],
  ['vi','VI','Tiếng Việt'], ['th','TH','ไทย'], ['ja','JA','日本語'], ['ko','KO','한국어'],
];

const keys = [
  'language','sheet','imageSearch','guide','search','searchHint','upload','findSimilar',
  'findQc','browseCategory','fullSheet','featured','browseAll','ordering','allCategories',
  'latest','highPrice','lowPrice','previous','next','home','itemId','buy','otherAgents',
  'copy','copied','style','size','sellerPhotos','detailPhotos','warehousePhotos','openQc','sourcePrice','variantsUnavailable',
];

const rows = {
  en: 'Language|Spreadsheet|Image Search|Buying Guide|Search|Product name or Weidian ID|Upload image|Find similar products|Find QC photos|Browse by category|Full spreadsheet|Featured finds|Browse all finds|Ordering through iTaoBuy|All categories|Latest|Price: high to low|Price: low to high|Previous|Next|Home|Item ID|Buy on iTaoBuy|Other purchasing platforms|Copy product link|Link copied|Style|Size|Seller photos|Detail photos|Warehouse QC photos|Open QC finder|Source price|Check available options on iTaoBuy.',
  'zh-CN': '语言|商品表格|图片搜索|购买指南|搜索|商品名称或微店商品编号|图片上传|查找相似商品|查找 QC 照片|按分类浏览|完整商品表格|精选商品|浏览所有商品|通过 iTaoBuy 下单|全部分类|最新|价格从高到低|价格从低到高|上一页|下一页|首页|商品编号|在 iTaoBuy 上购买|其他购买平台|复制商品链接|链接已复制|款式|尺寸|卖家照片|细节照片|仓库 QC 照片|打开 QC 查询|来源价格|请在 iTaoBuy 查看可选规格。',
  es: 'Idioma|Catálogo|Búsqueda por imagen|Guía de compra|Buscar|Nombre del producto o ID de Weidian|Subir imagen|Encontrar productos similares|Buscar fotos QC|Explorar por categoría|Catálogo completo|Productos destacados|Ver todos los productos|Pedir a través de iTaoBuy|Todas las categorías|Más recientes|Precio: de mayor a menor|Precio: de menor a mayor|Anterior|Siguiente|Inicio|ID del producto|Comprar en iTaoBuy|Otras plataformas de compra|Copiar enlace del producto|Enlace copiado|Estilo|Talla|Fotos del vendedor|Fotos de detalle|Fotos QC del almacén|Abrir buscador QC|Precio de origen|Consulta las opciones disponibles en iTaoBuy.',
  fr: 'Langue|Catalogue|Recherche par image|Guide d’achat|Rechercher|Nom du produit ou identifiant Weidian|Importer une image|Trouver des produits similaires|Rechercher des photos QC|Parcourir par catégorie|Catalogue complet|Produits à découvrir|Voir tous les produits|Commander via iTaoBuy|Toutes les catégories|Les plus récents|Prix décroissant|Prix croissant|Précédent|Suivant|Accueil|Identifiant du produit|Acheter sur iTaoBuy|Autres plateformes d’achat|Copier le lien du produit|Lien copié|Style|Taille|Photos du vendeur|Photos de détail|Photos QC de l’entrepôt|Ouvrir la recherche QC|Prix d’origine|Consultez les options sur iTaoBuy.',
  de: 'Sprache|Produktliste|Bildsuche|Kaufanleitung|Suchen|Produktname oder Weidian-ID|Bild hochladen|Ähnliche Produkte finden|QC-Fotos suchen|Nach Kategorie stöbern|Vollständige Produktliste|Empfohlene Produkte|Alle Produkte ansehen|Über iTaoBuy bestellen|Alle Kategorien|Neueste|Preis absteigend|Preis aufsteigend|Zurück|Weiter|Startseite|Artikel-ID|Bei iTaoBuy kaufen|Andere Einkaufsplattformen|Produktlink kopieren|Link kopiert|Stil|Größe|Verkäuferfotos|Detailfotos|QC-Fotos aus dem Lager|QC-Suche öffnen|Quellpreis|Verfügbare Optionen auf iTaoBuy ansehen.',
  it: 'Lingua|Catalogo|Ricerca per immagine|Guida all’acquisto|Cerca|Nome del prodotto o ID Weidian|Carica immagine|Trova prodotti simili|Cerca foto QC|Sfoglia per categoria|Catalogo completo|Prodotti in evidenza|Vedi tutti i prodotti|Ordinare tramite iTaoBuy|Tutte le categorie|Più recenti|Prezzo decrescente|Prezzo crescente|Indietro|Avanti|Home|ID prodotto|Acquista su iTaoBuy|Altre piattaforme di acquisto|Copia il link del prodotto|Link copiato|Stile|Taglia|Foto del venditore|Foto di dettaglio|Foto QC del magazzino|Apri la ricerca QC|Prezzo di origine|Verifica le opzioni disponibili su iTaoBuy.',
  pt: 'Idioma|Catálogo|Pesquisa por imagem|Guia de compras|Pesquisar|Nome do produto ou ID Weidian|Carregar imagem|Encontrar produtos semelhantes|Procurar fotos QC|Explorar por categoria|Catálogo completo|Produtos em destaque|Ver todos os produtos|Encomendar pelo iTaoBuy|Todas as categorias|Mais recentes|Preço: do maior ao menor|Preço: do menor ao maior|Anterior|Seguinte|Início|ID do produto|Comprar no iTaoBuy|Outras plataformas de compra|Copiar link do produto|Link copiado|Estilo|Tamanho|Fotos do vendedor|Fotos de detalhe|Fotos QC do armazém|Abrir pesquisa QC|Preço de origem|Confira as opções disponíveis no iTaoBuy.',
  nl: 'Taal|Productlijst|Zoeken op afbeelding|Koopgids|Zoeken|Productnaam of Weidian-ID|Afbeelding uploaden|Vergelijkbare producten zoeken|QC-foto’s zoeken|Per categorie bekijken|Volledige productlijst|Uitgelichte producten|Alle producten bekijken|Bestellen via iTaoBuy|Alle categorieën|Nieuwste|Prijs: hoog naar laag|Prijs: laag naar hoog|Vorige|Volgende|Home|Artikel-ID|Kopen op iTaoBuy|Andere aankoopplatforms|Productlink kopiëren|Link gekopieerd|Stijl|Maat|Verkopersfoto’s|Detailfoto’s|QC-foto’s uit het magazijn|QC-zoeker openen|Bronprijs|Bekijk de beschikbare opties op iTaoBuy.',
  pl: 'Język|Katalog|Wyszukiwanie obrazem|Poradnik zakupowy|Szukaj|Nazwa produktu lub ID Weidian|Prześlij obraz|Znajdź podobne produkty|Znajdź zdjęcia QC|Przeglądaj według kategorii|Pełny katalog|Polecane produkty|Zobacz wszystkie produkty|Zamawianie przez iTaoBuy|Wszystkie kategorie|Najnowsze|Cena: od najwyższej|Cena: od najniższej|Wstecz|Dalej|Strona główna|ID produktu|Kup na iTaoBuy|Inne platformy zakupowe|Kopiuj link produktu|Link skopiowany|Styl|Rozmiar|Zdjęcia sprzedawcy|Zdjęcia szczegółów|Zdjęcia QC z magazynu|Otwórz wyszukiwarkę QC|Cena źródłowa|Sprawdź dostępne opcje na iTaoBuy.',
  ru: 'Язык|Каталог|Поиск по изображению|Руководство по покупке|Поиск|Название товара или ID Weidian|Загрузить изображение|Найти похожие товары|Найти фото QC|Смотреть по категориям|Полный каталог|Избранные товары|Смотреть все товары|Заказ через iTaoBuy|Все категории|Новые|Цена по убыванию|Цена по возрастанию|Назад|Далее|Главная|ID товара|Купить на iTaoBuy|Другие площадки покупки|Копировать ссылку на товар|Ссылка скопирована|Стиль|Размер|Фото продавца|Фото деталей|Фото QC со склада|Открыть поиск QC|Цена источника|Доступные варианты смотрите на iTaoBuy.',
  uk: 'Мова|Каталог|Пошук за зображенням|Посібник із купівлі|Пошук|Назва товару або ID Weidian|Завантажити зображення|Знайти схожі товари|Знайти фото QC|Огляд за категоріями|Повний каталог|Рекомендовані товари|Переглянути всі товари|Замовлення через iTaoBuy|Усі категорії|Найновіші|Ціна за спаданням|Ціна за зростанням|Назад|Далі|Головна|ID товару|Купити на iTaoBuy|Інші платформи для купівлі|Копіювати посилання на товар|Посилання скопійовано|Стиль|Розмір|Фото продавця|Фото деталей|Фото QC зі складу|Відкрити пошук QC|Ціна джерела|Перевірте доступні варіанти на iTaoBuy.',
  tr: 'Dil|Ürün listesi|Görselle arama|Alışveriş rehberi|Ara|Ürün adı veya Weidian kimliği|Görsel yükle|Benzer ürünleri bul|QC fotoğraflarını bul|Kategoriye göre göz at|Tam ürün listesi|Öne çıkan ürünler|Tüm ürünleri gör|iTaoBuy üzerinden sipariş|Tüm kategoriler|En yeni|Fiyat: yüksekten düşüğe|Fiyat: düşükten yükseğe|Önceki|Sonraki|Ana sayfa|Ürün kimliği|iTaoBuy’da satın al|Diğer alışveriş platformları|Ürün bağlantısını kopyala|Bağlantı kopyalandı|Stil|Beden|Satıcı fotoğrafları|Detay fotoğrafları|Depo QC fotoğrafları|QC aramasını aç|Kaynak fiyat|Mevcut seçeneklere iTaoBuy’dan bakın.',
  ar: 'اللغة|كتالوج المنتجات|البحث بالصور|دليل الشراء|بحث|اسم المنتج أو معرّف Weidian|رفع صورة|العثور على منتجات مشابهة|البحث عن صور QC|تصفح حسب الفئة|الكتالوج الكامل|منتجات مميزة|عرض كل المنتجات|الطلب عبر iTaoBuy|جميع الفئات|الأحدث|السعر: من الأعلى إلى الأدنى|السعر: من الأدنى إلى الأعلى|السابق|التالي|الرئيسية|معرّف المنتج|الشراء على iTaoBuy|منصات شراء أخرى|نسخ رابط المنتج|تم نسخ الرابط|النمط|المقاس|صور البائع|صور التفاصيل|صور فحص المستودع|فتح البحث عن صور QC|سعر المصدر|تحقق من الخيارات المتاحة على iTaoBuy.',
  hi: 'भाषा|उत्पाद सूची|चित्र से खोजें|खरीदारी गाइड|खोजें|उत्पाद का नाम या Weidian आईडी|चित्र अपलोड करें|मिलते-जुलते उत्पाद ढूँढें|QC फ़ोटो ढूँढें|श्रेणी के अनुसार देखें|पूरी उत्पाद सूची|चुनिंदा उत्पाद|सभी उत्पाद देखें|iTaoBuy से ऑर्डर करना|सभी श्रेणियाँ|नवीनतम|कीमत: अधिक से कम|कीमत: कम से अधिक|पिछला|अगला|होम|उत्पाद आईडी|iTaoBuy पर खरीदें|अन्य खरीदारी प्लेटफ़ॉर्म|उत्पाद लिंक कॉपी करें|लिंक कॉपी किया गया|स्टाइल|आकार|विक्रेता की फ़ोटो|विवरण की फ़ोटो|वेयरहाउस QC फ़ोटो|QC खोज खोलें|मूल स्रोत की कीमत|उपलब्ध विकल्प iTaoBuy पर देखें।',
  id: 'Bahasa|Katalog|Pencarian gambar|Panduan belanja|Cari|Nama produk atau ID Weidian|Unggah gambar|Cari produk serupa|Cari foto QC|Jelajahi berdasarkan kategori|Katalog lengkap|Produk pilihan|Lihat semua produk|Memesan melalui iTaoBuy|Semua kategori|Terbaru|Harga: tertinggi ke terendah|Harga: terendah ke tertinggi|Sebelumnya|Selanjutnya|Beranda|ID produk|Beli di iTaoBuy|Platform belanja lain|Salin tautan produk|Tautan disalin|Model|Ukuran|Foto penjual|Foto detail|Foto QC gudang|Buka pencarian QC|Harga sumber|Lihat pilihan yang tersedia di iTaoBuy.',
  vi: 'Ngôn ngữ|Danh mục sản phẩm|Tìm bằng hình ảnh|Hướng dẫn mua hàng|Tìm kiếm|Tên sản phẩm hoặc mã Weidian|Tải ảnh lên|Tìm sản phẩm tương tự|Tìm ảnh QC|Xem theo danh mục|Danh mục đầy đủ|Sản phẩm nổi bật|Xem tất cả sản phẩm|Đặt hàng qua iTaoBuy|Tất cả danh mục|Mới nhất|Giá: cao đến thấp|Giá: thấp đến cao|Trước|Tiếp theo|Trang chủ|Mã sản phẩm|Mua trên iTaoBuy|Nền tảng mua hàng khác|Sao chép liên kết sản phẩm|Đã sao chép liên kết|Kiểu|Kích cỡ|Ảnh người bán|Ảnh chi tiết|Ảnh QC tại kho|Mở tìm kiếm QC|Giá nguồn|Xem các lựa chọn trên iTaoBuy.',
  th: 'ภาษา|รายการสินค้า|ค้นหาด้วยรูปภาพ|คู่มือการซื้อ|ค้นหา|ชื่อสินค้าหรือรหัส Weidian|อัปโหลดรูปภาพ|ค้นหาสินค้าที่คล้ายกัน|ค้นหารูป QC|เลือกดูตามหมวดหมู่|รายการสินค้าทั้งหมด|สินค้าแนะนำ|ดูสินค้าทั้งหมด|สั่งซื้อผ่าน iTaoBuy|ทุกหมวดหมู่|ล่าสุด|ราคา: สูงไปต่ำ|ราคา: ต่ำไปสูง|ก่อนหน้า|ถัดไป|หน้าหลัก|รหัสสินค้า|ซื้อบน iTaoBuy|แพลตฟอร์มซื้ออื่น ๆ|คัดลอกลิงก์สินค้า|คัดลอกลิงก์แล้ว|รูปแบบ|ขนาด|รูปจากผู้ขาย|รูปภาพรายละเอียด|รูป QC จากคลังสินค้า|เปิดการค้นหา QC|ราคาจากต้นทาง|ดูตัวเลือกที่มีบน iTaoBuy',
  ja: '言語|商品一覧|画像検索|購入ガイド|検索|商品名またはWeidianの商品ID|画像をアップロード|似た商品を探す|QC写真を探す|カテゴリから探す|全商品一覧|注目の商品|すべての商品を見る|iTaoBuyでの注文方法|すべてのカテゴリ|新着|価格の高い順|価格の安い順|前へ|次へ|ホーム|商品ID|iTaoBuyで購入|その他の購入プラットフォーム|商品リンクをコピー|リンクをコピーしました|スタイル|サイズ|出品者の写真|詳細写真|倉庫のQC写真|QC検索を開く|元の掲載価格|購入可能なオプションはiTaoBuyでご確認ください。',
  ko: '언어|상품 목록|이미지 검색|구매 가이드|검색|상품 이름 또는 Weidian 상품 ID|이미지 업로드|비슷한 상품 찾기|QC 사진 찾기|카테고리별 보기|전체 상품 목록|추천 상품|모든 상품 보기|iTaoBuy 주문 방법|모든 카테고리|최신순|가격 높은 순|가격 낮은 순|이전|다음|홈|상품 ID|iTaoBuy에서 구매|다른 구매 플랫폼|상품 링크 복사|링크 복사 완료|스타일|사이즈|판매자 사진|상세 사진|창고 QC 사진|QC 검색 열기|원본 목록 가격|구매 가능한 옵션을 iTaoBuy에서 확인하세요.',
  sv: 'Språk|Produktlista|Bildsökning|Köpguide|Sök|Produktnamn eller Weidian-ID|Ladda upp bild|Hitta liknande produkter|Hitta QC-bilder|Bläddra efter kategori|Fullständig produktlista|Utvalda produkter|Visa alla produkter|Beställa via iTaoBuy|Alla kategorier|Senaste|Pris: högst först|Pris: lägst först|Föregående|Nästa|Hem|Produkt-ID|Köp på iTaoBuy|Andra köpplattformar|Kopiera produktlänk|Länken kopierades|Stil|Storlek|Säljarens bilder|Detaljbilder|QC-bilder från lagret|Öppna QC-sökning|Källpris|Se tillgängliga alternativ på iTaoBuy.',
  da: 'Sprog|Produktliste|Billedsøgning|Købsguide|Søg|Produktnavn eller Weidian-ID|Upload billede|Find lignende produkter|Find QC-billeder|Gennemse efter kategori|Komplet produktliste|Udvalgte produkter|Se alle produkter|Bestil via iTaoBuy|Alle kategorier|Nyeste|Pris: høj til lav|Pris: lav til høj|Forrige|Næste|Forside|Produkt-ID|Køb på iTaoBuy|Andre købsplatforme|Kopiér produktlink|Link kopieret|Stil|Størrelse|Sælgerbilleder|Detaljebilleder|QC-billeder fra lageret|Åbn QC-søgning|Kildepris|Se de tilgængelige muligheder på iTaoBuy.',
  fi: 'Kieli|Tuoteluettelo|Kuvahaku|Osto-opas|Hae|Tuotteen nimi tai Weidian-tunnus|Lataa kuva|Etsi samankaltaisia tuotteita|Etsi QC-kuvia|Selaa kategorioittain|Koko tuoteluettelo|Poimitut tuotteet|Näytä kaikki tuotteet|Tilaa iTaoBuyn kautta|Kaikki kategoriat|Uusimmat|Hinta: kallein ensin|Hinta: halvin ensin|Edellinen|Seuraava|Etusivu|Tuotetunnus|Osta iTaoBuysta|Muut ostoalustat|Kopioi tuotteen linkki|Linkki kopioitu|Tyyli|Koko|Myyjän kuvat|Yksityiskohtakuvat|Varaston QC-kuvat|Avaa QC-haku|Lähdehinta|Tarkista saatavilla olevat vaihtoehdot iTaoBuysta.',
};

const packs = Object.fromEntries(Object.entries(rows).map(([code, line]) => [code, line.split('|')]));
const heroCopy = {
  en: 'Find products across Weidian, look through seller photos and available warehouse QC, then open the matching listing on iTaoBuy.',
  'zh-CN': '浏览微店商品，查看卖家图片和已有的仓库 QC 照片，再到 iTaoBuy 打开同一件商品。',
  es: 'Explora productos de Weidian, revisa las fotos del vendedor y del almacén y abre el anuncio correspondiente en iTaoBuy.',
  fr: 'Parcourez les produits Weidian, consultez les photos disponibles et ouvrez la fiche correspondante sur iTaoBuy.',
  de: 'Entdecke Produkte von Weidian, prüfe verfügbare Fotos und öffne das passende Angebot bei iTaoBuy.',
  it: 'Esplora i prodotti Weidian, controlla le foto disponibili e apri l’inserzione corrispondente su iTaoBuy.',
  pt: 'Explore produtos Weidian, veja as fotos disponíveis e abra o anúncio correspondente no iTaoBuy.',
  nl: 'Vind producten op Weidian, bekijk de beschikbare foto’s en open de juiste aanbieding op iTaoBuy.',
  pl: 'Przeglądaj produkty Weidian, sprawdź dostępne zdjęcia i otwórz odpowiednią ofertę na iTaoBuy.',
  ru: 'Найдите товар на Weidian, просмотрите доступные фотографии и откройте соответствующее объявление на iTaoBuy.',
  uk: 'Знайдіть товари Weidian, перегляньте доступні фото й відкрийте відповідну пропозицію на iTaoBuy.',
  tr: 'Weidian ürünlerine göz atın, mevcut fotoğrafları inceleyin ve ilgili ürünü iTaoBuy’da açın.',
  ar: 'تصفح منتجات Weidian وراجع الصور المتاحة، ثم افتح صفحة المنتج المطابق على iTaoBuy.',
  hi: 'Weidian के उत्पाद ढूँढें, उपलब्ध फ़ोटो देखें और फिर उसी उत्पाद की लिस्टिंग iTaoBuy पर खोलें।',
  id: 'Temukan produk Weidian, periksa foto yang tersedia, lalu buka produk yang sesuai di iTaoBuy.',
  vi: 'Tìm sản phẩm Weidian, xem ảnh có sẵn rồi mở đúng sản phẩm trên iTaoBuy.',
  th: 'ค้นหาสินค้าบน Weidian ดูรูปภาพที่มี แล้วเปิดรายการสินค้าที่ตรงกันบน iTaoBuy',
  ja: 'Weidianの商品を探し、利用できる写真を確認してから、iTaoBuyで同じ商品を開けます。',
  ko: 'Weidian 상품을 찾고 제공되는 사진을 확인한 후 iTaoBuy에서 같은 상품을 열어 보세요.',
  sv: 'Hitta produkter på Weidian, granska tillgängliga bilder och öppna motsvarande annons på iTaoBuy.',
  da: 'Find produkter på Weidian, se de tilgængelige billeder, og åbn det tilsvarende produkt på iTaoBuy.',
  fi: 'Etsi Weidian-tuotteita, tarkista saatavilla olevat kuvat ja avaa vastaava tuote iTaoBuyssa.',
};

const productLinkLabels = {
  en: ['Product links', 'Original Weidian listing', 'View on Findspreadsheet'],
  'zh-CN': ['商品链接', '微店原商品', '在 Findspreadsheet 查看'],
  es: ['Enlaces del producto', 'Anuncio original de Weidian', 'Ver en Findspreadsheet'],
  fr: ['Liens du produit', 'Annonce Weidian originale', 'Voir sur Findspreadsheet'],
  de: ['Produktlinks', 'Originalangebot auf Weidian', 'Auf Findspreadsheet ansehen'],
  it: ['Link del prodotto', 'Inserzione originale su Weidian', 'Vedi su Findspreadsheet'],
  pt: ['Links do produto', 'Anúncio original da Weidian', 'Ver no Findspreadsheet'],
  nl: ['Productlinks', 'Originele Weidian-aanbieding', 'Bekijk op Findspreadsheet'],
  pl: ['Linki do produktu', 'Oryginalna oferta Weidian', 'Zobacz na Findspreadsheet'],
  ru: ['Ссылки на товар', 'Исходное объявление Weidian', 'Открыть на Findspreadsheet'],
  uk: ['Посилання на товар', 'Початкова пропозиція Weidian', 'Переглянути на Findspreadsheet'],
  tr: ['Ürün bağlantıları', 'Orijinal Weidian ilanı', 'Findspreadsheet’te görüntüle'],
  ar: ['روابط المنتج', 'صفحة المنتج الأصلية على Weidian', 'عرض على Findspreadsheet'],
  hi: ['उत्पाद लिंक', 'Weidian की मूल लिस्टिंग', 'Findspreadsheet पर देखें'],
  id: ['Tautan produk', 'Produk asli di Weidian', 'Lihat di Findspreadsheet'],
  vi: ['Liên kết sản phẩm', 'Sản phẩm gốc trên Weidian', 'Xem trên Findspreadsheet'],
  th: ['ลิงก์สินค้า', 'รายการต้นฉบับบน Weidian', 'ดูบน Findspreadsheet'],
  ja: ['商品リンク', 'Weidianの元の商品ページ', 'Findspreadsheetで見る'],
  ko: ['상품 링크', 'Weidian 원본 상품', 'Findspreadsheet에서 보기'],
  sv: ['Produktlänkar', 'Originalannons på Weidian', 'Visa på Findspreadsheet'],
  da: ['Produktlinks', 'Oprindelig annonce på Weidian', 'Se på Findspreadsheet'],
  fi: ['Tuotelinkit', 'Alkuperäinen Weidian-ilmoitus', 'Katso Findspreadsheetissa'],
};
const productLinkKeys = ['productLinks', 'originalWeidian', 'viewOnFindspreadsheet'];

const currencyLabels = {
  en: 'Price currency', 'zh-CN': '价格币种', es: 'Moneda', fr: 'Devise',
  de: 'Währung', it: 'Valuta', pt: 'Moeda', nl: 'Valuta', pl: 'Waluta',
  ru: 'Валюта', uk: 'Валюта', tr: 'Para birimi', ar: 'العملة', hi: 'मुद्रा',
  id: 'Mata uang', vi: 'Tiền tệ', th: 'สกุลเงิน', ja: '表示通貨', ko: '표시 통화',
  sv: 'Valuta', da: 'Valuta', fi: 'Valuutta',
};

const suggestionLabels = {
  en: 'Try a search', 'zh-CN': '搜索示例', es: 'Prueba una búsqueda',
  fr: 'Exemples de recherche', de: 'Suchbeispiele', it: 'Esempi di ricerca',
  pt: 'Experimente pesquisar', nl: 'Zoekvoorbeelden', pl: 'Przykładowe wyszukiwania',
  ru: 'Примеры поиска', uk: 'Приклади пошуку', tr: 'Arama örnekleri',
  ar: 'أمثلة للبحث', hi: 'खोज के उदाहरण', id: 'Contoh pencarian',
  vi: 'Ví dụ tìm kiếm', th: 'ตัวอย่างการค้นหา', ja: '検索例',
  ko: '검색 예시', sv: 'Sökexempel', da: 'Søgeeksempler', fi: 'Hakuesimerkkejä',
};

const colorLabels = {
  en: 'Color', 'zh-CN': '颜色', es: 'Color', fr: 'Couleur', de: 'Farbe', it: 'Colore',
  pt: 'Cor', nl: 'Kleur', pl: 'Kolor', ru: 'Цвет', uk: 'Колір', tr: 'Renk',
  ar: 'اللون', hi: 'रंग', id: 'Warna', vi: 'Màu sắc', th: 'สี', ja: 'カラー',
  ko: '색상', sv: 'Färg', da: 'Farve', fi: 'Väri',
};

export function readLanguage() {
  try {
    const saved = localStorage.getItem('itaobuy-language');
    return saved && Object.hasOwn(packs, saved) ? saved : 'en';
  } catch {
    return 'en';
  }
}

export function translate(key, code = document.documentElement.lang, searchExample = 'sneakers') {
  if (key === 'checkQc') return code === 'en' ? 'Check QC' : translate('findQc', code);
  if (key === 'color') return colorLabels[code] ?? colorLabels.en;
  if (key === 'trySearch') return suggestionLabels[code] ?? suggestionLabels.en;
  if (key === 'homeSearchHint') {
    if (code === 'en') return 'Try ' + searchExample + ' or a Weidian item ID';
    if (code === 'zh-CN') return '试试 ' + searchExample + ' 或微店商品编号';
    return translate('searchHint', code);
  }
  if (key === 'faq') return code === 'zh-CN' ? '常见问题' : 'FAQ';
  if (key === 'priceCurrency') return currencyLabels[code] ?? currencyLabels.en;
  if (key === 'heroCopy') return heroCopy[code] ?? heroCopy.en;
  const linkIndex = productLinkKeys.indexOf(key);
  if (linkIndex !== -1) return (productLinkLabels[code] ?? productLinkLabels.en)[linkIndex];
  const index = keys.indexOf(key);
  return packs[code]?.[index] ?? packs.en[index];
}

export function setLanguage(code) {
  if (!Object.hasOwn(packs, code)) return;
  try { localStorage.setItem('itaobuy-language', code); } catch {}
  document.documentElement.lang = code;
  document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
  for (const item of document.querySelectorAll('[data-i18n]')) {
    item.textContent = translate(item.dataset.i18n, code) ?? item.textContent;
  }
  for (const item of document.querySelectorAll('[data-i18n-placeholder]')) {
    item.setAttribute('placeholder', translate(item.dataset.i18nPlaceholder, code, item.dataset.searchExample));
  }
  for (const item of document.querySelectorAll('[data-i18n-aria]')) {
    item.setAttribute('aria-label', translate(item.dataset.i18nAria, code));
  }
}
