import {normalizeOptions, safeImage} from './source-options.js';

(() => {
 const root=document.querySelector('#product'); if(!root)return;
 const translations={
 da:{buy:'Køb på OopBuy ↗',how:'Sådan køber du',share:'Del',id:'Produkt-id',price:'Pris ved eksport',qc:'QC-fotos',qcEmpty:'Der er ingen QC-fotos i kataloget. Tjek OopBuy, når varen ankommer til lageret.',gallery:'Weidian-produktfotos',galleryEmpty:'Ingen flere Weidian-fotos er tilgængelige.',missing:'Produktet er ikke tilgængeligt.',note:'Katalog eksporteret 10. november 2026. Bekræft pris og lager hos OopBuy.',copied:'Link kopieret',failed:'Linket kunne ikke kopieres.',image:'Produktfoto'},
 no:{buy:'Kjøp på OopBuy ↗',how:'Slik kjøper du',share:'Del',id:'Produkt-ID',price:'Pris ved eksport',qc:'QC-bilder',qcEmpty:'Ingen QC-bilder finnes i katalogen. Sjekk OopBuy når varen har kommet til lageret.',gallery:'Weidian-produktbilder',galleryEmpty:'Ingen flere Weidian-bilder er tilgjengelige.',missing:'Produktet er ikke tilgjengelig.',note:'Katalog eksportert 10. november 2026. Bekreft pris og lager hos OopBuy.',copied:'Lenken er kopiert',failed:'Kunne ikke kopiere lenken.',image:'Produktbilde'},
 ro:{buy:'Cumpără pe OopBuy ↗',how:'Cum cumperi',share:'Distribuie',id:'ID produs',price:'Preț la export',qc:'Fotografii QC',qcEmpty:'Nu există fotografii QC în catalog. Verifică OopBuy după sosirea produsului în depozit.',gallery:'Fotografii Weidian',galleryEmpty:'Nu există alte fotografii Weidian disponibile.',missing:'Produsul nu este disponibil.',note:'Catalog exportat la 10 noiembrie 2026. Confirmă prețul și disponibilitatea pe OopBuy.',copied:'Link copiat',failed:'Linkul nu a putut fi copiat.',image:'Fotografie produs'},
 fi:{buy:'Osta OopBuyssa ↗',how:'Osto-ohjeet',share:'Jaa',id:'Tuotetunnus',price:'Hinta vientihetkellä',qc:'Laaduntarkistuskuvat',qcEmpty:'Luettelossa ei ole tämän tuotteen QC-kuvia. Tarkista OopBuy, kun tuote on saapunut varastoon.',gallery:'Weidian-tuotekuvat',galleryEmpty:'Tälle tuotteelle ei ole muita Weidian-kuvia.',missing:'Tuote ei ole saatavilla.',note:'Luettelo viety 10. marraskuuta 2026. Tarkista nykyinen hinta ja saatavuus OopBuyssa.',copied:'Linkki kopioitu',failed:'Linkkiä ei voitu kopioida.',image:'Tuotekuva'},
 en:{buy:'Buy on OopBuy ↗',how:'How to buy',share:'Share',id:'Product ID',price:'Price at export',qc:'QC photos',qcEmpty:'No QC photos are available in this catalog. Check OopBuy after the item reaches its warehouse.',gallery:'Weidian product photos',galleryEmpty:'No additional Weidian photos are available for this item.',missing:'This product is not available.',note:'Catalog exported 10 November 2026. Confirm current price and availability on OopBuy.',copied:'Link copied',failed:'Unable to copy the link.',image:'Product photo'},
 zh:{buy:'前往 OopBuy 购买 ↗',how:'购买指南',share:'分享',id:'商品编号',price:'导出时价格',qc:'QC 质检照片',qcEmpty:'此商品目录暂无 QC 照片。商品入库后可在 OopBuy 查看。',gallery:'微店商品图片',galleryEmpty:'此商品暂无更多微店图片。',missing:'此商品暂不可用。',note:'商品目录导出于 2026 年 11 月 10 日，请在 OopBuy 确认最新价格及库存。',copied:'链接已复制',failed:'无法复制链接。',image:'商品图片'},
 de:{buy:'Bei OopBuy kaufen ↗',how:'Kaufanleitung',share:'Teilen',id:'Produktnummer',price:'Preis beim Export',qc:'QC-Fotos',qcEmpty:'Für diesen Artikel sind keine QC-Fotos im Katalog verfügbar. Nach Wareneingang bei OopBuy prüfen.',gallery:'Weidian-Produktbilder',galleryEmpty:'Keine weiteren Weidian-Bilder verfügbar.',missing:'Dieses Produkt ist nicht verfügbar.',note:'Katalog vom 10. November 2026. Aktuellen Preis und Verfügbarkeit bei OopBuy prüfen.',copied:'Link kopiert',failed:'Link konnte nicht kopiert werden.',image:'Produktbild'},
 fr:{buy:'Acheter sur OopBuy ↗',how:'Guide d’achat',share:'Partager',id:'Référence',price:'Prix à l’export',qc:'Photos QC',qcEmpty:'Aucune photo QC dans ce catalogue. Vérifiez sur OopBuy après réception en entrepôt.',gallery:'Photos du produit Weidian',galleryEmpty:'Aucune autre photo Weidian disponible.',missing:'Ce produit est indisponible.',note:'Catalogue exporté le 10 novembre 2026. Vérifiez le prix et la disponibilité sur OopBuy.',copied:'Lien copié',failed:'Impossible de copier le lien.',image:'Photo du produit'},
 es:{buy:'Comprar en OopBuy ↗',how:'Cómo comprar',share:'Compartir',id:'ID del producto',price:'Precio al exportar',qc:'Fotos QC',qcEmpty:'No hay fotos QC en este catálogo. Consúltalas en OopBuy cuando el artículo llegue al almacén.',gallery:'Fotos del producto de Weidian',galleryEmpty:'No hay más fotos de Weidian disponibles.',missing:'Este producto no está disponible.',note:'Catálogo exportado el 10 de noviembre de 2026. Confirma el precio y la disponibilidad en OopBuy.',copied:'Enlace copiado',failed:'No se pudo copiar el enlace.',image:'Foto del producto'},
 it:{buy:'Acquista su OopBuy ↗',how:'Come acquistare',share:'Condividi',id:'ID prodotto',price:'Prezzo all’esportazione',qc:'Foto QC',qcEmpty:'Nessuna foto QC nel catalogo. Controlla su OopBuy dopo l’arrivo in magazzino.',gallery:'Foto prodotto Weidian',galleryEmpty:'Nessun’altra foto Weidian disponibile.',missing:'Prodotto non disponibile.',note:'Catalogo esportato il 10 novembre 2026. Verifica prezzo e disponibilità su OopBuy.',copied:'Link copiato',failed:'Impossibile copiare il link.',image:'Foto prodotto'},
 pt:{buy:'Comprar no OopBuy ↗',how:'Como comprar',share:'Compartilhar',id:'ID do produto',price:'Preço na exportação',qc:'Fotos QC',qcEmpty:'Não há fotos QC neste catálogo. Consulte o OopBuy após a chegada ao armazém.',gallery:'Fotos do produto Weidian',galleryEmpty:'Não há outras fotos Weidian disponíveis.',missing:'Produto indisponível.',note:'Catálogo exportado em 10 de novembro de 2026. Confirme preço e disponibilidade no OopBuy.',copied:'Link copiado',failed:'Não foi possível copiar o link.',image:'Foto do produto'},
 nl:{buy:'Kopen op OopBuy ↗',how:'Hoe te kopen',share:'Delen',id:'Productnummer',price:'Prijs bij export',qc:'QC-foto’s',qcEmpty:'Geen QC-foto’s beschikbaar in deze catalogus. Bekijk OopBuy na aankomst in het magazijn.',gallery:'Weidian-productfoto’s',galleryEmpty:'Geen extra Weidian-foto’s beschikbaar.',missing:'Dit product is niet beschikbaar.',note:'Catalogus geëxporteerd op 10 november 2026. Controleer prijs en voorraad op OopBuy.',copied:'Link gekopieerd',failed:'Link kopiëren is mislukt.',image:'Productfoto'},
 pl:{buy:'Kup w OopBuy ↗',how:'Jak kupować',share:'Udostępnij',id:'ID produktu',price:'Cena z eksportu',qc:'Zdjęcia QC',qcEmpty:'Brak zdjęć QC w katalogu. Sprawdź OopBuy po dostarczeniu produktu do magazynu.',gallery:'Zdjęcia produktu Weidian',galleryEmpty:'Brak dodatkowych zdjęć Weidian.',missing:'Produkt niedostępny.',note:'Katalog wyeksportowano 10 listopada 2026 r. Sprawdź aktualną cenę i dostępność w OopBuy.',copied:'Link skopiowany',failed:'Nie można skopiować linku.',image:'Zdjęcie produktu'},
 sv:{buy:'Köp på OopBuy ↗',how:'Så handlar du',share:'Dela',id:'Produkt-ID',price:'Pris vid export',qc:'QC-bilder',qcEmpty:'Inga QC-bilder finns i katalogen. Kontrollera OopBuy när varan anlänt till lagret.',gallery:'Weidian-produktbilder',galleryEmpty:'Inga fler Weidian-bilder finns tillgängliga.',missing:'Produkten är inte tillgänglig.',note:'Katalog exporterad 10 november 2026. Kontrollera aktuellt pris och lager hos OopBuy.',copied:'Länken kopierad',failed:'Länken kunde inte kopieras.',image:'Produktbild'}
 };
 const buttonLabels={en:['Other shopping agents','Copy Weidian link'],zh:['其他代购平台','复制微店链接'],de:['Andere Einkaufsagenten','Weidian-Link kopieren'],fr:['Autres agents d’achat','Copier le lien Weidian'],es:['Otros agentes de compra','Copiar enlace de Weidian'],it:['Altri agenti di acquisto','Copia link Weidian'],pt:['Outros agentes de compras','Copiar link Weidian'],nl:['Andere inkoopagenten','Weidian-link kopiëren'],pl:['Inni agenci zakupowi','Kopiuj link Weidian'],sv:['Andra inköpsagenter','Kopiera Weidian-länk'],fi:['Muut ostovälittäjät','Kopioi Weidian-linkki'],da:['Andre indkøbsagenter','Kopiér Weidian-link'],no:['Andre kjøpsagenter','Kopier Weidian-lenke'],ro:['Alți agenți de cumpărături','Copiază linkul Weidian']};
 const additionalProductKeys=['buy','how','share','id','price','qc','qcEmpty','gallery','galleryEmpty','missing','note','copied','failed','image'];
 const additionalProductRows={
 cs:['Koupit na OopBuy ↗','Jak nakupovat','Sdílet','ID produktu','Cena při exportu','QC fotografie','V katalogu nejsou QC fotografie. Po doručení do skladu je zkontrolujte na OopBuy.','Fotografie produktu Weidian','Další fotografie Weidian nejsou k dispozici.','Produkt není dostupný.','Katalog exportován 10. listopadu 2026. Aktuální cenu a dostupnost ověřte na OopBuy.','Odkaz zkopírován','Odkaz se nepodařilo zkopírovat.','Fotografie produktu'],
 hu:['Vásárlás az OopBuy oldalon ↗','Vásárlási útmutató','Megosztás','Termékazonosító','Ár az exportáláskor','QC-fotók','A katalógusban nincs QC-fotó. A raktárba érkezés után ellenőrizd az OopBuy oldalon.','Weidian termékfotók','Nincs további Weidian-fotó.','A termék nem érhető el.','A katalógus 2026. november 10-én készült. Ellenőrizd az aktuális árat és készletet az OopBuy oldalon.','Link másolva','A link másolása sikertelen.','Termékfotó'],
 el:['Αγορά στο OopBuy ↗','Πώς να αγοράσετε','Κοινοποίηση','Κωδικός προϊόντος','Τιμή κατά την εξαγωγή','Φωτογραφίες QC','Δεν υπάρχουν φωτογραφίες QC στον κατάλογο. Ελέγξτε το OopBuy μετά την άφιξη στην αποθήκη.','Φωτογραφίες προϊόντος Weidian','Δεν υπάρχουν άλλες φωτογραφίες Weidian.','Το προϊόν δεν είναι διαθέσιμο.','Ο κατάλογος εξήχθη στις 10 Νοεμβρίου 2026. Ελέγξτε την τρέχουσα τιμή και διαθεσιμότητα στο OopBuy.','Ο σύνδεσμος αντιγράφηκε','Δεν ήταν δυνατή η αντιγραφή του συνδέσμου.','Φωτογραφία προϊόντος'],
 tr:['OopBuy’dan satın al ↗','Nasıl satın alınır','Paylaş','Ürün kimliği','Dışa aktarma fiyatı','QC fotoğrafları','Katalogda QC fotoğrafı yok. Ürün depoya ulaştıktan sonra OopBuy’ı kontrol edin.','Weidian ürün fotoğrafları','Başka Weidian fotoğrafı yok.','Bu ürün mevcut değil.','Katalog 10 Kasım 2026 tarihinde dışa aktarıldı. Güncel fiyat ve stok durumunu OopBuy’da doğrulayın.','Bağlantı kopyalandı','Bağlantı kopyalanamadı.','Ürün fotoğrafı'],
 uk:['Купити на OopBuy ↗','Як купувати','Поділитися','ID товару','Ціна на час експорту','Фото QC','У каталозі немає фото QC. Перевірте OopBuy після надходження товару на склад.','Фото товару Weidian','Додаткових фото Weidian немає.','Товар недоступний.','Каталог експортовано 10 листопада 2026 року. Перевірте актуальну ціну та наявність на OopBuy.','Посилання скопійовано','Не вдалося скопіювати посилання.','Фото товару'],
 ru:['Купить на OopBuy ↗','Как купить','Поделиться','ID товара','Цена на момент экспорта','Фото QC','В каталоге нет фото QC. Проверьте OopBuy после поступления товара на склад.','Фото товара Weidian','Дополнительных фото Weidian нет.','Товар недоступен.','Каталог экспортирован 10 ноября 2026 года. Проверьте актуальную цену и наличие на OopBuy.','Ссылка скопирована','Не удалось скопировать ссылку.','Фото товара'],
 ja:['OopBuyで購入 ↗','購入方法','共有','商品ID','書き出し時の価格','QC写真','このカタログにQC写真はありません。商品が倉庫に到着後、OopBuyで確認してください。','Weidianの商品写真','追加のWeidian写真はありません。','この商品は利用できません。','カタログは2026年11月10日に書き出されたものです。最新の価格と在庫はOopBuyで確認してください。','リンクをコピーしました','リンクをコピーできませんでした。','商品写真'],
 ko:['OopBuy에서 구매 ↗','구매 방법','공유','상품 ID','내보내기 당시 가격','QC 사진','카탈로그에 QC 사진이 없습니다. 상품이 창고에 도착한 후 OopBuy에서 확인하세요.','Weidian 상품 사진','추가 Weidian 사진이 없습니다.','상품을 이용할 수 없습니다.','카탈로그는 2026년 11월 10일에 내보냈습니다. 현재 가격과 재고는 OopBuy에서 확인하세요.','링크를 복사했습니다','링크를 복사할 수 없습니다.','상품 사진'],
 ar:['الشراء من OopBuy ↗','طريقة الشراء','مشاركة','معرّف المنتج','السعر عند التصدير','صور فحص الجودة','لا توجد صور فحص جودة في الكتالوج. تحقق من OopBuy بعد وصول المنتج إلى المستودع.','صور منتج Weidian','لا توجد صور Weidian إضافية.','هذا المنتج غير متاح.','تم تصدير الكتالوج في 10 نوفمبر 2026. تحقق من السعر والتوفر الحاليين في OopBuy.','تم نسخ الرابط','تعذر نسخ الرابط.','صورة المنتج'],
 id:['Beli di OopBuy ↗','Cara membeli','Bagikan','ID produk','Harga saat ekspor','Foto QC','Tidak ada foto QC dalam katalog. Periksa OopBuy setelah barang tiba di gudang.','Foto produk Weidian','Tidak ada foto Weidian tambahan.','Produk tidak tersedia.','Katalog diekspor pada 10 November 2026. Pastikan harga dan ketersediaan terkini di OopBuy.','Tautan disalin','Tautan tidak dapat disalin.','Foto produk']
 };
 for(const [code,values] of Object.entries(additionalProductRows)) translations[code]=Object.fromEntries(additionalProductKeys.map((key,i)=>[key,values[i]]));
 Object.assign(buttonLabels,{cs:['Další nákupní agenti','Kopírovat odkaz Weidian'],hu:['Más vásárlási ügynökök','Weidian-link másolása'],el:['Άλλοι πράκτορες αγορών','Αντιγραφή συνδέσμου Weidian'],tr:['Diğer alışveriş aracıları','Weidian bağlantısını kopyala'],uk:['Інші посередники','Копіювати посилання Weidian'],ru:['Другие посредники','Копировать ссылку Weidian'],ja:['その他の購入代行','Weidianリンクをコピー'],ko:['다른 구매대행','Weidian 링크 복사'],ar:['وكلاء شراء آخرون','نسخ رابط Weidian'],id:['Agen belanja lain','Salin tautan Weidian']});
 // Platform templates checked against two FindSpreadsheet product pages on 2026-11-12.
 const platformLinks=[["Joyagoo","https://joyagoo.com/product?id={id}&platform=WEIDIAN&productUrl=&productPwd="],["Oopbuy","https://oopbuy.com/product/weidian/{id}?inviteCode=U68CWQBN5"],["Litbuy","https://litbuy.com/product/weidian/{id}"],["Lovegobuy","https://www.lovegobuy.com/product?id={id}&shop_type=weidian&invite_code=161CPG"],["Hipobuy","https://hipobuy.com/product/weidian/{id}"],["Sugargoo","https://www.sugargoo.com/#/home/productDetail?productLink=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D{id}&memberId=1771881989097259278"],["Kakobuy","https://kakobuy.com/item/details?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D{id}"],["Superbuy","https://www.superbuy.com/en/page/buy/?nTag=Home-search&from=search-input&url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D{id}&partnercode=ES7pVI"],["Loongbuy","https://loongbuy.com/product-details?url=https://weidian.com/item.html?itemID={id}"],["USFans","https://usfans.com/product/3/{id}"],["Mulebuy","https://mulebuy.com/zh/product/?shop_type=weidian&id={id}&ref=200232406"],["Hoobuy","https://hoobuy.com/product/2/{id}?utm_source=share&utm_medium=product_details&inviteCode=vXpLpmrX"],["Ootdbuy","https://www.ootdbuy.com/goods/details?id={id}&channel=weidian&inviteCode=179LQ1SVA"],["Orientdig","https://orientdig.com/product/?shop_type=weidian&id={id}&ref=100114240"],["Eastmallbuy","https://eastmallbuy.com/index/weidian/itemID={id}&inviter=lianglook520"],["Ponybuy","https://www.ponybuy.com/en-gb/goods?tracking=e6cd1dcf21&product_id={id}&platform=weidian"],["Pikobuy","https://www.pikobuy.com/product/detail?productUrl=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D{id}"],["Lolobuy","https://www.lolobuy.com/productDetail/1783404849631986?url=https://weidian.com/item.html?itemID={id}"],["Panglobalbuy","https://panglobalbuy.com/#/details?type=3&offerId={id}&share_id=14918"]];
 const lang=()=>window.oopLanguage?.()||'en';let item=null, failed=false, seller=null, sellerFailed=false;
 const productId = new URLSearchParams(location.search).get('id') || '';
 let activePhoto='', selectedOptions=[];
 const styleLabels={en:['Product photos','Photos are for reference; select options on the purchase page.'],zh:['款式图片','图片仅供参考，请在购买页面选择具体款式。'],de:['Produktbilder','Bilder dienen zur Orientierung; Varianten auf der Kaufseite wählen.'],fr:['Photos du produit','Photos indicatives ; choisissez les options sur la page d’achat.'],es:['Imágenes del producto','Imágenes de referencia; elige las opciones en la página de compra.'],it:['Foto del prodotto','Immagini indicative; scegli le opzioni nella pagina di acquisto.'],pt:['Fotos do produto','Imagens de referência; escolha as opções na página de compra.'],nl:['Productfoto’s','Afbeeldingen ter referentie; kies opties op de aankooppagina.'],pl:['Zdjęcia produktu','Zdjęcia poglądowe; wybierz wariant na stronie zakupu.'],sv:['Produktbilder','Bilderna är vägledande; välj alternativ på köpsidan.'],fi:['Tuotekuvat','Kuvat ovat viitteellisiä; valitse vaihtoehdot ostosivulla.'],da:['Produktbilleder','Billederne er vejledende; vælg varianter på købssiden.'],no:['Produktbilder','Bildene er veiledende; velg varianter på kjøpssiden.'],ro:['Fotografii produs','Fotografiile sunt orientative; selectează opțiunile pe pagina de cumpărare.'],cs:['Fotografie produktu','Fotografie jsou orientační; variantu vyberte na stránce nákupu.'],hu:['Termékfotók','A képek tájékoztató jellegűek; a változatot a vásárlási oldalon válaszd ki.'],el:['Φωτογραφίες προϊόντος','Οι εικόνες είναι ενδεικτικές· επιλέξτε παραλλαγές στη σελίδα αγοράς.'],tr:['Ürün fotoğrafları','Görseller referans içindir; seçenekleri satın alma sayfasında seçin.'],uk:['Фото товару','Фото довідкові; виберіть варіант на сторінці покупки.'],ru:['Фото товара','Фото для ознакомления; выберите вариант на странице покупки.'],ja:['商品画像','画像は参考です。種類は購入ページで選択してください。'],ko:['상품 이미지','이미지는 참고용이며 옵션은 구매 페이지에서 선택하세요.'],ar:['صور المنتج','الصور للعرض؛ اختر الخيارات في صفحة الشراء.'],id:['Foto produk','Foto hanya referensi; pilih opsi di halaman pembelian.']};
 const noCarousel={en:'No Weidian or QC photos are available for this item.',zh:'此商品暂无可用的微店图或 QC 图。',de:'Für diesen Artikel sind keine Weidian- oder QC-Fotos verfügbar.',fr:'Aucune photo Weidian ou QC disponible pour cet article.',es:'No hay fotos de Weidian ni de QC disponibles para este producto.',it:'Non sono disponibili foto Weidian o QC per questo prodotto.',pt:'Não há fotos Weidian ou QC disponíveis para este produto.',nl:'Voor dit product zijn geen Weidian- of QC-foto’s beschikbaar.',pl:'Brak zdjęć Weidian lub QC dla tego produktu.',sv:'Det finns inga Weidian- eller QC-bilder för denna produkt.',fi:'Tuotteelle ei ole saatavilla Weidian- tai QC-kuvia.',da:'Der er ingen Weidian- eller QC-billeder til dette produkt.',no:'Det finnes ingen Weidian- eller QC-bilder for dette produktet.',ro:'Nu există fotografii Weidian sau QC pentru acest produs.',cs:'Pro tento produkt nejsou dostupné fotografie Weidian ani QC.',hu:'Ehhez a termékhez nem áll rendelkezésre Weidian- vagy QC-fotó.',el:'Δεν υπάρχουν διαθέσιμες φωτογραφίες Weidian ή QC για αυτό το προϊόν.',tr:'Bu ürün için Weidian veya QC fotoğrafı bulunmuyor.',uk:'Для цього товару немає фото Weidian або QC.',ru:'Для этого товара нет фотографий Weidian или QC.',ja:'この商品には利用可能なWeidian画像またはQC写真がありません。',ko:'이 상품에 사용할 수 있는 Weidian 또는 QC 사진이 없습니다.',ar:'لا توجد صور Weidian أو صور فحص جودة متاحة لهذا المنتج.',id:'Tidak ada foto Weidian atau QC untuk produk ini.'};
 const sourceLabels={da:'FindSpreadsheet-produktgalleri',no:'FindSpreadsheet-produktgalleri',ro:'Galeria de produse FindSpreadsheet',fi:'FindSpreadsheetin tuotegalleria',en:'FindSpreadsheet product gallery',zh:'主站商品图片集',de:'FindSpreadsheet-Produktbilder',fr:'Photos du catalogue FindSpreadsheet',es:'Galería de FindSpreadsheet',it:'Galleria prodotti FindSpreadsheet',pt:'Galeria de produtos FindSpreadsheet',nl:'FindSpreadsheet-productgalerij',pl:'Galeria produktów FindSpreadsheet',sv:'FindSpreadsheet-produktbilder'};
 Object.assign(sourceLabels,{cs:'Galerie produktů FindSpreadsheet',hu:'FindSpreadsheet termékgaléria',el:'Συλλογή προϊόντων FindSpreadsheet',tr:'FindSpreadsheet ürün galerisi',uk:'Галерея товару FindSpreadsheet',ru:'Галерея товара FindSpreadsheet',ja:'FindSpreadsheetの商品ギャラリー',ko:'FindSpreadsheet 상품 갤러리',ar:'معرض منتجات FindSpreadsheet',id:'Galeri produk FindSpreadsheet'});
 const make = (tag, className, value) => {
   const node = document.createElement(tag);
   if (className) node.className = className;
   if (value != null) node.textContent = value;
   return node;
 };
 function safe(url) {
   if (!url || typeof url !== 'string') return '';
   try {
     const parsed = new URL(url, 'https://findspreadsheet.com');
     return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? parsed.href : '';
   } catch { return ''; }
 }
 const sources = urls => [...new Set(urls.map(safe).filter(Boolean))];
 function picture(url, alt, loading = 'lazy') {
   const image = make('img');
   image.alt = alt;
   image.loading = loading;
   image.decoding = 'async';
   image.src = url;
   return image;
 }
 function menu(id, label, wasOpen) {
   const agents = make('details', 'platform-menu');
   agents.open = wasOpen;
   const summary = make('summary', 'product-secondary choice-trigger', label);
   const grid = make('div', 'choice-grid choice-popover platform-menu-grid');
   for (const [name, template] of platformLinks) {
     if (name === 'Oopbuy') continue;
     const link = make('a', 'platform-menu-link', name);
     link.prepend(picture('/agents/' + name.toLowerCase() + '.webp', ''));
     link.href = template.replaceAll('{id}', id);
     link.target = '_blank';
     link.rel = 'nofollow sponsored noopener noreferrer';
     grid.append(link);
   }
   agents.addEventListener('keydown', event => {
     if (event.key === 'Escape' && agents.open) {
       agents.open = false;
       summary.focus();
     }
   });
   agents.append(summary, grid);
   return agents;
 }
 function renderOptions(info, setPhoto, chooseFallbackPhoto, labels) {
   if (!seller?.groups.length) {
     if (!seller && !sellerFailed) return;
     const referenceImages = sources(seller?.images || (item.weidianImages || []).map(safeImage));
     if (referenceImages.length < 2) return;
     const section = make('section', 'style-photos');
     section.append(make('h2', 'style-photos-title', labels[0]));
     const grid = make('div', 'style-photos-grid');
     for (const [index, url] of referenceImages.entries()) {
       const button = make('button', 'style-photo');
       button.type = 'button';
       button.setAttribute('aria-label', labels[0] + ' ' + (index + 1));
       button.append(picture(url, ''));
       button.addEventListener('click', () => setPhoto(url));
       grid.append(button);
     }
     section.append(grid, make('p', 'style-photos-note', labels[1]));
     info.append(section);
     return;
   }

   const section = make('section', 'seller-options');
   const controls = [];
   seller.groups.forEach((group, index) => {
     const name = make('h2', 'style-photos-title', group.name);
     const selected = make('span', 'selected-option');
     name.append(selected);
     const grid = make('div', group.options.some(option => option.image) ? 'style-photos-grid' : 'sizes-grid');
     grid.setAttribute('role', 'group');
     grid.setAttribute('aria-label', group.name);
     const buttons = group.options.map(option => {
       const button = make('button', option.image ? 'style-photo' : 'size-option');
       button.type = 'button';
       button.title = option.label;
       button.setAttribute('aria-label', option.label);
       if (option.image) button.append(picture(option.image, ''));
       else button.textContent = option.label;
       button.addEventListener('click', () => {
         selectedOptions[index] = option.id;
         update();
         const sku = seller.skus.find(entry => entry.ids.every((id, i) => selectedOptions[i] === id));
         const image = sku?.image || option.image;
         if (image) setPhoto(image);
         else chooseFallbackPhoto();
       });
       grid.append(button);
       return [button, option];
     });
     controls.push({buttons, selected});
     section.append(name, grid);
   });
   function update() {
     controls.forEach(({buttons, selected}, index) => {
       for (const [button, option] of buttons) {
         const active = option.id === selectedOptions[index];
         button.setAttribute('aria-pressed', String(active));
         if (active) selected.textContent = ' · ' + option.label;
       }
     });
   }
   update();
   section.append(make('p', 'style-photos-note', labels[1]));
   info.append(section);
 }
 function renderDetails(qcPhotos, detailPhotos, language, t) {
   const section = make('section', 'product-qc');
   const heading = make('h2', 'product-section-title');
   section.append(heading);
   function fill(urls, label, onEmpty) {
     heading.textContent = label;
     const grid = make('div', 'product-photo-grid');
     let remaining = urls.length;
     for (const [index, url] of urls.entries()) {
       const caption = label + ' ' + (index + 1);
       const link = make('a');
       link.href = url;
       link.target = '_blank';
       link.rel = 'noopener noreferrer';
       const image = picture(url, caption);
       image.addEventListener('error', () => {
         link.remove();
         if (--remaining === 0) {
           grid.remove();
           onEmpty();
         }
       }, {once: true});
       link.append(image);
       grid.append(link);
     }
     if (remaining) section.append(grid);
     else onEmpty();
   }
   const empty = () => section.append(make('p', 'product-empty', t.galleryEmpty));
   const fallback = () => fill(detailPhotos, sourceLabels[language] || sourceLabels.en, empty);
   if (qcPhotos.length) fill(qcPhotos, t.qc, fallback);
   else fallback();
   return section;
 }
 function updatePrice() {
   const price = root.querySelector('.product-price-usd');
   if (!price || !item) return;
   const value = Number(item.priceUsd);
   price.textContent = item.priceUsd != null && item.priceUsd !== '' && Number.isFinite(value)
     ? (window.oopFormatPrice?.(value) || '≈ $' + value.toFixed(2) + ' USD')
     : '—';
 }
 function render() {
   if (!item && !failed) return;
   const language = lang();
   const t = translations[language] || translations.en;
   const menuOpen = !!root.querySelector('.platform-menu')?.open;
   root.replaceChildren();
   if (!item) {
     root.append(make('p', 'data-note', t.missing));
     return;
   }

   const title = window.oopProductTitle?.(item, language) || item.name;
   const sellerPhotos = sources([...(seller?.images || []), ...(item.weidianImages || []).map(safeImage)]);
   const qcPhotos = sources(item.qcImages || []);
   const catalogPhotos = sources([item.image, ...(item.sourceImages || [])]);
   const gallery = sources([...sellerPhotos, ...catalogPhotos, ...qcPhotos]);
   const layout = make('div', 'product-layout');
   const left = make('div', 'product-gallery-wrap');
   const stage = make('div', 'product-gallery');
   const thumbs = make('div', 'thumbnails');
   const mainImage = gallery.length ? picture(activePhoto || gallery[0], title, 'eager') : null;
   function setPhoto(url) {
     if (!mainImage || !url) return;
     activePhoto = url;
     if (mainImage.src !== url) mainImage.src = url;
     for (const button of thumbs.children) {
       button.setAttribute('aria-pressed', String(button.dataset.photo === url));
     }
   }
   if (mainImage) {
     const broken = new Set();
     mainImage.addEventListener('error', () => {
       broken.add(mainImage.src);
       const next = gallery.find(url => !broken.has(url));
       if (next) setPhoto(next);
       else stage.replaceChildren(make('p', 'product-empty', noCarousel[language] || noCarousel.en));
     });
     stage.append(mainImage);
     for (const [index, url] of gallery.entries()) {
       const button = make('button', 'thumbnail');
       button.type = 'button';
       button.dataset.photo = url;
       button.setAttribute('aria-label', t.image + ' ' + (index + 1));
       const image = picture(url, '');
       image.addEventListener('error', () => button.remove(), {once: true});
       button.append(image);
       button.addEventListener('click', () => setPhoto(url));
       thumbs.append(button);
     }
     for (const button of thumbs.children) {
       button.setAttribute('aria-pressed', String(button.dataset.photo === mainImage.src));
     }
   } else stage.append(make('p', 'product-empty', noCarousel[language] || noCarousel.en));
   left.append(stage, thumbs);

   const info = make('div', 'product-info');
   info.append(make('h1', '', title), make('p', 'product-meta', t.id + ': ' + item.weidianId),
     make('div', 'sku', t.price), make('div', 'product-price-usd'));
   const actions = make('div', 'product-actions');
   const id = encodeURIComponent(item.weidianId);
   const buy = make('a', 'btn product-buy', t.buy.replace(/\s*↗$/, ''));
   buy.href = 'https://oopbuy.com/product/weidian/' + id + '?inviteCode=U68CWQBN5';
   const labels = buttonLabels[language] || buttonLabels.en;
   const copy = make('button', 'product-secondary', labels[1]);
   copy.type = 'button';
   const feedback = make('span', 'product-copy-feedback');
   feedback.setAttribute('role', 'status');
   copy.addEventListener('click', async () => {
     const url = 'https://weidian.com/item.html?itemID=' + id;
     try {
       await navigator.clipboard.writeText(url);
       feedback.textContent = t.copied;
     } catch {
       feedback.textContent = t.failed + ' ' + url;
     }
   });
   actions.append(buy, menu(id, labels[0], menuOpen), copy, feedback);
   info.append(actions);
   renderOptions(info, setPhoto, () => setPhoto(gallery[0]), styleLabels[language] || styleLabels.en);
   info.append(make('p', 'product-disclaimer', t.note));
   layout.append(left, info);
   root.append(layout, renderDetails(qcPhotos, sources([...catalogPhotos.slice(1), ...sellerPhotos, ...catalogPhotos.slice(0, 1)]), language, t));
   updatePrice();
 }

 async function loadProduct() {
   try {
     if (!/^\d+$/.test(productId)) throw Error('Invalid product');
     const response = await fetch('/data/catalog.json');
     if (!response.ok) throw Error('Catalog unavailable');
     const {products} = await response.json();
     window.oopBuildTitleNameIndex?.(products);
     item = products.find(p => String(p.id) === productId && p.name && p.sourcePath && /^\d{5,20}$/.test(String(p.weidianId)));
     if (!item) throw Error('Product unavailable');
   } catch { failed = true; }
   render();
   if (!item) return;

   try {
     const endpoint = new URL('https://findspreadsheet.com/api/Goods/getSkuData');
     endpoint.searchParams.set('weidian_id', item.weidianId);
     const response = await fetch(endpoint, {credentials: 'omit', signal: AbortSignal.timeout(10000)});
     if (!response.ok) throw Error('Seller options unavailable');
     seller = normalizeOptions(await response.json(), item.weidianId);
     const sku = seller.skus.find(entry => entry.stock > 0) || seller.skus[0];
     selectedOptions = seller.groups.map((group, i) => {
       return group.options.some(option => option.id === sku?.ids[i]) ? sku.ids[i] : group.options[0].id;
     });
   } catch { sellerFailed = true; }
   render();
 }
 window.addEventListener('oop-language', render);
 window.addEventListener('oop-currency', updatePrice);
 document.addEventListener('click', event => {
   const open = root.querySelector('.platform-menu[open]');
   if (open && !open.contains(event.target)) open.open = false;
 });
 loadProduct();
})();
