"""Apply reviewed navigation, brand names and critical currency labels."""
from pathlib import Path
import json,re
r=Path(__file__).resolve().parents[1]
# Articles | Guides | Buy It Now | Finds & Shopping Guides | Other purchasing platforms | Product listing photos | Reference conversion
rows={
'zh-CN':['文章','指南','立即购买','精选好物与购物指南','其他代购平台','商品展示图片','参考汇率换算'],
'es':['Artículos','Guías','Comprar ahora','Hallazgos y guías de compra','Otras plataformas de compra','Fotos del anuncio','Conversión de referencia'],
'fr':['Articles','Guides','Acheter maintenant','Trouvailles et guides d’achat','Autres plateformes d’achat','Photos de l’annonce','Conversion indicative'],
'de':['Artikel','Ratgeber','Jetzt kaufen','Fundstücke und Einkaufsratgeber','Andere Einkaufsplattformen','Produktbilder des Angebots','Unverbindliche Umrechnung'],
'it':['Articoli','Guide','Acquista ora','Prodotti e guide agli acquisti','Altre piattaforme di acquisto','Foto dell’inserzione','Conversione indicativa'],
'pt':['Artigos','Guias','Comprar agora','Achados e guias de compras','Outras plataformas de compra','Fotos do anúncio','Conversão de referência'],
'nl':['Artikelen','Gidsen','Nu kopen','Vondsten en koopgidsen','Andere aankoopplatforms','Foto’s uit de advertentie','Indicatieve omrekening'],
'pl':['Artykuły','Poradniki','Kup teraz','Produkty i poradniki zakupowe','Inne platformy zakupowe','Zdjęcia z oferty','Orientacyjne przeliczenie'],
'ru':['Статьи','Руководства','Купить сейчас','Находки и руководства по покупкам','Другие платформы для покупок','Фотографии из объявления','Справочный пересчёт'],
'uk':['Статті','Посібники','Купити зараз','Знахідки та посібники з покупок','Інші платформи для покупок','Фотографії з оголошення','Довідковий перерахунок'],
'tr':['Makaleler','Rehberler','Şimdi satın al','Ürün keşifleri ve alışveriş rehberleri','Diğer alışveriş platformları','İlan fotoğrafları','Referans kur dönüşümü'],
'ar':['المقالات','الأدلة','اشترِ الآن','منتجات مختارة وأدلة التسوق','منصات الشراء الأخرى','صور إعلان المنتج','تحويل استرشادي للعملة'],
'he':['מאמרים','מדריכים','קנו עכשיו','מציאות ומדריכי קנייה','פלטפורמות רכישה נוספות','תמונות מודעת המוצר','המרת מטבע משוערת'],
'ja':['記事','ガイド','今すぐ購入','おすすめ商品と購入ガイド','その他の購入代行サービス','商品掲載画像','参考為替換算'],
'ko':['게시글','가이드','지금 구매','추천 상품 및 쇼핑 가이드','다른 구매대행 플랫폼','상품 등록 사진','참고 환율 환산'],
'vi':['Bài viết','Hướng dẫn','Mua ngay','Sản phẩm gợi ý và hướng dẫn mua sắm','Nền tảng mua hộ khác','Ảnh trong tin sản phẩm','Quy đổi tham khảo'],
'th':['บทความ','คู่มือ','ซื้อเลย','สินค้าน่าสนใจและคู่มือช้อปปิ้ง','แพลตฟอร์มสั่งซื้ออื่น','รูปภาพในประกาศสินค้า','การแปลงสกุลเงินโดยประมาณ'],
'id':['Artikel','Panduan','Beli sekarang','Temuan produk dan panduan belanja','Platform pembelian lainnya','Foto pada halaman produk','Konversi kurs acuan'],
'ms':['Artikel','Panduan','Beli sekarang','Penemuan produk dan panduan membeli-belah','Platform pembelian lain','Foto penyenaraian produk','Penukaran kadar rujukan'],
'hi':['लेख','मार्गदर्शिकाएँ','अभी खरीदें','चुनिंदा उत्पाद और खरीदारी मार्गदर्शिकाएँ','अन्य खरीदारी प्लेटफ़ॉर्म','उत्पाद सूची की तस्वीरें','संदर्भ विनिमय दर से रूपांतरण'],
'sv':['Artiklar','Guider','Köp nu','Fynd och köpguider','Andra inköpsplattformar','Bilder från produktannonsen','Ungefärlig valutaomräkning'],
'ro':['Articole','Ghiduri','Cumpără acum','Produse descoperite și ghiduri de cumpărături','Alte platforme de cumpărături','Fotografii din anunț','Conversie orientativă']}
keys=['Articles','Guides','Buy It Now','Finds & Shopping Guides','Other purchasing platforms','Product listing photos','Reference conversion']
for code,values in rows.items():
 path=r/'public/i18n'/(code+'.json');d=json.loads(path.read_text())
 old=json.loads(Path('/workspace/sites/usfansfindsheet/public/i18n',code+'.json').read_text())
 old={re.sub(r'USFans|USFANS','LoongBuy',k).casefold():re.sub(r'USFans|USFANS','LoongBuy',v) for k,v in old.items()}
 for k in d:
  if k.casefold() in old:d[k]=old[k.casefold()]
 for k,v in zip(keys,values):d[k]=v
 d['LoongBuy Spreadsheet']='LoongBuy '+d['Spreadsheet']
 d['Other purchasing platforms / 其他代购平台']=values[4]
 dialog_key='其他代购平台 · Open this Weidian product with another agent. Links follow FindSpreadsheet’s platform templates and may include referral parameters.'
 d[dialog_key]=d.get(dialog_key,dialog_key).replace('其他代购平台',values[4])
 # Keep IDs and currency abbreviations exact across scripts.
 d['Weidian item ID']='Weidian ID' if code!='zh-CN' else '微店商品 ID'
 d['WEIDIAN']='WEIDIAN'
 d['LoongBuy']='LoongBuy'
 for k in list(d):
  if '1 USD = 6.6642 CNY' in k:
   d[k]=d['Reference conversion']+' · 1 USD = 6.6642 CNY · 2026-11-16. '+d.get('Confirm current pricing, options and availability on LoongBuy.','LoongBuy')
 for upper,title in [('GETTING STARTED','Getting Started'),('QC & WAREHOUSE','QC & Warehouse'),('SHIPPING','Shipping'),('DISCOVERY','Discovery'),('COMPARISONS','Comparisons'),('SPREADSHEET','Spreadsheet'),('IMAGE SEARCH','Image Search')]:d[upper]=d.get(title,title)
 for k in d:d[k]=d[k].replace('<unk>','').replace('⁇','').strip()
 path.write_text(json.dumps(d,ensure_ascii=False,indent=2))
