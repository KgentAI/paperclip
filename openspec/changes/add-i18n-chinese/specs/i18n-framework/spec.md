## ADDED Requirements

### Requirement: i18n configuration module
The system SHALL provide an i18n configuration module at `ui/src/i18n.ts` that initializes react-i18next with `i18next-browser-languagedetector` before the React app renders in `ui/src/main.tsx`.

#### Scenario: App starts with i18n initialized
- **WHEN** the Paperclip UI application starts
- **THEN** i18next is initialized with English as fallback language and `i18next-browser-languagedetector` configured before React renders

#### Scenario: i18n initialized with correct detection order
- **WHEN** i18n initializes
- **THEN** language detection order SHALL be: `localStorage` (key `paperclip-ui-language`) first, then `navigator.language`, then fallback to `en`

### Requirement: Locale file structure
The system SHALL maintain locale files at `ui/src/locales/en.json` and `ui/src/locales/zh.json` using flat nested JSON with dot-path key naming convention (e.g., `sidebar.nav.dashboard`, `common.action.save`).

#### Scenario: English locale file exists with all keys
- **WHEN** the English locale file is loaded
- **THEN** it contains translation keys for all user-facing strings in the UI

#### Scenario: Key naming follows convention
- **WHEN** a new translation key is added
- **THEN** the key follows the pattern `{module}.{category}.{specificName}` using camelCase for the specific name

### Requirement: TypeScript type safety for translation keys
The system SHALL provide TypeScript type declarations for translation keys so that `t()` calls get autocomplete and compile-time validation for key names.

#### Scenario: Invalid translation key is caught at compile time
- **WHEN** a developer calls `t("sidebar.nav.nonexistent")` with a key not present in en.json
- **THEN** TypeScript reports a type error

### Requirement: Unified status label mapping
The system SHALL replace all duplicate `statusLabel()` functions across the codebase with a single i18n-aware utility that maps status enum values to translated labels via `t()` with `defaultValue` fallback.

#### Scenario: Status label renders translated text
- **WHEN** a status value like `"in_progress"` is rendered
- **THEN** the displayed text is the translated label (e.g., "In Progress" in English, "进行中" in Chinese)

#### Scenario: Unknown status falls back gracefully
- **WHEN** an unrecognized status value is passed
- **THEN** the system displays the raw status with underscore-to-space + title-case transformation as fallback

### Requirement: Shared constants labels i18n bridge
The system SHALL keep `packages/shared/src/constants.ts` free of i18next dependencies. UI components using `AGENT_ROLE_LABELS` and `HUMAN_COMPANY_MEMBERSHIP_ROLE_LABELS` SHALL translate them via `t()` with `defaultValue` set to the constant value.

#### Scenario: Agent role label shows in Chinese
- **WHEN** the UI language is Chinese and an agent with role "engineer" is displayed
- **THEN** the role label shows "工程师" instead of "Engineer"

#### Scenario: Shared package used without i18n
- **WHEN** `packages/shared` is imported in a non-UI context (e.g., server)
- **THEN** `AGENT_ROLE_LABELS` still returns English strings without requiring i18next
