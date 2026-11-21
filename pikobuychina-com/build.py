import argparse
import copy
import json
import re
import shutil
from pathlib import Path
from urllib.parse import urlencode, urlsplit, urlunsplit
from xml.etree import ElementTree as ET

from lxml import html

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'source'
DIST = ROOT / 'dist'
LOCALES = json.loads((ROOT / 'locales.json').read_text())
LEGACY = tuple(LOCALES)[:9]
MENU_LOCALES = (*LEGACY, 'ja', 'ko', 'ar', 'tr', 'ru', 'uk', 'sv', 'da', 'no', 'fi', 'cs', 'ro', 'hu', 'vi')
DOMAIN = 'https://pikobuychina.com'
TRACKING = '/guides/pikobuy-tracking-order-status-guide-2026'
BUYING = '/guides/how-to-buy-from-pikobuy-2026'
QC_GUIDE = '/articles/pikobuy-qc-photo-checklist-2026'
SHIPPING_ESTIMATOR = 'https://www.pikobuy.com/shipping-cost'
NAVIGATION = {'/': 'Home', '/finds': 'Finds', '/categories': 'Categories', '/w2c': 'How to Buy',
              '/qc': 'QC Photos', '/shipping': 'Shipping', '/coupons': 'Coupons', '/articles': 'Guides'}
CATEGORIES = {
    'shoes': ('Shoes', 'shoes', 'Compare the seller size chart and request an insole measurement when the fit is uncertain. Look at both shoes, heel labels, stitching and sole shape.'),
    'sweatshirts': ('Sweatshirts', 'hoodies-sweaters', 'Measure a sweatshirt you own. Compare its chest width, length and sleeves to the seller chart and check print placement in warehouse photos.'),
    't-shirts': ('T-shirts', 't-shirts', 'Check chest width, length, collar stitching and the size tag. Request a close-up if the print or embroidery determines your decision.'),
    'jackets': ('Jackets', 'jackets', 'Compare chest, shoulder and sleeve measurements with a jacket you own. Inspect fasteners, lining and included pieces.'),
    'pants-shorts': ('Pants and shorts', 'pants-shorts', 'Compare waist, rise and inseam with a garment that fits. Verify the color, size tag and drawstring before dispatch.'),
    'headwear': ('Headwear', 'headwear', 'Check the stated head circumference and closure. Review embroidery, seams and brim condition in warehouse photos.'),
    'accessories': ('Accessories', 'accessories', 'Confirm dimensions and included pieces. Check zippers, closures, straps and hardware from multiple angles.'),
    'short-sets': ('Short sets', 'ShortSets', 'Confirm whether the top and shorts are sold together. Check the size and color of both pieces and compare their measurements.'),
    'electronics': ('Electronics', 'electronics', 'Confirm exact model and accessories. Ask about route eligibility for batteries before paying and use a functional test when available.'),
    'other-items': ('Other items', 'other-stuff', 'Confirm dimensions, contents and material. Check route eligibility for liquids, batteries, oversized goods or other restricted items.'),
    'jerseys': ('Jerseys', 'jersey', 'Check player name, number and badges against the selected variant. Compare chest and length measurements before approving dispatch.'),
}
DATA = ROOT / 'findspreadsheet' / 'data'
CATALOG = json.loads((DATA / 'catalog.json').read_text())
THUMBNAILS = json.loads((DATA / 'product-thumbnails.json').read_text())
LATEST = sorted(CATALOG['items'], key=lambda item: item['date'], reverse=True)
ITEMS_BY_ID = {item['id']: item for item in LATEST if item['id']}
FEATURED = [ITEMS_BY_ID[id] for id in CATALOG['featured'] if id in ITEMS_BY_ID]
FIND_ORIGIN = 'https://findspreadsheet.com'
REGISTER = 'https://www.pikobuy.com/register?invitedCode=KPNJVF&inviteUserId=1109716'
SEARCH_IMAGE = '/image-search'
PRODUCT_DETAIL = '/finds/product'
SAVED = '/saved'
SHOPPING_AGENTS = json.loads((ROOT/'findspreadsheet/lib/agents.json').read_text())
EXCHANGE = json.loads((ROOT/'findspreadsheet/lib/rates.json').read_text())
LEGACY_SEARCHES = {
    '1892': 'Lanvin Curb', '3930': 'GGDB', '2329': 'Graphic T-Shirt', '2956': 'Wing Hoodie',
    '5817': 'Stone Island', '3654': 'Essentials Shorts', '3025': 'Goyard', '1995': 'Mini Tote',
}
PRODUCT_NOTE = 'Check the selected option, price and availability on the seller page before ordering.'
INDEPENDENT = 'Independent buying, QC, shipping and tracking guidance. This site is not affiliated with PikoBuy.'
NO_QC = 'Warehouse photos are unavailable for this listing. The product image above is a catalog reference.'
PRICE = 'USD reference'
GUIDE_NOTICE = 'Read the original guide in English'
SHORT_ACTIONS = ((BUYING, 'How to Buy'), ('/qc', 'QC Photos'), ('/shipping', 'Estimate Shipping'), (TRACKING, 'Tracking Help'))
SOURCE_PATHS = {
    '/' if p.parent == SOURCE else '/' + p.parent.relative_to(SOURCE).as_posix()
    for p in SOURCE.rglob('index.html')
}
CORE = {'/', *NAVIGATION, '/faq', '/guides', '/seo-guide'}
PRODUCT_PATHS = {f'/finds/{id}' for id in LEGACY_SEARCHES} | {PRODUCT_DETAIL}
EXTRA_PATHS = {SEARCH_IMAGE, SAVED}
CATEGORY_PATHS = {f'/categories/{key}' for key in CATEGORIES}
BUILT_PATHS = {p for p in SOURCE_PATHS if p.split('/')[1] not in LEGACY[1:]} | PRODUCT_PATHS | CATEGORY_PATHS | EXTRA_PATHS
TRANSLATIONS = {code: json.loads(path.read_text()) if (path := ROOT / 'release-translations' / f'{code}.json').exists() else {} for code in LOCALES}
TRANSLATIONS['en'] = {}
for code in list(LOCALES)[1:]:
    path = ROOT / 'findspreadsheet' / 'languages' / (('zh-Hans' if code == 'zh' else code) + '.json')
    if path.exists():
        for key,value in json.loads(path.read_text()).items():
            if isinstance(value,str) and value:
                TRANSLATIONS[code].setdefault(key,value)
