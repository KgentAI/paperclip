## 1. 基础设施搭建

- [x] 1.1 安装 i18n 依赖：`i18next`、`react-i18next`、`i18next-browser-languagedetector` 到 `ui/package.json`
- [x] 1.2 创建 `ui/src/i18n.ts` — 初始化 i18next，配置语言检测（localStorage → navigator → fallback en），导入 en/zh JSON 资源
- [x] 1.3 在 `ui/src/main.tsx` 中 import `./i18n`（在 React render 之前执行）
- [x] 1.4 创建 `ui/src/locales/en.json` 初始骨架（common action/label key）
- [x] 1.5 创建 `ui/src/locales/zh.json` 初始骨架（对应中文翻译）
- [x] 1.6 创建 TypeScript 类型声明 — 基于 en.json 生成 `CustomTypeOptions`，确保 `t()` key 有类型检查和自动补全

## 2. 统一状态标签映射

- [x] 2.1 创建 `ui/src/lib/i18n-status.ts` — 统一的 status→i18n key 映射 + `useStatusLabel()` hook
- [x] 2.2 替换 `ui/src/components/StatusIcon.tsx` 中的内联 `statusLabel()` 函数
- [x] 2.3 替换 `ui/src/components/KanbanBoard.tsx` 中的内联 `statusLabel()` 函数
- [x] 2.4 替换 `ui/src/components/IssueChatThread.tsx` 中的 `formatRunStatusLabel()` 函数
- [x] 2.5 替换 `ui/src/components/CommentThread.tsx` 中的 `formatRunStatusLabel()` 函数
- [x] 2.6 替换 `ui/src/components/ActivityCharts.tsx` 中的 `statusLabels` 对象
- [x] 2.7 将所有状态标签的 key 和翻译添加到 en.json 和 zh.json

## 3. 共享常量标签 i18n 桥接

- [x] 3.1 在 en.json / zh.json 中添加 `agents.role.*` 系列翻译 key（CEO/CTO/Engineer 等）
- [x] 3.2 在 en.json / zh.json 中添加 `company.membership.role.*` 系列翻译 key（Owner/Admin/Operator/Viewer）
- [x] 3.3 修改使用 `AGENT_ROLE_LABELS` 的 UI 组件，改用 `t("agents.role.${role}", { defaultValue: AGENT_ROLE_LABELS[role] })` 模式
- [x] 3.4 修改使用 `HUMAN_COMPANY_MEMBERSHIP_ROLE_LABELS` 的 UI 组件，同理改用 `t()` 模式

## 4. 侧边栏与导航文本提取

- [x] 4.1 提取 `ui/src/components/Sidebar.tsx` 中所有导航标签（New Issue, Dashboard, Inbox, Work, Issues, Routines, Goals, Company, Org, Skills, Costs, Activity, Settings）
- [x] 4.2 提取 `ui/src/components/InstanceSidebar.tsx` 中的导航标签
- [x] 4.3 提取 `ui/src/components/MobileBottomNav.tsx` 中的导航标签
- [x] 4.4 提取 `ui/src/components/SidebarAccountMenu.tsx` 中的菜单项文本
- [x] 4.5 提取 `ui/src/components/SidebarCompanyMenu.tsx` 中的菜单项文本

## 5. 页面标题与通用 UI 文本提取

