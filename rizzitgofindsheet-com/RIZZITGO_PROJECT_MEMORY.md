# RizzitGo FindSheet 项目记忆

## 2026-11-26 · 第一批

- 仅开发 RizzitGo。首选独立域名 `rizzitgofindsheet.com`，目录 `rizzitgofindsheet-com`。备用 `rizzitgosheetlab.com`。Verisign .com RDAP 对二者返回 HTTP 404。注册时应核实报价及可注册状态。
- `rizzitgofinds.com` 已有内容并已注册。与 `rizzitgo.com` 官方购买网站保持清晰区分。
- 搜索结果调研见 [rizzitgo-spreadsheets.com](https://rizzitgo-spreadsheets.com/) 的目录、商品分类、价格与 QC，以及 [rizzitgo-spreadsheet.net](https://rizzitgo-spreadsheet.net/about/) 的选购、QC、物流主题。搜索词按已观察到的搜索意图规划，搜索量及排名尚未验证。
- 首页主词 `rizzitgo spreadsheet`，标题包含 `RizzitGo Spreadsheet`。目录承接 `rizzitgo finds` 和分类长尾词，图搜页承接 `rizzitgo image search`，QC 页承接 `rizzitgo qc photos`，指南承接 `how to buy on rizzitgo` 和 `rizzitgo shipping`，FAQ 解答 Weidian ID 和代理购买问题。
- 官方注册 `https://rizzitgo.com/?rno=129A77`。Weidian 购买 `https://rizzitgo.com/detail-page/?goodsId={productId}&source=3`。校验样本 `7872190238`。官方分享 Logo `https://cdn.rizzitgoo.com/commons/logo.png`，页面声明的 favicon `https://rizzitgo.com/favicon.png`，主题色 `#CEFA05`。
- Astro 7.4.13 SSG，按 npm latest 核实。Cloudflare Pages 使用 Node 24、`npm run build`、`dist`，实时 QC 和卖家图通过 Pages 的高级模式 Worker 读取 Findspreadsheet。商品目录及图搜沿用现有 Findspreadsheet 子站同批快照和索引，保留索引与目录顺序配对。正文默认英文。

## 数据与发布约定

- 快照归档包含 8,086 个 Weidian 商品、11 个分类和 37,359 张图片索引，每件商品都有图片索引。目录和图搜索引引用了 `new-2` 中当前 Findspreadsheet 下游构建的同一组 Git 对象。搜索结果出现在子站，排序使用主站目录中的时间、浏览量、美元参考价字段。当前批次目录为快照，实时变动需重新导出并构建；卖家详情图和 QC 使用实时主站接口。
- 商品详情把卖家相册与仓库 QC 分开。无 QC、待处理、上游请求失败分别显示。照片搜索在浏览器内匹配，查询图片不上传。
- 页眉使用从官网可见页眉提取的 236×66 原始 Logo，分享元数据使用官网社交 Logo，favicon 使用官方原文件。
- 暂用 Cloudflare Pages 域名作为 canonical 和 Sitemap 基址。正式域名注册并绑定后，在 Pages 中把 `SITE_URL` 设为正式域名并重新构建。
- 使用专用 `rizzitgo-pages` 分支发布首版，防止触发共享仓库其他子站的生产部署。

## 验收记录

- Astro 构建本地通过。共生成 8,104 个输出页面或端点。Sitemap 含 8,103 个可索引 URL。逐一核对了 8,086 个详情路由与购买 URL。
- Node 自动验证商品 ID 唯一、所有快照商品的视觉索引位置有效、分类完整、关键词及编号搜索、四种排序与 API 参数验证。
- Chromium 测试通过 390 px 移动端七个页面、FAQ 展开、404、关键词和 ID 搜索、分类筛选、价格排序、分页、无结果状态、详情相册及注册和购买链接。
- 使用主站商品 `7872190238` 图片，视觉搜索在前 3 条返回该商品。测试了清除图片和损坏图片的反馈。实时 QC 样本 `7321418559` 返回 12 张照片，`7872190238` 目前无 QC。验证 QC 失败后手动重试。
- RizzitGo 注册页和样本购买页返回 HTTP 200。真实交易与登录后付款流程未执行。