for table in ('ui.txt','category-labels.txt'):
    header,*rows = (ROOT / table).read_text().splitlines()
    keys = [key.strip() for key in header[1:].split('|')]
    for row in rows:
        code,*labels = row.split('|')
        TRANSLATIONS[code].update(zip(keys,labels,strict=True))
for code in list(LOCALES)[1:]:
    dictionary=TRANSLATIONS[code]
    dictionary.setdefault('All buyer guides',dictionary['Guides'])
    dictionary.setdefault('Buying guides',dictionary['Guides'])
    dictionary['Search the product catalog']=dictionary['Search products']
    dictionary['PikoBuy Product Finds']='PikoBuy · '+dictionary['Finds']
    dictionary['PikoBuy Product Categories']='PikoBuy · '+dictionary['Categories']
    dictionary['PikoBuy Finds and Buying Guides']='PikoBuy · '+dictionary['Finds']+' · '+dictionary['Guides']
for row in (ROOT / 'findspreadsheet' / 'labels.txt').read_text().splitlines():
    code,registration,image_search= row.split('|')
    TRANSLATIONS[code].update({'Register': registration, 'Image search': image_search, 'Search by image': image_search})

runtime_header,*runtime_rows=(ROOT/'findspreadsheet/runtime-labels.txt').read_text().splitlines()
RUNTIME_KEYS=set(runtime_header.split('|'))
RUNTIME_KEYS.update(('See source','View on FindSpreadsheet','Open product','Show more products',
    'A product link or Weidian item ID is required.','Open the original listing to review this item.',
    'The product could not be loaded. Return to the spreadsheet and try again.',
    'Enter a valid Weidian item ID or product link.','Warehouse QC photo',
    'Saved on','Checked on','Shoes','Hoodies','T-shirts','Jackets','Pants & shorts',
    'Headwear','Accessories','Jerseys','Electronics','Other finds','Short sets'))
for row in runtime_rows:
    code,*labels=row.split('|')
    TRANSLATIONS[code].update(zip(runtime_header.split('|'),labels,strict=True))
TRANSLATIONS['zh'].update({
    'A product link or Weidian item ID is required.':'请输入商品链接或微店商品 ID。',
    'Open the original listing to review this item.':'请打开原商品页核对该商品。',
    'The product could not be loaded. Return to the spreadsheet and try again.':'商品暂时无法加载，请返回目录后重试。',
    'Open product':'打开商品','See source':'查看原站价格','Warehouse QC photo':'仓库验货照',
    'Saved on':'快照日期','Checked on':'查询日期',
    'Enter a valid Weidian item ID or product link.':'请输入有效的微店商品 ID 或商品链接。',
})


def element(tag, text=None, **attrs):
    node = html.Element(tag, **{key.rstrip('_').replace('_','-'): str(value) for key,value in attrs.items()})
    node.text = text
    return node


def add(parent, tag, text=None, **attrs):
    node = element(tag, text, **attrs)
    parent.append(node)
    return node


def route(path, code):
    clean = path.rstrip('/') or '/'
    return clean if code == 'en' else '/' + code + clean


