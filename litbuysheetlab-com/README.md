# Litbuy Sheet Lab

Astro 静态网站，包含源码和已构建的 `dist/`。

## 部署

- 项目根目录：`litbuysheetlab-com`
- 安装：`npm ci`
- 构建：`npm run build`
- 输出目录：`dist`
- 无需构建时，也可直接将 `dist/` 交给静态托管服务。
- 页面资源使用根路径，请将此目录作为独立站点部署；仓库上传本身不会绑定域名。

## 本地检查

```sh
npm ci
npm run build
npm test
npm run preview:check
npm run preview
```

预览地址：http://localhost:4321 。

## 内容状态

包含 8,911 条商品记录和 24 种语言选项，部分商品标题和页面文案仍缺少译文，缺项回退原文。商品数据为历史快照，价格和库存以购买平台为准。部分外部商品图片可能失效；QC 图片的来源尚需进一步核实。当前页面保留 `noindex,nofollow`，正式开放搜索引擎收录前请检查 SEO 设置。

翻译维护需要 Python 3：`npm run i18n:audit` 可检查缺项。翻译脚本遇到服务限流会停止并保留已完成内容，审计和运行记录保存在本地忽略的 `reports/` 目录。
