# 参与共建「心屿」

感谢你愿意让这片岛屿更稳妥一点。

## 开始之前

1. 阅读 [README](README.md) 与关于页的伦理底线：不诊断、不替代专业诊疗、危机优先。
2. 热线与就医信息务必以官方实时公布为准；不确定就不要改。
3. 本地开发：

```bash
npm install
npm start
npm run check
```

## 可以怎么帮忙

- 纠错：错别字、失效链接、过时热线
- 补充本地求助资源（需可核验来源）
- 改善无障碍与文案语气（温和、不评判）
- 完善工具练习步骤（需注明循证来源）

## 提交流程

1. Fork / 建分支
2. 改 `src/` 或 `public/`，不要只手改根目录 HTML（那是构建产物）
3. `npm run build && npm run check`
4. 提交说明用简体中文，例如：`fix: 更新珠海热线核验日期`
5. 开 PR，说明改了什么、如何自测

## 热线变更清单

更新热线时请同步：

- `src/pages/resources.njk` 正文与核验日期
- `public/data/hotlines.json` 的 `verifiedAt` 与条目
- `public/sitemap.xml` 的 `lastmod`（如有）
- 如涉及离线缓存，递增 `public/sw.js` 的 `CACHE` 版本

## 行为约定

- 不添加追踪 / 广告 / 需要后端的用户数据采集
- 不提供书籍全文或侵权内容
- 讨论时保持对求助者的尊重与克制