def href(page, code):
    return route(page, code) if page in BUILT_PATHS else page


def clear(parent):
    for node in list(parent):
        parent.remove(node)
    parent.text = None


def remove(node):
    if node is not None and node.getparent() is not None:
        node.drop_tree()


def link(parent, title, destination, **attrs):
    return add(parent, 'a', title, href=destination, **attrs)


def search(parent, *, category=None, keyword=''):
    live = category is not None
    attrs = {'id':'browse-form'} if live else {}
    form = add(parent,'form',action='/finds',method='get',class_='catalog-form',role='search',**attrs)
    label = add(form,'label','Search products')
    add(label,'input',id='catalog-q' if live else 'home-catalog-q',type='search',name='q',
        maxlength=500,placeholder='Product name, item ID or link',value=keyword)
    add(form,'button','Search products',type='submit',class_='button')
    if live:
        label = add(form,'label','Category',data_filter='')
        select = add(label,'select',id='catalog-category',name='category')
        add(select,'option','All categories',value='')
        for name,external,_ in CATEGORIES.values():
            attrs={'selected':''} if external == category else {}
            add(select,'option',name,value=external,**attrs)
        field=add(form,'label','Sort by',data_filter='')
        sorting=add(field,'select',id='catalog-sort',name='sort')
        for value,label in (('latest','Latest'),('popular','Popular'),
                            ('price-asc','Price low to high'),('price-desc','Price high to low')):
            add(sorting,'option',label,value=value)
    return form


def shopping_controls(parent):
    controls=add(parent,'div',class_='shopping-controls')
    saved=link(controls,None,SAVED,class_='shopping-saved',aria_label='Saved products',title_='Saved products')
    add(saved,'span','♡',aria_hidden='true',translate='no')
    menu=add(controls,'details',class_='shopping-menu',data_shopping_menu='')
    trigger=add(menu,'summary',aria_label='Shopping agent and currency')
    add(trigger,'img',src='/assets/agents/pikobuy.webp',alt='',width=19,height=19,data_shopping_logo='')
    add(trigger,'span','Pikobuy',data_shopping_agent='',translate='no')
    add(trigger,'span','USD',data_shopping_currency='',class_='shopping-code',translate='no')
    panel=add(menu,'div',class_='shopping-panel')
    field=add(panel,'fieldset')
    add(field,'legend','Shopping agent')
    options=add(field,'div',class_='shopping-agent-options')
    for agent in SHOPPING_AGENTS:
        label=add(options,'label')
        attrs={'checked':''} if agent['id']=='pikobuy' else {}
        add(label,'input',type='radio',name='site-agent',value=agent['id'],**attrs)
        add(label,'img',src=agent['logo'],alt='',width=19,height=19,loading='lazy')
        add(label,'span',agent['name'],translate='no')
    field=add(panel,'fieldset')
    add(field,'legend','Currency')
    options=add(field,'div',class_='shopping-currency-options')
    for currency in sorted(EXCHANGE['rates']):
        label=add(options,'label')
        attrs={'checked':''} if currency=='USD' else {}
        add(label,'input',type='radio',name='site-currency',value=currency,**attrs)
        add(label,'span',currency,translate='no')
    note=add(panel,'p','Other currency prices are estimates based on the reference rates dated ')
    add(note,'time',EXCHANGE['date'],datetime=EXCHANGE['date'],translate='no').tail='.'


def shopping_heading(parent):
    bar=add(parent,'div',class_='shopping-heading')
    shopping_controls(bar)
    return bar


def catalog_panel(parent, category='', keyword=''):
    section = add(parent,'section',id='catalog',data_category=category,data_keyword=keyword)
    bar=shopping_heading(section)
    bar.insert(0,element('p','FindSpreadsheet catalog',id='catalog-status',role='status'))
    search(section,category=category,keyword=keyword)
    actions=add(section,'div',class_='catalog-actions')
    link(actions,'Image search',SEARCH_IMAGE)
    link(actions,'View on FindSpreadsheet',FIND_ORIGIN+'/'+(category or 'AllProducts')+'/',id='catalog-source',rel='noopener')
    grid(section,[item for item in LATEST if (not category or item['category']==category)
         and (not keyword or all(word in item['title'].lower() for word in keyword.lower().split()))][:24],id='catalog-grid')
    empty=add(section,'div',id='catalog-empty',hidden='')
    add(empty,'button','Clear search and filters',id='catalog-reset',type='button',class_='button secondary')
    add(section,'button','Show more products',id='catalog-more',type='button',class_='button',hidden='')


def categories(parent):
    listing = add(parent, 'ul', class_='catalog-links')
    for slug,(name,_,__) in CATEGORIES.items():
        link(add(listing,'li'), name, '/categories/'+slug)


