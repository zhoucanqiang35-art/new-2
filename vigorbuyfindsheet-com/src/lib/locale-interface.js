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

const categoryKeys = ['shoes','hoodies-sweaters','t-shirts','jackets','pants-shorts','headwear','accessories','jersey','ShortSets','electronics','other-stuff'];
const categories = {
  'zh-Hans':'鞋履|卫衣和毛衣|T 恤|外套|长裤和短裤|帽饰|配饰|球衣|短裤套装|电子产品|其他商品',
  es:'Calzado|Sudaderas y suéteres|Camisetas|Chaquetas|Pantalones y shorts|Gorras y sombreros|Accesorios|Camisetas deportivas|Conjuntos cortos|Electrónica|Otros productos',
  fr:'Chaussures|Sweats et pulls|T-shirts|Vestes|Pantalons et shorts|Chapeaux et casquettes|Accessoires|Maillots|Ensembles courts|Électronique|Autres produits',
  de:'Schuhe|Hoodies und Pullover|T-Shirts|Jacken|Hosen und Shorts|Kopfbedeckungen|Accessoires|Trikots|Kurze Sets|Elektronik|Weitere Produkte',
  it:'Scarpe|Felpe e maglioni|Magliette|Giacche|Pantaloni e shorts|Cappelli|Accessori|Maglie sportive|Completi corti|Elettronica|Altri prodotti',
  'pt-BR':'Calçados|Moletons e suéteres|Camisetas|Jaquetas|Calças e shorts|Bonés e chapéus|Acessórios|Camisas esportivas|Conjuntos curtos|Eletrônicos|Outros produtos',
  ja:'靴|パーカーとセーター|Tシャツ|ジャケット|パンツとショーツ|帽子|アクセサリー|ユニフォーム|ショーツセット|家電|その他の商品',
  ko:'신발|후드와 스웨터|티셔츠|재킷|바지와 반바지|모자|액세서리|유니폼|반바지 세트|전자제품|기타 상품',
  nl:'Schoenen|Hoodies en truien|T-shirts|Jassen|Broeken en shorts|Hoeden en petten|Accessoires|Sportshirts|Korte sets|Elektronica|Overige artikelen',
  pl:'Buty|Bluzy i swetry|Koszulki|Kurtki|Spodnie i szorty|Nakrycia głowy|Akcesoria|Koszulki sportowe|Krótkie zestawy|Elektronika|Inne produkty',
  tr:'Ayakkabılar|Kapüşonlular ve kazaklar|Tişörtler|Ceketler|Pantolon ve şortlar|Şapkalar|Aksesuarlar|Formalar|Şort takımları|Elektronik|Diğer ürünler',
  id:'Sepatu|Hoodie dan sweter|Kaus|Jaket|Celana panjang dan pendek|Topi|Aksesori|Jersi|Setelan pendek|Elektronik|Produk lainnya',
  ms:'Kasut|Hoodie dan baju sejuk|Kemeja-T|Jaket|Seluar dan seluar pendek|Topi|Aksesori|Jersi|Set seluar pendek|Elektronik|Produk lain',
  th:'รองเท้า|ฮู้ดและเสื้อกันหนาว|เสื้อยืด|แจ็กเก็ต|กางเกงและกางเกงขาสั้น|หมวก|เครื่องประดับ|เสื้อกีฬา|ชุดกางเกงขาสั้น|อิเล็กทรอนิกส์|สินค้าอื่น ๆ',
  hi:'जूते|हुडी और स्वेटर|टी-शर्ट|जैकेट|पैंट और शॉर्ट्स|टोपियाँ|ऐक्सेसरीज़|जर्सी|शॉर्ट्स सेट|इलेक्ट्रॉनिक्स|अन्य उत्पाद',
  sv:'Skor|Huvtröjor och tröjor|T-shirts|Jackor|Byxor och shorts|Huvudbonader|Accessoarer|Matchtröjor|Shortsset|Elektronik|Övriga produkter',
  da:'Sko|Hættetrøjer og trøjer|T-shirts|Jakker|Bukser og shorts|Hovedbeklædning|Tilbehør|Sportstrøjer|Shortssæt|Elektronik|Andre produkter',
  nb:'Sko|Hettegensere og gensere|T-skjorter|Jakker|Bukser og shorts|Hodeplagg|Tilbehør|Drakter|Shortssett|Elektronikk|Andre produkter',
  cs:'Obuv|Mikiny a svetry|Trička|Bundy|Kalhoty a šortky|Pokrývky hlavy|Doplňky|Dresy|Krátké soupravy|Elektronika|Ostatní produkty',
  hu:'Cipők|Kapucnis felsők és pulóverek|Pólók|Dzsekik|Nadrágok és rövidnadrágok|Fejfedők|Kiegészítők|Mezek|Rövid szettek|Elektronika|Egyéb termékek',
  ro:'Încălțăminte|Hanorace și pulovere|Tricouri|Jachete|Pantaloni și pantaloni scurți|Șepci și pălării|Accesorii|Tricouri sportive|Seturi scurte|Electronice|Alte produse',
};
categories.en = 'Shoes|Hoodies & Sweaters|T-Shirts|Jackets|Pants & Shorts|Headwear|Accessories|Jerseys|Short Sets|Electronics|Other Finds';
export function categoryLabel(language,key) {
  return categories[language]?.split('|')[categoryKeys.indexOf(key.slice(4))];
}
