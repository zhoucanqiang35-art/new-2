from pathlib import Path
import json,re
from opencc import OpenCC
r=Path(__file__).resolve().parents[1];p=r/'public/i18n/zh-CN.json';d=json.loads(p.read_text());cc=OpenCC('t2s')
for k,v in list(d.items()):
 v=cc.convert(v).replace('传输表','商品表').replace('LoongBuy 支票','LoongBuy 结算').replace('支票和订单管理','结算和订单管理').replace('基于容量的充电','按体积计费').replace('充电措施','计费方式').replace('货物帮助','运费帮助').replace('货物援助','运费帮助')
 if 'export' in k.lower():v=v.replace('出口','数据导出')
 if 'authenticity certificate' in k:v=v.replace('身份证','真伪鉴定证明')
 d[k]=v
rows='''什么是 LoongBuy 商品表？|这是一个独立商品发现目录，方便浏览商品并通过 LoongBuy 打开原始链接。结算与订单管理在代购平台完成。
LoongBuy Findsheet 是官方网站吗？|不是。Findsheet 是独立推荐站，官方购买平台是 loongbuy.com。
可以浏览多少件商品？|预览目录展示从 FindSpreadsheet 历史数据中筛选出的 8,094 条有效微店商品记录。这是预览目录数量，不代表卖家当前库存。
商品表是实时更新的吗？|目前不是。搜索、分类和价格排序使用历史数据快照，主站实时数据服务尚未接通。
如何查找已知的微店商品？|在搜索框输入微店商品的数字 ID。例如教程使用 7872202082，对应 Findsheet 商品记录 8648；进入详情后请再次核对 ID。
可以搜索鞋子、卫衣或球衣吗？|可以使用分类按钮，也可以搜索商品名称。目录还包含夹克、T恤、裤装、配饰、帽饰等类别。
“快照中的最新记录”代表新品吗？|不是。它只按历史导出数据中的记录排序，不代表真实上新时间、当前热度或卖家刚刚补货。
可以按卖家评分或质检分数排序吗？|预览暂不提供这些数据。本站只使用页面显示的分类和价格功能，不编造卖家评分或质检评级。
如何通过本站购买商品？|打开商品详情，点击“前往 LoongBuy 购买”。在官方页面核对当前商品，再选择款式、尺码和数量。图文指南展示了实际跳转步骤。
为什么需要 LoongBuy 账户？|浏览本站目录无需账户，但购买和私人订单记录由 LoongBuy 管理。继续购买时请在官方网站登录。
价格显示为美元吗？|是。商品卡片和详情展示由历史人民币价格换算的美元参考价，页面注明汇率及日期；这不是实时结算报价。
为什么官方页面上的价格不同？|本站使用历史数据，卖家链接可能包含多种款式，平台汇率及附加费用也可能不同。请在官方页面确认选中的款式和当前订单总额。
商品表价格包含国际运费吗？|不包含。商品参考价、包裹运费和可选服务应分别核对。请以实际目的地和包裹的当前报价为准。
一个链接包含多种服装款式怎么办？|先核对商品 ID，再在官方商品页选择实际需要的款式、颜色和尺码。首图或缩略标题不一定代表所有选项。
LoongBuy 无法加载商品链接怎么办？|先检查原始链接和商品 ID。官方购买流程中介绍了无法自动导入链接时的手动下单方式，请按当前平台说明操作或咨询客服。
能在其他代购平台打开同一商品吗？|可以。详情页“其他代购平台”按钮沿用 FindSpreadsheet 的平台链接模板。请在选定平台确认相同款式及当前条款。
购买链接包含推荐参数吗？|部分来自 FindSpreadsheet 的平台链接包含推荐参数，这些参数会被保留。本站不因此承诺任何额外优惠。
目前支持哪些付款方式或优惠券？|请查看你自己的 LoongBuy 结算页或账户里当前可用的选项与条件。本站不提供未经核实的付款方式清单或保证可用的优惠券。
以图搜索页面在哪里？|点击顶部“以图搜索”，或首页搜索框中的相机图标，都可以进入独立上传与结果页面。
支持哪些图片格式？|预览支持 15 MB 以内的 JPG、PNG 和 WebP。建议使用主体清晰、以单件商品为主的图片。
我选择的图片会上传到搜索服务器吗？|预览会在浏览器本地处理图片，并下载历史商品图片索引进行比对，不会把你选择的图片上传到搜图服务器。
图片匹配能证明是同一件商品吗？|不能。结果只是近似的视觉匹配，请打开商品链接并核对商品身份和具体细节。
为什么结果里会有不相关的商品？|预览使用小型图片特征进行比对，背景、颜色和形状都会影响排序。可以裁掉无关背景、更换角度，或改用文字搜索。
搜图包括快照导出后新增的商品吗？|不包括。当前比对的是预览所附历史图片索引，主站实时搜图服务尚未接通。
商品展示图与质检照片相同吗？|不同。展示图属于商品链接，质检照片记录某次具体验货的商品。使用照片判断前，应先核对商品与订单背景。
这里可以获取实时 LoongBuy 质检照片吗？|暂时不能。详情页展示商品图片并说明质检功能的当前限制，不会把目录展示图标成仓库验货照片。
查看质检照片时应该比对什么？|先核对商品、款式、数量、尺码和颜色，再查看可见状态及不清楚的细节。无法确认的重要问题应向平台提出具体询问。
仓库验货能鉴定真伪或测试电子产品吗？|不能把仓库验货视为真伪鉴定证明或完整功能测试。LoongBuy 官方验货说明介绍了外观检查以及具体的服务范围限制。
在哪里查看自己订单的仓库照片？|请在你自己的官方账户中查看订单和仓库信息。购买指南附有官方流程链接，公开教程示例也已明确标注。
尺码或颜色看起来不对怎么办？|保存订单号和相关照片，说明具体不符之处，并询问平台可采取的处理方式。请核对订单阶段及当前条款，不要预设退货一定会获批。
商品能在仓库放多久？|请查阅当前仓储政策及自己商品的实际日期。不要假设所有订单从同一天起算，也不要仅依赖旧文章中的期限。
退货或退款一定会通过吗？|不保证。请查看当前政策和订单页面的可用选项。申请资格、卖家处理及商品所处阶段都会影响结果；提交申请不等于已处理成功。
LoongBuy 运费是多少？|请根据实际目的地、包裹内容及包装情况获取当前报价。不存在适用于所有包裹和服务的统一每公斤价格。
什么是体积重？|体积重是官方运费说明中介绍的一种按包裹体积计费的方式。请查看你正在比较的线路所采用的计算与计费重量规则。
哪条线路最快或最便宜？|请在同一天、使用相同包裹条件比较当前可用选项。本站不提供未经核验的统一速度排名、丢件率或固定承运商价格表。
寄往美国、英国或欧洲要多久？|请查看目的地当前报价中的时效说明，并确认该时效涵盖哪些环节。本站不会照搬第三方文章中的保证送达天数。
可以寄往加拿大或澳大利亚吗？|请在 LoongBuy 按实际地址和商品内容检查当前可用线路。指南提及某个国家，不代表每条线路始终可用。
本站会计算税费或进口费用吗？|不会。请按当前官方目的地规定，以及适用的平台或承运商说明核对实际包裹。预览不提供海关门槛或税费计算。
在哪里查看订单或包裹追踪？|请使用官方账户，并按当前阶段查看对应订单或包裹记录。本站目录无法访问私人订单或实时包裹追踪信息。
询问物流延误时应该提供什么？|向官方客服提供对应订单号或包裹号、最后一条状态、查看日期，以及需要澄清的问题。不要在公开评论中发布个人收件信息。'''
faqs=json.loads((r/'src/faqs.json').read_text());pairs=[line.split('|',1) for line in rows.splitlines()];assert len(pairs)==len(faqs)==40
for f,(q,a) in zip(faqs,pairs):d[f['q']]=q;d[f['a']]=a
article_rows=[
('如何使用 LoongBuy 商品表','查找商品、比对详情，再在 LoongBuy 打开对应链接。'),
('LoongBuy 以图搜索：通过照片寻找商品','用清晰的商品照片查找近似好物，并核对搜索结果。'),
('LoongBuy 质检照片与商品展示图有什么区别？','了解展示图与验货照片各自能说明哪些信息。'),
('LoongBuy 新手指南：规划第一次购买','了解常用术语、准备商品清单，并在下单前分别考虑商品费用和运费。'),
('LoongBuy 运费：如何理解和比较报价','分别核对商品价格、国内运费、国际运费、计费重量及可选服务。'),
('LoongBuy 哪条线路最快或最便宜？比较取舍的方法','按当前可用线路、总价、时效说明及服务条款进行比较。'),
('LoongBuy 国际运输：美国、英国、欧盟、加拿大与澳大利亚核对清单','根据实际目的地准备运输问题，不使用未经验证的时效和费用承诺。'),
('LoongBuy 仓库与物流追踪：看清订单所处环节','区分卖家发货、仓库入库、包裹准备和国际物流状态。'),
('LoongBuy 质检清单：发货前应该核对什么？','核对商品身份、数量、尺码、颜色和可见状态，针对不清楚的细节提出具体问题。'),
('LoongBuy 退货、退款与仓储：尽早核对的问题','了解订单阶段、申请条件、存储日期及需要保留的资料。'),
('LoongBuy 与其他代购平台：用同一商品和包裹进行比较','按相同商品、款式、目的地与报价日期比较 LoongBuy、Sugargoo、Joyagoo、Hipobuy 和 Mulebuy。'),
('LoongBuy 好物目录：按分类、价格和商品 ID 查找','结合商品目录、分类、价格排序和以图搜索，建立自己的候选清单。')]
articles=json.loads((r/'src/articles.json').read_text())
for a,(title,desc) in zip(articles,article_rows):
 d[a['title']]=title;d[a['title']+' | LoongBuy Findsheet']=title+' | LoongBuy Findsheet';d[a['description']]=desc