def grid(parent, products, **attrs):
    labels={external:name for name,external,_ in CATEGORIES.values()}
    listing=add(parent,'div',class_='catalog-grid',**attrs)
    for item in products:
        name=item['title']
        category=item['category']
        query={'from':item['path']}
        if item['id']:
            query['id']=item['id']
        destination=PRODUCT_DETAIL+'?'+urlencode(query)
        card=add(listing,'article',class_='catalog-card')
        picture=link(card,None,destination)
        photo=item.get('image','')
        if photo:
            url=THUMBNAILS.get(photo) or (photo if photo.startswith('https://') else FIND_ORIGIN+photo)
            add(picture,'img',src=url,alt=name,width=520,height=520,loading='lazy',decoding='async',
                translate='no',data_product_image=photo,referrerpolicy='no-referrer')
        copy=add(card,'div')
        link(add(copy,'h3'),name,destination,translate='no')
        add(copy,'small',labels[category])
        price=item['price']
        attrs={'data_cny_price':price} if price is not None else {}
        add(copy,'strong','See source' if price is None else f'${price/7.26:,.2f}',class_='catalog-price',translate='no' if price is not None else 'yes',**attrs)


def hero(parent, title, summary=None):
    box = add(parent, 'header', class_='page-hero')
    add(box, 'h1', title)
    if summary:
        add(box, 'p', summary)
    return box


def home(main):
    old_guides = {}
    for card in main.xpath('./section//a[contains(concat(" ",normalize-space(@class)," ")," card ")]'):
        old_guides[card.get('href')] = copy.deepcopy(card)
    clear(main)
    intro = add(main,'section',class_='home-hero home-upgrade')
    add(intro,'p','Independent catalog powered by FindSpreadsheet',class_='eyebrow')
    add(intro,'h1','Pikobuy Spreadsheet',translate='no')
    add(intro,'p','Find products, review warehouse photos, estimate shipping and check parcel status.')
    search(intro)
    actions=add(intro,'div',class_='catalog-actions')
    link(actions,'Browse Finds','/finds',class_='button local-action')
    link(actions,'Image search',SEARCH_IMAGE,class_='button local-action')
    tasks=add(intro,'div',class_='task-links')
    for path,label in SHORT_ACTIONS:
        link(tasks,label,path)
    block=add(main,'section',class_='catalog-section')
    add(block,'h2','Explore categories')
    categories(block)
    block=add(main,'section',class_='catalog-section')
    add(block,'h2','Featured products')
    add(block,'p',PRODUCT_NOTE,class_='catalog-note')
    grid(block,FEATURED[:8])
    if old_guides:
        block=add(main,'section',class_='catalog-section')
        heading=add(block,'div',class_='section-heading')
        add(heading,'h2','Buying guides')
        link(heading,'All buyer guides','/articles')
        cards=add(block,'div',class_='cards compact-guides')
        for card in old_guides.values():
            title=card.find('h3')
            if title is not None:
                link(cards,phrase(title.text_content()),card.get('href'),class_='card')


def catalog(main, keyword=''):
    guides = main.xpath('./div[contains(@class, "cards")]')
    saved = copy.deepcopy(guides[-1]) if guides else None
    clear(main)
    hero(main,'Pikobuy Finds & Weidian Links' if not keyword else 'Search products',PRODUCT_NOTE)
    catalog_panel(main,keyword=keyword)
    categories(main)
    if saved is not None:
        add(main,'h2','Buying guides')
        main.append(saved)


def category_index(main):
    original = list(main)[-1:]
    saved = [copy.deepcopy(x) for x in original if x.get('class') == 'cards']
    clear(main)
    hero(main,'PikoBuy Product Categories','Choose a product category and review its buying and warehouse checks.')
    categories(main)
    for content in saved:
        main.append(content)


def category_detail(main, slug):
    clear(main)
    name, external, check = CATEGORIES[slug]
    hero(main,name,check)
    catalog_panel(main,category=external)
    panel=add(main,'section',class_='action-panel')
    link(panel,'QC checklist',QC_GUIDE)
    add(panel,'br')
    link(panel,'Estimate Shipping','/shipping')
    add(main,'h2','Explore categories')
    categories(main)


def load_template(main,name):
    for node in html.fragments_fromstring((ROOT/'findspreadsheet'/f'{name}.html').read_text()):
        main.append(node)


def detail(main):
    clear(main)
    shopping_heading(main)
    load_template(main,'product')
    panel=main.xpath('.//*[@id="other-agents"]/div')[0]
    for agent in SHOPPING_AGENTS:
        attributes={'target':'_blank','rel':'noopener' if agent['id']=='findspreadsheet' else 'sponsored noopener'}
        choice=add(panel,'a',data_agent=agent['id'],**attributes)
        add(choice,'img',src=agent['logo'],alt='',width=19,height=19,loading='lazy')
        add(choice,'span',agent['name'],translate='no')


