(()=>{
 const keys=['featured_category_0','featured_name_0','featured_category_1','featured_name_1','featured_category_2','featured_name_2','guide_banner','faq_banner'];
 const rows={
 zh:['夹克','花环印花牛仔夹克与牛仔裤系列','T恤','字母印花T恤系列','裤装与短裤','礼盒装平角内裤 - CXS-10192','OOPBUY 商品表 · 购物指南','OOPBUY 质检 · 仓库 · 运输'],
 de:['JACKEN','Jeansjacken und Jeans mit Blütenkranzdruck','T-SHIRTS','T-Shirts mit Schriftzug','HOSEN & SHORTS','Boxershorts in Geschenkbox – CXS-10192','OOPBUY SPREADSHEET · EINKAUFSRATGEBER','OOPBUY QUALITÄTSPRÜFUNG · LAGER · VERSAND'],
 fr:['VESTES','Collection veste et jean à imprimé couronne de fleurs','T-SHIRTS','Collection de T-shirts à lettres imprimées','PANTALONS ET SHORTS','Boxers en coffret – CXS-10192','OOPBUY SPREADSHEET · GUIDE D’ACHAT','OOPBUY CONTRÔLE QUALITÉ · ENTREPÔT · LIVRAISON'],
 es:['CHAQUETAS','Colección de chaqueta y vaqueros con estampado de flores','CAMISETAS','Colección de camisetas con letras estampadas','PANTALONES Y SHORTS','Bóxeres en caja – CXS-10192','OOPBUY SPREADSHEET · GUÍA DE COMPRA','OOPBUY CONTROL DE CALIDAD · ALMACÉN · ENVÍO'],
 it:['GIACCHE','Collezione giacca e jeans con stampa a corona di fiori','T-SHIRT','Collezione di T-shirt con scritte stampate','PANTALONI E SHORTS','Boxer in confezione – CXS-10192','OOPBUY SPREADSHEET · GUIDA AGLI ACQUISTI','OOPBUY CONTROLLO QUALITÀ · MAGAZZINO · SPEDIZIONE'],
 pt:['CASACOS','Coleção de casaco e jeans com estampa floral','CAMISETAS','Coleção de camisetas com letras estampadas','CALÇAS E SHORTS','Cuecas boxer em caixa – CXS-10192','OOPBUY SPREADSHEET · GUIA DE COMPRAS','OOPBUY CONTROLO DE QUALIDADE · ARMAZÉM · ENVIO'],
 nl:['JASSEN','Denim jas en jeans met bloemenkransprint','T-SHIRTS','T-shirts met letterprint','BROEKEN & SHORTS','Boxershorts in doos – CXS-10192','OOPBUY SPREADSHEET · WINKELGIDS','OOPBUY KWALITEITSCONTROLE · MAGAZIJN · VERZENDING'],
 pl:['KURTKI','Kolekcja kurtki i dżinsów z nadrukiem kwiatowym','T-SHIRTY','Kolekcja T-shirtów z nadrukiem literowym','SPODNIE I SZORTY','Bokserki w pudełku – CXS-10192','OOPBUY SPREADSHEET · PORADNIK ZAKUPOWY','OOPBUY KONTROLA JAKOŚCI · MAGAZYN · WYSYŁKA'],
 sv:['JACKOR','Jeansjacka och jeans med blomsterkransmönster','T-SHIRTS','T-shirts med bokstavstryck','BYXOR & SHORTS','Boxerkalsonger i presentförpackning – CXS-10192','OOPBUY SPREADSHEET · SHOPPINGGUIDE','OOPBUY KVALITETSKONTROLL · LAGER · FRAKT']
 };
 for(const [lang,values] of Object.entries(rows)) window.oopExtended[lang]={...(window.oopExtended[lang]||{}),...Object.fromEntries(keys.map((key,i)=>[key,values[i]]))};
})();
