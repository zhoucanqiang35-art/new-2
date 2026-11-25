const controls = {
  'zh-Hans': ['上传图片', '复制商品链接', '已复制', '拖放图片到这里'],
  es: ['Subir imagen', 'Copiar enlace del producto', 'Enlace copiado', 'Arrastra la imagen aquí'],
  fr: ['Importer une image', 'Copier le lien du produit', 'Lien copié', 'Déposez une image ici'],
  de: ['Bild hochladen', 'Produktlink kopieren', 'Link kopiert', 'Bild hierher ziehen'],
  it: ['Carica immagine', 'Copia link prodotto', 'Link copiato', 'Trascina qui un’immagine'],
  pt: ['Carregar imagem', 'Copiar ligação do produto', 'Ligação copiada', 'Arraste uma imagem para aqui'],
  ru: ['Загрузить изображение', 'Копировать ссылку на товар', 'Ссылка скопирована', 'Перетащите изображение сюда'],
  ja: ['画像をアップロード', '商品リンクをコピー', 'コピーしました', 'ここに画像をドロップ'],
  ko: ['이미지 업로드', '상품 링크 복사', '링크 복사 완료', '이미지를 여기에 놓으세요'],
  ar: ['رفع صورة', 'نسخ رابط المنتج', 'تم نسخ الرابط', 'اسحب الصورة إلى هنا'],
  tr: ['Görsel yükle', 'Ürün bağlantısını kopyala', 'Bağlantı kopyalandı', 'Görseli buraya bırakın'],
  pl: ['Prześlij obraz', 'Kopiuj link do produktu', 'Link skopiowany', 'Upuść obraz tutaj'],
  nl: ['Afbeelding uploaden', 'Productlink kopiëren', 'Link gekopieerd', 'Sleep een afbeelding hierheen'],
  sv: ['Ladda upp bild', 'Kopiera produktlänk', 'Länken kopierad', 'Släpp bilden här'],
  da: ['Upload billede', 'Kopiér produktlink', 'Linket er kopieret', 'Slip et billede her'],
  fi: ['Lataa kuva', 'Kopioi tuotelinkki', 'Linkki kopioitu', 'Pudota kuva tähän'],
  no: ['Last opp bilde', 'Kopier produktlenke', 'Lenken er kopiert', 'Slipp bildet her'],
  hu: ['Kép feltöltése', 'Terméklink másolása', 'Link másolva', 'Húzza ide a képet'],
  ro: ['Încarcă o imagine', 'Copiază linkul produsului', 'Link copiat', 'Trage imaginea aici'],
  cs: ['Nahrát obrázek', 'Zkopírovat odkaz na produkt', 'Odkaz zkopírován', 'Přetáhněte sem obrázek'],
  uk: ['Завантажити зображення', 'Копіювати посилання на товар', 'Посилання скопійовано', 'Перетягніть сюди зображення'],
};
const searchHints = {
  'zh-Hans': ['试试搜索', '连帽衫'],
  es: ['Prueba una búsqueda', 'Sudadera con capucha'],
  fr: ['Essayez une recherche', 'Sweat à capuche'],
  de: ['Suche ausprobieren', 'Kapuzenpullover'],
  it: ['Prova a cercare', 'Felpa con cappuccio'],
  pt: ['Experimente pesquisar', 'Camisola com capuz'],
  ru: ['Попробуйте поиск', 'Худи'],
  ja: ['検索例', 'パーカー'],
  ko: ['검색 예시', '후드티'],
  ar: ['جرّب البحث', 'سترة بغطاء رأس'],
  tr: ['Aramayı deneyin', 'Kapüşonlu sweatshirt'],
  pl: ['Wypróbuj wyszukiwanie', 'Bluza z kapturem'],
  nl: ['Probeer een zoekopdracht', 'Hoodie'],
  sv: ['Prova att söka', 'Huvtröja'],
  da: ['Prøv at søge', 'Hættetrøje'],
  fi: ['Kokeile hakua', 'Huppari'],
  no: ['Prøv å søke', 'Hettegenser'],
  hu: ['Próbáljon rákeresni', 'Kapucnis pulóver'],
  ro: ['Încearcă o căutare', 'Hanorac'],
  cs: ['Zkuste vyhledat', 'Mikina s kapucí'],
  uk: ['Спробуйте пошук', 'Худі'],
};

const labels = ['Upload image', 'Copy product link', 'Link copied', 'Drop an image here'];

export function newLabels(code) {
  const translated = Object.fromEntries((controls[code] ?? []).map((label, index) => [labels[index], label]));
  if (searchHints[code]) {
    [translated['Try a search'], translated.Hoodie] = searchHints[code];
  }
  if (code === 'zh-Hans') Object.assign(translated, {
    'LoloBuy Image Search': 'LoloBuy 图片搜索', 'LoloBuy Findslist home': 'LoloBuy Findslist 首页',
    Styles: '款式', Sizes: '尺码', 'Loading listing options…': '正在读取商品规格…',
    'Check styles and sizes on LoloBuy': '到 LoloBuy 查看款式和尺码',
    'Confirm your selected options and stock on the purchase page.': '请在购买页确认所选款式、尺码及库存。',
    'This option is listed as out of stock. Confirm on the purchase page.': '此规格显示缺货，请以购买页为准。',
    'Detail photos': '商品详情图', 'Seller listing photos from FindSpreadsheet.': '图片来自 FindSpreadsheet 的商品图集。',
    'Previous product image': '上一张商品图', 'Next product image': '下一张商品图',
    'Warehouse QC photos for Weidian item ZZ1ZZ.': '微店商品 ZZ1ZZ 的仓库质检照片。',
    'Back to the spreadsheet': '返回商品表', 'Hoodies & Sweaters': '连帽衫和毛衣',
  });
  return translated;
}