def image_search(main):
    clear(main)
    hero(main,'Image search','Compare a photo with FindSpreadsheet seller and indexed warehouse photos.')
    shopping_heading(main)
    load_template(main,'image-search')


def saved_products(main):
    clear(main)
    hero(main,'Saved products')
    shopping_heading(main)
    section=add(main,'section',data_saved_list='')
    add(section,'p','Loading saved products…',role='status')
    add(section,'div',class_='catalog-grid')
    link(main,'Browse Finds','/finds')


def utility(main, page):
    heading=main.find('header')
    index=main.index(heading)+1 if heading is not None else 0
    panel=element('section', class_='action-panel')
    if page == '/shipping':
        add(panel,'h2','Estimate Shipping')
        for a in main.xpath('.//a[@href=$target]',target=SHIPPING_ESTIMATOR):
            remove(a)
        link(panel,'Open the official shipping estimator',SHIPPING_ESTIMATOR,class_='button local-action')
    elif page == TRACKING:
        add(panel,'h2','Which status do you see?')
        listing=add(panel,'ul')
        add(listing,'li','Waiting for purchase or domestic delivery: check the product order in your PikoBuy account.')
        add(listing,'li','At the warehouse: review QC photos and check whether you have submitted an international parcel.')
        add(listing,'li','International parcel shipped: use its carrier tracking number and last recorded scan.')
        link(panel,'Open PikoBuy to view your orders','https://www.pikobuy.com/',class_='button local-action')
    else:
        add(panel,'h2','Warehouse photo checklist')
        add(panel,'p','Compare the selected variant and size label, the overall item, and close-ups of the parts that matter to your decision.')
        link(panel,'Read the QC checklist',QC_GUIDE,class_='button local-action')
        link(panel,'Browse Finds','/finds')
    main.insert(index,panel)
    if page == '/qc':
        load_template(panel,'qc')


def global_elements(doc, page, code):
    doc.set('lang', LOCALES[code][1])
    doc.set('dir','rtl' if code in {'ar','he'} else 'ltr')
    body=doc.find('body')
    body.set('data-rebuild','')
    old=body.find('header')
    doc.set('data-locale-base','' if code=='en' else '/'+code)
    header=element('header',class_='site-header')
    inner=add(header,'div',class_='local-header')
    identity=add(inner,'div',class_='brand-actions')
    brand=link(identity,None,'/',class_='brand')
    add(brand,'img',src='/assets/pikobuy-official-logo.png',alt='PikobuyChina',width=204,height=48,translate='no')
    link(identity,'Register',REGISTER,class_='button registration',target='_blank',rel='sponsored noopener')
    nav=add(inner,'nav',id='site-navigation',class_='local-nav',aria_label='Main navigation')
    for path,title in NAVIGATION.items():
        attrs={'aria_current':'page'} if page == path else {}
        link(nav,title,path,**attrs)
    add(inner,'button','Menu',type='button',class_='local-menu',aria_controls='site-navigation',aria_expanded='false',data_local_menu='')
    picker=add(inner,'details',class_='local-language',data_language_picker='')
    toggle=add(picker,'summary',aria_label='Language')
    add(toggle,'span','🌐',class_='language-icon',aria_hidden='true',translate='no')
    name,locale=LOCALES[code]
    add(toggle,'span',name,class_='language-name',lang=locale,translate='no')
    add(toggle,'span',code.upper(),class_='language-code',aria_hidden='true',translate='no')
    panel=add(picker,'nav',class_='language-panel',aria_label='Language')
    for lang in MENU_LOCALES:
        name,locale=LOCALES[lang]
        current={'aria_current':'true'} if lang==code else {}
        link(panel,name,route(page,lang),lang=locale,hreflang=locale,translate='no',data_language_link='',**current)
    if old is not None:
        body.replace(old,header)
    else:
        body.insert(0,header)
    old=body.find('footer')
    footer=element('footer',class_='localized-footer')
    outer=add(footer,'div',class_='site-main')
    add(outer,'strong','PikobuyChina',translate='no')
    add(outer,'p',INDEPENDENT)
    for path,title in (('/guides','Guides by stage'),('/faq','FAQ'),('/sitemap.xml','Sitemap')):
        link(outer,title,path)
    if old is not None:
        body.replace(old,footer)
    else:
        body.append(footer)
    for script in doc.xpath('//script[contains(@src,"/assets/site.js")]'):
        remove(script)
    add(body,'script',src='/assets/catalog-search.js',defer='')
    add(doc.find('head'),'link',rel='stylesheet',href='/assets/rebuild.css')
    for icon in doc.xpath('//head/link[contains(@rel,"icon")]'):
        remove(icon)
    add(doc.find('head'),'link',rel='icon',type='image/png',sizes='192x192',href='/assets/pikobuy-official-icon.png')
    add(doc.find('head'),'link',rel='apple-touch-icon',href='/assets/pikobuy-official-icon.png')
    for image in doc.xpath('//head/meta[@property="og:image"]'):
        image.set('content',DOMAIN+'/assets/pikobuy-official-logo.png')
    if page in {'/', '/finds', '/qc', SEARCH_IMAGE, SAVED} | PRODUCT_PATHS | CATEGORY_PATHS:
        add(body,'script',src='/assets/catalog-app.js',type='module')