- [x] 5.1 提取 `ui/src/pages/Dashboard.tsx` — 标题、指标标签、空状态文案
- [x] 5.2 提取 `ui/src/pages/Issues.tsx` 和 `ui/src/pages/MyIssues.tsx` — 页面标题、筛选标签
- [x] 5.3 提取 `ui/src/pages/Agents.tsx` 和 `ui/src/pages/AgentDetail.tsx` — 标题、属性标签
- [x] 5.4 提取 `ui/src/pages/Goals.tsx` 和 `ui/src/pages/GoalDetail.tsx` — 标题、表单标签
- [x] 5.5 提取 `ui/src/pages/Projects.tsx` 和 `ui/src/pages/ProjectDetail.tsx`
- [ ] 5.6 提取 `ui/src/pages/Costs.tsx` — 财务相关标签
- [x] 5.7 提取 `ui/src/pages/Activity.tsx` — 活动日志标签
- [x] 5.8 提取 `ui/src/pages/Approvals.tsx` 和 `ui/src/pages/ApprovalDetail.tsx`
- [x] 5.9 提取 `ui/src/pages/Routines.tsx` 和 `ui/src/pages/RoutineDetail.tsx`
- [x] 5.10 提取 `ui/src/pages/Companies.tsx` 和 `ui/src/pages/CompanySettings.tsx`
- [ ] 5.11 提取 `ui/src/pages/Inbox.tsx` — 筛选标签、占位符
- [x] 5.12 提取 `ui/src/pages/Org.tsx` 和 `ui/src/pages/OrgChart.tsx`
- [x] 5.13 提取 `ui/src/pages/NotFound.tsx` — 404 文案
- [ ] 5.14 提取其余页面（Auth, AdapterManager, PluginManager, DesignGuide 等）的可见文本

## 6. 组件文本提取

- [x] 6.1 提取 `ui/src/components/NewIssueDialog.tsx` — 对话框标题、表单标签、按钮、占位符（~50+ 条字符串）
- [x] 6.2 提取 `ui/src/components/NewAgentDialog.tsx` 和 `ui/src/pages/NewAgent.tsx`
- [x] 6.3 提取 `ui/src/components/IssueProperties.tsx` — 属性标签、搜索占位符
- [x] 6.4 提取 `ui/src/components/IssueFiltersPopover.tsx` — 筛选选项标签
- [x] 6.5 提取 `ui/src/components/IssueRow.tsx` 和 `ui/src/components/IssuesList.tsx`
- [x] 6.6 提取 `ui/src/components/OnboardingWizard.tsx` — 引导步骤文本
- [x] 6.7 提取 `ui/src/components/ToastViewport.tsx` — aria-label
- [x] 6.8 提取 `ui/src/components/FilterBar.tsx` — 筛选标签
- [x] 6.9 提取 `ui/src/components/AgentConfigForm.tsx` 和 `ui/src/components/AgentProperties.tsx`
- [x] 6.10 提取 `ui/src/components/CommandPalette.tsx` — 搜索占位符和命令标签
- [ ] 6.11 提取 `ui/src/components/CommentThread.tsx` — 评论相关文本
- [x] 6.12 提取 `ui/src/components/GoalProperties.tsx` 和 `ui/src/components/GoalTree.tsx`
- [x] 6.13 提取 `ui/src/components/DocumentDiffModal.tsx` — 对话框文本
- [x] 6.14 提取 `ui/src/components/BudgetPolicyCard.tsx` 和 `ui/src/components/BudgetIncidentCard.tsx`
- [x] 6.15 提取 Toast 消息 — 搜索所有 `pushToast()` 调用，提取 title/body 字符串
- [x] 6.16 提取 EmptyState 组件的 message 和 action 属性文本
- [x] 6.17 提取所有 `placeholder="..."` 属性文本（已知 20+ 处）
- [x] 6.18 提取 adapter 配置组件 (`ui/src/adapters/*/config-fields.tsx`) 中的标签和占位符

## 7. 语言切换 UI

- [x] 7.1 在 `ui/src/pages/ProfileSettings.tsx` 添加语言选择下拉菜单（Select 组件）
- [x] 7.2 下拉选项：English / 中文，选中项高亮当前语言
- [x] 7.3 onChange 调用 `i18n.changeLanguage()` 并自动写入 localStorage（由 i18next-browser-languagedetector 处理）

## 8. 验证与收尾

- [x] 8.1 验证 en.json 和 zh.json key 完全对齐（无遗漏、无多余 key）
- [x] 8.2 运行 `pnpm -r typecheck` 确保无类型错误
- [x] 8.3 运行 `pnpm test:run` 确保现有测试通过
- [x] 8.4 运行 `pnpm build` 确保生产构建成功
- [ ] 8.5 手动验证：浏览器语言 zh-CN 时自动显示中文，手动切回 English 正常工作
- [ ] 8.6 手动验证：刷新后语言偏好保持（localStorage 持久化）