starts={
'Start in the spreadsheet.':'从商品表开始，可以按分类浏览，也可以输入商品名称或微店商品 ID。教程示例使用 7872202082，点击搜索结果进入商品详情。',
'Review the listing images and product ID,':'核对展示图片与商品 ID，再点击“前往 LoongBuy 购买”。按钮会把原始微店链接传给官方平台。如需比较其他代购平台，可点击详情页的“其他代购平台”。',
'Confirm the current product information on LoongBuy.':'在 LoongBuy 核对当前商品信息，选择需要的款式、颜色、尺码和数量。示例链接包含多种服装款式，因此应核对所选图片和规格，不能把每个选项都当成同一件卫衣。',
'If you are not signed in,':'如未登录，请使用官方登录页。已有账户可选择当前提供的登录方式，新用户可使用注册入口。账户步骤请在 LoongBuy 完成，必要时返回商品页重新核对选项。',
'Follow the official checkout,':'在官方结算页核对商品、款式和数量，查看所有已列费用，再决定是否付款。购买商品与之后的国际包裹运输是两个不同阶段。',
'Use your order and warehouse information to follow progress':'在订单和仓库信息中查看进度及对应商品的照片，核对所选商品、数量、尺码、颜色和可见状态。重要细节不清楚时，请提出具体问题。',
'The official process continues through warehouse parcel preparation,':'官方后续流程包括在仓库准备包裹、填写收件信息和获取可用运费报价。请核对商品内容、包装条件及实际包裹的线路，阅读当前条款后再支付国际运费。',
'Use the parcel record and tracking entry for the shipment':'使用已提交包裹的记录与物流入口查询状态，保存对应订单号和包裹号，记录最新进度。需要澄清问题时，请向官方客服提供正确编号。',
'Follow the actual path from this website to LoongBuy.':'按实际路径，从本站查找商品并进入 LoongBuy。前半段使用当前公开页面截图，后续私人账户步骤使用明确标注来源的官方教程示例。',
'Have your intended product variant ready.':'先确定需要的商品款式。本站价格和标题来自历史数据，请在购买前到 LoongBuy 确认当前商品、规格及总额。',
'The first four illustrated steps use current public pages.':'前四步配图来自当前公开页面。后续订单确认、仓库、运费和追踪图片来自官方公开教程，界面为旧版，均已注明示例来源。',
'This tutorial did not create an order or execute a payment.':'本教程没有实际创建订单或执行付款。结算图片来自官方公开教程，不是本站产生的付款记录。',
'This image is the official public tutorial':'这张图是官方公开教程中的仓库示例，不是本站下单产生的记录。旧版界面可能与你当前账户不同。',
'It is an independent product-discovery catalog':'这是一个独立商品发现目录，用于浏览商品并通过 LoongBuy 打开原始链接。结算与订单管理在代购平台进行。'
}
for key in list(d):
 for prefix,value in starts.items():
  if key.startswith(prefix):d[key]=value

for upper,title in [('GETTING STARTED','Getting Started'),('QC & WAREHOUSE','QC & Warehouse'),('SHIPPING','Shipping'),('DISCOVERY','Discovery'),('COMPARISONS','Comparisons'),('SPREADSHEET','Spreadsheet'),('IMAGE SEARCH','Image Search')]:d[upper]=d[title]
for k,v in list(d.items()):
 if 'haul' in k.lower():v=v.replace('毛巾','集运购物')
 if 'shipping' in k.lower():v=v.replace('航行','运输')
 if 'quote' in k.lower() or 'quotation' in k.lower():v=v.replace('引用','报价')
 d[k]=v.replace('体重','重量').replace('<unk>','').replace('⁇','').strip()
p.write_text(json.dumps(d,ensure_ascii=False,indent=2));print('Reviewed Chinese FAQ, article titles, purchase walkthrough and terminology.')