def original_path(page, code):
    root_path=SOURCE if code not in LEGACY[1:] else SOURCE / code
    candidate=root_path / page.lstrip('/') / 'index.html'
    return candidate if candidate.exists() else SOURCE / page.lstrip('/') / 'index.html'


def prepare(page, code):
    is_fresh=page in PRODUCT_PATHS|CATEGORY_PATHS|EXTRA_PATHS
    original=original_path('/finds' if is_fresh else page, code)
    doc=html.parse(original).getroot()
    main=doc.find('.//main')
    if page=='/':
        home(main)
    elif page=='/finds':
        catalog(main)
    elif page=='/categories':
        category_index(main)
    elif page in CATEGORY_PATHS:
        category_detail(main,page.rsplit('/',1)[1])
    elif page == PRODUCT_DETAIL:
        detail(main)
    elif page in PRODUCT_PATHS:
        catalog(main,LEGACY_SEARCHES[page.rsplit('/',1)[1]])
    elif page == SEARCH_IMAGE:
        image_search(main)
    elif page == SAVED:
        saved_products(main)
    elif page in {'/shipping','/qc',TRACKING}:
        utility(main,page)
    global_elements(doc,page,code)
    return doc, main


def phrase(text):
    return ' '.join(text.split())


def translatable(node, include_main):
    attributes={'title','alt','aria-label','placeholder','data-remove-label'}
    for item in node.iter():
        if not isinstance(item.tag,str):
            continue
        ancestors=list(item.iterancestors())
        if any(x.tag in {'script','style','code','pre','noscript'} for x in [item,*ancestors]):
            continue
        if any(x.get('translate')=='no' or 'notranslate' in (x.get('class') or '').split() for x in [item,*ancestors]):
            if item.tail and phrase(item.tail):
                yield item,'tail',None,phrase(item.tail)
            continue
        old_local = not include_main and item.get('data-ui') is None and (item.tag=='main' or any(x.tag=='main' for x in ancestors))
        if old_local:
            continue
        if item.text and phrase(item.text):
            yield item,'text',None,phrase(item.text)
        if item.tail and phrase(item.tail):
            yield item,'tail',None,phrase(item.tail)
        for attr in attributes:
            if item.get(attr) and phrase(item.get(attr)):
                yield item,'attr',attr,phrase(item.get(attr))


def request_translation():
    priority=[set() for _ in range(4)]
    for page in sorted(BUILT_PATHS):
        doc, main=prepare(page,'en')
        primary=page in CORE or page in CATEGORY_PATHS or page in PRODUCT_PATHS or page==TRACKING
        for node,where,attr,value in translatable(doc,True):
            if not re.search(r'[A-Za-z]',value) or len(value)>1000:
                continue
            in_main=node.tag=='main' or any(a.tag=='main' for a in node.iterancestors())
            section = 0 if not in_main or (primary and len(value)<85) else 1 if primary and page!=TRACKING else 2 if len(value)<170 else 3
            priority[section].add(value)
    final=[]
    used=set()
    for section in priority:
        final.append(sorted(section-used,key=lambda x:(len(x),x)))
        used.update(section)
    return final


def strip_locale(path):
    parts=path.strip('/').split('/')
    if parts[0] in LOCALES and parts[0]!='en':
        return '/'+ '/'.join(parts[1:])
    return path.rstrip('/') or '/'


def local_links(doc,code):
    for node in doc.xpath('//a[@href and not(@data-language-link)]|//form[@action]'):
        attr='action' if node.tag=='form' else 'href'
        url=urlsplit(node.get(attr))
        if url.scheme or url.netloc or not url.path.startswith('/'):
            continue
        original=strip_locale(url.path)
        updated=href(original,code)
        if updated != original or original in BUILT_PATHS:
            node.set(attr,urlunsplit(('', '', updated,url.query,url.fragment)))


