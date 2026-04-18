## Why

Paperclip UI 目前所有用户可见文本（导航标签、按钮、状态、占位符、空状态提示等 ~800 条字符串）都是硬编码英文。中文用户群体使用门槛高。添加 i18n 基础设施和中文翻译，使 UI 可在中英文之间切换，降低非英语用户的使用障碍。

## What Changes

- 引入 `react-i18next` + `i18next` 作为 i18n 框架
- 创建 `ui/src/locales/en.json` 和 `ui/src/locales/zh.json` 语言包（单文件，~800 条 key）
- 建立 i18n 配置模块（`ui/src/i18n.ts`）：浏览器语言自动检测（默认）+ localStorage 持久化用户偏好覆盖
- 在 `ui/src/main.tsx` 初始化 i18n
- 将 `ui/src/` 和 `packages/shared/src/constants.ts` 中的所有硬编码英文字符串替换为 `t()` 调用
- 在 ProfileSettings 页面添加语言切换下拉菜单
- 重构重复的 `statusLabel()` 函数（3 处重复）为统一的 i18n 映射

### 不在范围内（Level 2+）

- 服务端错误消息的翻译（保持英文错误消息）
- 日期/数字格式化本地化
- 活动日志描述翻译
- 邮件模板翻译
- RTL 布局支持

## Capabilities

### New Capabilities
- `i18n-framework`: i18n 基础设施搭建 — react-i18next 配置、语言包结构、TypeScript 类型安全、浏览器检测 + localStorage 持久化
- `i18n-locale-zh`: 中文翻译语言包 — 所有 UI 面向用户文本的中文翻译
- `i18n-language-switcher`: 语言切换 UI — ProfileSettings 中的语言选择下拉菜单

### Modified Capabilities
<!-- 无已有 spec 需要修改 -->

## Impact

- **依赖**: 新增 `react-i18next` + `i18next` + `i18next-browser-languagedetector` 到 `ui/package.json`
- **UI 文件**: ~100 个组件/页面文件需要将硬编码字符串替换为 `t()` 调用
- **Shared 包**: `packages/shared/src/constants.ts` 中的 `AGENT_ROLE_LABELS` 和 `HUMAN_COMPANY_MEMBERSHIP_ROLE_LABELS` 需要改为 i18n key 映射
- **无 API 变更**: 纯前端变更，不影响 server 层
- **无数据库变更**: 语言偏好存储在 localStorage，不增加数据库字段
- **Bundle 影响**: react-i18next ~15KB gzip，两个语言包各 ~10-15KB（中文 UTF-8）
