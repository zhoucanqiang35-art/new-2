const keys = [
  'Upload image', 'Choose a photo or drop it here', 'Copy product link', 'Link copied',
  'Other shopping agents', 'Seller photos', 'Warehouse QC photos', 'Seller reference photos',
  'Check sizes and availability on Weidian', 'Try “hoodie”, “sneakers” or a product link',
  'Open image search', 'Choose an image file.',
];

const labels = {
  'zh-Hans': ['上传图片','点击选择图片，或拖放到这里','复制商品链接','链接已复制','其他代购平台','卖家图片','仓库质检图片','卖家参考图片','在微店查看尺码和库存','试试“连帽卫衣”“运动鞋”或粘贴商品链接','打开图片搜索','请选择图片文件。'],
  es: ['Subir imagen','Elige una foto o arrástrala aquí','Copiar enlace del producto','Enlace copiado','Otros agentes de compra','Fotos del vendedor','Fotos de control de calidad','Fotos de referencia del vendedor','Consulta tallas y disponibilidad en Weidian','Prueba «hoodie», «sneakers» o un enlace de producto','Abrir búsqueda por imagen','Elige un archivo de imagen.'],
  fr: ['Importer une image','Choisissez une photo ou déposez-la ici','Copier le lien du produit','Lien copié','Autres agents d’achat','Photos du vendeur','Photos de contrôle en entrepôt','Photos de référence du vendeur','Vérifier les tailles et la disponibilité sur Weidian','Essayez « hoodie », « sneakers » ou un lien produit','Ouvrir la recherche par image','Choisissez un fichier image.'],
  de: ['Bild hochladen','Foto auswählen oder hier ablegen','Produktlink kopieren','Link kopiert','Weitere Einkaufsagenten','Verkäuferfotos','Fotos der Lagerprüfung','Referenzfotos des Verkäufers','Größen und Verfügbarkeit bei Weidian prüfen','„hoodie“, „sneakers“ oder einen Produktlink eingeben','Bildsuche öffnen','Wähle eine Bilddatei aus.'],
  it: ['Carica immagine','Seleziona una foto o trascinala qui','Copia link del prodotto','Link copiato','Altri agenti di acquisto','Foto del venditore','Foto del controllo in magazzino','Foto di riferimento del venditore','Controlla taglie e disponibilità su Weidian','Prova «hoodie», «sneakers» o un link al prodotto','Apri ricerca per immagini','Scegli un file immagine.'],
  pt: ['Carregar imagem','Escolhe uma foto ou arrasta-a para aqui','Copiar ligação do produto','Ligação copiada','Outros agentes de compras','Fotos do vendedor','Fotos de controlo no armazém','Fotos de referência do vendedor','Vê tamanhos e disponibilidade na Weidian','Experimenta «hoodie», «sneakers» ou uma ligação de produto','Abrir pesquisa por imagem','Escolhe um ficheiro de imagem.'],
  ru: ['Загрузить изображение','Выберите фото или перетащите его сюда','Копировать ссылку на товар','Ссылка скопирована','Другие посредники','Фото продавца','Фото проверки на складе','Справочные фото продавца','Проверить размеры и наличие на Weidian','Введите «hoodie», «sneakers» или ссылку на товар','Открыть поиск по фото','Выберите файл изображения.'],
  ja: ['画像をアップロード','画像を選択するか、ここにドロップ','商品リンクをコピー','リンクをコピーしました','ほかの購入代行サービス','販売者の写真','倉庫の検品写真','販売者の参考写真','Weidianでサイズと在庫を確認','「hoodie」「sneakers」または商品リンクを入力','画像検索を開く','画像ファイルを選択してください。'],
  ko: ['이미지 업로드','사진을 선택하거나 여기에 끌어놓으세요','상품 링크 복사','링크가 복사되었습니다','다른 구매 대행 서비스','판매자 사진','창고 검수 사진','판매자 참고 사진','Weidian에서 사이즈 및 재고 확인','“hoodie”, “sneakers” 또는 상품 링크를 입력하세요','이미지 검색 열기','이미지 파일을 선택하세요.'],
  ar: ['رفع صورة','اختر صورة أو اسحبها إلى هنا','نسخ رابط المنتج','تم نسخ الرابط','وكلاء شراء آخرون','صور البائع','صور فحص المستودع','صور مرجعية من البائع','تحقق من المقاسات والتوفر على Weidian','جرّب hoodie أو sneakers أو رابط منتج','فتح البحث بالصور','اختر ملف صورة.'],
  tr: ['Görsel yükle','Bir fotoğraf seç veya buraya sürükle','Ürün bağlantısını kopyala','Bağlantı kopyalandı','Diğer alışveriş aracıları','Satıcı fotoğrafları','Depo kontrol fotoğrafları','Satıcının referans fotoğrafları','Weidian’da bedenleri ve stok durumunu kontrol et','«hoodie», «sneakers» veya bir ürün bağlantısı dene','Görselle aramayı aç','Bir görsel dosyası seç.'],
  pl: ['Prześlij obraz','Wybierz zdjęcie lub przeciągnij je tutaj','Kopiuj link do produktu','Link skopiowany','Inni pośrednicy zakupowi','Zdjęcia sprzedawcy','Zdjęcia z kontroli magazynowej','Zdjęcia referencyjne sprzedawcy','Sprawdź rozmiary i dostępność na Weidian','Wpisz „hoodie”, „sneakers” lub link do produktu','Otwórz wyszukiwanie obrazem','Wybierz plik graficzny.'],
  nl: ['Afbeelding uploaden','Kies een foto of sleep deze hierheen','Productlink kopiëren','Link gekopieerd','Andere aankoopagenten','Foto’s van de verkoper','Controlefoto’s uit het magazijn','Referentiefoto’s van de verkoper','Bekijk maten en beschikbaarheid op Weidian','Probeer ‘hoodie’, ‘sneakers’ of een productlink','Zoeken op afbeelding openen','Kies een afbeeldingsbestand.'],
  sv: ['Ladda upp bild','Välj ett foto eller dra det hit','Kopiera produktlänken','Länken kopierad','Andra köpombud','Säljarens foton','Foton från lagerkontrollen','Säljarens referensfoton','Kontrollera storlekar och lagerstatus på Weidian','Prova ”hoodie”, ”sneakers” eller en produktlänk','Öppna bildsökning','Välj en bildfil.'],
  da: ['Upload billede','Vælg et foto, eller træk det hertil','Kopiér produktlink','Linket er kopieret','Andre indkøbsagenter','Sælgerens billeder','Billeder fra lagerkontrol','Sælgerens referencebilleder','Se størrelser og lagerstatus på Weidian','Prøv ”hoodie”, ”sneakers” eller et produktlink','Åbn billedsøgning','Vælg en billedfil.'],
  fi: ['Lataa kuva','Valitse kuva tai vedä se tähän','Kopioi tuotelinkki','Linkki kopioitu','Muut ostoagentit','Myyjän kuvat','Varastotarkastuksen kuvat','Myyjän viitekuvat','Tarkista koot ja saatavuus Weidianissa','Kokeile hakua ”hoodie”, ”sneakers” tai tuotelinkkiä','Avaa kuvahaku','Valitse kuvatiedosto.'],
  no: ['Last opp bilde','Velg et bilde eller dra det hit','Kopier produktlenken','Lenken er kopiert','Andre innkjøpsagenter','Selgerens bilder','Bilder fra lagerkontrollen','Selgerens referansebilder','Sjekk størrelser og lagerstatus på Weidian','Prøv «hoodie», «sneakers» eller en produktlenke','Åpne bildesøk','Velg en bildefil.'],
  hu: ['Kép feltöltése','Válassz egy fotót, vagy húzd ide','Terméklink másolása','Link másolva','Más vásárlási közvetítők','Eladói képek','Raktári ellenőrzés képei','Az eladó referenciaképei','Méret és készlet ellenőrzése a Weidianon','Próbáld: „hoodie”, „sneakers” vagy terméklink','Képkeresés megnyitása','Válassz képfájlt.'],
  ro: ['Încarcă imaginea','Alege o fotografie sau trage-o aici','Copiază linkul produsului','Link copiat','Alți agenți de cumpărături','Fotografiile vânzătorului','Fotografii de verificare din depozit','Fotografii de referință ale vânzătorului','Verifică mărimile și disponibilitatea pe Weidian','Încearcă „hoodie”, „sneakers” sau un link de produs','Deschide căutarea după imagine','Alege un fișier de imagine.'],
  cs: ['Nahrát obrázek','Vyberte fotografii nebo ji přetáhněte sem','Zkopírovat odkaz na produkt','Odkaz zkopírován','Další nákupní agenti','Fotky prodejce','Fotky z kontroly ve skladu','Referenční fotky prodejce','Ověřit velikosti a dostupnost na Weidianu','Zkuste „hoodie“, „sneakers“ nebo odkaz na produkt','Otevřít vyhledávání podle obrázku','Vyberte soubor s obrázkem.'],
  uk: ['Завантажити зображення','Виберіть фото або перетягніть його сюди','Скопіювати посилання на товар','Посилання скопійовано','Інші посередники','Фото продавця','Фото перевірки на складі','Довідкові фото продавця','Перевірте розміри й наявність на Weidian','Введіть «hoodie», «sneakers» або посилання на товар','Відкрити пошук за фото','Виберіть файл зображення.'],
};