def head_meta(doc,page,code,production, indexable):
    head=doc.find('head')
    for tag in head.xpath('./link[@rel="canonical" or @hreflang] | ./meta[@name="robots" or @property="og:url"]'):
        remove(tag)
    canonical=DOMAIN+route(page,code)
    add(head,'link',rel='canonical',href=canonical)
    add(head,'meta',property='og:url',content=canonical)
    if not (production and indexable):
        add(head,'meta',name='robots',content='noindex,follow')
    for lang,language in LOCALES.items():
        if index_ready(page,lang):
            add(head,'link',rel='alternate',hreflang=language[1],href=DOMAIN+route(page,lang))
    add(head,'link',rel='alternate',hreflang='x-default',href=DOMAIN+route(page,'en'))
    h1=doc.find('.//h1')
    if h1 is not None:
        title=phrase(h1.text_content())
        title_target=head.find('title')
        if title_target is not None:
            title_target.text=title+' | PikobuyChina'
        summary=h1.getparent().find('p')
        if summary is not None:
            metadata=head.xpath('./meta[@name="description"]')
            for meta in metadata:
                meta.set('content',phrase(summary.text_content())[:210])
    title_text = head.findtext('title') or 'PikobuyChina'
    description = head.xpath('string(./meta[@name="description"]/@content)')
    for key,value in {'og:title': title_text, 'og:description': description,
                      'twitter:title': title_text, 'twitter:description': description}.items():
        for tag in head.xpath('./meta[@name=$key or @property=$key]', key=key):
            tag.set('content',value)
    for tag in head.xpath('./script[@type="application/ld+json"]'):
        try:
            schema = json.loads(tag.text)
        except (TypeError, ValueError):
            continue
        if schema.get('@type') not in {'Article','WebPage','CollectionPage','BlogPosting'}:
            continue
        schema.update(name=title_text,description=description,url=canonical,inLanguage=LOCALES[code][1])
        if '@id' in schema:
            schema['@id']=canonical
        if 'mainEntityOfPage' in schema:
            schema['mainEntityOfPage']=canonical
        if 'headline' in schema:
            schema['headline']=title_text
        if page in PRODUCT_PATHS | CATEGORY_PATHS:
            schema['@type']='CollectionPage' if page in CATEGORY_PATHS else 'WebPage'
            schema.pop('datePublished',None)
            schema.pop('dateModified',None)
        tag.text=json.dumps(schema,ensure_ascii=False).replace('<','\\u003c')
    if not production:
        for tag in doc.xpath('//script[contains(@src,"googletagmanager") or contains(text(),"window.dataLayer")]'):
            remove(tag)


def english_phrases(main):
    return {value for node,_,_,value in translatable(main,True)
            if re.search(r'[A-Za-z]',value) and value!='Clear search and filters' and not node.xpath('ancestor-or-self::*[@class="shopping-controls"]')}


def index_ready(page,code):
    return INDEXABLE.get((page,code),False)


def translated_value(value, code):
    return TRANSLATIONS[code].get(value,value).strip() or value


def render(doc,main,page,code,production):
    local_links(doc,code)
    legacy_body=code in LEGACY[1:] and page not in PRODUCT_PATHS|CATEGORY_PATHS and page not in {'/','/finds','/categories'}|EXTRA_PATHS
    editorial=main.find('article')
    if not index_ready(page,code) and editorial is not None and code not in LEGACY:
        original=element('details',class_='action-panel original-guide',data_original_guide='')
        add(original,'summary',GUIDE_NOTICE)
        original_text=add(original,'div',lang='en',translate='no')
        boxed=main.find('details')
        if boxed is not None:
            original_text.append(boxed)
        main.insert(main.index(editorial),original)
        original_text.append(editorial)
    for node,where,attr,value in list(translatable(doc,not legacy_body)):
        if node.tag=='title':
            continue
        new=translated_value(value,code)
        if new==value:
            continue
        if where=='attr':
            node.set(attr,new)
        else:
            original=getattr(node,where)
            start=original[:len(original)-len(original.lstrip())]
            end=original[len(original.rstrip()):]
            setattr(node,where,start+new+end)
    if legacy_body:
        for box in main.xpath('./section[@class="action-panel"]'):
            for node,where,attr,value in translatable(box,True):
                if where=='attr':
                    node.set(attr,translated_value(value,code))
                else:
                    setattr(node,where,translated_value(value,code))
    if doc.xpath('//script[@src="/assets/catalog-app.js"]'):
        values={key:translated_value(key,code) for key in sorted(RUNTIME_KEYS)
                if translated_value(key,code)!=key}
        add(doc.find('body'),'script',json.dumps(values,ensure_ascii=False).replace('<','\\u003c'),
            id='runtime-messages',type='application/json')
    head_meta(doc,page,code,production,index_ready(page,code))
    seo = {
        '/':('Pikobuy Spreadsheet – Finds, QC Photos & Image Search',
             'Browse the Pikobuy spreadsheet with FindSpreadsheet product links, Weidian item search, warehouse QC photos, image search and buying guides.'),
        '/finds':('Pikobuy Finds & Weidian Links | FindSpreadsheet Catalog',
                  'Search Pikobuy finds by product name, Weidian ID or link. Filter FindSpreadsheet listings by category and sort by date, popularity or price.'),
        '/qc':('Pikobuy QC Finder | Look Up Warehouse QC Photos',
              'Look up available warehouse QC photos using a Weidian item ID or product link. See the FindSpreadsheet source and compare warehouse photos before ordering.'),
        SEARCH_IMAGE:('Pikobuy Image Search | Find Similar Products',
                      'Search FindSpreadsheet product photos, seller galleries and indexed warehouse QC photos using a reference image. The photo stays in your browser.'),
    }.get(page)
    if page in CATEGORY_PATHS:
        name=CATEGORIES[page.rsplit('/',1)[1]][0]
        seo=(f'Pikobuy {name} Spreadsheet | FindSpreadsheet Finds',
             f'Browse Pikobuy {name.lower()} finds from FindSpreadsheet. Compare product links and reference prices, then check seller and available warehouse photos.')
    if code=='en' and seo:
        head=doc.find('head')
        seo_title,seo_description=seo
        head.find('title').text=seo_title
        for tag in head.xpath('./meta[@name="description" or @property="og:description"]'):
            tag.set('content',seo_description)
        for tag in head.xpath('./meta[@property="og:title"]'):
            tag.set('content',seo_title)
        for tag in head.xpath('./script[@type="application/ld+json"]'):
            schema=json.loads(tag.text)
            if isinstance(schema,dict) and schema.get('@type')=='WebPage':
                schema.update(name=seo_title,description=seo_description)
                tag.text=json.dumps(schema,ensure_ascii=False).replace('<','\\u003c')
    loc=route(page,code).strip('/')
    dest=DIST / loc / 'index.html'
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text('<!DOCTYPE html>\n'+html.tostring(doc,encoding='unicode',method='html'),encoding='utf-8')


