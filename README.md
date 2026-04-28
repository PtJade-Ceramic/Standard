---
layout: titled
title: Standard README
---

# 标准使用规范
本仓库提供了使用标准的规范。

# 本地依赖管理与自动化说明

## 安装依赖

推荐使用如下命令一键安装所有依赖（与 CI/CD 保持一致）：

```powershell
npm ci
```
或
```powershell
npm install
```



## 自动升级依赖版本

如需一键升级所有依赖到最新版，可使用：

```powershell
npx npm-check-updates -u
npm install
```
（需先安装 npm-check-updates，或用 npx 直接运行）

## 依赖声明规范

- 所有依赖必须写入 package.json，严禁手动修改 node_modules。
- 推荐使用 npm ci 保证本地与 CI/CD 环境一致。
- 如需补包或升级，务必同步 package-lock.json。
## 开发者注意事项
本仓库采用 [GitHub Flavored Markdown](https://docs.github.com/zh/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github)。

本仓库中的 Markdown 文件使用 [Visual Studio Code](https://code.visualstudio.com/docs/languages/markdown) 编辑。

为了在 Visual Studio Code 中[预览][预览][脚注](https://docs.github.com/zh/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#footnotes)，调试人员宜安装 [GitHub Markdown Preview](https://marketplace.visualstudio.com/items?itemName=bierner.github-markdown-preview)。

特别地，为了[预览][预览][重要提示](https://docs.github.com/zh/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)，调试人员[宜](https://github.com/mjbvz/vscode-github-markdown-preview/issues/23#issuecomment-1781285505)安装 [Markdown Preview for Github Alerts](https://marketplace.visualstudio.com/items?itemName=yahyabatulu.vscode-markdown-alert)。

## 发布说明
本仓库使用 GitHub Actions 构建并发布静态页面，而不依赖 GitHub Pages 默认 Jekyll 渲染。

Actions 工作流将使用 Node.js 构建 Markdown，再发布 `dist` 目录内容到 Pages。

依赖自动更新由 Dependabot 管理：
- npm 依赖每周检查一次；
- GitHub Actions 依赖每周检查一次。

[预览]: https://code.visualstudio.com/docs/languages/markdown#_extending-the-markdown-preview