const controls = {
  'zh-Hans': ['上传图片', '复制商品链接', '已复制', '拖放图片到这里'],
  'zh-Hant': ['上傳圖片', '複製商品連結', '已複製', '將圖片拖曳到這裡'],
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
const labels = ['Upload image', 'Copy product link', 'Link copied', 'Drop an image here'];

export function newLabels(code) {
  const translated = Object.fromEntries((controls[code] ?? []).map((label, index) => [labels[index], label]));
  if (code === 'zh-Hans') Object.assign(translated, {
    'LoloBuy Image Search': 'LoloBuy 图片搜索', 'LoloBuy Findslist home': 'LoloBuy Findslist 首页',
    'Back to the spreadsheet': '返回商品表', 'Hoodies & Sweaters': '连帽衫和毛衣',
  });
  if (code === 'zh-Hant') Object.assign(translated, {
    'LoloBuy Image Search': 'LoloBuy 圖片搜尋', 'LoloBuy Findslist home': 'LoloBuy Findslist 首頁',
    'Back to the spreadsheet': '返回商品表', 'Hoodies & Sweaters': '連帽衫和毛衣',
  });
  return translated;
}
