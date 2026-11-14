// Initial interface translations. Product titles and full page copy are pending.
(()=>{
const keys=['home','categories','finds','guide','faq','ui_language','register','ui_search','search_placeholder','search','all_products','filter','previous','next','back_finds','loading','no_results'];
const rows={
cs:['Domů','Kategorie','Vybrané produkty','Jak to funguje','Časté dotazy','Jazyk','Zaregistrovat se na OopBuy ↗','Hledat produkty','Hledat produkty, značky nebo styly…','Hledat ↗','Všechny produkty ↗','Filtrovat produkty','Předchozí','Další','← Zpět na produkty','Načítání…','Nebyly nalezeny žádné produkty.'],
hu:['Kezdőlap','Kategóriák','Kiemelt termékek','Hogyan működik','Gyakori kérdések','Nyelv','Regisztráció az OopBuy oldalon ↗','Termékek keresése','Termékek, márkák vagy stílusok keresése…','Keresés ↗','Összes termék ↗','Termékek szűrése','Előző','Következő','← Vissza a termékekhez','Betöltés…','Nem található megfelelő termék.'],
el:['Αρχική','Κατηγορίες','Επιλεγμένα προϊόντα','Πώς λειτουργεί','Συχνές ερωτήσεις','Γλώσσα','Εγγραφή στο OopBuy ↗','Αναζήτηση προϊόντων','Αναζήτηση προϊόντων, εμπορικών σημάτων ή στυλ…','Αναζήτηση ↗','Όλα τα προϊόντα ↗','Φιλτράρισμα προϊόντων','Προηγούμενο','Επόμενο','← Επιστροφή στα προϊόντα','Φόρτωση…','Δεν βρέθηκαν προϊόντα.'],
tr:['Ana sayfa','Kategoriler','Öne çıkan ürünler','Nasıl çalışır','Sık sorulan sorular','Dil','OopBuy’a kaydol ↗','Ürün ara','Ürün, marka veya stil ara…','Ara ↗','Tüm ürünler ↗','Ürünleri filtrele','Önceki','Sonraki','← Ürünlere dön','Yükleniyor…','Eşleşen ürün bulunamadı.'],
uk:['Головна','Категорії','Вибрані товари','Як це працює','Поширені запитання','Мова','Зареєструватися на OopBuy ↗','Пошук товарів','Шукати товари, бренди або стилі…','Пошук ↗','Усі товари ↗','Фільтрувати товари','Попередня','Наступна','← Повернутися до товарів','Завантаження…','Товарів не знайдено.'],
ru:['Главная','Категории','Избранные товары','Как это работает','Частые вопросы','Язык','Зарегистрироваться на OopBuy ↗','Поиск товаров','Поиск товаров, брендов или стилей…','Поиск ↗','Все товары ↗','Фильтровать товары','Назад','Далее','← Вернуться к товарам','Загрузка…','Товары не найдены.'],
ja:['ホーム','カテゴリー','おすすめ商品','ご利用ガイド','よくある質問','言語','OopBuyに登録 ↗','商品を検索','商品、ブランド、スタイルを検索…','検索 ↗','すべての商品 ↗','商品を絞り込む','前へ','次へ','← 商品一覧に戻る','読み込み中…','該当する商品はありません。'],
ko:['홈','카테고리','추천 상품','이용 방법','자주 묻는 질문','언어','OopBuy 가입 ↗','상품 검색','상품, 브랜드 또는 스타일 검색…','검색 ↗','모든 상품 ↗','상품 필터','이전','다음','← 상품 목록으로','불러오는 중…','일치하는 상품이 없습니다.'],
ar:['الرئيسية','الفئات','المنتجات المختارة','كيف يعمل','الأسئلة الشائعة','اللغة','التسجيل في OopBuy ↗','البحث عن المنتجات','ابحث عن المنتجات أو العلامات أو الأنماط…','بحث ↗','جميع المنتجات ↗','تصفية المنتجات','السابق','التالي','← العودة إلى المنتجات','جارٍ التحميل…','لم يتم العثور على منتجات مطابقة.'],
id:['Beranda','Kategori','Produk pilihan','Cara kerja','Pertanyaan umum','Bahasa','Daftar di OopBuy ↗','Cari produk','Cari produk, merek, atau gaya…','Cari ↗','Semua produk ↗','Filter produk','Sebelumnya','Berikutnya','← Kembali ke produk','Memuat…','Tidak ada produk yang ditemukan.']
};
window.oopEU=window.oopEU||{};
for(const [lang,values] of Object.entries(rows))window.oopEU[lang]=Object.fromEntries(keys.map((key,i)=>[key,values[i]]));
})();