INDEXABLE={}


def build(production):
    if DIST.exists():
        shutil.rmtree(DIST)
    shutil.copytree(SOURCE/'assets',DIST/'assets')
    for asset in ('rebuild.css','catalog-search.js'):
        shutil.copy2(ROOT/asset,DIST/'assets'/asset)
    for page in sorted(BUILT_PATHS):
        english_doc,main=prepare(page,'en')
        required=english_phrases(main)
        for code in LOCALES:
            legacy_path=original_path(page,code)
            legacy_ready=code in LEGACY[1:] and legacy_path.is_relative_to(SOURCE/code)
            INDEXABLE[page,code]=page not in PRODUCT_PATHS|{SAVED} and (code=='en' or legacy_ready or all(value in TRANSLATIONS[code] for value in required))
    for page in sorted(BUILT_PATHS):
        for code in LOCALES:
            render(*prepare(page,code),page,code,production)
    ns='http://www.sitemaps.org/schemas/sitemap/0.9'
    xhtml='http://www.w3.org/1999/xhtml'
    ET.register_namespace('',ns)
    ET.register_namespace('xhtml',xhtml)
    root=ET.Element('{'+ns+'}urlset')
    urls=[]
    for page in sorted(BUILT_PATHS):
        codes=[code for code in LOCALES if index_ready(page,code)]
        for code in codes:
            url=ET.SubElement(root,'{'+ns+'}url')
            loc=DOMAIN+route(page,code)
            ET.SubElement(url,'{'+ns+'}loc').text=loc
            urls.append(loc)
            for lang in codes:
                ET.SubElement(url,'{'+xhtml+'}link',{'rel':'alternate','hreflang':LOCALES[lang][1],'href':DOMAIN+route(page,lang)})
            ET.SubElement(url,'{'+xhtml+'}link',{'rel':'alternate','hreflang':'x-default','href':DOMAIN+route(page,'en')})
    ET.ElementTree(root).write(DIST/'sitemap.xml',encoding='utf-8',xml_declaration=True)
    (DIST/'sitemap.txt').write_text('\n'.join(urls)+'\n')
    (DIST/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+DOMAIN+'/sitemap.xml\n' if production else 'User-agent: *\nDisallow: /\n')
    if not production:
        (DIST/'_headers').write_text('/*\n  X-Robots-Tag: noindex, nofollow\n')
    (DIST/'404.html').write_text('<!doctype html><html lang="en"><title>Page not found | PikobuyChina</title><h1>Page not found</h1><p><a href="/">Return home</a></p></html>')
    print(f'{len(BUILT_PATHS)} pages × {len(LOCALES)} locales. {len(urls)} translated or original sitemap entries.')


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--production',action='store_true')
    parser.add_argument('--translation-input',type=Path)
    args=parser.parse_args()
    if args.translation_input:
        queues=request_translation()
        queues[0].append(GUIDE_NOTICE)
        args.translation_input.write_text(json.dumps(queues,ensure_ascii=False))
        print('Translation queue:',[len(x) for x in queues])
    else:
        build(args.production)