# Native editorial pass on the language used by the project owner.
p=r/'public/i18n/zh-CN.json';d=json.loads(p.read_text());d.update({
'Historical FindSpreadsheet catalog · Prices and availability may have changed.':'FindSpreadsheet 历史商品目录 · 价格及库存可能已变化。',
'Preview catalog · Historical FindSpreadsheet export. USD estimates use 1 USD = 6.6642 CNY (Nov 16, 2026). Confirm the current price and exchange rate on LoongBuy.':'预览目录 · 使用 FindSpreadsheet 历史商品数据。美元估价按 1 美元 = 6.6642 元人民币换算（2026年11月16日），当前价格及汇率请在 LoongBuy 确认。',
'USD estimates · 1 USD = 6.6642 CNY · Nov 16, 2026. Confirm current prices on LoongBuy.':'美元参考价 · 1 美元 = 6.6642 元人民币 · 2026年11月16日。当前价格请在 LoongBuy 确认。',
'FindSpreadsheet catalog · 8,094 product finds':'FindSpreadsheet 商品目录 · 8,094 件商品',
'YOUR NEXT FIND STARTS HERE':'从这里发现下一件好物',
'Discover':'探索',
'Historical catalog preview · Prices and availability may have changed.':'历史商品目录预览 · 价格和库存可能已变化。',
'Confirm current pricing, options and availability on LoongBuy.':'请在 LoongBuy 核对当前价格、款式和库存。',
'Find your next favorite.':'发现下一件心仪好物。',
'Your first haul,':'第一次集运购物，',
'a little simpler':'更简单一点',
'Find your next favorite':'发现下一件心仪好物',
'Independent site · Orders are handled on loongbuy.com':'独立推荐站 · 订单由 loongbuy.com 处理',
'QC photos':'质检照片',
'Other purchasing platforms':'其他代购平台',
'Other purchasing platforms / 其他代购平台':'其他代购平台',
'Open the original product':'打开原始商品页',
'其他代购平台 · Open this Weidian product with another agent. Links follow FindSpreadsheet’s platform templates and may include referral parameters.':'使用其他代购平台打开同一微店商品。链接沿用 FindSpreadsheet 的平台模板，可能包含推荐参数。',
'Product listing photos':'商品展示图片',
'These are product photos, not verified QC photos.':'这些是商品展示图，并非经核验的质检照片。',
'Loading product details…':'正在加载商品详情…',
'Buy on LoongBuy':'前往 LoongBuy 购买',
'Original product':'主站商品页',
'Image Search':'以图搜索',
'Shoes & sneakers':'鞋履与运动鞋',
'All finds':'全部商品',
'Featured':'精选推荐',
'Newest in snapshot':'快照中的最新记录',
'Price: low to high':'价格：从低到高',
'Price: high to low':'价格：从高到低',
'FIND':'商品',
'find':'件商品',
'finds':'件商品',
'visually ranked finds':'件按视觉相似度排序的商品',
'articles to explore':'篇文章',
'article to explore':'篇文章',
'questions':'个问题',
'question':'个问题',
'MIN READ':'分钟阅读',
'min read':'分钟阅读',
'Search':'搜索',
'Guides':'指南',
'Articles':'文章',
'QC & Warehouse':'质检与仓库',
'Getting Started':'新手入门',
'Discovery':'商品发现',
'Comparisons':'平台比较',
'Shipping':'运输',
'Enter a product name or item ID…':'输入商品名称或商品 ID…',
'Product not found':'未找到商品',
'No matching products. Try a different name, category or item ID.':'没有匹配的商品，请尝试其他名称、分类或商品 ID。',
'Clear':'清除',
'Clear image':'清除图片',
'Next':'下一页',
'Previous':'上一页',
'Loading the catalog image index…':'正在加载商品图片索引…',
'Comparing indexed product photos…':'正在比对商品图片…',
'Search complete. Results are ordered by approximate visual similarity.':'搜索完成，结果按近似视觉相似度排序。',
'Findsheet never asks for your LoongBuy password and cannot access your private account.':'Findsheet 不会索取你的 LoongBuy 密码，也无法访问你的私人账户。'
});p.write_text(json.dumps(d,ensure_ascii=False,indent=2))
print('Applied reviewed UI and brand terminology to all 23 languages.')
