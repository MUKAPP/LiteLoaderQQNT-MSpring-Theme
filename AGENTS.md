# AGENTS.md

本文件用于说明本仓库在使用自动化代理/AI 助手（例如 Copilot、ChatGPT、Claude、Continue 等）协作开发时的约定与边界，便于贡献者与自动化工具遵循一致的工作流。

## 仓库概览

- 项目：MSpring Theme
- 类型：LiteLoaderQQNT / QwQNT 主题（theme）
- 打包：通过 `npm run build` 生成 `mspring-theme.zip`，并发布到 GitHub Release

## 目录结构（简述）

- `src/`：主题样式与相关静态资源（`style.scss` 源码、`style.min.css` 构建产物等）
- `renderer/`、`preload/`、`main/`：注入脚本
- `res/`：图标与 README 截图等资源
- `manifest.json`：LiteLoaderQQNT 插件清单
- `package.json`：构建脚本与 QwQNT 元信息（含 `qwqnt.dependencies`）
- `pack.js`：打包脚本（输出 `mspring-theme.zip`）

## 版本与发布

### 版本号规则

- 发布前需要同步更新：
  - `package.json` 的 `version`
  - `manifest.json` 的 `version`
- Tag 规则：`vX.Y.Z`（例如 `v2.0.1`）

### 发布流程（人工或自动化工具执行）

1. 确认工作区干净（`git status`）
2. 更新版本号并提交
3. 构建与打包：
   - 推荐：`npm run build`（包含清理旧产物、重新构建 CSS、执行打包）
4. 创建 tag 并推送
5. 创建 GitHub Release 并上传 `mspring-theme.zip`

> 注意：Release 资产文件名固定为 `mspring-theme.zip`（见 `manifest.json` 的 `repository.release.file`）。

## 依赖与兼容性

- QwQNT 侧依赖在 `package.json -> qwqnt.dependencies` 中维护。
- 如需迁移依赖或更改最低版本要求，请同时更新 README 的安装/前置信息。

## 代码与样式约定

### 样式

- 样式源文件：`src/style.scss`
- 构建产物：`src/style.min.css`（由构建脚本生成；不建议手工编辑）

### 注释与文案

- 除非特殊要求，仓库内注释与字符串建议使用中文，保持与现有风格一致。

## 自动化代理工作约定

### 可以做的事

- 按 issue/PR 描述修改代码、样式、文档
- 运行 `npm run build` 验证打包
- 更新版本号、补充 changelog/release notes（按维护者要求）

### 不应该做的事

- 不要提交隐私/敏感信息（token、cookie、个人账号数据）
- 不要引入未说明用途的大型依赖
- 不要在没有说明的情况下大范围重构/格式化（避免产生噪音 diff）

### 提交信息（建议）

- `feat:` 新功能
- `fix:` 修复问题
- `docs:` 文档
- `chore:` 杂项（依赖、脚本、版本号等）
- `refactor:` 重构

## 联系与反馈

- 作者：MUKAPP
- 问题反馈：优先使用 GitHub Issues