const searchSuggestions = {
  'zh-Hans': ['连帽卫衣', '运动鞋', '球衣'],
  es: ['Sudaderas con capucha', 'Zapatillas', 'Camisetas deportivas'],
  fr: ['Sweats à capuche', 'Baskets', 'Maillots'],
  de: ['Kapuzenpullover', 'Sneaker', 'Trikots'],
  it: ['Felpe con cappuccio', 'Sneakers', 'Maglie sportive'],
  pt: ['Camisolas com capuz', 'Sapatilhas', 'Camisolas desportivas'],
  ru: ['Худи', 'Кроссовки', 'Джерси'],
  ja: ['パーカー', 'スニーカー', 'ユニフォーム'],
  ko: ['후드티', '운동화', '유니폼'],
  ar: ['هوديز', 'أحذية رياضية', 'قمصان رياضية'],
  tr: ['Kapüşonlular', 'Spor ayakkabılar', 'Formalar'],
  pl: ['Bluzy z kapturem', 'Sneakersy', 'Koszulki sportowe'],
  nl: ['Hoodies', 'Sneakers', 'Sportshirts'],
  sv: ['Huvtröjor', 'Sneakers', 'Matchtröjor'],
  da: ['Hættetrøjer', 'Sneakers', 'Sportstrøjer'],
  fi: ['Hupparit', 'Lenkkarit', 'Pelipaidat'],
  no: ['Hettegensere', 'Joggesko', 'Treningsdrakter'],
  hu: ['Kapucnis pulóverek', 'Sneakerek', 'Mezek'],
  ro: ['Hanorace', 'Adidași', 'Tricouri de sport'],
  cs: ['Mikiny s kapucí', 'Tenisky', 'Dresy'],
  uk: ['Худі', 'Кросівки', 'Ігрові футболки'],
};

export function uiCopy(locale) {
  const translated = labels[locale];
  if (!translated) return {};
  const [hoodies, sneakers, jerseys] = searchSuggestions[locale];
  return {
    ...Object.fromEntries(keys.map((key, index) => [key, translated[index]])),
    ...(locale === 'zh-Hans' ? {
      'Image search': '图片搜索',
      'All categories': '所有类别',
      'View all products': '查看此类别全部商品',
      'Checking seller options…': '正在读取卖家选项…',
      'Open Weidian to see the seller’s current options.': '前往微店查看卖家的当前选项。',
      'Options are temporarily unavailable. Check the seller listing.': '暂时无法读取选项，请查看卖家原页面。',
      'Search suggestions': '搜索提示',
      'Hoodies & sweaters': '连帽衫与卫衣',
      Headwear: '帽子和头饰',
      'ZZ1ZZ visually similar listings from the saved index.': '从图片索引找到 ZZ1ZZ 件相似商品。',
    } : {}),
    Hoodies: hoodies,
    Sneakers: sneakers,
    Jerseys: jerseys,
  };
}
