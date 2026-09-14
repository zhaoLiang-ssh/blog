# 心屿 · 心理自助工具箱

一个纯静态（HTML / CSS / JavaScript）的公益心理自助信息站，可免费部署到 **GitHub Pages**。

当情绪翻涌、心里不好受的时候，这里提供几个“当下就能做”的自助工具，并强调：本内容不构成医疗建议、不能替代专业诊疗，遇到危机请第一时间拨打求助热线。

## 开发与构建

本站使用 [Eleventy (11ty)](https://www.11ty.dev/) 做页面壳层拼装：改导航 / 危机条 / 页脚只需改一处。

```bash
npm install
npm start          # 本地预览 http://localhost:8080
npm run build      # 构建到 _site/，并同步回仓库根目录（兼容 Pages 根目录部署）
npm run check      # 构建 + 相对链接 / sitemap 校验
```

| 路径 | 说明 |
|------|------|
| `src/pages/` | 各页正文（Nunjucks） |
| `src/_layouts/`、`src/_includes/` | 布局与公共片段 |
| `src/_includes/page-scripts/` | 页内脚本 |
| `public/` | 静态资源（CSS/JS/SW/图标/热线 JSON…） |
| 仓库根目录 `*.html` 等 | **构建产物**（供 GitHub Pages 直接发布） |

日常改内容：编辑 `src/` 或 `public/` → `npm run build` → 提交。

## 项目结构（构建后根目录仍可直接浏览）

```
.
├── src/                # 源码（优先改这里）
├── public/             # 静态资源源
├── scripts/            # 迁移 / 校验 / 同步脚本
├── .github/workflows/  # CI（npm run check）
├── index.html …        # 构建产物页面
├── style.css / script.js / sw.js
├── data/hotlines.json  # 热线核验数据（含 verifiedAt）
└── assets/             # og 图、PWA 图标、工具图标 SVG
```

所有内部链接均使用**相对路径**，因此无论部署在仓库根目录还是子路径下都能正常工作。

## 站点功能特性

- **主题切换（8 套）**：三态外观模式 × 四种安抚色调，`localStorage` 记忆，首屏无闪烁。
- **站内搜索**：首页实时过滤；命中危机关键词时优先展示求助入口。
- **离线可用（PWA）**：Service Worker 缓存（发版请递增 `public/sw.js` 的 `CACHE`）。
- **无障碍**：skip-link、危机条、键盘焦点、面包屑、打印样式。
- **SEO / 分享**：canonical、OG、Twitter Card、sitemap、robots。

## 部署到 GitHub Pages

1. `npm run build`
2. 把构建后的根目录文件推到仓库（当前仍支持 **Settings → Pages → Deploy from a branch → `/ (root)`**）
3. CI（`.github/workflows/ci.yml`）会在 push / PR 时跑 `npm run check`

之后每次改源码并 `npm run build` 后 `git push`，Pages 会重新发布。

## 内容维护与更新

- **新增工具页**：在 `src/pages/` 复制一页，改 front matter 与正文；在 `src/pages/index.njk` 加卡片；如需图标，放 `public/assets/icons/*.svg` 并用 `{% icon "name" %}`。
- **热线信息**：核实后更新 `src/pages/resources.njk` 的核验日期与 `public/data/hotlines.json`。
- **发版注意**：关键文案或缓存策略变更时，递增 `public/sw.js` 的 `CACHE`，并更新 `public/sitemap.xml` 的 `lastmod`。

许可与贡献见 [LICENSE.md](LICENSE.md)、[CONTRIBUTING.md](CONTRIBUTING.md)。

## 免责声明

本站所有内容均为一般性的心理教育与自助材料，**不构成医疗建议，不用于诊断、治疗或预防任何疾病**，也不能替代执业医师、心理治疗师或精神科医生的专业判断。遇到紧急危机时，请第一时间拨打求助热线或前往急诊。
