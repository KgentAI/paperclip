## Context

Paperclip UI 是一个 React 19 + Vite + TypeScript 应用（`ui/src/`），约 245 个 TSX 文件、57 个页面、129 个组件。所有用户可见文本均为硬编码英文字符串，无任何 i18n 基础设施。

`packages/shared/src/constants.ts` 中有 2 组标签常量（`AGENT_ROLE_LABELS`、`HUMAN_COMPANY_MEMBERSHIP_ROLE_LABELS`）直接使用英文。

`ui/src/components/StatusIcon.tsx`、`KanbanBoard.tsx` 等多处存在重复的 `statusLabel()` 函数，通过字符串操作（`replace(/_/g, " ")` + `toUpperCase()`）将枚举值转为显示文本。

用户偏好：默认自动检测浏览器语言，用户可在设置中手动覆盖。

## Goals / Non-Goals

**Goals:**
- 搭建 react-i18next 基础设施，支持中英文切换
- 提取 ui/src/ 中所有硬编码英文字符串到 locale JSON 文件
- 将 packages/shared 中的标签常量纳入 i18n 体系
- 浏览器语言自动检测 + localStorage 持久化用户选择
- 在 ProfileSettings 提供语言切换 UI

**Non-Goals:**
- 服务端错误消息翻译（保持英文）
- 日期/数字/货币格式本地化
- 活动日志描述翻译
- RTL 布局支持
- 支持中文以外的第三种语言（架构上预留但不实现）
- 动态语言包加载（初始版本内联两个语言包）

## Decisions

### D1: i18n 库选择 — react-i18next

**选择**: react-i18next + i18next + i18next-browser-languagedetector

**替代方案**:
- react-intl (FormatJS): ICU Message Format 更标准，但 API 更重，对现有代码侵入性更大
- 自建轻量方案: 零依赖但缺少复数处理、命名空间、懒加载等能力，后续扩展到 Level 2+ 时需要迁移
- @lingui/react: 编译时提取 key，但社区较小

**理由**: react-i18next 是 React 生态最成熟的 i18n 方案，社区支持最好，`useTranslation` hook 与现有函数组件模式完美匹配，后续扩展成本最低。

### D2: 语言包结构 — 单文件 flat JSON

**选择**: `ui/src/locales/en.json` 和 `ui/src/locales/zh.json`，使用 flat key 结构。

```
locales/
├── en.json    # ~800 keys
└── zh.json    # ~800 keys
```

**替代方案**:
- 按模块拆分多文件（`en/sidebar.json`、`en/issues.json`）: 更好的可维护性，但 ~800 条规模下单文件完全可管理
- i18next 命名空间（namespace）: 增加配置复杂度，当前规模不需要

**Key 命名规范**: `模块.类别.具体` — 如 `sidebar.nav.dashboard`、`issues.status.inProgress`、`common.action.save`

**理由**: 800 条 key 的单文件在编辑器中可管理，且避免了命名空间配置的额外复杂度。如果后续 key 数量超过 2000，可按模块拆分。

### D3: 语言检测策略 — 浏览器检测 + 用户覆盖

**选择**: `i18next-browser-languagedetector`，检测顺序：
1. `localStorage` key `paperclip-ui-language`（用户手动选择）
2. `navigator.language`（浏览器设置）
3. 回退到 `en`

**实现**: 在 ProfileSettings 添加 `<Select>` 下拉，选项为 "English" / "中文"，onChange 时调用 `i18n.changeLanguage()` 并写入 localStorage。

### D4: 共享常量标签处理

**选择**: `packages/shared/src/constants.ts` 中的标签值改为 i18n key，UI 层在使用时通过 `t()` 转换。

```typescript
// Before
export const AGENT_ROLE_LABELS: Record<AgentRole, string> = {
  ceo: "CEO", engineer: "Engineer", ...
};

// After — 保留英文默认值，UI 层通过 t() 覆盖
// constants.ts 不依赖 i18next（shared 包不引入 UI 依赖）
// UI 层建立映射：t(`agents.role.${role}`, { defaultValue: AGENT_ROLE_LABELS[role] })
```

**理由**: `packages/shared` 不应引入 UI 依赖（react-i18next）。保留英文默认值确保 shared 包独立可用，UI 层通过 `t()` + `defaultValue` 模式实现翻译。

### D5: statusLabel 函数统一

**选择**: 创建 `ui/src/lib/i18n-status.ts`，统一所有状态标签的翻译逻辑。

```typescript
// ui/src/lib/i18n-status.ts
import { useTranslation } from "react-i18next";

const STATUS_KEY_MAP: Record<string, string> = {
  backlog: "issues.status.backlog",
  todo: "issues.status.todo",
  in_progress: "issues.status.inProgress",
  // ...
};

export function useStatusLabel(status: string): string {
  const { t } = useTranslation();
  return t(STATUS_KEY_MAP[status] ?? status, {
    defaultValue: status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
  });
}
```

**理由**: 消除 3 处重复的 `statusLabel()` 函数，集中管理状态→翻译 key 的映射。

### D6: 初始化位置

**选择**: `ui/src/i18n.ts` 导出初始化函数，`ui/src/main.tsx` 在 React root render 之前调用。

```typescript
// ui/src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import zh from "./locales/zh.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, zh: { translation: zh } },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "paperclip-ui-language",
      caches: ["localStorage"],
    },
  });

export default i18n;
```

## Risks / Trade-offs

- **[Bundle 增大]** react-i18next ~15KB gzip + 两个语言包各 ~10-15KB → 对于管理面板场景可接受。后续可改为懒加载语言包。
- **[提取遗漏]** 800 条字符串分布在 100+ 文件中，手工提取可能遗漏 → 实现后通过 ESLint 插件 `i18next/no-literal-string` 检测遗漏。
- **[中文翻译质量]** 机器翻译 + 人工审校 → 先用 AI 辅助翻译，后续由中文母语者审校。
- **[运行时依赖]** react-i18next 是运行时依赖 → 已是 React 生态标准实践，风险低。
- **[shared 包不引入 i18n]** shared 中的标签保持英文，翻译在 UI 层完成 → 确保shared 包可在非 UI 场景（如 CLI）独立使用。
