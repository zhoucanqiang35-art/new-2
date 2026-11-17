# LoveGoBuy 项目记忆

更新：2026-11-17（北京时间）。

- 用户已购买 lovegobuyfindsheet.com。本轮交付独立公开预览，正式域名绑定属于后续上线。
- 新注册推广入口：https://www.lovegobuy.com/?invite_code=HR595U
- Weidian 购买模板保留 https://www.lovegobuy.com/product?id={productId}&shop_type=weidian&invite_code=161CPG 。示例 7858402075。
- 官网标识来自 https://www.lovegobuy.com/img/logo8.png 与 https://www.lovegobuy.com/favicon.ico 。
- Astro 7.4.12 SSG。站内页面已有独立推荐站标识、SEO 首页、分类、搜索、排序及分页、图片相似搜索、商品图库和 QC Finder。
- 目录来自 new-2 中的 FindSpreadsheet 导出，去重后共 8,087 个可构造购买链接的 Weidian 商品。35,743 条图像特征来自同一仓库的公开快照。搜图在浏览器中做近似匹配，排序基于快照。
- QC 查询使用仓库所存主站查询状态以及再次从主站 QC 公开接口实测取得的 5 个商品、20 张仓库照片。状态区分有图、暂无图、待处理和无快照记录。图库与仓库实拍分开。
- 预览设 noindex 和 robots Disallow。正式上线前仍需取得主站实时目录、搜索、搜图和 QC 接入，并确认价格及排序契约和正式域名部署。
- 预览地址：https://lovegobuy-finds-preview.zhoucanqiang35.chatgpt.site/
- GitHub 预览源代码目标：zhoucanqiang35-art/new-2 的 lovegobuy-preview 分支，目录 lovegobuyfindsheet-com。
