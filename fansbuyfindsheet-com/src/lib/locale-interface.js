const labels = {
  en:'Color|Listing photos|Upload or drop a product photo to find similar listings.|Try sneakers, hoodies, jerseys, or a Weidian ID',
  'zh-Hans':'颜色|商品图片|上传或拖入商品图片，查找相似商品。|试搜球鞋、连帽衫、球衣或微店商品编号',
  es:'Color|Fotos del producto|Sube o arrastra una foto para encontrar productos similares.|Busca un producto o un ID de Weidian',
  fr:'Couleur|Photos du produit|Importez ou glissez une photo pour trouver des articles similaires.|Rechercher un produit ou un identifiant Weidian',
  de:'Farbe|Produktbilder|Lade ein Produktfoto hoch oder ziehe es hierher, um ähnliche Artikel zu finden.|Produktname oder Weidian-ID suchen',
  it:'Colore|Foto del prodotto|Carica o trascina una foto per trovare prodotti simili.|Cerca un prodotto o un ID Weidian',
  'pt-BR':'Cor|Fotos do produto|Envie ou arraste uma foto para encontrar produtos parecidos.|Busque um produto ou ID da Weidian',
  ja:'カラー|商品写真|商品画像をアップロードまたはドラッグして、類似商品を探せます。|商品名またはWeidianの商品IDを検索',
  ko:'색상|상품 사진|상품 사진을 올리거나 끌어다 놓아 비슷한 상품을 찾아보세요.|상품명 또는 Weidian 상품 ID 검색',
  nl:'Kleur|Productfoto’s|Upload of sleep een productfoto om vergelijkbare artikelen te vinden.|Zoek op productnaam of Weidian-ID',
  pl:'Kolor|Zdjęcia produktu|Prześlij lub przeciągnij zdjęcie, aby znaleźć podobne produkty.|Szukaj nazwy produktu lub ID Weidian',
  tr:'Renk|Ürün fotoğrafları|Benzer ürünleri bulmak için bir fotoğraf yükleyin veya sürükleyin.|Ürün adı veya Weidian kimliği ara',
  id:'Warna|Foto produk|Unggah atau seret foto produk untuk menemukan barang serupa.|Cari nama produk atau ID Weidian',
  ms:'Warna|Foto produk|Muat naik atau seret foto produk untuk mencari barangan serupa.|Cari nama produk atau ID Weidian',
  th:'สี|ภาพสินค้า|อัปโหลดหรือลากภาพสินค้าเพื่อค้นหาสินค้าที่คล้ายกัน|ค้นหาชื่อสินค้าหรือรหัส Weidian',
  hi:'रंग|उत्पाद की तस्वीरें|मिलते-जुलते उत्पाद ढूँढने के लिए तस्वीर अपलोड करें या खींचकर छोड़ें।|उत्पाद का नाम या Weidian आईडी खोजें',
  sv:'Färg|Produktbilder|Ladda upp eller dra in en bild för att hitta liknande produkter.|Sök på produktnamn eller Weidian-ID',
  da:'Farve|Produktbilleder|Upload eller træk et billede ind for at finde lignende produkter.|Søg efter produktnavn eller Weidian-id',
  nb:'Farge|Produktbilder|Last opp eller dra inn et bilde for å finne lignende produkter.|Søk etter produktnavn eller Weidian-ID',
  cs:'Barva|Fotografie produktu|Nahrajte nebo přetáhněte fotografii a najděte podobné produkty.|Hledejte název produktu nebo ID Weidian',
  hu:'Szín|Termékfotók|Hasonló termékek kereséséhez tölts fel vagy húzz ide egy fotót.|Keresés terméknév vagy Weidian-azonosító alapján',
  ro:'Culoare|Fotografii ale produsului|Încarcă sau trage o fotografie pentru a găsi produse similare.|Caută un produs sau un ID Weidian'
};
const keys = ['color','listing','imageSummary','searchHint'];
export function interfaceLabel(language,key) {
  return labels[language]?.split('|')[keys.indexOf(key)];
}
