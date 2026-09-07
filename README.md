# 山月集 · 个人博客

一个纯静态（HTML / CSS / JavaScript）个人博客，可免费部署到 **GitHub Pages**。

## 项目结构

```
.
├── index.html          # 首页（最新文章列表）
├── about.html          # 关于页
├── 404.html            # 自定义 404 页面
├── style.css           # 全局样式（含浅色/深色主题）
├── script.js           # 深色模式切换脚本
├── .nojekyll           # 让 GitHub Pages 以纯静态方式托管（不启用 Jekyll）
└── articles/           # 文章目录
    ├── first-post.html
    ├── build-blog.html
    └── reading-notes.html
```

所有内部链接均使用**相对路径**，因此无论部署在仓库根目录、`/docs`，还是子路径下都能正常工作。

---

## 🚀 部署到 GitHub Pages（三步）

### 第一步：创建 GitHub 仓库

1. 注册并登录 [github.com](https://github.com)
2. 点击右上角 **+ → New repository**
3. 填写仓库名（例如 `my-blog`），选择 **Public**
4. 点击 **Create repository**

### 第二步：上传博客文件

仓库创建后，把 `blog/` 里的**所有内容**（不是 `blog` 文件夹本身，是它内部的文件）上传到仓库根目录。

**方式 A — 网页上传（最简单，无需安装 Git）：**
1. 进入仓库，点击 **Add file → Upload files**
2. 把 `index.html`、`style.css`、`script.js`、`404.html`、`.nojekyll`、`README.md` 和 `articles/` 文件夹拖进去
3. 点击 **Commit changes**

**方式 B — 命令行上传（需要安装 Git）：**
```bash
cd 博客所在目录          # 即存放 index.html 的目录
git init
git add .
git commit -m "init blog"
git branch -M main
git remote add origin https://github.com/你的用户名/my-blog.git
git push -u origin main
```

### 第三步：开启 GitHub Pages

1. 回到仓库页面，进入 **Settings**
2. 左侧菜单选择 **Pages**
3. **Source（Build and deployment）** 选择 **Deploy from a branch**
4. **Branch** 选择 `main`，文件夹选择 `/ (root)`
5. 点击 **Save**

等待 1–2 分钟后，你的博客就上线了：

```
https://你的用户名.github.io/my-blog/
```

之后每次 `git push` 到 `main` 分支，GitHub Pages 都会自动重新构建发布。

---

## ✨ 可选增强

- **绑定自定义域名**：购买域名后，在仓库 Settings → Pages 的 **Custom domain** 填入域名，并把 `.nojekyll` 同目录下的 `CNAME` 文件内容改为你的域名。同时在域名服务商处添加一条 CNAME 记录指向 `你的用户名.github.io`。
- **备用部署位置**：也可以把文件放到仓库里的 `docs/` 文件夹，然后在 Pages 设置里选择分支 + 文件夹 `/docs`。
- **多篇文章组织**：直接在 `articles/` 里复制一份现有文章，改标题和内容，再在 `index.html` 首页手动画卡新增条目即可。

---

© 2025 山月集 · 用文字对抗遗忘
