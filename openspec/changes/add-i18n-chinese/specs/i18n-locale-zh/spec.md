## ADDED Requirements

### Requirement: Chinese locale file completeness
The system SHALL provide `ui/src/locales/zh.json` containing Chinese (Simplified) translations for every key in `ui/src/locales/en.json`.

#### Scenario: All English keys have Chinese translations
- **WHEN** both locale files are compared
- **THEN** every key in en.json has a corresponding key in zh.json with non-empty Chinese text

### Requirement: Translation coverage categories
The Chinese locale file SHALL cover the following categories of user-facing text:
- Sidebar navigation labels
- Page titles and headings
- Button and action labels (Save, Cancel, Delete, Create, etc.)
- Form placeholder text
- Empty state messages
- Status labels (issue statuses, agent statuses, run statuses, etc.)
- Toast notification messages (titles and bodies)
- Dialog titles and descriptions
- Tooltip and aria-label accessibility text
- Shared constant labels (agent roles, membership roles)

#### Scenario: Sidebar renders in Chinese
- **WHEN** UI language is set to Chinese
- **THEN** sidebar items show: "新建任务", "仪表盘", "收件箱", "工作" section, "公司" section, and all navigation labels in Chinese

#### Scenario: Issue statuses render in Chinese
- **WHEN** UI language is Chinese and issues are displayed on a Kanban board or list
- **THEN** status columns show: "待办", "待处理", "进行中", "审核中", "已完成", "已阻塞", "已取消"

#### Scenario: Toast messages render in Chinese
- **WHEN** UI language is Chinese and an action triggers a toast notification
- **THEN** toast title and body text display in Chinese

### Requirement: Translation quality
Chinese translations SHALL use standard Simplified Chinese (简体中文) that is natural and contextually appropriate for a business/project management tool. Technical terms (e.g., "API", "URL", "Token") MAY remain in English where that is standard Chinese tech industry practice.

#### Scenario: Technical terms handled appropriately
- **WHEN** a translation involves a standard technical term like "API key" or "Webhook URL"
- **THEN** the technical term is kept in English or transliterated per common Chinese developer convention
